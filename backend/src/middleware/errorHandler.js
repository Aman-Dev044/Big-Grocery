'use strict';

const multer = require('multer');
const { NODE_ENV } = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than the allowed upload limit' : err.message;
    return res.status(400).json({ success: false, message });
  }

  const status = err.status || 400;
  console.error('[error]', err.message);
  return res.status(status).json({
    success: false,
    message: err.message || 'Something went wrong',
    ...(NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
