const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  // CRITICAL: Added these two fields to fix the "ID: Error"
  invoiceId: { type: String, required: true }, 
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },

  patientName: { type: String, required: true },
  mobileNo: { type: String, required: true },
  items: [{
    name: { type: String },
    category: { type: String, enum: ['Consultation', 'Medicine', 'Therapy'] },
    price: { type: Number },
    qty: { type: Number, default: 1 }, // Changed 'quantity' to 'qty' to match your frontend state
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    total: { type: Number }
  }],
  totalAmount: { type: Number, required: true },
  
  // Updated Enum to match your frontend strings "Cash Payment" etc or just "Cash"
  paymentMethod: { type: String, required: true }, 

  breakdown: {
    consultationTotal: { type: Number, default: 0 },
    medicineTotal: { type: Number, default: 0 },
    therapyTotal: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', BillSchema);