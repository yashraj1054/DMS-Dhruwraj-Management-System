// const express = require('express');
// const router = express.Router();
// const Bill = require('../models/Bill');



// const Medicine = require('../models/Medicine');
// // const auth = require('../middleware/auth'); // Uncomment this if you have auth middleware

// // GET all bills for the history list
// router.get('/', async (req, res) => {
//   try {
//     // If you want to show only bills for the logged-in clinic, use:
//     // const bills = await Bill.find({ clinicId: req.query.clinicId }).sort({ createdAt: -1 });
//     const bills = await Bill.find().sort({ createdAt: -1 });
//     res.json(bills);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST a new bill
// // router.post('/generate', async (req, res) => {
// //   const { 
// //     patientName, 
// //     mobileNo, 
// //     items, 
// //     totalAmount, 
// //     paymentMethod, 
// //     clinicId,    // <--- Added this
// //     invoiceId    // <--- Added this
// //   } = req.body;

// //   // Calculate breakdown for MongoDB
// //   const breakdown = items.reduce((acc, item) => {
// //     // Note: ensure category names match frontend exactly ('Medicine', 'Therapy', 'Consultation')
// //     if (item.category === 'Consultation') acc.consultationTotal += item.total;
// //     if (item.category === 'Medicine') acc.medicineTotal += item.total;
// //     if (item.category === 'Therapy') acc.therapyTotal += item.total;
// //     return acc;
// //   }, { consultationTotal: 0, medicineTotal: 0, therapyTotal: 0 });

// //   const newBill = new Bill({
// //     patientName,
// //     mobileNo,
// //     items,
// //     totalAmount,
// //     paymentMethod,
// //     clinicId,    // <--- Save the clinic association
// //     invoiceId,   // <--- Save the generated ID from frontend
// //     breakdown
// //   });

// //   try {
// //     const savedBill = await newBill.save();
// //     res.status(201).json(savedBill);
// //   } catch (err) {
// //     // This will trigger if your Bill Model is missing these new fields
// //     res.status(400).json({ message: "Check if your Bill Model has clinicId and invoiceId fields: " + err.message });
// //   }
// // });

// router.post('/generate', async (req, res) => {
//   const { 
//     patientName, 
//     mobileNo, 
//     items, 
//     totalAmount, 
//     paymentMethod, 
//     clinicId,    
//     invoiceId    
//   } = req.body;

//   const breakdown = items.reduce((acc, item) => {
//     if (item.category === 'Consultation') acc.consultationTotal += item.total;
//     if (item.category === 'Medicine') acc.medicineTotal += item.total;
//     if (item.category === 'Therapy') acc.therapyTotal += item.total;
//     return acc;
//   }, { consultationTotal: 0, medicineTotal: 0, therapyTotal: 0 });

//   try {
//     // 1. Save the Bill
//     const newBill = new Bill({
//       patientName,
//       mobileNo,
//       items,
//       totalAmount,
//       paymentMethod,
//       clinicId,
//       invoiceId,
//       breakdown
//     });
//     const savedBill = await newBill.save();

//     // 2. DECREMENT STOCK FOR MEDICINES
//     // Use a loop to update each medicine in the inventory
//     // for (const item of items) {
//     //   if (item.category === 'Medicine' && item._id) {
//     //     await Medicine.findByIdAndUpdate(
//     //       item._id, 
//     //       { $inc: { quantity: -Math.abs(item.qty) } } 
//     //     );
//     //   }
//     // }
//     for (const item of items) {
//       if (item.category === 'Medicine' && item._id) {
//         // Find the medicine to get current stock levels
//         const medicine = await Medicine.findById(item._id);
        
//         if (medicine) {
//           const previousStock = medicine.quantity;
//           const qtySold = Math.abs(item.qty);
//           const newStock = previousStock - qtySold;

//           await Medicine.findByIdAndUpdate(item._id, {
//             $set: { quantity: newStock },
//             $push: { 
//               history: {
//                 type: "billing",           // Labels the entry
//                 previousStock: previousStock,
//                 newStock: newStock,
//                 date: new Date(),          // Current timestamp
//                 updatedBy: "System/Bill"   // Or req.user.name if auth is on
//               }
//             }
//           });
//         }
//       }
//     }

//     res.status(201).json(savedBill);
//   } catch (err) {
//     console.error("Billing Error:", err);
//     res.status(400).json({ message: "Error generating bill or updating stock: " + err.message });
//   }
// });


// router.get("/public/:id", async (req, res) => {
//   try {
//     const bill = await Bill.findById(req.params.id).populate("clinicId");

//     if (!bill) {
//       return res.status(404).json({
//         message: "Invoice not found",
//       });
//     }

//     res.json(bill);

//   } catch (err) {
//     console.error(err);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();

// const Bill = require("../models/Bill");
// const Medicine = require("../models/Medicine");


// // ============================================================
// // GET ALL BILLS
// // ============================================================

// router.get("/", async (req, res) => {
//   try {

//     const bills = await Bill.find()
//       .populate("clinicId")
//       .sort({ createdAt: -1 });

//     res.json(bills);

//   } catch (err) {

//     console.error("GET BILLS ERROR:", err);

//     res.status(500).json({
//       message: err.message,
//     });

//   }
// });


// // ============================================================
// // GENERATE BILL
// // ============================================================

// router.post("/generate", async (req, res) => {

//   try {

//     const {
//       patientName,
//       mobileNo,
//       items,
//       totalAmount,
//       paymentMethod,
//       clinicId,
//       invoiceId,
//     } = req.body;


//     // --------------------------------------------------------
//     // BASIC VALIDATION
//     // --------------------------------------------------------

//     if (!patientName || !patientName.trim()) {

//       return res.status(400).json({
//         message: "Patient name is required.",
//       });

//     }


//     if (!clinicId) {

//       return res.status(400).json({
//         message: "Clinic is required.",
//       });

//     }


//     if (!invoiceId) {

//       return res.status(400).json({
//         message: "Invoice ID is required.",
//       });

//     }


//     if (!Array.isArray(items) || items.length === 0) {

//       return res.status(400).json({
//         message: "Please add at least one item.",
//       });

//     }


//     // ========================================================
//     // NORMALIZE + CALCULATE ITEMS
//     // ========================================================

//     const normalizedItems = items.map((item) => {

//       const qty = Number(item.qty) || 1;

//       const price = Number(item.price) || 0;

//       const gst = Number(item.gst) || 0;

//       const discount = Number(item.discount) || 0;


//       // ----------------------------------------------
//       // BASE
//       // ----------------------------------------------

//       const base = price * qty;


//       // ----------------------------------------------
//       // DISCOUNT
//       // ----------------------------------------------

//       const discountAmount =
//         base * (discount / 100);


//       // ----------------------------------------------
//       // TAXABLE
//       // ----------------------------------------------

//       const taxableAmount =
//         base - discountAmount;


//       // ----------------------------------------------
//       // GST
//       // ----------------------------------------------

//       const gstAmount =
//         taxableAmount * (gst / 100);


//       // ----------------------------------------------
//       // FINAL TOTAL
//       // ----------------------------------------------

//       const total =
//         taxableAmount + gstAmount;


//       const normalizedItem = {

//         name: item.name || "Item",

//         category: item.category || "Medicine",

//         qty: qty,

//         unit: item.unit || "Qty",

//         price: price,

//         pricePerUnit:
//           item.pricePerUnit !== undefined
//             ? Number(item.pricePerUnit)
//             : price,

//         discount: discount,

//         gst: gst,

//         base: Number(base.toFixed(2)),

//         discountAmount:
//           Number(discountAmount.toFixed(2)),

//         taxableAmount:
//           Number(taxableAmount.toFixed(2)),

//         gstAmount:
//           Number(gstAmount.toFixed(2)),

//         total:
//           Number(total.toFixed(2)),
//       };


//       // ======================================================
//       // AYURVEDIC TAB
//       // ======================================================

//       if (
//         item.category === "Ayurvedic Tab"
//       ) {

//         normalizedItem.unit =
//           item.unit || "Tab";

//       }


//       // ======================================================
//       // AYURVEDIC CHURAN
//       // ======================================================

//       if (
//         item.category === "Ayurvedic Churan"
//       ) {

//         normalizedItem.unit =
//           item.unit || "gm";


//         if (
//           item.pricePerGram !== undefined
//         ) {

//           normalizedItem.pricePerGram =
//             Number(item.pricePerGram);

//         }


//         if (
//           item.totalGm !== undefined
//         ) {

//           normalizedItem.totalGm =
//             Number(item.totalGm);

//         }


//         // Save Bhasam + Churan ingredients
//         if (
//           Array.isArray(item.ingredients)
//         ) {

//           normalizedItem.ingredients =
//             item.ingredients.map(
//               (ingredient) => ({

//                 name:
//                   ingredient.name || "",

//                 type:
//                   ingredient.type || "Churan",

//                 qty:
//                   Number(ingredient.qty) || 0,

//                 unit:
//                   ingredient.unit || "gm",

//                 pricePerGram:
//                   ingredient.pricePerGram !== undefined
//                     ? Number(
//                         ingredient.pricePerGram
//                       )
//                     : 0,

//               })
//             );

//         }

//       }


//       // ======================================================
//       // AYURVEDIC OIL
//       // ======================================================

//       if (
//         item.category === "Ayurvedic Oil"
//       ) {

//         normalizedItem.unit =
//           item.unit || "ml";


//         if (
//           item.pricePerMl !== undefined
//         ) {

//           normalizedItem.pricePerMl =
//             Number(item.pricePerMl);

//         }

//       }


//       return normalizedItem;

//     });


//     // ========================================================
//     // SERVER-SIDE TOTAL
//     // ========================================================

//     const serverTotal =
//       normalizedItems.reduce(
//         (sum, item) =>
//           sum + item.total,
//         0
//       );


//     const finalTotal =
//       Number(serverTotal.toFixed(2));


//     // ========================================================
//     // BREAKDOWN
//     // ========================================================

//     const breakdown = {

//       consultationTotal: 0,

//       medicineTotal: 0,

//       therapyTotal: 0,

//       ayurvedicTabTotal: 0,

//       ayurvedicChuranTotal: 0,

//       ayurvedicOilTotal: 0,

//     };


//     normalizedItems.forEach(
//       (item) => {

//         switch (item.category) {

//           case "Consultation":

//             breakdown.consultationTotal +=
//               item.total;

//             break;


//           case "Medicine":

//             breakdown.medicineTotal +=
//               item.total;

//             break;


//           case "Therapy":

//             breakdown.therapyTotal +=
//               item.total;

//             break;


//           case "Ayurvedic Tab":

//             breakdown.ayurvedicTabTotal +=
//               item.total;

//             break;


//           case "Ayurvedic Churan":

//             breakdown.ayurvedicChuranTotal +=
//               item.total;

//             break;


//           case "Ayurvedic Oil":

//             breakdown.ayurvedicOilTotal +=
//               item.total;

//             break;


//           default:

//             break;

//         }

//       }
//     );


//     // Round breakdown values

//     breakdown.consultationTotal =
//       Number(
//         breakdown.consultationTotal.toFixed(2)
//       );

//     breakdown.medicineTotal =
//       Number(
//         breakdown.medicineTotal.toFixed(2)
//       );

//     breakdown.therapyTotal =
//       Number(
//         breakdown.therapyTotal.toFixed(2)
//       );

//     breakdown.ayurvedicTabTotal =
//       Number(
//         breakdown.ayurvedicTabTotal.toFixed(2)
//       );

//     breakdown.ayurvedicChuranTotal =
//       Number(
//         breakdown.ayurvedicChuranTotal.toFixed(2)
//       );

//     breakdown.ayurvedicOilTotal =
//       Number(
//         breakdown.ayurvedicOilTotal.toFixed(2)
//       );


//     // ========================================================
//     // CREATE BILL
//     // ========================================================

//     const newBill = new Bill({

//       patientName:
//         patientName.trim(),

//       mobileNo:
//         String(mobileNo || "").trim(),

//       items:
//         normalizedItems,

//       // IMPORTANT:
//       // We use server calculated total
//       totalAmount:
//         finalTotal,

//       paymentMethod:
//         paymentMethod || "Cash",

//       clinicId,

//       invoiceId,

//       breakdown,

//     });


//     // ========================================================
//     // SAVE BILL
//     // ========================================================

//     const savedBill =
//       await newBill.save();


//     // ========================================================
//     // DECREMENT NORMAL MEDICINE STOCK
//     // ========================================================

//     /*
//       IMPORTANT:

//       Only normal inventory medicines are
//       deducted here.

//       Ayurvedic Tab / Churan / Oil do NOT
//       get deducted because your current
//       backend does not have a separate
//       Ayurvedic inventory model.
//     */


//     for (const item of items) {

//       if (
//         item.category === "Medicine" &&
//         item._id
//       ) {

//         try {

//           const medicine =
//             await Medicine.findById(
//               item._id
//             );


//           if (!medicine) {

//             console.warn(
//               "Medicine not found:",
//               item._id
//             );

//             continue;

//           }


//           const previousStock =
//             Number(
//               medicine.quantity
//             ) || 0;


//           const qtySold =
//             Math.abs(
//               Number(item.qty) || 0
//             );


//           const newStock =
//             previousStock - qtySold;


//           await Medicine.findByIdAndUpdate(

//             item._id,

//             {
//               $set: {
//                 quantity: newStock,
//               },

//               $push: {

//                 history: {

//                   type: "billing",

//                   previousStock:
//                     previousStock,

//                   newStock:
//                     newStock,

//                   date:
//                     new Date(),

//                   updatedBy:
//                     "System/Bill",

//                 },

//               },

//             }

//           );

//         } catch (stockError) {

//           /*
//             Do not destroy the generated invoice
//             just because inventory history failed.

//             The bill has already been successfully
//             generated.
//           */

//           console.error(
//             "STOCK UPDATE ERROR:",
//             stockError
//           );

//         }

//       }

//     }


//     // ========================================================
//     // RETURN SAVED BILL
//     // ========================================================

//     return res.status(201).json(
//       savedBill
//     );


//   } catch (err) {

//     console.error(
//       "BILLING ERROR:",
//       err
//     );


//     // Duplicate invoice ID

//     if (
//       err.code === 11000
//     ) {

//       return res.status(409).json({

//         message:
//           "This invoice ID already exists for this clinic.",

//       });

//     }


//     // Mongoose validation error

//     if (
//       err.name === "ValidationError"
//     ) {

//       const messages =
//         Object.values(err.errors)
//           .map(
//             (error) =>
//               error.message
//           )
//           .join(", ");


//       return res.status(400).json({

//         message:
//           messages,

//       });

//     }


//     return res.status(400).json({

//       message:
//         "Error generating bill: " +
//         err.message,

//     });

//   }

// });


// // ============================================================
// // PUBLIC INVOICE
// // ============================================================

// router.get(
//   "/public/:id",
//   async (req, res) => {

//     try {

//       const bill =
//         await Bill.findById(
//           req.params.id
//         ).populate(
//           "clinicId"
//         );


//       if (!bill) {

//         return res.status(404).json({

//           message:
//             "Invoice not found",

//         });

//       }


//       res.json(bill);


//     } catch (err) {

//       console.error(
//         "PUBLIC BILL ERROR:",
//         err
//       );


//       res.status(500).json({

//         message:
//           "Server Error",

//       });

//     }

//   }
// );


// // ============================================================
// // GET SINGLE BILL
// // ============================================================

// router.get(
//   "/:id",
//   async (req, res) => {

//     try {

//       const bill =
//         await Bill.findById(
//           req.params.id
//         ).populate(
//           "clinicId"
//         );


//       if (!bill) {

//         return res.status(404).json({

//           message:
//             "Bill not found",

//         });

//       }


//       res.json(bill);


//     } catch (err) {

//       console.error(
//         "GET SINGLE BILL ERROR:",
//         err
//       );


//       res.status(500).json({

//         message:
//           "Server Error",

//       });

//     }

//   }
// );


// module.exports = router;


const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Bill = require("../models/Bill");
const Medicine = require("../models/Medicine");

const AYURVEDIC_INVENTORY = {
  tab: "Ayurvedic Tabs",
  churan: "Ayurvedic Churans & Bhasams",
  oil: "Ayurvedic Oils",
};

const round2 = (value) => Number(Number(value || 0).toFixed(2));

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

/* ============================================================
   GET ALL BILLS
============================================================ */
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("clinicId")
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    console.error("GET BILLS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   BUILD STOCK DEDUCTIONS

   One billing line can consume one inventory record, while an
   Ayurvedic Churan line can consume several inventory records.

   Example:
     Abhrak Bhasam 5 gm -> Medicine._id A -> -5
     Churan X 10 gm     -> Medicine._id B -> -10
     Oil 25 ml          -> Medicine._id C -> -25
============================================================ */
function buildStockDeductions(items) {
  const deductions = new Map();

  const addDeduction = ({ inventoryId, quantity, unit, itemName, category }) => {
    if (!inventoryId) {
      throw new Error(
        `Inventory ID is missing for stock item: ${itemName || "Item"}`,
      );
    }

    if (!isValidObjectId(inventoryId)) {
      throw new Error(`Invalid inventory ID for ${itemName || "Item"}.`);
    }

    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error(`Invalid billing quantity for ${itemName || "Item"}.`);
    }

    const id = String(inventoryId);
    const current = deductions.get(id);

    if (current) {
      current.quantity += qty;
      return;
    }

    deductions.set(id, {
      inventoryId: new mongoose.Types.ObjectId(id),
      quantity: qty,
      unit: unit || "Qty",
      itemName: itemName || "Item",
      category: category || "Medicine",
    });
  };

  for (const item of items) {
    const category = item.category;

    // ----------------------------------------------------------
    // NORMAL MEDICINE
    // ----------------------------------------------------------
    if (category === "Medicine") {
      const inventoryId = item.inventoryId || item._id;

      addDeduction({
        inventoryId,
        quantity: item.qty,
        unit: item.unit,
        itemName: item.name,
        category,
      });
    }

    // ----------------------------------------------------------
    // AYURVEDIC TAB
    // ----------------------------------------------------------
    if (category === "Ayurvedic Tab") {
      addDeduction({
        inventoryId: item.inventoryId || item._id,
        quantity: item.qty,
        unit: item.unit || "Tab",
        itemName: item.name,
        category,
      });
    }

    // ----------------------------------------------------------
    // AYURVEDIC OIL
    // ----------------------------------------------------------
    if (category === "Ayurvedic Oil") {
      addDeduction({
        inventoryId: item.inventoryId || item._id,
        quantity: item.qty,
        unit: item.unit || "ml",
        itemName: item.name,
        category,
      });
    }

    // ----------------------------------------------------------
    // AYURVEDIC CHURAN / BHASAM
    //
    // The cart line is a combined mixture. Each ingredient has its
    // own inventoryId and gram quantity, so stock is deducted from
    // each actual Medicine document separately.
    // ----------------------------------------------------------
    if (category === "Ayurvedic Churan") {
      if (!Array.isArray(item.ingredients) || item.ingredients.length === 0) {
        throw new Error(
          `No inventory ingredients found for ${item.name || "Ayurvedic Churan"}.`,
        );
      }

      for (const ingredient of item.ingredients) {
        addDeduction({
          inventoryId: ingredient.inventoryId || ingredient._id,
          quantity: ingredient.qty,
          unit: ingredient.unit || "gm",
          itemName: ingredient.name || item.name,
          category,
        });
      }
    }
  }

  return [...deductions.values()];
}

/* ============================================================
   VALIDATE STOCK BEFORE BILLING

   IMPORTANT:
   - Never trust frontend stock.
   - Always read actual MongoDB quantity.
   - Clinic ID must match.
   - Stock must be sufficient.
============================================================ */
async function validateStock(deductions, clinicId) {
  const ids = deductions.map((entry) => entry.inventoryId);

  if (!ids.length) return [];

  const medicines = await Medicine.find({
    _id: { $in: ids },
    clinicId,
  });

  const byId = new Map(medicines.map((medicine) => [String(medicine._id), medicine]));

  for (const deduction of deductions) {
    const medicine = byId.get(String(deduction.inventoryId));

    if (!medicine) {
      throw new Error(
        `Inventory item not found in the selected clinic: ${deduction.itemName}.`,
      );
    }

    const stock = Number(medicine.quantity) || 0;
    const requested = Number(deduction.quantity) || 0;

    if (requested > stock) {
      throw new Error(
        `${medicine.name || deduction.itemName}: only ${stock} ${medicine.quantityType || deduction.unit} available, but ${requested} ${deduction.unit} requested.`,
      );
    }

    if (stock < 0) {
      throw new Error(`Invalid negative stock found for ${medicine.name}.`);
    }
  }

  return medicines;
}

/* ============================================================
   APPLY STOCK DEDUCTIONS

   Atomic update condition:
     quantity: { $gte: quantityToDeduct }

   This prevents stock from becoming negative even if two bills
   are generated at almost the same time.
============================================================ */
async function applyStockDeductions(deductions, clinicId, invoiceId) {
  const referenceId = `BILL-${invoiceId}-${new mongoose.Types.ObjectId().toString()}`;
  const applied = [];

  try {
    for (const deduction of deductions) {
      const quantity = Number(deduction.quantity);

      const updated = await Medicine.findOneAndUpdate(
        {
          _id: deduction.inventoryId,
          clinicId,
          quantity: { $gte: quantity },
        },
        {
          $inc: { quantity: -quantity },
          $push: {
            history: {
              action: "billing",
              quantity: -quantity,
              previousStock: 0,
              newStock: 0,
              updatedBy: "System/Bill",
              type: "billing",
              referenceId,
              invoiceId,
              date: new Date(),
            },
          },
        },
        { new: true },
      );

      if (!updated) {
        throw new Error(
          `Stock changed while generating the bill for ${deduction.itemName}. Please refresh inventory and try again.`,
        );
      }

      // Store the actual stock after the atomic update.
      const newStock = Number(updated.quantity) || 0;
      const previousStock = newStock + quantity;

      // Replace the placeholder history values with the real values.
      await Medicine.updateOne(
        {
          _id: deduction.inventoryId,
          clinicId,
          "history.referenceId": referenceId,
        },
        {
          $set: {
            "history.$[entry].previousStock": previousStock,
            "history.$[entry].newStock": newStock,
          },
        },
        {
          arrayFilters: [{ "entry.referenceId": referenceId }],
        },
      );

      applied.push({
        inventoryId: deduction.inventoryId,
        quantity,
      });
    }

    return { referenceId, applied };
  } catch (error) {
    // Compensating rollback if one of the later inventory updates fails.
    for (const item of applied.reverse()) {
      try {
        await Medicine.updateOne(
          {
            _id: item.inventoryId,
            clinicId,
          },
          {
            $inc: { quantity: item.quantity },
            $pull: { history: { referenceId } },
          },
        );
      } catch (rollbackError) {
        console.error("CRITICAL STOCK ROLLBACK ERROR:", rollbackError);
      }
    }

    throw error;
  }
}

/* ============================================================
   GENERATE BILL
============================================================ */
router.post("/generate", async (req, res) => {
  let stockOperation = null;
  let billCreated = false;

  try {
    const {
      patientName,
      mobileNo,
      items,
      paymentMethod,
      clinicId,
      invoiceId,
    } = req.body;

    if (!patientName || !patientName.trim()) {
      return res.status(400).json({ message: "Patient name is required." });
    }

    if (!clinicId) {
      return res.status(400).json({ message: "Clinic is required." });
    }

    if (!isValidObjectId(clinicId)) {
      return res.status(400).json({ message: "Invalid clinic ID." });
    }

    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice ID is required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Please add at least one item." });
    }

    // ----------------------------------------------------------
    // NORMALIZE + CALCULATE ITEMS
    // ----------------------------------------------------------
    const normalizedItems = items.map((item) => {
      const qty = Number(item.qty) || 1;
      const price = Number(item.price) || 0;
      const gst = Number(item.gst) || 0;
      const discount = Number(item.discount) || 0;

      if (qty <= 0) throw new Error(`Invalid quantity for ${item.name || "item"}.`);
      if (price < 0) throw new Error(`Invalid price for ${item.name || "item"}.`);
      if (gst < 0 || discount < 0) {
        throw new Error(`Invalid tax/discount for ${item.name || "item"}.`);
      }

      const base = price * qty;
      const discountAmount = base * (discount / 100);
      const taxableAmount = base - discountAmount;
      const gstAmount = taxableAmount * (gst / 100);
      const total = taxableAmount + gstAmount;

      const normalizedItem = {
        name: item.name || "Item",
        category: item.category || "Medicine",
        inventoryId:
          item.inventoryId && isValidObjectId(item.inventoryId)
            ? item.inventoryId
            : undefined,
        inventoryCategory: item.inventoryCategory || undefined,
        ayurvedicSubtype: item.ayurvedicSubtype || undefined,
        qty,
        unit: item.unit || "Qty",
        price,
        pricePerUnit:
          item.pricePerUnit !== undefined ? Number(item.pricePerUnit) : price,
        discount,
        gst,
        base: round2(base),
        discountAmount: round2(discountAmount),
        taxableAmount: round2(taxableAmount),
        gstAmount: round2(gstAmount),
        total: round2(total),
      };

      if (item.category === "Ayurvedic Tab") {
        normalizedItem.unit = item.unit || "Tab";
      }

      if (item.category === "Ayurvedic Oil") {
        normalizedItem.unit = item.unit || "ml";
        if (item.pricePerMl !== undefined) {
          normalizedItem.pricePerMl = Number(item.pricePerMl);
        }
      }

      if (item.category === "Ayurvedic Churan") {
        normalizedItem.unit = item.unit || "gm";

        if (item.pricePerGram !== undefined) {
          normalizedItem.pricePerGram = Number(item.pricePerGram);
        }

        if (item.totalGm !== undefined) {
          normalizedItem.totalGm = Number(item.totalGm);
        }

        if (Array.isArray(item.ingredients)) {
          normalizedItem.ingredients = item.ingredients.map((ingredient) => ({
            inventoryId:
              ingredient.inventoryId && isValidObjectId(ingredient.inventoryId)
                ? ingredient.inventoryId
                : ingredient._id && isValidObjectId(ingredient._id)
                  ? ingredient._id
                  : undefined,
            inventoryCategory:
              ingredient.inventoryCategory || AYURVEDIC_INVENTORY.churan,
            ayurvedicSubtype:
              ingredient.ayurvedicSubtype ||
              (String(ingredient.type || "").toLowerCase() === "bhasam"
                ? "Bhasam"
                : "Churan"),
            name: ingredient.name || "",
            type:
              ingredient.type ||
              (String(ingredient.ayurvedicSubtype || "").toLowerCase() === "bhasam"
                ? "Bhasam"
                : "Churan"),
            qty: Number(ingredient.qty) || 0,
            unit: ingredient.unit || "gm",
            pricePerGram:
              ingredient.pricePerGram !== undefined
                ? Number(ingredient.pricePerGram)
                : 0,
          }));
        }
      }

      return normalizedItem;
    });

    // ----------------------------------------------------------
    // SERVER-SIDE TOTAL
    // ----------------------------------------------------------
    const serverTotal = normalizedItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );
    const finalTotal = round2(serverTotal);

    // ----------------------------------------------------------
    // BREAKDOWN
    // ----------------------------------------------------------
    const breakdown = {
      consultationTotal: 0,
      medicineTotal: 0,
      therapyTotal: 0,
      ayurvedicTabTotal: 0,
      ayurvedicChuranTotal: 0,
      ayurvedicOilTotal: 0,
    };

    normalizedItems.forEach((item) => {
      switch (item.category) {
        case "Consultation":
          breakdown.consultationTotal += item.total;
          break;
        case "Medicine":
          breakdown.medicineTotal += item.total;
          break;
        case "Therapy":
          breakdown.therapyTotal += item.total;
          break;
        case "Ayurvedic Tab":
          breakdown.ayurvedicTabTotal += item.total;
          break;
        case "Ayurvedic Churan":
          breakdown.ayurvedicChuranTotal += item.total;
          break;
        case "Ayurvedic Oil":
          breakdown.ayurvedicOilTotal += item.total;
          break;
        default:
          break;
      }
    });

    Object.keys(breakdown).forEach((key) => {
      breakdown[key] = round2(breakdown[key]);
    });

    // ----------------------------------------------------------
    // BUILD + VALIDATE STOCK DEDUCTIONS
    // ----------------------------------------------------------
    const deductions = buildStockDeductions(normalizedItems);
    await validateStock(deductions, clinicId);

    // ----------------------------------------------------------
    // DUPLICATE INVOICE CHECK BEFORE STOCK UPDATE
    // ----------------------------------------------------------
    const duplicate = await Bill.findOne({ clinicId, invoiceId });

    if (duplicate) {
      return res.status(409).json({
        message: "This invoice ID already exists for this clinic.",
      });
    }

    // ----------------------------------------------------------
    // DEDUCT ACTUAL INVENTORY
    // ----------------------------------------------------------
    stockOperation = await applyStockDeductions(
      deductions,
      clinicId,
      invoiceId,
    );

    // ----------------------------------------------------------
    // CREATE BILL AFTER STOCK IS SUCCESSFULLY RESERVED
    // ----------------------------------------------------------
    const newBill = new Bill({
      patientName: patientName.trim(),
      mobileNo: String(mobileNo || "").trim(),
      items: normalizedItems,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || "Cash",
      clinicId,
      invoiceId,
      breakdown,
    });

    const savedBill = await newBill.save();
    billCreated = true;

    return res.status(201).json(savedBill);
  } catch (err) {
    console.error("BILLING ERROR:", err);

    // If bill creation failed after stock was deducted, restore stock.
    if (stockOperation && !billCreated) {
      for (const item of stockOperation.applied) {
        try {
          await Medicine.updateOne(
            { _id: item.inventoryId },
            {
              $inc: { quantity: item.quantity },
              $pull: { history: { referenceId: stockOperation.referenceId } },
            },
          );
        } catch (rollbackError) {
          console.error("CRITICAL BILL STOCK ROLLBACK ERROR:", rollbackError);
        }
      }
    }

    if (err.code === 11000) {
      return res.status(409).json({
        message: "This invoice ID already exists for this clinic.",
      });
    }

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors)
        .map((error) => error.message)
        .join(", ");

      return res.status(400).json({ message: messages });
    }

    return res.status(400).json({
      message: "Error generating bill: " + err.message,
    });
  }
});

/* ============================================================
   PUBLIC INVOICE
============================================================ */
router.get("/public/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("clinicId");

    if (!bill) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(bill);
  } catch (err) {
    console.error("PUBLIC BILL ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ============================================================
   GET SINGLE BILL
============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("clinicId");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json(bill);
  } catch (err) {
    console.error("GET SINGLE BILL ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;