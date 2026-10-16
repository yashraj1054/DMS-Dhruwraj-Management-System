// const router = require("express").Router();

// const mongoose = require("mongoose");

// const bcrypt = require("bcryptjs");

// const CompanyLedger = require("../models/CompanyLedger");
// const Counter = require("../models/Counter");

// const User = require("../models/User");

// const authMiddleware = require("../middleware/authMiddleware");

// // Every route requires a valid login token.

// router.use(authMiddleware);

// const isAdmin = (req, res) => {

//   if (req.user?.role !== "admin") {

//     res.status(403).json({

//       message: "Only an admin can perform this action.",

//     });

//     return false;

//   }

//   return true;

// };

// const getLedgerTotal = (ledger) =>

//   (ledger.products || []).reduce(

//     (sum, product) =>

//       sum + Number(product.quantity || 0) *

//         Number(product.purchaseRate || 0),

//     0

//   );

// const getPaidTotal = (ledger) =>

//   (ledger.payments || []).reduce(

//     (sum, payment) => sum + Number(payment.amount || 0),

//     0

//   );

// const serializeLedger = (ledger) => {

//   const data = ledger.toObject

//     ? ledger.toObject()

//     : ledger;

//   const total = getLedgerTotal(data);

//   const paid = getPaidTotal(data);

//   const balance = Math.max(0, total - paid);

//   return {

//     ...data,

//     totalAmount: Number(total.toFixed(2)),

//     paidAmount: Number(paid.toFixed(2)),

//     pendingAmount: Number(balance.toFixed(2)),

//     paymentStatus: balance <= 0.009 ? "Paid" : "Pending",

//   };

// };

// const serializeCompany = (company) => {

//   const data = company.toObject

//     ? company.toObject()

//     : company;

//   return {

//     ...data,

//     ledgers: (data.ledgers || []).map(serializeLedger),

//   };

// };

// const validateProducts = (products) => {

//   if (!Array.isArray(products) || products.length === 0) {

//     throw new Error("Add at least one product.");

//   }

//   for (const product of products) {

//     if (!String(product.productName || "").trim()) throw new Error("Every product needs a name.");

//     if (!String(product.category || "").trim()) throw new Error("Select a category for every product.");

//     if (!Number.isFinite(Number(product.quantity)) || Number(product.quantity) < 1) {

//       throw new Error("Product quantity must be at least 1.");

//     }

//     if (!Number.isFinite(Number(product.mrp)) || Number(product.mrp) < 0) {

//       throw new Error("MRP cannot be negative.");

//     }

//     if (!Number.isFinite(Number(product.companyRate)) || Number(product.companyRate) < 0) {

//       throw new Error("Company rate is required and cannot be negative.");

//     }

//   }

// };



// const normalizeProducts = (products, categoryDiscounts = [], legacyDiscount = 0) =>

//   products.map((product) => {

//     const category = String(product.category || "Other Products").trim();

//     const config = categoryDiscounts.find(

//       (item) => String(item.category || "").trim().toLowerCase() === category.toLowerCase()

//     );

//     const discountPercentage = config != null

//       ? Number(config.discountPercentage || 0)

//       : Number(legacyDiscount || 0);

//     const mrp = Number(product.mrp);

//     // Discount applies to the manually entered company rate, not printed MRP.

//     const companyRate = Number(product.companyRate);

//     const basePurchaseRate = Number((companyRate * (1 - discountPercentage / 100)).toFixed(2));

//     const gstPercentage = 5;

//     const gstAmount = Number((basePurchaseRate * gstPercentage / 100).toFixed(2));

//     const purchaseRate = Number((basePurchaseRate + gstAmount).toFixed(2));

//     return {

//       productName: String(product.productName).trim(),

//       category,

//       quantity: Number(product.quantity),

//       invoiceNumber: String(product.invoiceNumber || "").trim(),

//       batchNumber: String(product.batchNumber || "").trim(),

//       mrp,

//       companyRate,

//       basePurchaseRate,

//       gstPercentage,

//       gstAmount,

//       purchaseRate,

//       discountPercentage,

//     };

//   });



// const normalizeCategoryDiscounts = (items) => {

//   if (!Array.isArray(items)) throw new Error("Category discounts must be a list.");

//   const seen = new Set();

//   return items.map((item) => {

//     const category = String(item.category || "").trim();

//     const discountPercentage = Number(item.discountPercentage);

//     if (!category) throw new Error("Every discount needs a category.");

//     if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {

//       throw new Error(`Discount for ${category} must be between 0 and 100.`);

//     }

//     const key = category.toLowerCase();

//     if (seen.has(key)) throw new Error(`Duplicate discount category: ${category}.`);

//     seen.add(key);

//     return { category, discountPercentage };

//   });

// };



// const validatePayment = (payment) => {

//   const amount = Number(payment.amount);

//   if (!Number.isFinite(amount) || amount <= 0) {

//     throw new Error("Payment amount must be greater than zero.");

//   }

//   if (!["Cash", "UPI"].includes(payment.method)) {

//     throw new Error("Payment method must be Cash or UPI.");

//   }

//   if (

//     payment.method === "UPI" &&

//     !String(payment.transactionNumber || "").trim()

//   ) {

//     throw new Error("UPI transaction number is required.");

//   }

// };

// const normalizePayment = (payment, userId) => ({

//   amount: Number(payment.amount),

//   paymentDate: payment.paymentDate || new Date(),

//   method: payment.method,

//   transactionNumber:

//     payment.method === "UPI"

//       ? String(payment.transactionNumber || "").trim()

//       : "",

//   note: String(payment.note || "").trim(),

//   recordedBy: userId,

// });

// // Generate a globally unique ledger ID across all companies.
// const getNextLedgerId = async () => {
//   // Read existing IDs so the first deployment continues after the current maximum.
//   const companies = await CompanyLedger.find(
//     {},
//     { "ledgers.ledgerId": 1, _id: 0 }
//   ).lean();

//   let highestExistingNumber = 0;
//   for (const company of companies) {
//     for (const ledger of company.ledgers || []) {
//       const match = String(ledger.ledgerId || "").match(/^CL-(\d+)$/i);
//       if (match) highestExistingNumber = Math.max(highestExistingNumber, Number(match[1]) || 0);
//     }
//   }

//   // MongoDB applies this update atomically, so concurrent requests get different IDs.
//   const counter = await Counter.findOneAndUpdate(
//     { _id: "global-company-ledger" },
//     [
//       {
//         $set: {
//           seq: {
//             $add: [
//               { $max: [{ $ifNull: ["$seq", 0] }, highestExistingNumber] },
//               1,
//             ],
//           },
//         },
//       },
//     ],
//     { upsert: true,
//        new: true, 
//        setDefaultsOnInsert: false,
//        updatePipeline: true,
//        }
//   );

//   return `DHCL-${String(counter.seq).padStart(6, "0")}`;
// };

// // GET all companies belonging to the logged-in admin.

// router.get("/", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const companies = await CompanyLedger.find({

//       createdBy: req.user.id,

//     }).sort({ createdAt: -1 });

//     res.json(companies.map(serializeCompany));

//   } catch (error) {

//     console.error("Company ledger list error:", error);

//     res.status(500).json({ message: "Unable to fetch companies." });

//   }

// });

// // ADD company.

// router.post("/companies", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const {

//       companyName,

//       mrName,

//       mrMobile,

//       gstNumber = "",

//       categoryDiscounts = [],

//       discountPercentage = 0,

//     } = req.body;

//     if (

//       !String(companyName || "").trim() ||

//       !String(mrName || "").trim() ||

//       !String(mrMobile || "").trim()

//     ) {

//       return res.status(400).json({

//         message: "Company name, MR name and mobile number are required.",

//       });

//     }

//     const discount = Number(discountPercentage);

//     if (!Number.isFinite(discount) || discount < 0 || discount > 100) {

//       return res.status(400).json({

//         message: "Discount must be between 0 and 100.",

//       });

//     }

//     const normalizedCategoryDiscounts = normalizeCategoryDiscounts(categoryDiscounts);



//     const company = await CompanyLedger.create({

//       companyName: String(companyName).trim(),

//       mrName: String(mrName).trim(),

//       mrMobile: String(mrMobile).trim(),

//       gstNumber: String(gstNumber || "").trim().toUpperCase(),

//       categoryDiscounts: normalizedCategoryDiscounts,

//       discountPercentage: discount,

//       createdBy: req.user.id,

//     });

//     res.status(201).json(serializeCompany(company));

//   } catch (error) {

//     console.error("Company creation error:", error);

//     res.status(500).json({ message: "Unable to add company." });

//   }

// });

// // EDIT company details. Existing admin password is verified on the server.

// router.put("/companies/:companyId", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const {

//       adminPassword,

//       companyName,

//       mrName,

//       mrMobile,

//       gstNumber = "",

//       categoryDiscounts = [],

//       discountPercentage = 0,

//     } = req.body;

//     if (!adminPassword) {

//       return res.status(400).json({

//         message: "Admin password is required to edit company details.",

//       });

//     }

//     const admin = await User.findById(req.user.id);

//     if (!admin || admin.role !== "admin") {

//       return res.status(403).json({ message: "Admin account not found." });

//     }

//     const passwordMatches = await bcrypt.compare(

//       adminPassword,

//       admin.password

//     );

//     if (!passwordMatches) {

//       return res.status(401).json({ message: "Incorrect admin password." });

//     }

//     if (!mongoose.isValidObjectId(req.params.companyId)) {

//       return res.status(400).json({ message: "Invalid company ID." });

//     }

//     const company = await CompanyLedger.findOne({

//       _id: req.params.companyId,

//       createdBy: req.user.id,

//     });

//     if (!company) {

//       return res.status(404).json({ message: "Company not found." });

//     }

//     if (

//       !String(companyName || "").trim() ||

//       !String(mrName || "").trim() ||

//       !String(mrMobile || "").trim()

//     ) {

//       return res.status(400).json({

//         message: "Company name, MR name and mobile number are required.",

//       });

//     }

//     const discount = Number(discountPercentage);

//     if (!Number.isFinite(discount) || discount < 0 || discount > 100) {

//       return res.status(400).json({

//         message: "Discount must be between 0 and 100.",

//       });

//     }

//     const normalizedCategoryDiscounts = normalizeCategoryDiscounts(
//     categoryDiscounts
//   );

//   company.companyName = String(companyName).trim();
//   company.mrName = String(mrName).trim();
//   company.mrMobile = String(mrMobile).trim();
//   company.gstNumber = String(gstNumber || "").trim().toUpperCase();
//   company.categoryDiscounts = normalizedCategoryDiscounts;
//   company.discountPercentage = discount;

//   await company.save();
//   return res.json(serializeCompany(company));

//   } catch (error) {

//     console.error("Company edit error:", error);

//     res.status(500).json({ message: "Unable to update company." });

//   }

// });

// // ADD a ledger containing one or more products.

// router.post("/companies/:companyId/ledgers", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const { purchaseDate, products, note } = req.body;

//     if (!purchaseDate || Number.isNaN(Date.parse(purchaseDate))) {

//       return res.status(400).json({ message: "A valid purchase date is required." });

//     }

//     validateProducts(products);

//     const company = await CompanyLedger.findOne({

//       _id: req.params.companyId,

//       createdBy: req.user.id,

//     });

//     if (!company) {

//       return res.status(404).json({ message: "Company not found." });

//     }

//     const ledger = {

//       ledgerId: await getNextLedgerId(),

//       purchaseDate: new Date(purchaseDate),

//       products: normalizeProducts(

//         products,

//         company.categoryDiscounts || [],

//         company.discountPercentage || 0

//       ),

//       payments: [],

//       note: String(note || "").trim(),

//       createdBy: req.user.id,

//     };

//     company.ledgers.push(ledger);

//     await company.save();

//     const savedLedger = company.ledgers[company.ledgers.length - 1];

//     res.status(201).json(serializeLedger(savedLedger));

//   } catch (error) {

//     console.error("Ledger creation error:", error);

//     res.status(400).json({

//       message: error.message || "Unable to create ledger.",

//     });

//   }

// });

// // ADD a partial payment to an existing ledger.

// router.post(

//   "/companies/:companyId/ledgers/:ledgerId/payments",

//   async (req, res) => {

//     try {

//       if (!isAdmin(req, res)) return;

//       const { amount, paymentDate, method, transactionNumber, note } = req.body;

//       validatePayment({ amount, method, transactionNumber });

//       if (paymentDate && Number.isNaN(Date.parse(paymentDate))) {

//         return res.status(400).json({ message: "Invalid payment date." });

//       }

//       const company = await CompanyLedger.findOne({

//         _id: req.params.companyId,

//         createdBy: req.user.id,

//       });

//       if (!company) {

//         return res.status(404).json({ message: "Company not found." });

//       }

//       const ledger = company.ledgers.id(req.params.ledgerId);

//       if (!ledger) {

//         return res.status(404).json({ message: "Ledger not found." });

//       }

//       const total = getLedgerTotal(ledger);

//       const paid = getPaidTotal(ledger);

//       const balance = Math.max(0, total - paid);

//       const amountNumber = Number(amount);

//       if (amountNumber > balance + 0.009) {

//         return res.status(400).json({

//           message: `Payment exceeds pending balance of ₹${balance.toFixed(2)}.`,

//         });

//       }

//       ledger.payments.push(

//         normalizePayment(

//           {

//             amount: amountNumber,

//             paymentDate,

//             method,

//             transactionNumber,

//             note,

//           },

//           req.user.id

//         )

//       );

//       await company.save();

//       res.status(201).json(serializeLedger(ledger));

//     } catch (error) {

//       console.error("Payment creation error:", error);

//       res.status(400).json({

//         message: error.message || "Unable to record payment.",

//       });

//     }

//   }

// );

// // GET a company's ledgers, with optional filters.

// router.get("/companies/:companyId/ledgers", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const company = await CompanyLedger.findOne({

//       _id: req.params.companyId,

//       createdBy: req.user.id,

//     });

//     if (!company) {

//       return res.status(404).json({ message: "Company not found." });

//     }

//     const { from, to, status, batchNumber } = req.query;

//     const ledgers = company.ledgers

//       .map(serializeLedger)

//       .filter((ledger) => {

//         const purchaseDate = new Date(ledger.purchaseDate);

//         if (from && purchaseDate < new Date(`${from}T00:00:00`)) {

//           return false;

//         }

//         if (to && purchaseDate > new Date(`${to}T23:59:59.999`)) {

//           return false;

//         }

//         if (status === "Pending" && ledger.pendingAmount <= 0.009) {

//           return false;

//         }

//         if (status === "Paid" && ledger.pendingAmount > 0.009) {

//           return false;

//         }

//         if (

//           batchNumber &&

//           !ledger.products.some((product) =>

//             String(product.batchNumber || "")

//               .toLowerCase()

//               .includes(batchNumber.toLowerCase())

//           )

//         ) {

//           return false;

//         }

//         return true;

//       })

//       .sort(

//         (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)

//       );

//     res.json(ledgers);

//   } catch (error) {

//     console.error("Ledger filter error:", error);

//     res.status(500).json({ message: "Unable to fetch ledgers." });

//   }

// });

// module.exports = router;


// const router = require("express").Router();

// const mongoose = require("mongoose");

// const bcrypt = require("bcryptjs");

// const CompanyLedger = require("../models/CompanyLedger");
// const Counter = require("../models/Counter");

// const User = require("../models/User");

// const authMiddleware = require("../middleware/authMiddleware");

// // Every route requires a valid login token.

// router.use(authMiddleware);

// const isAdmin = (req, res) => {

//   if (req.user?.role !== "admin") {

//     res.status(403).json({

//       message: "Only an admin can perform this action.",

//     });

//     return false;

//   }

//   return true;

// };

// const getLedgerTotal = (ledger) =>

//   (ledger.products || []).reduce(

//     (sum, product) =>

//       sum + Number(product.quantity || 0) *

//         Number(product.purchaseRate || 0),

//     0

//   );

// const getPaidTotal = (ledger) =>

//   (ledger.payments || []).reduce(

//     (sum, payment) => sum + Number(payment.amount || 0),

//     0

//   );

// const serializeLedger = (ledger) => {

//   const data = ledger.toObject

//     ? ledger.toObject()

//     : ledger;

//   const total = getLedgerTotal(data);

//   const paid = getPaidTotal(data);

//   const balance = Math.max(0, total - paid);

//   return {

//     ...data,

//     totalAmount: Number(total.toFixed(2)),

//     paidAmount: Number(paid.toFixed(2)),

//     pendingAmount: Number(balance.toFixed(2)),

//     paymentStatus: balance <= 0.009 ? "Paid" : "Pending",

//   };

// };

// const serializeCompany = (company) => {

//   const data = company.toObject

//     ? company.toObject()

//     : company;

//   return {

//     ...data,

//     ledgers: (data.ledgers || []).map(serializeLedger),

//   };

// };

// const validateProducts = (products) => {

//   if (!Array.isArray(products) || products.length === 0) {

//     throw new Error("Add at least one product.");

//   }

//   for (const product of products) {

//     if (!String(product.productName || "").trim()) throw new Error("Every product needs a name.");

//     if (!String(product.category || "").trim()) throw new Error("Select a category for every product.");

//     if (!Number.isFinite(Number(product.quantity)) || Number(product.quantity) < 1) {

//       throw new Error("Product quantity must be at least 1.");

//     }

//     if (!Number.isFinite(Number(product.mrp)) || Number(product.mrp) < 0) {

//       throw new Error("MRP cannot be negative.");

//     }

//     if (!Number.isFinite(Number(product.companyRate)) || Number(product.companyRate) < 0) {

//       throw new Error("Company rate is required and cannot be negative.");

//     }

//   }

// };



// const normalizeProducts = (products, categoryDiscounts = [], legacyDiscount = 0) =>

//   products.map((product) => {

//     const category = String(product.category || "Other Products").trim();

//     const config = categoryDiscounts.find(

//       (item) => String(item.category || "").trim().toLowerCase() === category.toLowerCase()

//     );

//     const discountPercentage = config != null

//       ? Number(config.discountPercentage || 0)

//       : Number(legacyDiscount || 0);

//     const mrp = Number(product.mrp);

//     // Discount applies to the manually entered company rate, not printed MRP.

//     const companyRate = Number(product.companyRate);

//     const basePurchaseRate = Number((companyRate * (1 - discountPercentage / 100)).toFixed(2));

//     const gstPercentage = 5;

//     const gstAmount = Number((basePurchaseRate * gstPercentage / 100).toFixed(2));

//     const purchaseRate = Number((basePurchaseRate + gstAmount).toFixed(2));

//     return {

//       productName: String(product.productName).trim(),

//       category,

//       quantity: Number(product.quantity),

//       invoiceNumber: String(product.invoiceNumber || "").trim(),

//       batchNumber: String(product.batchNumber || "").trim(),

//       mrp,

//       companyRate,

//       basePurchaseRate,

//       gstPercentage,

//       gstAmount,

//       purchaseRate,

//       discountPercentage,

//     };

//   });



// const normalizeCategoryDiscounts = (items) => {

//   if (!Array.isArray(items)) throw new Error("Category discounts must be a list.");

//   const seen = new Set();

//   return items.map((item) => {

//     const category = String(item.category || "").trim();

//     const discountPercentage = Number(item.discountPercentage);

//     if (!category) throw new Error("Every discount needs a category.");

//     if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {

//       throw new Error(`Discount for ${category} must be between 0 and 100.`);

//     }

//     const key = category.toLowerCase();

//     if (seen.has(key)) throw new Error(`Duplicate discount category: ${category}.`);

//     seen.add(key);

//     return { category, discountPercentage };

//   });

// };



// const validatePayment = (payment) => {

//   const amount = Number(payment.amount);

//   if (!Number.isFinite(amount) || amount <= 0) {

//     throw new Error("Payment amount must be greater than zero.");

//   }

//   if (!["Cash", "UPI"].includes(payment.method)) {

//     throw new Error("Payment method must be Cash or UPI.");

//   }

//   if (

//     payment.method === "UPI" &&

//     !String(payment.transactionNumber || "").trim()

//   ) {

//     throw new Error("UPI transaction number is required.");

//   }

// };

// const getNextReceiptNumber = async () => {
//   const counter = await Counter.findOneAndUpdate(
//     { _id: "global-company-payment-receipt" },
//     [
//       {
//         $set: {
//           seq: { $add: [{ $ifNull: ["$seq", 0] }, 1] },
//         },
//       },
//     ],
//     { upsert: true, new: true, setDefaultsOnInsert: false, updatePipeline: true }
//   );
//   return `DHR-${String(counter.seq).padStart(6, "0")}`;
// };

// const normalizePayment = (payment, userId) => ({

//   receiptNumber: String(payment.receiptNumber || ""),

//   amount: Number(payment.amount),

//   paymentDate: payment.paymentDate || new Date(),

//   method: payment.method,

//   transactionNumber:

//     payment.method === "UPI"

//       ? String(payment.transactionNumber || "").trim()

//       : "",

//   note: String(payment.note || "").trim(),

//   recordedBy: userId,

// });

// // Generate a globally unique ledger ID across all companies.
// const getNextLedgerId = async () => {
//   // Read existing IDs so the first deployment continues after the current maximum.
//   const companies = await CompanyLedger.find(
//     {},
//     { "ledgers.ledgerId": 1, _id: 0 }
//   ).lean();

//   let highestExistingNumber = 0;
//   for (const company of companies) {
//     for (const ledger of company.ledgers || []) {
//       const match = String(ledger.ledgerId || "").match(/^CL-(\d+)$/i);
//       if (match) highestExistingNumber = Math.max(highestExistingNumber, Number(match[1]) || 0);
//     }
//   }

//   // MongoDB applies this update atomically, so concurrent requests get different IDs.
//   const counter = await Counter.findOneAndUpdate(
//     { _id: "global-company-ledger" },
//     [
//       {
//         $set: {
//           seq: {
//             $add: [
//               { $max: [{ $ifNull: ["$seq", 0] }, highestExistingNumber] },
//               1,
//             ],
//           },
//         },
//       },
//     ],
//     { upsert: true,
//        new: true, 
//        setDefaultsOnInsert: false,
//        updatePipeline: true,
//        }
//   );

//   return `DHCL-${String(counter.seq).padStart(6, "0")}`;
// };

// // GET all companies belonging to the logged-in admin.

// router.get("/", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const companies = await CompanyLedger.find({

//       createdBy: req.user.id,

//     }).sort({ createdAt: -1 });

//     res.json(companies.map(serializeCompany));

//   } catch (error) {

//     console.error("Company ledger list error:", error);

//     res.status(500).json({ message: "Unable to fetch companies." });

//   }

// });

// // ADD company.

// router.post("/companies", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const {

//       companyName,

//       mrName,

//       mrMobile,

//       gstNumber = "",

//       categoryDiscounts = [],

//       discountPercentage = 0,

//     } = req.body;

//     if (

//       !String(companyName || "").trim() ||

//       !String(mrName || "").trim() ||

//       !String(mrMobile || "").trim()

//     ) {

//       return res.status(400).json({

//         message: "Company name, MR name and mobile number are required.",

//       });

//     }

//     const discount = Number(discountPercentage);

//     if (!Number.isFinite(discount) || discount < 0 || discount > 100) {

//       return res.status(400).json({

//         message: "Discount must be between 0 and 100.",

//       });

//     }

//     const normalizedCategoryDiscounts = normalizeCategoryDiscounts(categoryDiscounts);



//     const company = await CompanyLedger.create({

//       companyName: String(companyName).trim(),

//       mrName: String(mrName).trim(),

//       mrMobile: String(mrMobile).trim(),

//       gstNumber: String(gstNumber || "").trim().toUpperCase(),

//       categoryDiscounts: normalizedCategoryDiscounts,

//       discountPercentage: discount,

//       createdBy: req.user.id,

//     });

//     res.status(201).json(serializeCompany(company));

//   } catch (error) {

//     console.error("Company creation error:", error);

//     res.status(500).json({ message: "Unable to add company." });

//   }

// });

// // EDIT company details. Existing admin password is verified on the server.

// router.put("/companies/:companyId", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const {

//       adminPassword,

//       companyName,

//       mrName,

//       mrMobile,

//       gstNumber = "",

//       categoryDiscounts = [],

//       discountPercentage = 0,

//     } = req.body;

//     if (!adminPassword) {

//       return res.status(400).json({

//         message: "Admin password is required to edit company details.",

//       });

//     }

//     const admin = await User.findById(req.user.id);

//     if (!admin || admin.role !== "admin") {

//       return res.status(403).json({ message: "Admin account not found." });

//     }

//     const passwordMatches = await bcrypt.compare(

//       adminPassword,

//       admin.password

//     );

//     if (!passwordMatches) {

//       return res.status(401).json({ message: "Incorrect admin password." });

//     }

//     if (!mongoose.isValidObjectId(req.params.companyId)) {

//       return res.status(400).json({ message: "Invalid company ID." });

//     }

//     const company = await CompanyLedger.findOne({

//       _id: req.params.companyId,

//       createdBy: req.user.id,

//     });

//     if (!company) {

//       return res.status(404).json({ message: "Company not found." });

//     }

//     if (

//       !String(companyName || "").trim() ||

//       !String(mrName || "").trim() ||

//       !String(mrMobile || "").trim()

//     ) {

//       return res.status(400).json({

//         message: "Company name, MR name and mobile number are required.",

//       });

//     }

//     const discount = Number(discountPercentage);

//     if (!Number.isFinite(discount) || discount < 0 || discount > 100) {

//       return res.status(400).json({

//         message: "Discount must be between 0 and 100.",

//       });

//     }

//     const normalizedCategoryDiscounts = normalizeCategoryDiscounts(
//     categoryDiscounts
//   );

//   company.companyName = String(companyName).trim();
//   company.mrName = String(mrName).trim();
//   company.mrMobile = String(mrMobile).trim();
//   company.gstNumber = String(gstNumber || "").trim().toUpperCase();
//   company.categoryDiscounts = normalizedCategoryDiscounts;
//   company.discountPercentage = discount;

//   await company.save();
//   return res.json(serializeCompany(company));

//   } catch (error) {

//     console.error("Company edit error:", error);

//     res.status(500).json({ message: "Unable to update company." });

//   }

// });

// // ADD a ledger containing one or more products.

// router.post("/companies/:companyId/ledgers", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const { purchaseDate, products, note } = req.body;

//     if (!purchaseDate || Number.isNaN(Date.parse(purchaseDate))) {

//       return res.status(400).json({ message: "A valid purchase date is required." });

//     }

//     validateProducts(products);

//     const company = await CompanyLedger.findOne({

//       _id: req.params.companyId,

//       createdBy: req.user.id,

//     });

//     if (!company) {

//       return res.status(404).json({ message: "Company not found." });

//     }

//     const ledger = {

//       ledgerId: await getNextLedgerId(),

//       purchaseDate: new Date(purchaseDate),

//       products: normalizeProducts(

//         products,

//         company.categoryDiscounts || [],

//         company.discountPercentage || 0

//       ),

//       payments: [],

//       note: String(note || "").trim(),

//       createdBy: req.user.id,

//     };

//     company.ledgers.push(ledger);

//     await company.save();

//     const savedLedger = company.ledgers[company.ledgers.length - 1];

//     res.status(201).json(serializeLedger(savedLedger));

//   } catch (error) {

//     console.error("Ledger creation error:", error);

//     res.status(400).json({

//       message: error.message || "Unable to create ledger.",

//     });

//   }

// });

// // ADD a partial payment to an existing ledger.

// router.post(

//   "/companies/:companyId/ledgers/:ledgerId/payments",

//   async (req, res) => {

//     try {

//       if (!isAdmin(req, res)) return;

//       const { amount, paymentDate, method, transactionNumber, note } = req.body;

//       validatePayment({ amount, method, transactionNumber });

//       if (paymentDate && Number.isNaN(Date.parse(paymentDate))) {

//         return res.status(400).json({ message: "Invalid payment date." });

//       }

//       const company = await CompanyLedger.findOne({

//         _id: req.params.companyId,

//         createdBy: req.user.id,

//       });

//       if (!company) {

//         return res.status(404).json({ message: "Company not found." });

//       }

//       const ledger = company.ledgers.id(req.params.ledgerId);

//       if (!ledger) {

//         return res.status(404).json({ message: "Ledger not found." });

//       }

//       const total = getLedgerTotal(ledger);

//       const paid = getPaidTotal(ledger);

//       const balance = Math.max(0, total - paid);

//       const amountNumber = Number(amount);

//       if (amountNumber > balance + 0.009) {

//         return res.status(400).json({

//           message: `Payment exceeds pending balance of ₹${balance.toFixed(2)}.`,

//         });

//       }

//       const receiptNumber = await getNextReceiptNumber();

//       ledger.payments.push(

//         normalizePayment(

//           {

//             receiptNumber,

//             amount: amountNumber,

//             paymentDate,

//             method,

//             transactionNumber,

//             note,

//           },

//           req.user.id

//         )

//       );

//       await company.save();

//       const savedPayment = ledger.payments[ledger.payments.length - 1];

//       res.status(201).json({
//         ...serializeLedger(ledger),
//         createdPayment: savedPayment,
//       });

//     } catch (error) {

//       console.error("Payment creation error:", error);

//       res.status(400).json({

//         message: error.message || "Unable to record payment.",

//       });

//     }

//   }

// );

// // GET a company's ledgers, with optional filters.

// router.get("/companies/:companyId/ledgers", async (req, res) => {

//   try {

//     if (!isAdmin(req, res)) return;

//     const company = await CompanyLedger.findOne({

//       _id: req.params.companyId,

//       createdBy: req.user.id,

//     });

//     if (!company) {

//       return res.status(404).json({ message: "Company not found." });

//     }

//     const { from, to, status, batchNumber } = req.query;

//     const ledgers = company.ledgers

//       .map(serializeLedger)

//       .filter((ledger) => {

//         const purchaseDate = new Date(ledger.purchaseDate);

//         if (from && purchaseDate < new Date(`${from}T00:00:00`)) {

//           return false;

//         }

//         if (to && purchaseDate > new Date(`${to}T23:59:59.999`)) {

//           return false;

//         }

//         if (status === "Pending" && ledger.pendingAmount <= 0.009) {

//           return false;

//         }

//         if (status === "Paid" && ledger.pendingAmount > 0.009) {

//           return false;

//         }

//         if (

//           batchNumber &&

//           !ledger.products.some((product) =>

//             String(product.batchNumber || "")

//               .toLowerCase()

//               .includes(batchNumber.toLowerCase())

//           )

//         ) {

//           return false;

//         }

//         return true;

//       })

//       .sort(

//         (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)

//       );

//     res.json(ledgers);

//   } catch (error) {

//     console.error("Ledger filter error:", error);

//     res.status(500).json({ message: "Unable to fetch ledgers." });

//   }

// });

// module.exports = router;

const router = require("express").Router();

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const CompanyLedger = require("../models/CompanyLedger");
const Counter = require("../models/Counter");

const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");

// Public, read-only receipt page. This route intentionally sits before authMiddleware.
router.get("/public/receipt/:token", async (req, res) => {
  try {
    const token = String(req.params.token || "").trim();
    if (!token || token.length < 32) {
      return res.status(404).send("<!doctype html><html><body><h2>Receipt not found</h2></body></html>");
    }
    const company = await CompanyLedger.findOne({ "ledgers.payments.receiptToken": token }).lean();
    if (!company) {
      return res.status(404).send("<!doctype html><html><body><h2>Receipt not found or link is invalid.</h2></body></html>");
    }
    let foundLedger = null;
    let payment = null;
    for (const ledger of company.ledgers || []) {
      const found = (ledger.payments || []).find((item) => item.receiptToken === token);
      if (found) { foundLedger = ledger; payment = found; break; }
    }
    if (!payment || !foundLedger) return res.status(404).send("<!doctype html><html><body><h2>Receipt not found.</h2></body></html>");
    const esc = (value) => String(value ?? "—").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
    const date = payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
    const amount = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:2 }).format(Number(payment.amount || 0));
    res.set("Cache-Control", "no-store");
    return res.type("html").send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment Receipt ${esc(payment.receiptNumber)}</title><style>body{font-family:Arial,sans-serif;color:#111827;margin:0;padding:20px;background:#f3f4f6}.receipt{max-width:720px;margin:20px auto;background:white;border:1px solid #111827;padding:28px}.head{text-align:center;border-bottom:2px solid #111827;padding-bottom:14px}.sub{font-size:12px;color:#4b5563}.title{text-align:center;font-weight:bold;font-size:20px;margin:20px 0}.meta{display:flex;justify-content:space-between;gap:12px;font-size:13px;margin-bottom:16px}table{width:100%;border-collapse:collapse}td{padding:11px 8px;border-bottom:1px solid #d1d5db;font-size:14px}td:first-child{color:#4b5563;width:40%}.amount{font-size:21px;font-weight:bold}.sign{display:flex;gap:32px;margin-top:65px}.sign div{width:50%;border-top:1px solid #111827;text-align:center;padding-top:8px;font-size:12px}.actions{text-align:center;margin:18px}.actions button{padding:10px 18px;border:0;border-radius:8px;background:#0f766e;color:#fff;font-weight:bold;cursor:pointer}.foot{text-align:center;font-size:11px;color:#6b7280;margin-top:22px}@media print{body{background:white;padding:0}.receipt{margin:0 auto;border:1px solid #111827}.actions{display:none}}</style></head><body><div class="receipt"><div class="head"><h1>DHRUWRAJ HEALTHCARE</h1><div class="sub">PAYMENT ACKNOWLEDGEMENT</div></div><div class="title">PAYMENT RECEIPT</div><div class="meta"><span><b>Receipt No:</b> ${esc(payment.receiptNumber)}</span><span><b>Date:</b> ${esc(date)}</span></div><table><tr><td>Company Name</td><td><b>${esc(company.companyName)}</b></td></tr><tr><td>MR Name</td><td>${esc(company.mrName)}</td></tr><tr><td>MR Mobile</td><td>${esc(company.mrMobile)}</td></tr><tr><td>Ledger ID</td><td>${esc(foundLedger.ledgerId)}</td></tr><tr><td>Amount Received</td><td class="amount">${esc(amount)}</td></tr><tr><td>Payment Mode</td><td><b>${esc(payment.method)}</b></td></tr>${payment.method === "UPI" ? `<tr><td>UPI Transaction No.</td><td>${esc(payment.transactionNumber)}</td></tr>` : ""}${payment.note ? `<tr><td>Note</td><td>${esc(payment.note)}</td></tr>` : ""}</table><p>I acknowledge that the amount stated above has been received by DHRUWRAJ HEALTHCARE.</p><div class="sign"><div>MR Signature / Name</div><div>Received By (DHRUWRAJ HEALTHCARE)</div></div><p class="sub">Physical signature confirms acknowledgement. Keep signed receipt for monthly reconciliation.</p><div class="foot">Computer-generated receipt</div></div><div class="actions"><button onclick="window.print()">Print Receipt</button></div></body></html>`);
  } catch (error) {
    console.error("Public receipt error:", error);
    return res.status(500).send("Unable to open this receipt right now.");
  }
});

// All other routes require a valid login token.
router.use(authMiddleware);

const isAdmin = (req, res) => {

  if (req.user?.role !== "admin") {

    res.status(403).json({

      message: "Only an admin can perform this action.",

    });

    return false;

  }

  return true;

};

const getLedgerTotal = (ledger) =>

  (ledger.products || []).reduce(

    (sum, product) =>

      sum + Number(product.quantity || 0) *

        Number(product.purchaseRate || 0),

    0

  );

const getPaidTotal = (ledger) =>

  (ledger.payments || []).reduce(

    (sum, payment) => sum + Number(payment.amount || 0),

    0

  );

const serializeLedger = (ledger) => {

  const data = ledger.toObject

    ? ledger.toObject()

    : ledger;

  const total = getLedgerTotal(data);

  const paid = getPaidTotal(data);

  const balance = Math.max(0, total - paid);

  return {

    ...data,

    totalAmount: Number(total.toFixed(2)),

    paidAmount: Number(paid.toFixed(2)),

    pendingAmount: Number(balance.toFixed(2)),

    paymentStatus: balance <= 0.009 ? "Paid" : "Pending",

  };

};

const serializeCompany = (company) => {

  const data = company.toObject

    ? company.toObject()

    : company;

  return {

    ...data,

    ledgers: (data.ledgers || []).map(serializeLedger),

  };

};

const validateProducts = (products) => {

  if (!Array.isArray(products) || products.length === 0) {

    throw new Error("Add at least one product.");

  }

  for (const product of products) {

    if (!String(product.productName || "").trim()) throw new Error("Every product needs a name.");

    if (!String(product.category || "").trim()) throw new Error("Select a category for every product.");

    if (!Number.isFinite(Number(product.quantity)) || Number(product.quantity) < 1) {

      throw new Error("Product quantity must be at least 1.");

    }

    if (!Number.isFinite(Number(product.mrp)) || Number(product.mrp) < 0) {

      throw new Error("MRP cannot be negative.");

    }

    if (!Number.isFinite(Number(product.companyRate)) || Number(product.companyRate) < 0) {

      throw new Error("Company rate is required and cannot be negative.");

    }

  }

};



const normalizeProducts = (products, categoryDiscounts = [], legacyDiscount = 0) =>

  products.map((product) => {

    const category = String(product.category || "Other Products").trim();

    const config = categoryDiscounts.find(

      (item) => String(item.category || "").trim().toLowerCase() === category.toLowerCase()

    );

    const discountPercentage = config != null

      ? Number(config.discountPercentage || 0)

      : Number(legacyDiscount || 0);

    const mrp = Number(product.mrp);

    // Discount applies to the manually entered company rate, not printed MRP.

    const companyRate = Number(product.companyRate);

    const basePurchaseRate = Number((companyRate * (1 - discountPercentage / 100)).toFixed(2));

    const gstPercentage = 5;

    const gstAmount = Number((basePurchaseRate * gstPercentage / 100).toFixed(2));

    const purchaseRate = Number((basePurchaseRate + gstAmount).toFixed(2));

    return {

      productName: String(product.productName).trim(),

      category,

      quantity: Number(product.quantity),

      invoiceNumber: String(product.invoiceNumber || "").trim(),

      batchNumber: String(product.batchNumber || "").trim(),

      mrp,

      companyRate,

      basePurchaseRate,

      gstPercentage,

      gstAmount,

      purchaseRate,

      discountPercentage,

    };

  });



const normalizeCategoryDiscounts = (items) => {

  if (!Array.isArray(items)) throw new Error("Category discounts must be a list.");

  const seen = new Set();

  return items.map((item) => {

    const category = String(item.category || "").trim();

    const discountPercentage = Number(item.discountPercentage);

    if (!category) throw new Error("Every discount needs a category.");

    if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {

      throw new Error(`Discount for ${category} must be between 0 and 100.`);

    }

    const key = category.toLowerCase();

    if (seen.has(key)) throw new Error(`Duplicate discount category: ${category}.`);

    seen.add(key);

    return { category, discountPercentage };

  });

};



const validatePayment = (payment) => {

  const amount = Number(payment.amount);

  if (!Number.isFinite(amount) || amount <= 0) {

    throw new Error("Payment amount must be greater than zero.");

  }

  if (!["Cash", "UPI"].includes(payment.method)) {

    throw new Error("Payment method must be Cash or UPI.");

  }

  if (

    payment.method === "UPI" &&

    !String(payment.transactionNumber || "").trim()

  ) {

    throw new Error("UPI transaction number is required.");

  }

};

const getNextReceiptNumber = async () => {
  // Use $inc (not an update pipeline) for compatibility with Mongoose/MongoDB versions.
  const counter = await Counter.findOneAndUpdate(
    { _id: "global-company-payment-receipt" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (!counter || !Number.isFinite(Number(counter.seq))) {
    throw new Error("Unable to generate receipt number. Check the Counter model and MongoDB connection.");
  }
  return `DHR-${String(counter.seq).padStart(6, "0")}`;
};

const normalizePayment = (payment, userId) => ({

  receiptNumber: String(payment.receiptNumber || ""),
  receiptToken: String(payment.receiptToken || ""),

  amount: Number(payment.amount),

  paymentDate: payment.paymentDate || new Date(),

  method: payment.method,

  transactionNumber:

    payment.method === "UPI"

      ? String(payment.transactionNumber || "").trim()

      : "",

  note: String(payment.note || "").trim(),

  recordedBy: userId,

});

// Generate a globally unique ledger ID across all companies.
const getNextLedgerId = async () => {
  // Read existing IDs so the first deployment continues after the current maximum.
  const companies = await CompanyLedger.find(
    {},
    { "ledgers.ledgerId": 1, _id: 0 }
  ).lean();

  let highestExistingNumber = 0;
  for (const company of companies) {
    for (const ledger of company.ledgers || []) {
      const match = String(ledger.ledgerId || "").match(/^CL-(\d+)$/i);
      if (match) highestExistingNumber = Math.max(highestExistingNumber, Number(match[1]) || 0);
    }
  }

  // MongoDB applies this update atomically, so concurrent requests get different IDs.
  const counter = await Counter.findOneAndUpdate(
    { _id: "global-company-ledger" },
    [
      {
        $set: {
          seq: {
            $add: [
              { $max: [{ $ifNull: ["$seq", 0] }, highestExistingNumber] },
              1,
            ],
          },
        },
      },
    ],
    { upsert: true,
       new: true, 
       setDefaultsOnInsert: false,
       updatePipeline: true,
       }
  );

  return `DHCL-${String(counter.seq).padStart(6, "0")}`;
};

// GET all companies belonging to the logged-in admin.

router.get("/", async (req, res) => {

  try {

    if (!isAdmin(req, res)) return;

    const companies = await CompanyLedger.find({

      createdBy: req.user.id,

    }).sort({ createdAt: -1 });

    res.json(companies.map(serializeCompany));

  } catch (error) {

    console.error("Company ledger list error:", error);

    res.status(500).json({ message: "Unable to fetch companies." });

  }

});

// ADD company.

router.post("/companies", async (req, res) => {

  try {

    if (!isAdmin(req, res)) return;

    const {

      companyName,

      mrName,

      mrMobile,

      gstNumber = "",

      categoryDiscounts = [],

      discountPercentage = 0,

    } = req.body;

    if (

      !String(companyName || "").trim() ||

      !String(mrName || "").trim() ||

      !String(mrMobile || "").trim()

    ) {

      return res.status(400).json({

        message: "Company name, MR name and mobile number are required.",

      });

    }

    const discount = Number(discountPercentage);

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {

      return res.status(400).json({

        message: "Discount must be between 0 and 100.",

      });

    }

    const normalizedCategoryDiscounts = normalizeCategoryDiscounts(categoryDiscounts);



    const company = await CompanyLedger.create({

      companyName: String(companyName).trim(),

      mrName: String(mrName).trim(),

      mrMobile: String(mrMobile).trim(),

      gstNumber: String(gstNumber || "").trim().toUpperCase(),

      categoryDiscounts: normalizedCategoryDiscounts,

      discountPercentage: discount,

      createdBy: req.user.id,

    });

    res.status(201).json(serializeCompany(company));

  } catch (error) {

    console.error("Company creation error:", error);

    res.status(500).json({ message: "Unable to add company." });

  }

});

// EDIT company details. Existing admin password is verified on the server.

router.put("/companies/:companyId", async (req, res) => {

  try {

    if (!isAdmin(req, res)) return;

    const {

      adminPassword,

      companyName,

      mrName,

      mrMobile,

      gstNumber = "",

      categoryDiscounts = [],

      discountPercentage = 0,

    } = req.body;

    if (!adminPassword) {

      return res.status(400).json({

        message: "Admin password is required to edit company details.",

      });

    }

    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== "admin") {

      return res.status(403).json({ message: "Admin account not found." });

    }

    const passwordMatches = await bcrypt.compare(

      adminPassword,

      admin.password

    );

    if (!passwordMatches) {

      return res.status(401).json({ message: "Incorrect admin password." });

    }

    if (!mongoose.isValidObjectId(req.params.companyId)) {

      return res.status(400).json({ message: "Invalid company ID." });

    }

    const company = await CompanyLedger.findOne({

      _id: req.params.companyId,

      createdBy: req.user.id,

    });

    if (!company) {

      return res.status(404).json({ message: "Company not found." });

    }

    if (

      !String(companyName || "").trim() ||

      !String(mrName || "").trim() ||

      !String(mrMobile || "").trim()

    ) {

      return res.status(400).json({

        message: "Company name, MR name and mobile number are required.",

      });

    }

    const discount = Number(discountPercentage);

    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {

      return res.status(400).json({

        message: "Discount must be between 0 and 100.",

      });

    }

    const normalizedCategoryDiscounts = normalizeCategoryDiscounts(
    categoryDiscounts
  );

  company.companyName = String(companyName).trim();
  company.mrName = String(mrName).trim();
  company.mrMobile = String(mrMobile).trim();
  company.gstNumber = String(gstNumber || "").trim().toUpperCase();
  company.categoryDiscounts = normalizedCategoryDiscounts;
  company.discountPercentage = discount;

  await company.save();
  return res.json(serializeCompany(company));

  } catch (error) {

    console.error("Company edit error:", error);

    res.status(500).json({ message: "Unable to update company." });

  }

});

// ADD a ledger containing one or more products.

router.post("/companies/:companyId/ledgers", async (req, res) => {

  try {

    if (!isAdmin(req, res)) return;

    const { purchaseDate, products, note } = req.body;

    if (!purchaseDate || Number.isNaN(Date.parse(purchaseDate))) {

      return res.status(400).json({ message: "A valid purchase date is required." });

    }

    validateProducts(products);

    const company = await CompanyLedger.findOne({

      _id: req.params.companyId,

      createdBy: req.user.id,

    });

    if (!company) {

      return res.status(404).json({ message: "Company not found." });

    }

    const ledger = {

      ledgerId: await getNextLedgerId(),

      purchaseDate: new Date(purchaseDate),

      products: normalizeProducts(

        products,

        company.categoryDiscounts || [],

        company.discountPercentage || 0

      ),

      payments: [],

      note: String(note || "").trim(),

      createdBy: req.user.id,

    };

    company.ledgers.push(ledger);

    await company.save();

    const savedLedger = company.ledgers[company.ledgers.length - 1];

    res.status(201).json(serializeLedger(savedLedger));

  } catch (error) {

    console.error("Ledger creation error:", error);

    res.status(400).json({

      message: error.message || "Unable to create ledger.",

    });

  }

});

// ADD a partial payment to an existing ledger.

router.post(

  "/companies/:companyId/ledgers/:ledgerId/payments",

  async (req, res) => {

    try {

      if (!isAdmin(req, res)) return;

      const { amount, paymentDate, method, transactionNumber, note } = req.body;

      validatePayment({ amount, method, transactionNumber });

      if (paymentDate && Number.isNaN(Date.parse(paymentDate))) {

        return res.status(400).json({ message: "Invalid payment date." });

      }

      const company = await CompanyLedger.findOne({

        _id: req.params.companyId,

        createdBy: req.user.id,

      });

      if (!company) {

        return res.status(404).json({ message: "Company not found." });

      }

      const ledger = company.ledgers.id(req.params.ledgerId);

      if (!ledger) {

        return res.status(404).json({ message: "Ledger not found." });

      }

      const total = getLedgerTotal(ledger);

      const paid = getPaidTotal(ledger);

      const balance = Math.max(0, total - paid);

      const amountNumber = Number(amount);

      if (amountNumber > balance + 0.009) {

        return res.status(400).json({

          message: `Payment exceeds pending balance of ₹${balance.toFixed(2)}.`,

        });

      }

      const receiptNumber = await getNextReceiptNumber();
      const receiptToken = crypto.randomBytes(32).toString("hex");

      ledger.payments.push(

        normalizePayment(

          {

            receiptNumber,

            receiptToken,

            amount: amountNumber,

            paymentDate,

            method,

            transactionNumber,

            note,

          },

          req.user.id

        )

      );

      await company.save();

      const savedPayment = ledger.payments[ledger.payments.length - 1];

      res.status(201).json({
        ...serializeLedger(ledger),
        createdPayment: savedPayment,
      });

    } catch (error) {

      console.error("Payment creation error:", error);

      res.status(400).json({

        message: error.message || "Unable to record payment.",

      });

    }

  }

);

// GET a company's ledgers, with optional filters.

router.get("/companies/:companyId/ledgers", async (req, res) => {

  try {

    if (!isAdmin(req, res)) return;

    const company = await CompanyLedger.findOne({

      _id: req.params.companyId,

      createdBy: req.user.id,

    });

    if (!company) {

      return res.status(404).json({ message: "Company not found." });

    }

    const { from, to, status, batchNumber } = req.query;

    const ledgers = company.ledgers

      .map(serializeLedger)

      .filter((ledger) => {

        const purchaseDate = new Date(ledger.purchaseDate);

        if (from && purchaseDate < new Date(`${from}T00:00:00`)) {

          return false;

        }

        if (to && purchaseDate > new Date(`${to}T23:59:59.999`)) {

          return false;

        }

        if (status === "Pending" && ledger.pendingAmount <= 0.009) {

          return false;

        }

        if (status === "Paid" && ledger.pendingAmount > 0.009) {

          return false;

        }

        if (

          batchNumber &&

          !ledger.products.some((product) =>

            String(product.batchNumber || "")

              .toLowerCase()

              .includes(batchNumber.toLowerCase())

          )

        ) {

          return false;

        }

        return true;

      })

      .sort(

        (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)

      );

    res.json(ledgers);

  } catch (error) {

    console.error("Ledger filter error:", error);

    res.status(500).json({ message: "Unable to fetch ledgers." });

  }

});

module.exports = router;

