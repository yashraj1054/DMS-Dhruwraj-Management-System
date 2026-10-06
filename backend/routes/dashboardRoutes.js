const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// This defines the final part of the URL: /stats
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;