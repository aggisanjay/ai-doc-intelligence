'use strict';
const { PrismaClient } = require('@prisma/client');
const { decodeAccessToken } = require('../utils/security');

const prisma = new PrismaClient();

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Missing or invalid Authorization header' });
    }
    const token = header.slice(7);
    const payload = decodeAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ detail: 'User not found' });
    if (!user.isActive) return res.status(403).json({ detail: 'Account is deactivated' });

    req.user = user;
    next();
  } catch (err) {
    res.status(err.status || 401).json({ detail: err.message });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
