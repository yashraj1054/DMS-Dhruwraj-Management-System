const express = require('express');

const router = express.Router();

const {
  createLedgerEntry,
  getAllLedgerEntries,
  getLedgerOverview,
  getCompanyHistory,
  deleteLedgerEntry
} = require('../controllers/inventoryLedgerController');

const protect = require('../middleware/authMiddleware');


// OVERVIEW
router.get('/overview', protect, getLedgerOverview);


// COMPANY HISTORY
router.get('/company/:companyName', protect, getCompanyHistory);


// GET ALL
router.get('/', protect, getAllLedgerEntries);


// CREATE
router.post('/', protect, createLedgerEntry);


// DELETE
router.delete('/:id', protect, deleteLedgerEntry);


module.exports = router;