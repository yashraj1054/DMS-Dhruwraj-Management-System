const Staff = require("../models/Staff");
const Clinic = require("../models/Clinic");

const bcrypt = require("bcryptjs");

exports.createStaff = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.body.clinic);

    if (!clinic) {
      return res.status(400).json({
        message: "Clinic not found",
      });
    }

    const count = await Staff.countDocuments({
      clinic: req.body.clinic,
    });

    const staffId = clinic.staffPrefix + String(count + 1).padStart(3, "0");

    const newStaff = new Staff({
      ...req.body,

      staffId,

      profileImage: req.file?.filename,
    });

    await newStaff.save();

    res.json(newStaff);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error creating staff",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id);

    const isMatch = await bcrypt.compare(
      req.body.currentPassword,

      staff.password,
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password incorrect",
      });
    }

    staff.password = await bcrypt.hash(
      req.body.newPassword,

      10,
    );

    await staff.save();

    res.json({
      message: "Password updated",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Staff.find({
      role: "doctor",
    });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};