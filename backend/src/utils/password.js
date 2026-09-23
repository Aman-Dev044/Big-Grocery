'use strict';

const crypto = require('crypto');

const KEY_LEN = 64;
const SALT_LEN = 16;

/**
 * Hashes with Node's built-in scrypt — no native build step, no extra
 * dependency. Stored as "scrypt:<salt hex>:<derived key hex>".
 */
function hashPassword(plain) {
  const salt = crypto.randomBytes(SALT_LEN);
  const derived = crypto.scryptSync(String(plain), salt, KEY_LEN);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

function verifyPassword(plain, stored) {
  if (typeof stored !== 'string') return false;

  const [scheme, saltHex, keyHex] = stored.split(':');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, 'hex');
  const actual = crypto.scryptSync(String(plain), Buffer.from(saltHex, 'hex'), expected.length);

  // Constant-time compare so a wrong password cannot be timed byte by byte.
  return crypto.timingSafeEqual(expected, actual);
}

module.exports = { hashPassword, verifyPassword };
