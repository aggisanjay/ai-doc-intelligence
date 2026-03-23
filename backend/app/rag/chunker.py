"""
Intelligent document chunking with recursive splitting.
"""
from dataclasses import dataclass, field
from typing import Optional
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class DocumentChunk:
    text: str
    chunk_index: int
    page_number: Optional[int] = None
    source_file: str = ""
    document_id: str = ""
    word_count: int = 0
    metadata: dict = field(default_factory=dict)

    def __post_init__(self):
        self.word_count = len(self.text.split())
        self.metadata = {
            "chunk_index": self.chunk_index,
            "page_number": self.page_number,
            "source_file": self.source_file,
            "document_id": self.document_id,
            "word_count": self.word_count,
        }


class DocumentChunker:

    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or settings.chunk_size
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap
        self.separators = ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " "]

    def chunk_pages(self, pages: list, document_id: str) -> list[DocumentChunk]:
        all_chunks = []
        chunk_index = 0

        for page in pages:
            page_chunks = self._split_text(page.text)

            for chunk_text in page_chunks:
                if len(chunk_text.strip()) < 50:
                    continue
                chunk = DocumentChunk(
                    text=chunk_text.strip(),
                    chunk_index=chunk_index,
                    page_number=page.page_number,
                    source_file=page.source_file,
                    document_id=document_id,
                )
                all_chunks.append(chunk)
                chunk_index += 1

        logger.info(f"Created {len(all_chunks)} chunks from {len(pages)} pages")
        return all_chunks

    def _split_text(self, text: str) -> list[str]:
        if len(text) <= self.chunk_size:
            return [text]

        chunks = []
        for separator in self.separators:
            if separator in text:
                splits = text.split(separator)
                current_chunk = ""

                for split in splits:
                    test_chunk = (current_chunk + separator + split).strip() if current_chunk else split.strip()

                    if len(test_chunk) <= self.chunk_size:
                        current_chunk = test_chunk
                    else:
                        if current_chunk:
                            chunks.append(current_chunk)

                        if chunks and self.chunk_overlap > 0:
                            overlap_text = chunks[-1][-self.chunk_overlap:]
                            current_chunk = overlap_text + separator + split.strip()
                        else:
                            current_chunk = split.strip()

                        if len(current_chunk) > self.chunk_size:
                            sub_chunks = self._force_split(current_chunk)
                            chunks.extend(sub_chunks[:-1])
                            current_chunk = sub_chunks[-1] if sub_chunks else ""

                if current_chunk:
                    chunks.append(current_chunk)

                if chunks:
                    return chunks

        return self._force_split(text)

    def _force_split(self, text: str) -> list[str]:
        chunks = []
        for i in range(0, len(text), self.chunk_size - self.chunk_overlap):
            chunk = text[i:i + self.chunk_size]
            if chunk.strip():
                chunks.append(chunk.strip())
        return chunks
