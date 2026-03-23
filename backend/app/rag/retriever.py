"""
Retriever — orchestrates search with deduplication and context window management.
"""
import logging
from app.rag.vector_store import vector_store
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class Retriever:

    def __init__(self):
        self.vector_store = vector_store
        self.min_score_threshold = 0.3

    async def retrieve(self, query: str, user_id: str, document_ids: list[str] = None, top_k: int = None) -> list[dict]:
        top_k = top_k or settings.top_k_retrieval

        raw_results = await self.vector_store.search(
            query=query, user_id=user_id, document_ids=document_ids, top_k=top_k * 2,
        )

        if not raw_results:
            return []

        filtered = [r for r in raw_results if r["score"] >= self.min_score_threshold]
        deduplicated = self._deduplicate(filtered)
        trimmed = self._trim_to_context_window(deduplicated[:top_k])

        logger.info(f"Retrieved {len(trimmed)} chunks (raw={len(raw_results)}, filtered={len(filtered)})")
        return trimmed

    def _deduplicate(self, results: list[dict], similarity_threshold: float = 0.85) -> list[dict]:
        unique_results = []
        seen_texts = []

        for result in results:
            text = result["text"]
            is_duplicate = False

            for seen_text in seen_texts:
                words_a = set(text.lower().split())
                words_b = set(seen_text.lower().split())

                if not words_a or not words_b:
                    continue

                overlap = len(words_a & words_b) / min(len(words_a), len(words_b))
                if overlap > similarity_threshold:
                    is_duplicate = True
                    break

            if not is_duplicate:
                unique_results.append(result)
                seen_texts.append(text)

        return unique_results

    def _trim_to_context_window(self, results: list[dict]) -> list[dict]:
        max_chars = settings.max_context_tokens * 4
        current_chars = 0
        trimmed = []

        for result in results:
            text_len = len(result["text"])
            if current_chars + text_len > max_chars:
                remaining = max_chars - current_chars
                if remaining > 200:
                    result = result.copy()
                    result["text"] = result["text"][:remaining] + "..."
                    trimmed.append(result)
                break
            trimmed.append(result)
            current_chars += text_len

        return trimmed


retriever = Retriever()
