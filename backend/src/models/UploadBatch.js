'use strict';

const mongoose = require('mongoose');

const UploadBatchSchema = new mongoose.Schema(
  {
    excelFile: { type: String, default: '' },
    zipFile: { type: String, default: '' },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    totalRows: { type: Number, default: 0 },
    productsCreated: { type: Number, default: 0 },
    imagesLinked: { type: Number, default: 0 },
    zipFolders: { type: [Number], default: [] },
    unmatchedFolders: { type: [Number], default: [] },
    rowsWithoutImages: { type: [Number], default: [] },
    warnings: { type: [String], default: [] },
    error: { type: String, default: '' },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UploadBatch', UploadBatchSchema);
