const express = require("express");
const router = express.Router();

const Medicine = require("../models/Medicine");
const authMiddleware = require("../middleware/authMiddleware");




// routes/medicine.js


// Update GET route to filter by clinic if needed


/* CREATE MEDICINE */

router.post("/", authMiddleware, async (req, res) => {

 try {

const { clinicId, name, brand, quantityType } = req.body;


  const existing = await Medicine.findOne({

   clinicId,
   name: req.body.name,

   brand: req.body.brand,

   quantityType: req.body.quantityType

  });



  const totalMrp =
   req.body.mrp *
   req.body.quantity;



  const discountAmount =
   totalMrp *
   (req.body.discount / 100);



  const clinicCost =
   totalMrp -
   discountAmount;



  /* IF MEDICINE ALREADY EXISTS */

  if (existing) {

   const newStock =
    existing.quantity +
    Number(req.body.quantity);



   existing.history.push({

    action: "purchase",

    quantity: req.body.quantity,

    previousStock: existing.quantity,

    newStock,

    updatedBy: req.user?.name || "admin",

    type: "purchase"

   });



   existing.quantity = newStock;
   existing.mrp = req.body.mrp;
   existing.discount = req.body.discount;
   existing.clinicCost = clinicCost;



   await existing.save();



   return res.json(existing);

  }



  /* CREATE NEW MEDICINE */

  const medicine = new Medicine({

   ...req.body,

   clinicCost,

   history: [

    {

     action: "created",

     quantity: req.body.quantity,

     previousStock: 0,

     newStock: req.body.quantity,

     updatedBy: req.user?.name || "admin",

     type: "purchase"

    }

   ]

  });



  await medicine.save();



  res.json(medicine);

 }

 catch (err) {

  console.log(err);

  res.status(500).json({

   message: "Error saving medicine"

  });

 }

});

/* GET ALL MEDICINES */
router.get("/clinic/:clinicId", authMiddleware, async (req, res) => {
  try {
    const data = await Medicine.find({ clinicId: req.params.clinicId })
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    res.json(medicine);
  } catch (err) {
    res.status(404).json({ message: "Medicine not found" });
  }
});



/* UPDATE MEDICINE */

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const existing = await Medicine.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    const newQty = Number(req.body.quantity);

    const difference = newQty - existing.quantity;

    const totalMrp = req.body.mrp * req.body.quantity;

    const discountAmount = totalMrp * (req.body.discount / 100);

    const clinicCost = totalMrp - discountAmount;

    /* push history */

    existing.history.push({
      action: "updated",

      quantity: difference,

      previousStock: existing.quantity,

      newStock: newQty,

      updatedBy: req.user?.name || "admin",

      type: difference > 0 ? "purchase" : "usage",
    });

    existing.name = req.body.name;
    existing.brand = req.body.brand;
    existing.mrName = req.body.mrName;
    existing.mrPhone = req.body.mrPhone;
    existing.category = req.body.category;
    existing.type = req.body.type;
    existing.mrp = req.body.mrp;
    existing.discount = req.body.discount;
    existing.quantity = req.body.quantity;
    existing.quantityType = req.body.quantityType;
    existing.clinicCost = clinicCost;

    await existing.save();

    res.json(existing);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Update error",
    });
  }
});

/* DELETE MEDICINE */

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Delete error",
    });
  }
});

module.exports = router;
