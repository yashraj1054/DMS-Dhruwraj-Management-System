require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Clinic = require("../models/Clinic");

mongoose.connect(process.env.MONGO_URI)
.then(async()=>{

    const clinic = await Clinic.create({
        name:"Main Clinic",
        address:"Delhi",
        phone:"9999999999"
    });

    const hashedPassword = await bcrypt.hash("admin123",10);

    await User.create({
        name:"Super Admin",
        email:"admin@dhruwraj.com",
        password:hashedPassword,
        role:"admin",
        clinic:clinic._id
    });

    console.log("Admin created");
    process.exit();

});