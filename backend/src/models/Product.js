'use strict';

const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

// Bulk pricing slab: buy `quantity` units at `price` each/total, with `margin` %.
const SlabSchema = new mongoose.Schema(
  {
    tier: { type: Number, required: true },
    quantity: { type: Number, default: null },
    price: { type: Number, default: null },
    margin: { type: Number, default: null },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    srNo: { type: Number, required: true, index: true },
    sku: { type: String, required: true, trim: true, index: true },
    barcode: { type: String, default: '', trim: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    category: { type: String, default: '', trim: true },
    subCategory: { type: String, default: '', trim: true },
    subSubCategory: { type: String, default: '', trim: true },
    brand: { type: String, default: '', trim: true },

    mrp: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    weight: { type: String, default: '', trim: true },

    stock: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
      index: true,
    },

    slabs: { type: [SlabSchema], default: [] },
    deliveryCharge: { type: Number, default: 0 },

    images: { type: [ImageSchema], default: [] },
    primaryImage: { type: String, default: '' },

    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadBatch', index: true },
    sourceRow: { type: Number, default: null },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', sku: 'text', barcode: 'text', brand: 'text' });
ProductSchema.index({ batchId: 1, srNo: 1 }, { unique: true });

const LOW_STOCK_THRESHOLD = 10;

ProductSchema.pre('validate', function setDerivedFields(next) {
  if (this.stock <= 0) this.status = 'out_of_stock';
  else if (this.stock <= LOW_STOCK_THRESHOLD) this.status = 'low_stock';
  else this.status = 'in_stock';

  if (this.mrp > 0 && this.price >= 0) {
    this.margin = Number((((this.mrp - this.price) / this.mrp) * 100).toFixed(2));
  }

  const primary = this.images.find((img) => img.isPrimary) || this.images[0];
  this.primaryImage = primary ? primary.url : '';
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
