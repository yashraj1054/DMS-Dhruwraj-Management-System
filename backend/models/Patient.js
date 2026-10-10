// const mongoose = require("mongoose");

// const patientSchema = new mongoose.Schema({

//  patientId:String,

//  name:String,

//  phone:String,

//  email:String,

//  gender:String,

//  dob:String,

//  age:Number,

//  address:String,

//  city:String,

//  state:String,

//  pinCode:String,

//  occupation:String,

//  height:String,

//  weight:String,

//  maritalStatus:String,

//  referredBy:String,

//  medicineId:String,

//  clinic:{
//   type:mongoose.Schema.Types.ObjectId,
//   ref:"Clinic"
//  },

//  profileImage:String

// },
// {
//  timestamps:true
// });

// module.exports = mongoose.model(
//  "Patient",
//  patientSchema
// );


const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientId: String,
    name: String,
    phone: String,
    email: String,
    gender: String,
    dob: String,
    age: Number,

    address: String,
    city: String,
    state: String,
    pinCode: String,

    occupation: String,
    height: String,
    weight: String,
    maritalStatus: String,
    referredBy: String,
    medicineId: String,

    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },

    // Updated after a bill is successfully generated.
    lastVisitDate: {
      type: Date,
      default: null,
    },

    profileImage: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Patient", patientSchema);
