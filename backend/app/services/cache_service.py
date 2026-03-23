import hashlib
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class CacheService:

    def __init__(self):
        self._cache: dict = {}
        self._redis = None
        self._init_redis()

    def _init_redis(self):
        try:
            import redis
            from app.config import get_settings
            settings = get_settings()
            self._redis = redis.from_url(settings.redis_url, decode_responses=True)
            self._redis.ping()
            logger.info("Redis cache connected")
        except Exception as e:
            logger.warning(f"Redis unavailable, using in-memory cache: {e}")
            self._redis = None

    def _make_key(self, prefix: str, data: str) -> str:
        hash_val = hashlib.md5(data.encode()).hexdigest()
        return f"{prefix}:{hash_val}"

    async def get_query_cache(self, query: str, document_ids: list[str]) -> Optional[dict]:
        key = self._make_key("query", f"{query}:{sorted(document_ids)}")

        if self._redis:
            cached = self._redis.get(key)
            if cached:
                logger.info(f"Cache HIT for query: {query[:50]}...")
                return json.loads(cached)
        else:
            if key in self._cache:
                return self._cache[key]

        return None

    async def set_query_cache(self, query: str, document_ids: list[str], result: dict, ttl: int = 3600):
        key = self._make_key("query", f"{query}:{sorted(document_ids)}")
        value = json.dumps(result, default=str)

        if self._redis:
            self._redis.setex(key, ttl, value)
        else:
            self._cache[key] = result

    async def invalidate_document_cache(self, document_id: str):
        if self._redis:
            try:
                keys = self._redis.keys("query:*")
                if keys:
                    self._redis.delete(*keys)
            except Exception as e:
                logger.warning(f"Cache invalidation failed: {e}")
        else:
            query_keys = [k for k in self._cache if k.startswith("query:")]
            for key in query_keys:
                del self._cache[key]


cache_service = CacheService()
