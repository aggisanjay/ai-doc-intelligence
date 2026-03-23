from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class DocumentResponse(BaseModel):
    id: UUID
    original_filename: str
    file_type: str
    file_size: int
    status: str
    chunk_count: int
    page_count: int
    error_message: Optional[str]
    created_at: datetime
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
