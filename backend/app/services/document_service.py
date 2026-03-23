import os
import uuid
import logging
from datetime import datetime
from pathlib import Path

from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import get_settings
from app.models.document import Document, ProcessingStatus
from app.models.user import User
from app.rag.text_extractor import TextExtractor
from app.rag.chunker import DocumentChunker
from app.rag.vector_store import vector_store

logger = logging.getLogger(__name__)
settings = get_settings()


class DocumentService:

    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}

    @staticmethod
    async def upload_document(file: UploadFile, user: User, db: AsyncSession) -> Document:
        ext = Path(file.filename).suffix.lower()
        if ext not in DocumentService.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {ext}. Allowed: {DocumentService.ALLOWED_EXTENSIONS}",
            )

        content = await file.read()
        file_size = len(content)
        max_size = settings.max_file_size_mb * 1024 * 1024
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum: {settings.max_file_size_mb}MB",
            )

        unique_filename = f"{uuid.uuid4()}{ext}"
        user_upload_dir = os.path.join(settings.upload_dir, str(user.id))
        os.makedirs(user_upload_dir, exist_ok=True)
        file_path = os.path.join(user_upload_dir, unique_filename)

        with open(file_path, "wb") as f:
            f.write(content)

        document = Document(
            filename=unique_filename,
            original_filename=file.filename,
            file_type=ext.replace(".", ""),
            file_size=file_size,
            file_path=file_path,
            status=ProcessingStatus.PENDING,
            owner_id=user.id,
        )
        db.add(document)
        await db.commit()
        await db.refresh(document)

        logger.info(f"Document uploaded: {file.filename} -> {document.id}")
        return document

    @staticmethod
    async def process_document(document_id: str, user_id: str, db: AsyncSession):
        result = await db.execute(
            select(Document).where(Document.id == document_id, Document.owner_id == user_id)
        )
        document = result.scalar_one_or_none()

        if not document:
            logger.error(f"Document not found: {document_id}")
            return

        try:
            document.status = ProcessingStatus.PROCESSING
            await db.commit()

            pages = await TextExtractor.extract(document.file_path, document.original_filename)

            if not pages:
                raise ValueError("No text could be extracted from the document")

            document.page_count = len(pages)

            chunker = DocumentChunker()
            chunks = chunker.chunk_pages(pages, str(document.id))

            if not chunks:
                raise ValueError("No chunks generated from document")

            document.chunk_count = len(chunks)
            await vector_store.add_documents(chunks, str(user_id))

            document.status = ProcessingStatus.COMPLETED
            document.processed_at = datetime.utcnow()
            await db.commit()

            logger.info(f"Document processed: {document.original_filename} ({document.page_count} pages, {document.chunk_count} chunks)")

        except Exception as e:
            logger.error(f"Document processing failed: {e}")
            document.status = ProcessingStatus.FAILED
            document.error_message = str(e)
            await db.commit()

    @staticmethod
    async def get_user_documents(user: User, db: AsyncSession) -> list[Document]:
        result = await db.execute(
            select(Document).where(Document.owner_id == user.id).order_by(Document.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_document(document_id: str, user: User, db: AsyncSession) -> Document:
        result = await db.execute(
            select(Document).where(Document.id == document_id, Document.owner_id == user.id)
        )
        document = result.scalar_one_or_none()

        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        return document

    @staticmethod
    async def delete_document(document_id: str, user: User, db: AsyncSession):
        document = await DocumentService.get_document(document_id, user, db)

        await vector_store.delete_document_vectors(str(user.id), str(document.id))

        if os.path.exists(document.file_path):
            os.remove(document.file_path)

        await db.delete(document)
        await db.commit()
        logger.info(f"Document deleted: {document.original_filename}")
