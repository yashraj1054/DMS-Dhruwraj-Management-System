const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  createCompany,
  getCompanies,
  updatePayment,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');


// ==========================================
// CREATE COMPANY
// ==========================================
router.post(
  '/',
  protect,
  createCompany
);


// ==========================================
// GET ALL COMPANIES
// ==========================================
router.get(
  '/',
  protect,
  getCompanies
);


// ==========================================
// UPDATE PAYMENT
// ==========================================
router.put(
  '/payment/:companyId',
  protect,
  updatePayment
);

router.put(
  "/:companyId",
  protect,
  updateCompany
);

router.delete(
  "/:companyId",
  protect,
  deleteCompany
);


module.exports = router;