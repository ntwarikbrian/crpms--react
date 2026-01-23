const express = require('express');
const router = express.Router();
const { getPool } = require('../database');
const { verifyToken } = require('../middleware');


router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [services] = await pool.execute('SELECT * FROM Services');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [services] = await pool.execute('SELECT * FROM Services WHERE id = ?', [id]);
    
    if (services.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(services[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { ServiceCode, ServiceName, ServicePrice } = req.body;

    if (!ServiceCode || !ServiceName || !ServicePrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO Services (ServiceCode, ServiceName, ServicePrice) VALUES (?, ?, ?)',
      [ServiceCode, ServiceName, Number(ServicePrice)]
    );

    res.status(201).json({ 
      message: 'Service added successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ServiceCode, ServiceName, ServicePrice } = req.body;
    const pool = getPool();

    const [result] = await pool.execute(
      'UPDATE Services SET ServiceCode = ?, ServiceName = ?, ServicePrice = ? WHERE id = ?',
      [ServiceCode, ServiceName, Number(ServicePrice), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
