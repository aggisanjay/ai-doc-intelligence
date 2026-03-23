from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.chat import ChatQueryRequest, ChatQueryResponse, ConversationResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/query", response_model=ChatQueryResponse)
async def query_documents(
    request: ChatQueryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RAGService.query(request, user, db, stream=False)


@router.post("/query/stream")
async def query_documents_stream(
    request: ChatQueryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    event_generator = await RAGService.query(request, user, db, stream=True)
    return StreamingResponse(
        event_generator,
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    conversations = await RAGService.get_conversations(user, db)
    return [ConversationResponse.model_validate(c) for c in conversations]


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conversation = await RAGService.get_conversation(conversation_id, user, db)
    return ConversationResponse.model_validate(conversation)
