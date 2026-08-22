'use strict';
const { PrismaClient } = require('@prisma/client');

// Singleton pattern: reuse a single PrismaClient instance across the entire
// application to avoid connection-pool exhaustion against the remote DB.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
