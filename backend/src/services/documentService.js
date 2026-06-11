'use strict';
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { httpError, moveFile } = require('../utils/helpers');
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
    collection_id: doc.collectionId || null,
    created_at: doc.createdAt,
    processed_at: doc.processedAt,
  };
}

async function uploadDocument(file, user, collectionId = null) {
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
  await moveFile(file.path, finalPath);

  // Read the uploaded file into a binary buffer to save in the database
  const fileBuffer = fs.readFileSync(finalPath);

  const document = await prisma.document.create({
    data: {
      filename: uniqueFilename,
      originalFilename: file.originalname,
      fileType: ext.replace('.', ''),
      fileSize: file.size,
      filePath: finalPath,
      fileData: fileBuffer, // Save the binary file data in DB
      status: 'pending',
      ownerId: user.id,
      collectionId: collectionId || null,
    },
  });

  console.log(`[DocumentService] Uploaded and saved to DB: ${file.originalname} -> ${document.id}`);
  return document;
}

function resolveFilePath(doc) {
  if (!doc) return '';
  // 1. If the path exists as-is on the filesystem, use it
  if (fs.existsSync(doc.filePath)) {
    return doc.filePath;
  }
  // 2. Otherwise, resolve it relative to the local configuration directory
  const localPath = path.join(path.resolve(config.uploadDir), doc.ownerId, doc.filename);
  if (fs.existsSync(localPath)) {
    return localPath;
  }
  // 3. If file is missing locally, but we have fileData in the database, restore it!
  if (doc.fileData) {
    try {
      const dir = path.dirname(localPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(localPath, doc.fileData);
      console.log(`[DocumentService] Successfully restored missing file from database to: ${localPath}`);
      return localPath;
    } catch (err) {
      console.error(`[DocumentService] Error restoring file from database:`, err.message);
    }
  }
  // 4. Fallback to the local path so any subsequent ENOENT errors point to the local file system path
  return localPath;
}

async function processDocument(documentId, userId) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, ownerId: userId },
  });
  if (!document) {
    console.error(`[DocumentService] Not found: ${documentId}`);
    return;
  }

  // Resolve filePath dynamically
  document.filePath = resolveFilePath(document);

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
        errorMessage: null,
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
  const docs = await prisma.document.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      filename: true,
      originalFilename: true,
      fileType: true,
      fileSize: true,
      filePath: true,
      status: true,
      chunkCount: true,
      pageCount: true,
      errorMessage: true,
      ownerId: true,
      collectionId: true,
      createdAt: true,
      processedAt: true,
    }
  });
  return docs.map(doc => {
    doc.filePath = resolveFilePath(doc);
    return doc;
  });
}

async function getDocument(documentId, userId) {
  const doc = await prisma.document.findFirst({ where: { id: documentId, ownerId: userId } });
  if (!doc) throw httpError('Document not found', 404);
  doc.filePath = resolveFilePath(doc);
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