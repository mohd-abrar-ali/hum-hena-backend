const express = require('express');
const router = express.Router();
const dbPool = require('../db');

// Example admin-only route
router.get('/dashboard', async (req, res) => {
  try {
    // Complex query for dashboard analytics
    const [users] = await dbPool.query('SELECT COUNT(*) as count FROM users');
    const [jobs] = await dbPool.query('SELECT COUNT(*) as count FROM jobs');
    const [workers] = await dbPool.query('SELECT COUNT(*) as count FROM workers');
    
    res.json({
      usersCount: users[0].count,
      jobsCount: jobs[0].count,
      workersCount: workers[0].count,
    });
  } catch (error) {
    res.status(500).send('Error fetching dashboard data');
  }
});

module.exports = router;
