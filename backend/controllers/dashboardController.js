// const Bill = require('../models/Bill');
// const Clinic = require('../models/Clinic');
// const Staff = require('../models/Staff');
// const Patient = require('../models/Patient');
// const Expense = require('../models/Expense');
// const mongoose = require('mongoose');

// exports.getDashboardStats = async (req, res) => {
//   try {
//     const { selectedClinicId } = req.query;

//     // --- 1. GLOBAL SYSTEM SUMMARY (Total across all clinics) ---
//     const totalSalesAgg = await Bill.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
//     const totalExpAgg = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    
//     const systemSummary = {
//       totalSales: totalSalesAgg[0]?.total || 0,
//       netProfit: (totalSalesAgg[0]?.total || 0) - (totalExpAgg[0]?.total || 0),
//       totalClinics: await Clinic.countDocuments(),
//       totalStaff: await Staff.countDocuments(),
//       totalPatients: await Patient.countDocuments()
//     };

//     // --- 2. BRANCH SPECIFIC DETAIL ---
//     let clinicDetail = { staffCount: 0, patientCount: 0, sales: 0, expense: 0, netProfit: 0 };

//     if (selectedClinicId && selectedClinicId !== "null") {
//       // UNIVERSAL MATCHER: Handle both String and ObjectId formats to fix ₹0 issue
//       const queryId = mongoose.Types.ObjectId.isValid(selectedClinicId) 
//         ? new mongoose.Types.ObjectId(selectedClinicId) 
//         : selectedClinicId;

//       const branchSales = await Bill.aggregate([
//         { $match: { $or: [{ clinicId: queryId }, { clinicId: selectedClinicId }] } },
//         { $group: { _id: null, total: { $sum: "$totalAmount" } } }
//       ]);

//       const branchExp = await Expense.aggregate([
//         { $match: { $or: [{ clinicId: queryId }, { clinicId: selectedClinicId }] } },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]);

//       const sales = branchSales[0]?.total || 0;
//       const expense = branchExp[0]?.total || 0;

//       clinicDetail = {
//         staffCount: await Staff.countDocuments({ 
//           $or: [{ clinic: queryId }, { clinicId: queryId }, { clinic: selectedClinicId }] 
//         }),
//         patientCount: await Patient.countDocuments({ 
//           $or: [{ clinic: queryId }, { clinicId: queryId }, { clinic: selectedClinicId }] 
//         }),
//         sales: sales,
//         expense: expense,
//         netProfit: sales - expense // Calculated Branch Profit
//       };
//     }

//     res.status(200).json({ systemSummary, clinicDetail });
//   } catch (error) {
//     console.error("Dashboard Aggregation Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

const Bill = require('../models/Bill');
const Clinic = require('../models/Clinic');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
  try {
    const { selectedClinicId } = req.query;

    // =====================================================
    // CURRENT MONTH DATE RANGE
    // =====================================================

    const now = new Date();

    // First day of current month
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

    // Current day until end of today
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    // =====================================================
    // 1. GLOBAL SYSTEM SUMMARY
    // =====================================================

    // -----------------------------------------
    // MONTHLY SALES
    // -----------------------------------------

    const totalSalesAgg = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: monthStart,
            $lte: monthEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ['$totalAmount', 0]
            }
          }
        }
      }
    ]);

    // -----------------------------------------
    // MONTHLY EXPENSES
    // -----------------------------------------

    const totalExpAgg = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: monthStart,
            $lte: monthEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ['$amount', 0]
            }
          }
        }
      }
    ]);

    // -----------------------------------------
    // MONTHLY PATIENT REGISTRATIONS
    // -----------------------------------------

    const monthlyPatients = await Patient.countDocuments({
      createdAt: {
        $gte: monthStart,
        $lte: monthEnd
      }
    });

    // -----------------------------------------
    // CURRENT TOTALS
    // -----------------------------------------

    const totalClinics = await Clinic.countDocuments();

    const totalStaff = await Staff.countDocuments();

    // -----------------------------------------
    // VALUES
    // -----------------------------------------

    const totalSales =
      totalSalesAgg[0]?.total || 0;

    const totalExpenses =
      totalExpAgg[0]?.total || 0;

    const netProfit =
      totalSales - totalExpenses;

    // -----------------------------------------
    // SYSTEM SUMMARY
    // -----------------------------------------

    const systemSummary = {
      totalSales,
      netProfit,
      totalClinics,
      totalStaff,

      // Patients registered during current month
      totalPatients: monthlyPatients
    };

    // =====================================================
    // 2. BRANCH SPECIFIC DETAIL
    // =====================================================

    let clinicDetail = {
      staffCount: 0,
      patientCount: 0,
      sales: 0,
      expense: 0,
      netProfit: 0
    };

    if (
      selectedClinicId &&
      selectedClinicId !== 'null' &&
      selectedClinicId !== 'undefined'
    ) {

      // ===================================================
      // UNIVERSAL CLINIC ID MATCHER
      // ===================================================

      const queryId =
        mongoose.Types.ObjectId.isValid(
          selectedClinicId
        )
          ? new mongoose.Types.ObjectId(
              selectedClinicId
            )
          : selectedClinicId;

      // ===================================================
      // BRANCH SALES — CURRENT MONTH
      // ===================================================

      const branchSales = await Bill.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    clinicId: queryId
                  },
                  {
                    clinicId: selectedClinicId
                  }
                ]
              },
              {
                createdAt: {
                  $gte: monthStart,
                  $lte: monthEnd
                }
              }
            ]
          }
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: {
                $ifNull: [
                  '$totalAmount',
                  0
                ]
              }
            }
          }
        }
      ]);

      // ===================================================
      // BRANCH EXPENSE — CURRENT MONTH
      // ===================================================

      const branchExp = await Expense.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    clinicId: queryId
                  },
                  {
                    clinicId: selectedClinicId
                  }
                ]
              },
              {
                date: {
                  $gte: monthStart,
                  $lte: monthEnd
                }
              }
            ]
          }
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: {
                $ifNull: [
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ]);

      // ===================================================
      // BRANCH PATIENTS — CURRENT MONTH
      // ===================================================

      const branchPatientCount =
        await Patient.countDocuments({
          $and: [
            {
              $or: [
                {
                  clinic: queryId
                },
                {
                  clinicId: queryId
                },
                {
                  clinic: selectedClinicId
                }
              ]
            },

            {
              createdAt: {
                $gte: monthStart,
                $lte: monthEnd
              }
            }
          ]
        });

      // ===================================================
      // BRANCH VALUES
      // ===================================================

      const sales =
        branchSales[0]?.total || 0;

      const expense =
        branchExp[0]?.total || 0;

      const branchProfit =
        sales - expense;

      // ===================================================
      // BRANCH DETAIL
      // ===================================================

      clinicDetail = {

        // Current staff count
        staffCount:
          await Staff.countDocuments({
            $or: [
              {
                clinic: queryId
              },
              {
                clinicId: queryId
              },
              {
                clinic: selectedClinicId
              }
            ]
          }),

        // Patients registered this month
        patientCount:
          branchPatientCount,

        // Current month sales
        sales,

        // Current month expenses
        expense,

        // Current month profit
        netProfit:
          branchProfit
      };
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    res.status(200).json({

      systemSummary,

      clinicDetail,

      // Useful if you want to display
      // "October 2026" on the dashboard
      period: {
        start: monthStart,
        end: monthEnd,
        month: now.toLocaleString(
          'en-IN',
          {
            month: 'long',
            year: 'numeric'
          }
        )
      }

    });

  } catch (error) {

    console.error(
      'Dashboard Aggregation Error:',
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
};