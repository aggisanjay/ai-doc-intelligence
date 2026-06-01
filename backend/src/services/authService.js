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

  return {
    access_token: createAccessToken(user.id, user.role),
    token_type: 'bearer',
    user: formatUser(user),
  };
}

module.exports = { register, login, formatUser };