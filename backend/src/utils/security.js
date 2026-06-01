'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

function verifyPassword(plain, hashed) {
  return bcrypt.compareSync(plain, hashed);
}

function createAccessToken(userId, role) {
  return jwt.sign(
    { sub: userId, role },
    config.secretKey,
    { expiresIn: config.jwtExpiresIn }
  );
}

function decodeAccessToken(token) {
  try {
    return jwt.verify(token, config.secretKey);
  } catch (err) {
    const e = new Error(`Invalid token: ${err.message}`);
    e.status = 401;
    throw e;
  }
}

module.exports = { hashPassword, verifyPassword, createAccessToken, decodeAccessToken };
