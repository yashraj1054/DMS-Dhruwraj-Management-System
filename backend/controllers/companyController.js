const Company = require('../models/Company');


// ==========================================
// CREATE COMPANY
// ==========================================
exports.createCompany = async (req, res) => {

  try {

    const {
      companyName,
      mrName,
      mrPhone,
      discount
    } = req.body;

    const existingCompany =
      await Company.findOne({
        companyName
      });

    if (existingCompany) {

      return res.status(400).json({
        message: 'Company already exists'
      });
    }

    const company = await Company.create({
      companyName,
      mrName,
      mrPhone,
      discount
    });

    res.status(201).json({
      success: true,
      company
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// GET ALL COMPANIES
// ==========================================
exports.getCompanies = async (req, res) => {

  try {

    const companies = await Company.find()
      .sort({ createdAt: -1 });

    // STATS
    const stats = {

      totalBusiness:
        companies.reduce(
          (acc, item) =>
            acc + (item.totalBusiness || 0),
          0
        ),

      totalDue:
        companies.reduce(
          (acc, item) =>
            acc + (item.balanceDue || 0),
          0
        )
    };

    res.status(200).json({
      success: true,
      companies,
      stats
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// UPDATE PAYMENT
// ==========================================
exports.updatePayment = async (req, res) => {

  try {

    const { companyId } = req.params;

    const { amount } = req.body;

    const company = await Company.findById(
      companyId
    );

    if (!company) {

      return res.status(404).json({
        message: 'Company not found'
      });
    }

    company.totalPaid += Number(amount);

    company.balanceDue -= Number(amount);

    await company.save();

    res.status(200).json({
      success: true,
      company
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


exports.updateCompany = async (req, res) => {

  try {

    const { companyId } = req.params;

    const {
      companyName,
      mrName,
      mrPhone,
      discount,
      totalPaid
    } = req.body;

    const company =
      await Company.findById(companyId);

    if (!company) {

      return res.status(404).json({
        message: "Company not found",
      });
    }

    // CALCULATE BUSINESS
    const ledger =
      await InventoryLedger.find({
        companyId,
      });

    const totalBusiness =
      ledger.reduce(
        (acc, item) =>
          acc + item.totalAmount,
        0
      );

    const balanceDue =
      totalBusiness - Number(totalPaid);

    company.companyName =
      companyName;

    company.mrName = mrName;

    company.mrPhone = mrPhone;

    company.discount = discount;

    company.totalPaid =
      Number(totalPaid);

    company.totalBusiness =
      totalBusiness;

    company.balanceDue =
      balanceDue;

    await company.save();

    res.status(200).json({
      success: true,
      company,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};


exports.deleteCompany = async (
  req,
  res
) => {

  try {

    const { companyId } = req.params;

    await Company.findByIdAndDelete(
      companyId
    );

    await InventoryLedger.deleteMany({
      companyId,
    });

    res.status(200).json({
      success: true,
      message:
        "Company deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};