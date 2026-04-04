'use strict';
const vectorStore = require('./vectorStore');
const config = require('../config');

const MIN_SCORE = 0.3;

function deduplicate(results, threshold = 0.85) {
  const unique = [];
  const seen = [];

  for (const result of results) {
    const wordsA = new Set(result.text.toLowerCase().split(/\s+/));
    let isDupe = false;

    for (const seenText of seen) {
      const wordsB = new Set(seenText.toLowerCase().split(/\s+/));
      const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
      const overlap = intersection / Math.min(wordsA.size, wordsB.size);
      if (overlap > threshold) { isDupe = true; break; }
    }

    if (!isDupe) {
      unique.push(result);
      seen.push(result.text);
    }
  }
  return unique;
}

function trimToContextWindow(results) {
  const maxChars = config.maxContextTokens * 4;
  let usedChars = 0;
  const trimmed = [];

  for (let result of results) {
    const len = result.text.length;
    if (usedChars + len > maxChars) {
      const remaining = maxChars - usedChars;
      if (remaining > 200) {
        result = { ...result, text: result.text.slice(0, remaining) + '...' };
        trimmed.push(result);
      }
      break;
    }
    trimmed.push(result);
    usedChars += len;
  }
  return trimmed;
}

async function retrieve(query, userId, documentIds = [], topK = null) {
  topK = topK || config.topKRetrieval;

  const raw = await vectorStore.search(query, userId, documentIds, topK * 2);
  if (!raw.length) return [];

  const filtered = raw.filter(r => r.score >= MIN_SCORE);
  const deduped = deduplicate(filtered);
  const trimmed = trimToContextWindow(deduped.slice(0, topK));

  console.log(`[Retriever] ${trimmed.length} chunks (raw=${raw.length}, filtered=${filtered.length})`);
  return trimmed;
}

module.exports = { retrieve };
