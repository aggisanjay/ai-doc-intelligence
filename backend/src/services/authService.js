'use strict';
const { PrismaClient } = require('@prisma/client');
const { hashPassword, verifyPassword, createAccessToken } = require('../utils/security');
const { httpError } = require('../utils/helpers');

const prisma = new PrismaClient();

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    is_active: user.isActive,
    created_at: user.createdAt,
  };
}

async function ensureDefaultWorkspaceAndCollections(userId) {
  try {
    let workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          ownerId: userId,
        }
      });

      const defaultCollections = [
        'Engineering Docs',
        'Product Knowledge',
        'Research Papers',
        'Internal SOPs',
        'Training Materials'
      ];

      for (const name of defaultCollections) {
        try {
          await prisma.collection.create({
            data: {
              name,
              workspaceId: workspace.id,
            }
          });
        } catch (colErr) {
          console.warn(`[AuthService] Warning creating collection '${name}':`, colErr.message);
        }
      }
      console.log(`[AuthService] Auto-provisioned default Workspace & Collections for user: ${userId}`);
    }
  } catch (err) {
    console.warn('[AuthService] Non-fatal warning auto-provisioning workspace:', err.message);
  }
}

async function register({ email, password, fullName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw httpError('Email already registered', 409);

  const user = await prisma.user.create({
    data: {
      email,
      hashedPassword: hashPassword(password),
      fullName: fullName || null,
      role: 'user',
    },
  });

  await ensureDefaultWorkspaceAndCollections(user.id);

  return {
    access_token: createAccessToken(user.id, user.role),
    token_type: 'bearer',
    user: formatUser(user),
  };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.hashedPassword)) {
    throw httpError('Invalid email or password', 401);
  }
  if (!user.isActive) throw httpError('Account is deactivated', 403);

  await ensureDefaultWorkspaceAndCollections(user.id);

  return {
    access_token: createAccessToken(user.id, user.role),
    token_type: 'bearer',
    user: formatUser(user),
  };
}

async function clerkSync({ email, fullName }) {
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      const { v4: uuidv4 } = require('uuid');
      const randomPassword = uuidv4();
      user = await prisma.user.create({
        data: {
          email,
          hashedPassword: hashPassword(randomPassword),
          fullName: fullName || null,
          role: 'user',
        },
      });
    } else if (!user.isActive) {
      throw httpError('Account is deactivated', 403);
    }

    await ensureDefaultWorkspaceAndCollections(user.id);

    return {
      access_token: createAccessToken(user.id, user.role),
      token_type: 'bearer',
      user: formatUser(user),
    };
  } catch (err) {
    console.error('[AuthService] Error in clerkSync:', err);
    throw err;
  }
}

module.exports = { register, login, clerkSync, formatUser, ensureDefaultWorkspaceAndCollections };