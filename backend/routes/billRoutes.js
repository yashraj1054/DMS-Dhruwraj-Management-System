const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');



const Medicine = require('../models/Medicine');
// const auth = require('../middleware/auth'); // Uncomment this if you have auth middleware

// GET all bills for the history list
router.get('/', async (req, res) => {
  try {
    // If you want to show only bills for the logged-in clinic, use:
    // const bills = await Bill.find({ clinicId: req.query.clinicId }).sort({ createdAt: -1 });
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new bill
// router.post('/generate', async (req, res) => {
//   const { 
//     patientName, 
//     mobileNo, 
//     items, 
//     totalAmount, 
//     paymentMethod, 
//     clinicId,    // <--- Added this
//     invoiceId    // <--- Added this
//   } = req.body;

//   // Calculate breakdown for MongoDB
//   const breakdown = items.reduce((acc, item) => {
//     // Note: ensure category names match frontend exactly ('Medicine', 'Therapy', 'Consultation')
//     if (item.category === 'Consultation') acc.consultationTotal += item.total;
//     if (item.category === 'Medicine') acc.medicineTotal += item.total;
//     if (item.category === 'Therapy') acc.therapyTotal += item.total;
//     return acc;
//   }, { consultationTotal: 0, medicineTotal: 0, therapyTotal: 0 });

//   const newBill = new Bill({
//     patientName,
//     mobileNo,
//     items,
//     totalAmount,
//     paymentMethod,
//     clinicId,    // <--- Save the clinic association
//     invoiceId,   // <--- Save the generated ID from frontend
//     breakdown
//   });

//   try {
//     const savedBill = await newBill.save();
//     res.status(201).json(savedBill);
//   } catch (err) {
//     // This will trigger if your Bill Model is missing these new fields
//     res.status(400).json({ message: "Check if your Bill Model has clinicId and invoiceId fields: " + err.message });
//   }
// });

router.post('/generate', async (req, res) => {
  const { 
    patientName, 
    mobileNo, 
    items, 
    totalAmount, 
    paymentMethod, 
    clinicId,    
    invoiceId    
  } = req.body;

  const breakdown = items.reduce((acc, item) => {
    if (item.category === 'Consultation') acc.consultationTotal += item.total;
    if (item.category === 'Medicine') acc.medicineTotal += item.total;
    if (item.category === 'Therapy') acc.therapyTotal += item.total;
    return acc;
  }, { consultationTotal: 0, medicineTotal: 0, therapyTotal: 0 });

  try {
    // 1. Save the Bill
    const newBill = new Bill({
      patientName,
      mobileNo,
      items,
      totalAmount,
      paymentMethod,
      clinicId,
      invoiceId,
      breakdown
    });
    const savedBill = await newBill.save();

    // 2. DECREMENT STOCK FOR MEDICINES
    // Use a loop to update each medicine in the inventory
    // for (const item of items) {
    //   if (item.category === 'Medicine' && item._id) {
    //     await Medicine.findByIdAndUpdate(
    //       item._id, 
    //       { $inc: { quantity: -Math.abs(item.qty) } } 
    //     );
    //   }
    // }
    for (const item of items) {
      if (item.category === 'Medicine' && item._id) {
        // Find the medicine to get current stock levels
        const medicine = await Medicine.findById(item._id);
        
        if (medicine) {
          const previousStock = medicine.quantity;
          const qtySold = Math.abs(item.qty);
          const newStock = previousStock - qtySold;

          await Medicine.findByIdAndUpdate(item._id, {
            $set: { quantity: newStock },
            $push: { 
              history: {
                type: "billing",           // Labels the entry
                previousStock: previousStock,
                newStock: newStock,
                date: new Date(),          // Current timestamp
                updatedBy: "System/Bill"   // Or req.user.name if auth is on
              }
            }
          });
        }
      }
    }

    res.status(201).json(savedBill);
  } catch (err) {
    console.error("Billing Error:", err);
    res.status(400).json({ message: "Error generating bill or updating stock: " + err.message });
  }
});


router.get("/public/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("clinicId");

    if (!bill) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json(bill);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;