'use strict';
const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const authService = require('../services/authService');

const router = Router();

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name: fullName } = req.body;
    if (!email || !password) return res.status(400).json({ detail: 'email and password are required' });
    const result = await authService.register({ email, password, fullName });
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ detail: 'email and password are required' });
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json(authService.formatUser(req.user));
});

module.exports = router;
