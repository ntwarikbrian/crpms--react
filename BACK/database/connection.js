const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;

async function connectDB() {
  try {
    const dbName = process.env.DB_NAME || 'CRPMS';
    
    // First, connect without database to create it
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    const tempConnection = await tempPool.getConnection();
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    tempConnection.release();
    await tempPool.end();

    // Now connect to the database
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('✓ MySQL Connected to CRPMS database');
    return pool;
  } catch (error) {
    console.error('✗ MySQL Connection Error:', error.message);
    process.exit(1);
  }
}

function getPool() {
  return pool;
}

module.exports = { connectDB, getPool };
