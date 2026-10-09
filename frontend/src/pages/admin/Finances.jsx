// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";

// import { TrendingUp, Wallet, Package, Plus, X , Smartphone , ChartLine, TrendingDown } from "lucide-react";

// export default function Finances() {
//   const [data, setData] = useState({
//     summary: {
//       totalSales: 0,
//       consultation: 0,
//       medicines: 0,
//       therapy: 0,
//       upiSales: 0,
//       cashSales: 0,
//     },

//     totalExpenses: 0,
//     inventoryPurchaseTotal: 0,
//     history: [],
//   });

//   const [loading, setLoading] = useState(true);

//   const [clinics, setClinics] = useState([]);

//   const [showExpenseModal, setShowExpenseModal] = useState(false);

//   const [ledgerFilter, setLedgerFilter] = useState("all");

//   const [currentPage, setCurrentPage] = useState(1);

//   const recordsPerPage = 10;

//   const [selectedCity, setSelectedCity] = useState("");

//   const [selectedClinic, setSelectedClinic] = useState(null);

//   const [dates, setDates] = useState({
//     start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
//       .toISOString()
//       .split("T")[0],

//     end: new Date().toISOString().split("T")[0],
//   });

//   const [expenseForm, setExpenseForm] = useState({
//     title: "",
//     amount: "",
//     category: "Rent",
//     date: new Date().toISOString().split("T")[0],
//     paymentMode: "Cash",
//   });

//   const BASE_URL = "https://dms-backend-amber.vercel.app/api";

//   const auth = {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   };

//   // ===================================================
//   // FILTER LEDGER
//   // ===================================================

//   const filteredLedger = data.history.filter((item) => {
//     if (ledgerFilter === "all") return true;

//     if (ledgerFilter === "sales") return item.invoiceId;

//     if (ledgerFilter === "expenses")
//       return !item.invoiceId && item.type !== "IN";

//     if (ledgerFilter === "inventory") return item.type === "IN";

//     return true;
//   });

//   // ===================================================
//   // PAGINATION
//   // ===================================================

//   const indexOfLastRecord = currentPage * recordsPerPage;

//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

//   const paginatedLedger = filteredLedger.slice(
//     indexOfFirstRecord,
//     indexOfLastRecord,
//   );

//   const totalPages = Math.ceil(filteredLedger.length / recordsPerPage);

//   // ===================================================
//   // LOAD CLINICS
//   // ===================================================

//   useEffect(() => {
//     const loadClinics = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/clinics`, auth);

//         setClinics(res.data);

//         if (res.data.length > 0) {
//           const firstCity = res.data[0].city || "Default City";

//           setSelectedCity(firstCity);

//           const firstClinic = res.data.find(
//             (c) => (c.city || "Default City") === firstCity,
//           );

//           setSelectedClinic(firstClinic?._id);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     loadClinics();
//   }, []);

//   // ===================================================
//   // FETCH FINANCE DATA
//   // ===================================================

//   const fetchFinanceData = useCallback(async () => {
//     if (!selectedClinic) return;

//     setLoading(true);

//     try {
//       const res = await axios.get(`${BASE_URL}/finance/stats`, {
//         ...auth,

//         params: {
//           startDate: dates.start,
//           endDate: dates.end,
//           clinicId: selectedClinic,
//           t: Date.now(),
//         },
//       });

//       if (res.data) setData(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [dates, selectedClinic]);

//   useEffect(() => {
//     fetchFinanceData();
//   }, [fetchFinanceData]);

//   // ===================================================
//   // SAVE EXPENSE
//   // ===================================================

//   const handleSaveExpense = async (e) => {
//     e.preventDefault();

//     try {
//       await axios.post(
//         `${BASE_URL}/finance/expenses`,
//         {
//           ...expenseForm,
//           clinicId: selectedClinic,
//         },
//         auth,
//       );

//       setShowExpenseModal(false);

//       fetchFinanceData();

//       setExpenseForm({
//         title: "",
//         amount: "",
//         category: "Rent",
//         date: new Date().toISOString().split("T")[0],
//         paymentMode: "Cash",
//       });
//     } catch (err) {
//       alert("Failed to save expense");
//     }
//   };

//   // ===================================================
//   // CLINIC FILTERS
//   // ===================================================

//   const cities = [...new Set(clinics.map((c) => c.city || "Default City"))];

//   const clinicsInCity = clinics.filter(
//     (c) => (c.city || "Default City") === selectedCity,
//   );

//   // ===================================================
//   // UI
//   // ===================================================

//   return (
//     <div className="p-4 md:p-8 min-h-screen space-y-6">
//       {/* HEADER */}

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
//         <div>
//           <h2 className="text-xl font-semibold">Finances</h2>

//           <p className="text-sm text-slate-400">Manage Finances</p>
//         </div>
//       </div>

//       {/* FILTER BAR */}

//       <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
//         {/* CITY */}

//         <div className="md:col-span-2">
//           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
//             City
//           </label>

//           <select
//             value={selectedCity}
//             onChange={(e) => {
//               setSelectedCity(e.target.value);

//               const first = clinics.find(
//                 (c) => (c.city || "Default City") === e.target.value,
//               );

//               setSelectedClinic(first?._id);
//             }}
//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
//           >
//             {cities.map((city) => (
//               <option key={city} value={city}>
//                 {city}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* CLINIC */}

//         <div className="md:col-span-3">
//           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
//             Clinic Branch
//           </label>

//           <select
//             value={selectedClinic || ""}
//             onChange={(e) => setSelectedClinic(e.target.value)}
//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
//           >
//             {clinicsInCity.map((c) => (
//               <option key={c._id} value={c._id}>
//                 {c.name} - {c.location}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* DATE */}

//         <div className="md:col-span-4 flex gap-2">
//           <div className="flex-1">
//             <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
//               From
//             </label>

//             <input
//               type="date"
//               value={dates.start}
//               onChange={(e) =>
//                 setDates({
//                   ...dates,
//                   start: e.target.value,
//                 })
//               }
//               className="w-full border-slate-200 border rounded-xl p-2 text-sm bg-slate-50 outline-none"
//             />
//           </div>

//           <div className="flex-1">
//             <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
//               To
//             </label>

//             <input
//               type="date"
//               value={dates.end}
//               onChange={(e) =>
//                 setDates({
//                   ...dates,
//                   end: e.target.value,
//                 })
//               }
//               className="w-full border-slate-200 border rounded-xl p-2 text-sm bg-slate-50 outline-none"
//             />
//           </div>
//         </div>

//         {/* ADD EXPENSE */}

//         <div className="md:col-span-3">
//           <button
//             onClick={() => setShowExpenseModal(true)}
//             className="w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2"
//           >
//             <Plus size={18} />
//             Add Expense
//           </button>
//         </div>
//       </div>

//       {/* LOADER */}

//       {loading ? (
//         <div className="h-64 flex flex-col items-center justify-center">
//           <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin"></div>
//         </div>
//       ) : (
//         <>
//           {/* STAT CARDS */}

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <StatCard
//               title="Total Sales"
//               value={data?.summary?.totalSales || 0}
//               icon={<ChartLine size={24} />}
//               color="indigo"
//             />

//             <StatCard
//               title="Total Expenses"
//               value={data?.totalExpenses || 0}
//               icon={<TrendingDown size={24} />}
//               color="rose"
//             />

//             {/* ONLINE COLLECTION */}

//   <StatCard
//     title="Online Collection"
//     value={data?.summary?.upiSales || 0}
//     icon={<Smartphone size={24} />}
//     color="blue"
//   />

//   {/* CASH COLLECTION */}

//   <StatCard
//     title="Cash Collection"
//     value={data?.summary?.cashSales || 0}
//     icon={<Wallet size={24} />}
//     color="amber"
//   />

//             {/* <StatCard
//               title="Inventory Purchase"
//               value={data?.inventoryPurchaseTotal || 0}
//               icon={<Package size={24} />}
//               color="blue"
//             /> */}

//             <StatCard
//               title="Net Profit"
//               value={
//                 (data?.summary?.totalSales || 0) -
//                 (data?.totalExpenses || 0) -
//                 (data?.inventoryPurchaseTotal || 0)
//               }
//               icon={<TrendingUp size={24} />}
//               color="emerald"
//             />
//           </div>

//           {/* REVENUE */}

//           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">
//             <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
//               Revenue Breakdown
//             </h3>

//             <ProgressRow
//               label="Panchkarma"
//               val={data?.summary?.therapy || 0}
//               total={data?.summary?.totalSales || 0}
//               color="bg-teal-500"
//             />

//             <ProgressRow
//               label="Consultation"
//               val={data?.summary?.consultation || 0}
//               total={data?.summary?.totalSales || 0}
//               color="bg-blue-500"
//             />

//             <ProgressRow
//               label="Medicines"
//               val={data?.summary?.medicines || 0}
//               total={data?.summary?.totalSales || 0}
//               color="bg-orange-500"
//             />
//           </div>

//           {/* LEDGER */}

//           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
//             <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
//               <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
//                 Transaction Ledger
//               </h3>

//               {/* FILTERS */}

//               <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
//                 {["all", "sales", "expenses", ].map((f) => (
//                   <button
//                     key={f}
//                     onClick={() => {
//                       setLedgerFilter(f);
//                       setCurrentPage(1);
//                     }}
//                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
//                       ledgerFilter === f
//                         ? "bg-teal-600 text-white shadow-md"
//                         : "text-slate-400 hover:text-slate-600"
//                     }`}
//                   >
//                     {f}
//                   </button>
//                 ))}
//               </div>

//             </div>

//             {/* TABLE */}

//             <div className="max-h-[500px] overflow-y-auto">
//               <table className="w-full text-left">
//                 <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
//                   <tr>
//                     <th className="p-5">Type / Ref</th>

//                     <th className="p-5">Description</th>

//                     <th className="p-5 text-right">Amount</th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {filteredLedger.length > 0 ? (
//                     paginatedLedger.map((item, idx) => (
//                       <tr
//                         key={item._id || idx}
//                         className="hover:bg-slate-50 transition"
//                       >
//                         {/* TYPE */}

//                         <td className="p-5">
//                           {item.type === "IN" ? (
//                             <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-1 rounded-full font-black">
//                               STOCK IN
//                             </span>
//                           ) : item.invoiceId ? (
//                             <span className="font-mono text-teal-600 font-bold">
//                               {item.invoiceId}
//                             </span>
//                           ) : (
//                             <span className="bg-rose-100 text-rose-600 text-[9px] px-2 py-1 rounded-full font-black">
//                               EXPENSE
//                             </span>
//                           )}
//                         </td>

//                         {/* DESCRIPTION */}

//                         <td className="p-5">
//                           <p className="font-semibold text-slate-700">
//                             {item.patientName ||
//                               item.title ||
//                               item.medicineName}
//                           </p>

//                           <p className="text-[10px] text-slate-400 uppercase">
//                             {item.paymentMethod || item.paymentMode}

//                             {" • "}

//                             {new Date(
//                               item.createdAt || item.date,
//                             ).toLocaleDateString()}
//                           </p>
//                         </td>

//                         {/* AMOUNT */}

//                         <td
//                           className={`p-5 text-right font-black ${
//                             item.invoiceId
//                               ? "text-slate-900"
//                               : item.type === "IN"
//                                 ? "text-blue-700"
//                                 : "text-rose-600"
//                           }`}
//                         >
//                           {item.invoiceId ? "" : "- "}₹
//                           {(
//                             item.totalAmount ||
//                             item.amount ||
//                             item.quantity * item.purchasePrice
//                           ).toLocaleString()}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan="3"
//                         className="p-10 text-center text-slate-400"
//                       >
//                         No records found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* PAGINATION */}

//             {totalPages > 1 && (
//               <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
//                 <p className="text-xs text-slate-400 font-medium">
//                   Page {currentPage} of {totalPages}
//                 </p>

//                 <div className="flex gap-2">
//                   <button
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage((p) => p - 1)}
//                     className="px-3 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-40 hover:bg-slate-50"
//                   >
//                     Prev
//                   </button>

//                   {[...Array(totalPages)].map((_, i) => (
//                     <button
//                       key={i}
//                       onClick={() => setCurrentPage(i + 1)}
//                       className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
//                         currentPage === i + 1
//                           ? "bg-teal-600 text-white border-teal-600"
//                           : "hover:bg-slate-50"
//                       }`}
//                     >
//                       {i + 1}
//                     </button>
//                   ))}

//                   <button
//                     disabled={currentPage === totalPages}
//                     onClick={() => setCurrentPage((p) => p + 1)}
//                     className="px-3 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-40 hover:bg-slate-50"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* EXPENSE MODAL */}

//       {showExpenseModal && (
//         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
//             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//               <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">
//                 New Expense
//               </h3>

//               <button onClick={() => setShowExpenseModal(false)}>
//                 <X size={20} />
//               </button>
//             </div>

//             <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
//               <input
//                 required
//                 type="text"
//                 placeholder="Expense Title"
//                 className="w-full border border-slate-200 rounded-xl p-3 text-sm"
//                 value={expenseForm.title}
//                 onChange={(e) =>
//                   setExpenseForm({
//                     ...expenseForm,
//                     title: e.target.value,
//                   })
//                 }
//               />

//               <div className="grid grid-cols-2 gap-4">
//                 <input
//                   required
//                   type="number"
//                   placeholder="Amount ₹"
//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm"
//                   value={expenseForm.amount}
//                   onChange={(e) =>
//                     setExpenseForm({
//                       ...expenseForm,
//                       amount: e.target.value,
//                     })
//                   }
//                 />

//                 <select
//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm"
//                   value={expenseForm.category}
//                   onChange={(e) =>
//                     setExpenseForm({
//                       ...expenseForm,
//                       category: e.target.value,
//                     })
//                   }
//                 >
//                   {[
//                     "Rent",
//                     "Salaries",
//                     "Electricity",
//                     "Water",
//                     "Maintenance",
//                     "Supplies",
//                     "Other",
//                   ].map((opt) => (
//                     <option key={opt}>{opt}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <input
//                   type="date"
//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm"
//                   value={expenseForm.date}
//                   onChange={(e) =>
//                     setExpenseForm({
//                       ...expenseForm,
//                       date: e.target.value,
//                     })
//                   }
//                 />

//                 <select
//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm"
//                   value={expenseForm.paymentMode}
//                   onChange={(e) =>
//                     setExpenseForm({
//                       ...expenseForm,
//                       paymentMode: e.target.value,
//                     })
//                   }
//                 >
//                   {["Cash", "UPI", "Bank Transfer"].map((opt) => (
//                     <option key={opt}>{opt}</option>
//                   ))}
//                 </select>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl mt-4 hover:bg-rose-600 transition uppercase tracking-widest text-xs"
//               >
//                 Save Expense
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ===================================================
// // STAT CARD
// // ===================================================

// const StatCard = ({ title, value, icon, color }) => {
//   const styles = {
//     emerald: "bg-emerald-50 text-emerald-600",
//     rose: "bg-rose-50 text-rose-600",
//     blue: "bg-blue-50 text-blue-600",
//     teal: "bg-teal-50 text-teal-600",
//     indigo: "bg-indigo-50 text-indigo-600",
//     amber: "bg-amber-50 text-amber-600",
//     purple: "bg-purple-50 text-purple-600",
//   };

//   return (
//     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
//       <div className={`p-4 rounded-2xl ${styles[color]}`}>{icon}</div>

//       <div>
//         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
//           {title}
//         </p>

//         <h2 className="text-2xl font-black text-slate-800">
//           ₹{(value || 0).toLocaleString()}
//         </h2>
//       </div>
//     </div>
//   );
// };

// // ===================================================
// // PROGRESS ROW
// // ===================================================

// const ProgressRow = ({ label, val, total, color }) => (
//   <div>
//     <div className="flex justify-between text-[11px] mb-2 font-bold text-slate-500 uppercase">
//       <span>{label}</span>

//       <span className="text-slate-800 font-black">
//         ₹{(val || 0).toLocaleString()}
//       </span>
//     </div>

//     <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
//       <div
//         className={`h-full rounded-full ${color} transition-all duration-1000`}
//         style={{
//           width: `${total > 0 ? (val / total) * 100 : 0}%`,
//         }}
//       ></div>
//     </div>
//   </div>
// );

// import React, { useState, useEffect, useCallback } from "react";

// import axios from "axios";

// import { TrendingUp, Wallet, Package, Plus, X , Smartphone , ChartLine, TrendingDown } from "lucide-react";

// export default function Finances() {

//   const [data, setData] = useState({

//     summary: {

//       totalSales: 0,

//       consultation: 0,

//       medicines: 0,

//       therapy: 0,

//       upiSales: 0,

//       cashSales: 0,

//     },

//     totalExpenses: 0,

//     inventoryPurchaseTotal: 0,

//     history: [],

//   });

//   const [loading, setLoading] = useState(true);

//   const [clinics, setClinics] = useState([]);

//   const [showExpenseModal, setShowExpenseModal] = useState(false);

//   // Ledger filters are independent dimensions:
//   // - sales / expenses control TRANSACTION TYPE
//   // - cash / upi control PAYMENT METHOD
//   // If neither type filter is selected, both Sales + Expenses are shown.
//   // If neither payment filter is selected, both Cash + UPI (and other methods) are shown.
//   const [ledgerFilters, setLedgerFilters] = useState({
//     sales: false,
//     expenses: false,
//     cash: false,
//     upi: false,
//   });

//   const [currentPage, setCurrentPage] = useState(1);

//   const recordsPerPage = 10;

//   const [selectedCity, setSelectedCity] = useState("");

//   const [selectedClinic, setSelectedClinic] = useState(null);

//   const [dates, setDates] = useState({

//     start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)

//       .toISOString()

//       .split("T")[0],

//     end: new Date().toISOString().split("T")[0],

//   });

//   const [expenseForm, setExpenseForm] = useState({

//     title: "",

//     amount: "",

//     category: "Rent",

//     date: new Date().toISOString().split("T")[0],

//     paymentMode: "Cash",

//   });

//   const BASE_URL = "https://dms-backend-amber.vercel.app/api";

//   const auth = {

//     headers: {

//       Authorization: `Bearer ${localStorage.getItem("token")}`,

//     },

//   };

//   // ===================================================

//   // FILTER LEDGER

//   // ===================================================

//   const filteredLedger = data.history.filter((item) => {
//     // Inventory stock-in entries are not part of the payment ledger.
//     if (item.type === "IN") return false;

//     const isSale = Boolean(item.invoiceId);
//     const isExpense = !isSale;

//     // Bills use paymentMethod; expenses use paymentMode.
//     const paymentMethod = String(
//       item.paymentMethod || item.paymentMode || ""
//     )
//       .trim()
//       .toLowerCase();

//     const isCash = paymentMethod === "cash";
//     const isUPI = ["upi", "online"].includes(paymentMethod);

//     // ---------------------------------------------------
//     // TRANSACTION TYPE FILTER
//     // ---------------------------------------------------
//     // No Sales/Expenses selected = ALL transaction types.
//     const hasTypeFilter =
//       ledgerFilters.sales || ledgerFilters.expenses;

//     const typeAllowed = !hasTypeFilter
//       ? isSale || isExpense
//       : (ledgerFilters.sales && isSale) ||
//         (ledgerFilters.expenses && isExpense);

//     if (!typeAllowed) return false;

//     // ---------------------------------------------------
//     // PAYMENT METHOD FILTER
//     // ---------------------------------------------------
//     // No Cash/UPI selected = ALL payment methods.
//     const hasPaymentFilter =
//       ledgerFilters.cash || ledgerFilters.upi;

//     if (!hasPaymentFilter) {
//       return true;
//     }

//     // Cash selected -> only Cash transactions.
//     if (ledgerFilters.cash && isCash) {
//       return true;
//     }

//     // UPI selected -> only UPI/Online transactions.
//     if (ledgerFilters.upi && isUPI) {
//       return true;
//     }

//     return false;
//   });

//   // ===================================================

//   // PAGINATION

//   // ===================================================

//   const indexOfLastRecord = currentPage * recordsPerPage;

//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

//   const paginatedLedger = filteredLedger.slice(

//     indexOfFirstRecord,

//     indexOfLastRecord,

//   );

//   const totalPages = Math.ceil(filteredLedger.length / recordsPerPage);

//   // ===================================================

//   // LOAD CLINICS

//   // ===================================================

//   useEffect(() => {

//     const loadClinics = async () => {

//       try {

//         const res = await axios.get(`${BASE_URL}/clinics`, auth);

//         setClinics(res.data);

//         if (res.data.length > 0) {

//           const firstCity = res.data[0].city || "Default City";

//           setSelectedCity(firstCity);

//           const firstClinic = res.data.find(

//             (c) => (c.city || "Default City") === firstCity,

//           );

//           setSelectedClinic(firstClinic?._id);

//         }

//       } catch (err) {

//         console.error(err);

//       }

//     };

//     loadClinics();

//   }, []);

//   // ===================================================

//   // FETCH FINANCE DATA

//   // ===================================================

//   const fetchFinanceData = useCallback(async () => {

//     if (!selectedClinic) return;

//     setLoading(true);

//     try {

//       const res = await axios.get(`${BASE_URL}/finance/stats`, {

//         ...auth,

//         params: {

//           startDate: dates.start,

//           endDate: dates.end,

//           clinicId: selectedClinic,

//           t: Date.now(),

//         },

//       });

//       if (res.data) setData(res.data);

//     } catch (err) {

//       console.error(err);

//     } finally {

//       setLoading(false);

//     }

//   }, [dates, selectedClinic]);

//   useEffect(() => {

//     fetchFinanceData();

//   }, [fetchFinanceData]);

//   // ===================================================

//   // SAVE EXPENSE

//   // ===================================================

//   const handleSaveExpense = async (e) => {

//     e.preventDefault();

//     try {

//       await axios.post(

//         `${BASE_URL}/finance/expenses`,

//         {

//           ...expenseForm,

//           clinicId: selectedClinic,

//         },

//         auth,

//       );

//       setShowExpenseModal(false);

//       fetchFinanceData();

//       setExpenseForm({

//         title: "",

//         amount: "",

//         category: "Rent",

//         date: new Date().toISOString().split("T")[0],

//         paymentMode: "Cash",

//       });

//     } catch (err) {

//       alert("Failed to save expense");

//     }

//   };

//   // ===================================================

//   // CLINIC FILTERS

//   // ===================================================

//   const cities = [...new Set(clinics.map((c) => c.city || "Default City"))];

//   const clinicsInCity = clinics.filter(

//     (c) => (c.city || "Default City") === selectedCity,

//   );

//   // ===================================================

//   // UI

//   // ===================================================

//   return (

//     <div className="p-4 md:p-8 min-h-screen space-y-6">

//       {/* HEADER */}

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">

//         <div>

//           <h2 className="text-xl font-semibold">Finances</h2>

//           <p className="text-sm text-slate-400">Manage Finances</p>

//         </div>

//       </div>

//       {/* FILTER BAR */}

//       <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

//         {/* CITY */}

//         <div className="md:col-span-2">

//           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">

//             City

//           </label>

//           <select

//             value={selectedCity}

//             onChange={(e) => {

//               setSelectedCity(e.target.value);

//               const first = clinics.find(

//                 (c) => (c.city || "Default City") === e.target.value,

//               );

//               setSelectedClinic(first?._id);

//             }}

//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"

//           >

//             {cities.map((city) => (

//               <option key={city} value={city}>

//                 {city}

//               </option>

//             ))}

//           </select>

//         </div>

//         {/* CLINIC */}

//         <div className="md:col-span-3">

//           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">

//             Clinic Branch

//           </label>

//           <select

//             value={selectedClinic || ""}

//             onChange={(e) => setSelectedClinic(e.target.value)}

//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"

//           >

//             {clinicsInCity.map((c) => (

//               <option key={c._id} value={c._id}>

//                 {c.name} - {c.location}

//               </option>

//             ))}

//           </select>

//         </div>

//         {/* DATE */}

//         <div className="md:col-span-4 flex gap-2">

//           <div className="flex-1">

//             <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">

//               From

//             </label>

//             <input

//               type="date"

//               value={dates.start}

//               onChange={(e) =>

//                 setDates({

//                   ...dates,

//                   start: e.target.value,

//                 })

//               }

//               className="w-full border-slate-200 border rounded-xl p-2 text-sm bg-slate-50 outline-none"

//             />

//           </div>

//           <div className="flex-1">

//             <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">

//               To

//             </label>

//             <input

//               type="date"

//               value={dates.end}

//               onChange={(e) =>

//                 setDates({

//                   ...dates,

//                   end: e.target.value,

//                 })

//               }

//               className="w-full border-slate-200 border rounded-xl p-2 text-sm bg-slate-50 outline-none"

//             />

//           </div>

//         </div>

//         {/* ADD EXPENSE */}

//         <div className="md:col-span-3">

//           <button

//             onClick={() => setShowExpenseModal(true)}

//             className="w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2"

//           >

//             <Plus size={18} />

//             Add Expense

//           </button>

//         </div>

//       </div>

//       {/* LOADER */}

//       {loading ? (

//         <div className="h-64 flex flex-col items-center justify-center">

//           <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin"></div>

//         </div>

//       ) : (

//         <>

//           {/* STAT CARDS */}

//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">

//             <StatCard

//               title="Total Sales"

//               value={data?.summary?.totalSales || 0}

//               icon={<ChartLine size={24} />}

//               color="indigo"

//             />

//             <StatCard

//               title="Total Expenses"

//               value={data?.totalExpenses || 0}

//               icon={<TrendingDown size={24} />}

//               color="rose"

//             />

//             {/* ONLINE COLLECTION */}

//   <StatCard

//     title="Online Collection"

//     value={data?.summary?.upiSales || 0}

//     icon={<Smartphone size={24} />}

//     color="blue"

//   />

//   {/* CASH COLLECTION */}

//   <StatCard

//     title="Cash Collection"

//     value={data?.summary?.cashSales || 0}

//     icon={<Wallet size={24} />}

//     color="amber"

//   />

//             {/* <StatCard

//               title="Inventory Purchase"

//               value={data?.inventoryPurchaseTotal || 0}

//               icon={<Package size={24} />}

//               color="blue"

//             /> */}

//             <StatCard

//               title="Net Profit"

//               value={

//                 (data?.summary?.totalSales || 0) -

//                 (data?.totalExpenses || 0) -

//                 (data?.inventoryPurchaseTotal || 0)

//               }

//               icon={<TrendingUp size={24} />}

//               color="emerald"

//             />

//           </div>

//           {/* REVENUE */}

//           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">

//             <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">

//               Revenue Breakdown

//             </h3>

//             <ProgressRow

//               label="Panchkarma"

//               val={data?.summary?.therapy || 0}

//               total={data?.summary?.totalSales || 0}

//               color="bg-teal-500"

//             />

//             <ProgressRow

//               label="Consultation"

//               val={data?.summary?.consultation || 0}

//               total={data?.summary?.totalSales || 0}

//               color="bg-blue-500"

//             />

//             <ProgressRow

//               label="Medicines"

//               val={data?.summary?.medicines || 0}

//               total={data?.summary?.totalSales || 0}

//               color="bg-orange-500"

//             />

//             {/* <ProgressRow

//               label="Online Collection"

//               val={data?.summary?.upiSales || 0}

//               total={data?.summary?.totalSales || 0}

//               color="bg-blue-500"

//             /> */}

//             {/* <ProgressRow

//               label="Cash Collection"

//               val={data?.summary?.cashSales || 0}

//               total={data?.summary?.totalSales || 0}

//               color="bg-emerald-500"

//             /> */}

//           </div>

//           {/* LEDGER */}

//           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

//             <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">

//               <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">

//                 Transaction Ledger

//               </h3>

//               {/* FILTERS */}

//               <div className="flex bg-white border border-slate-200 p-1 rounded-xl flex-wrap gap-1">

//                 {/* ALL / RESET */}
//                 <button
//                   onClick={() => {
//                     setLedgerFilters({
//                       sales: false,
//                       expenses: false,
//                       cash: false,
//                       upi: false,
//                     });
//                     setCurrentPage(1);
//                   }}
//                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
//                     !ledgerFilters.sales &&
//                     !ledgerFilters.expenses &&
//                     !ledgerFilters.cash &&
//                     !ledgerFilters.upi
//                       ? "bg-teal-600 text-white shadow-md"
//                       : "text-slate-400 hover:text-slate-600"
//                   }`}
//                 >
//                   All
//                 </button>

//                 {/* SALES TYPE FILTER */}
//                 <button
//                   onClick={() => {
//                     setLedgerFilters((prev) => ({
//                       ...prev,
//                       sales: !prev.sales,
//                     }));
//                     setCurrentPage(1);
//                   }}
//                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
//                     ledgerFilters.sales
//                       ? "bg-teal-600 text-white shadow-md"
//                       : "text-slate-400 hover:text-slate-600"
//                   }`}
//                 >
//                   Sales
//                 </button>

//                 {/* EXPENSE TYPE FILTER */}
//                 <button
//                   onClick={() => {
//                     setLedgerFilters((prev) => ({
//                       ...prev,
//                       expenses: !prev.expenses,
//                     }));
//                     setCurrentPage(1);
//                   }}
//                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
//                     ledgerFilters.expenses
//                       ? "bg-rose-600 text-white shadow-md"
//                       : "text-slate-400 hover:text-slate-600"
//                   }`}
//                 >
//                   Expense
//                 </button>

//               </div>

//               <div className="flex bg-white border border-slate-200 p-1 rounded-xl flex-wrap gap-1">
//                 {/* CASH PAYMENT FILTER */}
//                 <button
//                   onClick={() => {
//                     setLedgerFilters((prev) => ({
//                       ...prev,
//                       cash: !prev.cash,
//                     }));
//                     setCurrentPage(1);
//                   }}
//                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
//                     ledgerFilters.cash
//                       ? "bg-emerald-600 text-white shadow-md"
//                       : "text-slate-400 hover:text-slate-600"
//                   }`}
//                 >
//                   Cash
//                 </button>

//                 {/* UPI PAYMENT FILTER */}
//                 <button
//                   onClick={() => {
//                     setLedgerFilters((prev) => ({
//                       ...prev,
//                       upi: !prev.upi,
//                     }));
//                     setCurrentPage(1);
//                   }}
//                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
//                     ledgerFilters.upi
//                       ? "bg-blue-600 text-white shadow-md"
//                       : "text-slate-400 hover:text-slate-600"
//                   }`}
//                 >
//                   UPI
//                 </button>

//               </div>

//             </div>

//             {/* TABLE */}

//             <div className="max-h-[500px] overflow-y-auto">

//               <table className="w-full text-left">

//                 <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">

//                   <tr>

//                     <th className="p-5">Type / Ref</th>

//                     <th className="p-5">Description</th>

//                     <th className="p-5 text-right">Amount</th>

//                   </tr>

//                 </thead>

//                 <tbody className="divide-y divide-slate-100 text-sm">

//                   {filteredLedger.length > 0 ? (

//                     paginatedLedger.map((item, idx) => (

//                       <tr

//                         key={item._id || idx}

//                         className="hover:bg-slate-50 transition"

//                       >

//                         {/* TYPE */}

//                         <td className="p-5">

//                           {item.type === "IN" ? (

//                             <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-1 rounded-full font-black">

//                               STOCK IN

//                             </span>

//                           ) : item.invoiceId ? (

//                             <span className="font-mono text-teal-600 font-bold">

//                               {item.invoiceId}

//                             </span>

//                           ) : (

//                             <span className="bg-rose-100 text-rose-600 text-[9px] px-2 py-1 rounded-full font-black">

//                               EXPENSE

//                             </span>

//                           )}

//                         </td>

//                         {/* DESCRIPTION */}

//                         <td className="p-5">

//                           <p className="font-semibold text-slate-700">

//                             {item.patientName ||

//                               item.title ||

//                               item.medicineName}

//                           </p>

//                           <p className="text-[10px] text-slate-400 uppercase">

//                             {item.paymentMethod || item.paymentMode}

//                             {" • "}

//                             {new Date(

//                               item.createdAt || item.date,

//                             ).toLocaleDateString()}

//                           </p>

//                         </td>

//                         {/* AMOUNT */}

//                         <td

//                           className={`p-5 text-right font-black ${

//                             item.invoiceId

//                               ? "text-slate-900"

//                               : item.type === "IN"

//                                 ? "text-blue-700"

//                                 : "text-rose-600"

//                           }`}

//                         >

//                           {item.invoiceId ? "" : "- "}₹

//                           {(

//                             item.totalAmount ||

//                             item.amount ||

//                             item.quantity * item.purchasePrice

//                           ).toLocaleString()}

//                         </td>

//                       </tr>

//                     ))

//                   ) : (

//                     <tr>

//                       <td

//                         colSpan="3"

//                         className="p-10 text-center text-slate-400"

//                       >

//                         No records found

//                       </td>

//                     </tr>

//                   )}

//                 </tbody>

//               </table>

//             </div>

//             {/* PAGINATION */}

//             {totalPages > 1 && (

//               <div className="flex items-center justify-between px-6 py-4 bg-white border-t">

//                 <p className="text-xs text-slate-400 font-medium">

//                   Page {currentPage} of {totalPages}

//                 </p>

//                 <div className="flex gap-2">

//                   <button

//                     disabled={currentPage === 1}

//                     onClick={() => setCurrentPage((p) => p - 1)}

//                     className="px-3 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-40 hover:bg-slate-50"

//                   >

//                     Prev

//                   </button>

//                   {[...Array(totalPages)].map((_, i) => (

//                     <button

//                       key={i}

//                       onClick={() => setCurrentPage(i + 1)}

//                       className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${

//                         currentPage === i + 1

//                           ? "bg-teal-600 text-white border-teal-600"

//                           : "hover:bg-slate-50"

//                       }`}

//                     >

//                       {i + 1}

//                     </button>

//                   ))}

//                   <button

//                     disabled={currentPage === totalPages}

//                     onClick={() => setCurrentPage((p) => p + 1)}

//                     className="px-3 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-40 hover:bg-slate-50"

//                   >

//                     Next

//                   </button>

//                 </div>

//               </div>

//             )}

//           </div>

//         </>

//       )}

//       {/* EXPENSE MODAL */}

//       {showExpenseModal && (

//         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

//           <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">

//             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">

//               <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">

//                 New Expense

//               </h3>

//               <button onClick={() => setShowExpenseModal(false)}>

//                 <X size={20} />

//               </button>

//             </div>

//             <form onSubmit={handleSaveExpense} className="p-6 space-y-4">

//               <input

//                 required

//                 type="text"

//                 placeholder="Expense Title"

//                 className="w-full border border-slate-200 rounded-xl p-3 text-sm"

//                 value={expenseForm.title}

//                 onChange={(e) =>

//                   setExpenseForm({

//                     ...expenseForm,

//                     title: e.target.value,

//                   })

//                 }

//               />

//               <div className="grid grid-cols-2 gap-4">

//                 <input

//                   required

//                   type="number"

//                   placeholder="Amount ₹"

//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm"

//                   value={expenseForm.amount}

//                   onChange={(e) =>

//                     setExpenseForm({

//                       ...expenseForm,

//                       amount: e.target.value,

//                     })

//                   }

//                 />

//                 <select

//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm"

//                   value={expenseForm.category}

//                   onChange={(e) =>

//                     setExpenseForm({

//                       ...expenseForm,

//                       category: e.target.value,

//                     })

//                   }

//                 >

//                   {[

//                     "Rent",

//                     "Salaries",

//                     "Electricity",

//                     "Water",

//                     "Maintenance",

//                     "Supplies",

//                     "Other",

//                   ].map((opt) => (

//                     <option key={opt}>{opt}</option>

//                   ))}

//                 </select>

//               </div>

//               <div className="grid grid-cols-2 gap-4">

//                 <input

//                   type="date"

//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm"

//                   value={expenseForm.date}

//                   onChange={(e) =>

//                     setExpenseForm({

//                       ...expenseForm,

//                       date: e.target.value,

//                     })

//                   }

//                 />

//                 <select

//                   className="w-full border border-slate-200 rounded-xl p-3 text-sm"

//                   value={expenseForm.paymentMode}

//                   onChange={(e) =>

//                     setExpenseForm({

//                       ...expenseForm,

//                       paymentMode: e.target.value,

//                     })

//                   }

//                 >

//                   {["Cash", "UPI", "Bank Transfer"].map((opt) => (

//                     <option key={opt}>{opt}</option>

//                   ))}

//                 </select>

//               </div>

//               <button

//                 type="submit"

//                 className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl mt-4 hover:bg-rose-600 transition uppercase tracking-widest text-xs"

//               >

//                 Save Expense

//               </button>

//             </form>

//           </div>

//         </div>

//       )}

//     </div>

//   );

// }

// // ===================================================

// // STAT CARD

// // ===================================================

// const StatCard = ({ title, value, icon, color }) => {

//   const styles = {

//     emerald: "bg-emerald-50 text-emerald-600",

//     rose: "bg-rose-50 text-rose-600",

//     blue: "bg-blue-50 text-blue-600",

//     teal: "bg-teal-50 text-teal-600",

//     indigo: "bg-indigo-50 text-indigo-600",

//     amber: "bg-amber-50 text-amber-600",

//     purple: "bg-purple-50 text-purple-600",

//   };

//   return (

//     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">

//       <div className={`p-4 rounded-2xl ${styles[color]}`}>{icon}</div>

//       <div>

//         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">

//           {title}

//         </p>

//         <h2 className="text-2xl font-black text-slate-800">

//           ₹{(value || 0).toLocaleString()}

//         </h2>

//       </div>

//     </div>

//   );

// };

// // ===================================================

// // PROGRESS ROW

// // ===================================================

// const ProgressRow = ({ label, val, total, color }) => (

//   <div>

//     <div className="flex justify-between text-[11px] mb-2 font-bold text-slate-500 uppercase">

//       <span>{label}</span>

//       <span className="text-slate-800 font-black">

//         ₹{(val || 0).toLocaleString()}

//       </span>

//     </div>

//     <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">

//       <div

//         className={`h-full rounded-full ${color} transition-all duration-1000`}

//         style={{

//           width: `${total > 0 ? (val / total) * 100 : 0}%`,

//         }}

//       ></div>

//     </div>

//   </div>

// );

import React, { useState, useEffect, useCallback } from "react";

import axios from "axios";

import {
  TrendingUp,
  Wallet,
  Package,
  Plus,
  X,
  Smartphone,
  ChartLine,
  TrendingDown,
} from "lucide-react";

export default function Finances() {
  const [data, setData] = useState({
    summary: {
      totalSales: 0,

      consultation: 0,

      medicines: 0,

      therapy: 0,

      upiSales: 0,

      cashSales: 0,
    },

    totalExpenses: 0,

    inventoryPurchaseTotal: 0,

    history: [],
  });

  const [loading, setLoading] = useState(true);

  const [clinics, setClinics] = useState([]);

  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Ledger filters: one selection from each group.
  // Transaction type: all / sales / expense
  // Payment method: all / cash / upi
  const [ledgerFilters, setLedgerFilters] = useState({
    type: "all",
    payment: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  const [selectedCity, setSelectedCity] = useState("");

  const [selectedClinic, setSelectedClinic] = useState(null);

  const [dates, setDates] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)

      .toISOString()

      .split("T")[0],

    end: new Date().toISOString().split("T")[0],
  });

  const [expenseForm, setExpenseForm] = useState({
    title: "",

    amount: "",

    category: "Rent",

    date: new Date().toISOString().split("T")[0],

    paymentMode: "Cash",
  });

  const BASE_URL = "https://dms-backend-amber.vercel.app/api";

  const auth = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  // ===================================================

  // FILTER LEDGER

  // ===================================================

  const filteredLedger = data.history.filter((item) => {
    // Stock-in transactions are not part of the transaction ledger.
    if (item.type === "IN") return false;

    const isSale = Boolean(item.invoiceId);
    const isExpense = !isSale;

    const paymentMethod = String(item.paymentMethod || item.paymentMode || "")
      .trim()
      .toLowerCase();

    const isCash = paymentMethod === "cash";
    const isUPI = ["upi", "online"].includes(paymentMethod);

    // Transaction type: exactly one of All / Sales / Expense.
    let typeAllowed = true;

    if (ledgerFilters.type === "sales") {
      typeAllowed = isSale;
    } else if (ledgerFilters.type === "expense") {
      typeAllowed = isExpense;
    }

    // Payment method: exactly one of All / Cash / UPI.
    let paymentAllowed = true;

    if (ledgerFilters.payment === "cash") {
      paymentAllowed = isCash;
    } else if (ledgerFilters.payment === "upi") {
      paymentAllowed = isUPI;
    }

    // Both dimensions must match.
    return typeAllowed && paymentAllowed;
  });

  // ===================================================

  // PAGINATION

  // ===================================================

  const indexOfLastRecord = currentPage * recordsPerPage;

  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const paginatedLedger = filteredLedger.slice(
    indexOfFirstRecord,

    indexOfLastRecord,
  );

  const totalPages = Math.ceil(filteredLedger.length / recordsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ===================================================

  // LOAD CLINICS

  // ===================================================

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/clinics`, auth);

        setClinics(res.data);

        if (res.data.length > 0) {
          const firstCity = res.data[0].city || "Default City";

          setSelectedCity(firstCity);

          const firstClinic = res.data.find(
            (c) => (c.city || "Default City") === firstCity,
          );

          setSelectedClinic(firstClinic?._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadClinics();
  }, []);

  // ===================================================

  // FETCH FINANCE DATA

  // ===================================================

  const fetchFinanceData = useCallback(async () => {
    if (!selectedClinic) return;

    setLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/finance/stats`, {
        ...auth,

        params: {
          startDate: dates.start,

          endDate: dates.end,

          clinicId: selectedClinic,

          t: Date.now(),
        },
      });

      if (res.data) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dates, selectedClinic]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  // ===================================================

  // SAVE EXPENSE

  // ===================================================

  const handleSaveExpense = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${BASE_URL}/finance/expenses`,

        {
          ...expenseForm,

          clinicId: selectedClinic,
        },

        auth,
      );

      setShowExpenseModal(false);

      fetchFinanceData();

      setExpenseForm({
        title: "",

        amount: "",

        category: "Rent",

        date: new Date().toISOString().split("T")[0],

        paymentMode: "Cash",
      });
    } catch (err) {
      alert("Failed to save expense");
    }
  };

  // ===================================================

  // CLINIC FILTERS

  // ===================================================

  const cities = [...new Set(clinics.map((c) => c.city || "Default City"))];

  const clinicsInCity = clinics.filter(
    (c) => (c.city || "Default City") === selectedCity,
  );

  // ===================================================

  // UI

  // ===================================================

  return (
    <div className="p-4 md:p-8 min-h-screen space-y-6">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Finances</h2>

          <p className="text-sm text-slate-400">Manage Finances</p>
        </div>
      </div>

      {/* FILTER BAR */}

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* CITY */}

        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
            City
          </label>

          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);

              const first = clinics.find(
                (c) => (c.city || "Default City") === e.target.value,
              );

              setSelectedClinic(first?._id);
            }}
            className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* CLINIC */}

        <div className="md:col-span-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
            Clinic Branch
          </label>

          <select
            value={selectedClinic || ""}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
          >
            {clinicsInCity.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} - {c.location}
              </option>
            ))}
          </select>
        </div>

        {/* DATE */}

        <div className="md:col-span-4 flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              From
            </label>

            <input
              type="date"
              value={dates.start}
              onChange={(e) =>
                setDates({
                  ...dates,

                  start: e.target.value,
                })
              }
              className="w-full border-slate-200 border rounded-xl p-2 text-sm bg-slate-50 outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              To
            </label>

            <input
              type="date"
              value={dates.end}
              onChange={(e) =>
                setDates({
                  ...dates,

                  end: e.target.value,
                })
              }
              className="w-full border-slate-200 border rounded-xl p-2 text-sm bg-slate-50 outline-none"
            />
          </div>
        </div>

        {/* ADD EXPENSE */}

        <div className="md:col-span-3">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* LOADER */}

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* STAT CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatCard
              title="Total Sales"
              value={data?.summary?.totalSales || 0}
              icon={<ChartLine size={24} />}
              color="indigo"
            />

            <StatCard
              title="Total Expenses"
              value={data?.totalExpenses || 0}
              icon={<TrendingDown size={24} />}
              color="rose"
            />

            {/* ONLINE COLLECTION */}

            <StatCard
              title="Online Collection"
              value={data?.summary?.upiSales || 0}
              icon={<Smartphone size={24} />}
              color="blue"
            />

            {/* CASH COLLECTION */}

            <StatCard
              title="Cash Collection"
              value={data?.summary?.cashSales || 0}
              icon={<Wallet size={24} />}
              color="amber"
            />

            {/* <StatCard

              title="Inventory Purchase"

              value={data?.inventoryPurchaseTotal || 0}

              icon={<Package size={24} />}

              color="blue"

            /> */}

            <StatCard
              title="Net Profit"
              value={
                (data?.summary?.totalSales || 0) -
                (data?.totalExpenses || 0) -
                (data?.inventoryPurchaseTotal || 0)
              }
              icon={<TrendingUp size={24} />}
              color="emerald"
            />
          </div>

          {/* REVENUE */}

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Revenue Breakdown
            </h3>

            <ProgressRow
              label="Panchkarma"
              val={data?.summary?.therapy || 0}
              total={data?.summary?.totalSales || 0}
              color="bg-teal-500"
            />

            <ProgressRow
              label="Consultation"
              val={data?.summary?.consultation || 0}
              total={data?.summary?.totalSales || 0}
              color="bg-blue-500"
            />

            <ProgressRow
              label="Medicines"
              val={data?.summary?.medicines || 0}
              total={data?.summary?.totalSales || 0}
              color="bg-orange-500"
            />

            {/* <ProgressRow

              label="Online Collection"

              val={data?.summary?.upiSales || 0}

              total={data?.summary?.totalSales || 0}

              color="bg-blue-500"

            /> */}

            {/* <ProgressRow

              label="Cash Collection"

              val={data?.summary?.cashSales || 0}

              total={data?.summary?.totalSales || 0}

              color="bg-emerald-500"

            /> */}
          </div>

          {/* LEDGER */}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Transaction Ledger
              </h3>

              {/* FILTERS */}
              <div className="flex flex-wrap gap-3">
                {/* TRANSACTION TYPE FILTER */}
                <div className="flex bg-white border border-slate-200 p-1 rounded-xl flex-wrap gap-1">
                  {/* ALL */}
                  <button
                    onClick={() => {
                      setLedgerFilters((prev) => ({
                        ...prev,
                        type: "all",
                      }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
                      ledgerFilters.type === "all"
                        ? "bg-teal-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    All
                  </button>

                  {/* SALES */}
                  <button
                    onClick={() => {
                      setLedgerFilters((prev) => ({
                        ...prev,
                        type: "sales",
                      }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
                      ledgerFilters.type === "sales"
                        ? "bg-teal-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Sales
                  </button>

                  {/* EXPENSE */}
                  <button
                    onClick={() => {
                      setLedgerFilters((prev) => ({
                        ...prev,
                        type: "expense",
                      }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
                      ledgerFilters.type === "expense"
                        ? "bg-rose-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Expense
                  </button>
                </div>

                {/* PAYMENT METHOD FILTER */}
                <div className="flex bg-white border border-slate-200 p-1 rounded-xl flex-wrap gap-1">
                  {/* ALL */}
                  {/* <button
                    onClick={() => {
                      setLedgerFilters((prev) => ({
                        ...prev,
                        payment: "all",
                      }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
                      ledgerFilters.payment === "all"
                        ? "bg-slate-700 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    All
                  </button> */}

                  {/* CASH */}
                  <button
                    onClick={() => {
                      setLedgerFilters((prev) => ({
                        ...prev,
                        payment: prev.payment === "cash" ? "all" : "cash",
                      }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
                      ledgerFilters.payment === "cash"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Cash
                  </button>

                  {/* UPI */}
                  <button
                    onClick={() => {
                      setLedgerFilters((prev) => ({
                        ...prev,
                        payment: prev.payment === "upi" ? "all" : "upi",
                      }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
                      ledgerFilters.payment === "upi"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    UPI
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE */}

            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                  <tr>
                    <th className="p-5">Type / Ref</th>

                    <th className="p-5">Description</th>

                    <th className="p-5 text-right">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLedger.length > 0 ? (
                    paginatedLedger.map((item, idx) => (
                      <tr
                        key={item._id || idx}
                        className="hover:bg-slate-50 transition"
                      >
                        {/* TYPE */}

                        <td className="p-5">
                          {item.type === "IN" ? (
                            <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-1 rounded-full font-black">
                              STOCK IN
                            </span>
                          ) : item.invoiceId ? (
                            <span className="font-mono text-teal-600 font-bold">
                              {item.invoiceId}
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-600 text-[9px] px-2 py-1 rounded-full font-black">
                              EXPENSE
                            </span>
                          )}
                        </td>

                        {/* DESCRIPTION */}

                        <td className="p-5">
                          <p className="font-semibold text-slate-700">
                            {item.patientName ||
                              item.title ||
                              item.medicineName}
                          </p>

                          <p className="text-[10px] text-slate-400 uppercase">
                            {item.paymentMethod || item.paymentMode}

                            {" • "}

                            {new Date(
                              item.createdAt || item.date,
                            ).toLocaleDateString()}
                          </p>
                        </td>

                        {/* AMOUNT */}

                        <td
                          className={`p-5 text-right font-black ${
                            item.invoiceId
                              ? "text-slate-900"
                              : item.type === "IN"
                                ? "text-blue-700"
                                : "text-rose-600"
                          }`}
                        >
                          {item.invoiceId ? "" : "- "}₹
                          {(
                            item.totalAmount ||
                            item.amount ||
                            item.quantity * item.purchasePrice
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="p-10 text-center text-slate-400"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
                <p className="text-xs text-slate-400 font-medium">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-40 hover:bg-slate-50"
                  >
                    Prev
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        currentPage === i + 1
                          ? "bg-teal-600 text-white border-teal-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* EXPENSE MODAL */}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">
                New Expense
              </h3>

              <button onClick={() => setShowExpenseModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <input
                required
                type="text"
                placeholder="Expense Title"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm"
                value={expenseForm.title}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,

                    title: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="number"
                  placeholder="Amount ₹"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,

                      amount: e.target.value,
                    })
                  }
                />

                <select
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm"
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,

                      category: e.target.value,
                    })
                  }
                >
                  {[
                    "Rent",

                    "Salaries",

                    "Electricity",

                    "Water",

                    "Maintenance",

                    "Supplies",

                    "Other",
                  ].map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,

                      date: e.target.value,
                    })
                  }
                />

                <select
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm"
                  value={expenseForm.paymentMode}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,

                      paymentMode: e.target.value,
                    })
                  }
                >
                  {["Cash", "UPI", "Bank Transfer"].map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl mt-4 hover:bg-rose-600 transition uppercase tracking-widest text-xs"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================

// STAT CARD

// ===================================================

const StatCard = ({ title, value, icon, color }) => {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-600",

    rose: "bg-rose-50 text-rose-600",

    blue: "bg-blue-50 text-blue-600",

    teal: "bg-teal-50 text-teal-600",

    indigo: "bg-indigo-50 text-indigo-600",

    amber: "bg-amber-50 text-amber-600",

    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${styles[color]}`}>{icon}</div>

      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
          {title}
        </p>

        <h2 className="text-2xl font-black text-slate-800">
          ₹{Number(value || 0).toLocaleString()}
        </h2>
      </div>
    </div>
  );
};

// ===================================================

// PROGRESS ROW

// ===================================================

const ProgressRow = ({ label, val, total, color }) => (
  <div>
    <div className="flex justify-between text-[11px] mb-2 font-bold text-slate-500 uppercase">
      <span>{label}</span>

      <span className="text-slate-800 font-black">
        ₹{Number(val || 0).toLocaleString()}
      </span>
    </div>

    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-1000`}
        style={{
          width: `${Number(total) > 0 ? (Number(val || 0) / Number(total)) * 100 : 0}%`,
        }}
      ></div>
    </div>
  </div>
);
