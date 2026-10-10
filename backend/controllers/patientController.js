// const Patient = require("../models/Patient");

// const getPatients = async (req, res) => {
//   try {
//     const patients = await Patient.find();

//     res.json(patients);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// const createPatient = async (req, res) => {
//   try {
//     const patient = await Patient.create(req.body);

//     res.status(201).json(patient);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// module.exports = {
//   getPatients,
//   createPatient,
// };


const mongoose = require("mongoose");
const Patient = require("../models/Patient");

const getPatients = async (req, res) => {
  try {
    const { clinicId } = req.query;
    const filter = {};

    if (clinicId) {
      if (!mongoose.Types.ObjectId.isValid(clinicId)) {
        return res.status(400).json({
          message: "Invalid clinic ID.",
        });
      }

      filter.clinic = clinicId;
    }

    const patients = await Patient.find(filter)
      .sort({ name: 1 })
      .lean();

    res.json(patients);
  } catch (error) {
    console.error("GET PATIENTS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);

    res.status(201).json(patient);
  } catch (error) {
    console.error("CREATE PATIENT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getPatients,
  createPatient,
};
