from fastapi import APIRouter, HTTPException, Request, File, UploadFile, Form
from app.services import ingest_service, retrieve_service
from pydantic import BaseModel
from typing import List
from fastapi.templating import Jinja2Templates

router = APIRouter()

templates = Jinja2Templates(directory="templates")

@router.post("/ingest")
async def ingest(files: List[UploadFile] = File(...), datasetId: str = Form(...)):
    try:
        result = await ingest_service.ingest_files(files, datasetId)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class RetrieveRequest(BaseModel):
    prompt: str
    datasetId: str

@router.post("/retrieve")
async def retrieve(request: RetrieveRequest):
    try:
        results = await retrieve_service.retrieve_chunks(request.prompt, request.datasetId)
        return {
            "prompt": request.prompt,
            "datasetId": request.datasetId,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class DeleteRequest(BaseModel):
    datasetId: str

@router.post("/delete")
async def delete_dataset(request: DeleteRequest):
    try:
        result = await ingest_service.delete_dataset(request.datasetId)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def read_datasets(request: Request):
    dataset_ids = await ingest_service.get_dataset_ids()
    return templates.TemplateResponse("index.html", {"request": request, "datasets": dataset_ids})

@router.get("/dataset/{datasetId}")
async def read_dataset(request: Request, datasetId: str):
    chunks = await ingest_service.get_chunks_by_dataset(datasetId)
    return templates.TemplateResponse("dataset.html", {"request": request, "datasetId": datasetId, "chunks": chunks})
