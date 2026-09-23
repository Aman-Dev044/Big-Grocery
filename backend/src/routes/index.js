'use strict';

const express = require('express');
const { uploadBulk } = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { loginAdmin, me } = require('../controllers/authController');
const { bulkUpload, listBatches } = require('../controllers/uploadController');
const { listProducts, getProduct, getStats } = require('../controllers/productController');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date() }));

// --- Auth ---
router.post('/auth/login', loginAdmin);
router.get('/auth/me', requireAuth, me);

// --- Bulk upload (admin only) ---
router.post('/upload/bulk', requireAuth, uploadBulk, bulkUpload);
router.get('/upload/batches', requireAuth, listBatches);

// --- Catalogue (public) ---
router.get('/products/stats', getStats);
router.get('/products', listProducts);
router.get('/products/:id', getProduct);

module.exports = router;
