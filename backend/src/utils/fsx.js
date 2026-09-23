'use strict';

const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp']);

function isImageFile(filename) {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function removeDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function safeUnlink(file) {
  try {
    fs.unlinkSync(file);
  } catch {
    /* already gone */
  }
}

/** Strip anything that could escape the destination directory. */
function sanitizeName(name) {
  return path
    .basename(name)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 120);
}

module.exports = { isImageFile, ensureDir, removeDir, safeUnlink, sanitizeName, IMAGE_EXTENSIONS };
