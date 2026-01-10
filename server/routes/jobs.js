const express = require('express');
const router = express.Router();
const dbPool = require('../db');

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM jobs');
    res.json(rows);
  } catch (error) {
    res.status(500).send('Error fetching jobs');
  }
});

// Get a specific job
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Job not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching job');
  }
});

// Create a new job
router.post('/', async (req, res) => {
    const { title, description, budget, created_by } = req.body;
    try {
        const [result] = await dbPool.query(
            'INSERT INTO jobs (title, description, budget, created_by, status) VALUES (?, ?, ?, ?, ?)',
            [title, description, budget, req.user.uid, 'OPEN']
        );
        res.status(201).json({ id: result.insertId, title, description, budget, created_by: req.user.uid, status: 'OPEN' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating job');
    }
});


module.exports = router;
