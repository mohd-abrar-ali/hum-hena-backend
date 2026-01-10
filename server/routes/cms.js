const express = require('express');
const router = express.Router();
const dbPool = require('../db');


// Get all CMS content
router.get('/', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT * FROM cms_content');
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error fetching CMS content');
    }
});

// Get specific CMS content by key
router.get('/:key', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT * FROM cms_content WHERE content_key = ?', [req.params.key]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Content not found');
        }
    } catch (error) {
        res.status(500).send('Error fetching CMS content');
    }
});

// Update CMS content
router.put('/:key', async (req, res) => {
    // This should be protected by admin middleware
    const { content_value } = req.body;
    try {
        await dbPool.query('UPDATE cms_content SET content_value = ? WHERE content_key = ?', [content_value, req.params.key]);
        res.send('Content updated successfully');
    } catch (error) {
        res.status(500).send('Error updating CMS content');
    }
});

module.exports = router;
