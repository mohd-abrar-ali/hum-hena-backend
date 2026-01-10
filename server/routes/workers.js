const express = require('express');
const router = express.Router();
const dbPool = require('../db');

// Get all workers
router.get('/', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM workers');
    res.json(rows);
  } catch (error) {
    res.status(500).send('Error fetching workers');
  }
});

module.exports = router;
