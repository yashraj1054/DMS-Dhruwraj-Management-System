const router = require("express").Router();

const upload = require("../middleware/upload");

const Staff = require("../models/Staff");
const Clinic = require("../models/Clinic");

const User = require("../models/User");
 

const bcrypt = require("bcryptjs");

const authMiddleware = require("../middleware/authMiddleware");

/*
CREATE STAFF
*/

router.post(
  "/",

  upload.fields([
  {
    name: "profileImage",
    maxCount: 1,
  },

  {
    name: "certificateImage",
    maxCount: 1,
  },
]),

  async (req, res) => {
    try {
      const clinic = await Clinic.findById(req.body.clinic);

      if (!clinic) {
        return res.status(404).json({
          message: "Clinic not found",
        });
      }

      /*
      AUTO STAFF ID
      */

      const count = await Staff.countDocuments({
        clinic: req.body.clinic,
      });

      const staffId =
        clinic.staffPrefix + String(count + 1).padStart(3, "0");

      /*
      HASH PASSWORD
      */

      const hashedPassword = await bcrypt.hash(
        req.body.password,
        10,
      );

      /*
      SALARY CALCULATION
      */

      const base = Number(req.body.base || 0);

      const hra = Number(req.body.hra || 0);

      const da = Number(req.body.da || 0);

      const other = Number(req.body.other || 0);

      const target = Number(req.body.target || 0);

      const targetAchieved = Number(
        req.body.targetAchieved || 0,
      );

      let bonus = 0;

      if (targetAchieved >= target) {
        bonus = Number(req.body.bonus || 0);
      }

      const totalSalary =
        base +
        hra +
        da +
        other +
        bonus;

      /*
      CREATE STAFF
      */

      const newStaff = new Staff({
        ...req.body,

        password: hashedPassword,

        staffId,

        profileImage:
  req.files?.profileImage?.[0]
    ?.filename,

certificateImage:
  req.files?.certificateImage?.[0]
    ?.filename,

        ctc: req.body.ctc,

        salaryStructure: {
          base,
          hra,
          da,
          other,
        },

        target,

        targetAchieved,

        bonus,

        totalSalary,
      });

      await newStaff.save();

      res.json(newStaff);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Error saving staff",
      });
    }
  },
);

/*
GET STAFF
*/

router.get("/", async (req, res) => {
  try {
    const data = await Staff.find()
      .populate("clinic");

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching staff",
    });
  }
});

/*
UPDATE STAFF
*/

router.put(
  "/:id",

  upload.fields([
  {
    name: "profileImage",
    maxCount: 1,
  },

  {
    name: "certificateImage",
    maxCount: 1,
  },
]),

  async (req, res) => {
    try {
      const base = Number(req.body.base || 0);

      const hra = Number(req.body.hra || 0);

      const da = Number(req.body.da || 0);

      const other = Number(req.body.other || 0);

      const target = Number(req.body.target || 0);

      const targetAchieved = Number(
        req.body.targetAchieved || 0,
      );

      let bonus = 0;

      if (targetAchieved >= target) {
        bonus = Number(req.body.bonus || 0);
      }

      const totalSalary =
        base +
        hra +
        da +
        other +
        bonus;

      const updated = await Staff.findByIdAndUpdate(
        req.params.id,

        {
          ...req.body,

          ctc: req.body.ctc,

          salaryStructure: {
            base,
            hra,
            da,
            other,
          },

          target,

          targetAchieved,

          bonus,

          totalSalary,

          ...(req.files?.profileImage?.[0] && {
  profileImage:
    req.files.profileImage[0].filename,
}),

...(req.files?.certificateImage?.[0] && {
  certificateImage:
    req.files.certificateImage[0]
      .filename,
}),
        },

        {
          new: true,
        },
      );

      res.json(updated);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Update error",
      });
    }
  },
);

/*
CHANGE PASSWORD
*/

router.put(
  "/change-password",

  authMiddleware,

  async (req, res) => {
    try {
      const staff = await Staff.findById(req.user.id);

      if (!staff) {
        return res.status(404).json({
          message: "User not found",
        });
      }

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
        message: "Password updated successfully",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Server error",
      });
    }
  },
);

/*
FORGOT PASSWORD
*/

router.post(
  "/forgot-password",

  async (req, res) => {
    try {
      const staff = await Staff.findOne({
        phone: req.body.phone,
      });

      if (!staff) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      /*
      GENERATE RANDOM PASSWORD
      */

      const newPassword = Math.random()
        .toString(36)
        .slice(-8);

      const hashed = await bcrypt.hash(
        newPassword,
        10,
      );

      staff.password = hashed;

      await staff.save();

      res.json({
        message: "New password generated",

        password: newPassword,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error",
      });
    }
  },
);

/*
DELETE STAFF
*/

router.delete("/:id", async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Delete error",
    });
  }
});


router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Staff.find({
      role: "doctor",
    });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching doctors",
    });
  }
});


// backend/routes/staff.js

// This route returns the logged-in user's data (including their clinic ID)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Assuming 'auth' middleware attaches user info to req.user
    const staffMember = await User.findById(req.user.id).select('-password');
    
    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json(staffMember);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
