// const mongoose = require("mongoose");

// const staffSchema = new mongoose.Schema({

//  profileImage:String,

//  staffId:{
//   type:String,
//   required:true
//  },

//  name:{
//   type:String,
//   required:true
//  },

//  phone:{
//   type:String,
//   required:true
//  },

//  email:String,

//  aadhaar:String,

//  address:String,

//  dob:String,

//  certificateNumber:String,

//  gender:String,

//  role:{
//   type:String,
//   enum:[
//    "doctor",
//    "receptionist",
//    "pharmacist",
//    "therapist",
//    "cleaning"
//   ]
//  },

//  salary:Number,

//  password:{
//   type:String,
//   required:true
//  },

//  clinic:{
//   type:mongoose.Schema.Types.ObjectId,
//   ref:"Clinic"
//  }

// },{
//  timestamps:true
// });

// module.exports = mongoose.model(
//  "Staff",
//  staffSchema
// );


const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
 {
  profileImage: String,

  staffId: {
   type: String,
   required: true,
  },

  name: {
   type: String,
   required: true,
  },

  phone: {
   type: String,
   required: true,
  },

  email: String,

  aadhaar: String,

  address: String,

  dob: String,

  certificateNumber: String,
  
  certificateImage: String,

  gender: String,

  role: {
   type: String,
   enum: [
    "doctor",
    "receptionist",
    "pharmacist",
    "therapist",
    "cleaning",
   ],
  },

  // yearly package
  ctc: {
   type: Number,
   default: 0,
  },

  // salary breakup
  salaryStructure: {
   base: {
    type: Number,
    default: 0,
   },

   hra: {
    type: Number,
    default: 0,
   },

   da: {
    type: Number,
    default: 0,
   },

   other: {
    type: Number,
    default: 0,
   },
  },

  // monthly target
  target: {
   type: Number,
   default: 0,
  },

  // completed target
  targetAchieved: {
   type: Number,
   default: 0,
  },

  // incentive
  bonus: {
   type: Number,
   default: 0,
  },

  // final monthly salary
  totalSalary: {
   type: Number,
   default: 0,
  },

  password: {
   type: String,
   required: true,
  },

  clinic: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Clinic",
  },
 },
 {
  timestamps: true,
 }
);

module.exports = mongoose.model("Staff", staffSchema);