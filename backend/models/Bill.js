// const mongoose = require("mongoose");

// const BillIngredientSchema = new mongoose.Schema(
//   {
//     inventoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Medicine",
//       default: null,
//     },

//     inventoryCategory: {
//       type: String,
//       trim: true,
//     },

//     ayurvedicSubtype: {
//       type: String,
//       trim: true,
//     },

//     name: {
//       type: String,
//       trim: true,
//     },

//     type: {
//       type: String,
//       trim: true,
//     },

//     qty: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     unit: {
//       type: String,
//       default: "gm",
//       trim: true,
//     },

//     pricePerGram: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { _id: false },
// );

// const BillItemSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     category: {
//       type: String,
//       enum: [
//         "Consultation",
//         "Medicine",
//         "Therapy",
//         "Ayurvedic Tab",
//         "Ayurvedic Churan",
//         "Ayurvedic Oil",
//       ],
//       required: true,
//     },

//     // Exact Medicine inventory document used for stock deduction.
//     inventoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Medicine",
//       default: null,
//     },

//     inventoryCategory: {
//       type: String,
//       trim: true,
//     },

//     ayurvedicSubtype: {
//       type: String,
//       trim: true,
//     },

//     qty: {
//       type: Number,
//       default: 1,
//       min: 0,
//     },

//     unit: {
//       type: String,
//       default: "Qty",
//       trim: true,
//     },

//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     pricePerUnit: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     pricePerGram: {
//       type: Number,
//       default: null,
//     },

//     pricePerMl: {
//       type: Number,
//       default: null,
//     },

//     totalGm: {
//       type: Number,
//       default: null,
//     },

//     discount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     gst: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     base: {
//       type: Number,
//       default: 0,
//     },

//     discountAmount: {
//       type: Number,
//       default: 0,
//     },

//     taxableAmount: {
//       type: Number,
//       default: 0,
//     },

//     gstAmount: {
//       type: Number,
//       default: 0,
//     },

//     total: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     ingredients: {
//       type: [BillIngredientSchema],
//       default: [],
//     },
//   },
//   {
//     _id: false,
//   },
// );

// const BillSchema = new mongoose.Schema({
//   invoiceId: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   clinicId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Clinic",
//     required: true,
//   },

//   patientName: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   mobileNo: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   items: {
//     type: [BillItemSchema],
//     required: true,
//     validate: {
//       validator: (items) => Array.isArray(items) && items.length > 0,
//       message: "At least one item is required",
//     },
//   },

//   totalAmount: {
//     type: Number,
//     required: true,
//     min: 0,
//   },

//   paymentMethod: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   breakdown: {
//     consultationTotal: { type: Number, default: 0 },
//     medicineTotal: { type: Number, default: 0 },
//     therapyTotal: { type: Number, default: 0 },
//     ayurvedicTabTotal: { type: Number, default: 0 },
//     ayurvedicChuranTotal: { type: Number, default: 0 },
//     ayurvedicOilTotal: { type: Number, default: 0 },
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// BillSchema.index(
//   { clinicId: 1, invoiceId: 1 },
//   { unique: true },
// );

// module.exports = mongoose.model("Bill", BillSchema);


const mongoose = require("mongoose");

const BillIngredientSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },
    inventoryCategory: { type: String, trim: true },
    ayurvedicSubtype: { type: String, trim: true },
    name: { type: String, trim: true },
    type: { type: String, trim: true },
    qty: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "gm", trim: true },
    pricePerGram: { type: Number, default: 0 },
  },
  { _id: false },
);

const BillItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Consultation",
        "Medicine",
        "Therapy",
        "Ayurvedic Tab",
        "Ayurvedic Churan",
        "Ayurvedic Oil",
      ],
      required: true,
    },

    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },

    inventoryCategory: { type: String, trim: true },
    ayurvedicSubtype: { type: String, trim: true },

    qty: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: "Qty", trim: true },

    price: { type: Number, required: true, min: 0 },
    pricePerUnit: { type: Number, default: 0, min: 0 },
    pricePerGram: { type: Number, default: null },
    pricePerMl: { type: Number, default: null },
    totalGm: { type: Number, default: null },

    discount: { type: Number, default: 0, min: 0 },
    gst: { type: Number, default: 0, min: 0 },

    base: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },

    total: { type: Number, required: true, min: 0 },

    ingredients: {
      type: [BillIngredientSchema],
      default: [],
    },
  },
  { _id: false },
);

const BillSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    trim: true,
  },

  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinic",
    required: true,
  },

  // Reference to the registered patient document.
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    default: null,
  },

  // Human-readable Patient ID, for example DHCV-P001.
  patientCode: {
    type: String,
    trim: true,
    default: "",
  },

  // Patient snapshot at the time the bill was generated.
  patientName: {
    type: String,
    required: true,
    trim: true,
  },

  mobileNo: {
    type: String,
    required: true,
    trim: true,
  },

  patientAddress: {
    type: String,
    trim: true,
    default: "",
  },

  // Consultation charge before tax.
  consultationFee: {
    type: Number,
    default: 0,
    min: 0,
  },

  items: {
    type: [BillItemSchema],
    required: true,
    validate: {
      validator: (items) =>
        Array.isArray(items) && items.length > 0,
      message: "At least one item is required",
    },
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },

  paymentMethod: {
    type: String,
    required: true,
    trim: true,
  },

  breakdown: {
    consultationTotal: { type: Number, default: 0 },
    medicineTotal: { type: Number, default: 0 },
    therapyTotal: { type: Number, default: 0 },
    ayurvedicTabTotal: { type: Number, default: 0 },
    ayurvedicChuranTotal: { type: Number, default: 0 },
    ayurvedicOilTotal: { type: Number, default: 0 },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

BillSchema.index(
  { clinicId: 1, invoiceId: 1 },
  { unique: true },
);

module.exports = mongoose.model("Bill", BillSchema);
