'use strict';
/**
 * Local vector store — cosine similarity over sentence-transformer embeddings.
 * Equivalent to Python's faiss.IndexFlatIP with L2 normalisation.
 *
 * Embeddings are generated via @xenova/transformers (all-MiniLM-L6-v2).
 * Data is persisted as binary (.vec) + JSON (.meta) files, one pair per user.
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Lazy-load the transformer pipeline (downloads model on first use)
let _pipeline = null;
async function getEmbeddingPipeline() {
  if (!_pipeline) {
    const { pipeline } = await import('@xenova/transformers');
    _pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
    console.log('[VectorStore] Embedding model loaded');
  }
  return _pipeline;
}

// ── Maths helpers ─────────────────────────────────────────────────────────────

function l2Normalize(vec) {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? vec : vec.map(v => v / norm);
}

function dotProduct(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// ── Persistence helpers ───────────────────────────────────────────────────────

function vecPath(userId) {
  return path.join(path.resolve(config.vectorStorePath), `${userId}.vec`);
}
function metaPath(userId) {
  return path.join(path.resolve(config.vectorStorePath), `${userId}.meta.json`);
}

function loadIndex(userId) {
  const vp = vecPath(userId);
  const mp = metaPath(userId);
  if (!fs.existsSync(vp) || !fs.existsSync(mp)) return { vectors: [], metadata: [] };

  const meta = JSON.parse(fs.readFileSync(mp, 'utf8'));
  const buf = fs.readFileSync(vp);
  const dim = meta.length > 0 ? buf.byteLength / meta.length / 4 : 0;
  const vectors = [];
  for (let i = 0; i < meta.length; i++) {
    const vec = [];
    for (let j = 0; j < dim; j++) {
      vec.push(buf.readFloatLE((i * dim + j) * 4));
    }
    vectors.push(vec);
  }
  return { vectors, metadata: meta };
}

function saveIndex(userId, vectors, metadata) {
  if (vectors.length === 0) {
    [vecPath(userId), metaPath(userId)].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    return;
  }
  const dim = vectors[0].length;
  const buf = Buffer.allocUnsafe(vectors.length * dim * 4);
  vectors.forEach((vec, i) => {
    vec.forEach((v, j) => buf.writeFloatLE(v, (i * dim + j) * 4));
  });
  fs.writeFileSync(vecPath(userId), buf);
  fs.writeFileSync(metaPath(userId), JSON.stringify(metadata));
}

// ── Public API ────────────────────────────────────────────────────────────────

async function generateEmbeddings(texts) {
  const pipe = await getEmbeddingPipeline();
  const embeddings = [];
  for (const text of texts) {
    const output = await pipe(text, { pooling: 'mean', normalize: false });
    const vec = Array.from(output.data);
    embeddings.push(l2Normalize(vec));
  }
  return embeddings;
}

async function addDocuments(chunks, userId) {
  if (!chunks.length) return;

  const texts = chunks.map(c => c.text);
  const newVectors = await generateEmbeddings(texts);

  const { vectors, metadata } = loadIndex(userId);

  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    vectors.push(newVectors[i]);
    metadata.push({
      text: c.text,
      pageNumber: c.pageNumber,
      sourceFile: c.sourceFile,
      documentId: c.documentId,
      chunkIndex: c.chunkIndex,
    });
  }

  saveIndex(userId, vectors, metadata);
  console.log(`[VectorStore] Added ${chunks.length} vectors for user ${userId}`);
}

async function search(query, userId, documentIds = [], topK = null) {
  topK = topK || config.topKRetrieval;
  const { vectors, metadata } = loadIndex(userId);
  if (!vectors.length) return [];

  const [queryVec] = await generateEmbeddings([query]);

  const scores = vectors.map((vec, idx) => ({ idx, score: dotProduct(queryVec, vec) }));
  scores.sort((a, b) => b.score - a.score);

  const results = [];
  for (const { idx, score } of scores) {
    if (results.length >= topK) break;
    const meta = metadata[idx];
    if (documentIds.length && !documentIds.includes(meta.documentId)) continue;
    results.push({ text: meta.text, score, metadata: meta });
  }

  return results;
}

async function deleteDocumentVectors(userId, documentId) {
  const { vectors, metadata } = loadIndex(userId);
  const keep = metadata.map((m, i) => m.documentId !== documentId ? i : -1).filter(i => i !== -1);
  saveIndex(userId, keep.map(i => vectors[i]), keep.map(i => metadata[i]));
  console.log(`[VectorStore] Deleted vectors for document ${documentId}`);
}

module.exports = { addDocuments, search, deleteDocumentVectors, generateEmbeddings };
