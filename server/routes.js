const express = require('express');
const path = require('path');
const router = express.Router();

// Serve static files from the client directory
router.use(express.static(path.join(__dirname, '../client')));

// Fallback to index.html for SPA behavior
router.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = router;
