const express = require('express');
const router = express.Router();
const { getPool } = require('../database');
const { verifyToken } = require('../middleware');


router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [records] = await pool.execute(`
      SELECT sr.*, c.PlateNumber, c.Model, s.ServiceName, s.ServicePrice
      FROM ServiceRecord sr
      LEFT JOIN Car c ON sr.CarId = c.id
      LEFT JOIN Services s ON sr.ServiceId = s.id
      ORDER BY sr.ServiceDate DESC
    `);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [records] = await pool.execute(`
      SELECT sr.*, c.PlateNumber, c.Model, s.ServiceName, s.ServicePrice
      FROM ServiceRecord sr
      LEFT JOIN Car c ON sr.CarId = c.id
      LEFT JOIN Services s ON sr.ServiceId = s.id
      WHERE sr.id = ?
    `, [id]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Service record not found' });
    }
    
    res.json(records[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { RecordNumber, ServiceDate, CarId, ServiceId, Description } = req.body;

    if (!RecordNumber || !ServiceDate || !CarId || !ServiceId) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const pool = getPool();
    
    const [cars] = await pool.execute('SELECT * FROM Car WHERE id = ?', [CarId]);
    const [services] = await pool.execute('SELECT * FROM Services WHERE id = ?', [ServiceId]);

    if (cars.length === 0 || services.length === 0) {
      return res.status(400).json({ message: 'Invalid car or service ID' });
    }

    const [result] = await pool.execute(
      `INSERT INTO ServiceRecord (RecordNumber, CarId, ServiceId, ServiceDate, Description, Status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [RecordNumber, CarId, ServiceId, ServiceDate, Description || '', 'pending']
    );

    res.status(201).json({ 
      message: 'Service record created successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { RecordNumber, ServiceDate, CarId, ServiceId, Description, Status } = req.body;
    const pool = getPool();

    if (CarId) {
      const [cars] = await pool.execute('SELECT * FROM Car WHERE id = ?', [CarId]);
      if (cars.length === 0) {
        return res.status(400).json({ message: 'Invalid car ID' });
      }
    }
    
    if (ServiceId) {
      const [services] = await pool.execute('SELECT * FROM Services WHERE id = ?', [ServiceId]);
      if (services.length === 0) {
        return res.status(400).json({ message: 'Invalid service ID' });
      }
    }

    const updateParts = [];
    const updateValues = [];

    if (RecordNumber) { updateParts.push('RecordNumber = ?'); updateValues.push(RecordNumber); }
    if (ServiceDate) { updateParts.push('ServiceDate = ?'); updateValues.push(ServiceDate); }
    if (CarId) { updateParts.push('CarId = ?'); updateValues.push(CarId); }
    if (ServiceId) { updateParts.push('ServiceId = ?'); updateValues.push(ServiceId); }
    if (Description !== undefined) { updateParts.push('Description = ?'); updateValues.push(Description); }
    if (Status) { updateParts.push('Status = ?'); updateValues.push(Status); }

    if (updateParts.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(id);
    const query = `UPDATE ServiceRecord SET ${updateParts.join(', ')} WHERE id = ?`;

    const [result] = await pool.execute(query, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    res.json({ message: 'Service record updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [result] = await pool.execute('DELETE FROM ServiceRecord WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    res.json({ message: 'Service record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
