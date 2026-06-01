'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Ensure upload / vector-store dirs exist ───────────────────────────────────
[config.uploadDir, config.vectorStorePath].forEach(dir => {
  fs.mkdirSync(path.resolve(dir), { recursive: true });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/chat', chatRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'healthy', version: '1.0.0' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  console.error(`[${status}] ${err.message}`);
  res.status(status).json({ detail: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`AI Doc Intelligence API running on http://0.0.0.0:${config.port}`);
  console.log(`API docs: http://localhost:${config.port}/health`);
});

module.exports = app;
