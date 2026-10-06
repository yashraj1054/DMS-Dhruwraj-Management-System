const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// GET analytics
router.get('/stats', financeController.getFinanceStats);

// POST new expense (This fixes the 404 error)
router.post('/expenses', financeController.addExpense);

router.post('/inventory/add-stock', financeController.addInventoryStock);

module.exports = router;