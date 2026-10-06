const router = require("express").Router();

const mongoose = require('mongoose');
const Appointment = require("../models/Appointment");

const authMiddleware = require(
  "../middleware/authMiddleware"
);


const {
  createAppointment,
  getAppointments,
  getMyAppointments,
  savePrescription,
  markViewed,
  getPatientHistory,
} = require(
  "../controllers/appointmentController"
);

/*
CREATE
*/

router.post(
  "/",
  authMiddleware,
  createAppointment
);

/*
ALL
*/

router.get(
  "/",
  authMiddleware,
  getAppointments
);

/*
DOCTOR
*/

router.get(
  "/my",
  authMiddleware,
  getMyAppointments
);

/*
SAVE PRESCRIPTION
*/

router.put(
  "/:id/prescription",
  authMiddleware,
  savePrescription
);

/*
MARK VIEWED
*/

router.put(
  "/:id/view",
  authMiddleware,
  markViewed
);

router.get("/patient-history/:patientId", authMiddleware, getPatientHistory);

router.get('/clinics/:clinicId', authMiddleware, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { date } = req.query;

    // 3. Validation: If the ID format is wrong, return a 400 instead of crashing
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
      return res.status(400).json({ message: "Invalid Clinic ID format" });
    }

    // 4. Casting: Convert string to ObjectId
    let query = { 
      clinic: new mongoose.Types.ObjectId(clinicId) 
    };

    if (date) {
      // Create date range for the specific day
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      
      query.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name patientId')
      .sort({ time: 1 });

    res.json(appointments);
  } catch (err) {
    // 5. Check your Backend Terminal/Console for this log!
    console.error("BACKEND CRASH LOG:", err.message);
    res.status(500).json({ message: "Server Error", details: err.message });
  }
});

router.get("=/diet-chart/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    // FIND LATEST APPOINTMENT
    const appointment = await Appointment.findOne({
      patient: patientId,
    })
      .sort({ createdAt: -1 })
      .populate("patient");

    if (!appointment) {
      return res.status(404).json({
        message: "Diet chart not found",
      });
    }

    // RETURN FULL STRUCTURE
    res.json({
      patient: appointment.patient,
      formData: appointment.formData,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.get("/public/how-to-take/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    // FIND LATEST APPOINTMENT
    const appointment = await Appointment.findOne({
      patient: patientId,
    })
      .sort({ createdAt: -1 })
      .populate("patient");

    if (!appointment) {
      return res.status(404).json({
        message: "Diet chart not found",
      });
    }

    // RETURN FULL STRUCTURE
    res.json({
      patient: appointment.patient,
      formData: appointment.formData,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;