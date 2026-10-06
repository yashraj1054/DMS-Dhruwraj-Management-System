const Bill = require('../models/Bill');
const Clinic = require('../models/Clinic');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
  try {
    const { selectedClinicId } = req.query;

    // --- 1. GLOBAL SYSTEM SUMMARY (Total across all clinics) ---
    const totalSalesAgg = await Bill.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
    const totalExpAgg = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    
    const systemSummary = {
      totalSales: totalSalesAgg[0]?.total || 0,
      netProfit: (totalSalesAgg[0]?.total || 0) - (totalExpAgg[0]?.total || 0),
      totalClinics: await Clinic.countDocuments(),
      totalStaff: await Staff.countDocuments(),
      totalPatients: await Patient.countDocuments()
    };

    // --- 2. BRANCH SPECIFIC DETAIL ---
    let clinicDetail = { staffCount: 0, patientCount: 0, sales: 0, expense: 0, netProfit: 0 };

    if (selectedClinicId && selectedClinicId !== "null") {
      // UNIVERSAL MATCHER: Handle both String and ObjectId formats to fix ₹0 issue
      const queryId = mongoose.Types.ObjectId.isValid(selectedClinicId) 
        ? new mongoose.Types.ObjectId(selectedClinicId) 
        : selectedClinicId;

      const branchSales = await Bill.aggregate([
        { $match: { $or: [{ clinicId: queryId }, { clinicId: selectedClinicId }] } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);

      const branchExp = await Expense.aggregate([
        { $match: { $or: [{ clinicId: queryId }, { clinicId: selectedClinicId }] } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const sales = branchSales[0]?.total || 0;
      const expense = branchExp[0]?.total || 0;

      clinicDetail = {
        staffCount: await Staff.countDocuments({ 
          $or: [{ clinic: queryId }, { clinicId: queryId }, { clinic: selectedClinicId }] 
        }),
        patientCount: await Patient.countDocuments({ 
          $or: [{ clinic: queryId }, { clinicId: queryId }, { clinic: selectedClinicId }] 
        }),
        sales: sales,
        expense: expense,
        netProfit: sales - expense // Calculated Branch Profit
      };
    }

    res.status(200).json({ systemSummary, clinicDetail });
  } catch (error) {
    console.error("Dashboard Aggregation Error:", error);
    res.status(500).json({ message: error.message });
  }
};