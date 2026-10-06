const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },

    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },

    appointmentDate: Date,

    time: String,

    notes: String,

    status: {
      type: String,
      default: "pending",
    },

    viewed: {
      type: Boolean,
      default: false,
    },

    // FULL PRESCRIPTION FORM

    formData: {
      type: Object,
      default: {},
    },

    // MULTIPLE FOLLOWUPS

    followUps: [
      {
        date: String,

        notes: String,

        churan: String,

        tablets: String,

        others: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Appointment",
  appointmentSchema
);