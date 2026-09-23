'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const UploadBatch = require('../models/UploadBatch');
const { STORAGE_DIR } = require('../config/env');
const { removeDir, safeUnlink } = require('../utils/fsx');

const SORTABLE = new Set(['srNo', 'name', 'price', 'stock', 'createdAt', 'updatedAt']);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const { search, category, brand, status } = req.query;

    const filter = {};
    if (search) {
      const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ name: rx }, { sku: rx }, { barcode: rx }, { brand: rx }];
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (status) filter.status = status;

    const sortField = SORTABLE.has(req.query.sortBy) ? req.query.sortBy : 'srNo';
    const sortDir = req.query.order === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { $or: [{ sku: id }, { srNo: Number(id) || -1 }] };

    const product = await Product.findOne(query).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const [total, inStock, lowStock, outOfStock, categories, brands] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'in_stock' }),
      Product.countDocuments({ status: 'low_stock' }),
      Product.countDocuments({ status: 'out_of_stock' }),
      Product.distinct('category'),
      Product.distinct('brand'),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        active: inStock + lowStock,
        inStock,
        lowStock,
        outOfStock,
        hidden: 0,
        categories: categories.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort(),
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Removes the image files belonging to the given products.
 * `image.path` is stored relative to STORAGE_DIR; anything that tries to climb
 * out of it is ignored rather than followed.
 */
function removeImageFiles(products) {
  let removed = 0;

  products.forEach((product) => {
    (product.images || []).forEach((image) => {
      if (!image.path) return;
      const target = path.resolve(STORAGE_DIR, image.path);
      if (!target.startsWith(path.resolve(STORAGE_DIR) + path.sep)) return;
      if (!fs.existsSync(target)) return;
      safeUnlink(target);
      removed += 1;
    });
  });

  return removed;
}

/** Deletes the products whose ids are posted in the body, plus their images. */
async function deleteProducts(req, res, next) {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const valid = ids.filter((id) => mongoose.isValidObjectId(id));

    if (valid.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid product ids were provided' });
    }

    const products = await Product.find({ _id: { $in: valid } }, 'images').lean();
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'No matching products found' });
    }

    const imagesRemoved = removeImageFiles(products);
    const { deletedCount } = await Product.deleteMany({ _id: { $in: valid } });

    return res.json({
      success: true,
      message: `${deletedCount} product${deletedCount === 1 ? '' : 's'} deleted`,
      data: { deletedCount, imagesRemoved },
    });
  } catch (err) {
    return next(err);
  }
}

/** Wipes the whole catalogue: every product, every extracted image, every batch. */
async function deleteAllProducts(req, res, next) {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      return res.json({
        success: true,
        message: 'The catalogue is already empty',
        data: { deletedCount: 0, batchesRemoved: 0 },
      });
    }

    const { deletedCount } = await Product.deleteMany({});

    // Every batch folder under storage/ holds only extracted product images.
    let batchesRemoved = 0;
    if (fs.existsSync(STORAGE_DIR)) {
      fs.readdirSync(STORAGE_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .forEach((entry) => {
          removeDir(path.join(STORAGE_DIR, entry.name));
          batchesRemoved += 1;
        });
    }
    await UploadBatch.deleteMany({});

    return res.json({
      success: true,
      message: `All ${deletedCount} products deleted`,
      data: { deletedCount, batchesRemoved },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listProducts, getProduct, getStats, deleteProducts, deleteAllProducts };
