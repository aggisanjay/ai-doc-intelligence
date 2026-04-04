'use strict';
const crypto = require('crypto');
const config = require('../config');

class CacheService {
  constructor() {
    this._mem = new Map();
    this._redis = null;
    this._initRedis();
  }

  _initRedis() {
    try {
      const Redis = require('ioredis');
      this._redis = new Redis(config.redisUrl, {
        lazyConnect: true,
        enableOfflineQueue: false,
        // Disable automatic retries — we fall back to memory instead
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
        reconnectOnError: () => false,
      });
      this._redis.on('connect', () => console.log('[Cache] Redis connected'));
      this._redis.on('error', () => {}); // suppress ioredis default error log
      this._redis.connect().catch((err) => {
        console.warn(`[Cache] Redis unavailable (${err.message}) — using in-memory cache`);
        this._redis = null;
      });
    } catch {
      console.warn('[Cache] ioredis not available — using in-memory cache');
    }
  }

  _key(query, docIds) {
    const raw = `${query}:${JSON.stringify([...docIds].sort())}`;
    return 'query:' + crypto.createHash('md5').update(raw).digest('hex');
  }

  async get(query, docIds) {
    const key = this._key(query, docIds);
    if (this._redis) {
      try {
        const val = await this._redis.get(key);
        if (val) { console.log(`[Cache] HIT: ${query.slice(0, 50)}`); return JSON.parse(val); }
      } catch { /* fall through */ }
    }
    return this._mem.get(key) || null;
  }

  async set(query, docIds, result, ttl = 3600) {
    const key = this._key(query, docIds);
    const val = JSON.stringify(result);
    if (this._redis) {
      try { await this._redis.setex(key, ttl, val); return; } catch { /* fall through */ }
    }
    this._mem.set(key, result);
    // simple TTL for in-memory
    setTimeout(() => this._mem.delete(key), ttl * 1000);
  }

  async invalidateDocument() {
    if (this._redis) {
      try {
        const keys = await this._redis.keys('query:*');
        if (keys.length) await this._redis.del(...keys);
        return;
      } catch { /* fall through */ }
    }
    for (const k of this._mem.keys()) {
      if (k.startsWith('query:')) this._mem.delete(k);
    }
  }
}

module.exports = new CacheService();