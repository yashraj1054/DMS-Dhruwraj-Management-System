const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({


 action:String, 
 // purchase | usage | manual-update

 quantity:Number,

 previousStock:Number,

 newStock:Number,

 updatedBy:String,

 type:String,
 // purchase | usage

 date:{
  type:Date,
  default:Date.now
 }

});



const medicineSchema = new mongoose.Schema({

 clinicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Clinic', 
    required: true 
  },

 name:String,

 brand:String,

 mrName:String,

 mrPhone:String,

 category:String,

 type:String,

 mrp:Number,

 discount:Number,

 quantity:Number,

 quantityType:String,

 clinicCost:Number,

 history:[historySchema]

},
{
 timestamps:true
});

module.exports = mongoose.model(
 "Medicine",
 medicineSchema
);