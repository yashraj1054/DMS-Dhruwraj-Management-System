// const mongoose = require("mongoose");

// const historySchema = new mongoose.Schema({


//  action:String, 
//  // purchase | usage | manual-update

//  quantity:Number,

//  previousStock:Number,

//  newStock:Number,

//  updatedBy:String,

//  type:String,
//  // purchase | usage

//  date:{
//   type:Date,
//   default:Date.now
//  }

// });



// const medicineSchema = new mongoose.Schema({

//  clinicId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Clinic', 
//     required: true 
//   },

//  name:String,

//  brand:String,

//  mrName:String,

//  mrPhone:String,

//  category:String,

//  type:String,

//  mrp:Number,

//  discount:Number,

//  quantity:Number,

//  quantityType:String,

//  clinicCost:Number,

//  history:[historySchema]

// },
// {
//  timestamps:true
// });

// module.exports = mongoose.model(
//  "Medicine",
//  medicineSchema
// );


const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  action: String, // purchase | usage | manual-update | billing | created | updated
  quantity: Number,
  previousStock: Number,
  newStock: Number,
  updatedBy: String,
  type: String, // purchase | usage | billing
  referenceId: String, // unique stock operation reference, useful for rollback/audit
  invoiceId: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const medicineSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    name: String,
    brand: String,
    mrName: String,
    mrPhone: String,
    category: String,
    type: String,

    // Used by Ayurvedic Churans & Bhasams to distinguish Bhasam/Churan.
    ayurvedicSubtype: {
      type: String,
      enum: ["", "Churan", "Bhasam"],
      default: "",
    },

    mrp: Number,
    discount: Number,
    quantity: Number,
    quantityType: String,
    clinicCost: Number,

    history: [historySchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Medicine", medicineSchema);