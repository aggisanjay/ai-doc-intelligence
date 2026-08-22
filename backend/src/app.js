'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat');
const workspaceRoutes = require('./routes/workspace');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      config.allowedOrigins.includes('*') || 
      config.allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    // Allow any localhost or frontend domain
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Ensure upload / vector-store dirs exist ───────────────────────────────────
[config.uploadDir, config.vectorStorePath].forEach(dir => {
  try {
    fs.mkdirSync(path.resolve(dir), { recursive: true });
  } catch (err) {
    console.warn(`Could not create directory ${dir}:`, err.message);
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'healthy', version: '1.0.0' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  console.error(`[Error ${status}] ${err.message}`, err.stack);
  res.status(status).json({ 
    detail: err.message || 'Internal server error',
    code: err.code || undefined 
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, async () => {
  console.log(`AI Doc Intelligence API running on http://0.0.0.0:${config.port}`);
  console.log(`API docs: http://localhost:${config.port}/health`);

  // Clean up stuck documents from previous runs (e.g. server restarted during processing)
  try {
    const prisma = require('./prismaClient');
    const result = await prisma.document.updateMany({
      where: { status: { in: ['pending', 'processing'] } },
      data: {
        status: 'failed',
        errorMessage: 'Server restarted during processing. Please reprocess this document.',
      },
    });
    if (result.count > 0) {
      console.log(`[Startup] Cleaned up ${result.count} orphaned/stuck documents.`);
    }
  } catch (err) {
    console.error('[Startup] Failed to clean up stuck documents:', err.message);
  }
});

module.exports = app;
