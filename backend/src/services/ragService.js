'use strict';
const prisma = require('../prismaClient');
const retriever = require('../rag/retriever');
const llmService = require('./llmService');
const cacheService = require('./cacheService');
const { httpError } = require('../utils/helpers');

// ── PostgreSQL handles JSON natively ──
function parseConv(conv) {
  if (!conv) return null;
  return {
    ...conv,
    messages:     conv.messages || [],
    document_ids: conv.documentIds || [],
    document_id:  conv.documentId || null,
    created_at:   conv.createdAt,
    updated_at:   conv.updatedAt,
  };
}

function buildCitations(chunks) {
  return chunks.map(c => ({
    document_name:   c.metadata?.sourceFile || 'Unknown',
    page_number:     c.metadata?.pageNumber || null,
    chunk_text:      c.text.length > 300 ? c.text.slice(0, 300) + '...' : c.text,
    relevance_score: Math.round(c.score * 1000) / 1000,
  }));
}

async function getOrCreateConversation(conversationId, userId) {
  if (!conversationId) return null;
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  return parseConv(conv);
}

// PostgreSQL cannot store \u0000 (null bytes) in text/jsonb columns.
// LLM responses occasionally contain these invisible characters.
function sanitize(str) {
  if (typeof str !== 'string') return str;
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u0000/g, '');
}

function sanitizeDeep(obj) {
  if (typeof obj === 'string') return sanitize(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeDeep);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = sanitizeDeep(v);
    return out;
  }
  return obj;
}

async function saveToConversation({ request, answer, sources, user, conversation }) {
  const now = new Date().toISOString();
  const userMsg      = { role: 'user',      content: sanitize(request.query), timestamp: now };
  const assistantMsg = { role: 'assistant', content: sanitize(answer), sources: sanitizeDeep(sources), timestamp: now };

  if (conversation) {
    const messages = [...(conversation.messages || []), userMsg, assistantMsg];
    const updated = await prisma.conversation.update({
      where: { id: conversation.id },
      data:  { messages: sanitizeDeep(messages), updatedAt: new Date() },
    });
    return updated.id;
  }

  const title  = sanitize(await llmService.generateConversationTitle(request.query, answer));
  const docIds = request.documentIds || [];
  const created = await prisma.conversation.create({
    data: {
      title,
      messages:    sanitizeDeep([userMsg, assistantMsg]),
      userId:      user.id,
      documentId:  docIds.length === 1 ? docIds[0] : null,
      documentIds: docIds,
    },
  });
  return created.id;
}

async function query(request, user, stream = false) {
  const userId = user.id;
  const docIds = request.documentIds || [];

  if (!stream) {
    const cached = await cacheService.get(request.query, docIds);
    if (cached) return cached;
  }

  const conversation = await getOrCreateConversation(request.conversationId, userId);
  const chatHistory  = conversation?.messages || [];
  const chunks       = await retriever.retrieve(request.query, userId, docIds);
  const sources      = buildCitations(chunks);

  if (stream) {
    return streamingResponse({ request, chunks, sources, chatHistory, user, conversation });
  }

  const llmResult = await llmService.generateResponse(request.query, chunks, chatHistory);

  const conversationId = await saveToConversation({
    request, answer: llmResult.answer, sources, user, conversation,
  });

  const response = {
    answer:          llmResult.answer,
    sources,
    conversation_id: conversationId,
    tokens_used:     llmResult.tokensUsed,
  };

  await cacheService.set(request.query, docIds, response);
  return response;
}

async function* streamingResponse({ request, chunks, sources, chatHistory, user, conversation }) {
  yield `data: ${JSON.stringify({ type: 'sources', data: sources })}\n\n`;

  let fullAnswer = '';

  for await (const sseChunk of llmService.generateStreamingResponse(request.query, chunks, chatHistory)) {
    if (sseChunk.includes('"type":"content"') || sseChunk.includes('"type": "content"')) {
      try {
        const payload = JSON.parse(sseChunk.replace(/^data: /, '').trim());
        fullAnswer += payload.data || '';
      } catch { /* ignore */ }
    }
    
    // Skip the generic 'done' or 'error' events if we want custom finalization
    if (sseChunk.includes('"type":"done"') || sseChunk.includes('"type": "done"')) {
      continue;
    }
    yield sseChunk;
  }

  const conversationId = await saveToConversation({ request, answer: fullAnswer, sources, user, conversation });
  yield `data: ${JSON.stringify({ type: 'done', conversation_id: conversationId })}\n\n`;
}

async function getConversations(userId) {
  const convs = await prisma.conversation.findMany({
    where:   { userId },
    orderBy: { updatedAt: 'desc' },
  });
  return convs.map(parseConv);
}

async function getConversation(conversationId, userId) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!conv) throw httpError('Conversation not found', 404);
  return parseConv(conv);
}

async function deleteConversation(conversationId, userId) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!conv) throw httpError('Conversation not found', 404);

  await prisma.conversation.delete({
    where: { id: conversationId },
  });
}

module.exports = { query, streamingResponse, getConversations, getConversation, deleteConversation, buildCitations };