const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true
    },

    mrName: {
      type: String,
      default: ''
    },

    mrPhone: {
      type: String,
      default: ''
    },

    discount: {
      type: Number,
      default: 0
    },

    totalBusiness: {
      type: Number,
      default: 0
    },

    totalPaid: {
      type: Number,
      default: 0
    },

    balanceDue: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'Company',
  companySchema
);