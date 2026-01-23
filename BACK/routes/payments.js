const express = require('express');
const router = express.Router();
const { getPool } = require('../database');
const { verifyToken } = require('../middleware');


router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [payments] = await pool.execute(`
      SELECT p.*, sr.RecordNumber, c.PlateNumber, c.Model, sr.ServiceDate
      FROM Payment p
      LEFT JOIN ServiceRecord sr ON p.RecordId = sr.id
      LEFT JOIN Car c ON sr.CarId = c.id
      ORDER BY p.PaymentDate DESC
    `);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [payments] = await pool.execute(`
      SELECT p.*, sr.RecordNumber, c.PlateNumber, c.Model, sr.ServiceDate
      FROM Payment p
      LEFT JOIN ServiceRecord sr ON p.RecordId = sr.id
      LEFT JOIN Car c ON sr.CarId = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payments[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', verifyToken, async (req, res) => {
  try {
    const { AmountPaid, PaymentDate, RecordId, PaymentMethod } = req.body;

    if (!AmountPaid || !PaymentDate || !RecordId) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const pool = getPool();
  
    const [records] = await pool.execute('SELECT * FROM ServiceRecord WHERE id = ?', [RecordId]);

    if (records.length === 0) {
      return res.status(400).json({ message: 'Invalid service record ID' });
    }

    const [result] = await pool.execute(
      `INSERT INTO Payment (RecordId, AmountPaid, PaymentDate, PaymentMethod)
       VALUES (?, ?, ?, ?)`,
      [RecordId, Number(AmountPaid), PaymentDate, PaymentMethod || 'Cash']
    );

    res.status(201).json({ 
      message: 'Payment recorded successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { AmountPaid, PaymentDate, PaymentMethod } = req.body;
    const pool = getPool();

    const updateParts = [];
    const updateValues = [];

    if (AmountPaid) { updateParts.push('AmountPaid = ?'); updateValues.push(Number(AmountPaid)); }
    if (PaymentDate) { updateParts.push('PaymentDate = ?'); updateValues.push(PaymentDate); }
    if (PaymentMethod) { updateParts.push('PaymentMethod = ?'); updateValues.push(PaymentMethod); }

    if (updateParts.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(id);
    const query = `UPDATE Payment SET ${updateParts.join(', ')} WHERE id = ?`;

    const [result] = await pool.execute(query, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
