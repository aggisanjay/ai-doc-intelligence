'use strict';
const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ragService = require('../services/ragService');

const router = Router();

// POST /api/v1/chat/query
router.post('/query', authenticate, async (req, res, next) => {
  try {
    const { query, document_ids: documentIds = [], conversation_id: conversationId } = req.body;
    if (!query) return res.status(400).json({ detail: 'query is required' });

    const result = await ragService.query(
      { query, documentIds, conversationId },
      req.user,
      false
    );
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/v1/chat/query/stream  — SSE streaming
router.post('/query/stream', authenticate, async (req, res, next) => {
  try {
    const { query, document_ids: documentIds = [], conversation_id: conversationId } = req.body;
    if (!query) return res.status(400).json({ detail: 'query is required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const generator = ragService.streamingResponse(
      await prepareStreamArgs({ query, documentIds, conversationId }, req.user)
    );

    for await (const chunk of generator) {
      res.write(chunk);
    }
    res.end();
  } catch (err) { next(err); }
});

// Helper — gathers chunks/sources/history for streaming without going through the cache path
async function prepareStreamArgs({ query, documentIds, conversationId }, user) {
  const retriever = require('../rag/retriever');
  const llmService = require('../services/llmService');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const conversation = conversationId
    ? await prisma.conversation.findFirst({ where: { id: conversationId, userId: user.id } })
    : null;

  const chatHistory = conversation?.messages || [];
  const chunks = await retriever.retrieve(query, user.id, documentIds);

  const buildCitations = (cs) => cs.map(c => ({
    documentName: c.metadata?.sourceFile || 'Unknown',
    pageNumber: c.metadata?.pageNumber || null,
    chunkText: c.text.length > 300 ? c.text.slice(0, 300) + '...' : c.text,
    relevanceScore: Math.round(c.score * 1000) / 1000,
  }));

  return {
    request: { query, documentIds, conversationId },
    chunks,
    sources: buildCitations(chunks),
    chatHistory,
    user,
    conversation,
  };
}

// GET /api/v1/chat/conversations
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const conversations = await ragService.getConversations(req.user.id);
    res.json(conversations);
  } catch (err) { next(err); }
});

// GET /api/v1/chat/conversations/:id
router.get('/conversations/:id', authenticate, async (req, res, next) => {
  try {
    const conv = await ragService.getConversation(req.params.id, req.user.id);
    res.json(conv);
  } catch (err) { next(err); }
});

// DELETE /api/v1/chat/conversations/:id
router.delete('/conversations/:id', authenticate, async (req, res, next) => {
  try {
    await ragService.deleteConversation(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
