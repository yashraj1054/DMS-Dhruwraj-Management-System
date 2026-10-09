// const mongoose = require('mongoose');

// const BillSchema = new mongoose.Schema({
//   // CRITICAL: Added these two fields to fix the "ID: Error"
//   invoiceId: { type: String, required: true }, 
//   clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },

//   patientName: { type: String, required: true },
//   mobileNo: { type: String, required: true },
//   items: [{
//     name: { type: String },
//     category: { type: String, enum: ['Consultation', 'Medicine', 'Therapy'] },
//     price: { type: Number },
//     qty: { type: Number, default: 1 }, // Changed 'quantity' to 'qty' to match your frontend state
//     discount: { type: Number, default: 0 },
//     gst: { type: Number, default: 0 },
//     total: { type: Number }
//   }],
//   totalAmount: { type: Number, required: true },
  
//   // Updated Enum to match your frontend strings "Cash Payment" etc or just "Cash"
//   paymentMethod: { type: String, required: true }, 

//   breakdown: {
//     consultationTotal: { type: Number, default: 0 },
//     medicineTotal: { type: Number, default: 0 },
//     therapyTotal: { type: Number, default: 0 }
//   },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Bill', BillSchema);


// const mongoose = require("mongoose");

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

//         // Ayurvedic billing
//         "Ayurvedic Tab",
//         "Ayurvedic Churan",
//         "Ayurvedic Oil",
//       ],
//       required: true,
//     },

//     // Quantity entered by user
//     // Medicine = number of pieces
//     // Ayurvedic Tab = number of tablets
//     // Churan = total grams
//     // Oil = total ml
//     qty: {
//       type: Number,
//       default: 1,
//       min: 0,
//     },

//     // Qty / Tab / gm / ml
//     unit: {
//       type: String,
//       default: "Qty",
//       trim: true,
//     },

//     // Base selling price
//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     // Useful for Ayurvedic products
//     pricePerUnit: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // Ayurvedic Churan
//     pricePerGram: {
//       type: Number,
//       default: null,
//     },

//     // Ayurvedic Oil
//     pricePerMl: {
//       type: Number,
//       default: null,
//     },

//     // Total grams for Churan
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

//     // Calculation fields
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

//     // ------------------------------------------------
//     // AYURVEDIC CHURAN INGREDIENTS
//     // ------------------------------------------------

//     ingredients: [
//       {
//         name: {
//           type: String,
//           trim: true,
//         },

//         type: {
//           type: String,
//           trim: true,
//         },

//         qty: {
//           type: Number,
//           default: 0,
//         },

//         unit: {
//           type: String,
//           default: "gm",
//         },

//         pricePerGram: {
//           type: Number,
//           default: 0,
//         },
//       },
//     ],
//   },
//   {
//     _id: false,
//   }
// );


// const BillSchema = new mongoose.Schema(
//   {
//     // ------------------------------------------------
//     // INVOICE
//     // ------------------------------------------------

//     invoiceId: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     clinicId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Clinic",
//       required: true,
//     },

//     // ------------------------------------------------
//     // PATIENT
//     // ------------------------------------------------

//     patientName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     mobileNo: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // ------------------------------------------------
//     // ITEMS
//     // ------------------------------------------------

//     items: {
//       type: [BillItemSchema],
//       required: true,

//       validate: {
//         validator: function (items) {
//           return Array.isArray(items) && items.length > 0;
//         },
//         message: "At least one item is required",
//       },
//     },

//     // ------------------------------------------------
//     // TOTAL
//     // ------------------------------------------------

//     totalAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     // ------------------------------------------------
//     // PAYMENT
//     // ------------------------------------------------

//     paymentMethod: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // ------------------------------------------------
//     // BREAKDOWN
//     // ------------------------------------------------

//     breakdown: {
//       consultationTotal: {
//         type: Number,
//         default: 0,
//       },

//       medicineTotal: {
//         type: Number,
//         default: 0,
//       },

//       therapyTotal: {
//         type: Number,
//         default: 0,
//       },

//       // Ayurvedic totals
//       ayurvedicTabTotal: {
//         type: Number,
//         default: 0,
//       },

//       ayurvedicChuranTotal: {
//         type: Number,
//         default: 0,
//       },

//       ayurvedicOilTotal: {
//         type: Number,
//         default: 0,
//       },
//     },

//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   }
// );


// // Prevent duplicate invoice IDs inside the same clinic
// BillSchema.index(
//   {
//     clinicId: 1,
//     invoiceId: 1,
//   },
//   {
//     unique: true,
//   }
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

    inventoryCategory: {
      type: String,
      trim: true,
    },

    ayurvedicSubtype: {
      type: String,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      trim: true,
    },

    qty: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      default: "gm",
      trim: true,
    },

    pricePerGram: {
      type: Number,
      default: 0,
    },
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

    // Exact Medicine inventory document used for stock deduction.
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },

    inventoryCategory: {
      type: String,
      trim: true,
    },

    ayurvedicSubtype: {
      type: String,
      trim: true,
    },

    qty: {
      type: Number,
      default: 1,
      min: 0,
    },

    unit: {
      type: String,
      default: "Qty",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerUnit: {
      type: Number,
      default: 0,
      min: 0,
    },

    pricePerGram: {
      type: Number,
      default: null,
    },

    pricePerMl: {
      type: Number,
      default: null,
    },

    totalGm: {
      type: Number,
      default: null,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    gst: {
      type: Number,
      default: 0,
      min: 0,
    },

    base: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    ingredients: {
      type: [BillIngredientSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
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

  items: {
    type: [BillItemSchema],
    required: true,
    validate: {
      validator: (items) => Array.isArray(items) && items.length > 0,
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