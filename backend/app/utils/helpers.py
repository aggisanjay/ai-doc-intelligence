"""General utility helpers."""
import os
import uuid
from pathlib import Path


def generate_unique_filename(original_filename: str) -> str:
    ext = Path(original_filename).suffix.lower()
    return f"{uuid.uuid4()}{ext}"


def ensure_dir(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return path


def format_file_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
