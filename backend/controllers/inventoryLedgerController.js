const InventoryLedger = require('../models/InventoryLedger');
const Company = require('../models/Company');
// ======================================
// CREATE LEDGER ENTRY
// ======================================
// exports.createLedgerEntry = async (req, res) => {
//   try {

//     const {
//       medicineId,
//       companyName,
//       mrName,
//       date,
//       type,
//       quantity,
//       unitPrice,
//       reason
//     } = req.body;

//     const totalAmount = Number(quantity) * Number(unitPrice);

//     const ledger = await InventoryLedger.create({
//       medicineId,
//       companyName,
//       mrName,
//       date,
//       type,
//       quantity,
//       unitPrice,
//       totalAmount,
//       reason
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Ledger entry created successfully',
//       ledger
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
exports.createLedgerEntry = async (
  req,
  res
) => {

  try {

    const {
      companyId,
      medicineId,
      quantity,
      freeQuantity,
      unitPrice,
      totalAmount,
      invoiceNumber,
      batchNumber,
      paidAmount,
      dueAmount,
      reason,
      type
    } = req.body;

    const entry =
      await InventoryLedger.create({

        companyId,
        medicineId,
        quantity,
        freeQuantity,
        unitPrice,
        totalAmount,
        invoiceNumber,
        batchNumber,
        paidAmount,
        dueAmount,
        reason,
        type
      });

    // UPDATE COMPANY BUSINESS
    const company =
      await Company.findById(companyId);

    if (company) {

      company.totalBusiness +=
        Number(totalAmount);

      company.totalPaid +=
        Number(paidAmount);

      company.balanceDue +=
        Number(dueAmount);

      await company.save();
    }

    res.status(201).json({
      success: true,
      entry
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};
// ======================================
// GET ALL LEDGER ENTRIES
// ======================================
exports.getAllLedgerEntries = async (req, res) => {
  try {

    const {
      search,
      fromDate,
      toDate,
      type
    } = req.query;

    let query = {};

    // SEARCH FILTER
    if (search) {
      query.$or = [
        {
          companyName: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          mrName: {
            $regex: search,
            $options: 'i'
          }
        }
      ];
    }

    // TYPE FILTER
    if (type) {
      query.type = type;
    }

    // DATE FILTER
    if (fromDate && toDate) {

      const start = new Date(fromDate);

      const end = new Date(toDate);

      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end
      };
    }

    const entries = await InventoryLedger.find(query)
      .populate('medicineId', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      entries
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// ======================================
// GET LEDGER OVERVIEW
// ======================================
exports.getLedgerOverview = async (req, res) => {
  try {

    const {
      search,
      fromDate,
      toDate
    } = req.query;

    let query = {};

    // SEARCH FILTER
    if (search) {

      query.$or = [
        {
          companyName: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          mrName: {
            $regex: search,
            $options: 'i'
          }
        }
      ];
    }

    // DATE FILTER
    if (fromDate && toDate) {

      const start = new Date(fromDate);

      const end = new Date(toDate);

      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end
      };
    }

    // TOTAL STATS
    const stats = await InventoryLedger.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: null,

          totalValue: {
            $sum: '$totalAmount'
          },

          totalQty: {
            $sum: '$quantity'
          },

          totalEntries: {
            $sum: 1
          }
        }
      }
    ]);

    // COMPANY SUMMARY
    const companies = await InventoryLedger.aggregate([
      {
        $match: query
      },
      {
        $group: {

          _id: '$companyName',

          mrName: {
            $first: '$mrName'
          },

          lastEntry: {
            $max: '$date'
          },

          totalStockValue: {
            $sum: '$totalAmount'
          },

          totalQuantity: {
            $sum: '$quantity'
          }
        }
      },
      {
        $sort: {
          lastEntry: -1
        }
      }
    ]);

    res.status(200).json({
      success: true,

      stats: stats[0] || {
        totalValue: 0,
        totalQty: 0,
        totalEntries: 0
      },

      companies
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// ======================================
// GET COMPANY HISTORY
// ======================================
exports.getCompanyHistory = async (req, res) => {
  try {

    const { companyName } = req.params;

    const history = await InventoryLedger.find({
      companyName
    })
      .populate('medicineId', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ======================================
// DELETE LEDGER ENTRY
// ======================================
exports.deleteLedgerEntry = async (req, res) => {
  try {

    const ledger = await InventoryLedger.findById(req.params.id);

    if (!ledger) {

      return res.status(404).json({
        success: false,
        message: 'Ledger entry not found'
      });
    }

    await ledger.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Ledger entry deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};