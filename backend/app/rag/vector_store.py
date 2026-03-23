import os
import json
import logging
import numpy as np
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Singleton — model loads once, reused on every request
_embedding_model = None

def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


class VectorStore:

    def __init__(self):
        self.store_type = settings.vector_store_type
        self.faiss_path = settings.faiss_index_path
        os.makedirs(self.faiss_path, exist_ok=True)
        self._metadata_store: dict[str, list[dict]] = {}
        self._load_metadata()

    async def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        import asyncio
        model = _get_embedding_model()
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            None,
            lambda: model.encode(texts, convert_to_numpy=True).tolist()
        )
        logger.info(f"Generated {len(embeddings)} embeddings locally")
        return embeddings

    async def add_documents(self, chunks: list, user_id: str):
        if not chunks:
            return
        texts = [chunk.text for chunk in chunks]
        embeddings = await self.generate_embeddings(texts)
        if self.store_type == "faiss":
            await self._add_to_faiss(embeddings, chunks, user_id)

    async def search(self, query: str, user_id: str, document_ids: list[str] = None, top_k: int = None) -> list[dict]:
        top_k = top_k or settings.top_k_retrieval
        query_embedding = await self.generate_embeddings([query])
        query_vector = query_embedding[0]
        if self.store_type == "faiss":
            return await self._search_faiss(query_vector, user_id, document_ids, top_k)
        return []

    async def _add_to_faiss(self, embeddings: list, chunks: list, user_id: str):
        import faiss

        dimension = len(embeddings[0])
        vectors = np.array(embeddings, dtype=np.float32)
        index_path = os.path.join(self.faiss_path, f"{user_id}.index")

        if os.path.exists(index_path):
            index = faiss.read_index(index_path)
            existing_metadata = self._metadata_store.get(user_id, [])
        else:
            index = faiss.IndexFlatIP(dimension)
            existing_metadata = []

        faiss.normalize_L2(vectors)
        index.add(vectors)

        for chunk in chunks:
            existing_metadata.append({
                "text": chunk.text,
                "page_number": chunk.page_number,
                "source_file": chunk.source_file,
                "document_id": chunk.document_id,
                "chunk_index": chunk.chunk_index,
            })

        self._metadata_store[user_id] = existing_metadata
        faiss.write_index(index, index_path)
        self._save_metadata()
        logger.info(f"Added {len(chunks)} vectors to FAISS for user {user_id}")

    async def _search_faiss(self, query_vector: list[float], user_id: str, document_ids: list[str] = None, top_k: int = 5) -> list[dict]:
        import faiss

        index_path = os.path.join(self.faiss_path, f"{user_id}.index")
        if not os.path.exists(index_path):
            return []

        index = faiss.read_index(index_path)
        metadata = self._metadata_store.get(user_id, [])

        if index.ntotal == 0:
            return []

        query_np = np.array([query_vector], dtype=np.float32)
        faiss.normalize_L2(query_np)

        search_k = min(top_k * 3 if document_ids else top_k, index.ntotal)
        scores, indices = index.search(query_np, search_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1 or idx >= len(metadata):
                continue
            meta = metadata[idx]
            if document_ids and meta["document_id"] not in document_ids:
                continue
            results.append({"text": meta["text"], "score": float(score), "metadata": meta})
            if len(results) >= top_k:
                break

        return results

    async def delete_document_vectors(self, user_id: str, document_id: str):
        import faiss

        metadata = self._metadata_store.get(user_id, [])
        new_metadata = [m for m in metadata if m["document_id"] != document_id]

        if not new_metadata:
            index_path = os.path.join(self.faiss_path, f"{user_id}.index")
            if os.path.exists(index_path):
                os.remove(index_path)
            self._metadata_store[user_id] = []
            self._save_metadata()
            return

        texts = [m["text"] for m in new_metadata]
        embeddings = await self.generate_embeddings(texts)
        dimension = len(embeddings[0])
        vectors = np.array(embeddings, dtype=np.float32)
        faiss.normalize_L2(vectors)
        index = faiss.IndexFlatIP(dimension)
        index.add(vectors)
        index_path = os.path.join(self.faiss_path, f"{user_id}.index")
        faiss.write_index(index, index_path)
        self._metadata_store[user_id] = new_metadata
        self._save_metadata()

    def _save_metadata(self):
        meta_path = os.path.join(self.faiss_path, "metadata.json")
        with open(meta_path, "w") as f:
            json.dump(self._metadata_store, f)

    def _load_metadata(self):
        meta_path = os.path.join(self.faiss_path, "metadata.json")
        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                self._metadata_store = json.load(f)


vector_store = VectorStore()