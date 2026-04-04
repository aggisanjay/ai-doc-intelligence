'use strict';
const config = require('../config');

const SEPARATORS = ['\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' '];

function forceSplit(text, chunkSize, chunkOverlap) {
  const chunks = [];
  const step = chunkSize - chunkOverlap;
  for (let i = 0; i < text.length; i += step) {
    const chunk = text.slice(i, i + chunkSize).trim();
    if (chunk) chunks.push(chunk);
  }
  return chunks;
}

function splitText(text, chunkSize, chunkOverlap) {
  if (text.length <= chunkSize) return [text];

  for (const sep of SEPARATORS) {
    if (!text.includes(sep)) continue;

    const splits = text.split(sep);
    const chunks = [];
    let current = '';

    for (const split of splits) {
      const test = current ? (current + sep + split).trim() : split.trim();

      if (test.length <= chunkSize) {
        current = test;
      } else {
        if (current) chunks.push(current);

        const overlapText = chunks.length && chunkOverlap > 0
          ? chunks[chunks.length - 1].slice(-chunkOverlap) + sep + split.trim()
          : split.trim();

        if (overlapText.length > chunkSize) {
          const sub = forceSplit(overlapText, chunkSize, chunkOverlap);
          chunks.push(...sub.slice(0, -1));
          current = sub[sub.length - 1] || '';
        } else {
          current = overlapText;
        }
      }
    }
    if (current) chunks.push(current);
    if (chunks.length) return chunks;
  }

  return forceSplit(text, chunkSize, chunkOverlap);
}

/**
 * @param {Array<{text:string, pageNumber:number, sourceFile:string}>} pages
 * @param {string} documentId
 * @returns {Array<{text:string, chunkIndex:number, pageNumber:number, sourceFile:string, documentId:string, wordCount:number, metadata:object}>}
 */
function chunkPages(pages, documentId) {
  const chunkSize = config.chunkSize;
  const chunkOverlap = config.chunkOverlap;
  const allChunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const pageChunks = splitText(page.text, chunkSize, chunkOverlap);

    for (const chunkText of pageChunks) {
      const trimmed = chunkText.trim();
      if (trimmed.length < 50) continue;

      const wordCount = trimmed.split(/\s+/).length;
      allChunks.push({
        text: trimmed,
        chunkIndex,
        pageNumber: page.pageNumber,
        sourceFile: page.sourceFile,
        documentId,
        wordCount,
        metadata: {
          chunkIndex,
          pageNumber: page.pageNumber,
          sourceFile: page.sourceFile,
          documentId,
          wordCount,
        },
      });
      chunkIndex++;
    }
  }

  console.log(`[Chunker] Created ${allChunks.length} chunks from ${pages.length} pages`);
  return allChunks;
}

module.exports = { chunkPages };
