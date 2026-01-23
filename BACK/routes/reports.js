const express = require('express');
const router = express.Router();
const { getPool } = require('../database');
const { verifyToken } = require('../middleware');


router.get('/daily', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    
    const [payments] = await pool.execute(`
      SELECT 
        DATE(p.PaymentDate) as paymentDate,
        c.id as carId,
        c.PlateNumber,
        c.Model,
        s.ServiceName,
        p.AmountPaid,
        p.PaymentDate,
        p.id as paymentId
      FROM Payment p
      JOIN ServiceRecord sr ON p.RecordId = sr.id
      JOIN Car c ON sr.CarId = c.id
      JOIN Services s ON sr.ServiceId = s.id
      ORDER BY p.PaymentDate DESC
    `);

    // Group by date and car
    const grouped = {};
    payments.forEach(payment => {
      const dateKey = payment.paymentDate;
      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }
      if (!grouped[dateKey][payment.carId]) {
        grouped[dateKey][payment.carId] = {
          carDetails: {
            PlateNumber: payment.PlateNumber,
            Model: payment.Model
          },
          services: [],
          amounts: [],
          totalAmount: 0,
          payments: []
        };
      }
      grouped[dateKey][payment.carId].services.push(payment.ServiceName);
      grouped[dateKey][payment.carId].amounts.push(payment.AmountPaid);
      grouped[dateKey][payment.carId].totalAmount += payment.AmountPaid;
      grouped[dateKey][payment.carId].payments.push(payment);
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/bill/:paymentId', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const pool = getPool();

    const [bills] = await pool.execute(`
      SELECT 
        p.*,
        sr.RecordNumber,
        c.PlateNumber,
        c.Model,
        c.DriverPhone,
        c.MechanicName,
        sr.ServiceDate,
        s.ServiceName,
        s.ServicePrice
      FROM Payment p
      JOIN ServiceRecord sr ON p.RecordId = sr.id
      JOIN Car c ON sr.CarId = c.id
      JOIN Services s ON sr.ServiceId = s.id
      WHERE p.id = ?
    `, [paymentId]);

    if (bills.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bills[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [bills] = await pool.execute(`
      SELECT 
        p.*,
        sr.RecordNumber,
        c.PlateNumber,
        c.Model,
        sr.ServiceDate,
        s.ServiceName,
        s.ServicePrice
      FROM Payment p
      JOIN ServiceRecord sr ON p.RecordId = sr.id
      JOIN Car c ON sr.CarId = c.id
      JOIN Services s ON sr.ServiceId = s.id
      ORDER BY p.PaymentDate DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM Payment');

    res.json({
      bills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
