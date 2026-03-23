import logging
import json
from typing import AsyncGenerator

from google import genai
from google.genai import types
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

client = genai.Client(api_key=settings.gemini_api_key)

SYSTEM_PROMPT = """You are an AI document assistant that answers questions based ONLY on the provided document context.

RULES:
1. Answer ONLY based on the provided context. If the context doesn't contain enough information, say "I don't have enough information in the provided documents to answer this question."
2. Be precise and cite which parts of the context support your answer.
3. When referencing information, mention the source document name and page number if available.
4. Do NOT make up information or use knowledge outside the provided context.
5. Format your response clearly with paragraphs and bullet points where appropriate.
6. At the end of your response, list the sources you used: [Source: document_name, Page X]

CONTEXT FROM DOCUMENTS:
{context}

CONVERSATION HISTORY:
{chat_history}
"""


class LLMService:

    @staticmethod
    def build_context_string(retrieved_chunks: list[dict]) -> str:
        if not retrieved_chunks:
            return "No relevant document context found."
        context_parts = []
        for i, chunk in enumerate(retrieved_chunks, 1):
            metadata = chunk.get("metadata", {})
            source = metadata.get("source_file", "Unknown")
            page = metadata.get("page_number", "N/A")
            score = chunk.get("score", 0)
            context_parts.append(
                f"[Chunk {i}] (Source: {source}, Page: {page}, Relevance: {score:.2f})\n{chunk['text']}\n"
            )
        return "\n---\n".join(context_parts)

    @staticmethod
    def build_chat_history_string(messages: list[dict], max_messages: int = 6) -> str:
        if not messages:
            return "No previous conversation."
        recent = messages[-max_messages:]
        history_parts = []
        for msg in recent:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if len(content) > 500:
                content = content[:500] + "..."
            history_parts.append(f"{role.upper()}: {content}")
        return "\n".join(history_parts)

    @staticmethod
    async def generate_response(
        query: str,
        retrieved_chunks: list[dict],
        chat_history: list[dict] = None,
    ) -> dict:
        context = LLMService.build_context_string(retrieved_chunks)
        history = LLMService.build_chat_history_string(chat_history or [])
        system_message = SYSTEM_PROMPT.format(context=context, chat_history=history)

        try:
            response = await client.aio.models.generate_content(
                model="gemini-3-flash-preview",
                contents=query,
                config=types.GenerateContentConfig(
                    system_instruction=system_message,
                    temperature=0.1,
                    max_output_tokens=1500,
                ),
            )
            answer = response.text
            logger.info("Gemini response generated successfully")
            return {"answer": answer, "tokens_used": None}
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            raise

    @staticmethod
    async def generate_streaming_response(
        query: str,
        retrieved_chunks: list[dict],
        chat_history: list[dict] = None,
    ) -> AsyncGenerator[str, None]:
        context = LLMService.build_context_string(retrieved_chunks)
        history = LLMService.build_chat_history_string(chat_history or [])
        system_message = SYSTEM_PROMPT.format(context=context, chat_history=history)

        try:
            async for chunk in await client.aio.models.generate_content_stream(
                model="gemini-3-flash-preview",
                contents=query,
                config=types.GenerateContentConfig(
                    system_instruction=system_message,
                    temperature=0.1,
                    max_output_tokens=1500,
                ),
            ):
                if chunk.text:
                    yield f"data: {json.dumps({'type': 'content', 'data': chunk.text})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            logger.error(f"Gemini streaming failed: {e}")
            yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

    @staticmethod
    async def generate_conversation_title(query: str, answer: str) -> str:
        try:
            response = await client.aio.models.generate_content(
                model="gemini-3-flash-preview",
                contents=f"Question: {query}\nAnswer: {answer[:200]}",
                config=types.GenerateContentConfig(
                    system_instruction="Generate a short title (max 6 words) for this conversation. Return ONLY the title, nothing else.",
                    temperature=0.5,
                    max_output_tokens=20,
                ),
            )
            return response.text.strip().strip('"')
        except Exception:
            return query[:50] + "..." if len(query) > 50 else query