'use strict';

const Product = require('../models/Product');
const UploadBatch = require('../models/UploadBatch');

const TOP_N = 8;

/** Groups by a field, returns the biggest `limit` buckets, folding the tail into "Other". */
async function topBuckets(field, limit) {
  const rows = await Product.aggregate([
    { $match: { [field]: { $nin: ['', null] } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 }, value: { $sum: { $multiply: ['$price', '$stock'] } } } },
    { $sort: { count: -1, _id: 1 } },
  ]);

  const head = rows.slice(0, limit).map((r) => ({ name: r._id, count: r.count, value: r.value }));
  const tail = rows.slice(limit);

  if (tail.length) {
    head.push({
      name: `Other (${tail.length})`,
      count: tail.reduce((sum, r) => sum + r.count, 0),
      value: tail.reduce((sum, r) => sum + r.value, 0),
      isOther: true,
    });
  }
  return head;
}

async function getDashboard(req, res, next) {
  try {
    const [totalsRow] = await Product.aggregate([
      {
        $group: {
          _id: null,
          products: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          inventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
          retailValue: { $sum: { $multiply: ['$mrp', '$stock'] } },
          images: { $sum: { $size: '$images' } },
          avgMargin: { $avg: '$margin' },
          inStock: { $sum: { $cond: [{ $eq: ['$status', 'in_stock'] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] } },
        },
      },
    ]);

    const [subCategories, categories, topBrands, categoryCount, brandCount] = await Promise.all([
      topBuckets('subCategory', TOP_N),
      topBuckets('category', 6),
      topBuckets('brand', 6),
      Product.distinct('category'),
      Product.distinct('brand'),
    ]);

    const [lowStockItems, recentProducts, lastImport] = await Promise.all([
      Product.find({ status: { $in: ['low_stock', 'out_of_stock'] } })
        .sort({ stock: 1, name: 1 })
        .limit(6)
        .select('name sku weight stock status primaryImage brand')
        .lean(),
      Product.find()
        .sort({ createdAt: -1, srNo: 1 })
        .limit(6)
        .select('name sku weight price mrp primaryImage category createdAt')
        .lean(),
      UploadBatch.findOne({ status: 'completed' }).sort({ createdAt: -1 }).lean(),
    ]);

    const totals = totalsRow || {
      products: 0, totalStock: 0, inventoryValue: 0, retailValue: 0,
      images: 0, avgMargin: 0, inStock: 0, lowStock: 0, outOfStock: 0,
    };

    return res.json({
      success: true,
      data: {
        totals: {
          products: totals.products,
          totalStock: totals.totalStock,
          inventoryValue: Math.round(totals.inventoryValue || 0),
          retailValue: Math.round(totals.retailValue || 0),
          potentialSavings: Math.round((totals.retailValue || 0) - (totals.inventoryValue || 0)),
          images: totals.images,
          avgMargin: Number((totals.avgMargin || 0).toFixed(2)),
          inStock: totals.inStock,
          lowStock: totals.lowStock,
          outOfStock: totals.outOfStock,
          categories: categoryCount.filter(Boolean).length,
          brands: brandCount.filter(Boolean).length,
        },
        subCategories,
        categories,
        topBrands,
        lowStockItems,
        recentProducts,
        lastImport: lastImport
          ? {
              id: lastImport._id,
              excelFile: lastImport.excelFile,
              zipFile: lastImport.zipFile,
              totalRows: lastImport.totalRows,
              productsCreated: lastImport.productsCreated,
              imagesLinked: lastImport.imagesLinked,
              warnings: lastImport.warnings,
              durationMs: lastImport.durationMs,
              createdAt: lastImport.createdAt,
            }
          : null,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getDashboard };
