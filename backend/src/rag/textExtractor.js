'use strict';
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * @typedef {{ text: string, pageNumber: number, sourceFile: string }} ExtractedPage
 */

async function extractPdf(filePath, originalFilename) {
  const buffer = fs.readFileSync(filePath);
  const pages = [];

  // pagerender is called once per page by pdf-parse.
  // We collect per-page text here; the callback must return a string.
  await pdfParse(buffer, {
    pagerender: (pageData) => {
      return pageData.getTextContent().then((tc) => {
        const text = tc.items
          .map(item => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (text.length > 0) {
          pages.push({
            text,
            pageNumber: pageData.pageIndex + 1,
            sourceFile: originalFilename,
          });
        }
        return text; // pdf-parse requires a string return value
      });
    },
  });

  // Fallback for PDFs where pagerender doesn't fire (encrypted, image-only, etc.)
  if (pages.length === 0) {
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    if (text) {
      pages.push({ text, pageNumber: 1, sourceFile: originalFilename });
    }
  }

  console.log(`[TextExtractor] Extracted ${pages.length} pages from ${originalFilename}`);
  return pages;
}

async function extractDocx(filePath, originalFilename) {
  const result = await mammoth.extractRawText({ path: filePath });
  const fullText = result.value;

  // Group paragraphs into ~500-word virtual pages
  const paragraphs = fullText.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const pages = [];
  let currentParagraphs = [];
  let currentWordCount = 0;
  let pageNum = 1;

  for (const para of paragraphs) {
    currentParagraphs.push(para);
    currentWordCount += para.split(/\s+/).length;

    if (currentWordCount >= 500) {
      pages.push({
        text: currentParagraphs.join('\n'),
        pageNumber: pageNum,
        sourceFile: originalFilename,
      });
      currentParagraphs = [];
      currentWordCount = 0;
      pageNum++;
    }
  }

  if (currentParagraphs.length > 0) {
    pages.push({
      text: currentParagraphs.join('\n'),
      pageNumber: pageNum,
      sourceFile: originalFilename,
    });
  }

  console.log(`[TextExtractor] Extracted ${pages.length} sections from ${originalFilename}`);
  return pages;
}

async function extract(filePath, originalFilename) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return extractPdf(filePath, originalFilename);
  if (ext === '.docx' || ext === '.doc') return extractDocx(filePath, originalFilename);
  throw new Error(`Unsupported file type: ${ext}`);
}

module.exports = { extract };