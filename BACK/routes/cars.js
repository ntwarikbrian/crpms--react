const express = require('express');
const router = express.Router();
const { getPool } = require('../database');
const { verifyToken } = require('../middleware');

router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [cars] = await pool.execute('SELECT * FROM Car');
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [cars] = await pool.execute('SELECT * FROM Car WHERE id = ?', [id]);
    
    if (cars.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.json(cars[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', verifyToken, async (req, res) => {
  try {
    const { PlateNumber, Type, Model, ManufacturingYear, DriverPhone, MechanicName } = req.body;

    if (!PlateNumber || !Type || !Model || !ManufacturingYear || !DriverPhone || !MechanicName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO Car (PlateNumber, Type, Model, ManufacturingYear, DriverPhone, MechanicName) VALUES (?, ?, ?, ?, ?, ?)',
      [PlateNumber, Type, Model, Number(ManufacturingYear), DriverPhone, MechanicName]
    );

    res.status(201).json({ 
      message: 'Car added successfully',
      id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Plate number already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { PlateNumber, Type, Model, ManufacturingYear, DriverPhone, MechanicName } = req.body;
    const pool = getPool();

    const [result] = await pool.execute(
      'UPDATE Car SET PlateNumber = ?, Type = ?, Model = ?, ManufacturingYear = ?, DriverPhone = ?, MechanicName = ? WHERE id = ?',
      [PlateNumber, Type, Model, Number(ManufacturingYear), DriverPhone, MechanicName, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
