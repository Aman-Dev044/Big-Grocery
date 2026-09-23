'use strict';

const UploadBatch = require('../models/UploadBatch');
const { processBulkUpload } = require('../services/bulkUploadService');
const { safeUnlink } = require('../utils/fsx');

async function bulkUpload(req, res, next) {
  const excel = req.files?.excel?.[0];
  const zip = req.files?.zip?.[0];

  if (!excel || !zip) {
    if (excel) safeUnlink(excel.path);
    if (zip) safeUnlink(zip.path);
    return res.status(400).json({
      success: false,
      message: 'Both files are required: "excel" (.xlsx/.xls) and "zip" (.zip)',
    });
  }

  try {
    const batch = await processBulkUpload({
      excelPath: excel.path,
      zipPath: zip.path,
      excelName: excel.originalname,
      zipName: zip.originalname,
      replaceExisting: String(req.body.replaceExisting ?? 'true') === 'true',
    });

    return res.status(201).json({
      success: true,
      message: `${batch.productsCreated} products imported, ${batch.imagesLinked} images mapped`,
      data: {
        batchId: batch._id,
        totalRows: batch.totalRows,
        productsCreated: batch.productsCreated,
        imagesLinked: batch.imagesLinked,
        zipFolders: batch.zipFolders.length,
        unmatchedFolders: batch.unmatchedFolders,
        rowsWithoutImages: batch.rowsWithoutImages,
        warnings: batch.warnings,
        durationMs: batch.durationMs,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function listBatches(req, res, next) {
  try {
    const batches = await UploadBatch.find().sort({ createdAt: -1 }).limit(20).lean();
    return res.json({ success: true, data: batches });
  } catch (err) {
    return next(err);
  }
}

module.exports = { bulkUpload, listBatches };
