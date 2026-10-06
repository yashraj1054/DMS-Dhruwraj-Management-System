const router = require("express").Router();

const Patient = require("../models/Patient");

const Clinic = require("../models/Clinic");

const upload = require("../middleware/upload");

const authMiddleware = require("../middleware/authMiddleware");

/*
CREATE
*/

router.post(
  "/",

  upload.single("profileImage"),

  async (req, res) => {
    try {
      const clinic = await Clinic.findById(req.body.clinic);

      const count = await Patient.countDocuments({
        clinic: req.body.clinic,
      });

      const patientId =
        `${clinic.patientPrefix}${String(count + 1).padStart(3, "0")}`;

      const newPatient = new Patient({
        ...req.body,

        patientId,

        profileImage: req.file?.filename,
      });

      await newPatient.save();

      res.json(newPatient);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Error",
      });
    }
  },
);

/*
GET PATIENTS
*/

router.get(
  "/",

  authMiddleware,

  async (req, res) => {
    try {
      let filter = {};

      /*
   if admin → show all
   */

     

      const data = await Patient.find(filter).populate("clinic");

      res.json(data);
    } catch (err) {
      res.status(500).json({
        message: "Error fetching patients",
      });
    }
  },
);

/*
UPDATE
*/

router.put(
  "/:id",

  upload.single("profileImage"),

  async (req, res) => {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,

      {
        ...req.body,

        ...(req.file && {
          profileImage: req.file.filename,
        }),
      },

      { new: true },
    );

    res.json(updated);
  },
);

/*
DELETE
*/

router.delete(
  "/:id",

  async (req, res) => {
    await Patient.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted",
    });
  },
);

module.exports = router;
