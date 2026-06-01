'use strict';
require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '8000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/docai',

  // JWT
  secretKey: process.env.SECRET_KEY || 'change-me-in-production-min-32-chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Gemini
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/0',

  // Vector store
  vectorStoreType: process.env.VECTOR_STORE_TYPE || 'local',
  vectorStorePath: process.env.VECTOR_STORE_PATH || './vector_stores',

  // Uploads
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  // RAG
  chunkSize: parseInt(process.env.CHUNK_SIZE || '1000', 10),
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200', 10),
  topKRetrieval: parseInt(process.env.TOP_K_RETRIEVAL || '5', 10),
  maxContextTokens: parseInt(process.env.MAX_CONTEXT_TOKENS || '3000', 10),
};

module.exports = config;
