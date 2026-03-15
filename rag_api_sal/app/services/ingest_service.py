import uuid
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http.models import (
    Distance,
    VectorParams,
    Filter,
    FieldCondition,
    MatchValue
)

from app.utils import extract_text_from_file, chunk_text
from app.config import (
    QDRANT_HOST,
    QDRANT_PORT,
    QDRANT_COLLECTION_NAME,
    EMBEDDING_MODEL_NAME,
    MAX_CHUNK_SIZE,
    TEMP_DIR
)
import os
import asyncio
model = SentenceTransformer(EMBEDDING_MODEL_NAME)

qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def create_qdrant_collection():
    collections = qdrant_client.get_collections()
    collection_names = [collection.name for collection in collections.collections]
    if QDRANT_COLLECTION_NAME not in collection_names:
        qdrant_client.create_collection(
            collection_name=QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

async def ingest_files(files: list, datasetId: str):
    if not files or not datasetId:
        raise ValueError("Files and datasetId are required")

    create_qdrant_collection()

    all_vectors = []
    failed_files = []

    for upload_file in files:
        file_name = upload_file.filename
        try:
            file_path = os.path.join(TEMP_DIR, file_name)
            with open(file_path, "wb") as buffer:
                buffer.write(await upload_file.read())

            text = extract_text_from_file(file_path)

            chunks = chunk_text(text, max_chunk_size=MAX_CHUNK_SIZE)

            # Run slow CPU-bound task in a thread pool to avoid blocking the event loop
            loop = asyncio.get_running_loop()
            embeddings = await loop.run_in_executor(None, lambda c=chunks: model.encode(c))

            for chunk, embedding in zip(chunks, embeddings):
                vector_id = str(uuid.uuid4())
                all_vectors.append(
                    {
                        'id': vector_id,
                        'vector': embedding.tolist(),
                        'payload': {
                            'chunk': chunk,
                            'datasetId': datasetId
                        }
                    }
                )

            os.remove(file_path)

        except Exception as e:
            error_message = f"Error processing {file_name}: {e}"
            print(error_message)
            failed_files.append({'file_name': file_name, 'error': str(e)})
            continue

    if all_vectors:
        qdrant_client.upsert(
            collection_name=QDRANT_COLLECTION_NAME,
            wait=True,
            points=all_vectors
        )

    response = {
        "message": "Files successfully ingested and stored in the vector database",
        "ingestedFiles": len(files) - len(failed_files),
        "datasetId": datasetId
    }

    if failed_files:
        response['failedFiles'] = failed_files

    return response

async def delete_dataset(datasetId: str):
    if not datasetId:
        raise ValueError("datasetId is required")

    delete_filter = Filter(
        must=[
            FieldCondition(
                key="datasetId",
                match=MatchValue(value=datasetId)
            )
        ]
    )

    qdrant_client.delete(
        collection_name=QDRANT_COLLECTION_NAME,
        points_selector=delete_filter,
        wait=True
    )

    return {
        "message": f"All data associated with datasetId '{datasetId}' has been deleted."
    }

async def get_dataset_ids():
    response = qdrant_client.scroll(
        collection_name=QDRANT_COLLECTION_NAME,
        scroll_filter=None,
        with_payload=True,
        limit=1000
    )
    dataset_ids = set()
    for point in response[0]:
        dataset_id = point.payload.get("datasetId")
        if dataset_id:
            dataset_ids.add(dataset_id)
    return list(dataset_ids)

async def get_chunks_by_dataset(datasetId: str):
    query_filter = Filter(
        must=[
            FieldCondition(
                key="datasetId",
                match=MatchValue(value=datasetId)
            )
        ]
    )
    all_chunks = []
    scroll_id = None
    while True:
        response = qdrant_client.scroll(
            collection_name=QDRANT_COLLECTION_NAME,
            scroll_filter=query_filter,
            with_payload=True,
            limit=100,
            offset=scroll_id
        )
        points, next_scroll_id = response
        for point in points:
            chunk = point.payload.get("chunk", "")
            all_chunks.append(chunk)
        if not next_scroll_id:
            break
        scroll_id = next_scroll_id
    return all_chunks
