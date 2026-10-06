const Appointment = require("../models/Appointment");

/*
CREATE APPOINTMENT
*/

exports.createAppointment = async (
  req,
  res
) => {
  try {
    const appointment =
      await Appointment.create({
        ...req.body,
      });

    res.status(201).json(appointment);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
GET ALL APPOINTMENTS
*/

exports.getAppointments = async (
  req,
  res
) => {
  try {
    const appointments =
      await Appointment.find()

        .populate("patient")

        .populate("doctor")

        .populate("clinic")

        .sort({
          createdAt: -1,
        });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
DOCTOR APPOINTMENTS
*/

exports.getMyAppointments = async (
  req,
  res
) => {
  try {
    const appointments =
      await Appointment.find({
        doctor: req.user.id,
      })

        .populate("patient")

        .populate("clinic")

        .sort({
          appointmentDate: 1,
        });

    res.json(appointments);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
SAVE FULL PRESCRIPTION
*/

exports.savePrescription = async (
  req,
  res
) => {
  try {
    const { formData, followUps } =
      req.body;

    const appointment =
      await Appointment.findByIdAndUpdate(
        req.params.id,
        {
          formData,
          followUps,

          viewed: true,

          status: "completed",
        },
        {
          new: true,
        }
      );

    res.json(appointment);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Error saving prescription",
    });
  }
};

/*
MARK VIEWED
*/

exports.markViewed = async (
  req,
  res
) => {
  try {
    const appointment =
      await Appointment.findByIdAndUpdate(
        req.params.id,
        {
          viewed: true,
          status: "viewed",
        },
        {
          new: true,
        }
      );

    res.json(appointment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Backend Controller Example
// exports.getPatientHistory = async (req, res) => {
//   try {
//     const history = await Appointment.findOne({ 
//       patient: req.params.patientId,
//       formData: { $ne: null } // Find an appointment where formData is NOT null
//     })
//     .sort({ appointmentDate: -1, createdAt: -1 }) // Get the most recent one
//     .exec();

//     res.json(history);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching history" });
//   }
// };

// exports.getPatientHistory = async (req, res) => {
//   try {
//     const { patientId } = req.params;

//     // We search for appointments for this patient where 'formData' exists 
//     // AND 'formData.rx' is not empty.
//     const history = await Appointment.find({ 
//       patient: patientId, 
//       "formData.rx.churan": { $exists: true, $ne: "" } 
//     })
//     .sort({ appointmentDate: -1 }) // Sort newest to oldest
//     .lean();

//     if (!history || history.length === 0) {
//       return res.json({ formData: null, followUps: [] });
//     }

//     // Format the history for the frontend timeline
//     const followUps = history.map(app => ({
//       date: app.appointmentDate,
//       churan: app.formData.rx.churan,
//       tablets: app.formData.rx.tablets,
//       others: app.formData.rx.others,
//       notes: app.formData.diagnosis
//     }));

//     // Send the most recent record's data + the full timeline
//     res.json({
//       formData: history[0].formData,
//       followUps: followUps
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server Error" });
//   }
// };

exports.getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // 1. Fetch only the single most recent completed prescription record for this patient
    const latestAppointment = await Appointment.findOne({ 
      patient: patientId, 
      status: "completed",
      formData: { $exists: true }
    })
    .sort({ appointmentDate: -1 }) // Newest first
    .lean();

    // 2. If no history exists, return clean empty structures
    if (!latestAppointment) {
      return res.json({ formData: null, followUps: [] });
    }

    // 3. Send back the exact payload structure your frontend openAppointment() function reads
    res.json({
      formData: latestAppointment.formData,
      // Keep root followUps matching what was saved inside that appointment document
      followUps: latestAppointment.followUps || [] 
    });

  } catch (err) {
    console.error("History fetch server error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/appointments/clinic/:clinicId
exports.getClinicAppointments = async (req, res) => {
  try {
    const { clinicId } = req.params;

    // Search for appointments matching the clinic ID
    // We populate 'patient' to get the name and patientId for the list
    const appointments = await Appointment.find({ clinic: clinicId })
      .populate('patient', 'name patientId') 
      .sort({ appointmentDate: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: "Error fetching clinic data" });
  }
};