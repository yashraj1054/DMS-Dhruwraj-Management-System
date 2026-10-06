const express = require("express");
const router = express.Router();
const Therapy = require("../models/Therapy");

router.get("/", async (req, res) => {
  try {
    const therapies = await Therapy.find().sort({ name: 1 });
    res.json(therapies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;