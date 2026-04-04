'use strict';
const { Router } = require('express');
const multer = require('multer');
const os = require('os');
const { authenticate } = require('../middleware/auth');
const docService = require('../services/documentService');
const config = require('../config');

const router = Router();

// Store uploads in OS temp dir; documentService moves them to final location
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
});

// POST /api/v1/documents/upload
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ detail: 'No file provided' });

    const document = await docService.uploadDocument(req.file, req.user);

    // Process asynchronously — do not await
    docService.processDocument(document.id, req.user.id).catch(err =>
      console.error('[Route] Background processing error:', err.message)
    );

    res.status(201).json(docService.formatDocument(document));
  } catch (err) { next(err); }
});

// GET /api/v1/documents/
router.get('/', authenticate, async (req, res, next) => {
  try {
    const documents = await docService.getUserDocuments(req.user.id);
    res.json({
      documents: documents.map(docService.formatDocument),
      total: documents.length,
    });
  } catch (err) { next(err); }
});

// GET /api/v1/documents/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const doc = await docService.getDocument(req.params.id, req.user.id);
    res.json(docService.formatDocument(doc));
  } catch (err) { next(err); }
});

// DELETE /api/v1/documents/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await docService.deleteDocument(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

// POST /api/v1/documents/:id/reprocess
router.post('/:id/reprocess', authenticate, async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const doc = await docService.getDocument(req.params.id, req.user.id);
    if (!['failed', 'completed'].includes(doc.status)) {
      return res.status(400).json({ detail: `Cannot reprocess document with status: ${doc.status}` });
    }

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: { status: 'pending', errorMessage: null },
    });

    docService.processDocument(doc.id, req.user.id).catch(err =>
      console.error('[Route] Background reprocess error:', err.message)
    );

    res.json(docService.formatDocument(updated));
  } catch (err) { next(err); }
});

module.exports = router;
