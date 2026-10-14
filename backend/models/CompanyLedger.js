
// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     productName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1,
//     },
//     invoiceNumber: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     batchNumber: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     mrp: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     purchaseRate: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//   },
//   { _id: true }
// );

// const paymentSchema = new mongoose.Schema(
//   {
//     amount: {
//       type: Number,
//       required: true,
//       min: 0.01,
//     },
//     paymentDate: {
//       type: Date,
//       required: true,
//       default: Date.now,
//     },
//     method: {
//       type: String,
//       enum: ["Cash", "UPI"],
//       required: true,
//     },
//     transactionNumber: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     note: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     recordedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// const ledgerSchema = new mongoose.Schema(
//   {
//     ledgerId: {
//       type: String,
//       required: true,
//     },
//     purchaseDate: {
//       type: Date,
//       required: true,
//     },
//     products: {
//       type: [productSchema],
//       validate: {
//         validator: (products) => products.length > 0,
//         message: "At least one product is required.",
//       },
//     },
//     payments: {
//       type: [paymentSchema],
//       default: [],
//     },
//     note: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// const companyLedgerSchema = new mongoose.Schema(
//   {
//     companyName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     mrName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     mrMobile: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     discountPercentage: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 100,
//     },
//     ledgers: {
//       type: [ledgerSchema],
//       default: [],
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// companyLedgerSchema.index({
//   createdBy: 1,
//   companyName: 1,
// });

// module.exports = mongoose.model(
//   "CompanyLedger",
//   companyLedgerSchema
// );


const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "Other Products" },
    quantity: { type: Number, required: true, min: 1 },
    invoiceNumber: { type: String, trim: true, default: "" },
    batchNumber: { type: String, trim: true, default: "" },
    mrp: { type: Number, required: true, min: 0 },
    basePurchaseRate: { type: Number, required: true, min: 0, default: 0 },
    gstPercentage: { type: Number, min: 0, max: 100, default: 5 },
    gstAmount: { type: Number, min: 0, default: 0 },
    purchaseRate: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true, default: Date.now },
    method: { type: String, enum: ["Cash", "UPI"], required: true },
    transactionNumber: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ledgerSchema = new mongoose.Schema(
  {
    ledgerId: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    products: {
      type: [productSchema],
      validate: {
        validator: (products) => products.length > 0,
        message: "At least one product is required.",
      },
    },
    payments: { type: [paymentSchema], default: [] },
    note: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const companyLedgerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    mrName: { type: String, required: true, trim: true },
    mrMobile: { type: String, required: true, trim: true },
    gstNumber: { type: String, trim: true, default: "" },
    // Kept for older company records and as a fallback discount.
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    categoryDiscounts: [
      {
        category: { type: String, required: true, trim: true },
        discountPercentage: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    ledgers: { type: [ledgerSchema], default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

companyLedgerSchema.index({ createdBy: 1, companyName: 1 });

module.exports = mongoose.model("CompanyLedger", companyLedgerSchema);
