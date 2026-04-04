'use strict';
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { httpError } = require('../utils/helpers');
const textExtractor = require('../rag/textExtractor');
const chunker = require('../rag/chunker');
const vectorStore = require('../rag/vectorStore');
const config = require('../config');

const prisma = new PrismaClient();

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc']);

function formatDocument(doc) {
  return {
    id: doc.id,
    filename: doc.filename,
    original_filename: doc.originalFilename,
    file_type: doc.fileType,
    file_size: doc.fileSize,
    status: doc.status,
    chunk_count: doc.chunkCount,
    page_count: doc.pageCount,
    error_message: doc.errorMessage,
    owner_id: doc.ownerId,
    created_at: doc.createdAt,
    processed_at: doc.processedAt,
  };
}

async function uploadDocument(file, user) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw httpError(`Unsupported file type: ${ext}. Allowed: .pdf, .docx, .doc`, 400);
  }

  const maxBytes = config.maxFileSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw httpError(`File too large. Maximum: ${config.maxFileSizeMb}MB`, 413);
  }

  // multer already wrote file to disk via diskStorage; file.path is the tmp path
  const uniqueFilename = `${uuidv4()}${ext}`;
  const userUploadDir = path.join(path.resolve(config.uploadDir), user.id);
  fs.mkdirSync(userUploadDir, { recursive: true });
  const finalPath = path.join(userUploadDir, uniqueFilename);
  fs.renameSync(file.path, finalPath);

  const document = await prisma.document.create({
    data: {
      filename: uniqueFilename,
      originalFilename: file.originalname,
      fileType: ext.replace('.', ''),
      fileSize: file.size,
      filePath: finalPath,
      status: 'pending',
      ownerId: user.id,
    },
  });

  console.log(`[DocumentService] Uploaded: ${file.originalname} -> ${document.id}`);
  return document;
}

async function processDocument(documentId, userId) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, ownerId: userId },
  });
  if (!document) {
    console.error(`[DocumentService] Not found: ${documentId}`);
    return;
  }

  try {
    await prisma.document.update({ where: { id: documentId }, data: { status: 'processing' } });

    const pages = await textExtractor.extract(document.filePath, document.originalFilename);
    if (!pages.length) throw new Error('No text could be extracted from the document');

    const chunks = chunker.chunkPages(pages, documentId);
    if (!chunks.length) throw new Error('No chunks generated from document');

    await vectorStore.addDocuments(chunks, userId);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'completed',
        pageCount: pages.length,
        chunkCount: chunks.length,
        processedAt: new Date(),
      },
    });

    console.log(`[DocumentService] Processed: ${document.originalFilename} (${pages.length} pages, ${chunks.length} chunks)`);
  } catch (err) {
    console.error(`[DocumentService] Processing failed: ${err.message}`);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'failed', errorMessage: err.message },
    });
  }
}

async function getUserDocuments(userId) {
  return prisma.document.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

async function getDocument(documentId, userId) {
  const doc = await prisma.document.findFirst({ where: { id: documentId, ownerId: userId } });
  if (!doc) throw httpError('Document not found', 404);
  return doc;
}

async function deleteDocument(documentId, userId) {
  const doc = await getDocument(documentId, userId);

  await vectorStore.deleteDocumentVectors(userId, documentId);

  if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);

  await prisma.document.delete({ where: { id: documentId } });
  console.log(`[DocumentService] Deleted: ${doc.originalFilename}`);
}

module.exports = { uploadDocument, processDocument, getUserDocuments, getDocument, deleteDocument, formatDocument };