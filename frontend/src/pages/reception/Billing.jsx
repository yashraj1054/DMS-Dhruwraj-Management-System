// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Select from 'react-select';

// import { Search, Plus, Filter, FileText, IndianRupee, ArrowUpRight, TrendingUp, ChevronLeft, ChevronRight, Eye } from "lucide-react";

// const Billing = () => {
//   const [bills, setBills] = useState([]);
//   const [filteredBills, setFilteredBills] = useState([]);
//   const [clinics, setClinics] = useState([]); 
//   const [inventory, setInventory] = useState([]);
//   const [therapies, setTherapies] = useState([]); 
//   const [showModal, setShowModal] = useState(false);
//   const [search, setSearch] = useState("");
//   const [currentUser, setCurrentUser] = useState(null);
  
//   // New State for View Invoice
//   const [viewInvoice, setViewInvoice] = useState(null);

//   //Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const recordsPerPage = 10;

//   const indexOfLast = currentPage * recordsPerPage;
// const indexOfFirst = indexOfLast - recordsPerPage;

// const currentRecords = filteredBills.slice(indexOfFirst, indexOfLast);

// const totalPages = Math.ceil(filteredBills.length / recordsPerPage);


// // if error delete this 
// const [selectedCategory, setSelectedCategory] = useState("");

// // unique categories
// const categories = [...new Set(inventory.map(item => item.category))];

// // filtered medicines
// const filteredInventory = selectedCategory
//   ? inventory.filter(item => item.category === selectedCategory)
//   : inventory;
// // till this


// // reset page when search changes
// useEffect(() => {
//   setCurrentPage(1);
// }, [search]);

//   const [generatedInvoiceId, setGeneratedInvoiceId] = useState("Loading...");
//   const [cart, setCart] = useState([]);
//   const [formData, setFormData] = useState({
//     patientName: '',
//     mobileNo: '',
//     paymentMethod: 'Cash Payment',
//     clinicId: ''
//   });

//   const [activeMedicine, setActiveMedicine] = useState({ name: '', price: '', qty: '', gst: 5, discount: '' });
//   const [activeTherapy, setActiveTherapy] = useState({ name: '', price: 0, discount: '' });

//   // const therapyOptions = [
//   //   { name: "Abhyangam", price: 1200 },
//   //   { name: "Shirodhara", price: 1500 },
//   //   { name: "Potli Massage", price: 1000 },
//   //   { name: "Panchakarma Session", price: 5000 },
//   //   { name: "Kati Vasti", price: 800 },
//   // ];

//   const auth = {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   };

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   // 1. Updated Search Logic (Name + Date)
//   useEffect(() => {
//     const res = bills.filter(b => {
//       const nameMatch = b.patientName?.toLowerCase().includes(search.toLowerCase());
//       const dateMatch = new Date(b.createdAt).toLocaleDateString().includes(search);
//       const idMatch = b.invoiceId?.toLowerCase().includes(search.toLowerCase());
//       const mobileMatch = b.mobileNo?.toLowerCase().includes(search.toLowerCase());
//       return nameMatch || dateMatch || idMatch || mobileMatch;
//     });
//     setFilteredBills(res);
//   }, [search, bills]);

//   // const fetchInitialData = async () => {

//   //   try {
//   //     const userData = JSON.parse(localStorage.getItem("user"));
//   //     const userClinicId = userData?.clinic;

//   //     const clinicRes = await axios.get('http://localhost:5001/api/clinics', auth).catch(e => ({data: []}));
//   //     const billRes = await axios.get('http://localhost:5001/api/bills', auth).catch(e => ({data: []}));

//   //     const clinicList = clinicRes.data;
//   //     const billList = Array.isArray(billRes.data) ? billRes.data : billRes.data.bills || [];
      
//   //     setClinics(clinicList);
//   //     setCurrentUser(userData);
//   //     setBills(billList);
//   //     setFilteredBills(billList);

//   //     const myClinic = clinicList.find(c => c._id === userClinicId);
//   //     if (myClinic) {
//   //       setFormData(prev => ({ ...prev, clinicId: myClinic._id }));
//   //       const count = billList.filter(b => (b.clinicId?._id || b.clinicId) === myClinic._id).length;
//   //       const prefix = myClinic.invoicePrefix || "INV";
//   //       const newId = `${prefix}${String(count + 1).padStart(4, "0")}`;
//   //       setGeneratedInvoiceId(newId);

//   //       const invRes = await axios.get(`http://localhost:5001/api/medicine/clinic/${myClinic._id}`, auth);
//   //       setInventory(invRes.data);
//   //     }
//   //   } catch (err) {
//   //     console.error("Critical Fetch Error:", err);
//   //   }
//   // };

//   const fetchInitialData = async () => {
//   try {
//     const userData = JSON.parse(localStorage.getItem("user"));
//     const userClinicId = userData?.clinic; // This is the ID of the clinic the user belongs to

//     const clinicRes = await axios.get('http://localhost:5001/api/clinics', auth).catch(e => ({data: []}));
//     const billRes = await axios.get('http://localhost:5001/api/bills', auth).catch(e => ({data: []}));
//     const therapyRes = await axios.get("http://localhost:5001/api/therapies", auth).catch(e => ({data: []}));

//     const clinicList = clinicRes.data;
//     const allBills = Array.isArray(billRes.data) ? billRes.data : billRes.data.bills || [];
    
//     // FILTER: Only keep bills where the clinicId matches the logged-in user's clinic
//     const myClinicBills = allBills.filter(b => {
//       const billClinicId = b.clinicId?._id || b.clinicId;
//       return billClinicId === userClinicId;
//     });

//     setClinics(clinicList);
//     setCurrentUser(userData);
//     setBills(myClinicBills); // Store only filtered bills
//     setFilteredBills(myClinicBills); // Initialize filtered search list with these bills
//     setTherapies(
//   Array.isArray(therapyRes.data)
//     ? therapyRes.data
//     : therapyRes.data.therapies || [],
// );

//     // ... rest of your logic for generating Invoice ID
//     const myClinic = clinicList.find(c => c._id === userClinicId);
//     if (myClinic) {
//       setFormData(prev => ({ ...prev, clinicId: myClinic._id }));
//       const count = myClinicBills.length; // Count only this clinic's bills
//       const prefix = myClinic.invoicePrefix || "INV";
//       const newId = `${prefix}${String(count + 1).padStart(4, "0")}`;
//       setGeneratedInvoiceId(newId);

//       const invRes = await axios.get(`http://localhost:5001/api/medicine/clinic/${myClinic._id}`, auth);
//       setInventory(invRes.data);
//     }
//   } catch (err) {
//     console.error("Critical Fetch Error:", err);
//   }
// };

// const handleWhatsAppShare = () => {
//   const mobile = viewInvoice.mobileNo;

//   const message = `
// Hello ${viewInvoice.patientName},

// Your invoice has been generated successfully.

// Invoice ID: ${viewInvoice.invoiceId}
// Amount: ₹${viewInvoice.totalAmount}

// Download Invoice:
// http://localhost:5173/invoice/${viewInvoice._id}

// Thank you.
//   `;

//   const encodedMessage = encodeURIComponent(message);

//   window.open(
//     `https://wa.me/91${mobile}?text=${encodedMessage}`,
//     "_blank"
//   );
// };
// const handleSMSShare = () => {
//   const mobile = viewInvoice.mobileNo;

//   const message = `
// Hello ${viewInvoice.patientName},

// Your invoice has been generated successfully.

// Invoice ID: ${viewInvoice.invoiceId}
// Amount: ₹${viewInvoice.totalAmount}

// Download Invoice:
// http://localhost:5173/invoice/${viewInvoice._id}

// Thank you.
//   `;

//   const encodedMessage = encodeURIComponent(message);

//   window.location.href = `sms:+91${mobile}?body=${encodedMessage}`;
// };
//   const handleMedicineChange = (selected) => {
//     if (selected) {
//       setActiveMedicine({
//         ...activeMedicine,
//         _id: selected._id,
//         name: selected.name,
//         price: selected.mrp, 
//         discount: selected.discount || 0,
//         qty: 1
//       });
//     }
//   };

//   const addToCart = (item, category) => {
//     if (!item.name || !item.price) return;
//     const qty = Number(item.qty) || 1;
//     const price = Number(item.price);
//     const discPercent = Number(item.discount) || 0;
//     const gstPercent = Number(item.gst) || 0;

//     const baseTotal = price * qty;
//     const discountAmt = baseTotal * (discPercent / 100);
//     const afterDiscount = baseTotal - discountAmt;
//     const gstAmt = afterDiscount * (gstPercent / 100);
//     const finalTotal = afterDiscount + gstAmt;

//     setCart([...cart, { 
//       ...item, 
//       category, 
//       price,
//       qty,
//       gst: gstPercent,
//       discount: discPercent,
//       total: Number(finalTotal.toFixed(2)),
//     }]);
    
//     if(category === 'Medicine') setActiveMedicine({ name: '', price: '', qty: 1, gst: 5, discount: 0 });
//     if(category === 'Therapy') setActiveTherapy({ name: '', price: 0, discount: 0 });
//   };

//   const handleGenerateBill = async () => {
//   if (!formData.patientName || cart.length === 0) {
//     alert("Please add patient details and items to cart");
//     return;
//   }

//   try {
//     // 1. Prepare cleaned payload
//     const cleanedPaymentMethod = formData.paymentMethod.includes(" ") 
//       ? formData.paymentMethod.split(" ")[0] 
//       : formData.paymentMethod;

//     const payload = {
//       ...formData,
//       invoiceId: generatedInvoiceId,
//       paymentMethod: cleanedPaymentMethod,
//       totalAmount: Number(cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)),
//       items: cart.map(item => ({
//         ...item,
//         price: Number(item.price),
//         qty: Number(item.qty),
//         discount: Number(item.discount),
//         gst: Number(item.gst),
//         total: Number(item.total)
//       }))
//     };

//     // 2. Save to Database
//     const response = await axios.post('http://localhost:5001/api/bills/generate', payload, auth);

//     // 3. SUCCESS LOGIC
//     if (response.data) {
//       setShowModal(false); // Close the generation terminal
//       setCart([]); // Clear cart
//       fetchInitialData(); // Refresh history list
      
//       // 4. OPEN PRINT PREVIEW IMMEDIATELY
//       // We pass the newly saved bill from the server response
//       setViewInvoice(response.data); 
//     }

//   } catch (err) {
//     console.error("Submission Error:", err.response?.data);
//     alert("Error: " + (err.response?.data?.message || err.message));
//   }
// };

//   // 2. Print Function
//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
//       <div className="md:items-center md:justify-between gap-3 mb-8">
//   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-6 lg:p-8">
//     {/* Title Section */}
//     <div className="space-y-1">
//       <h2 className="text-3xl font-black text-slate-800 tracking-tight">Billing</h2>
//       <p className="text-sm text-slate-400 font-medium italic">Manage Clinic Invoices </p>
//     </div>

//     {/* Actions Section */}
//     <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//       <div className="relative group">
//         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
//         <input
//           placeholder="Search Name or ID..."
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full sm:w-72 pl-11 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-semibold text-sm"
//         />
//       </div>

//       <button
//         onClick={() => setShowModal(true)}
//         className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-slate-200 transition-all active:scale-95"
//       >
//         <Plus className="w-5 h-5" />
//         Generate Bill
//       </button>
//     </div>
//   </div>
// </div>

// <div className="w-full mb-10">
//   <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
//     {/* Desktop Table View */}
//     <div className="hidden md:block overflow-x-auto">
//       <table className="w-full text-left border-collapse">
//         <thead>
//           <tr className="bg-slate-50/50 border-b border-slate-100">
//             <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Invoice ID</th>
//             <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Patient</th>
//             <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Mobile</th>
//             <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Issue Date</th>
//             <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Total Amount</th>
            
//             <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 text-center">Action</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-50">
//           {currentRecords.map((b) => (
//             <tr key={b._id} className="group hover:bg-slate-50/50 transition-colors">
//               <td className="px-8 py-5">
//                 <span className="font-mono font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg text-xs">
//                   {b.invoiceId}
//                 </span>
//               </td>
//               <td className="px-8 py-5 font-bold text-slate-800">{b.patientName}</td>
//               <td className="px-8 py-5 font-bold text-slate-800">{b.mobileNo}</td>
//               <td className="px-8 py-5 text-sm font-semibold text-slate-500">
//                 {new Date(b.createdAt).toLocaleDateString()}
//               </td>
//               <td className="px-8 py-5">
//                 <span className="text-lg font-black text-slate-900 tracking-tight italic">
//                   ₹{b.totalAmount.toLocaleString()}
//                 </span>
//               </td>
              
//               <td className="px-8 py-5 text-center">
//                 <button
//                   onClick={() => setViewInvoice(b)}
//                   className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 hover:border-teal-100 hover:bg-teal-50 transition-all shadow-sm group-hover:scale-105"
//                 >
//                   <Eye className="w-3.5 h-3.5" />
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>

//     {/* Mobile Card View */}
//     <div className="md:hidden divide-y divide-slate-100">
//       {currentRecords.map((bill) => (
//         <div
//           key={bill._id}
//           className="p-6 active:bg-slate-50 transition-colors flex items-center justify-between group"
//           onClick={() => setViewInvoice(bill)}
//         >
//           <div className="flex flex-col gap-2">
//             <div className="flex items-center gap-2">
//               <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-tighter">
//                 {bill.invoiceId}
//               </span>
//               <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 font-black text-slate-400 uppercase tracking-widest">
//                 {bill.paymentMethod}
//               </span>
//             </div>
//             <p className="font-black text-slate-800 text-base">{bill.patientName}</p>
//             <div className="flex items-center text-[10px] text-slate-400 font-bold gap-2">
//               <span>{new Date(bill.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
//               <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
//               <span>{bill.mobileNo}</span>
//             </div>
//           </div>

//           <div className="text-right">
//             <p className="font-black text-slate-900 text-lg italic tracking-tight">
//               ₹{bill.totalAmount.toFixed(2)}
//             </p>
//             <div className="flex items-center justify-end gap-1 text-teal-600 mt-1">
//               <span className="text-[9px] font-black uppercase tracking-widest">Details</span>
//               <ArrowUpRight className="w-3 h-3" />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>

//     {/* Pagination */}
//     {totalPages > 1 && (
//       <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-slate-50/50 border-t border-slate-100 gap-4">
//         <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">
//           Page <span className="text-slate-800">{currentPage}</span> of {totalPages}
//         </span>

//         <div className="flex items-center gap-2">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((p) => p - 1)}
//             className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-white hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
//           >
//             <ChevronLeft className="w-5 h-5" />
//           </button>

//           <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1">
//             {[...Array(totalPages)].map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentPage(i + 1)}
//                 className={`
//                   w-9 h-9 text-[10px] font-black rounded-lg transition-all
//                   ${currentPage === i + 1
//                     ? "bg-teal-600 text-white shadow-lg shadow-teal-200"
//                     : "text-slate-400 hover:bg-slate-50"}
//                 `}
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </div>

//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((p) => p + 1)}
//             className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-white hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
//           >
//             <ChevronRight className="w-5 h-5" />
//           </button>
//         </div>
//       </div>
//     )}
//   </div>
// </div>

 

//       {/* 3. VIEW INVOICE MODAL (Pop-up) */}
//       {/* VIEW & PRINT INVOICE MODAL */}
// {/* {viewInvoice && (
//   <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-start overflow-y-auto z-[100] p-4 pt-10">
//     <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:m-0 print:w-full">
      
      
//       <div className="p-4 bg-slate-900 flex justify-between items-center print:hidden">
//         <div className="flex items-center gap-2 text-white">
//           <span className="bg-teal-500 p-1.5 rounded-lg text-lg">📄</span>
//           <span className="font-bold">Preview: {viewInvoice.invoiceId}</span>
//         </div>
//         <div className="flex gap-3">
//           <button 
//             onClick={() => window.print()} 
//             className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
//           >
//             🖨️ Print Invoice
//           </button>
//           <button 
//             onClick={() => setViewInvoice(null)} 
//             className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-all"
//           >
//             ✕ Close
//           </button>
//         </div>
//       </div>

      
//       <div id="invoice-print" className="p-8 bg-white grid grid-cols-2 gap-5 print:gap-4">
        
        
//         {[ "PATIENT COPY" , "CLINIC COPY" ].map((copyType, index) => (
//           <div key={index} className={ `border-b   last:pl-0 border-dashed border-slate-200 pb-6 mb-6 print:pb-4 print:mb-4` }>
            
            
//             <div className="text-center mb-2">
//               <div className="inline-block  p-3 rounded-full mb-1">
                
//                 <img src="/brandicon.png" alt="Dhruwraj Logo" className="h-20 w-20 object-contain" />
//               </div>
//               <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
//                 {clinics.find(c => (c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId)))?.name || "Clinic Name"}
//               </h1>
//               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
//                 {clinics.find(c => (c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId)))?.location || "Clinic Address"} - {clinics.find(c => (c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId)))?.city || "City" }
//               </p>
//               <p className='text-[8px] text-slate-400 font-medium'>GSTIN: {clinics.find(c => (c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId)))?.gstNumber || "GSTIN" }</p>
//             </div>

            
//             <div className="bg-slate-900 text-white flex justify-between px-4 py-2 rounded-t-lg text-[9px] font-bold uppercase tracking-widest">
//               <span>{copyType}</span>
//               <span>MODE: {viewInvoice.paymentMethod}</span>
//               <span>#{viewInvoice.invoiceId}</span>
//             </div>

            
//             <div className="bg-slate-100 flex justify-between px-4 py-2 rounded-b-lg text-[10px] font-bold border-x border-b border-slate-200">
//               <span className="text-slate-600">NAME: <span className="text-slate-900">{viewInvoice.patientName}</span></span>
//               <span className="text-slate-600">DATE: <span className="text-slate-900">{new Date(viewInvoice.createdAt).toLocaleDateString()}</span></span>
//               <span className="text-slate-600">PH: <span className="text-slate-900">{viewInvoice.mobileNo}</span></span>
//             </div>

            
//             <table className="w-full mt-6 text-[10px]">
//               <thead>
//                 <tr className="text-slate-400 border-b border-slate-100">
//                   <th className="text-left pb-2 uppercase tracking-widest">Particulars</th>
//                   <th className="text-center pb-2 uppercase tracking-widest">Rate</th>
//                   <th className="text-center pb-2 uppercase tracking-widest">Qty</th>
//                   <th className="text-right pb-2 uppercase tracking-widest">Total</th>
//                 </tr>
//               </thead>
//               <tbody className="text-slate-700">
//                 {viewInvoice.items.map((item, i) => (
//                   <tr key={i} className="border-b border-slate-50">
//                     <td className="py-3">
//                       <p className="font-bold uppercase text-slate-800 leading-none">{item.name}</p>
//                       <span className="text-[8px] text-slate-400 font-medium">{item.category}</span>
//                     </td>
//                     <td className="text-center font-medium">₹{item.price}</td>
//                     <td className="text-center font-medium">{item.qty || 1}</td>
//                     <td className="text-right font-bold text-slate-900">₹{item.total}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

            
//             <div className="mt-6 space-y-1">
//               <div className="flex justify-between text-[11px] font-medium text-slate-500">
//                 <span>Gross Total:</span>
//                 <span>₹{(viewInvoice.items.reduce((acc, curr) => acc + (curr.price * (curr.qty || 1)), 0)).toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-[11px] font-bold text-teal-600">
//                 <span>Total Discount:</span>
//                 <span>- ₹{(viewInvoice.items.reduce((acc, curr) => acc + (curr.price * (curr.qty || 1) * (curr.discount / 100)), 0)).toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-[11px] font-medium text-slate-500">
//                 <span>Total GST:</span>
//                 <span>+ ₹{(viewInvoice.items.reduce((acc, curr) => acc + ((curr.price * (curr.qty || 1) - (curr.price * (curr.qty || 1) * (curr.discount / 100))) * (curr.gst / 100)), 0)).toFixed(2)}</span>
//               </div>
              
//               <div className="mt-4 border-t-2 border-dashed border-slate-200 pt-3 flex justify-between items-center">
//                 <span className="text-sm font-black text-slate-800 uppercase italic">Grand Total:</span>
//                 <span className="text-xl font-black text-slate-900 tracking-tighter">₹{viewInvoice.totalAmount}</span>
//               </div>
//             </div>

            
//             <p className="text-center text-[8px] font-bold text-slate-400 uppercase mt-8 tracking-widest">
//               Thank you. Wishing you a speedy recovery!
//             </p>
//             <p className="text-center text-[8px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
//               Bill generated by {currentUser?.name || "System"}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// )} */}

// {viewInvoice && (
//   <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60] p-4 overflow-y-auto">
//     <style>
//       {`
//         @media print {

//       body * {
//         visibility: hidden;
//       }

//       #printable-invoice,
//       #printable-invoice * {
//         visibility: visible;
//       }

//       #printable-invoice {
//         position: absolute;
//         left: 0;
//         top: 0;
//         width: 100%;
//         background: white;
//       }

//       .no-print {
//         display: none !important;
//       }

//     }
//       `}
//     </style>
    
//     <div className="bg-white w-full max-w-[550px] rounded-2xl overflow-hidden shadow-2xl my-auto">
//       <div id="printable-invoice" className="p-10 bg-white text-slate-800">
        
        
//         <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
//           <div className="flex items-center gap-4">
            
//             <div className="w-16 h-16 rounded-full flex items-center justify-center ">
//               <img src="/brandicon.png" alt="Dhruwraj Logo" className="h-20 w-20 object-contain" />
//             </div>
//             <div>
//               <h1 className="text-[15px] font-black text-slate-900 uppercase">
//                 {clinics.find(c => c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId))?.name}
//               </h1>
//               <p className="text-[10px] text-slate-500 max-w-[200px] leading-tight mt-1">
//                 {clinics.find(c => (c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId)))?.location || "Clinic Address"} - {clinics.find(c => (c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId)))?.city || "City" }
//               </p>

//               <p className="text-[10px] font-bold text-teal-600 mt-1">
//                 GSTIN: {clinics.find(c => (c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId)))?.gstNumber || "GSTIN" }
//               </p>
//             </div>
//           </div>
//           <div className="text-right">
//             <h2 className="text-sm font-black text-slate-400 uppercase ">Tax Invoice</h2>
//             <p className="text-sm font-bold text-slate-900">#{viewInvoice.invoiceId}</p>
//             <p className="text-[10px] text-slate-500">{new Date(viewInvoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
//           </div>
//         </div>

        
//         <div className="grid grid-cols-2 gap-4 text-[11px] mb-8 bg-slate-50 p-4 rounded-xl">
//           <div>
//             <p className="text-slate-400 font-bold uppercase mb-1">Bill To:</p>
//             <p className="text-sm font-black text-slate-800">{viewInvoice.patientName}</p>
//             <p className="text-slate-600 font-medium">+91 {viewInvoice.mobileNo}</p>
//           </div>
//           <div className="text-right">
//             <p className="text-slate-400 font-bold uppercase mb-1">Payment Method:</p>
//             <p className="text-sm font-black text-slate-800">{viewInvoice.paymentMethod}</p>
            
//           </div>
//         </div>

        
//         <table className="w-full mb-8">
//           <thead>
//             <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 text-left">
//               <th className="pb-2">Description</th>
//               <th className="pb-2 text-center">Qty</th>
//               <th className="pb-2 text-right">MRP</th>
//               <th className="pb-2 text-right">Discount</th>
//               <th className="pb-2 text-right">GST</th>
//               <th className="pb-2 text-right">Total</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {viewInvoice.items?.map((item, idx) => (
//               <tr key={idx} className="text-[12px]">
//                 <td className="py-3">
//                   <p className="font-bold text-slate-700">{item.name}</p>
//                   <p className="text-[9px] text-slate-400 italic">{item.category}</p>
//                 </td>
//                 <td className="py-3 text-center">{item.qty}</td>
//                 <td className="py-3 text-right">₹{item.price}</td>
//                 <td className="py-3 text-right text-[10px] text-slate-500">{item.discount}%</td>
//                 <td className="py-3 text-right text-[10px] text-slate-500">{item.gst}%</td>
//                 <td className="py-3 text-right font-bold">₹{item.total}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

        
//         <div className="flex justify-end">
//           <div className="w-full max-w-[200px] space-y-2 border-t-2 border-slate-900 pt-4">
//             <div className="flex justify-between text-[11px]">
//               <span className="text-slate-500 font-medium">Gross Total</span>
//               <span className="font-bold text-slate-700">₹{(viewInvoice.items.reduce((acc, curr) => acc + (curr.price * (curr.qty || 1)), 0)).toFixed(2)}</span>
//             </div>

//             {/* <div className="flex justify-between text-[11px]">
//               <span className="text-slate-500 font-medium">GST</span>
//               <span className="font-bold text-slate-700">+ ₹{(viewInvoice.items.reduce((acc, curr) => acc + ((curr.price * (curr.qty || 1) - (curr.price * (curr.qty || 1) * (curr.discount / 100))) * (curr.gst / 100)), 0)).toFixed(2)}</span>
//             </div> */}
//             <div className="flex justify-between text-[11px]">
//   <span className="text-slate-500 font-medium">CGST (@ 2.5%)</span>
//   <span className="font-bold text-slate-700">
//     + ₹{(
//       viewInvoice.items.reduce(
//         (acc, curr) =>
//           acc +
//           (
//             (curr.price * (curr.qty || 1) -
//               (curr.price * (curr.qty || 1) * (curr.discount / 100))) *
//             (curr.gst / 100)
//           ),
//         0
//       ) / 2
//     ).toFixed(2)}
//   </span>
// </div>

// <div className="flex justify-between text-[11px]">
//   <span className="text-slate-500 font-medium">SGST (@ 2.5%)</span>
//   <span className="font-bold text-slate-700">
//     + ₹{(
//       viewInvoice.items.reduce(
//         (acc, curr) =>
//           acc +
//           (
//             (curr.price * (curr.qty || 1) -
//               (curr.price * (curr.qty || 1) * (curr.discount / 100))) *
//             (curr.gst / 100)
//           ),
//         0
//       ) / 2
//     ).toFixed(2)}
//   </span>
// </div>
            
            
//             <div className="flex justify-between text-[11px] text-green-600">
//               <span className="font-medium">Total Savings</span>
//               <span className="font-bold">- ₹{(viewInvoice.items.reduce((acc, curr) => acc + (curr.price * (curr.qty || 1) * (curr.discount / 100)), 0)).toFixed(2)}</span>
              
//             </div>

//             <div className="flex justify-between text-md font-black text-slate-900 border-t border-dashed border-slate-200 pt-2">
//               <span>Grand Total</span>
//               <span>₹{viewInvoice.totalAmount.toFixed(2)}</span>
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-12 text-center border-t border-slate-100 pt-2">
//           <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Authorized Signatory</p>
//           <p className="text-[9px] text-slate-300 mt-2 italic">This is a computer-generated invoice and does not require a physical signature.</p>
//         </div>
//       </div>

      
//       <div className="p-4 bg-slate-900 flex gap-3 no-print">
//           <button 
//             onClick={() => setViewInvoice(null)}
//             className="flex-1 text-white text-xs font-bold opacity-60 hover:opacity-100 transition"
//           >
//             CLOSE PREVIEW
//           </button>
//           <button 
//             onClick={() => window.print()} 
//             className="flex-[2] bg-teal-500 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-teal-400 shadow-lg transition-transform active:scale-95"
//           >
//             🖨️ Print Invoice
//           </button>
//           <button
//   onClick={handleWhatsAppShare}
//   className="flex-[2] bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600"
// >
//   📲 Send WhatsApp
// </button>

//       </div>
//     </div>
//   </div>
// )}

// {/* SMS Button  */}
// {/* <button
//   onClick={handleSMSShare}
//   className="flex-[2] bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600"
// >
//   📲 Send SMS
// </button> */}

//       {/* Generation Modal (Keep your original code) */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
//           <div className="bg-white w-full max-w-[850px] rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border">
//             {/* ... rest of your existing Generate modal code ... */}
//             <div className="p-6 border-b flex justify-between items-center">
//               <h2 className="text-xl font-black text-slate-800">
//                 Billing Terminal 
//                 <span className="ml-3 text-xs px-3 py-1 bg-teal-50 text-teal-600 rounded-full font-bold">ID: {generatedInvoiceId}</span>
//               </h2>
//               <button onClick={() => setShowModal(false)} className="text-slate-300 text-2xl">✕</button>
//             </div>

//             <div className="p-6 overflow-y-auto space-y-6">
//               {/* Patient */}
//               <div className="grid grid-cols-2 gap-4">
  
//   {/* Patient Name */}
//   <div> 
//     <input
//   type="text"
//   placeholder="Patient Name"
//   className="border p-3 rounded-xl bg-slate-50 outline-none w-full"
//   value={formData.patientName}
//   onChange={(e) => {
//     let value = e.target.value;

//     // Allow only alphabets and spaces
//     value = value.replace(/[^A-Za-z\s]/g, "");

//     // Prevent multiple spaces
//     value = value.replace(/\s+/g, " ");

//     // Prevent starting space
//     value = value.replace(/^\s/, "");

//     setFormData({
//       ...formData,
//       patientName: value,
//     });
//   }}
// />
//   </div>

//   {/* Mobile Number */}
//   <div>
//     <input
//       type="tel"
//       placeholder="Mobile No"
//       className={`border p-3 rounded-xl bg-slate-50 outline-none w-full ${
//         formData.mobileNo.length > 0 &&
//         formData.mobileNo.length < 10
//           ? "border-red-500"
//           : ""
//       }`}
//       value={formData.mobileNo}
//       maxLength={10}
//       onChange={(e) => {
//         // Allow only digits
//         const value = e.target.value.replace(/\D/g, "").slice(0, 10);

//         setFormData({
//           ...formData,
//           mobileNo: value,
//         });
//       }}
//     />

//     {/* Error Message */}
//     {formData.mobileNo.length > 0 &&
//       formData.mobileNo.length < 10 && (
//         <p className="text-red-500 text-sm mt-1">
//           Please enter a proper 10-digit mobile number
//         </p>
//       )}
//   </div>
// </div>

//               {/* Consultation */}
//               <div className="flex gap-3 items-end">
//                 <input id="cons_input" placeholder="Consultation Fee (₹)" className="border p-3 rounded-xl flex-1 outline-none" type="number" />
//                 <button onClick={() => {
//                   const val = document.getElementById('cons_input').value;
//                   if(val) addToCart({name: 'Consultation Fee', price: val, gst: 0, discount: 0}, 'Consultation');
//                 }} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">Add Fee</button>
//               </div>

//               {/* Therapy Section */}
// <div className="space-y-3">
//   <p className="text-[10px] font-bold text-teal-600 uppercase">
//     Therapy & Services
//   </p>

//   <div className="grid grid-cols-4 gap-3">
//     <div className="col-span-3">
//       <Select
//         options={therapies.map((therapy) => ({
//           label: `${therapy.name} (₹${therapy.price})`,
//           value: therapy._id,
//           ...therapy,
//         }))}
//         onChange={(selected) =>
//           setActiveTherapy({
//             _id: selected._id,
//             name: selected.name,
//             price: selected.price,
//             discount: "",
//             gst: selected.gst || 0,
//             qty: 1,
//           })
//         }
//         styles={{
//           control: (base) => ({
//             ...base,
//             padding: "4px",
//             borderRadius: "12px",
//           }),
//         }}
//       />
//     </div>

//     <input
//       placeholder="Disc %"
//       className="border p-3 rounded-xl w-full"
//       type="number"
//       value={activeTherapy.discount}
//       onChange={(e) =>
//         setActiveTherapy({
//           ...activeTherapy,
//           discount: e.target.value,
//         })
//       }
//     />
//   </div>

//   <button
//     onClick={() => addToCart(activeTherapy, "Therapy")}
//     className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold shadow-md"
//   >
//     Add Therapy to Cart
//   </button>
// </div>

//               {/* Medicine Section */}
//               <div className="space-y-3">
//                 <div className="grid grid-cols-4 gap-3">
//                    <div className="col-span-3">
//                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Search Medicine</p>
//                       <Select
//                         options={inventory.map(med => ({ label: `${med.name} (Stock: ${med.quantity})`, value: med._id, ...med }))}
//                         onChange={handleMedicineChange}
//                         placeholder="Type to search..."
//                         styles={{ control: (base) => ({ ...base, padding: '4px', borderRadius: '12px' }) }}
//                       />
//                    </div>
//                    <input type="number" value={activeMedicine.qty} placeholder='qty' className="border p-3 rounded-lg w-full h-[48px] mt-5" onChange={(e) => setActiveMedicine({...activeMedicine, qty: e.target.value})} />
//                 </div>
//                 <div className="grid grid-cols-3 gap-3">
//                    <div className="bg-slate-50 p-3 rounded-xl border border-dashed text-center">
//                       <span className="text-[9px] font-bold text-slate-400 uppercase block">MRP</span>
//                       <span className="font-bold">₹ {activeMedicine.price || '0.00'}</span>
//                    </div>
//                    <select className="border p-3 rounded-xl" value={activeMedicine.gst} onChange={(e) => setActiveMedicine({...activeMedicine, gst: e.target.value})}>
//                     <option value="0">0% GST</option>
//                       <option value="5">5% GST</option>
//                       <option value="12">12% GST</option>
//                    </select>
//                    <input type="number" value={activeMedicine.discount} placeholder="Disc %" className="border p-3 rounded-xl w-full" onChange={(e) => setActiveMedicine({...activeMedicine, discount: e.target.value})} />
//                 </div>
//                 <button onClick={() => addToCart(activeMedicine, 'Medicine')} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-black transition-all">Add Medicine to Cart</button>
//               </div>
              

//               {/* Cart Summary */}
//               <div className="bg-teal-50 border-2 border-dashed border-teal-200 rounded-2xl p-5">
//                 {/* (Your existing cart summary logic here) */}
//                 <div className="flex justify-between items-center mb-4">
//                   <p className="text-xs font-bold text-teal-600 uppercase">Live Cart Items</p>
//                   <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full">{cart.length} Total</span>
//                 </div>
//                 {cart.length === 0 ? <p className="text-center text-slate-400 py-4 italic text-sm">Cart is empty</p> : (
//                   <div className="space-y-2">
//                     {cart.map((item, index) => (
//                       <div key={index} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm">
//                         <span>{item.name} <small className="text-slate-400 text-[10px] uppercase">({item.category})</small></span>
//                         <div className="flex gap-4 items-center">
//                             <span className="font-black">₹{item.total.toFixed(2)}</span>
//                             <button onClick={() => setCart(cart.filter((_, i) => i !== index))} className="text-red-400 font-bold">✕</button>
//                         </div>
//                       </div>
//                     ))}
//                     <div className="border-t border-teal-200 pt-3 mt-4 flex justify-between font-black text-lg text-teal-800">
//                       <span>Grand Total</span>
//                       <span>₹{cart.reduce((s, i) => s + i.total, 0).toFixed(2)}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="p-6 border-t bg-slate-50 flex gap-4">
//               <select className="border p-3 rounded-lg flex-1 font-bold outline-none bg-white" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
//                 <option value="Cash Payment">💵 Cash Payment</option>
//                 <option value="UPI Payment">📱 UPI Payment</option>
//               </select>
//               <button 
//               onClick={handleGenerateBill} 
              
//               className="bg-teal-600 hover:bg-teal-700 text-white px-10 py-3 rounded-xl flex-[2] font-black uppercase text-sm shadow-lg">
//                 Generate Final Invoice
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Billing;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

import { Search, Plus, ChevronLeft, ChevronRight, Eye, Printer, Trash2, Send } from "lucide-react";

const Billing = () => {
  // --- STATE MANAGEMENT ---
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [clinics, setClinics] = useState([]); 
  const [inventory, setInventory] = useState([]);
  const [therapies, setTherapies] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);

  // --- PAGINATION CONFIGURATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredBills.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBills.length / recordsPerPage);

  const [generatedInvoiceId, setGeneratedInvoiceId] = useState("Loading...");
  const [cart, setCart] = useState([]);
  
  const [formData, setFormData] = useState({
    patientName: '',
    mobileNo: '',
    paymentMethod: 'Cash Payment',
    clinicId: ''
  });

  // --- FORM INPUT FIELDS DATA ---
  const [activeMedicine, setActiveMedicine] = useState({ name: '', price: '', qty: '', gst: 5, discount: '' });
  const [activeTherapy, setActiveTherapy] = useState({ name: '', price: 0, discount: '' });

  const auth = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- LIVE FILTER / SEARCH LOGIC ---
  useEffect(() => {
    const res = bills.filter(b => {
      const nameMatch = b.patientName?.toLowerCase().includes(search.toLowerCase());
      const dateMatch = new Date(b.createdAt).toLocaleDateString().includes(search);
      const idMatch = b.invoiceId?.toLowerCase().includes(search.toLowerCase());
      const mobileMatch = b.mobileNo?.toLowerCase().includes(search.toLowerCase());
      return nameMatch || dateMatch || idMatch || mobileMatch;
    });
    setFilteredBills(res);
  }, [search, bills]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchInitialData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const userClinicId = userData?.clinic;

      const clinicRes = await axios.get('http://localhost:5001/api/clinics', auth).catch(e => ({data: []}));
      const billRes = await axios.get('http://localhost:5001/api/bills', auth).catch(e => ({data: []}));
      const therapyRes = await axios.get("http://localhost:5001/api/therapies", auth).catch(e => ({data: []}));

      const clinicList = clinicRes.data;
      const allBills = Array.isArray(billRes.data) ? billRes.data : billRes.data.bills || [];
      
      // Filter records belonging strictly to this user's clinic location
      const myClinicBills = allBills.filter(b => {
        const billClinicId = b.clinicId?._id || b.clinicId;
        return billClinicId === userClinicId;
      });

      setClinics(clinicList);
      setCurrentUser(userData);
      setBills(myClinicBills);
      setFilteredBills(myClinicBills);
      setTherapies(Array.isArray(therapyRes.data) ? therapyRes.data : therapyRes.data.therapies || []);

      const myClinic = clinicList.find(c => c._id === userClinicId);
      if (myClinic) {
        setFormData(prev => ({ ...prev, clinicId: myClinic._id }));
        const count = myClinicBills.length;
        const prefix = myClinic.invoicePrefix || "INV";
        const newId = `${prefix}${String(count + 1).padStart(4, "0")}`;
        setGeneratedInvoiceId(newId);

        const invRes = await axios.get(`http://localhost:5001/api/medicine/clinic/${myClinic._id}`, auth);
        setInventory(invRes.data);
      }
    } catch (err) {
      console.error("Critical Fetch Error:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const mobile = viewInvoice.mobileNo;
    const message = `Hello ${viewInvoice.patientName},\n\nYour invoice has been generated successfully.\n\nInvoice ID: ${viewInvoice.invoiceId}\nAmount: ₹${viewInvoice.totalAmount}\n\nDownload Invoice:\nhttp://localhost:5173/invoice/${viewInvoice._id}\n\nThank you.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/91${mobile}?text=${encodedMessage}`, "_blank");
  };

  const handleMedicineChange = (selected) => {
    if (selected) {
      setActiveMedicine({
        ...activeMedicine,
        _id: selected._id,
        name: selected.name,
        price: selected.mrp, 
        discount: selected.discount || 0,
        qty: 1
      });
    }
  };

  // --- CART ACCUMULATION AND TAX CALCULATOR ---
  const addToCart = (item, category) => {
    if (!item.name || !item.price) return;
    const qty = Number(item.qty) || 1;
    const price = Number(item.price);
    const discPercent = Number(item.discount) || 0;
    const gstPercent = Number(item.gst) || 0;

    const baseTotal = price * qty;
    const discountAmt = baseTotal * (discPercent / 100);
    const afterDiscount = baseTotal - discountAmt;
    const gstAmt = afterDiscount * (gstPercent / 100);
    const finalTotal = afterDiscount + gstAmt;

    setCart([...cart, { 
      ...item, 
      category, 
      price,
      qty,
      gst: gstPercent,
      discount: discPercent,
      total: Number(finalTotal.toFixed(2)),
    }]);
    
    if(category === 'Medicine') setActiveMedicine({ name: '', price: '', qty: 1, gst: 5, discount: 0 });
    if(category === 'Therapy') setActiveTherapy({ name: '', price: 0, discount: 0 });
  };

  const handleGenerateBill = async () => {
    if (!formData.patientName || cart.length === 0) {
      alert("Please add patient details and items to cart");
      return;
    }

    try {
      const cleanedPaymentMethod = formData.paymentMethod.includes(" ") 
        ? formData.paymentMethod.split(" ")[0] 
        : formData.paymentMethod;

      const payload = {
        ...formData,
        invoiceId: generatedInvoiceId,
        paymentMethod: cleanedPaymentMethod,
        totalAmount: Number(cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)),
        items: cart.map(item => ({
          ...item,
          price: Number(item.price),
          qty: Number(item.qty),
          discount: Number(item.discount),
          gst: Number(item.gst),
          total: Number(item.total)
        }))
      };

      const response = await axios.post('http://localhost:5001/api/bills/generate', payload, auth);

      if (response.data) {
        setShowModal(false);
        setCart([]);
        fetchInitialData();
        setViewInvoice(response.data); 
      }
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  // Separate cart content categories for display mapping
  const consultationItems = viewInvoice?.items?.filter(item => item.category === 'Consultation') || [];
  const therapyItems = viewInvoice?.items?.filter(item => item.category === 'Therapy') || [];
  const medicineItems = viewInvoice?.items?.filter(item => item.category === 'Medicine') || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 text-slate-600">
      
      {/* PAGE HEADER OVERVIEW */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Billing</h2>
            <p className="text-xs text-slate-400 font-medium">Manage Clinic Invoices</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search Name or ID..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium text-slate-800"
              />
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Generate Bill
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD BILL HISTORY VIEW TABLE */}
      <div className="w-full mb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">Invoice ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">Patient</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">Mobile</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">Issue Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">Total Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRecords.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-md text-xs">
                        {b.invoiceId}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{b.patientName}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{b.mobileNo}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{b.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setViewInvoice(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Blocks */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <span className="text-xs text-slate-400">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- RECONSTRUCTED CLEAN PRINT VIEW MODAL --- */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 overflow-y-auto">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #printable-invoice, #printable-invoice * { visibility: visible; }
              #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; color: #000; }
              .no-print { display: none !important; }
            }
          `}</style>
          
          <div className="bg-white w-full max-w-[650px] rounded-2xl overflow-hidden shadow-xl border border-slate-100 my-auto">
            <div id="printable-invoice" className="p-8 bg-white text-slate-800 font-sans">
              
              {/* Invoice Head Section */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img src="/brandicon.png" alt="Logo" className="object-contain max-h-full max-w-full" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                      {clinics.find(c => c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId))?.name}
                    </h1>
                    <p className="text-xs text-slate-500 max-w-[280px] mt-0.5">
                      {clinics.find(c => c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId))?.location}, {clinics.find(c => c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId))?.city}
                    </p>
                    <p className="text-[11px] font-semibold text-teal-700 mt-1">
                      GSTIN: {clinics.find(c => c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId))?.gstNumber || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">TAX INVOICE</h2>
                  <p className="text-base font-mono font-bold text-slate-900 mt-0.5">#{viewInvoice.invoiceId}</p>
                  <p className="text-[11px] text-slate-500">{new Date(viewInvoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Patient Meta Context Block */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">BILL TO:</span>
                  <p className="font-bold text-slate-900 text-sm">{viewInvoice.patientName}</p>
                  <p className="text-slate-500 mt-0.5">+91 {viewInvoice.mobileNo}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">PAYMENT INFO:</span>
                  <p className="font-bold text-slate-900 text-sm">{viewInvoice.paymentMethod}</p>
                  <p className="text-slate-500 mt-0.5">Status: Settlement Complete</p>
                </div>
              </div>

              {/* BIFURCATED CATEGORY LAYOUT TABLES */}
              <div className="space-y-6">
                
                {/* 1. Consultation Section */}
                {consultationItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Consultation Fees</h3>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 font-semibold border-b border-slate-100 text-left">
                          <th className="pb-1">Fee Description</th>
                          <th className="pb-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consultationItems.map((item, idx) => (
                          <tr key={idx} className="text-slate-700">
                            <td className="py-2 font-medium">{item.name}</td>
                            <td className="py-2 text-right font-semibold">₹{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. Therapies Section (With detailed columns) */}
                {therapyItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Panchkarma & Therapies</h3>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 font-semibold border-b border-slate-100 text-left">
                          <th className="pb-1">Therapy Name</th>
                          <th className="pb-1 text-center">Qty</th>
                          <th className="pb-1 text-right">MRP</th>
                          <th className="pb-1 text-right">Disc %</th>
                          <th className="pb-1 text-right">GST %</th>
                          <th className="pb-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {therapyItems.map((item, idx) => (
                          <tr key={idx} className="text-slate-700">
                            <td className="py-2 font-medium">{item.name}</td>
                            <td className="py-2 text-center">{item.qty}</td>
                            <td className="py-2 text-right">₹{item.price}</td>
                            <td className="py-2 text-right">{item.discount}%</td>
                            <td className="py-2 text-right">{item.gst || 0}%</td>
                            <td className="py-2 text-right font-semibold">₹{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. Medicines Section (Unified table layout with all details) */}
                {medicineItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Pharmacy Dispersals</h3>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 font-semibold border-b border-slate-100 text-left">
                          <th className="pb-1">Medicine Name</th>
                          <th className="pb-1 text-center">Qty</th>
                          <th className="pb-1 text-right">MRP</th>
                          <th className="pb-1 text-right">Disc %</th>
                          <th className="pb-1 text-right">GST %</th>
                          <th className="pb-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {medicineItems.map((item, idx) => (
                          <tr key={idx} className="text-slate-700">
                            <td className="py-2 font-medium">{item.name}</td>
                            <td className="py-2 text-center">{item.qty}</td>
                            <td className="py-2 text-right">₹{item.price}</td>
                            <td className="py-2 text-right">{item.discount}%</td>
                            <td className="py-2 text-right">{item.gst}%</td>
                            <td className="py-2 text-right font-semibold">₹{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary Computations Breakdown */}
              <div className="mt-8 border-t border-slate-200 pt-4 flex justify-end">
                <div className="w-full max-w-[240px] space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Gross Value:</span>
                    <span>₹{(viewInvoice.items?.reduce((acc, curr) => acc + (curr.price * (curr.qty || 1)), 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>CGST (@ 2.5%):</span>
                    <span>+ ₹{(viewInvoice.items?.reduce((acc, curr) => acc + (((curr.price * (curr.qty || 1)) - ((curr.price * (curr.qty || 1)) * (curr.discount / 100))) * (curr.gst / 100)), 0) / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SGST (@ 2.5%):</span>
                    <span>+ ₹{(viewInvoice.items?.reduce((acc, curr) => acc + (((curr.price * (curr.qty || 1)) - ((curr.price * (curr.qty || 1)) * (curr.discount / 100))) * (curr.gst / 100)), 0) / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Total Discount :</span>
                    <span>- ₹{(viewInvoice.items?.reduce((acc, curr) => acc + (curr.price * (curr.qty || 1) * (curr.discount / 100)), 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                    <span>Grand Total :</span>
                    <span>₹{viewInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 text-center border-t border-slate-100 pt-4">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Authorized System Generation</p>
                <p className="text-[9px] text-slate-300 mt-1 italic">No physical signature required.</p>
              </div>
            </div>

            {/* Print Action Header Buttons */}
            <div className="p-4 bg-slate-900 flex gap-2 no-print">
              <button onClick={() => setViewInvoice(null)} className="flex-1 text-slate-400 hover:text-white text-xs font-semibold tracking-wide transition">
                CLOSE
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide hover:bg-teal-500 transition-all">
                <Printer className="w-3.5 h-3.5" /> PRINT INVOICE
              </button>
              <button onClick={handleWhatsAppShare} className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide hover:bg-green-500 transition-all">
                <Send className="w-3.5 h-3.5" /> SHARE WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SIMPLIFIED INVOICE BILL GENERATOR TERMINAL MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[850px] rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create New Invoice</h2>
                <p className="text-xs text-slate-400">Add client demographics, select inventory units, and add them to the bill.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-md border border-teal-100">Invoice ID: {generatedInvoiceId}</span>
               <button onClick={() => setShowModal(false)} className="text-slate-300 text-2xl">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Demographics Setup Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Patient Name</label>
                  <input
                    type="text"
                    placeholder="Patient Name"
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 text-sm outline-none focus:bg-white focus:border-teal-500 transition"
                    value={formData.patientName}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^A-Za-z\s]/g, "").replace(/\s+/g, " ").replace(/^\s/, "");
                      setFormData({ ...formData, patientName: val });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Mobile No"
                    className={`w-full border p-2.5 rounded-xl text-sm bg-slate-50 outline-none focus:bg-white transition ${formData.mobileNo.length > 0 && formData.mobileNo.length < 10 ? "border-red-400" : "border-slate-200"}`}
                    value={formData.mobileNo}
                    maxLength={10}
                    onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  />
                </div>
              </div>

              {/* Consultation Allocation Inputs */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Consultation Fees</span>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input id="cons_input" placeholder="Consultation Fee (₹)" className="w-full border border-slate-200 p-2.5 bg-white text-sm rounded-xl outline-none" type="number" />
                  </div>
                  <button onClick={() => {
                    const val = document.getElementById('cons_input').value;
                    if(val) {
                      addToCart({name: 'Consultation Fee', price: val, gst: 0, discount: 0}, 'Consultation');
                      document.getElementById('cons_input').value = '';
                    }
                  }} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 h-[40px] rounded-xl transition">Add Fee</button>
                </div>
              </div>

              {/* Therapy Configuration Block */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Therapies & Services</span>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3">
                    <Select
                      options={therapies.map((t) => ({ label: `${t.name} (₹${t.price})`, value: t._id, ...t }))}
                      onChange={(s) => setActiveTherapy({ _id: s._id, name: s.name, price: s.price, discount: "", gst: s.gst || 0, qty: 1 })}
                      placeholder="Select Therapy..."
                      styles={{ control: (b) => ({ ...b, padding: '2px', borderRadius: '12px', border: '1px solid #e2e8f0' }) }}
                    />
                  </div>
                  <input placeholder="Disc %" className="w-full border border-slate-200 p-2 text-sm rounded-xl outline-none" type="number" value={activeTherapy.discount} onChange={(e) => setActiveTherapy({ ...activeTherapy, discount: e.target.value })} />
                </div>
                <button onClick={() => addToCart(activeTherapy, "Therapy")} className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-xl transition">Add Therapy to Cart</button>
              </div>

              {/* Pharmacy Dispersal Selection Engine */}
              <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Medicines & Pharmacy</span>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3">
                    <Select
                      options={inventory.map(med => ({ label: `${med.name} (Stock: ${med.quantity})`, value: med._id, ...med }))}
                      onChange={handleMedicineChange}
                      placeholder="Search Medicine..."
                      styles={{ control: (b) => ({ ...b, padding: '2px', borderRadius: '12px', border: '1px solid #e2e8f0' }) }}
                    />
                  </div>
                  <input type="number" value={activeMedicine.qty} placeholder="Qty" className="w-full border border-slate-200 p-2 text-sm rounded-xl text-center outline-none bg-white" onChange={(e) => setActiveMedicine({...activeMedicine, qty: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Base MRP</span>
                    <span className="font-bold text-slate-800">₹ {activeMedicine.price || '0.00'}</span>
                  </div>
                  <select className="border border-slate-200 p-2.5 text-sm rounded-xl bg-white outline-none font-medium" value={activeMedicine.gst} onChange={(e) => setActiveMedicine({...activeMedicine, gst: e.target.value})}>
                    <option value="0">0% GST</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                  </select>
                  <input type="number" value={activeMedicine.discount} placeholder="Discount %" className="w-full border border-slate-200 p-2.5 text-sm rounded-xl outline-none" onChange={(e) => setActiveMedicine({...activeMedicine, discount: e.target.value})} />
                </div>
                <button onClick={() => addToCart(activeMedicine, 'Medicine')} className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2.5 rounded-xl transition">Add Medicine to Cart</button>
              </div>

              {/* Simple Live Dashboard Cart List Output */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Current Items Added</p>
                  <span className="text-[11px] bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md font-mono">{cart.length} Rows</span>
                </div>
                {cart.length === 0 ? (
                  <p className="text-center text-slate-500 py-6 text-xs italic">Cart is empty.</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs bg-slate-800 border border-slate-700/60 p-3 rounded-xl">
                        <div>
                          <span className="font-semibold text-slate-100">{item.name}</span>
                          <span className="ml-2 text-[10px] text-slate-400 uppercase">({item.category})</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className="font-mono font-bold text-teal-300">₹{item.total.toFixed(2)}</span>
                          <button onClick={() => setCart(cart.filter((_, i) => i !== index))} className="text-slate-500 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-slate-800 pt-3 mt-4 flex justify-between font-bold text-base text-teal-400">
                      <span>Total Amount:</span>
                      <span className="font-mono">₹{cart.reduce((s, i) => s + i.total, 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Action Submissions Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-4">
              <select className="border border-slate-200 p-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-white outline-none focus:border-teal-500" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
                <option value="Cash Payment">💵 Cash Payment</option>
                <option value="UPI Payment">📱 UPI Payment</option>
              </select>
              <button onClick={handleGenerateBill} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xl shadow-sm flex-1 transition-all">
                Generate Final Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;