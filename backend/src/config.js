'use strict';
require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '8000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/docai',
  directUrl: process.env.DIRECT_URL || '',

  // JWT
  secretKey: process.env.SECRET_KEY || 'change-me-in-production-min-32-chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Gemini & Groq
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/0',

  // Vector store
  vectorStoreType: process.env.VECTOR_STORE_TYPE || 'local',
  vectorStorePath: process.env.VECTOR_STORE_PATH || './vector_stores',

  // Uploads
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),

  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) 
    : ['http://localhost:3000', 'https://ai-doc-intelligence-f3uf.onrender.com'],

  // RAG
  chunkSize: parseInt(process.env.CHUNK_SIZE || '1000', 10),
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200', 10),
  topKRetrieval: parseInt(process.env.TOP_K_RETRIEVAL || '5', 10),
  maxContextTokens: parseInt(process.env.MAX_CONTEXT_TOKENS || '3000', 10),
};

module.exports = config;
