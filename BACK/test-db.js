const { connectDB } = require('./database/connection');
const { initializeTables } = require('./database/init');

async function testConnection() {
  console.log('Testing database connection...\n');
  
  try {
    console.log('1. Connecting to database...');
    const pool = await connectDB();
    console.log('✓ Connected successfully\n');

    console.log('2. Initializing tables...');
    await initializeTables(pool);
    console.log('✓ Tables initialized successfully\n');

    console.log('3. Testing query...');
    const [services] = await pool.execute('SELECT COUNT(*) as count FROM Services');
    console.log(`✓ Services count: ${services[0].count}\n`);

    console.log('✓ All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testConnection();
