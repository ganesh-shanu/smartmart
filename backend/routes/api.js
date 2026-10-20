
const express = require('express');
const router = express.Router();

// Test API route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmartSaver API is running!'
  });
});

module.exports = router;
