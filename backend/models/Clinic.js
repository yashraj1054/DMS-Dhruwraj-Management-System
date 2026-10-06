const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema({

 clinicId:{
  type:String,
  unique:true,
  default:"DHC-"
 },

 name:{
  type:String,
  required:true
 },

 location:String,

 city:String,

 phone:String,

 gstNumber:String,

 patientPrefix:{
  type:String,
  default:"DHC-"
 },

 staffPrefix:{
  type:String,
  default:"DHC-"
 },

 invoicePrefix:{
  type:String,
  default:"DHC-"
 }

},{
 timestamps:true
});

module.exports = mongoose.model(
 "Clinic",
 clinicSchema
);