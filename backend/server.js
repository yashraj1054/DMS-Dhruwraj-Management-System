const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const clinicRoutes = require("./routes/clinicRoutes");
const staffRoutes = require("./routes/staffRoutes");
const patientRoutes = require("./routes/patientRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const billRoutes = require("./routes/billRoutes");
const financeRoutes = require('./routes/financeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const therapyRoutes = require('./routes/therapyRoutes');
const inventoryLedgerRoutes = require('./routes/inventoryLedgerRoutes');
const companyRoutes = require('./routes/companyRoutes');
const appointmentRoutes = require("./routes/appointmentRoutes");





const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/bills", billRoutes); 
app.use("/api/finance", financeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/therapies", therapyRoutes);
app.use('/api/inventory-ledger', inventoryLedgerRoutes);
app.use('/api/companies', companyRoutes);
app.use("/api/appointments", appointmentRoutes);





mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));