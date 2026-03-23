import logging
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.chat import ChatQueryRequest, ChatQueryResponse, SourceCitation, ConversationResponse
from app.rag.retriever import retriever
from app.services.llm_service import LLMService
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)


class RAGService:

    @staticmethod
    async def query(request: ChatQueryRequest, user: User, db: AsyncSession, stream: bool = False):
        user_id = str(user.id)
        document_ids = [str(d) for d in request.document_ids] if request.document_ids else []

        if not stream:
            cached = await cache_service.get_query_cache(request.query, document_ids)
            if cached:
                return ChatQueryResponse(**cached)

        conversation = None
        chat_history = []

        if request.conversation_id:
            result = await db.execute(
                select(Conversation).where(
                    Conversation.id == str(request.conversation_id),
                    Conversation.user_id == str(user.id),
                )
            )
            conversation = result.scalar_one_or_none()
            if conversation and conversation.messages:
                chat_history = conversation.messages

        retrieved_chunks = await retriever.retrieve(
            query=request.query,
            user_id=user_id,
            document_ids=document_ids,
        )

        if stream:
            return await RAGService._create_streaming_response(
                request, retrieved_chunks, chat_history, user, db, conversation
            )

        llm_result = await LLMService.generate_response(
            query=request.query,
            retrieved_chunks=retrieved_chunks,
            chat_history=chat_history,
        )

        sources = RAGService._build_citations(retrieved_chunks)

        conversation_id = await RAGService._save_to_conversation(
            request=request,
            answer=llm_result["answer"],
            sources=sources,
            user=user,
            db=db,
            conversation=conversation,
        )

        response = ChatQueryResponse(
            answer=llm_result["answer"],
            sources=sources,
            conversation_id=conversation_id,
            tokens_used=llm_result.get("tokens_used"),
        )

        await cache_service.set_query_cache(request.query, document_ids, response.model_dump())
        return response

    @staticmethod
    async def _create_streaming_response(request, retrieved_chunks, chat_history, user, db, conversation):
        import json
        sources = RAGService._build_citations(retrieved_chunks)

        async def event_generator():
            sources_data = [s.model_dump() for s in sources]
            yield f"data: {json.dumps({'type': 'sources', 'data': sources_data})}\n\n"

            full_answer = ""
            async for chunk in LLMService.generate_streaming_response(
                query=request.query,
                retrieved_chunks=retrieved_chunks,
                chat_history=chat_history,
            ):
                if '"type": "content"' in chunk:
                    try:
                        data = json.loads(chunk.replace("data: ", "").strip())
                        full_answer += data.get("data", "")
                    except json.JSONDecodeError:
                        pass
                yield chunk

            await RAGService._save_to_conversation(
                request=request,
                answer=full_answer,
                sources=sources,
                user=user,
                db=db,
                conversation=conversation,
            )

        return event_generator()

    @staticmethod
    def _build_citations(retrieved_chunks: list[dict]) -> list[SourceCitation]:
        sources = []
        for chunk in retrieved_chunks:
            metadata = chunk.get("metadata", {})
            sources.append(SourceCitation(
                document_name=metadata.get("source_file", "Unknown"),
                page_number=metadata.get("page_number"),
                chunk_text=chunk["text"][:300] + "..." if len(chunk["text"]) > 300 else chunk["text"],
                relevance_score=round(chunk.get("score", 0), 3),
            ))
        return sources

    @staticmethod
    async def _save_to_conversation(request, answer, sources, user, db, conversation=None) -> UUID:
        now = datetime.utcnow().isoformat()
        user_message = {"role": "user", "content": request.query, "timestamp": now}
        assistant_message = {
            "role": "assistant",
            "content": answer,
            "sources": [s.model_dump() for s in sources],
            "timestamp": now,
        }

        if conversation:
            messages = list(conversation.messages or [])
            messages.extend([user_message, assistant_message])
            conversation.messages = messages
            conversation.updated_at = datetime.utcnow()
            await db.commit()
            return conversation.id
        else:
            title = await LLMService.generate_conversation_title(request.query, answer)
            new_conversation = Conversation(
                title=title,
                messages=[user_message, assistant_message],
                user_id=str(user.id),
                document_id=str(request.document_ids[0]) if len(request.document_ids) == 1 else None,
                document_ids=[str(d) for d in request.document_ids],
            )
            db.add(new_conversation)
            await db.commit()
            await db.refresh(new_conversation)
            return new_conversation.id

    @staticmethod
    async def get_conversations(user: User, db: AsyncSession) -> list[Conversation]:
        result = await db.execute(
            select(Conversation).where(Conversation.user_id == str(user.id)).order_by(Conversation.updated_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_conversation(conversation_id: UUID, user: User, db: AsyncSession) -> Conversation:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == str(conversation_id),
                Conversation.user_id == str(user.id),
            )
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        return conversation