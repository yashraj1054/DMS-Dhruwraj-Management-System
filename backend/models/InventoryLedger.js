const mongoose = require('mongoose');

const inventoryLedgerSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },

    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },

    invoiceNumber: {
      type: String,
      default: ''
    },

    batchNumber: {
      type: String,
      default: ''
    },

    quantity: {
      type: Number,
      required: true
    },

    freeQuantity: {
      type: Number,
      default: 0
    },

    unitPrice: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    type: {
      type: String,
      enum: ['IN', 'OUT'],
      default: 'IN'
    },

    paymentStatus: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'PENDING'],
      default: 'PENDING'
    },

    paidAmount: {
      type: Number,
      default: 0
    },

    dueAmount: {
      type: Number,
      default: 0
    },

    reason: {
      type: String,
      default: 'Stock Purchase'
    },

    stockDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'InventoryLedger',
  inventoryLedgerSchema
);