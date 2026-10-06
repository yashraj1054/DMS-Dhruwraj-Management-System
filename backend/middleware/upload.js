const multer = require("multer");

const storage = multer.diskStorage({

 destination:(req,file,cb)=>{

  cb(null,"uploads/");

 },

 filename:(req,file,cb)=>{

  const safeName = file.originalname

   .replace(/\s+/g,"-")

   .replace(/[^\w.-]/g,"");



  cb(

   null,

   Date.now() + "-" + safeName

  );

 }

});

module.exports = multer({

 storage

});