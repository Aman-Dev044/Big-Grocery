'use strict';

const dns = require('dns');
const mongoose = require('mongoose');
const { MONGODB_URI, DB_NAME, DNS_SERVERS } = require('./env');

/**
 * Node resolves the mongodb+srv:// seedlist through c-ares, which reads the OS
 * nameservers. On machines where that points at a local stub resolver that is
 * down (e.g. 127.0.0.1), every SRV lookup fails with ECONNREFUSED even though
 * the network is fine. DNS_SERVERS lets us point c-ares somewhere reachable.
 */
function applyDnsOverride() {
  if (!DNS_SERVERS.length) return;
  dns.setServers(DNS_SERVERS);
  console.log(`[db] DNS resolvers overridden -> ${DNS_SERVERS.join(', ')}`);
}

async function connectDB() {
  applyDnsOverride();
  mongoose.set('strictQuery', true);

  await mongoose.connect(MONGODB_URI, {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 20000,
  });

  console.log(`[db] connected -> ${DB_NAME}`);
  return mongoose.connection;
}

module.exports = { connectDB };
