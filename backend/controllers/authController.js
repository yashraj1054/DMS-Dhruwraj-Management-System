const User = require("../models/User");
const Staff = require("../models/Staff");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /*
   ADMIN LOGIN
  */

    const admin = await User.findOne({
      email,
    }).populate("clinic");

    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          id: admin._id,

          role: "admin",

          clinic: admin.clinic?._id,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1d",
        },
      );

      return res.json({
        token,

        user: {
          id: admin._id,

          name: admin.name,

          role: "admin",

          clinic: admin.clinic?._id,
        },
      });
    }

    /*
   STAFF LOGIN USING PHONE
  */

    const staff = await Staff.findOne({
      phone: email,
    }).populate("clinic");

    if (!staff) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let isMatch;

    if (staff.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, staff.password);
    } else {
      isMatch = password === staff.password;
    }

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: staff._id,

        role: staff.role,

        clinic: staff.clinic?._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d",
      },
    );

    res.json({
      token,

      user: {
        id: staff._id,

        staffId: staff.staffId,

        name: staff.name,

        role: staff.role,

        clinic: staff.clinic?._id,

        profileImage: staff.profileImage,

        clinicLocation: staff.clinic?.location,

        clinicName: staff.clinic?.name,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Login error",
    });
  }
};
