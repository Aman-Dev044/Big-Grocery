'use strict';

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { hashPassword, verifyPassword } = require('../utils/password');
const { JWT_SECRET, JWT_EXPIRES_IN, SEED_ADMIN } = require('../config/env');

/**
 * Creates the default admin on boot if it is not there yet. Idempotent — an
 * existing account is left alone so a changed password is never clobbered.
 */
async function ensureSeedAdmin() {
  const email = SEED_ADMIN.email.toLowerCase();
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log(`[seed] admin already present -> ${email}`);
    return existing;
  }

  const admin = await Admin.create({
    name: SEED_ADMIN.name,
    email,
    passwordHash: hashPassword(SEED_ADMIN.password),
  });

  console.log(`[seed] admin created -> ${email}`);
  return admin;
}

function signToken(admin) {
  return jwt.sign({ sub: String(admin._id), email: admin.email, role: admin.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

async function login(email, password) {
  const normalized = String(email || '').trim().toLowerCase();
  const admin = await Admin.findOne({ email: normalized }).select('+passwordHash');

  // Same message either way so the response cannot be used to probe for emails.
  const invalid = new Error('Invalid email or password');
  invalid.status = 401;

  if (!admin) throw invalid;
  if (!verifyPassword(password, admin.passwordHash)) throw invalid;

  admin.lastLoginAt = new Date();
  await admin.save();

  return { token: signToken(admin), admin: admin.toSafeJSON() };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { ensureSeedAdmin, login, signToken, verifyToken };
