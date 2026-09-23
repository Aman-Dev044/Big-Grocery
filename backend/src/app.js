'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { STORAGE_DIR, CORS_ORIGIN, NODE_ENV } = require('./config/env');
const { ensureDir } = require('./utils/fsx');

const app = express();

ensureDir(STORAGE_DIR);

app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','), credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (NODE_ENV === 'development') app.use(morgan('dev'));

// Extracted product images
app.use('/static', express.static(STORAGE_DIR, { maxAge: '7d', fallthrough: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
