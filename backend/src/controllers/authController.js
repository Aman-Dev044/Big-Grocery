'use strict';

const { login } = require('../services/authService');

async function loginAdmin(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const { token, admin } = await login(email, password);
    return res.json({ success: true, message: `Welcome back, ${admin.name}`, data: { token, admin } });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return res.json({ success: true, data: { admin: req.admin.toSafeJSON() } });
}

module.exports = { loginAdmin, me };
