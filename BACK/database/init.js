const TABLES = require('./schema');

const DEFAULT_SERVICES = [
  ['SR001', 'Engine repair', 150000],
  ['SR002', 'Transmission repair', 80000],
  ['SR003', 'Oil Change', 60000],
  ['SR004', 'Chain replacement', 40000],
  ['SR005', 'Disc replacement', 400000],
  ['SR006', 'Wheel alignment', 5000]
];

async function initializeTables(pool) {
  const connection = await pool.getConnection();

  try {
    await connection.execute(TABLES.USER);
    console.log('✓ User table created');

    await connection.execute(TABLES.CAR);
    console.log('✓ Car table created');

    await connection.execute(TABLES.SERVICES);
    console.log('✓ Services table created');

    await connection.execute(TABLES.SERVICE_RECORD);
    console.log('✓ ServiceRecord table created');

    await connection.execute(TABLES.PAYMENT);
    console.log('✓ Payment table created');

    await insertDefaultServices(connection);
  } catch (error) {
    console.error('Error initializing tables:', error.message);
  } finally {
    connection.release();
  }
}

async function insertDefaultServices(connection) {
  const [services] = await connection.execute('SELECT COUNT(*) as count FROM Services');
  
  if (services[0].count === 0) {
    for (const service of DEFAULT_SERVICES) {
      await connection.execute(
        'INSERT INTO Services (ServiceCode, ServiceName, ServicePrice) VALUES (?, ?, ?)',
        service
      );
    }
    console.log('✓ Default services inserted');
  }
}

module.exports = { initializeTables };
