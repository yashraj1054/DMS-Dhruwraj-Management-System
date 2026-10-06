const Clinic = require("../models/Clinic");


// create clinic
exports.createClinic = async(req,res)=>{

 try{

  const exists = await Clinic.findOne({
   clinicId:req.body.clinicId
  });

  if(exists){

   return res.status(400).json({

    message:"Clinic ID already exists"

   });

  }



  const clinic = await Clinic.create(req.body);

  res.json(clinic);

 }
 catch(err){

  res.status(500).json({

   message:err.message

  });

 }

};



// get clinics
exports.getClinics = async(req,res)=>{

 try{

  const clinics = await Clinic
   .find()
   .sort({createdAt:-1});

  res.json(clinics);

 }
 catch(err){

  res.status(500).json({

   message:err.message

  });

 }

};



// delete clinic
exports.deleteClinic = async(req,res)=>{

 try{

  await Clinic.findByIdAndDelete(
   req.params.id
  );

  res.json({

   message:"Clinic deleted"

  });

 }
 catch(err){

  res.status(500).json({

   message:err.message

  });

 }

};



// update clinic
exports.updateClinic = async(req,res)=>{

 try{

  const clinic = await Clinic
   .findByIdAndUpdate(

    req.params.id,
    req.body,
    {new:true}

   );

  res.json(clinic);

 }
 catch(err){

  res.status(500).json({

   message:err.message

  });

 }

};