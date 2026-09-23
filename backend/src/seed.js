'use strict';

/** Standalone seeder: `npm run seed`. The server also seeds on boot. */

const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const { ensureSeedAdmin } = require('./services/authService');

(async () => {
  try {
    await connectDB();
    const admin = await ensureSeedAdmin();
    console.log('[seed] done ->', admin.email);
  } catch (err) {
    console.error('[seed] failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
