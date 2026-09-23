'use strict';

const Admin = require('../models/Admin');
const { verifyToken } = require('../services/authService');

/** Rejects the request unless it carries a valid `Authorization: Bearer <jwt>`. */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Admin login required' });
  }

  try {
    const payload = verifyToken(token);
    const admin = await Admin.findById(payload.sub);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Account no longer exists' });
    }
    req.admin = admin;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired, please log in again' });
  }
}

module.exports = { requireAuth };
