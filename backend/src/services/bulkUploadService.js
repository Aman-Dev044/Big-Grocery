'use strict';

const path = require('path');
const Product = require('../models/Product');
const UploadBatch = require('../models/UploadBatch');
const { parseExcel } = require('./excelService');
const { extractImagesByFolder } = require('./zipService');
const { generateSku, generateBarcode } = require('../utils/codes');
const { ensureDir, removeDir, safeUnlink } = require('../utils/fsx');
const { STORAGE_DIR, PUBLIC_BASE_URL } = require('../config/env');

/** Public URL for a stored image: /static/<batchId>/<srNo>/<filename> */
function buildImageUrl(batchId, srNo, filename) {
  return `${PUBLIC_BASE_URL}/static/${batchId}/${srNo}/${encodeURIComponent(filename)}`;
}

/**
 * Core pipeline: parse the Excel, unzip the images, then join the two on
 * SR. NO. === zip folder number, and persist one Product per Excel row.
 */
async function processBulkUpload({ excelPath, zipPath, excelName, zipName, replaceExisting }) {
  const startedAt = Date.now();

  const batch = await UploadBatch.create({
    excelFile: excelName,
    zipFile: zipName,
    status: 'processing',
  });

  const batchDir = path.join(STORAGE_DIR, String(batch._id));

  try {
    const { rows, unknownHeaders } = await parseExcel(excelPath);
    if (rows.length === 0) throw new Error('No product rows found in the Excel file');

    ensureDir(batchDir);
    const { byFolder, skipped } = extractImagesByFolder(zipPath, batchDir);

    const warnings = [];
    if (unknownHeaders.length) {
      warnings.push(`Ignored unrecognised Excel columns: ${unknownHeaders.join(', ')}`);
    }
    if (skipped.length) {
      warnings.push(`Skipped ${skipped.length} non-image or unmapped file(s) in the zip`);
    }

    const seed = Number(String(batch._id).slice(-6).replace(/[^0-9]/g, '') || 0);
    const rowsWithoutImages = [];
    let imagesLinked = 0;

    const docs = rows.map((row) => {
      const files = byFolder.get(row.srNo) || [];
      if (files.length === 0) rowsWithoutImages.push(row.srNo);
      imagesLinked += files.length;

      const images = files.map((file, index) => ({
        filename: file.filename,
        url: buildImageUrl(batch._id, row.srNo, file.filename),
        path: path.relative(STORAGE_DIR, file.path).split(path.sep).join('/'),
        size: file.size,
        isPrimary: index === 0, // first file after natural sort = thumbnail
        order: index,
      }));

      return {
        srNo: row.srNo,
        sku: row.sku || generateSku(row.brand, row.name, row.srNo),
        barcode: row.barcode || generateBarcode(row.srNo, seed),
        name: row.name,
        description: row.description,
        category: row.category,
        subCategory: row.subCategory,
        subSubCategory: row.subSubCategory,
        brand: row.brand,
        mrp: row.mrp,
        price: row.price,
        weight: row.weight,
        stock: row.stock,
        deliveryCharge: row.deliveryCharge,
        slabs: row.slabs,
        images,
        batchId: batch._id,
        sourceRow: row.excelRow,
      };
    });

    if (replaceExisting) {
      const oldBatches = await UploadBatch.find({ _id: { $ne: batch._id } }, '_id').lean();
      await Product.deleteMany({ batchId: { $ne: batch._id } });
      oldBatches.forEach((old) => removeDir(path.join(STORAGE_DIR, String(old._id))));
      await UploadBatch.deleteMany({ _id: { $ne: batch._id } });
    }

    // `create` (not insertMany) so the pre-validate hook sets status/margin/primaryImage.
    const created = await Product.create(docs);

    const excelSrNos = new Set(rows.map((r) => r.srNo));
    const unmatchedFolders = [...byFolder.keys()].filter((f) => !excelSrNos.has(f));
    if (unmatchedFolders.length) {
      warnings.push(`Zip folders with no matching SR. NO.: ${unmatchedFolders.join(', ')}`);
    }
    if (rowsWithoutImages.length) {
      warnings.push(`Products with no images: SR. NO. ${rowsWithoutImages.join(', ')}`);
    }

    batch.set({
      status: 'completed',
      totalRows: rows.length,
      productsCreated: created.length,
      imagesLinked,
      zipFolders: [...byFolder.keys()].sort((a, b) => a - b),
      unmatchedFolders,
      rowsWithoutImages,
      warnings,
      durationMs: Date.now() - startedAt,
    });
    await batch.save();

    return batch;
  } catch (err) {
    removeDir(batchDir);
    batch.set({ status: 'failed', error: err.message, durationMs: Date.now() - startedAt });
    await batch.save();
    throw err;
  } finally {
    safeUnlink(excelPath);
    safeUnlink(zipPath);
  }
}

module.exports = { processBulkUpload, buildImageUrl };
