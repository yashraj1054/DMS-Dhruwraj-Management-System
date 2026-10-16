// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import {
//   ArrowLeft,
//   Building2,
//   CalendarDays,
//   CheckCircle2,
//   ChevronRight,
//   CreditCard,
//   FileText,
//   Filter,
//   LoaderCircle,
//   LockKeyhole,
//   Plus,
//   RefreshCw,
//   Search,
//   Wallet,
//   X,
// } from "lucide-react";
// const API = "https://dms-backend-amber.vercel.app/api/company-ledger";
// const money = (value) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(Number(value || 0));
// const normalizeLedgerSearch = (value) =>
//   String(value ?? "")
//     .toLowerCase()
//     .replace(/[₹,\s]/g, "")
//     .trim();

// const today = () => new Date().toISOString().slice(0, 10);
// const FIXED_PRODUCT_CATEGORIES = [
//   "General",
// ];

// const emptyCompany = {
//   companyName: "",
//   mrName: "",
//   mrMobile: "",
//   gstNumber: "",
//   discountPercentage: "0",
//   categoryDiscounts: [],
// };
// const emptyProduct = () => ({
//   productName: "",
//   category: FIXED_PRODUCT_CATEGORIES[0],
//   quantity: "1",
//   invoiceNumber: "",
//   batchNumber: "",
//   mrp: "",
//   companyRate: "",
//   purchaseRate: "",
// });
// const inputClass =
//   "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 ";
// const buttonPrimary =
//   "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2.5 px-4 text-sm font-bold hover:scale-[1.02] transition cursor-pointer";
// const buttonSecondary =
//   "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";
// function Modal({ title, onClose, children, wide = false }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5">
//       <div
//         className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
//           wide ? "max-w-5xl" : "max-w-xl"
//         }`}
//       >
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
//           <h2 className="text-lg font-bold text-slate-900">{title}</h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
//             aria-label="Close"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <div className="p-5">{children}</div>
//       </div>
//     </div>
//   );
// }
// function Field({ label, children }) {
//   return (
//     <label className="block min-w-0 space-y-1.5">
//       <span className="text-sm font-medium text-slate-700">{label}</span>
//       {children}
//     </label>
//   );
// }
// function SummaryCard({ label, value, icon: Icon }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4">
//       <div className="flex items-center justify-between gap-3">
//         <span className="text-sm text-slate-500">{label}</span>
//         <Icon size={19} className="text-teal-600" />
//       </div>
//       <p className="mt-2 break-words text-xl font-bold text-slate-900">
//         {value}
//       </p>
//     </div>
//   );
// }
// export default function CompanyLedger() {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompanyId, setSelectedCompanyId] = useState("");
//   const [ledgers, setLedgers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [dismissedReminderIds, setDismissedReminderIds] = useState([]);
//   const [search, setSearch] = useState("");
//   const [ledgerSearch, setLedgerSearch] = useState("");
//   const [companyModal, setCompanyModal] = useState(false);
//   const [editingCompany, setEditingCompany] = useState(null);
//   const [companyForm, setCompanyForm] = useState(emptyCompany);
//   const [adminPassword, setAdminPassword] = useState("");
//   const [ledgerModal, setLedgerModal] = useState(false);
//   const [purchaseDate, setPurchaseDate] = useState(today());
//   const [products, setProducts] = useState([emptyProduct()]);
//   const [ledgerNote, setLedgerNote] = useState("");
//   const [paymentModal, setPaymentModal] = useState(false);
//   const [paymentLedger, setPaymentLedger] = useState(null);
//   const [paymentForm, setPaymentForm] = useState({
//     amount: "",
//     paymentDate: today(),
//     method: "Cash",
//     transactionNumber: "",
//     note: "",
//   });
//   const [detailsLedger, setDetailsLedger] = useState(null);
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     from: "",
//     to: "",
//     status: "All",
//     batchNumber: "",
//   });
//   const token = localStorage.getItem("token");
//   const headers = useMemo(
//     () => ({ Authorization: `Bearer ${token}` }),
//     [token]
//   );
//   const request = useCallback(
//     async (method, url, data) => {
//       const response = await axios({
//         method,
//         url,
//         data,
//         headers,
//       });
//       return response.data;
//     },
//     [headers]
//   );
//   const loadCompanies = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const data = await request("get", API);
//       const list = Array.isArray(data) ? data : [];
//       setCompanies(list);
//       if (
//         selectedCompanyId &&
//         !list.some((company) => company._id === selectedCompanyId)
//       ) {
//         setSelectedCompanyId("");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Unable to load companies. Please check your login."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [request, selectedCompanyId]);
//   const loadLedgers = useCallback(async () => {
//     if (!selectedCompanyId) {
//       setLedgers([]);
//       return;
//     }
//     setError("");
//     try {
//       const params = {};
//       if (filters.from) params.from = filters.from;
//       if (filters.to) params.to = filters.to;
//       if (filters.status !== "All") params.status = filters.status;
//       if (filters.batchNumber.trim()) {
//         params.batchNumber = filters.batchNumber.trim();
//       }
//       const response = await axios.get(
//         `${API}/companies/${selectedCompanyId}/ledgers`,
//         { headers, params }
//       );
//       setLedgers(Array.isArray(response.data) ? response.data : []);
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to load purchase ledgers."
//       );
//     }
//   }, [selectedCompanyId, filters, headers]);
//   useEffect(() => {
//     loadCompanies();
//   }, [loadCompanies]);
//   useEffect(() => {
//     loadLedgers();
//   }, [loadLedgers]);

//   const selectedCompany = companies.find(
//     (company) => company._id === selectedCompanyId
//   );

//   const visibleLedgers = useMemo(() => {
//     const query = normalizeLedgerSearch(ledgerSearch);

//     if (!query) return ledgers;

//     return ledgers.filter((ledger) => {
//       const purchaseDate = new Date(ledger.purchaseDate);
//       const dateValues = Number.isNaN(purchaseDate.getTime())
//         ? []
//         : [
//             purchaseDate.toLocaleDateString("en-IN"),
//             purchaseDate.toISOString().slice(0, 10),
//             purchaseDate.toLocaleDateString("en-US"),
//           ];

//       const productValues = (ledger.products || []).flatMap((product) => {
//         const quantity = Number(product.quantity || 0);
//         const mrp = Number(product.mrp || 0);
//         const companyRate = Number(product.companyRate || 0);
//         const basePurchaseRate = Number(product.basePurchaseRate || 0);
//         const purchaseRate = Number(product.purchaseRate || 0);
//         const gstAmount = Number(product.gstAmount || 0);

//         return [
//           product.productName,
//           product.category,
//           product.invoiceNumber,
//           product.batchNumber,
//           product.quantity,
//           product.mrp,
//           money(mrp),
//           product.companyRate,
//           money(companyRate),
//           product.basePurchaseRate,
//           money(basePurchaseRate),
//           product.purchaseRate,
//           money(purchaseRate),
//           product.gstAmount,
//           money(gstAmount),
//           quantity * mrp,
//           money(quantity * mrp),
//           quantity * companyRate,
//           money(quantity * companyRate),
//           quantity * basePurchaseRate,
//           money(quantity * basePurchaseRate),
//           quantity * purchaseRate,
//           money(quantity * purchaseRate),
//           quantity * gstAmount,
//           money(quantity * gstAmount),
//         ];
//       });

//       const paymentValues = (ledger.payments || []).flatMap((payment) => [
//         payment.amount,
//         money(payment.amount),
//         payment.method,
//         payment.transactionNumber,
//         payment.note,
//         payment.paymentDate,
//       ]);

//       const searchableValues = [
//         ledger.ledgerId,
//         ledger.paymentStatus,
//         ledger.note,
//         ledger.totalAmount,
//         money(ledger.totalAmount),
//         ledger.paidAmount,
//         money(ledger.paidAmount),
//         ledger.pendingAmount,
//         money(ledger.pendingAmount),
//         ...dateValues,
//         ...productValues,
//         ...paymentValues,
//       ];

//       return searchableValues.some((value) =>
//         normalizeLedgerSearch(value).includes(query)
//       );
//     });
//   }, [ledgers, ledgerSearch]);

//   const visibleCompanies = companies.filter((company) =>
//     [
//       company.companyName,
//       company.mrName,
//       company.mrMobile,
//     ].some((value) =>
//       String(value || "").toLowerCase().includes(search.toLowerCase())
//     )
//   );
//   const summary = useMemo(
//     () =>
//       ledgers.reduce(
//         (acc, ledger) => {
//           acc.purchase += Number(ledger.totalAmount || 0);
//           acc.paid += Number(ledger.paidAmount || 0);
//           acc.pending += Number(ledger.pendingAmount || 0);
//           return acc;
//         },
//         { purchase: 0, paid: 0, pending: 0 }
//       ),
//     [ledgers]
//   );
//   const openAddCompany = () => {
//     setEditingCompany(null);
//     setCompanyForm(emptyCompany);
//     setAdminPassword("");
//     setError("");
//     setCompanyModal(true);
//   };
//   const openEditCompany = () => {
//     if (!selectedCompany) return;
//     setEditingCompany(selectedCompany);
//     setCompanyForm({
//       companyName: selectedCompany.companyName || "",
//       mrName: selectedCompany.mrName || "",
//       mrMobile: selectedCompany.mrMobile || "",
//       gstNumber: selectedCompany.gstNumber || "",
//       discountPercentage: String(selectedCompany.discountPercentage ?? 0),
//       categoryDiscounts: (selectedCompany.categoryDiscounts || []).map((item) => ({
//         category: item.category || "",
//         discountPercentage: String(item.discountPercentage ?? 0),
//         isCustom: !FIXED_PRODUCT_CATEGORIES.includes(item.category),
//         customCategory: !FIXED_PRODUCT_CATEGORIES.includes(item.category) ? item.category : "",
//       })),
//     });
//     setAdminPassword("");
//     setError("");
//     setCompanyModal(true);
//   };
//   const saveCompany = async (event) => {
//     event.preventDefault();
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       const payload = {
//         ...companyForm,
//         gstNumber: String(companyForm.gstNumber || "").trim().toUpperCase(),
//         discountPercentage: Number(companyForm.discountPercentage || 0),
//         categoryDiscounts: (companyForm.categoryDiscounts || []).map((item) => ({
//           category: String(item.isCustom ? item.customCategory : item.category).trim(),
//           discountPercentage: Number(item.discountPercentage || 0),
//         })),
//       };
//       let saved;
//       if (editingCompany) {
//         payload.adminPassword = adminPassword;
//         saved = await request(
//           "put",
//           `${API}/companies/${editingCompany._id}`,
//           payload
//         );
//       } else {
//         saved = await request("post", `${API}/companies`, payload);
//       }
//       setCompanyModal(false);
//       setNotice(
//         editingCompany
//           ? "Company details updated successfully."
//           : "Company added successfully."
//       );
//       await loadCompanies();
//       if (!editingCompany && saved?._id) {
//         setSelectedCompanyId(saved._id);
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to save company."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const getCategoryDiscount = (category) => {
//     const configured = selectedCompany?.categoryDiscounts?.find(
//       (item) => String(item.category || "").trim().toLowerCase() === String(category || "").trim().toLowerCase()
//     );
//     if (configured) return Number(configured.discountPercentage || 0);
//     return Number(selectedCompany?.discountPercentage || 0);
//   };

//   const getBasePurchaseRate = (companyRate, category) => {
//     const rate = Number(companyRate || 0);
//     return Number((rate * (1 - getCategoryDiscount(category) / 100)).toFixed(2));
//   };

//   const getGSTAmount = (companyRate, category) =>
//     Number((getBasePurchaseRate(companyRate, category) * 0.05).toFixed(2));

//   // Final per-item purchase rate includes the fixed 5% GST.
//   const getPurchaseRate = (companyRate, category) =>
//     Number((getBasePurchaseRate(companyRate, category) + getGSTAmount(companyRate, category)).toFixed(2));

//   const overdueReminders = companies.flatMap((company) =>
//     (company.ledgers || [])
//       .filter((ledger) => {
//         const pending = Number(ledger.pendingAmount || 0);
//         const purchaseDateMs = new Date(ledger.purchaseDate).getTime();
//         const ageDays = (Date.now() - purchaseDateMs) / (1000 * 60 * 60 * 24);
//         return pending > 0.009 && Number.isFinite(purchaseDateMs) && ageDays >= 30;
//       })
//       .map((ledger) => ({ ...ledger, reminderCompanyName: company.companyName }))
//   );

//   const updateCompanyDiscount = (index, field, value) => {
//     setCompanyForm((current) => ({
//       ...current,
//       categoryDiscounts: current.categoryDiscounts.map((item, i) => {
//         if (i !== index) return item;
//         if (field === "category") {
//           return {
//             ...item,
//             category: value,
//             isCustom: value === "__custom__",
//             customCategory: value === "__custom__" ? item.customCategory || "" : "",
//           };
//         }
//         return { ...item, [field]: value };
//       }),
//     }));
//   };

//   // const updateProduct = (index, field, value) => {
//   //   setProducts((current) =>
//   //     current.map((product, i) =>
//   //       i === index ? { ...product, [field]: value } : product
//   //     )
//   //   );
//   // };
//   const updateProduct = (index, field, value) => {
//   setProducts((current) =>
//     current.map((product, i) => {
//       if (i !== index) return product;

//       // Update the targeted field
//       const updatedProduct = { ...product, [field]: value };

//       // If the user is changing the MRP, automatically calculate companyRate
//       if (field === "mrp") {
//         updatedProduct.companyRate = value ? (Number(value) / 1.05).toFixed(2) : "";
//       }

//       return updatedProduct;
//     })
//   );
// };
//   const totalPurchaseBeforeGST = products.reduce(
//     (sum, product) => sum + Number(product.quantity || 0) * getBasePurchaseRate(product.companyRate, product.category),
//     0
//   );
//   const totalGST = products.reduce(
//     (sum, product) => sum + Number(product.quantity || 0) * getGSTAmount(product.companyRate, product.category),
//     0
//   );
//   const purchaseTotal = Number((totalPurchaseBeforeGST + totalGST).toFixed(2));
//   const saveLedger = async (event) => {
//     event.preventDefault();
//     if (!selectedCompanyId) return;
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       const payload = {
//         purchaseDate,
//         products: products.map((product) => ({
//           ...product,
//           quantity: Number(product.quantity),
//           mrp: Number(product.mrp),
//           companyRate: Number(product.companyRate),
//           basePurchaseRate: getBasePurchaseRate(product.companyRate, product.category),
//           gstPercentage: 5,
//           gstAmount: getGSTAmount(product.companyRate, product.category),
//           purchaseRate: getPurchaseRate(product.companyRate, product.category),
//           discountPercentage: getCategoryDiscount(product.category),
//         })),
//         note: ledgerNote,
//       };
//       await request(
//         "post",
//         `${API}/companies/${selectedCompanyId}/ledgers`,
//         payload
//       );
//       setLedgerModal(false);
//       setProducts([emptyProduct()]);
//       setPurchaseDate(today());
//       setLedgerNote("");
//       setNotice("Purchase ledger created successfully.");
//       await loadLedgers();
//       await loadCompanies();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to create ledger."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const openPayment = (ledger) => {
//     setPaymentLedger(ledger);
//     setPaymentForm({
//       amount: String(ledger.pendingAmount || ""),
//       paymentDate: today(),
//       method: "Cash",
//       transactionNumber: "",
//       note: "",
//     });
//     setError("");
//     setPaymentModal(true);
//   };
//   const savePayment = async (event) => {
//     event.preventDefault();
//     if (!paymentLedger || !selectedCompanyId) return;
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       await request(
//         "post",
//         `${API}/companies/${selectedCompanyId}/ledgers/${paymentLedger._id}/payments`,
//         {
//           ...paymentForm,
//           amount: Number(paymentForm.amount),
//         }
//       );
//       setPaymentModal(false);
//       setNotice("Payment recorded successfully.");
//       await loadLedgers();
//       await loadCompanies();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to record payment."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const resetFilters = () => {
//     setFilters({
//       from: "",
//       to: "",
//       status: "All",
//       batchNumber: "",
//     });
//   };
//   const companyLedgerCount = selectedCompany?.ledgers?.length || 0;
//   return (
//     <div className="min-h-screen w-full">
//       {overdueReminders.filter((ledger) => !dismissedReminderIds.includes(ledger._id)).length > 0 && (
//         <div className="fixed right-4 top-4 z-[80] w-[min(92vw,380px)] space-y-2">
//           {overdueReminders
//             .filter((ledger) => !dismissedReminderIds.includes(ledger._id))
//             .map((ledger) => (
//               <div key={ledger._id} className="rounded-xl border border-amber-300 bg-white p-4 shadow-xl">
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex items-start gap-2">
//                     <CalendarDays className="mt-0.5 shrink-0 text-amber-600" size={19} />
//                     <div>
//                       <p className="font-bold text-slate-900">Payment overdue for 30+ days</p>
//                       <p className="mt-1 text-sm text-slate-600">
//                         {ledger.ledgerId} · {ledger.reminderCompanyName || "Company"}
//                       </p>
//                       <p className="mt-1 text-sm text-rose-700">
//                         Pending: <strong>{money(ledger.pendingAmount)}</strong>
//                       </p>
//                       <button
//                         className="mt-2 text-sm font-semibold text-teal-700 hover:underline"
//                         onClick={() => setDetailsLedger(ledger)}
//                       >
//                         View ledger details
//                       </button>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
//                     aria-label="Dismiss reminder"
//                     onClick={() => setDismissedReminderIds((ids) => [...ids, ledger._id])}
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               </div>
//             ))}
//         </div>
//       )}
//       <div className="mx-auto max-w-7xl space-y-5">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-xl font-semibold text-slate-800">
//               Company Ledger
//             </h1>
//             <p className="text-sm text-slate-400">
//               Manage supplier purchases, payment history and outstanding balances.
//             </p>
//           </div>
//           <button className={buttonPrimary} onClick={openAddCompany}>
//             <Plus size={18} /> Add Company
//           </button>
//         </div>
//         {error && (
//           <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//             <span>{error}</span>
//             <button onClick={() => setError("")} aria-label="Dismiss error">
//               <X size={17} />
//             </button>
//           </div>
//         )}
//         {notice && (
//           <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
//             <span>{notice}</span>
//             <button onClick={() => setNotice("")} aria-label="Dismiss message">
//               <X size={17} />
//             </button>
//           </div>
//         )}
//         {!selectedCompanyId ? (
//           <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
//             <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-slate-900">
//                   Your Companies
//                 </h2>
//                 <p className="text-sm text-slate-500">
//                   Select a company to view its purchase ledgers.
//                 </p>
//               </div>
//               <div className="relative w-full sm:max-w-xs">
//                 <Search
//                   size={18}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                 />
//                 <input
//                   className={`${inputClass} pl-10`}
//                   placeholder="Search companies..."
//                   value={search}
//                   onChange={(event) => setSearch(event.target.value)}
//                 />
//               </div>
//             </div>
//             {loading ? (
//               <div className="flex justify-center py-12">
//                 <LoaderCircle className="animate-spin text-teal-600" />
//               </div>
//             ) : visibleCompanies.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
//                 <Building2 className="mx-auto text-slate-400" size={36} />
//                 <p className="mt-3 font-semibold text-slate-700">
//                   No companies found
//                 </p>
//                 <p className="mt-1 text-sm text-slate-500">
//                   Add your first company to start recording purchases.
//                 </p>
//               </div>
//             ) : (
//               <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
//                 {visibleCompanies.map((company) => (
//                   <button
//                     key={company._id}
//                     onClick={() => setSelectedCompanyId(company._id)}
//                     className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40"
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex min-w-0 items-center gap-3">
//                         <div className="rounded-xl bg-blue-50 p-3 text-teal-600">
//                           <Building2 size={22} />
//                         </div>
//                         <div className="min-w-0">
//                           <h3 className="truncate font-bold text-slate-900">
//                             {company.companyName}
//                           </h3>
//                           <p className="mt-1 text-sm text-slate-500">
//                             MR : {company.mrName}
//                           </p>
//                         </div>
//                       </div>
//                       <ChevronRight size={19} className="shrink-0 text-slate-400" />
//                     </div>
//                     <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
//                       <span className="text-slate-500">
//                         Contact : {company.mrMobile}
//                       </span>
//                       {/* <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
//                         {company.discountPercentage || 0}% discount
//                       </span> */}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </section>
//         ) : (
//           <>
//             <button
//               className={buttonSecondary}
//               onClick={() => setSelectedCompanyId("")}
//             >
//               <ArrowLeft size={17} /> All Companies
//             </button>
//             <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
//               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-start gap-3">
//                   <div className="rounded-xl bg-blue-50 p-3 text-teal-600">
//                     <Building2 size={25} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-900">
//                       {selectedCompany?.companyName}
//                     </h2>
//                     <p className="mt-1 text-sm text-slate-500">
//                       MR: {selectedCompany?.mrName} · {selectedCompany?.mrMobile}
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Company discount: {selectedCompany?.discountPercentage || 0}%
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   <button className={buttonSecondary} onClick={openEditCompany}>
//                     <LockKeyhole size={17} /> Edit Details
//                   </button>
//                   <button
//                     className={buttonSecondary}
//                     onClick={() => setFiltersOpen((open) => !open)}
//                   >
//                     <Filter size={17} /> Filters
//                   </button>
//                   <button
//                     className={buttonPrimary}
//                     onClick={() => {
//                       setProducts([emptyProduct()]);
//                       setPurchaseDate(today());
//                       setLedgerNote("");
//                       setError("");
//                       setLedgerModal(true);
//                     }}
//                   >
//                     <Plus size={18} /> Add Ledger
//                   </button>
//                 </div>
//               </div>
//             </section>
//             {filtersOpen && (
//               <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
//                 <Field label="Purchase date from">
//                   <input
//                     type="date"
//                     className={inputClass}
//                     value={filters.from}
//                     max={filters.to || undefined}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, from: e.target.value }))
//                     }
//                   />
//                 </Field>
//                 <Field label="Purchase date to">
//                   <input
//                     type="date"
//                     className={inputClass}
//                     value={filters.to}
//                     min={filters.from || undefined}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, to: e.target.value }))
//                     }
//                   />
//                 </Field>
//                 <Field label="Payment status">
//                   <select
//                     className={inputClass}
//                     value={filters.status}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, status: e.target.value }))
//                     }
//                   >
//                     <option>All</option>
//                     <option>Pending</option>
//                     <option>Paid</option>
//                   </select>
//                 </Field>
//                 {/* <Field label="Batch number">
//                   <input
//                     className={inputClass}
//                     placeholder="Search batch..."
//                     value={filters.batchNumber}
//                     onChange={(e) =>
//                       setFilters((f) => ({
//                         ...f,
//                         batchNumber: e.target.value,
//                       }))
//                     }
//                   />
//                 </Field> */}
//                 <div className="flex items-end">
//                   <button
//                     className={`${buttonSecondary} w-full cursor-pointer`}
//                     onClick={resetFilters}
//                   >
//                     <RefreshCw size={17} />Reset filters
//                   </button>
//                 </div>
//               </section>
//             )}
//             <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
//               <SummaryCard
//                 label="Purchase Total"
//                 value={money(summary.purchase)}
//                 icon={FileText}
//               />
//               <SummaryCard
//                 label="Total Paid"
//                 value={money(summary.paid)}
//                 icon={CheckCircle2}
//               />
//               <SummaryCard
//                 label="Pending Balance"
//                 value={money(summary.pending)}
//                 icon={Wallet}
//               />
//             </section>
//             <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
//               <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <h2 className="font-bold text-slate-900">Purchase Ledgers</h2>
//                   <span className="text-sm text-slate-500">
//                     {visibleLedgers.length} of {ledgers.length} ledger(s)
//                   </span>
//                 </div>
//                 <div className="relative w-full sm:max-w-md">
//                   <Search
//                     size={17}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                   <input
//                     type="text"
//                     className={`${inputClass} appearance-none pr-10 pl-10`}
//                     placeholder="Search product, invoice, batch, price, date, status..."
//                     value={ledgerSearch}
//                     onChange={(event) => setLedgerSearch(event.target.value)}
//                     aria-label="Search purchase ledgers"
//                   />
//                   {ledgerSearch && (
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2  hover:cursor-pointer hover:text-teal-600"
//                       onClick={() => setLedgerSearch("")}
//                       aria-label="Clear ledger search"
//                     >
//                       <X size={16} />
//                     </button>
//                   )}
//                 </div>
//               </div>
//               {visibleLedgers.length === 0 ? (
//                 <div className="py-12 text-center">
//                   <FileText className="mx-auto text-slate-400" size={34} />
//                   <p className="mt-3 font-semibold text-slate-700">
//                     No matching purchase ledgers
//                   </p>
//                   <p className="mt-1 text-sm text-slate-500">
//                     Try another product name, invoice number, batch number, amount, date, or payment status.
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="hidden overflow-x-auto md:block">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                         <tr>
//                           <th className="px-4 py-3">Date</th>
//                           <th className="px-4 py-3">Products</th>
//                           <th className="px-4 py-3">Invoice & Batch No.</th>
//                           <th className="px-4 py-3">Purchase total</th>
//                           <th className="px-4 py-3">Paid</th>
//                           <th className="px-4 py-3">Pending</th>
//                           <th className="px-4 py-3">Status</th>
//                           <th className="px-4 py-3">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-100">
//                         {visibleLedgers.map((ledger) => (
//                           <tr key={ledger._id} className="align-top hover:bg-slate-50">
//                             <td className="px-4 py-4">
//                               {/* <p className="font-bold text-blue-700">{ledger.ledgerId}</p> */}
//                               <p className="font-bold text-teal-700">
//                                 {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
//                               </p>
//                             </td>
//                             <td className="max-w-56 px-4 py-4">
//                               {ledger.products.map((product, index) => (
//                                 <p key={product._id || index} className="mb-1">
//                                   {product.productName}{" "}
//                                   <span className="text-slate-500">
//                                     × {product.quantity}
//                                   </span>
//                                 </p>
//                               ))}
//                             </td>
//                             <td className="max-w-48 px-4 py-4">
//                               {ledger.products.map((product, index) => (
//                                 <p key={product._id || index} className="mb-1 text-xs text-slate-600">
//                                   Inv: {product.invoiceNumber || "—"} · Batch: {product.batchNumber || "—"}
//                                 </p>
//                               ))}
//                             </td>
//                             <td className="px-4 py-4 font-semibold">{money(ledger.totalAmount)}</td>
//                             <td className="px-4 py-4 text-emerald-700">{money(ledger.paidAmount)}</td>
//                             <td className="px-4 py-4 font-semibold text-rose-700">{money(ledger.pendingAmount)}</td>
//                             <td className="px-4 py-4">
//                               <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
//                                 ledger.paymentStatus === "Paid"
//                                   ? "bg-emerald-50 text-emerald-700"
//                                   : "bg-amber-50 text-amber-700"
//                               }`}>
//                                 {ledger.paymentStatus}
//                               </span>
//                             </td>
//                             <td className="px-4 py-4">
//                               <div className="flex flex-col items-start gap-2">
//                                 <button
//                                   className="text-xs font-semibold text-blue-700 hover:underline"
//                                   onClick={() => setDetailsLedger(ledger)}
//                                 >
//                                   View details
//                                 </button>
//                                 {ledger.pendingAmount > 0.009 && (
//                                   <button
//                                     className="text-xs font-semibold text-emerald-700 hover:underline"
//                                     onClick={() => openPayment(ledger)}
//                                   >
//                                     Add payment
//                                   </button>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                   <div className="space-y-3 p-3 md:hidden">
//                     {visibleLedgers.map((ledger) => (
//                       <div key={ledger._id} className="rounded-xl border border-slate-200 p-4">
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <p className="font-bold text-blue-700">{ledger.ledgerId}</p>
//                             <p className="mt-1 text-xs text-slate-500">
//                               {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
//                             </p>
//                           </div>
//                           <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
//                             ledger.paymentStatus === "Paid"
//                               ? "bg-emerald-50 text-emerald-700"
//                               : "bg-amber-50 text-amber-700"
//                           }`}>
//                             {ledger.paymentStatus}
//                           </span>
//                         </div>
//                         <div className="mt-3 space-y-1 text-sm">
//                           {ledger.products.map((product, index) => (
//                             <p key={product._id || index} className="text-slate-700">
//                               {product.productName} × {product.quantity}
//                             </p>
//                           ))}
//                         </div>
//                         <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
//                           <div>
//                             <p className="text-xs text-slate-500">Purchase total</p>
//                             <p className="mt-1 font-bold">{money(ledger.totalAmount)}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-slate-500">Pending</p>
//                             <p className="mt-1 font-bold text-rose-700">{money(ledger.pendingAmount)}</p>
//                           </div>
//                         </div>
//                         <div className="mt-3 flex flex-wrap gap-2">
//                           <button className={buttonSecondary} onClick={() => setDetailsLedger(ledger)}>
//                             View details
//                           </button>
//                           {ledger.pendingAmount > 0.009 && (
//                             <button className={buttonPrimary} onClick={() => openPayment(ledger)}>
//                               <CreditCard size={16} /> Add payment
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </section>
//           </>
//         )}
//       </div>
//       {companyModal && (
//         <Modal
//           title={editingCompany ? "Edit Company Details" : "Add Company"}
//           onClose={() => setCompanyModal(false)}
//         >
//           <form onSubmit={saveCompany} className="space-y-4">
//             <Field label="Company Name *">
//               <input
//                 required
//                 className={inputClass}
//                 value={companyForm.companyName}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, companyName: e.target.value }))}
//                 placeholder="Enter company name"
//               />
//             </Field>
//             <Field label="MR Name *">
//               <input
//                 required
//                 className={inputClass}
//                 value={companyForm.mrName}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, mrName: e.target.value }))}
//                 placeholder="Enter MR name"
//               />
//             </Field>
//             <Field label="MR Mobile Number *">
//               <input
//                 required
//                 inputMode="tel"
//                 className={inputClass}
//                 value={companyForm.mrMobile}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, mrMobile: e.target.value }))}
//                 placeholder="Enter mobile number"
//               />
//             </Field>
//             <Field label="GST Number (Optional)">
//               <input
//                 maxLength={15}
//                 className={inputClass}
//                 value={companyForm.gstNumber || ""}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
//                 placeholder="Enter GSTIN (optional)"
//               />
//             </Field>
//             <Field label="Company Discount (%)">
//               <input
//                 required
//                 type="number"
//                 min="0"
//                 max="100"
//                 step="0.01"
//                 className={inputClass}
//                 value={companyForm.discountPercentage}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, discountPercentage: e.target.value }))}
//               />
//             </Field>
//             <div className="space-y-3 rounded-xl border border-slate-200 p-3">
//               <div className="flex items-center justify-between gap-3">
//                 <div>
//                   <h3 className="text-sm font-bold text-slate-800">Product-wise Discounts</h3>
//                   <p className="text-xs text-slate-500">Discount is applied to each product's MRP.</p>
//                 </div>
//                 <button
//                   type="button"
//                   className={buttonSecondary}
//                   onClick={() => setCompanyForm((f) => ({
//                     ...f,
//                     categoryDiscounts: [...(f.categoryDiscounts || []), {
//                       category: "",
//                       discountPercentage: "0",
//                       isCustom: true,
//                       customCategory: "",
//                     }],
//                   }))}
//                 >
//                   <Plus size={15} /> Add Category
//                 </button>
//               </div>

//               {(companyForm.categoryDiscounts || []).length === 0 && (
//                 <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
//                   No category-specific discounts configured. The company discount above is used as the default.
//                 </p>
//               )}

//               {(companyForm.categoryDiscounts || []).map((item, index) => (
//                 <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
//                   <div className="space-y-1">
//                     <label className="text-xs font-medium text-slate-600">Product category name</label>
//                     <input
//                       required
//                       className={inputClass}
//                       value={item.isCustom ? (item.customCategory || item.category || "") : (item.category || "")}
//                       onChange={(e) => {
//                         const value = e.target.value;
//                         setCompanyForm((f) => ({
//                           ...f,
//                           categoryDiscounts: f.categoryDiscounts.map((row, i) =>
//                             i === index
//                               ? { ...row, category: value, customCategory: value, isCustom: true }
//                               : row
//                           ),
//                         }));
//                       }}
//                       placeholder="Enter category name"
//                     />
//                   </div>
//                   <Field label="Discount (%)">
//                     <input
//                       required
//                       type="number"
//                       min="0"
//                       max="100"
//                       step="0.01"
//                       className={inputClass}
//                       value={item.discountPercentage}
//                       onChange={(e) => updateCompanyDiscount(index, "discountPercentage", e.target.value)}
//                     />
//                   </Field>
//                   <div className="flex items-end">
//                     <button
//                       type="button"
//                       className="rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
//                       onClick={() => setCompanyForm((f) => ({
//                         ...f,
//                         categoryDiscounts: f.categoryDiscounts.filter((_, i) => i !== index),
//                       }))}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {editingCompany && (
//               <Field label="Admin Password (required to approve changes) *">
//                 <input
//                   required
//                   type="password"
//                   autoComplete="current-password"
//                   className={inputClass}
//                   value={adminPassword}
//                   onChange={(e) => setAdminPassword(e.target.value)}
//                   placeholder="Enter your admin login password"
//                 />
//               </Field>
//             )}
//             <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setCompanyModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
//                 {editingCompany ? "Verify & Save" : "Save Company"}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {ledgerModal && (
//         <Modal title="Add Purchase Ledger" onClose={() => setLedgerModal(false)} wide>
//           <form onSubmit={saveLedger} className="space-y-5">
//             <div className="grid gap-4 sm:grid-cols-2">
//               <Field label="Purchase Date *">
//                 <input
//                   required
//                   type="date"
//                   className={inputClass}
//                   value={purchaseDate}
//                   onChange={(e) => setPurchaseDate(e.target.value)}
//                 />
//               </Field>
//               <Field label="Company">
//                 <input
//                   readOnly
//                   className={`${inputClass} bg-slate-50`}
//                   value={selectedCompany?.companyName || ""}
//                 />
//               </Field>
//             </div>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between gap-3">
//                 <h3 className="font-bold text-slate-900">Products</h3>
//                 <button
//                   type="button"
//                   className={buttonSecondary}
//                   onClick={() => setProducts((current) => [...current, emptyProduct()])}
//                 >
//                   <Plus size={16} /> Add Product
//                 </button>
//               </div>
//               {products.map((product, index) => (
//                 <div key={index} className="rounded-xl border border-slate-200 p-3 sm:p-4">
//                   <div className="mb-3 flex items-center justify-between">
//                     <p className="text-sm font-bold text-slate-700">Product {index + 1}</p>
//                     {products.length > 1 && (
//                       <button
//                         type="button"
//                         className="text-xs font-semibold text-rose-600 hover:underline"
//                         onClick={() => setProducts((current) => current.filter((_, i) => i !== index))}
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//                     <Field label="Product Name *">
//                       <input
//                         required
//                         className={inputClass}
//                         value={product.productName}
//                         onChange={(e) => updateProduct(index, "productName", e.target.value)}
//                         placeholder="Medicine / product name"
//                       />
//                     </Field>
//                     <Field label="Product Category *">
//                       <select
//                         required
//                         className={inputClass}
//                         value={product.category || FIXED_PRODUCT_CATEGORIES[0]}
//                         onChange={(e) => updateProduct(index, "category", e.target.value)}
//                       >
//                         {FIXED_PRODUCT_CATEGORIES.map((category) => (
//                           <option key={category} value={category}>{category}</option>
//                         ))}
//                         {selectedCompany?.categoryDiscounts
//                           ?.filter((item) => !FIXED_PRODUCT_CATEGORIES.includes(item.category))
//                           .map((item) => (
//                             <option key={item.category} value={item.category}>{item.category}</option>
//                           ))}
//                       </select>
//                     </Field>
//                     <Field label="Number of Items *">
//                       <input
//                         required
//                         type="number"
//                         min="1"
//                         step="1"
//                         className={inputClass}
//                         value={product.quantity}
//                         onChange={(e) => updateProduct(index, "quantity", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Invoice Number *">
//                       <input
//                         required
//                         className={inputClass}
//                         value={product.invoiceNumber}
//                         onChange={(e) => updateProduct(index, "invoiceNumber", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Batch Number *">
//                       <input
//                       required
//                         className={inputClass}
                        
//                         value={product.batchNumber}
//                         onChange={(e) => updateProduct(index, "batchNumber", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="MRP per Item (₹) *">
//                       <input
//                         required
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         className={inputClass}
//                         value={product.mrp}
//                         onChange={(e) => updateProduct(index, "mrp", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Applied Discount (%)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getCategoryDiscount(product.category).toFixed(2)}
//                       />
//                     </Field>
//                     {/* <Field label="Purchase Rate before GST (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getBasePurchaseRate(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field>
//                     <Field label="GST 5% per Item (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getGSTAmount(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field>
//                     <Field label="Final Purchase Rate incl. GST (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-emerald-50 font-semibold`}
//                         value={getPurchaseRate(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field> */}
//                   </div>
//                   <p className="mt-3 text-right text-sm text-slate-600">
//                     Line total:{" "}
//                     <strong>
//                       {money(Number(product.quantity || 0) * getPurchaseRate(product.companyRate, product.category))}
//                     </strong>
//                   </p>
//                 </div>
//               ))}
//             </div>
//             <Field label="Notes (optional)">
//               <textarea
//                 rows={2}
//                 className={inputClass}
//                 value={ledgerNote}
//                 onChange={(e) => setLedgerNote(e.target.value)}
//                 placeholder="Optional purchase notes"
//               />
//             </Field>
//             <div className="rounded-xl bg-blue-50 p-4">
//               <div className="grid gap-3 sm:grid-cols-3">
//                 <div>
//                   <p className="text-sm text-blue-800">Total purchase before GST</p>
//                   <p className="mt-1 text-xl font-bold text-blue-900">{money(totalPurchaseBeforeGST)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-blue-800">Total GST (5%)</p>
//                   <p className="mt-1 text-xl font-bold text-blue-900">{money(totalGST)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-blue-800">Final purchase total</p>
//                   <p className="mt-1 text-2xl font-bold text-blue-900">{money(purchaseTotal)}</p>
//                 </div>
//               </div>
//               <p className="mt-3 text-xs text-blue-700">
//                 Payments can be added after the ledger is saved.
//               </p>
//             </div>
//             <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setLedgerModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}
//                 Save Ledger
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {paymentModal && paymentLedger && (
//         <Modal title={`Add Payment · ${paymentLedger.ledgerId}`} onClose={() => setPaymentModal(false)}>
//           <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
//             <div>
//               <p className="text-xs text-slate-500">Pending balance</p>
//               <p className="mt-1 font-bold text-rose-700">{money(paymentLedger.pendingAmount)}</p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500">Already paid</p>
//               <p className="mt-1 font-bold text-emerald-700">{money(paymentLedger.paidAmount)}</p>
//             </div>
//           </div>
//           <form onSubmit={savePayment} className="space-y-4">
//             <Field label="Payment Amount (₹) *">
//               <input
//                 required
//                 type="number"
//                 min="0.01"
//                 max={paymentLedger.pendingAmount}
//                 step="0.01"
//                 className={inputClass}
//                 value={paymentForm.amount}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
//               />
//             </Field>
//             <Field label="Payment Date *">
//               <input
//                 required
//                 type="date"
//                 className={inputClass}
//                 value={paymentForm.paymentDate}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))}
//               />
//             </Field>
//             <Field label="Payment Method *">
//               <select
//                 className={inputClass}
//                 value={paymentForm.method}
//                 onChange={(e) => setPaymentForm((f) => ({
//                   ...f,
//                   method: e.target.value,
//                   transactionNumber: e.target.value === "Cash" ? "" : f.transactionNumber,
//                 }))}
//               >
//                 <option value="Cash">Cash</option>
//                 <option value="UPI">UPI</option>
//               </select>
//             </Field>
//             {paymentForm.method === "UPI" && (
//               <Field label="UPI Transaction Number *">
//                 <input
//                   required
//                   className={inputClass}
//                   value={paymentForm.transactionNumber}
//                   onChange={(e) => setPaymentForm((f) => ({ ...f, transactionNumber: e.target.value }))}
//                   placeholder="Enter UPI transaction/reference ID"
//                 />
//               </Field>
//             )}
//             <Field label="Payment Note (optional)">
//               <textarea
//                 rows={2}
//                 className={inputClass}
//                 value={paymentForm.note}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
//               />
//             </Field>
//             <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setPaymentModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CreditCard size={17} />}
//                 Record Payment
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {detailsLedger && (
//         <Modal
//           title={
//   <>
//     Ledger Details ·{" "}
//     <span className="text-teal-600">
//       {new Date(detailsLedger.purchaseDate).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       })}
//     </span>
//   </>
// }
//           onClose={() => setDetailsLedger(null)}
//           wide
//         >
//           <div className="grid gap-3 sm:grid-cols-3">
//             <div className="rounded-xl bg-slate-50 p-3">
//               <p className="text-xs text-slate-500">Purchase total</p>
//               <p className="mt-1 font-bold">{money(detailsLedger.totalAmount)}</p>
//             </div>
//             <div className="rounded-xl bg-emerald-50 p-3">
//               <p className="text-xs text-emerald-700">Total paid</p>
//               <p className="mt-1 font-bold text-emerald-800">{money(detailsLedger.paidAmount)}</p>
//             </div>
//             <div className="rounded-xl bg-rose-50 p-3">
//               <p className="text-xs text-rose-700">Pending balance</p>
//               <p className="mt-1 font-bold text-rose-800">{money(detailsLedger.pendingAmount)}</p>
//             </div>
//           </div>
//           <h3 className="mb-2 mt-5 font-bold text-slate-900">Products</h3>
//           <div className="overflow-x-auto rounded-xl border">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50">
//                 <tr>
//                   <th className="px-3 py-2">Product</th>
//                   <th className="px-3 py-2">Qty</th>
//                   <th className="px-3 py-2">Invoice No.</th>
//                   <th className="px-3 py-2">Batch No.</th>
//                   <th className="px-3 py-2">MRP</th>
//                   {/* <th className="px-3 py-2">Purchase Rate</th> */}
//                   <th className="px-3 py-2">Discount</th>
//                   <th className="px-3 py-2">Total Purchase Rate Before GST</th>
//                   <th className="px-3 py-2">Total GST</th>
//                   {/* <th className="px-3 py-2">Total Purchase Rate After GST</th> */}
//                   <th className="px-3 py-2">Total Price</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {detailsLedger.products.map((product, index) => (
//                   <tr key={product._id || index}>
//                     <td className="px-3 py-3">{product.productName}</td>
//                     <td className="px-3 py-3">{product.quantity}</td>
//                     <td className="px-3 py-3">{product.invoiceNumber || "—"}</td>
//                     <td className="px-3 py-3">{product.batchNumber || "—"}</td>
//                     <td className="px-3 py-3">{money(product.mrp)}</td>
//                     {/* <td className="px-3 py-3">{money(product.companyRate)}</td> */}
//                     <td className="px-3 py-3">{Number(product.discountPercentage || 0)}%</td>
//                     <td className="px-3 py-3">{money(Number(product.basePurchaseRate ?? product.purchaseRate)*Number(product.quantity))}</td>
//                     <td className="px-3 py-3">{money(Number(product.gstAmount)*Number(product.quantity) || 0)}</td>
//                     {/* <td className="px-3 py-3">{money(product.purchaseRate)}</td> */}
//                     <td className="px-3 py-3 font-semibold">
//                       {money(Number(product.quantity) * Number(product.purchaseRate))}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="mt-5 flex items-center justify-between gap-3">
//             <h3 className="font-bold text-slate-900">Payment History</h3>
//             {detailsLedger.pendingAmount > 0.009 && (
//               <button
//                 className={buttonPrimary}
//                 onClick={() => {
//                   const current = detailsLedger;
//                   setDetailsLedger(null);
//                   openPayment(current);
//                 }}
//               >
//                 <Plus size={16} /> Add Payment
//               </button>
//             )}
//           </div>
//           {(detailsLedger.payments || []).length === 0 ? (
//             <p className="mt-3 rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
//               No payments recorded yet.
//             </p>
//           ) : (
//             <div className="mt-3 space-y-2">
//               {detailsLedger.payments.map((payment, index) => (
//                 <div
//                   key={payment._id || index}
//                   className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
//                 >
//                   <div>
//                     <p className="font-semibold text-slate-900">
//                       {money(payment.amount)} · {payment.method}
//                     </p>
//                     <p className="mt-1 text-xs text-slate-500">
//                       {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
//                     </p>
//                     {payment.transactionNumber && (
//                       <p className="mt-1 text-xs text-slate-600">
//                         Transaction: {payment.transactionNumber}
//                       </p>
//                     )}
//                     {payment.note && (
//                       <p className="mt-1 text-xs text-slate-500">{payment.note}</p>
//                     )}
//                   </div>
//                   <span className="text-xs font-semibold text-emerald-700">
//                     <CheckCircle2 className="mr-1 inline" size={15} />
//                     Recorded
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//           {detailsLedger.note && (
//             <p className="mt-4 text-sm text-slate-500">
//               Note: {detailsLedger.note}
//             </p>
//           )}
//         </Modal>
//       )}
//     </div>
//   );
// }

// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import {
//   ArrowLeft,
//   Building2,
//   CalendarDays,
//   CheckCircle2,
//   ChevronRight,
//   CreditCard,
//   FileText,
//   Filter,
//   LoaderCircle,
//   LockKeyhole,
//   MessageCircle,
//   Plus,
//   RefreshCw,
//   Search,
//   Wallet,
//   X,
// } from "lucide-react";
// const API = "https://dms-backend-amber.vercel.app/api/company-ledger";
// const money = (value) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(Number(value || 0));
// const normalizeLedgerSearch = (value) =>
//   String(value ?? "")
//     .toLowerCase()
//     .replace(/[₹,\s]/g, "")
//     .trim();

// const today = () => new Date().toISOString().slice(0, 10);

// // Opens the selected MR's WhatsApp chat with a prefilled payment acknowledgement.
// // WhatsApp will still require the user to press Send; no WhatsApp API is used.
// const sharePaymentOnWhatsApp = (company, ledger, payment) => {
//   const rawMobile = String(company?.mrMobile || "").replace(/\D/g, "");
//   let phone = rawMobile;

//   // Assume Indian mobile numbers when the company record contains a 10-digit number.
//   if (phone.length === 10) phone = `91${phone}`;
//   else if (phone.length === 11 && phone.startsWith("0")) phone = `91${phone.slice(1)}`;

//   if (!phone || phone.length < 10) {
//     window.alert("MR mobile number is missing or invalid. Please update company details first.");
//     return;
//   }

//   const date = payment?.paymentDate
//     ? new Date(payment.paymentDate).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       })
//     : "—";
//   const amount = new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(Number(payment?.amount || 0));

//   const message = [
//     "*DHRUWRAJ HEALTHCARE — PAYMENT RECEIPT*",
//     `Company: ${company?.companyName || "—"}`,
//     `MR: ${company?.mrName || "—"}`,
//     `Ledger ID: ${ledger?.ledgerId || "—"}`,
//     `Receipt date: ${date}`,
//     `Amount: ${amount}`,
//     `Payment mode: ${payment?.method || "—"}`,
//     payment?.transactionNumber ? `UPI Transaction No.: ${payment.transactionNumber}` : "",
//     "",
//     `Please confirm in this chat: Received ${amount} via ${payment?.method || "payment"}.`,
//   ].filter(Boolean).join("\n");

//   const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
//   window.open(whatsappUrl, "_blank", "noopener,noreferrer");
// };
// const FIXED_PRODUCT_CATEGORIES = [
//   "General",
// ];

// const emptyCompany = {
//   companyName: "",
//   mrName: "",
//   mrMobile: "",
//   gstNumber: "",
//   discountPercentage: "0",
//   categoryDiscounts: [],
// };
// const emptyProduct = () => ({
//   productName: "",
//   category: FIXED_PRODUCT_CATEGORIES[0],
//   quantity: "1",
//   invoiceNumber: "",
//   batchNumber: "",
//   mrp: "",
//   companyRate: "",
//   purchaseRate: "",
// });
// const inputClass =
//   "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 ";
// const buttonPrimary =
//   "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2.5 px-4 text-sm font-bold hover:scale-[1.02] transition cursor-pointer";
// const buttonSecondary =
//   "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";
// function Modal({ title, onClose, children, wide = false }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5">
//       <div
//         className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
//           wide ? "max-w-5xl" : "max-w-xl"
//         }`}
//       >
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
//           <h2 className="text-lg font-bold text-slate-900">{title}</h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
//             aria-label="Close"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <div className="p-5">{children}</div>
//       </div>
//     </div>
//   );
// }
// function Field({ label, children }) {
//   return (
//     <label className="block min-w-0 space-y-1.5">
//       <span className="text-sm font-medium text-slate-700">{label}</span>
//       {children}
//     </label>
//   );
// }
// function SummaryCard({ label, value, icon: Icon }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4">
//       <div className="flex items-center justify-between gap-3">
//         <span className="text-sm text-slate-500">{label}</span>
//         <Icon size={19} className="text-teal-600" />
//       </div>
//       <p className="mt-2 break-words text-xl font-bold text-slate-900">
//         {value}
//       </p>
//     </div>
//   );
// }
// export default function CompanyLedger() {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompanyId, setSelectedCompanyId] = useState("");
//   const [ledgers, setLedgers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [dismissedReminderIds, setDismissedReminderIds] = useState([]);
//   const [search, setSearch] = useState("");
//   const [ledgerSearch, setLedgerSearch] = useState("");
//   const [companyModal, setCompanyModal] = useState(false);
//   const [editingCompany, setEditingCompany] = useState(null);
//   const [companyForm, setCompanyForm] = useState(emptyCompany);
//   const [adminPassword, setAdminPassword] = useState("");
//   const [ledgerModal, setLedgerModal] = useState(false);
//   const [purchaseDate, setPurchaseDate] = useState(today());
//   const [products, setProducts] = useState([emptyProduct()]);
//   const [ledgerNote, setLedgerNote] = useState("");
//   const [paymentModal, setPaymentModal] = useState(false);
//   const [paymentLedger, setPaymentLedger] = useState(null);
//   const [paymentForm, setPaymentForm] = useState({
//     amount: "",
//     paymentDate: today(),
//     method: "Cash",
//     transactionNumber: "",
//     note: "",
//   });
//   const [detailsLedger, setDetailsLedger] = useState(null);
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     from: "",
//     to: "",
//     status: "All",
//     batchNumber: "",
//   });
//   const token = localStorage.getItem("token");
//   const headers = useMemo(
//     () => ({ Authorization: `Bearer ${token}` }),
//     [token]
//   );
//   const request = useCallback(
//     async (method, url, data) => {
//       const response = await axios({
//         method,
//         url,
//         data,
//         headers,
//       });
//       return response.data;
//     },
//     [headers]
//   );
//   const loadCompanies = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const data = await request("get", API);
//       const list = Array.isArray(data) ? data : [];
//       setCompanies(list);
//       if (
//         selectedCompanyId &&
//         !list.some((company) => company._id === selectedCompanyId)
//       ) {
//         setSelectedCompanyId("");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Unable to load companies. Please check your login."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [request, selectedCompanyId]);
//   const loadLedgers = useCallback(async () => {
//     if (!selectedCompanyId) {
//       setLedgers([]);
//       return;
//     }
//     setError("");
//     try {
//       const params = {};
//       if (filters.from) params.from = filters.from;
//       if (filters.to) params.to = filters.to;
//       if (filters.status !== "All") params.status = filters.status;
//       if (filters.batchNumber.trim()) {
//         params.batchNumber = filters.batchNumber.trim();
//       }
//       const response = await axios.get(
//         `${API}/companies/${selectedCompanyId}/ledgers`,
//         { headers, params }
//       );
//       setLedgers(Array.isArray(response.data) ? response.data : []);
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to load purchase ledgers."
//       );
//     }
//   }, [selectedCompanyId, filters, headers]);
//   useEffect(() => {
//     loadCompanies();
//   }, [loadCompanies]);
//   useEffect(() => {
//     loadLedgers();
//   }, [loadLedgers]);

//   const selectedCompany = companies.find(
//     (company) => company._id === selectedCompanyId
//   );

//   const visibleLedgers = useMemo(() => {
//     const query = normalizeLedgerSearch(ledgerSearch);

//     if (!query) return ledgers;

//     return ledgers.filter((ledger) => {
//       const purchaseDate = new Date(ledger.purchaseDate);
//       const dateValues = Number.isNaN(purchaseDate.getTime())
//         ? []
//         : [
//             purchaseDate.toLocaleDateString("en-IN"),
//             purchaseDate.toISOString().slice(0, 10),
//             purchaseDate.toLocaleDateString("en-US"),
//           ];

//       const productValues = (ledger.products || []).flatMap((product) => {
//         const quantity = Number(product.quantity || 0);
//         const mrp = Number(product.mrp || 0);
//         const companyRate = Number(product.companyRate || 0);
//         const basePurchaseRate = Number(product.basePurchaseRate || 0);
//         const purchaseRate = Number(product.purchaseRate || 0);
//         const gstAmount = Number(product.gstAmount || 0);

//         return [
//           product.productName,
//           product.category,
//           product.invoiceNumber,
//           product.batchNumber,
//           product.quantity,
//           product.mrp,
//           money(mrp),
//           product.companyRate,
//           money(companyRate),
//           product.basePurchaseRate,
//           money(basePurchaseRate),
//           product.purchaseRate,
//           money(purchaseRate),
//           product.gstAmount,
//           money(gstAmount),
//           quantity * mrp,
//           money(quantity * mrp),
//           quantity * companyRate,
//           money(quantity * companyRate),
//           quantity * basePurchaseRate,
//           money(quantity * basePurchaseRate),
//           quantity * purchaseRate,
//           money(quantity * purchaseRate),
//           quantity * gstAmount,
//           money(quantity * gstAmount),
//         ];
//       });

//       const paymentValues = (ledger.payments || []).flatMap((payment) => [
//         payment.amount,
//         money(payment.amount),
//         payment.method,
//         payment.transactionNumber,
//         payment.note,
//         payment.paymentDate,
//       ]);

//       const searchableValues = [
//         ledger.ledgerId,
//         ledger.paymentStatus,
//         ledger.note,
//         ledger.totalAmount,
//         money(ledger.totalAmount),
//         ledger.paidAmount,
//         money(ledger.paidAmount),
//         ledger.pendingAmount,
//         money(ledger.pendingAmount),
//         ...dateValues,
//         ...productValues,
//         ...paymentValues,
//       ];

//       return searchableValues.some((value) =>
//         normalizeLedgerSearch(value).includes(query)
//       );
//     });
//   }, [ledgers, ledgerSearch]);

//   const visibleCompanies = companies.filter((company) =>
//     [
//       company.companyName,
//       company.mrName,
//       company.mrMobile,
//     ].some((value) =>
//       String(value || "").toLowerCase().includes(search.toLowerCase())
//     )
//   );
//   const summary = useMemo(
//     () =>
//       ledgers.reduce(
//         (acc, ledger) => {
//           acc.purchase += Number(ledger.totalAmount || 0);
//           acc.paid += Number(ledger.paidAmount || 0);
//           acc.pending += Number(ledger.pendingAmount || 0);
//           return acc;
//         },
//         { purchase: 0, paid: 0, pending: 0 }
//       ),
//     [ledgers]
//   );
//   const openAddCompany = () => {
//     setEditingCompany(null);
//     setCompanyForm(emptyCompany);
//     setAdminPassword("");
//     setError("");
//     setCompanyModal(true);
//   };
//   const openEditCompany = () => {
//     if (!selectedCompany) return;
//     setEditingCompany(selectedCompany);
//     setCompanyForm({
//       companyName: selectedCompany.companyName || "",
//       mrName: selectedCompany.mrName || "",
//       mrMobile: selectedCompany.mrMobile || "",
//       gstNumber: selectedCompany.gstNumber || "",
//       discountPercentage: String(selectedCompany.discountPercentage ?? 0),
//       categoryDiscounts: (selectedCompany.categoryDiscounts || []).map((item) => ({
//         category: item.category || "",
//         discountPercentage: String(item.discountPercentage ?? 0),
//         isCustom: !FIXED_PRODUCT_CATEGORIES.includes(item.category),
//         customCategory: !FIXED_PRODUCT_CATEGORIES.includes(item.category) ? item.category : "",
//       })),
//     });
//     setAdminPassword("");
//     setError("");
//     setCompanyModal(true);
//   };
//   const saveCompany = async (event) => {
//     event.preventDefault();
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       const payload = {
//         ...companyForm,
//         gstNumber: String(companyForm.gstNumber || "").trim().toUpperCase(),
//         discountPercentage: Number(companyForm.discountPercentage || 0),
//         categoryDiscounts: (companyForm.categoryDiscounts || []).map((item) => ({
//           category: String(item.isCustom ? item.customCategory : item.category).trim(),
//           discountPercentage: Number(item.discountPercentage || 0),
//         })),
//       };
//       let saved;
//       if (editingCompany) {
//         payload.adminPassword = adminPassword;
//         saved = await request(
//           "put",
//           `${API}/companies/${editingCompany._id}`,
//           payload
//         );
//       } else {
//         saved = await request("post", `${API}/companies`, payload);
//       }
//       setCompanyModal(false);
//       setNotice(
//         editingCompany
//           ? "Company details updated successfully."
//           : "Company added successfully."
//       );
//       await loadCompanies();
//       if (!editingCompany && saved?._id) {
//         setSelectedCompanyId(saved._id);
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to save company."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const getCategoryDiscount = (category) => {
//     const configured = selectedCompany?.categoryDiscounts?.find(
//       (item) => String(item.category || "").trim().toLowerCase() === String(category || "").trim().toLowerCase()
//     );
//     if (configured) return Number(configured.discountPercentage || 0);
//     return Number(selectedCompany?.discountPercentage || 0);
//   };

//   const getBasePurchaseRate = (companyRate, category) => {
//     const rate = Number(companyRate || 0);
//     return Number((rate * (1 - getCategoryDiscount(category) / 100)).toFixed(2));
//   };

//   const getGSTAmount = (companyRate, category) =>
//     Number((getBasePurchaseRate(companyRate, category) * 0.05).toFixed(2));

//   // Final per-item purchase rate includes the fixed 5% GST.
//   const getPurchaseRate = (companyRate, category) =>
//     Number((getBasePurchaseRate(companyRate, category) + getGSTAmount(companyRate, category)).toFixed(2));

//   const overdueReminders = companies.flatMap((company) =>
//     (company.ledgers || [])
//       .filter((ledger) => {
//         const pending = Number(ledger.pendingAmount || 0);
//         const purchaseDateMs = new Date(ledger.purchaseDate).getTime();
//         const ageDays = (Date.now() - purchaseDateMs) / (1000 * 60 * 60 * 24);
//         return pending > 0.009 && Number.isFinite(purchaseDateMs) && ageDays >= 30;
//       })
//       .map((ledger) => ({ ...ledger, reminderCompanyName: company.companyName }))
//   );

//   const updateCompanyDiscount = (index, field, value) => {
//     setCompanyForm((current) => ({
//       ...current,
//       categoryDiscounts: current.categoryDiscounts.map((item, i) => {
//         if (i !== index) return item;
//         if (field === "category") {
//           return {
//             ...item,
//             category: value,
//             isCustom: value === "__custom__",
//             customCategory: value === "__custom__" ? item.customCategory || "" : "",
//           };
//         }
//         return { ...item, [field]: value };
//       }),
//     }));
//   };

//   // const updateProduct = (index, field, value) => {
//   //   setProducts((current) =>
//   //     current.map((product, i) =>
//   //       i === index ? { ...product, [field]: value } : product
//   //     )
//   //   );
//   // };
//   const updateProduct = (index, field, value) => {
//   setProducts((current) =>
//     current.map((product, i) => {
//       if (i !== index) return product;

//       // Update the targeted field
//       const updatedProduct = { ...product, [field]: value };

//       // If the user is changing the MRP, automatically calculate companyRate
//       if (field === "mrp") {
//         updatedProduct.companyRate = value ? (Number(value) / 1.05).toFixed(2) : "";
//       }

//       return updatedProduct;
//     })
//   );
// };
//   const totalPurchaseBeforeGST = products.reduce(
//     (sum, product) => sum + Number(product.quantity || 0) * getBasePurchaseRate(product.companyRate, product.category),
//     0
//   );
//   const totalGST = products.reduce(
//     (sum, product) => sum + Number(product.quantity || 0) * getGSTAmount(product.companyRate, product.category),
//     0
//   );
//   const purchaseTotal = Number((totalPurchaseBeforeGST + totalGST).toFixed(2));
//   const saveLedger = async (event) => {
//     event.preventDefault();
//     if (!selectedCompanyId) return;
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       const payload = {
//         purchaseDate,
//         products: products.map((product) => ({
//           ...product,
//           quantity: Number(product.quantity),
//           mrp: Number(product.mrp),
//           companyRate: Number(product.companyRate),
//           basePurchaseRate: getBasePurchaseRate(product.companyRate, product.category),
//           gstPercentage: 5,
//           gstAmount: getGSTAmount(product.companyRate, product.category),
//           purchaseRate: getPurchaseRate(product.companyRate, product.category),
//           discountPercentage: getCategoryDiscount(product.category),
//         })),
//         note: ledgerNote,
//       };
//       await request(
//         "post",
//         `${API}/companies/${selectedCompanyId}/ledgers`,
//         payload
//       );
//       setLedgerModal(false);
//       setProducts([emptyProduct()]);
//       setPurchaseDate(today());
//       setLedgerNote("");
//       setNotice("Purchase ledger created successfully.");
//       await loadLedgers();
//       await loadCompanies();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to create ledger."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const openPayment = (ledger) => {
//     setPaymentLedger(ledger);
//     setPaymentForm({
//       amount: String(ledger.pendingAmount || ""),
//       paymentDate: today(),
//       method: "Cash",
//       transactionNumber: "",
//       note: "",
//     });
//     setError("");
//     setPaymentModal(true);
//   };
//   const savePayment = async (event) => {
//     event.preventDefault();
//     if (!paymentLedger || !selectedCompanyId) return;
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       await request(
//         "post",
//         `${API}/companies/${selectedCompanyId}/ledgers/${paymentLedger._id}/payments`,
//         {
//           ...paymentForm,
//           amount: Number(paymentForm.amount),
//         }
//       );
//       setPaymentModal(false);
//       setNotice("Payment recorded successfully.");
//       await loadLedgers();
//       await loadCompanies();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to record payment."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const resetFilters = () => {
//     setFilters({
//       from: "",
//       to: "",
//       status: "All",
//       batchNumber: "",
//     });
//   };
//   const companyLedgerCount = selectedCompany?.ledgers?.length || 0;
//   return (
//     <div className="min-h-screen w-full">
//       {overdueReminders.filter((ledger) => !dismissedReminderIds.includes(ledger._id)).length > 0 && (
//         <div className="fixed right-4 top-4 z-[80] w-[min(92vw,380px)] space-y-2">
//           {overdueReminders
//             .filter((ledger) => !dismissedReminderIds.includes(ledger._id))
//             .map((ledger) => (
//               <div key={ledger._id} className="rounded-xl border border-amber-300 bg-white p-4 shadow-xl">
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex items-start gap-2">
//                     <CalendarDays className="mt-0.5 shrink-0 text-amber-600" size={19} />
//                     <div>
//                       <p className="font-bold text-slate-900">Payment overdue for 30+ days</p>
//                       <p className="mt-1 text-sm text-slate-600">
//                         {ledger.ledgerId} · {ledger.reminderCompanyName || "Company"}
//                       </p>
//                       <p className="mt-1 text-sm text-rose-700">
//                         Pending: <strong>{money(ledger.pendingAmount)}</strong>
//                       </p>
//                       <button
//                         className="mt-2 text-sm font-semibold text-teal-700 hover:underline"
//                         onClick={() => setDetailsLedger(ledger)}
//                       >
//                         View ledger details
//                       </button>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
//                     aria-label="Dismiss reminder"
//                     onClick={() => setDismissedReminderIds((ids) => [...ids, ledger._id])}
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               </div>
//             ))}
//         </div>
//       )}
//       <div className="mx-auto max-w-7xl space-y-5">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-xl font-semibold text-slate-800">
//               Company Ledger
//             </h1>
//             <p className="text-sm text-slate-400">
//               Manage supplier purchases, payment history and outstanding balances.
//             </p>
//           </div>
//           <button className={buttonPrimary} onClick={openAddCompany}>
//             <Plus size={18} /> Add Company
//           </button>
//         </div>
//         {error && (
//           <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//             <span>{error}</span>
//             <button onClick={() => setError("")} aria-label="Dismiss error">
//               <X size={17} />
//             </button>
//           </div>
//         )}
//         {notice && (
//           <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
//             <span>{notice}</span>
//             <button onClick={() => setNotice("")} aria-label="Dismiss message">
//               <X size={17} />
//             </button>
//           </div>
//         )}
//         {!selectedCompanyId ? (
//           <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
//             <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-slate-900">
//                   Your Companies
//                 </h2>
//                 <p className="text-sm text-slate-500">
//                   Select a company to view its purchase ledgers.
//                 </p>
//               </div>
//               <div className="relative w-full sm:max-w-xs">
//                 <Search
//                   size={18}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                 />
//                 <input
//                   className={`${inputClass} pl-10`}
//                   placeholder="Search companies..."
//                   value={search}
//                   onChange={(event) => setSearch(event.target.value)}
//                 />
//               </div>
//             </div>
//             {loading ? (
//               <div className="flex justify-center py-12">
//                 <LoaderCircle className="animate-spin text-teal-600" />
//               </div>
//             ) : visibleCompanies.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
//                 <Building2 className="mx-auto text-slate-400" size={36} />
//                 <p className="mt-3 font-semibold text-slate-700">
//                   No companies found
//                 </p>
//                 <p className="mt-1 text-sm text-slate-500">
//                   Add your first company to start recording purchases.
//                 </p>
//               </div>
//             ) : (
//               <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
//                 {visibleCompanies.map((company) => (
//                   <button
//                     key={company._id}
//                     onClick={() => setSelectedCompanyId(company._id)}
//                     className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40"
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex min-w-0 items-center gap-3">
//                         <div className="rounded-xl bg-blue-50 p-3 text-teal-600">
//                           <Building2 size={22} />
//                         </div>
//                         <div className="min-w-0">
//                           <h3 className="truncate font-bold text-slate-900">
//                             {company.companyName}
//                           </h3>
//                           <p className="mt-1 text-sm text-slate-500">
//                             MR : {company.mrName}
//                           </p>
//                         </div>
//                       </div>
//                       <ChevronRight size={19} className="shrink-0 text-slate-400" />
//                     </div>
//                     <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
//                       <span className="text-slate-500">
//                         Contact : {company.mrMobile}
//                       </span>
//                       {/* <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
//                         {company.discountPercentage || 0}% discount
//                       </span> */}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </section>
//         ) : (
//           <>
//             <button
//               className={buttonSecondary}
//               onClick={() => setSelectedCompanyId("")}
//             >
//               <ArrowLeft size={17} /> All Companies
//             </button>
//             <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
//               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-start gap-3">
//                   <div className="rounded-xl bg-blue-50 p-3 text-teal-600">
//                     <Building2 size={25} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-900">
//                       {selectedCompany?.companyName}
//                     </h2>
//                     <p className="mt-1 text-sm text-slate-500">
//                       MR: {selectedCompany?.mrName} · {selectedCompany?.mrMobile}
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Company discount: {selectedCompany?.discountPercentage || 0}%
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   <button className={buttonSecondary} onClick={openEditCompany}>
//                     <LockKeyhole size={17} /> Edit Details
//                   </button>
//                   <button
//                     className={buttonSecondary}
//                     onClick={() => setFiltersOpen((open) => !open)}
//                   >
//                     <Filter size={17} /> Filters
//                   </button>
//                   <button
//                     className={buttonPrimary}
//                     onClick={() => {
//                       setProducts([emptyProduct()]);
//                       setPurchaseDate(today());
//                       setLedgerNote("");
//                       setError("");
//                       setLedgerModal(true);
//                     }}
//                   >
//                     <Plus size={18} /> Add Ledger
//                   </button>
//                 </div>
//               </div>
//             </section>
//             {filtersOpen && (
//               <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
//                 <Field label="Purchase date from">
//                   <input
//                     type="date"
//                     className={inputClass}
//                     value={filters.from}
//                     max={filters.to || undefined}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, from: e.target.value }))
//                     }
//                   />
//                 </Field>
//                 <Field label="Purchase date to">
//                   <input
//                     type="date"
//                     className={inputClass}
//                     value={filters.to}
//                     min={filters.from || undefined}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, to: e.target.value }))
//                     }
//                   />
//                 </Field>
//                 <Field label="Payment status">
//                   <select
//                     className={inputClass}
//                     value={filters.status}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, status: e.target.value }))
//                     }
//                   >
//                     <option>All</option>
//                     <option>Pending</option>
//                     <option>Paid</option>
//                   </select>
//                 </Field>
//                 {/* <Field label="Batch number">
//                   <input
//                     className={inputClass}
//                     placeholder="Search batch..."
//                     value={filters.batchNumber}
//                     onChange={(e) =>
//                       setFilters((f) => ({
//                         ...f,
//                         batchNumber: e.target.value,
//                       }))
//                     }
//                   />
//                 </Field> */}
//                 <div className="flex items-end">
//                   <button
//                     className={`${buttonSecondary} w-full cursor-pointer`}
//                     onClick={resetFilters}
//                   >
//                     <RefreshCw size={17} />Reset filters
//                   </button>
//                 </div>
//               </section>
//             )}
//             <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
//               <SummaryCard
//                 label="Purchase Total"
//                 value={money(summary.purchase)}
//                 icon={FileText}
//               />
//               <SummaryCard
//                 label="Total Paid"
//                 value={money(summary.paid)}
//                 icon={CheckCircle2}
//               />
//               <SummaryCard
//                 label="Pending Balance"
//                 value={money(summary.pending)}
//                 icon={Wallet}
//               />
//             </section>
//             <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
//               <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <h2 className="font-bold text-slate-900">Purchase Ledgers</h2>
//                   <span className="text-sm text-slate-500">
//                     {visibleLedgers.length} of {ledgers.length} ledger(s)
//                   </span>
//                 </div>
//                 <div className="relative w-full sm:max-w-md">
//                   <Search
//                     size={17}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                   <input
//                     type="text"
//                     className={`${inputClass} appearance-none pr-10 pl-10`}
//                     placeholder="Search product, invoice, batch, price, date, status..."
//                     value={ledgerSearch}
//                     onChange={(event) => setLedgerSearch(event.target.value)}
//                     aria-label="Search purchase ledgers"
//                   />
//                   {ledgerSearch && (
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2  hover:cursor-pointer hover:text-teal-600"
//                       onClick={() => setLedgerSearch("")}
//                       aria-label="Clear ledger search"
//                     >
//                       <X size={16} />
//                     </button>
//                   )}
//                 </div>
//               </div>
//               {visibleLedgers.length === 0 ? (
//                 <div className="py-12 text-center">
//                   <FileText className="mx-auto text-slate-400" size={34} />
//                   <p className="mt-3 font-semibold text-slate-700">
//                     No matching purchase ledgers
//                   </p>
//                   <p className="mt-1 text-sm text-slate-500">
//                     Try another product name, invoice number, batch number, amount, date, or payment status.
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="hidden overflow-x-auto md:block">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                         <tr>
//                           <th className="px-4 py-3">Date</th>
//                           <th className="px-4 py-3">Products</th>
//                           <th className="px-4 py-3">Invoice & Batch No.</th>
//                           <th className="px-4 py-3">Purchase total</th>
//                           <th className="px-4 py-3">Paid</th>
//                           <th className="px-4 py-3">Pending</th>
//                           <th className="px-4 py-3">Status</th>
//                           <th className="px-4 py-3">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-100">
//                         {visibleLedgers.map((ledger) => (
//                           <tr key={ledger._id} className="align-top hover:bg-slate-50">
//                             <td className="px-4 py-4">
//                               {/* <p className="font-bold text-blue-700">{ledger.ledgerId}</p> */}
//                               <p className="font-bold text-teal-700">
//                                 {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
//                               </p>
//                             </td>
//                             <td className="max-w-56 px-4 py-4">
//                               {ledger.products.map((product, index) => (
//                                 <p key={product._id || index} className="mb-1">
//                                   {product.productName}{" "}
//                                   <span className="text-slate-500">
//                                     × {product.quantity}
//                                   </span>
//                                 </p>
//                               ))}
//                             </td>
//                             <td className="max-w-48 px-4 py-4">
//                               {ledger.products.map((product, index) => (
//                                 <p key={product._id || index} className="mb-1 text-xs text-slate-600">
//                                   Inv: {product.invoiceNumber || "—"} · Batch: {product.batchNumber || "—"}
//                                 </p>
//                               ))}
//                             </td>
//                             <td className="px-4 py-4 font-semibold">{money(ledger.totalAmount)}</td>
//                             <td className="px-4 py-4 text-emerald-700">{money(ledger.paidAmount)}</td>
//                             <td className="px-4 py-4 font-semibold text-rose-700">{money(ledger.pendingAmount)}</td>
//                             <td className="px-4 py-4">
//                               <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
//                                 ledger.paymentStatus === "Paid"
//                                   ? "bg-emerald-50 text-emerald-700"
//                                   : "bg-amber-50 text-amber-700"
//                               }`}>
//                                 {ledger.paymentStatus}
//                               </span>
//                             </td>
//                             <td className="px-4 py-4">
//                               <div className="flex flex-col items-start gap-2">
//                                 <button
//                                   className="text-xs font-semibold text-blue-700 hover:underline"
//                                   onClick={() => setDetailsLedger(ledger)}
//                                 >
//                                   View details
//                                 </button>
//                                 {ledger.pendingAmount > 0.009 && (
//                                   <button
//                                     className="text-xs font-semibold text-emerald-700 hover:underline"
//                                     onClick={() => openPayment(ledger)}
//                                   >
//                                     Add payment
//                                   </button>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                   <div className="space-y-3 p-3 md:hidden">
//                     {visibleLedgers.map((ledger) => (
//                       <div key={ledger._id} className="rounded-xl border border-slate-200 p-4">
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <p className="font-bold text-blue-700">{ledger.ledgerId}</p>
//                             <p className="mt-1 text-xs text-slate-500">
//                               {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
//                             </p>
//                           </div>
//                           <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
//                             ledger.paymentStatus === "Paid"
//                               ? "bg-emerald-50 text-emerald-700"
//                               : "bg-amber-50 text-amber-700"
//                           }`}>
//                             {ledger.paymentStatus}
//                           </span>
//                         </div>
//                         <div className="mt-3 space-y-1 text-sm">
//                           {ledger.products.map((product, index) => (
//                             <p key={product._id || index} className="text-slate-700">
//                               {product.productName} × {product.quantity}
//                             </p>
//                           ))}
//                         </div>
//                         <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
//                           <div>
//                             <p className="text-xs text-slate-500">Purchase total</p>
//                             <p className="mt-1 font-bold">{money(ledger.totalAmount)}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-slate-500">Pending</p>
//                             <p className="mt-1 font-bold text-rose-700">{money(ledger.pendingAmount)}</p>
//                           </div>
//                         </div>
//                         <div className="mt-3 flex flex-wrap gap-2">
//                           <button className={buttonSecondary} onClick={() => setDetailsLedger(ledger)}>
//                             View details
//                           </button>
//                           {ledger.pendingAmount > 0.009 && (
//                             <button className={buttonPrimary} onClick={() => openPayment(ledger)}>
//                               <CreditCard size={16} /> Add payment
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </section>
//           </>
//         )}
//       </div>
//       {companyModal && (
//         <Modal
//           title={editingCompany ? "Edit Company Details" : "Add Company"}
//           onClose={() => setCompanyModal(false)}
//         >
//           <form onSubmit={saveCompany} className="space-y-4">
//             <Field label="Company Name *">
//               <input
//                 required
//                 className={inputClass}
//                 value={companyForm.companyName}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, companyName: e.target.value }))}
//                 placeholder="Enter company name"
//               />
//             </Field>
//             <Field label="MR Name *">
//               <input
//                 required
//                 className={inputClass}
//                 value={companyForm.mrName}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, mrName: e.target.value }))}
//                 placeholder="Enter MR name"
//               />
//             </Field>
//             <Field label="MR Mobile Number *">
//               <input
//                 required
//                 inputMode="tel"
//                 className={inputClass}
//                 value={companyForm.mrMobile}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, mrMobile: e.target.value }))}
//                 placeholder="Enter mobile number"
//               />
//             </Field>
//             <Field label="GST Number (Optional)">
//               <input
//                 maxLength={15}
//                 className={inputClass}
//                 value={companyForm.gstNumber || ""}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
//                 placeholder="Enter GSTIN (optional)"
//               />
//             </Field>
//             <Field label="Company Discount (%)">
//               <input
//                 required
//                 type="number"
//                 min="0"
//                 max="100"
//                 step="0.01"
//                 className={inputClass}
//                 value={companyForm.discountPercentage}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, discountPercentage: e.target.value }))}
//               />
//             </Field>
//             <div className="space-y-3 rounded-xl border border-slate-200 p-3">
//               <div className="flex items-center justify-between gap-3">
//                 <div>
//                   <h3 className="text-sm font-bold text-slate-800">Product-wise Discounts</h3>
//                   <p className="text-xs text-slate-500">Discount is applied to each product's MRP.</p>
//                 </div>
//                 <button
//                   type="button"
//                   className={buttonSecondary}
//                   onClick={() => setCompanyForm((f) => ({
//                     ...f,
//                     categoryDiscounts: [...(f.categoryDiscounts || []), {
//                       category: "",
//                       discountPercentage: "0",
//                       isCustom: true,
//                       customCategory: "",
//                     }],
//                   }))}
//                 >
//                   <Plus size={15} /> Add Category
//                 </button>
//               </div>

//               {(companyForm.categoryDiscounts || []).length === 0 && (
//                 <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
//                   No category-specific discounts configured. The company discount above is used as the default.
//                 </p>
//               )}

//               {(companyForm.categoryDiscounts || []).map((item, index) => (
//                 <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
//                   <div className="space-y-1">
//                     <label className="text-xs font-medium text-slate-600">Product category name</label>
//                     <input
//                       required
//                       className={inputClass}
//                       value={item.isCustom ? (item.customCategory || item.category || "") : (item.category || "")}
//                       onChange={(e) => {
//                         const value = e.target.value;
//                         setCompanyForm((f) => ({
//                           ...f,
//                           categoryDiscounts: f.categoryDiscounts.map((row, i) =>
//                             i === index
//                               ? { ...row, category: value, customCategory: value, isCustom: true }
//                               : row
//                           ),
//                         }));
//                       }}
//                       placeholder="Enter category name"
//                     />
//                   </div>
//                   <Field label="Discount (%)">
//                     <input
//                       required
//                       type="number"
//                       min="0"
//                       max="100"
//                       step="0.01"
//                       className={inputClass}
//                       value={item.discountPercentage}
//                       onChange={(e) => updateCompanyDiscount(index, "discountPercentage", e.target.value)}
//                     />
//                   </Field>
//                   <div className="flex items-end">
//                     <button
//                       type="button"
//                       className="rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
//                       onClick={() => setCompanyForm((f) => ({
//                         ...f,
//                         categoryDiscounts: f.categoryDiscounts.filter((_, i) => i !== index),
//                       }))}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {editingCompany && (
//               <Field label="Admin Password (required to approve changes) *">
//                 <input
//                   required
//                   type="password"
//                   autoComplete="current-password"
//                   className={inputClass}
//                   value={adminPassword}
//                   onChange={(e) => setAdminPassword(e.target.value)}
//                   placeholder="Enter your admin login password"
//                 />
//               </Field>
//             )}
//             <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setCompanyModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
//                 {editingCompany ? "Verify & Save" : "Save Company"}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {ledgerModal && (
//         <Modal title="Add Purchase Ledger" onClose={() => setLedgerModal(false)} wide>
//           <form onSubmit={saveLedger} className="space-y-5">
//             <div className="grid gap-4 sm:grid-cols-2">
//               <Field label="Purchase Date *">
//                 <input
//                   required
//                   type="date"
//                   className={inputClass}
//                   value={purchaseDate}
//                   onChange={(e) => setPurchaseDate(e.target.value)}
//                 />
//               </Field>
//               <Field label="Company">
//                 <input
//                   readOnly
//                   className={`${inputClass} bg-slate-50`}
//                   value={selectedCompany?.companyName || ""}
//                 />
//               </Field>
//             </div>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between gap-3">
//                 <h3 className="font-bold text-slate-900">Products</h3>
//                 <button
//                   type="button"
//                   className={buttonSecondary}
//                   onClick={() => setProducts((current) => [...current, emptyProduct()])}
//                 >
//                   <Plus size={16} /> Add Product
//                 </button>
//               </div>
//               {products.map((product, index) => (
//                 <div key={index} className="rounded-xl border border-slate-200 p-3 sm:p-4">
//                   <div className="mb-3 flex items-center justify-between">
//                     <p className="text-sm font-bold text-slate-700">Product {index + 1}</p>
//                     {products.length > 1 && (
//                       <button
//                         type="button"
//                         className="text-xs font-semibold text-rose-600 hover:underline"
//                         onClick={() => setProducts((current) => current.filter((_, i) => i !== index))}
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//                     <Field label="Product Name *">
//                       <input
//                         required
//                         className={inputClass}
//                         value={product.productName}
//                         onChange={(e) => updateProduct(index, "productName", e.target.value)}
//                         placeholder="Medicine / product name"
//                       />
//                     </Field>
//                     <Field label="Product Category *">
//                       <select
//                         required
//                         className={inputClass}
//                         value={product.category || FIXED_PRODUCT_CATEGORIES[0]}
//                         onChange={(e) => updateProduct(index, "category", e.target.value)}
//                       >
//                         {FIXED_PRODUCT_CATEGORIES.map((category) => (
//                           <option key={category} value={category}>{category}</option>
//                         ))}
//                         {selectedCompany?.categoryDiscounts
//                           ?.filter((item) => !FIXED_PRODUCT_CATEGORIES.includes(item.category))
//                           .map((item) => (
//                             <option key={item.category} value={item.category}>{item.category}</option>
//                           ))}
//                       </select>
//                     </Field>
//                     <Field label="Number of Items *">
//                       <input
//                         required
//                         type="number"
//                         min="1"
//                         step="1"
//                         className={inputClass}
//                         value={product.quantity}
//                         onChange={(e) => updateProduct(index, "quantity", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Invoice Number *">
//                       <input
//                         required
//                         className={inputClass}
//                         value={product.invoiceNumber}
//                         onChange={(e) => updateProduct(index, "invoiceNumber", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Batch Number *">
//                       <input
//                       required
//                         className={inputClass}
                        
//                         value={product.batchNumber}
//                         onChange={(e) => updateProduct(index, "batchNumber", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="MRP per Item (₹) *">
//                       <input
//                         required
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         className={inputClass}
//                         value={product.mrp}
//                         onChange={(e) => updateProduct(index, "mrp", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Applied Discount (%)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getCategoryDiscount(product.category).toFixed(2)}
//                       />
//                     </Field>
//                     {/* <Field label="Purchase Rate before GST (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getBasePurchaseRate(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field>
//                     <Field label="GST 5% per Item (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getGSTAmount(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field>
//                     <Field label="Final Purchase Rate incl. GST (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-emerald-50 font-semibold`}
//                         value={getPurchaseRate(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field> */}
//                   </div>
//                   <p className="mt-3 text-right text-sm text-slate-600">
//                     Line total:{" "}
//                     <strong>
//                       {money(Number(product.quantity || 0) * getPurchaseRate(product.companyRate, product.category))}
//                     </strong>
//                   </p>
//                 </div>
//               ))}
//             </div>
//             <Field label="Notes (optional)">
//               <textarea
//                 rows={2}
//                 className={inputClass}
//                 value={ledgerNote}
//                 onChange={(e) => setLedgerNote(e.target.value)}
//                 placeholder="Optional purchase notes"
//               />
//             </Field>
//             <div className="rounded-xl bg-blue-50 p-4">
//               <div className="grid gap-3 sm:grid-cols-3">
//                 <div>
//                   <p className="text-sm text-blue-800">Total purchase before GST</p>
//                   <p className="mt-1 text-xl font-bold text-blue-900">{money(totalPurchaseBeforeGST)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-blue-800">Total GST (5%)</p>
//                   <p className="mt-1 text-xl font-bold text-blue-900">{money(totalGST)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-blue-800">Final purchase total</p>
//                   <p className="mt-1 text-2xl font-bold text-blue-900">{money(purchaseTotal)}</p>
//                 </div>
//               </div>
//               <p className="mt-3 text-xs text-blue-700">
//                 Payments can be added after the ledger is saved.
//               </p>
//             </div>
//             <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setLedgerModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}
//                 Save Ledger
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {paymentModal && paymentLedger && (
//         <Modal title={`Add Payment · ${paymentLedger.ledgerId}`} onClose={() => setPaymentModal(false)}>
//           <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
//             <div>
//               <p className="text-xs text-slate-500">Pending balance</p>
//               <p className="mt-1 font-bold text-rose-700">{money(paymentLedger.pendingAmount)}</p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500">Already paid</p>
//               <p className="mt-1 font-bold text-emerald-700">{money(paymentLedger.paidAmount)}</p>
//             </div>
//           </div>
//           <form onSubmit={savePayment} className="space-y-4">
//             <Field label="Payment Amount (₹) *">
//               <input
//                 required
//                 type="number"
//                 min="0.01"
//                 max={paymentLedger.pendingAmount}
//                 step="0.01"
//                 className={inputClass}
//                 value={paymentForm.amount}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
//               />
//             </Field>
//             <Field label="Payment Date *">
//               <input
//                 required
//                 type="date"
//                 className={inputClass}
//                 value={paymentForm.paymentDate}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))}
//               />
//             </Field>
//             <Field label="Payment Method *">
//               <select
//                 className={inputClass}
//                 value={paymentForm.method}
//                 onChange={(e) => setPaymentForm((f) => ({
//                   ...f,
//                   method: e.target.value,
//                   transactionNumber: e.target.value === "Cash" ? "" : f.transactionNumber,
//                 }))}
//               >
//                 <option value="Cash">Cash</option>
//                 <option value="UPI">UPI</option>
//               </select>
//             </Field>
//             {paymentForm.method === "UPI" && (
//               <Field label="UPI Transaction Number *">
//                 <input
//                   required
//                   className={inputClass}
//                   value={paymentForm.transactionNumber}
//                   onChange={(e) => setPaymentForm((f) => ({ ...f, transactionNumber: e.target.value }))}
//                   placeholder="Enter UPI transaction/reference ID"
//                 />
//               </Field>
//             )}
//             <Field label="Payment Note (optional)">
//               <textarea
//                 rows={2}
//                 className={inputClass}
//                 value={paymentForm.note}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
//               />
//             </Field>
//             <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setPaymentModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CreditCard size={17} />}
//                 Record Payment
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {detailsLedger && (
//         <Modal
//           title={
//   <>
//     Ledger Details ·{" "}
//     <span className="text-teal-600">
//       {new Date(detailsLedger.purchaseDate).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       })}
//     </span>
//   </>
// }
//           onClose={() => setDetailsLedger(null)}
//           wide
//         >
//           <div className="grid gap-3 sm:grid-cols-3">
//             <div className="rounded-xl bg-slate-50 p-3">
//               <p className="text-xs text-slate-500">Purchase total</p>
//               <p className="mt-1 font-bold">{money(detailsLedger.totalAmount)}</p>
//             </div>
//             <div className="rounded-xl bg-emerald-50 p-3">
//               <p className="text-xs text-emerald-700">Total paid</p>
//               <p className="mt-1 font-bold text-emerald-800">{money(detailsLedger.paidAmount)}</p>
//             </div>
//             <div className="rounded-xl bg-rose-50 p-3">
//               <p className="text-xs text-rose-700">Pending balance</p>
//               <p className="mt-1 font-bold text-rose-800">{money(detailsLedger.pendingAmount)}</p>
//             </div>
//           </div>
//           <h3 className="mb-2 mt-5 font-bold text-slate-900">Products</h3>
//           <div className="overflow-x-auto rounded-xl border">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50">
//                 <tr>
//                   <th className="px-3 py-2">Product</th>
//                   <th className="px-3 py-2">Qty</th>
//                   <th className="px-3 py-2">Invoice No.</th>
//                   <th className="px-3 py-2">Batch No.</th>
//                   <th className="px-3 py-2">MRP</th>
//                   {/* <th className="px-3 py-2">Purchase Rate</th> */}
//                   <th className="px-3 py-2">Discount</th>
//                   <th className="px-3 py-2">Total Purchase Rate Before GST</th>
//                   <th className="px-3 py-2">Total GST</th>
//                   {/* <th className="px-3 py-2">Total Purchase Rate After GST</th> */}
//                   <th className="px-3 py-2">Total Price</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {detailsLedger.products.map((product, index) => (
//                   <tr key={product._id || index}>
//                     <td className="px-3 py-3">{product.productName}</td>
//                     <td className="px-3 py-3">{product.quantity}</td>
//                     <td className="px-3 py-3">{product.invoiceNumber || "—"}</td>
//                     <td className="px-3 py-3">{product.batchNumber || "—"}</td>
//                     <td className="px-3 py-3">{money(product.mrp)}</td>
//                     {/* <td className="px-3 py-3">{money(product.companyRate)}</td> */}
//                     <td className="px-3 py-3">{Number(product.discountPercentage || 0)}%</td>
//                     <td className="px-3 py-3">{money(Number(product.basePurchaseRate ?? product.purchaseRate)*Number(product.quantity))}</td>
//                     <td className="px-3 py-3">{money(Number(product.gstAmount)*Number(product.quantity) || 0)}</td>
//                     {/* <td className="px-3 py-3">{money(product.purchaseRate)}</td> */}
//                     <td className="px-3 py-3 font-semibold">
//                       {money(Number(product.quantity) * Number(product.purchaseRate))}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="mt-5 flex items-center justify-between gap-3">
//             <h3 className="font-bold text-slate-900">Payment History</h3>
//             {detailsLedger.pendingAmount > 0.009 && (
//               <button
//                 className={buttonPrimary}
//                 onClick={() => {
//                   const current = detailsLedger;
//                   setDetailsLedger(null);
//                   openPayment(current);
//                 }}
//               >
//                 <Plus size={16} /> Add Payment
//               </button>
//             )}
//           </div>
//           {(detailsLedger.payments || []).length === 0 ? (
//             <p className="mt-3 rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
//               No payments recorded yet.
//             </p>
//           ) : (
//             <div className="mt-3 space-y-2">
//               {detailsLedger.payments.map((payment, index) => (
//                 <div
//                   key={payment._id || index}
//                   className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
//                 >
//                   <div>
//                     <p className="font-semibold text-slate-900">
//                       {money(payment.amount)} · {payment.method}
//                     </p>
//                     <p className="mt-1 text-xs text-slate-500">
//                       {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
//                     </p>
//                     {payment.transactionNumber && (
//                       <p className="mt-1 text-xs text-slate-600">
//                         Transaction: {payment.transactionNumber}
//                       </p>
//                     )}
//                     {payment.note && (
//                       <p className="mt-1 text-xs text-slate-500">{payment.note}</p>
//                     )}
//                   </div>
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className="text-xs font-semibold text-emerald-700">
//                       <CheckCircle2 className="mr-1 inline" size={15} />
//                       Recorded
//                     </span>
//                     <button
//                       type="button"
//                       className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-100"
//                       onClick={() => sharePaymentOnWhatsApp(selectedCompany, detailsLedger, payment)}
//                       title="Open this MR's WhatsApp chat with the payment message"
//                     >
//                       <MessageCircle size={15} /> Share on WhatsApp
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//           {detailsLedger.note && (
//             <p className="mt-4 text-sm text-slate-500">
//               Note: {detailsLedger.note}
//             </p>
//           )}
//         </Modal>
//       )}
//     </div>
//   );
// }





// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import {
//   ArrowLeft,
//   Building2,
//   CalendarDays,
//   CheckCircle2,
//   ChevronRight,
//   CreditCard,
//   FileText,
//   Filter,
//   LoaderCircle,
//   LockKeyhole,
//   MessageCircle,
//   Plus,
//   RefreshCw,
//   Search,
//   Wallet,
//   X,
// } from "lucide-react";
// const API = "https://dms-backend-amber.vercel.app/api/company-ledger";
// const money = (value) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(Number(value || 0));
// const normalizeLedgerSearch = (value) =>
//   String(value ?? "")
//     .toLowerCase()
//     .replace(/[₹,\s]/g, "")
//     .trim();

// const today = () => new Date().toISOString().slice(0, 10);

// // Opens the selected MR's WhatsApp chat with a prefilled payment acknowledgement.
// // WhatsApp will still require the user to press Send; no WhatsApp API is used.
// const sharePaymentOnWhatsApp = (company, ledger, payment) => {
//   const rawMobile = String(company?.mrMobile || "").replace(/\D/g, "");
//   let phone = rawMobile;

//   // Assume Indian mobile numbers when the company record contains a 10-digit number.
//   if (phone.length === 10) phone = `91${phone}`;
//   else if (phone.length === 11 && phone.startsWith("0")) phone = `91${phone.slice(1)}`;

//   if (!phone || phone.length < 10) {
//     window.alert("MR mobile number is missing or invalid. Please update company details first.");
//     return;
//   }

//   const date = payment?.paymentDate
//     ? new Date(payment.paymentDate).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       })
//     : "—";
//   const amount = new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(Number(payment?.amount || 0));

//   const message = [
//     "*DHRUWRAJ HEALTHCARE — PAYMENT RECEIPT*",
//     `Company: ${company?.companyName || "—"}`,
//     `MR: ${company?.mrName || "—"}`,
//     `Ledger ID: ${ledger?.ledgerId || "—"}`,
//     `Receipt date: ${date}`,
//     `Amount: ${amount}`,
//     `Payment mode: ${payment?.method || "—"}`,
//     payment?.transactionNumber ? `UPI Transaction No.: ${payment.transactionNumber}` : "",
//     "",
//     `Please confirm in this chat: Received ${amount} via ${payment?.method || "payment"}.`,
//   ].filter(Boolean).join("\n");

//   const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
//   window.open(whatsappUrl, "_blank", "noopener,noreferrer");
// };

// const escapeHtml = (value) =>
//   String(value ?? "")
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");

// const printPaymentReceipt = ({ company, ledger, payment }) => {
//   const receiptDate = payment?.paymentDate
//     ? new Date(payment.paymentDate).toLocaleDateString("en-IN", {
//         day: "2-digit", month: "short", year: "numeric",
//       })
//     : "—";
//   const safe = (value) => escapeHtml(value || "—");
//   const amount = money(payment?.amount);
//   const receiptNumber = payment?.receiptNumber || "Receipt number pending";
//   const popup = window.open("", "_blank", "width=800,height=900");
//   if (!popup) {
//     window.alert("Receipt window was blocked. Please allow pop-ups and try again.");
//     return;
//   }

//   popup.document.open();
//   popup.document.write(`<!doctype html>
// <html>
// <head>
// <meta charset="utf-8" />
// <meta name="viewport" content="width=device-width, initial-scale=1" />
// <title>Payment Receipt ${safe(receiptNumber)}</title>
// <style>
//   *{box-sizing:border-box} body{font-family:Arial,sans-serif;color:#111827;margin:0;padding:24px}
//   .receipt{max-width:720px;margin:0 auto;border:1.5px solid #111827;padding:28px}
//   .top{text-align:center;border-bottom:2px solid #111827;padding-bottom:16px}
//   h1{font-size:22px;margin:0 0 6px;letter-spacing:.5px} .subtitle{font-size:12px;color:#4b5563}
//   .receipt-title{text-align:center;font-size:18px;font-weight:bold;margin:20px 0}
//   .meta{display:flex;justify-content:space-between;gap:16px;margin-bottom:18px;font-size:13px}
//   table{width:100%;border-collapse:collapse;margin:12px 0 20px} td{padding:10px 8px;border-bottom:1px solid #d1d5db;font-size:14px}
//   td:first-child{color:#4b5563;width:38%} .amount{font-size:20px;font-weight:bold}
//   .notice{font-size:12px;color:#4b5563;margin-top:18px}
//   .signatures{display:flex;gap:36px;margin-top:70px}.sign{width:50%;border-top:1px solid #111827;padding-top:8px;text-align:center;font-size:12px}
//   .footer{margin-top:24px;text-align:center;font-size:10px;color:#6b7280}
//   @media print{body{padding:0}.receipt{border:1.5px solid #111827;max-width:none;padding:22px}}
// </style>
// </head>
// <body>
// <div class="receipt">
//   <div class="top"><h1>DHRUWRAJ HEALTHCARE</h1><div class="subtitle">PAYMENT ACKNOWLEDGEMENT</div></div>
//   <div class="receipt-title">PAYMENT RECEIPT</div>
//   <div class="meta"><span><strong>Receipt No:</strong> ${safe(receiptNumber)}</span><span><strong>Date:</strong> ${safe(receiptDate)}</span></div>
//   <table>
//     <tr><td>Company Name</td><td><strong>${safe(company?.companyName)}</strong></td></tr>
//     <tr><td>Medical Representative (MR)</td><td>${safe(company?.mrName)}</td></tr>
//     <tr><td>MR Mobile</td><td>${safe(company?.mrMobile)}</td></tr>
//     <tr><td>Ledger ID</td><td>${safe(ledger?.ledgerId)}</td></tr>
//     <tr><td>Amount Received</td><td class="amount">${safe(amount)}</td></tr>
//     <tr><td>Payment Mode</td><td><strong>${safe(payment?.method)}</strong></td></tr>
//     ${payment?.method === "UPI" ? `<tr><td>UPI Transaction No.</td><td>${safe(payment?.transactionNumber)}</td></tr>` : ""}
//     ${payment?.note ? `<tr><td>Note</td><td>${safe(payment.note)}</td></tr>` : ""}
//   </table>
//   <p>I acknowledge that the amount stated above has been received by DHRUWRAJ HEALTHCARE.</p>
//   <div class="signatures">
//     <div class="sign">MR Signature / Name</div>
//     <div class="sign">Received By (DHRUWRAJ HEALTHCARE)</div>
//   </div>
//   <div class="notice">Please sign this receipt at the time of payment. Keep this signed copy for monthly account reconciliation.</div>
//   <div class="footer">Computer-generated receipt · Physical signature confirms acknowledgement</div>
// </div>
// <script>window.onload = () => { window.focus(); };</script>
// </body></html>`);
//   popup.document.close();
//   popup.focus();
//   popup.print();
// };
// const FIXED_PRODUCT_CATEGORIES = [
//   "General",
// ];

// const emptyCompany = {
//   companyName: "",
//   mrName: "",
//   mrMobile: "",
//   gstNumber: "",
//   discountPercentage: "0",
//   categoryDiscounts: [],
// };
// const emptyProduct = () => ({
//   productName: "",
//   category: FIXED_PRODUCT_CATEGORIES[0],
//   quantity: "1",
//   invoiceNumber: "",
//   batchNumber: "",
//   mrp: "",
//   companyRate: "",
//   purchaseRate: "",
// });
// const inputClass =
//   "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 ";
// const buttonPrimary =
//   "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2.5 px-4 text-sm font-bold hover:scale-[1.02] transition cursor-pointer";
// const buttonSecondary =
//   "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";
// function Modal({ title, onClose, children, wide = false }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5">
//       <div
//         className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
//           wide ? "max-w-5xl" : "max-w-xl"
//         }`}
//       >
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
//           <h2 className="text-lg font-bold text-slate-900">{title}</h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
//             aria-label="Close"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <div className="p-5">{children}</div>
//       </div>
//     </div>
//   );
// }
// function Field({ label, children }) {
//   return (
//     <label className="block min-w-0 space-y-1.5">
//       <span className="text-sm font-medium text-slate-700">{label}</span>
//       {children}
//     </label>
//   );
// }
// function SummaryCard({ label, value, icon: Icon }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4">
//       <div className="flex items-center justify-between gap-3">
//         <span className="text-sm text-slate-500">{label}</span>
//         <Icon size={19} className="text-teal-600" />
//       </div>
//       <p className="mt-2 break-words text-xl font-bold text-slate-900">
//         {value}
//       </p>
//     </div>
//   );
// }
// export default function CompanyLedger() {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompanyId, setSelectedCompanyId] = useState("");
//   const [ledgers, setLedgers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [dismissedReminderIds, setDismissedReminderIds] = useState([]);
//   const [search, setSearch] = useState("");
//   const [ledgerSearch, setLedgerSearch] = useState("");
//   const [companyModal, setCompanyModal] = useState(false);
//   const [editingCompany, setEditingCompany] = useState(null);
//   const [companyForm, setCompanyForm] = useState(emptyCompany);
//   const [adminPassword, setAdminPassword] = useState("");
//   const [ledgerModal, setLedgerModal] = useState(false);
//   const [purchaseDate, setPurchaseDate] = useState(today());
//   const [products, setProducts] = useState([emptyProduct()]);
//   const [ledgerNote, setLedgerNote] = useState("");
//   const [paymentModal, setPaymentModal] = useState(false);
//   const [paymentLedger, setPaymentLedger] = useState(null);
//   const [paymentForm, setPaymentForm] = useState({
//     amount: "",
//     paymentDate: today(),
//     method: "Cash",
//     transactionNumber: "",
//     note: "",
//   });
//   const [detailsLedger, setDetailsLedger] = useState(null);
//   const [receiptData, setReceiptData] = useState(null);
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     from: "",
//     to: "",
//     status: "All",
//     batchNumber: "",
//   });
//   const token = localStorage.getItem("token");
//   const headers = useMemo(
//     () => ({ Authorization: `Bearer ${token}` }),
//     [token]
//   );
//   const request = useCallback(
//     async (method, url, data) => {
//       const response = await axios({
//         method,
//         url,
//         data,
//         headers,
//       });
//       return response.data;
//     },
//     [headers]
//   );
//   const loadCompanies = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const data = await request("get", API);
//       const list = Array.isArray(data) ? data : [];
//       setCompanies(list);
//       if (
//         selectedCompanyId &&
//         !list.some((company) => company._id === selectedCompanyId)
//       ) {
//         setSelectedCompanyId("");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Unable to load companies. Please check your login."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [request, selectedCompanyId]);
//   const loadLedgers = useCallback(async () => {
//     if (!selectedCompanyId) {
//       setLedgers([]);
//       return;
//     }
//     setError("");
//     try {
//       const params = {};
//       if (filters.from) params.from = filters.from;
//       if (filters.to) params.to = filters.to;
//       if (filters.status !== "All") params.status = filters.status;
//       if (filters.batchNumber.trim()) {
//         params.batchNumber = filters.batchNumber.trim();
//       }
//       const response = await axios.get(
//         `${API}/companies/${selectedCompanyId}/ledgers`,
//         { headers, params }
//       );
//       setLedgers(Array.isArray(response.data) ? response.data : []);
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to load purchase ledgers."
//       );
//     }
//   }, [selectedCompanyId, filters, headers]);
//   useEffect(() => {
//     loadCompanies();
//   }, [loadCompanies]);
//   useEffect(() => {
//     loadLedgers();
//   }, [loadLedgers]);

//   const selectedCompany = companies.find(
//     (company) => company._id === selectedCompanyId
//   );

//   const visibleLedgers = useMemo(() => {
//     const query = normalizeLedgerSearch(ledgerSearch);

//     if (!query) return ledgers;

//     return ledgers.filter((ledger) => {
//       const purchaseDate = new Date(ledger.purchaseDate);
//       const dateValues = Number.isNaN(purchaseDate.getTime())
//         ? []
//         : [
//             purchaseDate.toLocaleDateString("en-IN"),
//             purchaseDate.toISOString().slice(0, 10),
//             purchaseDate.toLocaleDateString("en-US"),
//           ];

//       const productValues = (ledger.products || []).flatMap((product) => {
//         const quantity = Number(product.quantity || 0);
//         const mrp = Number(product.mrp || 0);
//         const companyRate = Number(product.companyRate || 0);
//         const basePurchaseRate = Number(product.basePurchaseRate || 0);
//         const purchaseRate = Number(product.purchaseRate || 0);
//         const gstAmount = Number(product.gstAmount || 0);

//         return [
//           product.productName,
//           product.category,
//           product.invoiceNumber,
//           product.batchNumber,
//           product.quantity,
//           product.mrp,
//           money(mrp),
//           product.companyRate,
//           money(companyRate),
//           product.basePurchaseRate,
//           money(basePurchaseRate),
//           product.purchaseRate,
//           money(purchaseRate),
//           product.gstAmount,
//           money(gstAmount),
//           quantity * mrp,
//           money(quantity * mrp),
//           quantity * companyRate,
//           money(quantity * companyRate),
//           quantity * basePurchaseRate,
//           money(quantity * basePurchaseRate),
//           quantity * purchaseRate,
//           money(quantity * purchaseRate),
//           quantity * gstAmount,
//           money(quantity * gstAmount),
//         ];
//       });

//       const paymentValues = (ledger.payments || []).flatMap((payment) => [
//         payment.amount,
//         money(payment.amount),
//         payment.method,
//         payment.transactionNumber,
//         payment.note,
//         payment.paymentDate,
//       ]);

//       const searchableValues = [
//         ledger.ledgerId,
//         ledger.paymentStatus,
//         ledger.note,
//         ledger.totalAmount,
//         money(ledger.totalAmount),
//         ledger.paidAmount,
//         money(ledger.paidAmount),
//         ledger.pendingAmount,
//         money(ledger.pendingAmount),
//         ...dateValues,
//         ...productValues,
//         ...paymentValues,
//       ];

//       return searchableValues.some((value) =>
//         normalizeLedgerSearch(value).includes(query)
//       );
//     });
//   }, [ledgers, ledgerSearch]);

//   const visibleCompanies = companies.filter((company) =>
//     [
//       company.companyName,
//       company.mrName,
//       company.mrMobile,
//     ].some((value) =>
//       String(value || "").toLowerCase().includes(search.toLowerCase())
//     )
//   );
//   const summary = useMemo(
//     () =>
//       ledgers.reduce(
//         (acc, ledger) => {
//           acc.purchase += Number(ledger.totalAmount || 0);
//           acc.paid += Number(ledger.paidAmount || 0);
//           acc.pending += Number(ledger.pendingAmount || 0);
//           return acc;
//         },
//         { purchase: 0, paid: 0, pending: 0 }
//       ),
//     [ledgers]
//   );
//   const openAddCompany = () => {
//     setEditingCompany(null);
//     setCompanyForm(emptyCompany);
//     setAdminPassword("");
//     setError("");
//     setCompanyModal(true);
//   };
//   const openEditCompany = () => {
//     if (!selectedCompany) return;
//     setEditingCompany(selectedCompany);
//     setCompanyForm({
//       companyName: selectedCompany.companyName || "",
//       mrName: selectedCompany.mrName || "",
//       mrMobile: selectedCompany.mrMobile || "",
//       gstNumber: selectedCompany.gstNumber || "",
//       discountPercentage: String(selectedCompany.discountPercentage ?? 0),
//       categoryDiscounts: (selectedCompany.categoryDiscounts || []).map((item) => ({
//         category: item.category || "",
//         discountPercentage: String(item.discountPercentage ?? 0),
//         isCustom: !FIXED_PRODUCT_CATEGORIES.includes(item.category),
//         customCategory: !FIXED_PRODUCT_CATEGORIES.includes(item.category) ? item.category : "",
//       })),
//     });
//     setAdminPassword("");
//     setError("");
//     setCompanyModal(true);
//   };
//   const saveCompany = async (event) => {
//     event.preventDefault();
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       const payload = {
//         ...companyForm,
//         gstNumber: String(companyForm.gstNumber || "").trim().toUpperCase(),
//         discountPercentage: Number(companyForm.discountPercentage || 0),
//         categoryDiscounts: (companyForm.categoryDiscounts || []).map((item) => ({
//           category: String(item.isCustom ? item.customCategory : item.category).trim(),
//           discountPercentage: Number(item.discountPercentage || 0),
//         })),
//       };
//       let saved;
//       if (editingCompany) {
//         payload.adminPassword = adminPassword;
//         saved = await request(
//           "put",
//           `${API}/companies/${editingCompany._id}`,
//           payload
//         );
//       } else {
//         saved = await request("post", `${API}/companies`, payload);
//       }
//       setCompanyModal(false);
//       setNotice(
//         editingCompany
//           ? "Company details updated successfully."
//           : "Company added successfully."
//       );
//       await loadCompanies();
//       if (!editingCompany && saved?._id) {
//         setSelectedCompanyId(saved._id);
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to save company."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const getCategoryDiscount = (category) => {
//     const configured = selectedCompany?.categoryDiscounts?.find(
//       (item) => String(item.category || "").trim().toLowerCase() === String(category || "").trim().toLowerCase()
//     );
//     if (configured) return Number(configured.discountPercentage || 0);
//     return Number(selectedCompany?.discountPercentage || 0);
//   };

//   const getBasePurchaseRate = (companyRate, category) => {
//     const rate = Number(companyRate || 0);
//     return Number((rate * (1 - getCategoryDiscount(category) / 100)).toFixed(2));
//   };

//   const getGSTAmount = (companyRate, category) =>
//     Number((getBasePurchaseRate(companyRate, category) * 0.05).toFixed(2));

//   // Final per-item purchase rate includes the fixed 5% GST.
//   const getPurchaseRate = (companyRate, category) =>
//     Number((getBasePurchaseRate(companyRate, category) + getGSTAmount(companyRate, category)).toFixed(2));

//   const overdueReminders = companies.flatMap((company) =>
//     (company.ledgers || [])
//       .filter((ledger) => {
//         const pending = Number(ledger.pendingAmount || 0);
//         const purchaseDateMs = new Date(ledger.purchaseDate).getTime();
//         const ageDays = (Date.now() - purchaseDateMs) / (1000 * 60 * 60 * 24);
//         return pending > 0.009 && Number.isFinite(purchaseDateMs) && ageDays >= 30;
//       })
//       .map((ledger) => ({ ...ledger, reminderCompanyName: company.companyName }))
//   );

//   const updateCompanyDiscount = (index, field, value) => {
//     setCompanyForm((current) => ({
//       ...current,
//       categoryDiscounts: current.categoryDiscounts.map((item, i) => {
//         if (i !== index) return item;
//         if (field === "category") {
//           return {
//             ...item,
//             category: value,
//             isCustom: value === "__custom__",
//             customCategory: value === "__custom__" ? item.customCategory || "" : "",
//           };
//         }
//         return { ...item, [field]: value };
//       }),
//     }));
//   };

//   // const updateProduct = (index, field, value) => {
//   //   setProducts((current) =>
//   //     current.map((product, i) =>
//   //       i === index ? { ...product, [field]: value } : product
//   //     )
//   //   );
//   // };
//   const updateProduct = (index, field, value) => {
//   setProducts((current) =>
//     current.map((product, i) => {
//       if (i !== index) return product;

//       // Update the targeted field
//       const updatedProduct = { ...product, [field]: value };

//       // If the user is changing the MRP, automatically calculate companyRate
//       if (field === "mrp") {
//         updatedProduct.companyRate = value ? (Number(value) / 1.05).toFixed(2) : "";
//       }

//       return updatedProduct;
//     })
//   );
// };
//   const totalPurchaseBeforeGST = products.reduce(
//     (sum, product) => sum + Number(product.quantity || 0) * getBasePurchaseRate(product.companyRate, product.category),
//     0
//   );
//   const totalGST = products.reduce(
//     (sum, product) => sum + Number(product.quantity || 0) * getGSTAmount(product.companyRate, product.category),
//     0
//   );
//   const purchaseTotal = Number((totalPurchaseBeforeGST + totalGST).toFixed(2));
//   const saveLedger = async (event) => {
//     event.preventDefault();
//     if (!selectedCompanyId) return;
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       const payload = {
//         purchaseDate,
//         products: products.map((product) => ({
//           ...product,
//           quantity: Number(product.quantity),
//           mrp: Number(product.mrp),
//           companyRate: Number(product.companyRate),
//           basePurchaseRate: getBasePurchaseRate(product.companyRate, product.category),
//           gstPercentage: 5,
//           gstAmount: getGSTAmount(product.companyRate, product.category),
//           purchaseRate: getPurchaseRate(product.companyRate, product.category),
//           discountPercentage: getCategoryDiscount(product.category),
//         })),
//         note: ledgerNote,
//       };
//       await request(
//         "post",
//         `${API}/companies/${selectedCompanyId}/ledgers`,
//         payload
//       );
//       setLedgerModal(false);
//       setProducts([emptyProduct()]);
//       setPurchaseDate(today());
//       setLedgerNote("");
//       setNotice("Purchase ledger created successfully.");
//       await loadLedgers();
//       await loadCompanies();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to create ledger."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const openPayment = (ledger) => {
//     setPaymentLedger(ledger);
//     setPaymentForm({
//       amount: String(ledger.pendingAmount || ""),
//       paymentDate: today(),
//       method: "Cash",
//       transactionNumber: "",
//       note: "",
//     });
//     setError("");
//     setPaymentModal(true);
//   };
//   const savePayment = async (event) => {
//     event.preventDefault();
//     if (!paymentLedger || !selectedCompanyId) return;
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       const saved = await request(
//         "post",
//         `${API}/companies/${selectedCompanyId}/ledgers/${paymentLedger._id}/payments`,
//         {
//           ...paymentForm,
//           amount: Number(paymentForm.amount),
//         }
//       );
//       setPaymentModal(false);
//       setNotice("Payment recorded successfully. Print the receipt and get the MR's signature.");
//       if (saved?.createdPayment) {
//         setReceiptData({
//           company: selectedCompany,
//           ledger: saved,
//           payment: saved.createdPayment,
//         });
//       }
//       await loadLedgers();
//       await loadCompanies();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to record payment."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//   const resetFilters = () => {
//     setFilters({
//       from: "",
//       to: "",
//       status: "All",
//       batchNumber: "",
//     });
//   };
//   const companyLedgerCount = selectedCompany?.ledgers?.length || 0;
//   return (
//     <div className="min-h-screen w-full">
//       {overdueReminders.filter((ledger) => !dismissedReminderIds.includes(ledger._id)).length > 0 && (
//         <div className="fixed right-4 top-4 z-[80] w-[min(92vw,380px)] space-y-2">
//           {overdueReminders
//             .filter((ledger) => !dismissedReminderIds.includes(ledger._id))
//             .map((ledger) => (
//               <div key={ledger._id} className="rounded-xl border border-amber-300 bg-white p-4 shadow-xl">
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex items-start gap-2">
//                     <CalendarDays className="mt-0.5 shrink-0 text-amber-600" size={19} />
//                     <div>
//                       <p className="font-bold text-slate-900">Payment overdue for 30+ days</p>
//                       <p className="mt-1 text-sm text-slate-600">
//                         {ledger.ledgerId} · {ledger.reminderCompanyName || "Company"}
//                       </p>
//                       <p className="mt-1 text-sm text-rose-700">
//                         Pending: <strong>{money(ledger.pendingAmount)}</strong>
//                       </p>
//                       <button
//                         className="mt-2 text-sm font-semibold text-teal-700 hover:underline"
//                         onClick={() => setDetailsLedger(ledger)}
//                       >
//                         View ledger details
//                       </button>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
//                     aria-label="Dismiss reminder"
//                     onClick={() => setDismissedReminderIds((ids) => [...ids, ledger._id])}
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               </div>
//             ))}
//         </div>
//       )}
//       <div className="mx-auto max-w-7xl space-y-5">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-xl font-semibold text-slate-800">
//               Company Ledger
//             </h1>
//             <p className="text-sm text-slate-400">
//               Manage supplier purchases, payment history and outstanding balances.
//             </p>
//           </div>
//           <button className={buttonPrimary} onClick={openAddCompany}>
//             <Plus size={18} /> Add Company
//           </button>
//         </div>
//         {error && (
//           <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//             <span>{error}</span>
//             <button onClick={() => setError("")} aria-label="Dismiss error">
//               <X size={17} />
//             </button>
//           </div>
//         )}
//         {notice && (
//           <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
//             <span>{notice}</span>
//             <button onClick={() => setNotice("")} aria-label="Dismiss message">
//               <X size={17} />
//             </button>
//           </div>
//         )}
//         {!selectedCompanyId ? (
//           <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
//             <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-slate-900">
//                   Your Companies
//                 </h2>
//                 <p className="text-sm text-slate-500">
//                   Select a company to view its purchase ledgers.
//                 </p>
//               </div>
//               <div className="relative w-full sm:max-w-xs">
//                 <Search
//                   size={18}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                 />
//                 <input
//                   className={`${inputClass} pl-10`}
//                   placeholder="Search companies..."
//                   value={search}
//                   onChange={(event) => setSearch(event.target.value)}
//                 />
//               </div>
//             </div>
//             {loading ? (
//               <div className="flex justify-center py-12">
//                 <LoaderCircle className="animate-spin text-teal-600" />
//               </div>
//             ) : visibleCompanies.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
//                 <Building2 className="mx-auto text-slate-400" size={36} />
//                 <p className="mt-3 font-semibold text-slate-700">
//                   No companies found
//                 </p>
//                 <p className="mt-1 text-sm text-slate-500">
//                   Add your first company to start recording purchases.
//                 </p>
//               </div>
//             ) : (
//               <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
//                 {visibleCompanies.map((company) => (
//                   <button
//                     key={company._id}
//                     onClick={() => setSelectedCompanyId(company._id)}
//                     className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40"
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex min-w-0 items-center gap-3">
//                         <div className="rounded-xl bg-blue-50 p-3 text-teal-600">
//                           <Building2 size={22} />
//                         </div>
//                         <div className="min-w-0">
//                           <h3 className="truncate font-bold text-slate-900">
//                             {company.companyName}
//                           </h3>
//                           <p className="mt-1 text-sm text-slate-500">
//                             MR : {company.mrName}
//                           </p>
//                         </div>
//                       </div>
//                       <ChevronRight size={19} className="shrink-0 text-slate-400" />
//                     </div>
//                     <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
//                       <span className="text-slate-500">
//                         Contact : {company.mrMobile}
//                       </span>
//                       {/* <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
//                         {company.discountPercentage || 0}% discount
//                       </span> */}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </section>
//         ) : (
//           <>
//             <button
//               className={buttonSecondary}
//               onClick={() => setSelectedCompanyId("")}
//             >
//               <ArrowLeft size={17} /> All Companies
//             </button>
//             <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
//               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-start gap-3">
//                   <div className="rounded-xl bg-blue-50 p-3 text-teal-600">
//                     <Building2 size={25} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-slate-900">
//                       {selectedCompany?.companyName}
//                     </h2>
//                     <p className="mt-1 text-sm text-slate-500">
//                       MR: {selectedCompany?.mrName} · {selectedCompany?.mrMobile}
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Company discount: {selectedCompany?.discountPercentage || 0}%
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   <button className={buttonSecondary} onClick={openEditCompany}>
//                     <LockKeyhole size={17} /> Edit Details
//                   </button>
//                   <button
//                     className={buttonSecondary}
//                     onClick={() => setFiltersOpen((open) => !open)}
//                   >
//                     <Filter size={17} /> Filters
//                   </button>
//                   <button
//                     className={buttonPrimary}
//                     onClick={() => {
//                       setProducts([emptyProduct()]);
//                       setPurchaseDate(today());
//                       setLedgerNote("");
//                       setError("");
//                       setLedgerModal(true);
//                     }}
//                   >
//                     <Plus size={18} /> Add Ledger
//                   </button>
//                 </div>
//               </div>
//             </section>
//             {filtersOpen && (
//               <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
//                 <Field label="Purchase date from">
//                   <input
//                     type="date"
//                     className={inputClass}
//                     value={filters.from}
//                     max={filters.to || undefined}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, from: e.target.value }))
//                     }
//                   />
//                 </Field>
//                 <Field label="Purchase date to">
//                   <input
//                     type="date"
//                     className={inputClass}
//                     value={filters.to}
//                     min={filters.from || undefined}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, to: e.target.value }))
//                     }
//                   />
//                 </Field>
//                 <Field label="Payment status">
//                   <select
//                     className={inputClass}
//                     value={filters.status}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, status: e.target.value }))
//                     }
//                   >
//                     <option>All</option>
//                     <option>Pending</option>
//                     <option>Paid</option>
//                   </select>
//                 </Field>
//                 {/* <Field label="Batch number">
//                   <input
//                     className={inputClass}
//                     placeholder="Search batch..."
//                     value={filters.batchNumber}
//                     onChange={(e) =>
//                       setFilters((f) => ({
//                         ...f,
//                         batchNumber: e.target.value,
//                       }))
//                     }
//                   />
//                 </Field> */}
//                 <div className="flex items-end">
//                   <button
//                     className={`${buttonSecondary} w-full cursor-pointer`}
//                     onClick={resetFilters}
//                   >
//                     <RefreshCw size={17} />Reset filters
//                   </button>
//                 </div>
//               </section>
//             )}
//             <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
//               <SummaryCard
//                 label="Purchase Total"
//                 value={money(summary.purchase)}
//                 icon={FileText}
//               />
//               <SummaryCard
//                 label="Total Paid"
//                 value={money(summary.paid)}
//                 icon={CheckCircle2}
//               />
//               <SummaryCard
//                 label="Pending Balance"
//                 value={money(summary.pending)}
//                 icon={Wallet}
//               />
//             </section>
//             <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
//               <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <h2 className="font-bold text-slate-900">Purchase Ledgers</h2>
//                   <span className="text-sm text-slate-500">
//                     {visibleLedgers.length} of {ledgers.length} ledger(s)
//                   </span>
//                 </div>
//                 <div className="relative w-full sm:max-w-md">
//                   <Search
//                     size={17}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                   <input
//                     type="text"
//                     className={`${inputClass} appearance-none pr-10 pl-10`}
//                     placeholder="Search product, invoice, batch, price, date, status..."
//                     value={ledgerSearch}
//                     onChange={(event) => setLedgerSearch(event.target.value)}
//                     aria-label="Search purchase ledgers"
//                   />
//                   {ledgerSearch && (
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2  hover:cursor-pointer hover:text-teal-600"
//                       onClick={() => setLedgerSearch("")}
//                       aria-label="Clear ledger search"
//                     >
//                       <X size={16} />
//                     </button>
//                   )}
//                 </div>
//               </div>
//               {visibleLedgers.length === 0 ? (
//                 <div className="py-12 text-center">
//                   <FileText className="mx-auto text-slate-400" size={34} />
//                   <p className="mt-3 font-semibold text-slate-700">
//                     No matching purchase ledgers
//                   </p>
//                   <p className="mt-1 text-sm text-slate-500">
//                     Try another product name, invoice number, batch number, amount, date, or payment status.
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="hidden overflow-x-auto md:block">
//                     <table className="w-full text-left text-sm">
//                       <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                         <tr>
//                           <th className="px-4 py-3">Date</th>
//                           <th className="px-4 py-3">Products</th>
//                           <th className="px-4 py-3">Invoice & Batch No.</th>
//                           <th className="px-4 py-3">Purchase total</th>
//                           <th className="px-4 py-3">Paid</th>
//                           <th className="px-4 py-3">Pending</th>
//                           <th className="px-4 py-3">Status</th>
//                           <th className="px-4 py-3">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-100">
//                         {visibleLedgers.map((ledger) => (
//                           <tr key={ledger._id} className="align-top hover:bg-slate-50">
//                             <td className="px-4 py-4">
//                               {/* <p className="font-bold text-blue-700">{ledger.ledgerId}</p> */}
//                               <p className="font-bold text-teal-700">
//                                 {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
//                               </p>
//                             </td>
//                             <td className="max-w-56 px-4 py-4">
//                               {ledger.products.map((product, index) => (
//                                 <p key={product._id || index} className="mb-1">
//                                   {product.productName}{" "}
//                                   <span className="text-slate-500">
//                                     × {product.quantity}
//                                   </span>
//                                 </p>
//                               ))}
//                             </td>
//                             <td className="max-w-48 px-4 py-4">
//                               {ledger.products.map((product, index) => (
//                                 <p key={product._id || index} className="mb-1 text-xs text-slate-600">
//                                   Inv: {product.invoiceNumber || "—"} · Batch: {product.batchNumber || "—"}
//                                 </p>
//                               ))}
//                             </td>
//                             <td className="px-4 py-4 font-semibold">{money(ledger.totalAmount)}</td>
//                             <td className="px-4 py-4 text-emerald-700">{money(ledger.paidAmount)}</td>
//                             <td className="px-4 py-4 font-semibold text-rose-700">{money(ledger.pendingAmount)}</td>
//                             <td className="px-4 py-4">
//                               <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
//                                 ledger.paymentStatus === "Paid"
//                                   ? "bg-emerald-50 text-emerald-700"
//                                   : "bg-amber-50 text-amber-700"
//                               }`}>
//                                 {ledger.paymentStatus}
//                               </span>
//                             </td>
//                             <td className="px-4 py-4">
//                               <div className="flex flex-col items-start gap-2">
//                                 <button
//                                   className="text-xs font-semibold text-blue-700 hover:underline"
//                                   onClick={() => setDetailsLedger(ledger)}
//                                 >
//                                   View details
//                                 </button>
//                                 {ledger.pendingAmount > 0.009 && (
//                                   <button
//                                     className="text-xs font-semibold text-emerald-700 hover:underline"
//                                     onClick={() => openPayment(ledger)}
//                                   >
//                                     Add payment
//                                   </button>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                   <div className="space-y-3 p-3 md:hidden">
//                     {visibleLedgers.map((ledger) => (
//                       <div key={ledger._id} className="rounded-xl border border-slate-200 p-4">
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <p className="font-bold text-blue-700">{ledger.ledgerId}</p>
//                             <p className="mt-1 text-xs text-slate-500">
//                               {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
//                             </p>
//                           </div>
//                           <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
//                             ledger.paymentStatus === "Paid"
//                               ? "bg-emerald-50 text-emerald-700"
//                               : "bg-amber-50 text-amber-700"
//                           }`}>
//                             {ledger.paymentStatus}
//                           </span>
//                         </div>
//                         <div className="mt-3 space-y-1 text-sm">
//                           {ledger.products.map((product, index) => (
//                             <p key={product._id || index} className="text-slate-700">
//                               {product.productName} × {product.quantity}
//                             </p>
//                           ))}
//                         </div>
//                         <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
//                           <div>
//                             <p className="text-xs text-slate-500">Purchase total</p>
//                             <p className="mt-1 font-bold">{money(ledger.totalAmount)}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-slate-500">Pending</p>
//                             <p className="mt-1 font-bold text-rose-700">{money(ledger.pendingAmount)}</p>
//                           </div>
//                         </div>
//                         <div className="mt-3 flex flex-wrap gap-2">
//                           <button className={buttonSecondary} onClick={() => setDetailsLedger(ledger)}>
//                             View details
//                           </button>
//                           {ledger.pendingAmount > 0.009 && (
//                             <button className={buttonPrimary} onClick={() => openPayment(ledger)}>
//                               <CreditCard size={16} /> Add payment
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </section>
//           </>
//         )}
//       </div>
//       {companyModal && (
//         <Modal
//           title={editingCompany ? "Edit Company Details" : "Add Company"}
//           onClose={() => setCompanyModal(false)}
//         >
//           <form onSubmit={saveCompany} className="space-y-4">
//             <Field label="Company Name *">
//               <input
//                 required
//                 className={inputClass}
//                 value={companyForm.companyName}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, companyName: e.target.value }))}
//                 placeholder="Enter company name"
//               />
//             </Field>
//             <Field label="MR Name *">
//               <input
//                 required
//                 className={inputClass}
//                 value={companyForm.mrName}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, mrName: e.target.value }))}
//                 placeholder="Enter MR name"
//               />
//             </Field>
//             <Field label="MR Mobile Number *">
//               <input
//                 required
//                 inputMode="tel"
//                 className={inputClass}
//                 value={companyForm.mrMobile}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, mrMobile: e.target.value }))}
//                 placeholder="Enter mobile number"
//               />
//             </Field>
//             <Field label="GST Number (Optional)">
//               <input
//                 maxLength={15}
//                 className={inputClass}
//                 value={companyForm.gstNumber || ""}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
//                 placeholder="Enter GSTIN (optional)"
//               />
//             </Field>
//             <Field label="Company Discount (%)">
//               <input
//                 required
//                 type="number"
//                 min="0"
//                 max="100"
//                 step="0.01"
//                 className={inputClass}
//                 value={companyForm.discountPercentage}
//                 onChange={(e) => setCompanyForm((f) => ({ ...f, discountPercentage: e.target.value }))}
//               />
//             </Field>
//             <div className="space-y-3 rounded-xl border border-slate-200 p-3">
//               <div className="flex items-center justify-between gap-3">
//                 <div>
//                   <h3 className="text-sm font-bold text-slate-800">Product-wise Discounts</h3>
//                   <p className="text-xs text-slate-500">Discount is applied to each product's MRP.</p>
//                 </div>
//                 <button
//                   type="button"
//                   className={buttonSecondary}
//                   onClick={() => setCompanyForm((f) => ({
//                     ...f,
//                     categoryDiscounts: [...(f.categoryDiscounts || []), {
//                       category: "",
//                       discountPercentage: "0",
//                       isCustom: true,
//                       customCategory: "",
//                     }],
//                   }))}
//                 >
//                   <Plus size={15} /> Add Category
//                 </button>
//               </div>

//               {(companyForm.categoryDiscounts || []).length === 0 && (
//                 <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
//                   No category-specific discounts configured. The company discount above is used as the default.
//                 </p>
//               )}

//               {(companyForm.categoryDiscounts || []).map((item, index) => (
//                 <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
//                   <div className="space-y-1">
//                     <label className="text-xs font-medium text-slate-600">Product category name</label>
//                     <input
//                       required
//                       className={inputClass}
//                       value={item.isCustom ? (item.customCategory || item.category || "") : (item.category || "")}
//                       onChange={(e) => {
//                         const value = e.target.value;
//                         setCompanyForm((f) => ({
//                           ...f,
//                           categoryDiscounts: f.categoryDiscounts.map((row, i) =>
//                             i === index
//                               ? { ...row, category: value, customCategory: value, isCustom: true }
//                               : row
//                           ),
//                         }));
//                       }}
//                       placeholder="Enter category name"
//                     />
//                   </div>
//                   <Field label="Discount (%)">
//                     <input
//                       required
//                       type="number"
//                       min="0"
//                       max="100"
//                       step="0.01"
//                       className={inputClass}
//                       value={item.discountPercentage}
//                       onChange={(e) => updateCompanyDiscount(index, "discountPercentage", e.target.value)}
//                     />
//                   </Field>
//                   <div className="flex items-end">
//                     <button
//                       type="button"
//                       className="rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
//                       onClick={() => setCompanyForm((f) => ({
//                         ...f,
//                         categoryDiscounts: f.categoryDiscounts.filter((_, i) => i !== index),
//                       }))}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {editingCompany && (
//               <Field label="Admin Password (required to approve changes) *">
//                 <input
//                   required
//                   type="password"
//                   autoComplete="current-password"
//                   className={inputClass}
//                   value={adminPassword}
//                   onChange={(e) => setAdminPassword(e.target.value)}
//                   placeholder="Enter your admin login password"
//                 />
//               </Field>
//             )}
//             <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setCompanyModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
//                 {editingCompany ? "Verify & Save" : "Save Company"}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {ledgerModal && (
//         <Modal title="Add Purchase Ledger" onClose={() => setLedgerModal(false)} wide>
//           <form onSubmit={saveLedger} className="space-y-5">
//             <div className="grid gap-4 sm:grid-cols-2">
//               <Field label="Purchase Date *">
//                 <input
//                   required
//                   type="date"
//                   className={inputClass}
//                   value={purchaseDate}
//                   onChange={(e) => setPurchaseDate(e.target.value)}
//                 />
//               </Field>
//               <Field label="Company">
//                 <input
//                   readOnly
//                   className={`${inputClass} bg-slate-50`}
//                   value={selectedCompany?.companyName || ""}
//                 />
//               </Field>
//             </div>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between gap-3">
//                 <h3 className="font-bold text-slate-900">Products</h3>
//                 <button
//                   type="button"
//                   className={buttonSecondary}
//                   onClick={() => setProducts((current) => [...current, emptyProduct()])}
//                 >
//                   <Plus size={16} /> Add Product
//                 </button>
//               </div>
//               {products.map((product, index) => (
//                 <div key={index} className="rounded-xl border border-slate-200 p-3 sm:p-4">
//                   <div className="mb-3 flex items-center justify-between">
//                     <p className="text-sm font-bold text-slate-700">Product {index + 1}</p>
//                     {products.length > 1 && (
//                       <button
//                         type="button"
//                         className="text-xs font-semibold text-rose-600 hover:underline"
//                         onClick={() => setProducts((current) => current.filter((_, i) => i !== index))}
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//                     <Field label="Product Name *">
//                       <input
//                         required
//                         className={inputClass}
//                         value={product.productName}
//                         onChange={(e) => updateProduct(index, "productName", e.target.value)}
//                         placeholder="Medicine / product name"
//                       />
//                     </Field>
//                     <Field label="Product Category *">
//                       <select
//                         required
//                         className={inputClass}
//                         value={product.category || FIXED_PRODUCT_CATEGORIES[0]}
//                         onChange={(e) => updateProduct(index, "category", e.target.value)}
//                       >
//                         {FIXED_PRODUCT_CATEGORIES.map((category) => (
//                           <option key={category} value={category}>{category}</option>
//                         ))}
//                         {selectedCompany?.categoryDiscounts
//                           ?.filter((item) => !FIXED_PRODUCT_CATEGORIES.includes(item.category))
//                           .map((item) => (
//                             <option key={item.category} value={item.category}>{item.category}</option>
//                           ))}
//                       </select>
//                     </Field>
//                     <Field label="Number of Items *">
//                       <input
//                         required
//                         type="number"
//                         min="1"
//                         step="1"
//                         className={inputClass}
//                         value={product.quantity}
//                         onChange={(e) => updateProduct(index, "quantity", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Invoice Number *">
//                       <input
//                         required
//                         className={inputClass}
//                         value={product.invoiceNumber}
//                         onChange={(e) => updateProduct(index, "invoiceNumber", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Batch Number *">
//                       <input
//                       required
//                         className={inputClass}
                        
//                         value={product.batchNumber}
//                         onChange={(e) => updateProduct(index, "batchNumber", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="MRP per Item (₹) *">
//                       <input
//                         required
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         className={inputClass}
//                         value={product.mrp}
//                         onChange={(e) => updateProduct(index, "mrp", e.target.value)}
//                       />
//                     </Field>
//                     <Field label="Applied Discount (%)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getCategoryDiscount(product.category).toFixed(2)}
//                       />
//                     </Field>
//                     {/* <Field label="Purchase Rate before GST (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getBasePurchaseRate(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field>
//                     <Field label="GST 5% per Item (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-slate-50`}
//                         value={getGSTAmount(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field>
//                     <Field label="Final Purchase Rate incl. GST (₹)">
//                       <input
//                         readOnly
//                         className={`${inputClass} bg-emerald-50 font-semibold`}
//                         value={getPurchaseRate(product.companyRate, product.category).toFixed(2)}
//                       />
//                     </Field> */}
//                   </div>
//                   <p className="mt-3 text-right text-sm text-slate-600">
//                     Line total:{" "}
//                     <strong>
//                       {money(Number(product.quantity || 0) * getPurchaseRate(product.companyRate, product.category))}
//                     </strong>
//                   </p>
//                 </div>
//               ))}
//             </div>
//             <Field label="Notes (optional)">
//               <textarea
//                 rows={2}
//                 className={inputClass}
//                 value={ledgerNote}
//                 onChange={(e) => setLedgerNote(e.target.value)}
//                 placeholder="Optional purchase notes"
//               />
//             </Field>
//             <div className="rounded-xl bg-blue-50 p-4">
//               <div className="grid gap-3 sm:grid-cols-3">
//                 <div>
//                   <p className="text-sm text-blue-800">Total purchase before GST</p>
//                   <p className="mt-1 text-xl font-bold text-blue-900">{money(totalPurchaseBeforeGST)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-blue-800">Total GST (5%)</p>
//                   <p className="mt-1 text-xl font-bold text-blue-900">{money(totalGST)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-blue-800">Final purchase total</p>
//                   <p className="mt-1 text-2xl font-bold text-blue-900">{money(purchaseTotal)}</p>
//                 </div>
//               </div>
//               <p className="mt-3 text-xs text-blue-700">
//                 Payments can be added after the ledger is saved.
//               </p>
//             </div>
//             <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setLedgerModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}
//                 Save Ledger
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {paymentModal && paymentLedger && (
//         <Modal title={`Add Payment · ${paymentLedger.ledgerId}`} onClose={() => setPaymentModal(false)}>
//           <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
//             <div>
//               <p className="text-xs text-slate-500">Pending balance</p>
//               <p className="mt-1 font-bold text-rose-700">{money(paymentLedger.pendingAmount)}</p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500">Already paid</p>
//               <p className="mt-1 font-bold text-emerald-700">{money(paymentLedger.paidAmount)}</p>
//             </div>
//           </div>
//           <form onSubmit={savePayment} className="space-y-4">
//             <Field label="Payment Amount (₹) *">
//               <input
//                 required
//                 type="number"
//                 min="0.01"
//                 max={paymentLedger.pendingAmount}
//                 step="0.01"
//                 className={inputClass}
//                 value={paymentForm.amount}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
//               />
//             </Field>
//             <Field label="Payment Date *">
//               <input
//                 required
//                 type="date"
//                 className={inputClass}
//                 value={paymentForm.paymentDate}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))}
//               />
//             </Field>
//             <Field label="Payment Method *">
//               <select
//                 className={inputClass}
//                 value={paymentForm.method}
//                 onChange={(e) => setPaymentForm((f) => ({
//                   ...f,
//                   method: e.target.value,
//                   transactionNumber: e.target.value === "Cash" ? "" : f.transactionNumber,
//                 }))}
//               >
//                 <option value="Cash">Cash</option>
//                 <option value="UPI">UPI</option>
//               </select>
//             </Field>
//             {paymentForm.method === "UPI" && (
//               <Field label="UPI Transaction Number *">
//                 <input
//                   required
//                   className={inputClass}
//                   value={paymentForm.transactionNumber}
//                   onChange={(e) => setPaymentForm((f) => ({ ...f, transactionNumber: e.target.value }))}
//                   placeholder="Enter UPI transaction/reference ID"
//                 />
//               </Field>
//             )}
//             <Field label="Payment Note (optional)">
//               <textarea
//                 rows={2}
//                 className={inputClass}
//                 value={paymentForm.note}
//                 onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
//               />
//             </Field>
//             <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//               <button type="button" className={buttonSecondary} onClick={() => setPaymentModal(false)}>
//                 Cancel
//               </button>
//               <button className={buttonPrimary} disabled={saving}>
//                 {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CreditCard size={17} />}
//                 Record Payment
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {receiptData && (
//         <Modal
//           title={`Payment Receipt · ${receiptData.payment?.receiptNumber || "Receipt"}`}
//           onClose={() => setReceiptData(null)}
//         >
//           <div className="rounded-xl border-2 border-slate-800 bg-white p-5 text-slate-900">
//             <div className="border-b-2 border-slate-800 pb-4 text-center">
//               <h2 className="text-xl font-extrabold tracking-wide">DHRUWRAJ HEALTHCARE</h2>
//               <p className="mt-1 text-xs tracking-widest text-slate-500">PAYMENT ACKNOWLEDGEMENT</p>
//               <h3 className="mt-4 text-lg font-bold">PAYMENT RECEIPT</h3>
//             </div>
//             <div className="my-4 flex flex-wrap justify-between gap-2 text-sm">
//               <span><strong>Receipt No:</strong> {receiptData.payment?.receiptNumber || "—"}</span>
//               <span><strong>Date:</strong> {new Date(receiptData.payment?.paymentDate || Date.now()).toLocaleDateString("en-IN")}</span>
//             </div>
//             <div className="space-y-3 text-sm">
//               <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">Company</span><strong className="text-right">{receiptData.company?.companyName || "—"}</strong></div>
//               <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">MR Name</span><strong className="text-right">{receiptData.company?.mrName || "—"}</strong></div>
//               <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">MR Mobile</span><strong className="text-right">{receiptData.company?.mrMobile || "—"}</strong></div>
//               <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">Ledger ID</span><strong className="text-right">{receiptData.ledger?.ledgerId || "—"}</strong></div>
//               <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">Payment Mode</span><strong className="text-right">{receiptData.payment?.method || "—"}</strong></div>
//               {receiptData.payment?.method === "UPI" && <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">UPI Transaction No.</span><strong className="break-all text-right">{receiptData.payment?.transactionNumber || "—"}</strong></div>}
//               {receiptData.payment?.note && <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">Note</span><strong className="text-right">{receiptData.payment.note}</strong></div>}
//               <div className="flex justify-between gap-4 border-b-2 border-slate-800 py-3"><span className="font-semibold">Amount Received</span><strong className="text-xl">{money(receiptData.payment?.amount)}</strong></div>
//             </div>
//             <p className="mt-4 text-sm">I acknowledge that the amount stated above has been received by DHRUWRAJ HEALTHCARE.</p>
//             <div className="mt-16 grid grid-cols-2 gap-8 text-center text-xs">
//               <div className="border-t border-slate-800 pt-2">MR Signature / Name</div>
//               <div className="border-t border-slate-800 pt-2">Received By</div>
//             </div>
//             <p className="mt-5 text-center text-[11px] text-slate-500">Physical signature confirms acknowledgement. Keep signed receipt for monthly reconciliation.</p>
//           </div>
//           <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//             <button type="button" className={buttonSecondary} onClick={() => sharePaymentOnWhatsApp(receiptData.company, receiptData.ledger, receiptData.payment)}>
//               <MessageCircle size={16} /> WhatsApp Message
//             </button>
//             <button type="button" className={buttonPrimary} onClick={() => printPaymentReceipt(receiptData)}>
//               <FileText size={16} /> Print Receipt
//             </button>
//           </div>
//         </Modal>
//       )}
//       {detailsLedger && (
//         <Modal
//           title={
//   <>
//     Ledger Details ·{" "}
//     <span className="text-teal-600">
//       {new Date(detailsLedger.purchaseDate).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       })}
//     </span>
//   </>
// }
//           onClose={() => setDetailsLedger(null)}
//           wide
//         >
//           <div className="grid gap-3 sm:grid-cols-3">
//             <div className="rounded-xl bg-slate-50 p-3">
//               <p className="text-xs text-slate-500">Purchase total</p>
//               <p className="mt-1 font-bold">{money(detailsLedger.totalAmount)}</p>
//             </div>
//             <div className="rounded-xl bg-emerald-50 p-3">
//               <p className="text-xs text-emerald-700">Total paid</p>
//               <p className="mt-1 font-bold text-emerald-800">{money(detailsLedger.paidAmount)}</p>
//             </div>
//             <div className="rounded-xl bg-rose-50 p-3">
//               <p className="text-xs text-rose-700">Pending balance</p>
//               <p className="mt-1 font-bold text-rose-800">{money(detailsLedger.pendingAmount)}</p>
//             </div>
//           </div>
//           <h3 className="mb-2 mt-5 font-bold text-slate-900">Products</h3>
//           <div className="overflow-x-auto rounded-xl border">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50">
//                 <tr>
//                   <th className="px-3 py-2">Product</th>
//                   <th className="px-3 py-2">Qty</th>
//                   <th className="px-3 py-2">Invoice No.</th>
//                   <th className="px-3 py-2">Batch No.</th>
//                   <th className="px-3 py-2">MRP</th>
//                   {/* <th className="px-3 py-2">Purchase Rate</th> */}
//                   <th className="px-3 py-2">Discount</th>
//                   <th className="px-3 py-2">Total Purchase Rate Before GST</th>
//                   <th className="px-3 py-2">Total GST</th>
//                   {/* <th className="px-3 py-2">Total Purchase Rate After GST</th> */}
//                   <th className="px-3 py-2">Total Price</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {detailsLedger.products.map((product, index) => (
//                   <tr key={product._id || index}>
//                     <td className="px-3 py-3">{product.productName}</td>
//                     <td className="px-3 py-3">{product.quantity}</td>
//                     <td className="px-3 py-3">{product.invoiceNumber || "—"}</td>
//                     <td className="px-3 py-3">{product.batchNumber || "—"}</td>
//                     <td className="px-3 py-3">{money(product.mrp)}</td>
//                     {/* <td className="px-3 py-3">{money(product.companyRate)}</td> */}
//                     <td className="px-3 py-3">{Number(product.discountPercentage || 0)}%</td>
//                     <td className="px-3 py-3">{money(Number(product.basePurchaseRate ?? product.purchaseRate)*Number(product.quantity))}</td>
//                     <td className="px-3 py-3">{money(Number(product.gstAmount)*Number(product.quantity) || 0)}</td>
//                     {/* <td className="px-3 py-3">{money(product.purchaseRate)}</td> */}
//                     <td className="px-3 py-3 font-semibold">
//                       {money(Number(product.quantity) * Number(product.purchaseRate))}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="mt-5 flex items-center justify-between gap-3">
//             <h3 className="font-bold text-slate-900">Payment History</h3>
//             {detailsLedger.pendingAmount > 0.009 && (
//               <button
//                 className={buttonPrimary}
//                 onClick={() => {
//                   const current = detailsLedger;
//                   setDetailsLedger(null);
//                   openPayment(current);
//                 }}
//               >
//                 <Plus size={16} /> Add Payment
//               </button>
//             )}
//           </div>
//           {(detailsLedger.payments || []).length === 0 ? (
//             <p className="mt-3 rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
//               No payments recorded yet.
//             </p>
//           ) : (
//             <div className="mt-3 space-y-2">
//               {detailsLedger.payments.map((payment, index) => (
//                 <div
//                   key={payment._id || index}
//                   className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
//                 >
//                   <div>
//                     <p className="font-semibold text-slate-900">
//                       {money(payment.amount)} · {payment.method}
//                     </p>
//                     <p className="mt-1 text-xs text-slate-500">
//                       {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
//                     </p>
//                     {payment.transactionNumber && (
//                       <p className="mt-1 text-xs text-slate-600">
//                         Transaction: {payment.transactionNumber}
//                       </p>
//                     )}
//                     {payment.note && (
//                       <p className="mt-1 text-xs text-slate-500">{payment.note}</p>
//                     )}
//                   </div>
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className="text-xs font-semibold text-emerald-700">
//                       <CheckCircle2 className="mr-1 inline" size={15} />
//                       Recorded
//                     </span>
//                     <button
//                       type="button"
//                       className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
//                       onClick={() => setReceiptData({ company: selectedCompany, ledger: detailsLedger, payment })}
//                     >
//                       <FileText size={15} /> View / Print Receipt
//                     </button>
//                     <button
//                       type="button"
//                       className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-100"
//                       onClick={() => sharePaymentOnWhatsApp(selectedCompany, detailsLedger, payment)}
//                       title="Open this MR's WhatsApp chat with the payment message"
//                     >
//                       <MessageCircle size={15} /> Share on WhatsApp
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//           {detailsLedger.note && (
//             <p className="mt-4 text-sm text-slate-500">
//               Note: {detailsLedger.note}
//             </p>
//           )}
//         </Modal>
//       )}
//     </div>
//   );
// }


import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Filter,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
} from "lucide-react";
const API = "https://dms-backend-amber.vercel.app/api/company-ledger";
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
const normalizeLedgerSearch = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[₹,\s]/g, "")
    .trim();

const today = () => new Date().toISOString().slice(0, 10);

// Opens the selected MR's WhatsApp chat with a prefilled payment acknowledgement.
// WhatsApp will still require the user to press Send; no WhatsApp API is used.
const sharePaymentOnWhatsApp = (company, ledger, payment) => {
  const rawMobile = String(company?.mrMobile || "").replace(/\D/g, "");
  let phone = rawMobile;

  // Assume Indian mobile numbers when the company record contains a 10-digit number.
  if (phone.length === 10) phone = `91${phone}`;
  else if (phone.length === 11 && phone.startsWith("0")) phone = `91${phone.slice(1)}`;

  if (!phone || phone.length < 10) {
    window.alert("MR mobile number is missing or invalid. Please update company details first.");
    return;
  }

  const date = payment?.paymentDate
    ? new Date(payment.paymentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(payment?.amount || 0));

  const publicReceiptUrl = payment?.receiptToken
    ? `${API}/public/receipt/${payment.receiptToken}`
    : "";
  const message = [
    "*DHRUWRAJ HEALTHCARE — PAYMENT RECEIPT*",
    `Company: ${company?.companyName || "—"}`,
    `MR: ${company?.mrName || "—"}`,
    `Ledger ID: ${ledger?.ledgerId || "—"}`,
    `Receipt date: ${date}`,
    `Amount: ${amount}`,
    `Payment mode: ${payment?.method || "—"}`,
    payment?.transactionNumber ? `UPI Transaction No.: ${payment.transactionNumber}` : "",
    publicReceiptUrl ? `Receipt link: ${publicReceiptUrl}` : "",
    "",
    `Please confirm in this chat: Received ${amount} via ${payment?.method || "payment"}.`,
  ].filter(Boolean).join("\n");

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const printPaymentReceipt = ({ company, ledger, payment }) => {
  const receiptDate = payment?.paymentDate
    ? new Date(payment.paymentDate).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";
  const safe = (value) => escapeHtml(value || "—");
  const amount = money(payment?.amount);
  const receiptNumber = payment?.receiptNumber || "Receipt number pending";
  const popup = window.open("", "_blank", "width=800,height=900");
  if (!popup) {
    window.alert("Receipt window was blocked. Please allow pop-ups and try again.");
    return;
  }

  popup.document.open();
  popup.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Payment Receipt ${safe(receiptNumber)}</title>
<style>
  *{box-sizing:border-box} body{font-family:Arial,sans-serif;color:#111827;margin:0;padding:24px}
  .receipt{max-width:720px;margin:0 auto;border:1.5px solid #111827;padding:28px}
  .top{text-align:center;border-bottom:2px solid #111827;padding-bottom:16px}
  h1{font-size:22px;margin:0 0 6px;letter-spacing:.5px} .subtitle{font-size:12px;color:#4b5563}
  .receipt-title{text-align:center;font-size:18px;font-weight:bold;margin:20px 0}
  .meta{display:flex;justify-content:space-between;gap:16px;margin-bottom:18px;font-size:13px}
  table{width:100%;border-collapse:collapse;margin:12px 0 20px} td{padding:10px 8px;border-bottom:1px solid #d1d5db;font-size:14px}
  td:first-child{color:#4b5563;width:38%} .amount{font-size:20px;font-weight:bold}
  .notice{font-size:12px;color:#4b5563;margin-top:18px}
  .signatures{display:flex;gap:36px;margin-top:70px}.sign{width:50%;border-top:1px solid #111827;padding-top:8px;text-align:center;font-size:12px}
  .footer{margin-top:24px;text-align:center;font-size:10px;color:#6b7280}
  @media print{body{padding:0}.receipt{border:1.5px solid #111827;max-width:none;padding:22px}}
</style>
</head>
<body>
<div class="receipt">
  <div class="top"><h1>DHRUWRAJ HEALTHCARE</h1><div class="subtitle">PAYMENT ACKNOWLEDGEMENT</div></div>
  <div class="receipt-title">PAYMENT RECEIPT</div>
  <div class="meta"><span><strong>Receipt No:</strong> ${safe(receiptNumber)}</span><span><strong>Date:</strong> ${safe(receiptDate)}</span></div>
  <table>
    <tr><td>Company Name</td><td><strong>${safe(company?.companyName)}</strong></td></tr>
    <tr><td>Medical Representative (MR)</td><td>${safe(company?.mrName)}</td></tr>
    <tr><td>MR Mobile</td><td>${safe(company?.mrMobile)}</td></tr>
    <tr><td>Ledger ID</td><td>${safe(ledger?.ledgerId)}</td></tr>
    <tr><td>Amount Received</td><td class="amount">${safe(amount)}</td></tr>
    <tr><td>Payment Mode</td><td><strong>${safe(payment?.method)}</strong></td></tr>
    ${payment?.method === "UPI" ? `<tr><td>UPI Transaction No.</td><td>${safe(payment?.transactionNumber)}</td></tr>` : ""}
    ${payment?.note ? `<tr><td>Note</td><td>${safe(payment.note)}</td></tr>` : ""}
  </table>
  <p>
  I acknowledge that the amount stated above has been received.
 </p> 
  <div class="signatures">
    <div class="sign">MR Signature / Name</div>
    <div class="sign">Received By (DHRUWRAJ HEALTHCARE)</div>
  </div>
  <div class="notice">Please sign this receipt at the time of payment. Keep this signed copy for monthly account reconciliation.</div>
  <div class="footer">Computer-generated receipt · Physical signature confirms acknowledgement</div>
</div>
<script>window.onload = () => { window.focus(); };</script>
</body></html>`);
  popup.document.close();
  popup.focus();
  popup.print();
};
const FIXED_PRODUCT_CATEGORIES = [
  "General",
];

const emptyCompany = {
  companyName: "",
  mrName: "",
  mrMobile: "",
  gstNumber: "",
  discountPercentage: "0",
  categoryDiscounts: [],
};
const emptyProduct = () => ({
  productName: "",
  category: FIXED_PRODUCT_CATEGORIES[0],
  quantity: "1",
  invoiceNumber: "",
  batchNumber: "",
  mrp: "",
  companyRate: "",
  purchaseRate: "",
});
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 ";
const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2.5 px-4 text-sm font-bold hover:scale-[1.02] transition cursor-pointer";
const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";
function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5">
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
          wide ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon size={19} className="text-teal-600" />
      </div>
      <p className="mt-2 break-words text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
export default function CompanyLedger() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dismissedReminderIds, setDismissedReminderIds] = useState([]);
  const [search, setSearch] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [companyModal, setCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [adminPassword, setAdminPassword] = useState("");
  const [ledgerModal, setLedgerModal] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [products, setProducts] = useState([emptyProduct()]);
  const [ledgerNote, setLedgerNote] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentLedger, setPaymentLedger] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: today(),
    method: "Cash",
    transactionNumber: "",
    note: "",
  });
  const [detailsLedger, setDetailsLedger] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "All",
    batchNumber: "",
  });
  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );
  const request = useCallback(
    async (method, url, data) => {
      const response = await axios({
        method,
        url,
        data,
        headers,
      });
      return response.data;
    },
    [headers]
  );
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request("get", API);
      const list = Array.isArray(data) ? data : [];
      setCompanies(list);
      if (
        selectedCompanyId &&
        !list.some((company) => company._id === selectedCompanyId)
      ) {
        setSelectedCompanyId("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load companies. Please check your login."
      );
    } finally {
      setLoading(false);
    }
  }, [request, selectedCompanyId]);
  const loadLedgers = useCallback(async () => {
    if (!selectedCompanyId) {
      setLedgers([]);
      return;
    }
    setError("");
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.status !== "All") params.status = filters.status;
      if (filters.batchNumber.trim()) {
        params.batchNumber = filters.batchNumber.trim();
      }
      const response = await axios.get(
        `${API}/companies/${selectedCompanyId}/ledgers`,
        { headers, params }
      );
      setLedgers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load purchase ledgers."
      );
    }
  }, [selectedCompanyId, filters, headers]);
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);
  useEffect(() => {
    loadLedgers();
  }, [loadLedgers]);

  const selectedCompany = companies.find(
    (company) => company._id === selectedCompanyId
  );

  const visibleLedgers = useMemo(() => {
    const query = normalizeLedgerSearch(ledgerSearch);

    if (!query) return ledgers;

    return ledgers.filter((ledger) => {
      const purchaseDate = new Date(ledger.purchaseDate);
      const dateValues = Number.isNaN(purchaseDate.getTime())
        ? []
        : [
            purchaseDate.toLocaleDateString("en-IN"),
            purchaseDate.toISOString().slice(0, 10),
            purchaseDate.toLocaleDateString("en-US"),
          ];

      const productValues = (ledger.products || []).flatMap((product) => {
        const quantity = Number(product.quantity || 0);
        const mrp = Number(product.mrp || 0);
        const companyRate = Number(product.companyRate || 0);
        const basePurchaseRate = Number(product.basePurchaseRate || 0);
        const purchaseRate = Number(product.purchaseRate || 0);
        const gstAmount = Number(product.gstAmount || 0);

        return [
          product.productName,
          product.category,
          product.invoiceNumber,
          product.batchNumber,
          product.quantity,
          product.mrp,
          money(mrp),
          product.companyRate,
          money(companyRate),
          product.basePurchaseRate,
          money(basePurchaseRate),
          product.purchaseRate,
          money(purchaseRate),
          product.gstAmount,
          money(gstAmount),
          quantity * mrp,
          money(quantity * mrp),
          quantity * companyRate,
          money(quantity * companyRate),
          quantity * basePurchaseRate,
          money(quantity * basePurchaseRate),
          quantity * purchaseRate,
          money(quantity * purchaseRate),
          quantity * gstAmount,
          money(quantity * gstAmount),
        ];
      });

      const paymentValues = (ledger.payments || []).flatMap((payment) => [
        payment.amount,
        money(payment.amount),
        payment.method,
        payment.transactionNumber,
        payment.note,
        payment.paymentDate,
      ]);

      const searchableValues = [
        ledger.ledgerId,
        ledger.paymentStatus,
        ledger.note,
        ledger.totalAmount,
        money(ledger.totalAmount),
        ledger.paidAmount,
        money(ledger.paidAmount),
        ledger.pendingAmount,
        money(ledger.pendingAmount),
        ...dateValues,
        ...productValues,
        ...paymentValues,
      ];

      return searchableValues.some((value) =>
        normalizeLedgerSearch(value).includes(query)
      );
    });
  }, [ledgers, ledgerSearch]);

  const visibleCompanies = companies.filter((company) =>
    [
      company.companyName,
      company.mrName,
      company.mrMobile,
    ].some((value) =>
      String(value || "").toLowerCase().includes(search.toLowerCase())
    )
  );
  const summary = useMemo(
    () =>
      ledgers.reduce(
        (acc, ledger) => {
          acc.purchase += Number(ledger.totalAmount || 0);
          acc.paid += Number(ledger.paidAmount || 0);
          acc.pending += Number(ledger.pendingAmount || 0);
          return acc;
        },
        { purchase: 0, paid: 0, pending: 0 }
      ),
    [ledgers]
  );
  const openAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm(emptyCompany);
    setAdminPassword("");
    setError("");
    setCompanyModal(true);
  };
  const openEditCompany = () => {
    if (!selectedCompany) return;
    setEditingCompany(selectedCompany);
    setCompanyForm({
      companyName: selectedCompany.companyName || "",
      mrName: selectedCompany.mrName || "",
      mrMobile: selectedCompany.mrMobile || "",
      gstNumber: selectedCompany.gstNumber || "",
      discountPercentage: String(selectedCompany.discountPercentage ?? 0),
      categoryDiscounts: (selectedCompany.categoryDiscounts || []).map((item) => ({
        category: item.category || "",
        discountPercentage: String(item.discountPercentage ?? 0),
        isCustom: !FIXED_PRODUCT_CATEGORIES.includes(item.category),
        customCategory: !FIXED_PRODUCT_CATEGORIES.includes(item.category) ? item.category : "",
      })),
    });
    setAdminPassword("");
    setError("");
    setCompanyModal(true);
  };
  const saveCompany = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...companyForm,
        gstNumber: String(companyForm.gstNumber || "").trim().toUpperCase(),
        discountPercentage: Number(companyForm.discountPercentage || 0),
        categoryDiscounts: (companyForm.categoryDiscounts || []).map((item) => ({
          category: String(item.isCustom ? item.customCategory : item.category).trim(),
          discountPercentage: Number(item.discountPercentage || 0),
        })),
      };
      let saved;
      if (editingCompany) {
        payload.adminPassword = adminPassword;
        saved = await request(
          "put",
          `${API}/companies/${editingCompany._id}`,
          payload
        );
      } else {
        saved = await request("post", `${API}/companies`, payload);
      }
      setCompanyModal(false);
      setNotice(
        editingCompany
          ? "Company details updated successfully."
          : "Company added successfully."
      );
      await loadCompanies();
      if (!editingCompany && saved?._id) {
        setSelectedCompanyId(saved._id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save company."
      );
    } finally {
      setSaving(false);
    }
  };
  const getCategoryDiscount = (category) => {
    const configured = selectedCompany?.categoryDiscounts?.find(
      (item) => String(item.category || "").trim().toLowerCase() === String(category || "").trim().toLowerCase()
    );
    if (configured) return Number(configured.discountPercentage || 0);
    return Number(selectedCompany?.discountPercentage || 0);
  };

  const getBasePurchaseRate = (companyRate, category) => {
    const rate = Number(companyRate || 0);
    return Number((rate * (1 - getCategoryDiscount(category) / 100)).toFixed(2));
  };

  const getGSTAmount = (companyRate, category) =>
    Number((getBasePurchaseRate(companyRate, category) * 0.05).toFixed(2));

  // Final per-item purchase rate includes the fixed 5% GST.
  const getPurchaseRate = (companyRate, category) =>
    Number((getBasePurchaseRate(companyRate, category) + getGSTAmount(companyRate, category)).toFixed(2));

  const overdueReminders = companies.flatMap((company) =>
    (company.ledgers || [])
      .filter((ledger) => {
        const pending = Number(ledger.pendingAmount || 0);
        const purchaseDateMs = new Date(ledger.purchaseDate).getTime();
        const ageDays = (Date.now() - purchaseDateMs) / (1000 * 60 * 60 * 24);
        return pending > 0.009 && Number.isFinite(purchaseDateMs) && ageDays >= 30;
      })
      .map((ledger) => ({ ...ledger, reminderCompanyName: company.companyName }))
  );

  const updateCompanyDiscount = (index, field, value) => {
    setCompanyForm((current) => ({
      ...current,
      categoryDiscounts: current.categoryDiscounts.map((item, i) => {
        if (i !== index) return item;
        if (field === "category") {
          return {
            ...item,
            category: value,
            isCustom: value === "__custom__",
            customCategory: value === "__custom__" ? item.customCategory || "" : "",
          };
        }
        return { ...item, [field]: value };
      }),
    }));
  };

  // const updateProduct = (index, field, value) => {
  //   setProducts((current) =>
  //     current.map((product, i) =>
  //       i === index ? { ...product, [field]: value } : product
  //     )
  //   );
  // };
  const updateProduct = (index, field, value) => {
  setProducts((current) =>
    current.map((product, i) => {
      if (i !== index) return product;

      // Update the targeted field
      const updatedProduct = { ...product, [field]: value };

      // If the user is changing the MRP, automatically calculate companyRate
      if (field === "mrp") {
        updatedProduct.companyRate = value ? (Number(value) / 1.05).toFixed(2) : "";
      }

      return updatedProduct;
    })
  );
};
  const totalPurchaseBeforeGST = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0) * getBasePurchaseRate(product.companyRate, product.category),
    0
  );
  const totalGST = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0) * getGSTAmount(product.companyRate, product.category),
    0
  );
  const purchaseTotal = Number((totalPurchaseBeforeGST + totalGST).toFixed(2));
  const saveLedger = async (event) => {
    event.preventDefault();
    if (!selectedCompanyId) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        purchaseDate,
        products: products.map((product) => ({
          ...product,
          quantity: Number(product.quantity),
          mrp: Number(product.mrp),
          companyRate: Number(product.companyRate),
          basePurchaseRate: getBasePurchaseRate(product.companyRate, product.category),
          gstPercentage: 5,
          gstAmount: getGSTAmount(product.companyRate, product.category),
          purchaseRate: getPurchaseRate(product.companyRate, product.category),
          discountPercentage: getCategoryDiscount(product.category),
        })),
        note: ledgerNote,
      };
      await request(
        "post",
        `${API}/companies/${selectedCompanyId}/ledgers`,
        payload
      );
      setLedgerModal(false);
      setProducts([emptyProduct()]);
      setPurchaseDate(today());
      setLedgerNote("");
      setNotice("Purchase ledger created successfully.");
      await loadLedgers();
      await loadCompanies();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create ledger."
      );
    } finally {
      setSaving(false);
    }
  };
  const openPayment = (ledger) => {
    setPaymentLedger(ledger);
    setPaymentForm({
      amount: String(ledger.pendingAmount || ""),
      paymentDate: today(),
      method: "Cash",
      transactionNumber: "",
      note: "",
    });
    setError("");
    setPaymentModal(true);
  };
  const savePayment = async (event) => {
    event.preventDefault();
    if (!paymentLedger || !selectedCompanyId) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await request(
        "post",
        `${API}/companies/${selectedCompanyId}/ledgers/${paymentLedger._id}/payments`,
        {
          ...paymentForm,
          amount: Number(paymentForm.amount),
        }
      );
      setPaymentModal(false);
      setNotice("Payment recorded successfully. Print the receipt and get the MR's signature.");
      if (saved?.createdPayment) {
        setReceiptData({
          company: selectedCompany,
          ledger: saved,
          payment: saved.createdPayment,
        });
      }
      await loadLedgers();
      await loadCompanies();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to record payment."
      );
    } finally {
      setSaving(false);
    }
  };
  const resetFilters = () => {
    setFilters({
      from: "",
      to: "",
      status: "All",
      batchNumber: "",
    });
  };
  const companyLedgerCount = selectedCompany?.ledgers?.length || 0;
  return (
    <div className="min-h-screen w-full">
      {overdueReminders.filter((ledger) => !dismissedReminderIds.includes(ledger._id)).length > 0 && (
        <div className="fixed right-4 top-4 z-[80] w-[min(92vw,380px)] space-y-2">
          {overdueReminders
            .filter((ledger) => !dismissedReminderIds.includes(ledger._id))
            .map((ledger) => (
              <div key={ledger._id} className="rounded-xl border border-amber-300 bg-white p-4 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 shrink-0 text-amber-600" size={19} />
                    <div>
                      <p className="font-bold text-slate-900">Payment overdue for 30+ days</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {ledger.ledgerId} · {ledger.reminderCompanyName || "Company"}
                      </p>
                      <p className="mt-1 text-sm text-rose-700">
                        Pending: <strong>{money(ledger.pendingAmount)}</strong>
                      </p>
                      <button
                        className="mt-2 text-sm font-semibold text-teal-700 hover:underline"
                        onClick={() => setDetailsLedger(ledger)}
                      >
                        View ledger details
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                    aria-label="Dismiss reminder"
                    onClick={() => setDismissedReminderIds((ids) => [...ids, ledger._id])}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Company Ledger
            </h1>
            <p className="text-sm text-slate-400">
              Manage supplier purchases, payment history and outstanding balances.
            </p>
          </div>
          <button className={buttonPrimary} onClick={openAddCompany}>
            <Plus size={18} /> Add Company
          </button>
        </div>
        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}
        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message">
              <X size={17} />
            </button>
          </div>
        )}
        {!selectedCompanyId ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your Companies
                </h2>
                <p className="text-sm text-slate-500">
                  Select a company to view its purchase ledgers.
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  className={`${inputClass} pl-10`}
                  placeholder="Search companies..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoaderCircle className="animate-spin text-teal-600" />
              </div>
            ) : visibleCompanies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
                <Building2 className="mx-auto text-slate-400" size={36} />
                <p className="mt-3 font-semibold text-slate-700">
                  No companies found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add your first company to start recording purchases.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCompanies.map((company) => (
                  <button
                    key={company._id}
                    onClick={() => setSelectedCompanyId(company._id)}
                    className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-teal-600">
                          <Building2 size={22} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-900">
                            {company.companyName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            MR : {company.mrName}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={19} className="shrink-0 text-slate-400" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                      <span className="text-slate-500">
                        Contact : {company.mrMobile}
                      </span>
                      {/* <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {company.discountPercentage || 0}% discount
                      </span> */}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <button
              className={buttonSecondary}
              onClick={() => setSelectedCompanyId("")}
            >
              <ArrowLeft size={17} /> All Companies
            </button>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-teal-600">
                    <Building2 size={25} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedCompany?.companyName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      MR: {selectedCompany?.mrName} · {selectedCompany?.mrMobile}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Company discount: {selectedCompany?.discountPercentage || 0}%
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className={buttonSecondary} onClick={openEditCompany}>
                    <LockKeyhole size={17} /> Edit Details
                  </button>
                  <button
                    className={buttonSecondary}
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    <Filter size={17} /> Filters
                  </button>
                  <button
                    className={buttonPrimary}
                    onClick={() => {
                      setProducts([emptyProduct()]);
                      setPurchaseDate(today());
                      setLedgerNote("");
                      setError("");
                      setLedgerModal(true);
                    }}
                  >
                    <Plus size={18} /> Add Ledger
                  </button>
                </div>
              </div>
            </section>
            {filtersOpen && (
              <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Purchase date from">
                  <input
                    type="date"
                    className={inputClass}
                    value={filters.from}
                    max={filters.to || undefined}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, from: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Purchase date to">
                  <input
                    type="date"
                    className={inputClass}
                    value={filters.to}
                    min={filters.from || undefined}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, to: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Payment status">
                  <select
                    className={inputClass}
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    <option>All</option>
                    <option>Pending</option>
                    <option>Paid</option>
                  </select>
                </Field>
                {/* <Field label="Batch number">
                  <input
                    className={inputClass}
                    placeholder="Search batch..."
                    value={filters.batchNumber}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        batchNumber: e.target.value,
                      }))
                    }
                  />
                </Field> */}
                <div className="flex items-end">
                  <button
                    className={`${buttonSecondary} w-full cursor-pointer`}
                    onClick={resetFilters}
                  >
                    <RefreshCw size={17} />Reset filters
                  </button>
                </div>
              </section>
            )}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                label="Purchase Total"
                value={money(summary.purchase)}
                icon={FileText}
              />
              <SummaryCard
                label="Total Paid"
                value={money(summary.paid)}
                icon={CheckCircle2}
              />
              <SummaryCard
                label="Pending Balance"
                value={money(summary.pending)}
                icon={Wallet}
              />
            </section>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Purchase Ledgers</h2>
                  <span className="text-sm text-slate-500">
                    {visibleLedgers.length} of {ledgers.length} ledger(s)
                  </span>
                </div>
                <div className="relative w-full sm:max-w-md">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    className={`${inputClass} appearance-none pr-10 pl-10`}
                    placeholder="Search product, invoice, batch, price, date, status..."
                    value={ledgerSearch}
                    onChange={(event) => setLedgerSearch(event.target.value)}
                    aria-label="Search purchase ledgers"
                  />
                  {ledgerSearch && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2  hover:cursor-pointer hover:text-teal-600"
                      onClick={() => setLedgerSearch("")}
                      aria-label="Clear ledger search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              {visibleLedgers.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto text-slate-400" size={34} />
                  <p className="mt-3 font-semibold text-slate-700">
                    No matching purchase ledgers
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another product name, invoice number, batch number, amount, date, or payment status.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Products</th>
                          <th className="px-4 py-3">Invoice & Batch No.</th>
                          <th className="px-4 py-3">Purchase total</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Pending</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleLedgers.map((ledger) => (
                          <tr key={ledger._id} className="align-top hover:bg-slate-50">
                            <td className="px-4 py-4">
                              {/* <p className="font-bold text-blue-700">{ledger.ledgerId}</p> */}
                              <p className="font-bold text-teal-700">
                                {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
                              </p>
                            </td>
                            <td className="max-w-56 px-4 py-4">
                              {ledger.products.map((product, index) => (
                                <p key={product._id || index} className="mb-1">
                                  {product.productName}{" "}
                                  <span className="text-slate-500">
                                    × {product.quantity}
                                  </span>
                                </p>
                              ))}
                            </td>
                            <td className="max-w-48 px-4 py-4">
                              {ledger.products.map((product, index) => (
                                <p key={product._id || index} className="mb-1 text-xs text-slate-600">
                                  Inv: {product.invoiceNumber || "—"} · Batch: {product.batchNumber || "—"}
                                </p>
                              ))}
                            </td>
                            <td className="px-4 py-4 font-semibold">{money(ledger.totalAmount)}</td>
                            <td className="px-4 py-4 text-emerald-700">{money(ledger.paidAmount)}</td>
                            <td className="px-4 py-4 font-semibold text-rose-700">{money(ledger.pendingAmount)}</td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                ledger.paymentStatus === "Paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {ledger.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col items-start gap-2">
                                <button
                                  className="text-xs font-semibold text-blue-700 hover:underline"
                                  onClick={() => setDetailsLedger(ledger)}
                                >
                                  View details
                                </button>
                                {ledger.pendingAmount > 0.009 && (
                                  <button
                                    className="text-xs font-semibold text-emerald-700 hover:underline"
                                    onClick={() => openPayment(ledger)}
                                  >
                                    Add payment
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-3 p-3 md:hidden">
                    {visibleLedgers.map((ledger) => (
                      <div key={ledger._id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-blue-700">{ledger.ledgerId}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ledger.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {ledger.paymentStatus}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1 text-sm">
                          {ledger.products.map((product, index) => (
                            <p key={product._id || index} className="text-slate-700">
                              {product.productName} × {product.quantity}
                            </p>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Purchase total</p>
                            <p className="mt-1 font-bold">{money(ledger.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Pending</p>
                            <p className="mt-1 font-bold text-rose-700">{money(ledger.pendingAmount)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button className={buttonSecondary} onClick={() => setDetailsLedger(ledger)}>
                            View details
                          </button>
                          {ledger.pendingAmount > 0.009 && (
                            <button className={buttonPrimary} onClick={() => openPayment(ledger)}>
                              <CreditCard size={16} /> Add payment
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
      {companyModal && (
        <Modal
          title={editingCompany ? "Edit Company Details" : "Add Company"}
          onClose={() => setCompanyModal(false)}
        >
          <form onSubmit={saveCompany} className="space-y-4">
            <Field label="Company Name *">
              <input
                required
                className={inputClass}
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm((f) => ({ ...f, companyName: e.target.value }))}
                placeholder="Enter company name"
              />
            </Field>
            <Field label="MR Name *">
              <input
                required
                className={inputClass}
                value={companyForm.mrName}
                onChange={(e) => setCompanyForm((f) => ({ ...f, mrName: e.target.value }))}
                placeholder="Enter MR name"
              />
            </Field>
            <Field label="MR Mobile Number *">
              <input
                required
                inputMode="tel"
                className={inputClass}
                value={companyForm.mrMobile}
                onChange={(e) => setCompanyForm((f) => ({ ...f, mrMobile: e.target.value }))}
                placeholder="Enter mobile number"
              />
            </Field>
            <Field label="GST Number (Optional)">
              <input
                maxLength={15}
                className={inputClass}
                value={companyForm.gstNumber || ""}
                onChange={(e) => setCompanyForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
                placeholder="Enter GSTIN (optional)"
              />
            </Field>
            <Field label="Company Discount (%)">
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={inputClass}
                value={companyForm.discountPercentage}
                onChange={(e) => setCompanyForm((f) => ({ ...f, discountPercentage: e.target.value }))}
              />
            </Field>
            <div className="space-y-3 rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Product-wise Discounts</h3>
                  <p className="text-xs text-slate-500">Discount is applied to each product's MRP.</p>
                </div>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => setCompanyForm((f) => ({
                    ...f,
                    categoryDiscounts: [...(f.categoryDiscounts || []), {
                      category: "",
                      discountPercentage: "0",
                      isCustom: true,
                      customCategory: "",
                    }],
                  }))}
                >
                  <Plus size={15} /> Add Category
                </button>
              </div>

              {(companyForm.categoryDiscounts || []).length === 0 && (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  No category-specific discounts configured. The company discount above is used as the default.
                </p>
              )}

              {(companyForm.categoryDiscounts || []).map((item, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Product category name</label>
                    <input
                      required
                      className={inputClass}
                      value={item.isCustom ? (item.customCategory || item.category || "") : (item.category || "")}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCompanyForm((f) => ({
                          ...f,
                          categoryDiscounts: f.categoryDiscounts.map((row, i) =>
                            i === index
                              ? { ...row, category: value, customCategory: value, isCustom: true }
                              : row
                          ),
                        }));
                      }}
                      placeholder="Enter category name"
                    />
                  </div>
                  <Field label="Discount (%)">
                    <input
                      required
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className={inputClass}
                      value={item.discountPercentage}
                      onChange={(e) => updateCompanyDiscount(index, "discountPercentage", e.target.value)}
                    />
                  </Field>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      onClick={() => setCompanyForm((f) => ({
                        ...f,
                        categoryDiscounts: f.categoryDiscounts.filter((_, i) => i !== index),
                      }))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {editingCompany && (
              <Field label="Admin Password (required to approve changes) *">
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your admin login password"
                />
              </Field>
            )}
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button type="button" className={buttonSecondary} onClick={() => setCompanyModal(false)}>
                Cancel
              </button>
              <button className={buttonPrimary} disabled={saving}>
                {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
                {editingCompany ? "Verify & Save" : "Save Company"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {ledgerModal && (
        <Modal title="Add Purchase Ledger" onClose={() => setLedgerModal(false)} wide>
          <form onSubmit={saveLedger} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Purchase Date *">
                <input
                  required
                  type="date"
                  className={inputClass}
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </Field>
              <Field label="Company">
                <input
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                  value={selectedCompany?.companyName || ""}
                />
              </Field>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-900">Products</h3>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => setProducts((current) => [...current, emptyProduct()])}
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
              {products.map((product, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700">Product {index + 1}</p>
                    {products.length > 1 && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-600 hover:underline"
                        onClick={() => setProducts((current) => current.filter((_, i) => i !== index))}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Product Name *">
                      <input
                        required
                        className={inputClass}
                        value={product.productName}
                        onChange={(e) => updateProduct(index, "productName", e.target.value)}
                        placeholder="Medicine / product name"
                      />
                    </Field>
                    <Field label="Product Category *">
                      <select
                        required
                        className={inputClass}
                        value={product.category || FIXED_PRODUCT_CATEGORIES[0]}
                        onChange={(e) => updateProduct(index, "category", e.target.value)}
                      >
                        {FIXED_PRODUCT_CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                        {selectedCompany?.categoryDiscounts
                          ?.filter((item) => !FIXED_PRODUCT_CATEGORIES.includes(item.category))
                          .map((item) => (
                            <option key={item.category} value={item.category}>{item.category}</option>
                          ))}
                      </select>
                    </Field>
                    <Field label="Number of Items *">
                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        className={inputClass}
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, "quantity", e.target.value)}
                      />
                    </Field>
                    <Field label="Invoice Number *">
                      <input
                        required
                        className={inputClass}
                        value={product.invoiceNumber}
                        onChange={(e) => updateProduct(index, "invoiceNumber", e.target.value)}
                      />
                    </Field>
                    <Field label="Batch Number *">
                      <input
                      required
                        className={inputClass}
                        
                        value={product.batchNumber}
                        onChange={(e) => updateProduct(index, "batchNumber", e.target.value)}
                      />
                    </Field>
                    <Field label="MRP per Item (₹) *">
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={product.mrp}
                        onChange={(e) => updateProduct(index, "mrp", e.target.value)}
                      />
                    </Field>
                    <Field label="Applied Discount (%)">
                      <input
                        readOnly
                        className={`${inputClass} bg-slate-50`}
                        value={getCategoryDiscount(product.category).toFixed(2)}
                      />
                    </Field>
                    {/* <Field label="Purchase Rate before GST (₹)">
                      <input
                        readOnly
                        className={`${inputClass} bg-slate-50`}
                        value={getBasePurchaseRate(product.companyRate, product.category).toFixed(2)}
                      />
                    </Field>
                    <Field label="GST 5% per Item (₹)">
                      <input
                        readOnly
                        className={`${inputClass} bg-slate-50`}
                        value={getGSTAmount(product.companyRate, product.category).toFixed(2)}
                      />
                    </Field>
                    <Field label="Final Purchase Rate incl. GST (₹)">
                      <input
                        readOnly
                        className={`${inputClass} bg-emerald-50 font-semibold`}
                        value={getPurchaseRate(product.companyRate, product.category).toFixed(2)}
                      />
                    </Field> */}
                  </div>
                  <p className="mt-3 text-right text-sm text-slate-600">
                    Line total:{" "}
                    <strong>
                      {money(Number(product.quantity || 0) * getPurchaseRate(product.companyRate, product.category))}
                    </strong>
                  </p>
                </div>
              ))}
            </div>
            <Field label="Notes (optional)">
              <textarea
                rows={2}
                className={inputClass}
                value={ledgerNote}
                onChange={(e) => setLedgerNote(e.target.value)}
                placeholder="Optional purchase notes"
              />
            </Field>
            <div className="rounded-xl bg-blue-50 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-blue-800">Total purchase before GST</p>
                  <p className="mt-1 text-xl font-bold text-blue-900">{money(totalPurchaseBeforeGST)}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-800">Total GST (5%)</p>
                  <p className="mt-1 text-xl font-bold text-blue-900">{money(totalGST)}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-800">Final purchase total</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">{money(purchaseTotal)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-blue-700">
                Payments can be added after the ledger is saved.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className={buttonSecondary} onClick={() => setLedgerModal(false)}>
                Cancel
              </button>
              <button className={buttonPrimary} disabled={saving}>
                {saving ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}
                Save Ledger
              </button>
            </div>
          </form>
        </Modal>
      )}
      {paymentModal && paymentLedger && (
        <Modal title={`Add Payment · ${paymentLedger.ledgerId}`} onClose={() => setPaymentModal(false)}>
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-xs text-slate-500">Pending balance</p>
              <p className="mt-1 font-bold text-rose-700">{money(paymentLedger.pendingAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Already paid</p>
              <p className="mt-1 font-bold text-emerald-700">{money(paymentLedger.paidAmount)}</p>
            </div>
          </div>
          <form onSubmit={savePayment} className="space-y-4">
            <Field label="Payment Amount (₹) *">
              <input
                required
                type="number"
                min="0.01"
                max={paymentLedger.pendingAmount}
                step="0.01"
                className={inputClass}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </Field>
            <Field label="Payment Date *">
              <input
                required
                type="date"
                className={inputClass}
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))}
              />
            </Field>
            <Field label="Payment Method *">
              <select
                className={inputClass}
                value={paymentForm.method}
                onChange={(e) => setPaymentForm((f) => ({
                  ...f,
                  method: e.target.value,
                  transactionNumber: e.target.value === "Cash" ? "" : f.transactionNumber,
                }))}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </Field>
            {paymentForm.method === "UPI" && (
              <Field label="UPI Transaction Number *">
                <input
                  required
                  className={inputClass}
                  value={paymentForm.transactionNumber}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, transactionNumber: e.target.value }))}
                  placeholder="Enter UPI transaction/reference ID"
                />
              </Field>
            )}
            <Field label="Payment Note (optional)">
              <textarea
                rows={2}
                className={inputClass}
                value={paymentForm.note}
                onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
              />
            </Field>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className={buttonSecondary} onClick={() => setPaymentModal(false)}>
                Cancel
              </button>
              <button className={buttonPrimary} disabled={saving}>
                {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CreditCard size={17} />}
                Record Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
      {receiptData && (
        <Modal
          title={`Payment Receipt · ${receiptData.payment?.receiptNumber || "Receipt"}`}
          onClose={() => setReceiptData(null)}
        >
          <div className="rounded-xl border-2 border-slate-800 bg-white p-5 text-slate-900">
            <div className="border-b-2 border-slate-800 pb-4 text-center">
              <h2 className="text-xl font-extrabold tracking-wide">DHRUWRAJ HEALTHCARE</h2>
              <p className="mt-1 text-xs tracking-widest text-slate-500">PAYMENT ACKNOWLEDGEMENT</p>
              <h3 className="mt-4 text-lg font-bold">PAYMENT RECEIPT</h3>
            </div>
            <div className="my-4 flex flex-wrap justify-between gap-2 text-sm">
              <span><strong>Receipt No:</strong> {receiptData.payment?.receiptNumber || "—"}</span>
              <span><strong>Date:</strong> {new Date(receiptData.payment?.paymentDate || Date.now()).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">Company</span><strong className="text-right">{receiptData.company?.companyName || "—"}</strong></div>
              <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">MR Name</span><strong className="text-right">{receiptData.company?.mrName || "—"}</strong></div>
              <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">MR Mobile</span><strong className="text-right">{receiptData.company?.mrMobile || "—"}</strong></div>
              <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">Ledger ID</span><strong className="text-right">{receiptData.ledger?.ledgerId || "—"}</strong></div>
              <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">Payment Mode</span><strong className="text-right">{receiptData.payment?.method || "—"}</strong></div>
              {receiptData.payment?.method === "UPI" && <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">UPI Transaction No.</span><strong className="break-all text-right">{receiptData.payment?.transactionNumber || "—"}</strong></div>}
              {receiptData.payment?.note && <div className="flex justify-between gap-4 border-b pb-2"><span className="text-slate-500">Note</span><strong className="text-right">{receiptData.payment.note}</strong></div>}
              <div className="flex justify-between gap-4 border-b-2 border-slate-800 py-3"><span className="font-semibold">Amount Received</span><strong className="text-xl">{money(receiptData.payment?.amount)}</strong></div>
            </div>
            {receiptData.payment?.receiptToken && (
              <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3">
                <p className="text-sm font-bold text-teal-900">Public receipt link</p>
                <a className="mt-1 block break-all text-sm text-teal-700 underline" href={`${API}/public/receipt/${receiptData.payment.receiptToken}`} target="_blank" rel="noreferrer">{`${API}/public/receipt/${receiptData.payment.receiptToken}`}</a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={buttonSecondary} onClick={() => window.open(`${API}/public/receipt/${receiptData.payment.receiptToken}`, "_blank", "noopener,noreferrer")}>Open Public Receipt</button>
                  <button type="button" className={buttonSecondary} onClick={async () => { const url = `${API}/public/receipt/${receiptData.payment.receiptToken}`; try { await navigator.clipboard.writeText(url); setNotice("Public receipt link copied."); } catch { window.prompt("Copy this public receipt link:", url); } }}>Copy Link</button>
                </div>
              </div>
            )}
            <p>
  I acknowledge that the amount stated above has been received.
</p>
            <div className="mt-16 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-slate-800 pt-2">MR Signature / Name</div>
              <div className="border-t border-slate-800 pt-2">Given By</div>
            </div>
            <p className="mt-5 text-center text-[11px] text-slate-500">Physical signature confirms acknowledgement. Keep signed receipt for monthly reconciliation.</p>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={buttonSecondary} onClick={() => sharePaymentOnWhatsApp(receiptData.company, receiptData.ledger, receiptData.payment)}>
              <MessageCircle size={16} /> WhatsApp Message
            </button>
            <button type="button" className={buttonPrimary} onClick={() => printPaymentReceipt(receiptData)}>
              <FileText size={16} /> Print Receipt
            </button>
          </div>
        </Modal>
      )}
      {detailsLedger && (
        <Modal
          title={
  <>
    Ledger Details ·{" "}
    <span className="text-teal-600">
      {new Date(detailsLedger.purchaseDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
    </span>
  </>
}
          onClose={() => setDetailsLedger(null)}
          wide
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Purchase total</p>
              <p className="mt-1 font-bold">{money(detailsLedger.totalAmount)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Total paid</p>
              <p className="mt-1 font-bold text-emerald-800">{money(detailsLedger.paidAmount)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3">
              <p className="text-xs text-rose-700">Pending balance</p>
              <p className="mt-1 font-bold text-rose-800">{money(detailsLedger.pendingAmount)}</p>
            </div>
          </div>
          <h3 className="mb-2 mt-5 font-bold text-slate-900">Products</h3>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Invoice No.</th>
                  <th className="px-3 py-2">Batch No.</th>
                  <th className="px-3 py-2">MRP</th>
                  {/* <th className="px-3 py-2">Purchase Rate</th> */}
                  <th className="px-3 py-2">Discount</th>
                  <th className="px-3 py-2">Total Purchase Rate Before GST</th>
                  <th className="px-3 py-2">Total GST</th>
                  {/* <th className="px-3 py-2">Total Purchase Rate After GST</th> */}
                  <th className="px-3 py-2">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {detailsLedger.products.map((product, index) => (
                  <tr key={product._id || index}>
                    <td className="px-3 py-3">{product.productName}</td>
                    <td className="px-3 py-3">{product.quantity}</td>
                    <td className="px-3 py-3">{product.invoiceNumber || "—"}</td>
                    <td className="px-3 py-3">{product.batchNumber || "—"}</td>
                    <td className="px-3 py-3">{money(product.mrp)}</td>
                    {/* <td className="px-3 py-3">{money(product.companyRate)}</td> */}
                    <td className="px-3 py-3">{Number(product.discountPercentage || 0)}%</td>
                    <td className="px-3 py-3">{money(Number(product.basePurchaseRate ?? product.purchaseRate)*Number(product.quantity))}</td>
                    <td className="px-3 py-3">{money(Number(product.gstAmount)*Number(product.quantity) || 0)}</td>
                    {/* <td className="px-3 py-3">{money(product.purchaseRate)}</td> */}
                    <td className="px-3 py-3 font-semibold">
                      {money(Number(product.quantity) * Number(product.purchaseRate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900">Payment History</h3>
            {detailsLedger.pendingAmount > 0.009 && (
              <button
                className={buttonPrimary}
                onClick={() => {
                  const current = detailsLedger;
                  setDetailsLedger(null);
                  openPayment(current);
                }}
              >
                <Plus size={16} /> Add Payment
              </button>
            )}
          </div>
          {(detailsLedger.payments || []).length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
              No payments recorded yet.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {detailsLedger.payments.map((payment, index) => (
                <div
                  key={payment._id || index}
                  className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {money(payment.amount)} · {payment.method}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                    </p>
                    {payment.transactionNumber && (
                      <p className="mt-1 text-xs text-slate-600">
                        Transaction: {payment.transactionNumber}
                      </p>
                    )}
                    {payment.note && (
                      <p className="mt-1 text-xs text-slate-500">{payment.note}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="mr-1 inline" size={15} />
                      Recorded
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      onClick={() => setReceiptData({ company: selectedCompany, ledger: detailsLedger, payment })}
                    >
                      <FileText size={15} /> View / Print Receipt
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-100"
                      onClick={() => sharePaymentOnWhatsApp(selectedCompany, detailsLedger, payment)}
                      title="Open this MR's WhatsApp chat with the payment message"
                    >
                      <MessageCircle size={15} /> Share on WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {detailsLedger.note && (
            <p className="mt-4 text-sm text-slate-500">
              Note: {detailsLedger.note}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
