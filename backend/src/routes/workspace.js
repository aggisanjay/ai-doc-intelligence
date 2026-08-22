'use strict';
const { Router } = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');
const { httpError } = require('../utils/helpers');

const router = Router();

// ── WORKSPACE ENDPOINTS ───────────────────────────────────────────────────────

// GET /api/v1/workspaces
router.get('/', authenticate, async (req, res, next) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: { ownerId: req.user.id },
      include: {
        collections: {
          include: {
            _count: {
              select: { documents: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(workspaces);
  } catch (err) { next(err); }
});

// POST /api/v1/workspaces
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ detail: 'Workspace name is required' });

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: req.user.id
      }
    });

    res.status(201).json(workspace);
  } catch (err) { next(err); }
});

// DELETE /api/v1/workspaces/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const ws = await prisma.workspace.findFirst({
      where: { id: req.params.id, ownerId: req.user.id }
    });
    if (!ws) return res.status(404).json({ detail: 'Workspace not found' });

    await prisma.workspace.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── COLLECTION ENDPOINTS ──────────────────────────────────────────────────────

// GET /api/v1/workspaces/collections
router.get('/collections', authenticate, async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    
    // Find workspace owned by user
    let whereClause = { workspace: { ownerId: req.user.id } };
    if (workspaceId) {
      whereClause.workspaceId = workspaceId;
    }

    const collections = await prisma.collection.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(collections);
  } catch (err) { next(err); }
});

// POST /api/v1/workspaces/collections
router.post('/collections', authenticate, async (req, res, next) => {
  try {
    const { name, workspaceId } = req.body;
    if (!name || !workspaceId) {
      return res.status(400).json({ detail: 'Collection name and workspaceId are required' });
    }

    // Verify workspace ownership
    const ws = await prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: req.user.id }
    });
    if (!ws) return res.status(404).json({ detail: 'Workspace not found or unauthorized' });

    const collection = await prisma.collection.create({
      data: {
        name,
        workspaceId
      }
    });

    res.status(201).json(collection);
  } catch (err) { next(err); }
});

// GET /api/v1/workspaces/collections/:id
router.get('/collections/:id', authenticate, async (req, res, next) => {
  try {
    const collection = await prisma.collection.findFirst({
      where: { id: req.params.id, workspace: { ownerId: req.user.id } },
      include: {
        documents: true,
        conversations: {
          orderBy: { updatedAt: 'desc' }
        }
      }
    });
    if (!collection) return res.status(404).json({ detail: 'Collection not found' });

    res.json(collection);
  } catch (err) { next(err); }
});

// DELETE /api/v1/workspaces/collections/:id
router.delete('/collections/:id', authenticate, async (req, res, next) => {
  try {
    const collection = await prisma.collection.findFirst({
      where: { id: req.params.id, workspace: { ownerId: req.user.id } }
    });
    if (!collection) return res.status(404).json({ detail: 'Collection not found' });

    await prisma.collection.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
