'use strict';

const mongoose = require('mongoose');
const Product = require('../models/Product');

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

module.exports = { listProducts, getProduct, getStats };
