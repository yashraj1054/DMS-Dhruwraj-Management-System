const mongoose = require("mongoose");

const therapySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    code: String,

    price: {
      type: Number,
      required: true,
    },

    gst: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Therapy", therapySchema);