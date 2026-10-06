// const Bill = require('../models/Bill');
// const Medicine = require('../models/Medicine');
// const Expense = require('../models/Expense'); // Ensure you create this model
// const InventoryLedger = require('../models/InventoryLedger');
// const mongoose = require('mongoose');

// // --- NEW FUNCTION: Save Expense ---
// exports.addExpense = async (req, res) => {
//   try {
//     const { clinicId, title, amount, category, paymentMode, date } = req.body;
    
//     const newExpense = new Expense({
//       clinicId: new mongoose.Types.ObjectId(clinicId),
//       title,
//       amount: Number(amount),
//       category,
//       paymentMode,
//       date: date ? new Date(date) : new Date()
//     });

//     await newExpense.save();
//     res.status(201).json({ message: "Expense recorded successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getFinanceStats = async (req, res) => {
//   try {
//     const { startDate, endDate, clinicId } = req.query;
//     const cId = new mongoose.Types.ObjectId(clinicId);

//     const dateFilter = { 
//       clinicId: cId, 
//       createdAt: { $gte: new Date(startDate), $lte: new Date(endDate + "T23:59:59.999Z") } 
//     };

//     const expenseDateFilter = { 
//       clinicId: cId, 
//       date: { $gte: new Date(startDate), $lte: new Date(endDate + "T23:59:59.999Z") } 
//     };

//     // 1. Sales Aggregation
//     const salesStats = await Bill.aggregate([
//       { $match: dateFilter },
//       { $group: {
//           _id: null,
//           totalSales: { $sum: "$totalAmount" },
//           consultation: { $sum: "$breakdown.consultationTotal" },
//           medicines: { $sum: "$breakdown.medicineTotal" },
//           therapy: { $sum: "$breakdown.therapyTotal" },
//           upiSales: { $sum: { $cond: [{ $eq: ["$paymentMethod", "UPI"] }, "$totalAmount", 0] } },
//           cashSales: { $sum: { $cond: [{ $eq: ["$paymentMethod", "Cash"] }, "$totalAmount", 0] } }
//       }}
//     ]);

//     // 2. Expense Aggregation
//     const expenseStats = await Expense.aggregate([
//       { $match: expenseDateFilter },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);

//     const inventoryHistory = await InventoryLedger.find({
//   clinicId: cId,
//   date: {
//     $gte: new Date(startDate),
//     $lte: new Date(endDate + "T23:59:59.999Z")
//   }
// }).lean();

//     // 3. COMBINED HISTORY (Fetch both and merge)
//     const salesHistory = await Bill.find(dateFilter).lean();
//     const expenseHistory = await Expense.find(expenseDateFilter).lean();

//     // Merge and Sort by Date
//     const combinedHistory = [
//   ...salesHistory,
//   ...expenseHistory,
//   ...inventoryHistory
// ].sort((a, b) => {
//   const dateA = a.createdAt || a.date;
//   const dateB = b.createdAt || b.date;
//   return new Date(dateB) - new Date(dateA);
// });

//     res.status(200).json({
//       summary: salesStats[0] || { totalSales: 0, consultation: 0, medicines: 0, therapy: 0, upiSales: 0, cashSales: 0 },
//       totalExpenses: expenseStats[0]?.total || 0,
//       history: combinedHistory 
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.addInventoryStock = async (req, res) => {
//   try {
//     const {
//       clinicId,
//       medicineId,
//       medicineName,
//       quantity,
//       purchasePrice,
//       mrp,
//       supplier,
//       invoiceNo,
//       paymentMode,
//       batchNo,
//       date
//     } = req.body;

//     // SAVE LEDGER ENTRY
//     const ledger = new InventoryLedger({
//       clinicId,
//       medicineId,
//       medicineName,
//       quantity,
//       purchasePrice,
//       mrp,
//       supplier,
//       invoiceNo,
//       paymentMode,
//       batchNo,
//       date,
//       type: 'IN'
//     });

//     await ledger.save();

//     // UPDATE INVENTORY
//     const existingMedicine = await Medicine.findOne({
//       _id: medicineId,
//       clinicId
//     });

//     if (existingMedicine) {
//       existingMedicine.stock =
//         (existingMedicine.stock || 0) + Number(quantity);

//       existingMedicine.purchasePrice = purchasePrice;
//       existingMedicine.mrp = mrp;

//       await existingMedicine.save();
//     }

//     res.status(201).json({
//       message: 'Stock added successfully'
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };


const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const Expense = require('../models/Expense');
const InventoryLedger = require('../models/InventoryLedger');

const mongoose = require('mongoose');

// =======================================
// ADD EXPENSE
// =======================================

exports.addExpense = async (req, res) => {
  try {
    const {
      clinicId,
      title,
      amount,
      category,
      paymentMode,
      date
    } = req.body;

    const newExpense = new Expense({
      clinicId: new mongoose.Types.ObjectId(clinicId),
      title,
      amount: Number(amount),
      category,
      paymentMode,
      date: date ? new Date(date) : new Date()
    });

    await newExpense.save();

    res.status(201).json({
      message: 'Expense recorded successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// =======================================
// ADD INVENTORY STOCK
// =======================================

exports.addInventoryStock = async (req, res) => {
  try {

    const {
      clinicId,
      medicineId,
      medicineName,
      quantity,
      purchasePrice,
      mrp,
      supplier,
      invoiceNo,
      paymentMode,
      batchNo,
      date
    } = req.body;

    // =========================
    // SAVE LEDGER ENTRY
    // =========================

    const ledger = new InventoryLedger({
      clinicId: new mongoose.Types.ObjectId(clinicId),
      medicineId: new mongoose.Types.ObjectId(medicineId),
      medicineName,
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      mrp: Number(mrp),
      supplier,
      invoiceNo,
      paymentMode,
      batchNo,
      date: date ? new Date(date) : new Date(),
      type: 'IN'
    });

    await ledger.save();

    // =========================
    // UPDATE MEDICINE STOCK
    // =========================

    const medicine = await Medicine.findOne({
      _id: medicineId,
      clinicId
    });

    if (!medicine) {
      return res.status(404).json({
        message: 'Medicine not found'
      });
    }

    medicine.stock =
      (medicine.stock || 0) + Number(quantity);

    medicine.purchasePrice = Number(purchasePrice);
    medicine.mrp = Number(mrp);

    await medicine.save();

    res.status(201).json({
      message: 'Stock added successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// =======================================
// GET FINANCE STATS
// =======================================

exports.getFinanceStats = async (req, res) => {
  try {

    const {
      startDate,
      endDate,
      clinicId
    } = req.query;

    const cId = new mongoose.Types.ObjectId(clinicId);

    // =========================
    // DATE FILTERS
    // =========================

    const salesFilter = {
      clinicId: cId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z")
      }
    };

    const expenseFilter = {
      clinicId: cId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z")
      }
    };

    // =========================
    // SALES SUMMARY
    // =========================

    const salesStats = await Bill.aggregate([
      {
        $match: salesFilter
      },
      {
        $group: {
          _id: null,

          totalSales: {
            $sum: "$totalAmount"
          },

          consultation: {
            $sum: "$breakdown.consultationTotal"
          },

          medicines: {
            $sum: "$breakdown.medicineTotal"
          },

          therapy: {
            $sum: "$breakdown.therapyTotal"
          },

          upiSales: {
            $sum: {
              $cond: [
                { $eq: ["$paymentMethod", "UPI"] },
                "$totalAmount",
                0
              ]
            }
          },

          cashSales: {
            $sum: {
              $cond: [
                { $eq: ["$paymentMethod", "Cash"] },
                "$totalAmount",
                0
              ]
            }
          }
        }
      }
    ]);

    // =========================
    // EXPENSE SUMMARY
    // =========================

    const expenseStats = await Expense.aggregate([
      {
        $match: expenseFilter
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount"
          }
        }
      }
    ]);

    // =========================
    // INVENTORY PURCHASE SUMMARY
    // =========================

    const inventoryStats = await InventoryLedger.aggregate([
      {
        $match: expenseFilter
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: [
                "$quantity",
                "$purchasePrice"
              ]
            }
          }
        }
      }
    ]);

    // =========================
    // HISTORY
    // =========================

    const salesHistory =
      await Bill.find(salesFilter).lean();

    const expenseHistory =
      await Expense.find(expenseFilter).lean();

    const inventoryHistory =
      await InventoryLedger.find(expenseFilter).lean();

    // =========================
    // COMBINED LEDGER
    // =========================

    const combinedHistory = [
      ...salesHistory,
      ...expenseHistory,
      ...inventoryHistory
    ].sort((a, b) => {

      const dateA = a.createdAt || a.date;
      const dateB = b.createdAt || b.date;

      return new Date(dateB) - new Date(dateA);

    });

    res.status(200).json({

      summary:
        salesStats[0] || {
          totalSales: 0,
          consultation: 0,
          medicines: 0,
          therapy: 0,
          upiSales: 0,
          cashSales: 0
        },

      totalExpenses:
        expenseStats[0]?.total || 0,

      inventoryPurchaseTotal:
        inventoryStats[0]?.total || 0,

      history: combinedHistory
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};