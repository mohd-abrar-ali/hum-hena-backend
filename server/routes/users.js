const express = require('express');
const router = express.Router();
const dbPool = require('../db');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.uid]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching user profile');
  }
});

// Create/update user profile
router.post('/profile', async (req, res) => {
  const { name, email } = req.body;
  const { uid } = req.user;

  try {
    // Check if user exists
    const [existing] = await dbPool.query('SELECT * FROM users WHERE id = ?', [uid]);

    if (existing.length > 0) {
      // Update existing user
      await dbPool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, uid]);
      res.send('Profile updated');
    } else {
      // Create new user
      await dbPool.query('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)', [uid, name, email, 'USER']);
      res.status(201).send('Profile created');
    }
  } catch (error) {
    res.status(500).send('Error saving user profile');
  }
});

module.exports = router;
