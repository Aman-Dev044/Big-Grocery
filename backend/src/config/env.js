'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const ROOT = path.resolve(__dirname, '../..');

function required(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

module.exports = {
  ROOT,
  PORT: Number(process.env.PORT || 1004),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: required('MONGODB_URI'),
  DB_NAME: process.env.DB_NAME || 'big_bannia_grocery',
  STORAGE_DIR: path.resolve(ROOT, process.env.STORAGE_DIR || 'storage'),
  TMP_DIR: path.resolve(ROOT, process.env.TMP_DIR || 'tmp'),
  PUBLIC_BASE_URL: (process.env.PUBLIC_BASE_URL || 'http://localhost:1004').replace(/\/+$/, ''),
  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB || 200),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4001',
  DNS_SERVERS: (process.env.DNS_SERVERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',

  SEED_ADMIN: {
    name: process.env.SEED_ADMIN_NAME || 'Puneet Singla',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@grocery.com',
    password: required('SEED_ADMIN_PASSWORD'),
  },
};
