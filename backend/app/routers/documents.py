from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, AsyncSessionLocal
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentListResponse
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    document = await DocumentService.upload_document(file, user, db)

    async def process_in_background(doc_id: str, user_id: str):
        async with AsyncSessionLocal() as bg_session:
            await DocumentService.process_document(doc_id, user_id, bg_session)

    background_tasks.add_task(process_in_background, str(document.id), str(user.id))
    return DocumentResponse.model_validate(document)


@router.get("/", response_model=DocumentListResponse)
async def list_documents(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    documents = await DocumentService.get_user_documents(user, db)
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in documents],
        total=len(documents),
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    document = await DocumentService.get_document(document_id, user, db)
    return DocumentResponse.model_validate(document)


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await DocumentService.delete_document(document_id, user, db)


@router.post("/{document_id}/reprocess", response_model=DocumentResponse)
async def reprocess_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    document = await DocumentService.get_document(document_id, user, db)

    if document.status not in ("failed", "completed"):
        raise HTTPException(status_code=400, detail=f"Cannot reprocess document with status: {document.status}")

    document.status = "pending"
    document.error_message = None
    await db.commit()
    await db.refresh(document)

    async def process_in_background(doc_id: str, user_id: str):
        async with AsyncSessionLocal() as bg_session:
            await DocumentService.process_document(doc_id, user_id, bg_session)

    background_tasks.add_task(process_in_background, str(document.id), str(user.id))
    return DocumentResponse.model_validate(document)
