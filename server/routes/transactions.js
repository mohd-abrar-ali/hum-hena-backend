const express = require('express');
const router = express.Router();
const dbPool = require('../db');

// Get all transactions for a user
router.get('/', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM transactions WHERE user_id = ?', [req.user.uid]);
    res.json(rows);
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
});

module.exports = router;
