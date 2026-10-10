// const express = require("express");
// const mongoose = require("mongoose");

// const router = express.Router();

// const Bill = require("../models/Bill");
// const Medicine = require("../models/Medicine");

// const AYURVEDIC_INVENTORY = {
//   tab: "Ayurvedic Tabs",
//   churan: "Ayurvedic Churans & Bhasams",
//   oil: "Ayurvedic Oils",
// };

// const round2 = (value) => Number(Number(value || 0).toFixed(2));

// const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// /* ============================================================
//    GET ALL BILLS
// ============================================================ */
// router.get("/", async (req, res) => {
//   try {
//     const bills = await Bill.find()
//       .populate("clinicId")
//       .sort({ createdAt: -1 });

//     res.json(bills);
//   } catch (err) {
//     console.error("GET BILLS ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// /* ============================================================
//    BUILD STOCK DEDUCTIONS

//    One billing line can consume one inventory record, while an
//    Ayurvedic Churan line can consume several inventory records.

//    Example:
//      Abhrak Bhasam 5 gm -> Medicine._id A -> -5
//      Churan X 10 gm     -> Medicine._id B -> -10
//      Oil 25 ml          -> Medicine._id C -> -25
// ============================================================ */
// function buildStockDeductions(items) {
//   const deductions = new Map();

//   const addDeduction = ({ inventoryId, quantity, unit, itemName, category }) => {
//     if (!inventoryId) {
//       throw new Error(
//         `Inventory ID is missing for stock item: ${itemName || "Item"}`,
//       );
//     }

//     if (!isValidObjectId(inventoryId)) {
//       throw new Error(`Invalid inventory ID for ${itemName || "Item"}.`);
//     }

//     const qty = Number(quantity);

//     if (!Number.isFinite(qty) || qty <= 0) {
//       throw new Error(`Invalid billing quantity for ${itemName || "Item"}.`);
//     }

//     const id = String(inventoryId);
//     const current = deductions.get(id);

//     if (current) {
//       current.quantity += qty;
//       return;
//     }

//     deductions.set(id, {
//       inventoryId: new mongoose.Types.ObjectId(id),
//       quantity: qty,
//       unit: unit || "Qty",
//       itemName: itemName || "Item",
//       category: category || "Medicine",
//     });
//   };

//   for (const item of items) {
//     const category = item.category;

//     // ----------------------------------------------------------
//     // NORMAL MEDICINE
//     // ----------------------------------------------------------
//     if (category === "Medicine") {
//       const inventoryId = item.inventoryId || item._id;

//       addDeduction({
//         inventoryId,
//         quantity: item.qty,
//         unit: item.unit,
//         itemName: item.name,
//         category,
//       });
//     }

//     // ----------------------------------------------------------
//     // AYURVEDIC TAB
//     // ----------------------------------------------------------
//     if (category === "Ayurvedic Tab") {
//       addDeduction({
//         inventoryId: item.inventoryId || item._id,
//         quantity: item.qty,
//         unit: item.unit || "Tab",
//         itemName: item.name,
//         category,
//       });
//     }

//     // ----------------------------------------------------------
//     // AYURVEDIC OIL
//     // ----------------------------------------------------------
//     if (category === "Ayurvedic Oil") {
//       addDeduction({
//         inventoryId: item.inventoryId || item._id,
//         quantity: item.qty,
//         unit: item.unit || "ml",
//         itemName: item.name,
//         category,
//       });
//     }

//     // ----------------------------------------------------------
//     // AYURVEDIC CHURAN / BHASAM
//     //
//     // The cart line is a combined mixture. Each ingredient has its
//     // own inventoryId and gram quantity, so stock is deducted from
//     // each actual Medicine document separately.
//     // ----------------------------------------------------------
//     if (category === "Ayurvedic Churan") {
//       if (!Array.isArray(item.ingredients) || item.ingredients.length === 0) {
//         throw new Error(
//           `No inventory ingredients found for ${item.name || "Ayurvedic Churan"}.`,
//         );
//       }

//       for (const ingredient of item.ingredients) {
//         addDeduction({
//           inventoryId: ingredient.inventoryId || ingredient._id,
//           quantity: ingredient.qty,
//           unit: ingredient.unit || "gm",
//           itemName: ingredient.name || item.name,
//           category,
//         });
//       }
//     }
//   }

//   return [...deductions.values()];
// }

// /* ============================================================
//    VALIDATE STOCK BEFORE BILLING

//    IMPORTANT:
//    - Never trust frontend stock.
//    - Always read actual MongoDB quantity.
//    - Clinic ID must match.
//    - Stock must be sufficient.
// ============================================================ */
// async function validateStock(deductions, clinicId) {
//   const ids = deductions.map((entry) => entry.inventoryId);

//   if (!ids.length) return [];

//   const medicines = await Medicine.find({
//     _id: { $in: ids },
//     clinicId,
//   });

//   const byId = new Map(medicines.map((medicine) => [String(medicine._id), medicine]));

//   for (const deduction of deductions) {
//     const medicine = byId.get(String(deduction.inventoryId));

//     if (!medicine) {
//       throw new Error(
//         `Inventory item not found in the selected clinic: ${deduction.itemName}.`,
//       );
//     }

//     const stock = Number(medicine.quantity) || 0;
//     const requested = Number(deduction.quantity) || 0;

//     if (requested > stock) {
//       throw new Error(
//         `${medicine.name || deduction.itemName}: only ${stock} ${medicine.quantityType || deduction.unit} available, but ${requested} ${deduction.unit} requested.`,
//       );
//     }

//     if (stock < 0) {
//       throw new Error(`Invalid negative stock found for ${medicine.name}.`);
//     }
//   }

//   return medicines;
// }

// /* ============================================================
//    APPLY STOCK DEDUCTIONS

//    Atomic update condition:
//      quantity: { $gte: quantityToDeduct }

//    This prevents stock from becoming negative even if two bills
//    are generated at almost the same time.
// ============================================================ */
// async function applyStockDeductions(deductions, clinicId, invoiceId) {
//   const referenceId = `BILL-${invoiceId}-${new mongoose.Types.ObjectId().toString()}`;
//   const applied = [];

//   try {
//     for (const deduction of deductions) {
//       const quantity = Number(deduction.quantity);

//       const updated = await Medicine.findOneAndUpdate(
//         {
//           _id: deduction.inventoryId,
//           clinicId,
//           quantity: { $gte: quantity },
//         },
//         {
//           $inc: { quantity: -quantity },
//           $push: {
//             history: {
//               action: "billing",
//               quantity: -quantity,
//               previousStock: 0,
//               newStock: 0,
//               updatedBy: "System/Bill",
//               type: "billing",
//               referenceId,
//               invoiceId,
//               date: new Date(),
//             },
//           },
//         },
//         { new: true },
//       );

//       if (!updated) {
//         throw new Error(
//           `Stock changed while generating the bill for ${deduction.itemName}. Please refresh inventory and try again.`,
//         );
//       }

//       // Store the actual stock after the atomic update.
//       const newStock = Number(updated.quantity) || 0;
//       const previousStock = newStock + quantity;

//       // Replace the placeholder history values with the real values.
//       await Medicine.updateOne(
//         {
//           _id: deduction.inventoryId,
//           clinicId,
//           "history.referenceId": referenceId,
//         },
//         {
//           $set: {
//             "history.$[entry].previousStock": previousStock,
//             "history.$[entry].newStock": newStock,
//           },
//         },
//         {
//           arrayFilters: [{ "entry.referenceId": referenceId }],
//         },
//       );

//       applied.push({
//         inventoryId: deduction.inventoryId,
//         quantity,
//       });
//     }

//     return { referenceId, applied };
//   } catch (error) {
//     // Compensating rollback if one of the later inventory updates fails.
//     for (const item of applied.reverse()) {
//       try {
//         await Medicine.updateOne(
//           {
//             _id: item.inventoryId,
//             clinicId,
//           },
//           {
//             $inc: { quantity: item.quantity },
//             $pull: { history: { referenceId } },
//           },
//         );
//       } catch (rollbackError) {
//         console.error("CRITICAL STOCK ROLLBACK ERROR:", rollbackError);
//       }
//     }

//     throw error;
//   }
// }

// /* ============================================================
//    GENERATE BILL
// ============================================================ */
// router.post("/generate", async (req, res) => {
//   let stockOperation = null;
//   let billCreated = false;

//   try {
//     const {
//       patientName,
//       mobileNo,
//       items,
//       paymentMethod,
//       clinicId,
//       invoiceId,
//     } = req.body;

//     if (!patientName || !patientName.trim()) {
//       return res.status(400).json({ message: "Patient name is required." });
//     }

//     if (!clinicId) {
//       return res.status(400).json({ message: "Clinic is required." });
//     }

//     if (!isValidObjectId(clinicId)) {
//       return res.status(400).json({ message: "Invalid clinic ID." });
//     }

//     if (!invoiceId) {
//       return res.status(400).json({ message: "Invoice ID is required." });
//     }

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ message: "Please add at least one item." });
//     }

//     // ----------------------------------------------------------
//     // NORMALIZE + CALCULATE ITEMS
//     // ----------------------------------------------------------
//     const normalizedItems = items.map((item) => {
//       const qty = Number(item.qty) || 1;
//       const price = Number(item.price) || 0;
//       const gst = Number(item.gst) || 0;
//       const discount = Number(item.discount) || 0;

//       if (qty <= 0) throw new Error(`Invalid quantity for ${item.name || "item"}.`);
//       if (price < 0) throw new Error(`Invalid price for ${item.name || "item"}.`);
//       if (gst < 0 || discount < 0) {
//         throw new Error(`Invalid tax/discount for ${item.name || "item"}.`);
//       }

//       const base = price * qty;
//       const discountAmount = base * (discount / 100);
//       const taxableAmount = base - discountAmount;
//       const gstAmount = taxableAmount * (gst / 100);
//       const total = taxableAmount + gstAmount;

//       const normalizedItem = {
//         name: item.name || "Item",
//         category: item.category || "Medicine",
//         inventoryId:
//           item.inventoryId && isValidObjectId(item.inventoryId)
//             ? item.inventoryId
//             : undefined,
//         inventoryCategory: item.inventoryCategory || undefined,
//         ayurvedicSubtype: item.ayurvedicSubtype || undefined,
//         qty,
//         unit: item.unit || "Qty",
//         price,
//         pricePerUnit:
//           item.pricePerUnit !== undefined ? Number(item.pricePerUnit) : price,
//         discount,
//         gst,
//         base: round2(base),
//         discountAmount: round2(discountAmount),
//         taxableAmount: round2(taxableAmount),
//         gstAmount: round2(gstAmount),
//         total: round2(total),
//       };

//       if (item.category === "Ayurvedic Tab") {
//         normalizedItem.unit = item.unit || "Tab";
//       }

//       if (item.category === "Ayurvedic Oil") {
//         normalizedItem.unit = item.unit || "ml";
//         if (item.pricePerMl !== undefined) {
//           normalizedItem.pricePerMl = Number(item.pricePerMl);
//         }
//       }

//       if (item.category === "Ayurvedic Churan") {
//         normalizedItem.unit = item.unit || "gm";

//         if (item.pricePerGram !== undefined) {
//           normalizedItem.pricePerGram = Number(item.pricePerGram);
//         }

//         if (item.totalGm !== undefined) {
//           normalizedItem.totalGm = Number(item.totalGm);
//         }

//         if (Array.isArray(item.ingredients)) {
//           normalizedItem.ingredients = item.ingredients.map((ingredient) => ({
//             inventoryId:
//               ingredient.inventoryId && isValidObjectId(ingredient.inventoryId)
//                 ? ingredient.inventoryId
//                 : ingredient._id && isValidObjectId(ingredient._id)
//                   ? ingredient._id
//                   : undefined,
//             inventoryCategory:
//               ingredient.inventoryCategory || AYURVEDIC_INVENTORY.churan,
//             ayurvedicSubtype:
//               ingredient.ayurvedicSubtype ||
//               (String(ingredient.type || "").toLowerCase() === "bhasam"
//                 ? "Bhasam"
//                 : "Churan"),
//             name: ingredient.name || "",
//             type:
//               ingredient.type ||
//               (String(ingredient.ayurvedicSubtype || "").toLowerCase() === "bhasam"
//                 ? "Bhasam"
//                 : "Churan"),
//             qty: Number(ingredient.qty) || 0,
//             unit: ingredient.unit || "gm",
//             pricePerGram:
//               ingredient.pricePerGram !== undefined
//                 ? Number(ingredient.pricePerGram)
//                 : 0,
//           }));
//         }
//       }

//       return normalizedItem;
//     });

//     // ----------------------------------------------------------
//     // SERVER-SIDE TOTAL
//     // ----------------------------------------------------------
//     const serverTotal = normalizedItems.reduce(
//       (sum, item) => sum + item.total,
//       0,
//     );
//     const finalTotal = round2(serverTotal);

//     // ----------------------------------------------------------
//     // BREAKDOWN
//     // ----------------------------------------------------------
//     const breakdown = {
//       consultationTotal: 0,
//       medicineTotal: 0,
//       therapyTotal: 0,
//       ayurvedicTabTotal: 0,
//       ayurvedicChuranTotal: 0,
//       ayurvedicOilTotal: 0,
//     };

//     normalizedItems.forEach((item) => {
//       switch (item.category) {
//         case "Consultation":
//           breakdown.consultationTotal += item.total;
//           break;
//         case "Medicine":
//           breakdown.medicineTotal += item.total;
//           break;
//         case "Therapy":
//           breakdown.therapyTotal += item.total;
//           break;
//         case "Ayurvedic Tab":
//           breakdown.ayurvedicTabTotal += item.total;
//           break;
//         case "Ayurvedic Churan":
//           breakdown.ayurvedicChuranTotal += item.total;
//           break;
//         case "Ayurvedic Oil":
//           breakdown.ayurvedicOilTotal += item.total;
//           break;
//         default:
//           break;
//       }
//     });

//     Object.keys(breakdown).forEach((key) => {
//       breakdown[key] = round2(breakdown[key]);
//     });

//     // ----------------------------------------------------------
//     // BUILD + VALIDATE STOCK DEDUCTIONS
//     // ----------------------------------------------------------
//     const deductions = buildStockDeductions(normalizedItems);
//     await validateStock(deductions, clinicId);

//     // ----------------------------------------------------------
//     // DUPLICATE INVOICE CHECK BEFORE STOCK UPDATE
//     // ----------------------------------------------------------
//     const duplicate = await Bill.findOne({ clinicId, invoiceId });

//     if (duplicate) {
//       return res.status(409).json({
//         message: "This invoice ID already exists for this clinic.",
//       });
//     }

//     // ----------------------------------------------------------
//     // DEDUCT ACTUAL INVENTORY
//     // ----------------------------------------------------------
//     stockOperation = await applyStockDeductions(
//       deductions,
//       clinicId,
//       invoiceId,
//     );

//     // ----------------------------------------------------------
//     // CREATE BILL AFTER STOCK IS SUCCESSFULLY RESERVED
//     // ----------------------------------------------------------
//     const newBill = new Bill({
//       patientName: patientName.trim(),
//       mobileNo: String(mobileNo || "").trim(),
//       items: normalizedItems,
//       totalAmount: finalTotal,
//       paymentMethod: paymentMethod || "Cash",
//       clinicId,
//       invoiceId,
//       breakdown,
//     });

//     const savedBill = await newBill.save();
//     billCreated = true;

//     return res.status(201).json(savedBill);
//   } catch (err) {
//     console.error("BILLING ERROR:", err);

//     // If bill creation failed after stock was deducted, restore stock.
//     if (stockOperation && !billCreated) {
//       for (const item of stockOperation.applied) {
//         try {
//           await Medicine.updateOne(
//             { _id: item.inventoryId },
//             {
//               $inc: { quantity: item.quantity },
//               $pull: { history: { referenceId: stockOperation.referenceId } },
//             },
//           );
//         } catch (rollbackError) {
//           console.error("CRITICAL BILL STOCK ROLLBACK ERROR:", rollbackError);
//         }
//       }
//     }

//     if (err.code === 11000) {
//       return res.status(409).json({
//         message: "This invoice ID already exists for this clinic.",
//       });
//     }

//     if (err.name === "ValidationError") {
//       const messages = Object.values(err.errors)
//         .map((error) => error.message)
//         .join(", ");

//       return res.status(400).json({ message: messages });
//     }

//     return res.status(400).json({
//       message: "Error generating bill: " + err.message,
//     });
//   }
// });

// /* ============================================================
//    PUBLIC INVOICE
// ============================================================ */
// router.get("/public/:id", async (req, res) => {
//   try {
//     const bill = await Bill.findById(req.params.id).populate("clinicId");

//     if (!bill) {
//       return res.status(404).json({ message: "Invoice not found" });
//     }

//     res.json(bill);
//   } catch (err) {
//     console.error("PUBLIC BILL ERROR:", err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// /* ============================================================
//    GET SINGLE BILL
// ============================================================ */
// router.get("/:id", async (req, res) => {
//   try {
//     const bill = await Bill.findById(req.params.id).populate("clinicId");

//     if (!bill) {
//       return res.status(404).json({ message: "Bill not found" });
//     }

//     res.json(bill);
//   } catch (err) {
//     console.error("GET SINGLE BILL ERROR:", err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// module.exports = router;


const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Bill = require("../models/Bill");
const Patient = require("../models/Patient");
const Medicine = require("../models/Medicine");

const AYURVEDIC_INVENTORY = {
  tab: "Ayurvedic Tabs",
  churan: "Ayurvedic Churans & Bhasams",
  oil: "Ayurvedic Oils",
};

const round2 = (value) => Number(Number(value || 0).toFixed(2));

const isValidObjectId = (value) =>
  Boolean(value) && mongoose.Types.ObjectId.isValid(value);

const getPatientAddress = (patient) =>
  [
    patient.address,
    patient.city,
    patient.state,
    patient.pinCode,
  ]
    .filter(Boolean)
    .join(", ");

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
============================================================ */
function buildStockDeductions(items) {
  const deductions = new Map();

  const addDeduction = ({
    inventoryId,
    quantity,
    unit,
    itemName,
    category,
  }) => {
    if (!inventoryId) {
      throw new Error(
        `Inventory ID is missing for stock item: ${itemName || "Item"}`,
      );
    }

    if (!isValidObjectId(inventoryId)) {
      throw new Error(
        `Invalid inventory ID for ${itemName || "Item"}.`,
      );
    }

    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error(
        `Invalid billing quantity for ${itemName || "Item"}.`,
      );
    }

    const id = String(inventoryId);
    const existing = deductions.get(id);

    if (existing) {
      existing.quantity += qty;
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

    if (category === "Medicine") {
      addDeduction({
        inventoryId: item.inventoryId || item._id,
        quantity: item.qty,
        unit: item.unit,
        itemName: item.name,
        category,
      });
    }

    if (category === "Ayurvedic Tab") {
      addDeduction({
        inventoryId: item.inventoryId || item._id,
        quantity: item.qty,
        unit: item.unit || "Tab",
        itemName: item.name,
        category,
      });
    }

    if (category === "Ayurvedic Oil") {
      addDeduction({
        inventoryId: item.inventoryId || item._id,
        quantity: item.qty,
        unit: item.unit || "ml",
        itemName: item.name,
        category,
      });
    }

    if (category === "Ayurvedic Churan") {
      if (
        !Array.isArray(item.ingredients) ||
        item.ingredients.length === 0
      ) {
        throw new Error(
          `No inventory ingredients found for ${
            item.name || "Ayurvedic Churan"
          }.`,
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
   VALIDATE STOCK
============================================================ */
async function validateStock(deductions, clinicId) {
  const ids = deductions.map((entry) => entry.inventoryId);

  if (!ids.length) return [];

  const medicines = await Medicine.find({
    _id: { $in: ids },
    clinicId,
  });

  const byId = new Map(
    medicines.map((medicine) => [
      String(medicine._id),
      medicine,
    ]),
  );

  for (const deduction of deductions) {
    const medicine = byId.get(String(deduction.inventoryId));

    if (!medicine) {
      throw new Error(
        `Inventory item not found in the selected clinic: ${deduction.itemName}.`,
      );
    }

    const stock = Number(medicine.quantity) || 0;
    const requested = Number(deduction.quantity) || 0;

    if (stock < 0) {
      throw new Error(
        `Invalid negative stock found for ${medicine.name}.`,
      );
    }

    if (requested > stock) {
      throw new Error(
        `${medicine.name || deduction.itemName}: only ${stock} ${
          medicine.quantityType || deduction.unit
        } available, but ${requested} ${deduction.unit} requested.`,
      );
    }
  }

  return medicines;
}

/* ============================================================
   APPLY STOCK DEDUCTIONS
============================================================ */
async function applyStockDeductions(
  deductions,
  clinicId,
  invoiceId,
) {
  const referenceId =
    `BILL-${invoiceId}-${new mongoose.Types.ObjectId().toString()}`;

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

      const newStock = Number(updated.quantity) || 0;
      const previousStock = newStock + quantity;

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
          arrayFilters: [
            { "entry.referenceId": referenceId },
          ],
        },
      );

      applied.push({
        inventoryId: deduction.inventoryId,
        quantity,
      });
    }

    return { referenceId, applied };
  } catch (error) {
    for (const item of [...applied].reverse()) {
      try {
        await Medicine.updateOne(
          {
            _id: item.inventoryId,
            clinicId,
          },
          {
            $inc: { quantity: item.quantity },
            $pull: {
              history: { referenceId },
            },
          },
        );
      } catch (rollbackError) {
        console.error(
          "CRITICAL STOCK ROLLBACK ERROR:",
          rollbackError,
        );
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
  let savedBillId = null;
  let patientVisitUpdated = false;

  let patient = null;
  let previousLastVisitDate = null;

  const { clinicId, invoiceId } = req.body;

  try {
    const {
      patientId,
      patientCode,
      patientName,
      patientAddress,
      mobileNo,
      consultationFee,
      items,
      paymentMethod,
    } = req.body;

    /* ------------------ BASIC VALIDATION ------------------ */

    if (!clinicId || !isValidObjectId(clinicId)) {
      return res.status(400).json({
        message: "A valid clinic is required.",
      });
    }

    if (!invoiceId || !String(invoiceId).trim()) {
      return res.status(400).json({
        message: "Invoice ID is required.",
      });
    }

    if (!patientId || !isValidObjectId(patientId)) {
      return res.status(400).json({
        message: "Please select a registered patient.",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: "Bill items must be an array.",
      });
    }

    /* ------------------ VERIFY REGISTERED PATIENT ------------------ */

    // Never trust patient details supplied by the frontend.
    // Verify that this patient belongs to the selected clinic.
    patient = await Patient.findOne({
      _id: patientId,
      clinic: clinicId,
    });

    if (!patient) {
      return res.status(404).json({
        message:
          "Patient not found in the selected clinic. Please select a registered patient.",
      });
    }

    if (!patient.name || !String(patient.name).trim()) {
      return res.status(400).json({
        message: "The selected patient has no registered name.",
      });
    }

    previousLastVisitDate = patient.lastVisitDate || null;

    /* ------------------ CONSULTATION FEE ------------------ */

    const fee = Number(consultationFee) || 0;

    if (!Number.isFinite(fee) || fee < 0) {
      return res.status(400).json({
        message: "Consultation fee must be zero or greater.",
      });
    }

    // If the frontend has already added a consultation item,
    // don't add it again. Otherwise, add the entered fee here.
    const hasConsultation = items.some(
      (item) => item.category === "Consultation",
    );

    const billItems = [...items];

    if (fee > 0 && !hasConsultation) {
      billItems.push({
        name: "Consultation Fee",
        category: "Consultation",
        qty: 1,
        unit: "Visit",
        price: fee,
        pricePerUnit: fee,
        gst: 0,
        discount: 0,
      });
    }

    if (billItems.length === 0) {
      return res.status(400).json({
        message: "Please add at least one item to the bill.",
      });
    }

    /* ------------------ NORMALIZE ITEMS ------------------ */

    const normalizedItems = billItems.map((item) => {
      const qty = Number(item.qty ?? 1);
      const price = Number(item.price) || 0;
      const gst = Number(item.gst) || 0;
      const discount = Number(item.discount) || 0;

      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error(
          `Invalid quantity for ${item.name || "item"}.`,
        );
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(
          `Invalid price for ${item.name || "item"}.`,
        );
      }

      if (
        !Number.isFinite(gst) ||
        !Number.isFinite(discount) ||
        gst < 0 ||
        discount < 0 ||
        discount > 100
      ) {
        throw new Error(
          `Invalid tax/discount for ${item.name || "item"}.`,
        );
      }

      const base = price * qty;
      const discountAmount = base * (discount / 100);
      const taxableAmount = base - discountAmount;
      const gstAmount = taxableAmount * (gst / 100);
      const total = taxableAmount + gstAmount;

      const normalizedItem = {
        name: String(item.name || "Item"),
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
          item.pricePerUnit !== undefined
            ? Number(item.pricePerUnit)
            : price,

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
          normalizedItem.ingredients = item.ingredients.map(
            (ingredient) => {
              const ingredientId =
                ingredient.inventoryId || ingredient._id;

              if (!isValidObjectId(ingredientId)) {
                throw new Error(
                  `Invalid inventory ID for ingredient ${
                    ingredient.name || item.name
                  }.`,
                );
              }

              const ingredientQty = Number(ingredient.qty);

              if (
                !Number.isFinite(ingredientQty) ||
                ingredientQty <= 0
              ) {
                throw new Error(
                  `Invalid quantity for ingredient ${
                    ingredient.name || item.name
                  }.`,
                );
              }

              return {
                inventoryId: ingredientId,

                inventoryCategory:
                  ingredient.inventoryCategory ||
                  AYURVEDIC_INVENTORY.churan,

                ayurvedicSubtype:
                  ingredient.ayurvedicSubtype ||
                  (String(ingredient.type || "").toLowerCase() ===
                  "bhasam"
                    ? "Bhasam"
                    : "Churan"),

                name: ingredient.name || "",

                type:
                  ingredient.type ||
                  (String(
                    ingredient.ayurvedicSubtype || "",
                  ).toLowerCase() === "bhasam"
                    ? "Bhasam"
                    : "Churan"),

                qty: ingredientQty,
                unit: ingredient.unit || "gm",

                pricePerGram:
                  ingredient.pricePerGram !== undefined
                    ? Number(ingredient.pricePerGram)
                    : 0,
              };
            },
          );
        }
      }

      return normalizedItem;
    });

    /* ------------------ SERVER-SIDE TOTAL ------------------ */

    const finalTotal = round2(
      normalizedItems.reduce(
        (sum, item) => sum + item.total,
        0,
      ),
    );

    /* ------------------ BILL BREAKDOWN ------------------ */

    const breakdown = {
      consultationTotal: 0,
      medicineTotal: 0,
      therapyTotal: 0,
      ayurvedicTabTotal: 0,
      ayurvedicChuranTotal: 0,
      ayurvedicOilTotal: 0,
    };

    for (const item of normalizedItems) {
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
    }

    Object.keys(breakdown).forEach((key) => {
      breakdown[key] = round2(breakdown[key]);
    });

    // Store the consultation charge before GST.
    const savedConsultationFee = round2(
      normalizedItems
        .filter((item) => item.category === "Consultation")
        .reduce(
          (sum, item) => sum + item.price * item.qty,
          0,
        ),
    );

    /* ------------------ STOCK VALIDATION ------------------ */

    const deductions = buildStockDeductions(normalizedItems);

    await validateStock(deductions, clinicId);

    /* ------------------ DUPLICATE INVOICE CHECK ------------------ */

    const duplicate = await Bill.findOne({
      clinicId,
      invoiceId: String(invoiceId).trim(),
    });

    if (duplicate) {
      return res.status(409).json({
        message: "This invoice ID already exists for this clinic.",
      });
    }

    /* ------------------ DEDUCT INVENTORY ------------------ */

    stockOperation = await applyStockDeductions(
      deductions,
      clinicId,
      String(invoiceId).trim(),
    );

    /* ------------------ SAVE BILL ------------------ */

    const newBill = new Bill({
      invoiceId: String(invoiceId).trim(),
      clinicId,

      // These details are sourced from the verified database record.
      patientId: patient._id,
      patientCode: patient.patientId || patientCode || "",
      patientName: String(patient.name).trim(),
      mobileNo: String(patient.phone || mobileNo || "").trim(),
      patientAddress: getPatientAddress(patient) ||
        String(patientAddress || "").trim(),

      consultationFee: savedConsultationFee,

      items: normalizedItems,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || "Cash",
      breakdown,
    });

    const savedBill = await newBill.save();
    savedBillId = savedBill._id;

    /* ------------------ UPDATE LAST VISIT ------------------ */

    // Update the patient record only after the bill is saved.
    const updatedPatient = await Patient.findOneAndUpdate(
      {
        _id: patient._id,
        clinic: clinicId,
      },
      {
        $set: {
          lastVisitDate: savedBill.createdAt || new Date(),
        },
      },
      { new: true },
    );

    if (!updatedPatient) {
      throw new Error(
        "Bill was saved, but the patient's visit date could not be updated.",
      );
    }

    patientVisitUpdated = true;
    billCreated = true;

    return res.status(201).json(savedBill);
  } catch (err) {
    console.error("BILLING ERROR:", err);

    // Compensate for a failed operation: remove an unsent bill,
    // restore the previous visit date, and restore stock.
    if (!billCreated) {
      if (savedBillId) {
        try {
          await Bill.findByIdAndDelete(savedBillId);
        } catch (rollbackError) {
          console.error(
            "BILL ROLLBACK ERROR:",
            rollbackError,
          );
        }
      }

      if (patientVisitUpdated && patient) {
        try {
          await Patient.updateOne(
            {
              _id: patient._id,
              clinic: clinicId,
            },
            {
              $set: {
                lastVisitDate: previousLastVisitDate,
              },
            },
          );
        } catch (rollbackError) {
          console.error(
            "PATIENT VISIT ROLLBACK ERROR:",
            rollbackError,
          );
        }
      }

      if (stockOperation) {
        for (const item of [...stockOperation.applied].reverse()) {
          try {
            await Medicine.updateOne(
              {
                _id: item.inventoryId,
                clinicId,
              },
              {
                $inc: {
                  quantity: item.quantity,
                },
                $pull: {
                  history: {
                    referenceId: stockOperation.referenceId,
                  },
                },
              },
            );
          } catch (rollbackError) {
            console.error(
              "CRITICAL BILL STOCK ROLLBACK ERROR:",
              rollbackError,
            );
          }
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

      return res.status(400).json({
        message: messages,
      });
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
    const bill = await Bill.findById(req.params.id)
      .populate("clinicId");

    if (!bill) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json(bill);
  } catch (err) {
    console.error("PUBLIC BILL ERROR:", err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* ============================================================
   GET SINGLE BILL
============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("clinicId");

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    res.json(bill);
  } catch (err) {
    console.error("GET SINGLE BILL ERROR:", err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;
