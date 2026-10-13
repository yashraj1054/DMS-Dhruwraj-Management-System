const router = require("express").Router();

const Patient = require("../models/Patient");

const Clinic = require("../models/Clinic");

const upload = require("../middleware/upload");

const authMiddleware = require("../middleware/authMiddleware");

/*
CREATE
*/

// router.post(
//   "/",

//   upload.single("profileImage"),

//   async (req, res) => {
//     try {
//       const clinic = await Clinic.findById(req.body.clinic);

//       console.log("PATIENT ROUTE VERSION: SIX DIGITS");
//       console.log("CLINIC:", req.body.clinic);

//       const count = await Patient.countDocuments({
//         clinic: req.body.clinic,
//       });

//       const patientId =
//         `${clinic.patientPrefix}${String(count + 1).padStart(6, "0")}`;

//         console.log("GENERATED PATIENT ID:", patientId);

//       const newPatient = new Patient({
//         ...req.body,

//         patientId,

//         profileImage: req.file?.filename,
//       });

//       await newPatient.save();

//       res.json(newPatient);
//     } catch (err) {
//       console.log(err);

//       res.status(500).json({
//         message: "Error",
//       });
//     }
//   },
// );
/*
CREATE PATIENT — SEQUENTIAL SIX-DIGIT ID
*/

router.post(
  "/",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const clinicId = req.body.clinic;

      const clinic = await Clinic.findById(clinicId);

      if (!clinic) {
        return res.status(404).json({
          message: "Clinic not found",
        });
      }

      const prefix = clinic.patientPrefix || "";

      // Fetch patient IDs for this clinic only
      const patients = await Patient.find({
        clinic: clinicId,
        patientId: {
          $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\d{6}[A-Z]*$`,
        },
      })
        .select("patientId")
        .lean();

      // Find the highest numeric portion of existing IDs.
      // Example: 000041A and 000041B both map to 41.
      let maxNumber = 0;

      for (const patient of patients) {
        const id = patient.patientId || "";

        const match = id.match(
          new RegExp(
            `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\d{6})[A-Z]*$`
          )
        );

        if (match) {
          maxNumber = Math.max(maxNumber, Number(match[1]));
        }
      }

      // Generate the next sequential ID.
      // Skip any ID that is already in use.
      let nextNumber = maxNumber + 1;
      let patientId;

      while (true) {
        patientId = `${prefix}${String(nextNumber).padStart(6, "0")}`;

        const exists = await Patient.exists({
          clinic: clinicId,
          patientId,
        });

        if (!exists) break;

        nextNumber++;
      }

      const newPatient = new Patient({
        ...req.body,
        patientId,
        profileImage: req.file?.filename,
      });

      await newPatient.save();

      return res.status(201).json(newPatient);
    } catch (err) {
      console.error("CREATE PATIENT ERROR:", err);

      return res.status(500).json({
        message: "Unable to create patient",
        error: err.message,
      });
    }
  }
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
