'use strict';

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { TMP_DIR, MAX_UPLOAD_MB } = require('../config/env');
const { ensureDir } = require('../utils/fsx');

ensureDir(TMP_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const ALLOWED = {
  excel: ['.xlsx', '.xls'],
  zip: ['.zip'],
};

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ALLOWED[file.fieldname];
  if (!allowed) return cb(new Error(`Unexpected field "${file.fieldname}"`));
  if (!allowed.includes(ext)) {
    return cb(new Error(`"${file.fieldname}" must be one of: ${allowed.join(', ')}`));
  }
  return cb(null, true);
}

const uploadBulk = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 2 },
}).fields([
  { name: 'excel', maxCount: 1 },
  { name: 'zip', maxCount: 1 },
]);

module.exports = { uploadBulk };
