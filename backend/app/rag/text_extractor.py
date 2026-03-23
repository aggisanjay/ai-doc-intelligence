"""
Text extraction from PDF and DOCX files.
"""
import fitz  # PyMuPDF
from docx import Document as DocxDocument
from pathlib import Path
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class ExtractedPage:
    text: str
    page_number: int
    source_file: str


class TextExtractor:

    @staticmethod
    async def extract(file_path: str, original_filename: str) -> list[ExtractedPage]:
        path = Path(file_path)
        suffix = path.suffix.lower()

        if suffix == ".pdf":
            return TextExtractor._extract_pdf(file_path, original_filename)
        elif suffix in (".docx", ".doc"):
            return TextExtractor._extract_docx(file_path, original_filename)
        else:
            raise ValueError(f"Unsupported file type: {suffix}")

    @staticmethod
    def _extract_pdf(file_path: str, original_filename: str) -> list[ExtractedPage]:
        pages = []
        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                if text.strip():
                    pages.append(ExtractedPage(
                        text=text.strip(),
                        page_number=page_num + 1,
                        source_file=original_filename,
                    ))
            doc.close()
            logger.info(f"Extracted {len(pages)} pages from {original_filename}")
        except Exception as e:
            logger.error(f"PDF extraction failed for {original_filename}: {e}")
            raise
        return pages

    @staticmethod
    def _extract_docx(file_path: str, original_filename: str) -> list[ExtractedPage]:
        pages = []
        try:
            doc = DocxDocument(file_path)
            current_text = []
            current_word_count = 0
            page_num = 1

            for para in doc.paragraphs:
                text = para.text.strip()
                if not text:
                    continue
                current_text.append(text)
                current_word_count += len(text.split())

                if current_word_count >= 500:
                    pages.append(ExtractedPage(
                        text="\n".join(current_text),
                        page_number=page_num,
                        source_file=original_filename,
                    ))
                    current_text = []
                    current_word_count = 0
                    page_num += 1

            if current_text:
                pages.append(ExtractedPage(
                    text="\n".join(current_text),
                    page_number=page_num,
                    source_file=original_filename,
                ))

            logger.info(f"Extracted {len(pages)} sections from {original_filename}")
        except Exception as e:
            logger.error(f"DOCX extraction failed for {original_filename}: {e}")
            raise
        return pages
