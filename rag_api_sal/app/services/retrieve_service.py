from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from app.config import (
    QDRANT_HOST,
    QDRANT_PORT,
    QDRANT_COLLECTION_NAME,
    EMBEDDING_MODEL_NAME,
)
import asyncio

model = SentenceTransformer(EMBEDDING_MODEL_NAME)

qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

async def retrieve_chunks(prompt: str, datasetId: str):
    if not prompt or not datasetId:
        raise ValueError("Prompt and datasetId are required")

    loop = asyncio.get_running_loop()
    query_vector = await loop.run_in_executor(None, lambda p=prompt: model.encode(p).tolist())

    query_filter = Filter(
        must=[
            FieldCondition(
                key="datasetId",
                match=MatchValue(value=datasetId)
            )
        ]
    )

    search_result = qdrant_client.search(
        collection_name=QDRANT_COLLECTION_NAME,
        query_vector=query_vector,
        query_filter=query_filter,
        limit=5,
        with_payload=True
    )

    results = []
    for hit in search_result:
        payload = hit.payload
        chunk_text = payload.get('chunk', '')
        results.append({
            "chunk": chunk_text
        })

    return results
