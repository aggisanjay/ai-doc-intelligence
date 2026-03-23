from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class SourceCitation(BaseModel):
    document_name: str
    page_number: Optional[int] = None
    chunk_text: str
    relevance_score: float


class ChatMessage(BaseModel):
    role: str
    content: str
    sources: list[SourceCitation] = []
    timestamp: Optional[datetime] = None


class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[UUID] = None
    document_ids: list[UUID] = []


class ChatQueryResponse(BaseModel):
    answer: str
    sources: list[SourceCitation]
    conversation_id: UUID
    tokens_used: Optional[int] = None


class ConversationResponse(BaseModel):
    id: UUID
    title: str
    messages: list[dict]
    document_id: Optional[UUID]
    document_ids: list
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
