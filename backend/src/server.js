'use strict';

const app = require('./app');
const { connectDB } = require('./config/db');
const { ensureSeedAdmin } = require('./services/authService');
const { PORT } = require('./config/env');

async function start() {
  try {
    await connectDB();
    await ensureSeedAdmin();

    app.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}`);
      console.log(`[server] API base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  }
}

start();
