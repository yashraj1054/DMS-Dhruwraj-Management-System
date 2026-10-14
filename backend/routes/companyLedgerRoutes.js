
// const router = require("express").Router();
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const CompanyLedger = require("../models/CompanyLedger");
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
//     if (!String(product.productName || "").trim()) {
//       throw new Error("Every product needs a name.");
//     }

//     if (
//       !Number.isFinite(Number(product.quantity)) ||
//       Number(product.quantity) < 1
//     ) {
//       throw new Error("Product quantity must be at least 1.");
//     }

//     if (
//       !Number.isFinite(Number(product.mrp)) ||
//       Number(product.mrp) < 0
//     ) {
//       throw new Error("MRP cannot be negative.");
//     }

//     if (
//       !Number.isFinite(Number(product.purchaseRate)) ||
//       Number(product.purchaseRate) < 0
//     ) {
//       throw new Error("Purchase rate cannot be negative.");
//     }
//   }
// };

// const normalizeProducts = (products) =>
//   products.map((product) => ({
//     productName: String(product.productName).trim(),
//     quantity: Number(product.quantity),
//     invoiceNumber: String(product.invoiceNumber || "").trim(),
//     batchNumber: String(product.batchNumber || "").trim(),
//     mrp: Number(product.mrp),
//     purchaseRate: Number(product.purchaseRate),
//   }));

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

//     const company = await CompanyLedger.create({
//       companyName: String(companyName).trim(),
//       mrName: String(mrName).trim(),
//       mrMobile: String(mrMobile).trim(),
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

//     const { adminPassword, companyName, mrName, mrMobile, discountPercentage } =
//       req.body;

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

//     company.companyName = String(companyName).trim();
//     company.mrName = String(mrName).trim();
//     company.mrMobile = String(mrMobile).trim();
//     company.discountPercentage = discount;

//     await company.save();

//     res.json(serializeCompany(company));
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

//     const lastLedger = company.ledgers[company.ledgers.length - 1];
//     const lastNumber = lastLedger
//       ? Number(String(lastLedger.ledgerId).replace(/\D/g, "")) || 0
//       : 0;

//     const ledger = {
//       ledgerId: `CL-${String(lastNumber + 1).padStart(6, "0")}`,
//       purchaseDate: new Date(purchaseDate),
//       products: normalizeProducts(products),
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
//     company.companyName = String(companyName).trim();
//     company.mrName = String(mrName).trim();
//     company.mrMobile = String(mrMobile).trim();
//     company.discountPercentage = discount;
//     await company.save();
//     res.json(serializeCompany(company));
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
//     const lastLedger = company.ledgers[company.ledgers.length - 1];
//     const lastNumber = lastLedger
//       ? Number(String(lastLedger.ledgerId).replace(/\D/g, "")) || 0
//       : 0;
//     const ledger = {
//       ledgerId: `CL-${String(lastNumber + 1).padStart(6, "0")}`,
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

//     const lastLedger = company.ledgers[company.ledgers.length - 1];

//     const lastNumber = lastLedger

//       ? Number(String(lastLedger.ledgerId).replace(/\D/g, "")) || 0

//       : 0;

//     const ledger = {

//       ledgerId: `DHC-${String(lastNumber + 1).padStart(6, "0")}`,

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

const router = require("express").Router();

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const CompanyLedger = require("../models/CompanyLedger");
const Counter = require("../models/Counter");

const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");

// Every route requires a valid login token.

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

const normalizePayment = (payment, userId) => ({

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
    { upsert: true, new: true, setDefaultsOnInsert: false }
  );

  return `CL-${String(counter.seq).padStart(6, "0")}`;
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

      ledger.payments.push(

        normalizePayment(

          {

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

      res.status(201).json(serializeLedger(ledger));

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
