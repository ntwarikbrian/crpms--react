const { connectDB, getPool } = require('./connection');
const { initializeTables } = require('./init');

async function setupDatabase() {
  const pool = await connectDB();
  await initializeTables(pool);
  return pool;
}

module.exports = { setupDatabase, getPool };
