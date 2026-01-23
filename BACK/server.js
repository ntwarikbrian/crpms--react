const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { setupDatabase } = require('./database');


const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const carsRoutes = require('./routes/cars');
const serviceRecordsRoutes = require('./routes/serviceRecords');
const paymentsRoutes = require('./routes/payments');
const reportsRoutes = require('./routes/reports');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/service-records', serviceRecordsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

const startServer = async () => {
  try {
    await setupDatabase();
    
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
