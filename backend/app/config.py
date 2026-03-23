"""
Application configuration loaded from environment variables.
Uses pydantic-settings for type-safe config with validation.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/docai"

    # JWT Security
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    # Gemini
    gemini_api_key: str = "AIzaSyCjC_Pr67_qJTuCpotd2RCqJzMXpJbEpqc"

    # Vector store
    vector_store_type: str = "faiss"  # "faiss" or "pinecone"
    faiss_index_path: str = "./vector_stores"

    # Pinecone
    pinecone_api_key: str = ""
    pinecone_environment: str = ""
    pinecone_index_name: str = "docai"

    # Upload
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 50

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Chunking parameters
    chunk_size: int = 1000
    chunk_overlap: int = 200

    # RAG parameters
    top_k_retrieval: int = 5
    max_context_tokens: int = 3000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
