// import { useEffect, useState } from "react";
// import axios from "axios";
// import Modal from "../components/Modal";

// export default function Inventory() {
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [clinics, setClinics] = useState([]);

//   const [selectedCity, setSelectedCity] = useState("");
//   const [selectedClinic, setSelectedClinic] = useState(null);

//   const [search, setSearch] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState(null);

//   const [historyItem, setHistoryItem] = useState(null);
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [deleteId, setDeleteId] = useState(null);

//   const [form, setForm] = useState({});
//   const [cost, setCost] = useState(0);

//   // Pagination states

//   const [categoryPage, setCategoryPage] = useState({});
// const recordsPerPage = 3;


//   const API = "http://localhost:5001/api/medicine";
//   const auth = {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   };

//   useEffect(() => {
//     const loadClinics = async () => {
//       try {
//         const res = await axios.get("http://localhost:5001/api/clinics", auth);
//         setClinics(res.data);

//         if (res.data.length > 0) {
//           const firstCity = res.data[0].city || "Default City";
//           setSelectedCity(firstCity);
//           const firstClinic = res.data.find((c) => (c.city || "Default City") === firstCity);
//           setSelectedClinic(firstClinic?._id);
//         }
//       } catch (err) {
//         console.error("Clinic load failed", err);
//       }
//     };
//     loadClinics();
//   }, []);

//   useEffect(() => {
//     if (selectedClinic) {
//       fetchData();
//     }
//   }, [selectedClinic]);

//   const fetchData = async () => {
//     try {
//       const res = await axios.get(`${API}/clinic/${selectedClinic}`, auth);
//       setData(res.data);
//     } catch (err) {
//       setData([]);
//     }
//   };

//   const cities = [...new Set(clinics.map((c) => c.city || "Default City"))];
//   const clinicsInCity = clinics.filter((c) => (c.city || "Default City") === selectedCity);

//   useEffect(() => {
//     const result = data.filter(
//       (m) =>
//         m.name?.toLowerCase().includes(search.toLowerCase()) ||
//         m.brand?.toLowerCase().includes(search.toLowerCase()) ||
//         m.category?.toLowerCase().includes(search.toLowerCase())
//     );
//     setFilteredData(result);
//   }, [search, data]);

//   const handleChange = (e) => {
//     const updated = { ...form, [e.target.name]: e.target.value };
//     setForm(updated);
//     const totalMrp = (Number(updated.mrp) || 0) * (Number(updated.quantity) || 0);
//     const discountAmount = totalMrp * ((Number(updated.discount) || 0) / 100);
//     setCost(totalMrp - discountAmount);
//   };

//   const openAddModal = () => {
//     setEditingId(null);
//     setForm({ clinicId: selectedClinic, type: "Classical", quantityType: "Piece" });
//     setCost(0);
//     setShowModal(true);
//   };

//   const openEditModal = (m) => {
//     setEditingId(m._id);
//     setForm({ ...m, clinicId: m.clinicId?._id || m.clinicId });
//     setCost(m.clinicCost || 0);
//     setShowModal(true);
//   };

//   const saveMedicine = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = { ...form, clinicCost: cost };
//       if (editingId) {
//         await axios.put(`${API}/${editingId}`, payload, auth);
//       } else {
//         await axios.post(API, payload, auth);
//       }
//       setShowModal(false);
//       fetchData();
//     } catch (err) {
//       console.error("Save failed", err);
//     }
//   };

//   const deleteItem = async () => {
//     await axios.delete(`${API}/${deleteId}`, auth);
//     setDeleteId(null);
//     fetchData();
//   };

//   const handleOpenHistory = async (medicineId) => {
//     try {
//       const res = await axios.get(`${API}/${medicineId}`, auth);
//       setHistoryItem(res.data);
//     } catch (err) {
//       console.error("Failed to fetch history:", err);
//     }
//   };

//   return (
//     <div className="p-3 md:p-8 min-h-screen ">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-xl font-bold text-slate-800">Inventory</h2>
//           <p className="text-xs text-slate-400">Manage Stock</p>
//         </div>
//         <button
//           onClick={openAddModal}
//           className="bg-teal-600 text-white px-4 py-2 md:px-8 md:py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-teal-700 transition"
//         >
//           + Add New
//         </button>
//       </div>
      
//       {/* 🏙️ Responsive Filter Bar */}
//       <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-5 items-end">
//         <div className="col-span-1 md:w-48">
//           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">City</label>
//           <select 
//             value={selectedCity}
//             onChange={(e) => {
//               setSelectedCity(e.target.value);
//               const firstInCity = clinics.find(c => (c.city || "Default City") === e.target.value);
//               setSelectedClinic(firstInCity?._id);
//             }}
//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none"
//           >
//             {cities.map(city => <option key={city} value={city}>{city}</option>)}
//           </select>
//         </div>

//         <div className="col-span-1 md:w-64">
//           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Clinic</label>
//           <select 
//             value={selectedClinic || ""}
//             onChange={(e) => setSelectedClinic(e.target.value)}
//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none"
//           >
//             {clinicsInCity.map(c => (
//               <option key={c._id} value={c._id}>{c.name} - {c.location}</option>
//             ))}
//           </select>
//         </div>

//         <div className="col-span-full md:flex-1">
//           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Search</label>
//           <input
//             placeholder="Medicine or brand..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
//           />
//         </div>
//       </div>

//       {/* Grouped Content */}
//       {Object.entries(
//         filteredData.reduce((acc, item) => {
//           const cat = item.category || "Other";
//           if (!acc[cat]) acc[cat] = [];
//           acc[cat].push(item);
//           return acc;
//         }, {})
//       ).map(([category, items]) => {
//         const page = categoryPage[category] || 1;

//   const indexOfLast = page * recordsPerPage;
//   const indexOfFirst = indexOfLast - recordsPerPage;

//   const paginatedItems = items.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(items.length / recordsPerPage);
//          return (
//         <div key={category} className="mb-8">
//           <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-1 tracking-widest">{category}</h3>
          
//           {/* Desktop Table: Hidden on Mobile */}
//           <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
//             <table className="w-full text-sm">
//               <thead className="bg-slate-50/80 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
//                 <tr>
//                   <th className="p-4 text-left">Medicine</th>
//                   <th className="p-4 text-left">Brand</th>
//                   <th className="p-4 text-left">Stock</th>
//                   <th className="p-4 text-right">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {paginatedItems.map((m) => (
//                     <DesktopRow key={m._id} m={m} handleOpenHistory={handleOpenHistory} openEditModal={openEditModal} setDeleteId={setDeleteId} />
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile Card List: Visible only on small screens */}
//           <div className="md:hidden space-y-3">
//             {paginatedItems.map((m) => (
//                <MobileCard key={m._id} m={m} handleOpenHistory={handleOpenHistory} openEditModal={openEditModal} setDeleteId={setDeleteId} />
//             ))}
//           </div>
//            {totalPages > 1 && (
//   <div className="flex justify-between items-center mt-3 px-2">

//     <span className="text-[10px] text-slate-400 font-medium">
//       Page {page} of {totalPages}
//     </span>

//     <div className="flex gap-1">

//       <button
//         disabled={page === 1}
//         onClick={() =>
//           setCategoryPage(prev => ({
//             ...prev,
//             [category]: page - 1
//           }))
//         }
//         className="px-2 py-1 text-[10px] border rounded-md disabled:opacity-40"
//       >
//         Prev
//       </button>

//       {[...Array(totalPages)].map((_, i) => (
//         <button
//           key={i}
//           onClick={() =>
//             setCategoryPage(prev => ({
//               ...prev,
//               [category]: i + 1
//             }))
//           }
//           className={`
//             px-2 py-1 text-[10px] border rounded-md
//             ${page === i + 1
//               ? "bg-teal-600 text-white border-teal-600"
//               : ""}
//           `}
//         >
//           {i + 1}
//         </button>
//       ))}

//       <button
//         disabled={page === totalPages}
//         onClick={() =>
//           setCategoryPage(prev => ({
//             ...prev,
//             [category]: page + 1
//           }))
//         }
//         className="px-2 py-1 text-[10px] border rounded-md disabled:opacity-40"
//       >
//         Next
//       </button>

//     </div>

//   </div>
// )}
//         </div>
//       )})}

     


      

//       {/* Main Modal - Responsive adjustments */}
//       {/* Main Add/Edit Modal */}
// {showModal && (
//   <Modal 
//     title={editingId ? "Edit Medicine Record" : "Add New Stock"} 
//     onClose={() => setShowModal(false)}
//   >
//     <form onSubmit={saveMedicine} className="flex flex-col gap-6">
      
//       {/* 1. Scalable Selection Section (City > Clinic) */}
//       <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2">
//             Step 1: Select City
//           </label>
//           <select
//             value={selectedCity} // Uses the global selectedCity state
//             onChange={(e) => {
//               setSelectedCity(e.target.value);
//               // Auto-select the first clinic in that city for the form
//               const firstInCity = clinics.find(c => (c.city || "Default City") === e.target.value);
//               setForm({ ...form, clinicId: firstInCity?._id });
//             }}
//             className="w-full bg-white border-slate-200 border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition shadow-sm"
//           >
//             {cities.map(city => <option key={city} value={city}>{city}</option>)}
//           </select>
//         </div>

//         <div>
//           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2">
//             Step 2: Select Branch
//           </label>
//           <select
//             name="clinicId"
//             value={form.clinicId || ""}
//             onChange={handleChange}
//             required
//             className="w-full bg-white border-slate-200 border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition shadow-sm"
//           >
//             <option value="">Select Branch</option>
//             {clinics
//               .filter(c => (c.city || "Default City") === selectedCity)
//               .map((c) => (
//                 <option key={c._id} value={c._id}>
//                   {c.name} ({c.location})
//                 </option>
//               ))}
//           </select>
//         </div>
//       </div>

//       {/* 2. Main Details Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//         <Input label="Medicine Name" name="name" value={form.name} onChange={handleChange} />
//         <Input label="Brand / Manufacturer" name="brand" value={form.brand} onChange={handleChange} />
        
//         <Select 
//             label="Category" 
//             name="category" 
//             value={form.category} 
//             onChange={handleChange} 
//             options={["Churan", "Tablet & Capsules", "Kwath (Kadha)","Kashayam" , "Arishta & Asava", "Syrups", "Leham & Prash", "Oils", "Bhasma & Ras", "Creams, Gels & Spray", "Personal Care"]} 
//         />

//         <Select 
//             label="Type" 
//             name="type" 
//             value={form.type} 
//             onChange={handleChange} 
//             options={["Classical", "OTC"]} 
//         />
//       </div>

//       {/* 3. Inventory Row */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
//         <Input label="MRP (Unit)" name="mrp" type="number" value={form.mrp} onChange={handleChange} />
//         <Input label="Disc %" name="discount" type="number" value={form.discount} onChange={handleChange} />
//         <Input label="Stock" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
//         <Select 
//           label="Unit" 
//           name="quantityType" 
//           value={form.quantityType} 
//           onChange={handleChange} 
//           options={["Piece", "ML", "Grams"]} 
//         />
//       </div>

//       {/* 4. Pricing Footer */}
//       <div className="bg-teal-600 p-5 rounded-2xl shadow-lg shadow-teal-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
//         <div className="text-center md:text-left">
//           <p className="text-[10px] font-black text-teal-100 uppercase tracking-[0.2em]">Calculated Buy Cost</p>
//           <p className="text-3xl font-black text-white">₹ {cost}</p>
//         </div>
        
//         <button 
//           type="submit" 
//           className="w-full md:w-auto bg-white text-teal-700 px-10 py-3 rounded-xl font-black text-sm uppercase hover:bg-teal-50 transition-all shadow-md"
//         >
//           Confirm & Save
//         </button>
//       </div>
//     </form>
//   </Modal>
// )}

//       {/* history modal - Full screen on mobile */}
//       {/* Improved History Modal */}
// {historyItem && (
//   <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4">
//     <div className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col h-[85vh] md:h-[70vh] overflow-hidden">
      
//       {/* Header - Fixed */}
//       <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
//         <div>
//           <h3 className="text-lg font-bold text-slate-800">{historyItem.name}</h3>
//           <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Stock Movement Log</p>
//         </div>
//         <button 
//           onClick={() => setHistoryItem(null)}
//           className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Date Filters - Fixed */}
//       <div className="p-4 bg-slate-50 border-b grid grid-cols-2 gap-3">
//         <div>
//           <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">From</label>
//           <input
//             type="date"
//             onChange={(e) => setFromDate(e.target.value)}
//             className="w-full border-slate-200 border rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"
//           />
//         </div>
//         <div>
//           <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">To</label>
//           <input
//             type="date"
//             onChange={(e) => setToDate(e.target.value)}
//             className="w-full border-slate-200 border rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"
//           />
//         </div>
//       </div>

//       {/* Timeline List - Scrollable */}
//       <div className="flex-1 overflow-y-auto p-6 relative">
//         {/* The Timeline Vertical Line */}
//         <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>

//         <div className="space-y-8">
//           {historyItem.history
//             ?.filter((h) => {
//               if (!fromDate || !toDate) return true;
//               const d = new Date(h.date);
//               return d >= new Date(fromDate) && d <= new Date(toDate);
//             })
//             .reverse()
//             .map((h, i) => {
//               const change = h.newStock - h.previousStock;
//               const isPositive = change > 0;

//               return (
//                 <div key={i} className="relative flex items-start gap-4 group">
//                   {/* Status Icon/Dot */}
//                   <div className={`mt-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 flex-shrink-0 ${isPositive ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>

//                   <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-transparent group-hover:border-slate-200 transition-all">
//                     <div className="flex justify-between items-start mb-2">
//                       <div>
//                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
//                           {h.type}
//                         </span>
//                         <p className="text-[10px] text-slate-400 mt-1 font-medium">
//                           {new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </p>
//                       </div>
                      
//                       <div className="text-right">
//                         <span className={`text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
//                           {isPositive ? `+${change}` : change}
//                         </span>
//                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Adjustment</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
//                       <div className="flex items-center gap-2">
//                          <div className="text-center">
//                             <p className="text-[9px] text-slate-400 font-bold uppercase">Before</p>
//                             <p className="text-xs font-bold text-slate-600">{h.previousStock}</p>
//                          </div>
//                          <span className="text-slate-300">→</span>
//                          <div className="text-center">
//                             <p className="text-[9px] text-slate-400 font-bold uppercase">After</p>
//                             <p className="text-xs font-bold text-teal-600">{h.newStock}</p>
//                          </div>
//                       </div>
                      
//                       <div className="text-right">
//                         <p className="text-[9px] text-slate-400 font-bold uppercase">Updated By</p>
//                         <p className="text-xs font-semibold text-slate-700">{h.updatedBy || "System"}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}

//           {(!historyItem.history || historyItem.history.length === 0) && (
//             <div className="text-center py-10">
//               <p className="text-slate-400 text-sm italic">No movement recorded for this item yet.</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t bg-white md:hidden">
//         <button 
//           onClick={() => setHistoryItem(null)}
//           className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg"
//         >
//           Close History
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//       {/* Delete Confirmation */}
//       {deleteId && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
//           <div className="bg-white p-6 rounded-2xl w-full max-w-xs text-center shadow-xl">
//             <p className="font-bold text-slate-700 mb-4">Delete this medicine?</p>
//             <div className="flex gap-3">
//               <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border font-medium">Cancel</button>
//               <button onClick={deleteItem} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium">Delete</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* Sub-components for better organization */

// function DesktopRow({m, handleOpenHistory, openEditModal, setDeleteId}) {
//     const low = m.quantity <= 3;
//     return (
//         <tr className={`transition ${low ? "bg-red-50/40" : "hover:bg-slate-50/50"}`}>
//         <td className="p-4">
//           <p className="font-bold text-slate-700">{m.name}</p>
//           <p className="text-[10px] text-slate-400 uppercase">{m.type}</p>
//         </td>
//         <td className="p-4 text-slate-500 font-medium">{m.brand}</td>
//         <td className="p-4">
//           <div className="flex flex-col items-start">
//             <div>
//               <span className={`font-bold text-base ${low ? "text-red-600" : "text-slate-800"}`}>{m.quantity}</span>
//               <span className="ml-1 text-[10px] text-slate-400 font-medium uppercase">{m.quantityType}</span>
//             </div>
//             {low && <span className="mt-1 text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black">LOW STOCK</span>}
//           </div>
//         </td>
//         <td className="p-4 text-right">
//           <div className="flex gap-4 justify-end items-center">
//             <button onClick={() => handleOpenHistory(m._id)} className="text-teal-600 font-bold text-[11px] uppercase">History</button>
//             <button onClick={() => openEditModal(m)} className="text-slate-400 hover:text-slate-600 font-medium">Edit</button>
//             <button onClick={() => setDeleteId(m._id)} className="text-red-300 hover:text-red-500">Delete</button>
//           </div>
//         </td>
//       </tr>
//     )
// }

// function MobileCard({m, handleOpenHistory, openEditModal, setDeleteId}) {
//     const low = m.quantity <= 3;
//     return (
//         <div className={`bg-white p-4 rounded-2xl border ${low ? 'border-red-100' : 'border-slate-200'} shadow-sm`}>
//             <div className="flex justify-between items-start mb-3">
//                 <div>
//                     <h4 className="font-bold text-slate-700">{m.name}</h4>
//                     <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{m.brand} • {m.type}</p>
//                 </div>
//                 <div className="text-right">
//                     <p className={`font-black text-lg ${low ? 'text-red-600' : 'text-slate-800'}`}>{m.quantity}</p>
//                     <p className="text-[9px] text-slate-400 uppercase font-bold">{m.quantityType}</p>
//                 </div>
//             </div>
//             {low && (
//                 <div className="mb-3">
//                     <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black uppercase">Low Stock Alert</span>
//                 </div>
//             )}
//             <div className="flex justify-between items-center pt-3 border-t border-slate-50">
//                 <button onClick={() => handleOpenHistory(m._id)} className="text-teal-600 font-bold text-[10px] uppercase">History</button>
//                 <div className="flex gap-4">
//                     <button onClick={() => openEditModal(m)} className="text-slate-400 font-bold text-[10px] uppercase">Edit</button>
//                     <button onClick={() => setDeleteId(m._id)} className="text-red-300 font-bold text-[10px] uppercase">Delete</button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// function Input({ label, name, value, onChange, type = "text" }) {
//   return (
//     <div className="w-full">
//       <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{label}</label>
//       <input name={name} type={type} value={value || ""} onChange={onChange} required className="border-slate-200 border rounded-xl p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-teal-500 transition bg-slate-50 md:bg-white" />
//     </div>
//   );
// }

// function Select({ label, name, value, options, onChange }) {
//   return (
//     <div className="w-full">
//       <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{label}</label>
//       <select name={name} value={value || ""} onChange={onChange} className="border-slate-200 border rounded-xl p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-teal-500 transition bg-slate-50 md:bg-white">
//         <option value="">Select</option>
//         {options.map(o => <option key={o} value={o}>{o}</option>)}
//       </select>
//     </div>
//   );
// }






// import { useEffect, useState } from "react";

// import axios from "axios";

// import Modal from "../components/Modal";



// export default function Inventory() {

//   const [data, setData] = useState([]);

//   const [filteredData, setFilteredData] = useState([]);

//   const [clinics, setClinics] = useState([]);



//   const [selectedCity, setSelectedCity] = useState("");

//   const [selectedClinic, setSelectedClinic] = useState(null);



//   const [search, setSearch] = useState("");

//   const [showModal, setShowModal] = useState(false);

//   const [editingId, setEditingId] = useState(null);



//   const [historyItem, setHistoryItem] = useState(null);

//   const [fromDate, setFromDate] = useState("");

//   const [toDate, setToDate] = useState("");

//   const [deleteId, setDeleteId] = useState(null);



//   const [form, setForm] = useState({});

//   const [cost, setCost] = useState(0);



//   // Pagination states



//   const [categoryPage, setCategoryPage] = useState({});

// const recordsPerPage = 3;

//   const AYURVEDIC_CATEGORIES = [
//     "Ayurvedic Tabs",
//     "Ayurvedic Churans & Bhasams",
//     "Ayurvedic Oils",
//   ];

//   const STANDARD_CATEGORIES = [
//     "Churan",
//     "Tablet & Capsules",
//     "Kwath (Kadha)",
//     "Kashayam",
//     "Arishta & Asava",
//     "Syrups",
//     "Leham & Prash",
//     "Oils",
//     "Bhasma & Ras",
//     "Creams, Gels & Spray",
//     "Personal Care",
//   ];

//   const isAyurvedicTab = form.category === "Ayurvedic Tabs";
//   const isAyurvedicChuran = form.category === "Ayurvedic Churans & Bhasams";
//   const isAyurvedicOil = form.category === "Ayurvedic Oils";

//   const getInventoryUnit = (category) => {
//     if (category === "Ayurvedic Tabs") return "Piece";
//     if (category === "Ayurvedic Churans & Bhasams") return "Grams";
//     if (category === "Ayurvedic Oils") return "ML";
//     return form.quantityType || "Piece";
//   };

//   const getPriceLabel = (category) => {
//     if (category === "Ayurvedic Tabs") return "Price / Tab";
//     if (category === "Ayurvedic Churans & Bhasams") return "Price / Gram";
//     if (category === "Ayurvedic Oils") return "Price / ML";
//     return "MRP (Unit)";
//   };





//   const API = "http://localhost:5001/api/medicine";

//   const auth = {

//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },

//   };



//   useEffect(() => {

//     const loadClinics = async () => {

//       try {

//         const res = await axios.get("http://localhost:5001/api/clinics", auth);

//         setClinics(res.data);



//         if (res.data.length > 0) {

//           const firstCity = res.data[0].city || "Default City";

//           setSelectedCity(firstCity);

//           const firstClinic = res.data.find((c) => (c.city || "Default City") === firstCity);

//           setSelectedClinic(firstClinic?._id);

//         }

//       } catch (err) {

//         console.error("Clinic load failed", err);

//       }

//     };

//     loadClinics();

//   }, []);



//   useEffect(() => {

//     if (selectedClinic) {

//       fetchData();

//     }

//   }, [selectedClinic]);



//   const fetchData = async () => {

//     try {

//       const res = await axios.get(`${API}/clinic/${selectedClinic}`, auth);

//       setData(res.data);

//     } catch (err) {

//       setData([]);

//     }

//   };



//   const cities = [...new Set(clinics.map((c) => c.city || "Default City"))];

//   const clinicsInCity = clinics.filter((c) => (c.city || "Default City") === selectedCity);



//   useEffect(() => {

//     const result = data.filter(

//       (m) =>

//         m.name?.toLowerCase().includes(search.toLowerCase()) ||

//         m.brand?.toLowerCase().includes(search.toLowerCase()) ||

//         m.category?.toLowerCase().includes(search.toLowerCase())

//     );

//     setFilteredData(result);

//   }, [search, data]);



//   const handleChange = (e) => {

//     const updated = { ...form, [e.target.name]: e.target.value };

//     setForm(updated);

//     const totalMrp = (Number(updated.mrp) || 0) * (Number(updated.quantity) || 0);

//     const discountAmount = totalMrp * ((Number(updated.discount) || 0) / 100);

//     setCost(totalMrp - discountAmount);

//   };



//   const openAddModal = () => {

//     setEditingId(null);

//     setForm({
//       clinicId: selectedClinic,
//       type: "Classical",
//       category: "Tablet & Capsules",
//       quantityType: "Piece",
//       quantity: 0,
//       mrp: 0,
//       discount: 0,
//       ayurvedicSubtype: "",
//     });

//     setCost(0);

//     setShowModal(true);

//   };



//   const openEditModal = (m) => {

//     setEditingId(m._id);

//     setForm({ ...m, clinicId: m.clinicId?._id || m.clinicId });

//     setCost(m.clinicCost || 0);

//     setShowModal(true);

//   };



//   const saveMedicine = async (e) => {

//     e.preventDefault();

//     try {

//       const payload = {
//       ...form,
//       clinicCost: cost,
//       quantityType:
//         form.category === "Ayurvedic Tabs"
//           ? "Piece"
//           : form.category === "Ayurvedic Churans & Bhasams"
//           ? "Grams"
//           : form.category === "Ayurvedic Oils"
//           ? "ML"
//           : form.quantityType,
//       isAyurvedic: AYURVEDIC_CATEGORIES.includes(form.category),
//     };

//       if (editingId) {

//         await axios.put(`${API}/${editingId}`, payload, auth);

//       } else {

//         await axios.post(API, payload, auth);

//       }

//       setShowModal(false);

//       fetchData();

//     } catch (err) {

//       console.error("Save failed", err);

//     }

//   };



//   const deleteItem = async () => {

//     await axios.delete(`${API}/${deleteId}`, auth);

//     setDeleteId(null);

//     fetchData();

//   };



//   const handleOpenHistory = async (medicineId) => {

//     try {

//       const res = await axios.get(`${API}/${medicineId}`, auth);

//       setHistoryItem(res.data);

//     } catch (err) {

//       console.error("Failed to fetch history:", err);

//     }

//   };



//   return (

//     <div className="p-3 md:p-8 min-h-screen ">

//       {/* Header */}

//       <div className="flex justify-between items-center mb-6">

//         <div>

//           <h2 className="text-xl font-bold text-slate-800">Inventory</h2>

//           <p className="text-xs text-slate-400">Manage Stock</p>

//         </div>

//         <button

//           onClick={openAddModal}

//           className="bg-teal-600 text-white px-4 py-2 md:px-8 md:py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-teal-700 transition"

//         >

//           + Add New

//         </button>

//       </div>

//       {/* 🏙️ Responsive Filter Bar */}

//       <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-5 items-end">

//         <div className="col-span-1 md:w-48">

//           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">City</label>

//           <select 

//             value={selectedCity}

//             onChange={(e) => {

//               setSelectedCity(e.target.value);

//               const firstInCity = clinics.find(c => (c.city || "Default City") === e.target.value);

//               setSelectedClinic(firstInCity?._id);

//             }}

//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none"

//           >

//             {cities.map(city => <option key={city} value={city}>{city}</option>)}

//           </select>

//         </div>



//         <div className="col-span-1 md:w-64">

//           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Clinic</label>

//           <select 

//             value={selectedClinic || ""}

//             onChange={(e) => setSelectedClinic(e.target.value)}

//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none"

//           >

//             {clinicsInCity.map(c => (

//               <option key={c._id} value={c._id}>{c.name} - {c.location}</option>

//             ))}

//           </select>

//         </div>



//         <div className="col-span-full md:flex-1">

//           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Search</label>

//           <input

//             placeholder="Medicine or brand..."

//             value={search}

//             onChange={(e) => setSearch(e.target.value)}

//             className="w-full border-slate-200 border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"

//           />

//         </div>

//       </div>



//       {/* Grouped Content */}

//       {Object.entries(

//         filteredData.reduce((acc, item) => {

//           const cat = item.category || "Other";

//           if (!acc[cat]) acc[cat] = [];

//           acc[cat].push(item);

//           return acc;

//         }, {})

//       ).map(([category, items]) => {

//         const page = categoryPage[category] || 1;



//   const indexOfLast = page * recordsPerPage;

//   const indexOfFirst = indexOfLast - recordsPerPage;



//   const paginatedItems = items.slice(indexOfFirst, indexOfLast);

//   const totalPages = Math.ceil(items.length / recordsPerPage);

//          return (

//         <div key={category} className="mb-8">

//           <div className="flex items-center gap-2 mb-3 px-1">
//             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//               {category}
//             </h3>
//             {category === "Ayurvedic Tabs" && (
//               <span className="text-[9px] font-black bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
//                 QTY IN TABS
//               </span>
//             )}
//             {category === "Ayurvedic Churans & Bhasams" && (
//               <span className="text-[9px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
//                 STOCK IN GRAMS
//               </span>
//             )}
//             {category === "Ayurvedic Oils" && (
//               <span className="text-[9px] font-black bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
//                 STOCK IN ML
//               </span>
//             )}
//           </div>

//           {/* Desktop Table: Hidden on Mobile */}

//           <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

//             <table className="w-full text-sm">

//               <thead className="bg-slate-50/80 text-slate-500 text-[10px] uppercase font-bold tracking-wider">

//                 <tr>

//                   <th className="p-4 text-left">Medicine</th>

//                   <th className="p-4 text-left">Brand</th>

//                   <th className="p-4 text-left">Stock</th>

//                   <th className="p-4 text-right">Action</th>

//                 </tr>

//               </thead>

//               <tbody className="divide-y divide-slate-100">

//                 {paginatedItems.map((m) => (

//                     <DesktopRow key={m._id} m={m} handleOpenHistory={handleOpenHistory} openEditModal={openEditModal} setDeleteId={setDeleteId} />

//                 ))}

//               </tbody>

//             </table>

//           </div>



//           {/* Mobile Card List: Visible only on small screens */}

//           <div className="md:hidden space-y-3">

//             {paginatedItems.map((m) => (

//                <MobileCard key={m._id} m={m} handleOpenHistory={handleOpenHistory} openEditModal={openEditModal} setDeleteId={setDeleteId} />

//             ))}

//           </div>

//            {totalPages > 1 && (

//   <div className="flex justify-between items-center mt-3 px-2">



//     <span className="text-[10px] text-slate-400 font-medium">

//       Page {page} of {totalPages}

//     </span>



//     <div className="flex gap-1">



//       <button

//         disabled={page === 1}

//         onClick={() =>

//           setCategoryPage(prev => ({

//             ...prev,

//             [category]: page - 1

//           }))

//         }

//         className="px-2 py-1 text-[10px] border rounded-md disabled:opacity-40"

//       >

//         Prev

//       </button>



//       {[...Array(totalPages)].map((_, i) => (

//         <button

//           key={i}

//           onClick={() =>

//             setCategoryPage(prev => ({

//               ...prev,

//               [category]: i + 1

//             }))

//           }

//           className={`

//             px-2 py-1 text-[10px] border rounded-md

//             ${page === i + 1

//               ? "bg-teal-600 text-white border-teal-600"

//               : ""}

//           `}

//         >

//           {i + 1}

//         </button>

//       ))}



//       <button

//         disabled={page === totalPages}

//         onClick={() =>

//           setCategoryPage(prev => ({

//             ...prev,

//             [category]: page + 1

//           }))

//         }

//         className="px-2 py-1 text-[10px] border rounded-md disabled:opacity-40"

//       >

//         Next

//       </button>



//     </div>



//   </div>

// )}

//         </div>

//       )})}









//       {/* Main Modal - Responsive adjustments */}

//       {/* Main Add/Edit Modal */}

// {showModal && (

//   <Modal 

//     title={editingId ? "Edit Medicine Record" : "Add New Stock"} 

//     onClose={() => setShowModal(false)}

//   >

//     <form onSubmit={saveMedicine} className="flex flex-col gap-6">

//       {/* 1. Scalable Selection Section (City > Clinic) */}

//       <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">

//         <div>

//           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2">

//             Step 1: Select City

//           </label>

//           <select

//             value={selectedCity} // Uses the global selectedCity state

//             onChange={(e) => {

//               setSelectedCity(e.target.value);

//               // Auto-select the first clinic in that city for the form

//               const firstInCity = clinics.find(c => (c.city || "Default City") === e.target.value);

//               setForm({ ...form, clinicId: firstInCity?._id });

//             }}

//             className="w-full bg-white border-slate-200 border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition shadow-sm"

//           >

//             {cities.map(city => <option key={city} value={city}>{city}</option>)}

//           </select>

//         </div>



//         <div>

//           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2">

//             Step 2: Select Branch

//           </label>

//           <select

//             name="clinicId"

//             value={form.clinicId || ""}

//             onChange={handleChange}

//             required

//             className="w-full bg-white border-slate-200 border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition shadow-sm"

//           >

//             <option value="">Select Branch</option>

//             {clinics

//               .filter(c => (c.city || "Default City") === selectedCity)

//               .map((c) => (

//                 <option key={c._id} value={c._id}>

//                   {c.name} ({c.location})

//                 </option>

//               ))}

//           </select>

//         </div>

//       </div>



//       {/* 2. Main Details Grid */}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

//         <Input label="Medicine Name" name="name" value={form.name} onChange={handleChange} />

//         <Input label="Brand / Manufacturer" name="brand" value={form.brand} onChange={handleChange} />

//         <Select 

//             label="Category" 

//             name="category" 

//             value={form.category} 

//             onChange={handleChange} 

//             options={[...AYURVEDIC_CATEGORIES, ...STANDARD_CATEGORIES]} 

//         />



//         <Select 

//             label="Type" 

//             name="type" 

//             value={form.type} 

//             onChange={handleChange} 

//             options={["Classical", "OTC"]} 

//         />

//       </div>



//       {/* 3. Inventory Row */}

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">

//         <Input label="MRP (Unit)" name="mrp" type="number" value={form.mrp} onChange={handleChange} />

//         <Input label="Disc %" name="discount" type="number" value={form.discount} onChange={handleChange} />

//         <Input label="Stock" name="quantity" type="number" value={form.quantity} onChange={handleChange} />

//         <Select 

//           label="Unit" 

//           name="quantityType" 

//           value={form.quantityType} 

//           onChange={handleChange} 

//           options={["Piece", "ML", "Grams"]} 

//         />

//       </div>



//       {/* 4. Pricing Footer */}

//       <div className="bg-teal-600 p-5 rounded-2xl shadow-lg shadow-teal-200/50 flex flex-col md:flex-row justify-between items-center gap-4">

//         <div className="text-center md:text-left">

//           <p className="text-[10px] font-black text-teal-100 uppercase tracking-[0.2em]">Calculated Buy Cost</p>

//           <p className="text-3xl font-black text-white">₹ {cost}</p>

//         </div>

//         <button 

//           type="submit" 

//           className="w-full md:w-auto bg-white text-teal-700 px-10 py-3 rounded-xl font-black text-sm uppercase hover:bg-teal-50 transition-all shadow-md"

//         >

//           Confirm & Save

//         </button>

//       </div>

//     </form>

//   </Modal>

// )}



//       {/* history modal - Full screen on mobile */}

//       {/* Improved History Modal */}

// {historyItem && (

//   <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4">

//     <div className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col h-[85vh] md:h-[70vh] overflow-hidden">

//       {/* Header - Fixed */}

//       <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">

//         <div>

//           <h3 className="text-lg font-bold text-slate-800">{historyItem.name}</h3>

//           <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Stock Movement Log</p>

//         </div>

//         <button 

//           onClick={() => setHistoryItem(null)}

//           className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"

//         >

//           ✕

//         </button>

//       </div>



//       {/* Date Filters - Fixed */}

//       <div className="p-4 bg-slate-50 border-b grid grid-cols-2 gap-3">

//         <div>

//           <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">From</label>

//           <input

//             type="date"

//             onChange={(e) => setFromDate(e.target.value)}

//             className="w-full border-slate-200 border rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"

//           />

//         </div>

//         <div>

//           <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">To</label>

//           <input

//             type="date"

//             onChange={(e) => setToDate(e.target.value)}

//             className="w-full border-slate-200 border rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"

//           />

//         </div>

//       </div>



//       {/* Timeline List - Scrollable */}

//       <div className="flex-1 overflow-y-auto p-6 relative">

//         {/* The Timeline Vertical Line */}

//         <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>



//         <div className="space-y-8">

//           {historyItem.history

//             ?.filter((h) => {

//               if (!fromDate || !toDate) return true;

//               const d = new Date(h.date);

//               return d >= new Date(fromDate) && d <= new Date(toDate);

//             })

//             .reverse()

//             .map((h, i) => {

//               const change = h.newStock - h.previousStock;

//               const isPositive = change > 0;



//               return (

//                 <div key={i} className="relative flex items-start gap-4 group">

//                   {/* Status Icon/Dot */}

//                   <div className={`mt-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 flex-shrink-0 ${isPositive ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>



//                   <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-transparent group-hover:border-slate-200 transition-all">

//                     <div className="flex justify-between items-start mb-2">

//                       <div>

//                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>

//                           {h.type}

//                         </span>

//                         <p className="text-[10px] text-slate-400 mt-1 font-medium">

//                           {new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

//                         </p>

//                       </div>

//                       <div className="text-right">

//                         <span className={`text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>

//                           {isPositive ? `+${change}` : change}

//                         </span>

//                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Adjustment</p>

//                       </div>

//                     </div>



//                     <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">

//                       <div className="flex items-center gap-2">

//                          <div className="text-center">

//                             <p className="text-[9px] text-slate-400 font-bold uppercase">Before</p>

//                             <p className="text-xs font-bold text-slate-600">{h.previousStock}</p>

//                          </div>

//                          <span className="text-slate-300">→</span>

//                          <div className="text-center">

//                             <p className="text-[9px] text-slate-400 font-bold uppercase">After</p>

//                             <p className="text-xs font-bold text-teal-600">{h.newStock}</p>

//                          </div>

//                       </div>

//                       <div className="text-right">

//                         <p className="text-[9px] text-slate-400 font-bold uppercase">Updated By</p>

//                         <p className="text-xs font-semibold text-slate-700">{h.updatedBy || "System"}</p>

//                       </div>

//                     </div>

//                   </div>

//                 </div>

//               );

//             })}



//           {(!historyItem.history || historyItem.history.length === 0) && (

//             <div className="text-center py-10">

//               <p className="text-slate-400 text-sm italic">No movement recorded for this item yet.</p>

//             </div>

//           )}

//         </div>

//       </div>



//       {/* Footer */}

//       <div className="p-4 border-t bg-white md:hidden">

//         <button 

//           onClick={() => setHistoryItem(null)}

//           className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg"

//         >

//           Close History

//         </button>

//       </div>

//     </div>

//   </div>

// )}



//       {/* Delete Confirmation */}

//       {deleteId && (

//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">

//           <div className="bg-white p-6 rounded-2xl w-full max-w-xs text-center shadow-xl">

//             <p className="font-bold text-slate-700 mb-4">Delete this medicine?</p>

//             <div className="flex gap-3">

//               <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border font-medium">Cancel</button>

//               <button onClick={deleteItem} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium">Delete</button>

//             </div>

//           </div>

//         </div>

//       )}

//     </div>

//   );

// }



// /* Sub-components for better organization */



// function DesktopRow({m, handleOpenHistory, openEditModal, setDeleteId}) {

//     const low = m.quantity <= 3;

//     return (

//         <tr className={`transition ${low ? "bg-red-50/40" : "hover:bg-slate-50/50"}`}>

//         <td className="p-4">

//           <p className="font-bold text-slate-700">{m.name}</p>

//           <p className="text-[10px] text-slate-400 uppercase">
//             {m.ayurvedicSubtype ? `${m.type} • ${m.ayurvedicSubtype}` : m.type}
//           </p>

//         </td>

//         <td className="p-4 text-slate-500 font-medium">{m.brand}</td>

//         <td className="p-4">

//           <div className="flex flex-col items-start">

//             <div>

//               <span className={`font-bold text-base ${low ? "text-red-600" : "text-slate-800"}`}>{m.quantity}</span>

//               <span className="ml-1 text-[10px] text-slate-400 font-medium uppercase">{m.quantityType}</span>

//             </div>

//             {low && <span className="mt-1 text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black">LOW STOCK</span>}

//           </div>

//         </td>

//         <td className="p-4 text-right">

//           <div className="flex gap-4 justify-end items-center">

//             <button onClick={() => handleOpenHistory(m._id)} className="text-teal-600 font-bold text-[11px] uppercase">History</button>

//             <button onClick={() => openEditModal(m)} className="text-slate-400 hover:text-slate-600 font-medium">Edit</button>

//             <button onClick={() => setDeleteId(m._id)} className="text-red-300 hover:text-red-500">Delete</button>

//           </div>

//         </td>

//       </tr>

//     )

// }



// function MobileCard({m, handleOpenHistory, openEditModal, setDeleteId}) {

//     const low = m.quantity <= 3;

//     return (

//         <div className={`bg-white p-4 rounded-2xl border ${low ? 'border-red-100' : 'border-slate-200'} shadow-sm`}>

//             <div className="flex justify-between items-start mb-3">

//                 <div>

//                     <h4 className="font-bold text-slate-700">{m.name}</h4>

//                     <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{m.brand} • {m.type}{m.ayurvedicSubtype ? ` • ${m.ayurvedicSubtype}` : ""}</p>

//                 </div>

//                 <div className="text-right">

//                     <p className={`font-black text-lg ${low ? 'text-red-600' : 'text-slate-800'}`}>{m.quantity}</p>

//                     <p className="text-[9px] text-slate-400 uppercase font-bold">{m.quantityType}</p>

//                 </div>

//             </div>

//             {low && (

//                 <div className="mb-3">

//                     <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black uppercase">Low Stock Alert</span>

//                 </div>

//             )}

//             <div className="flex justify-between items-center pt-3 border-t border-slate-50">

//                 <button onClick={() => handleOpenHistory(m._id)} className="text-teal-600 font-bold text-[10px] uppercase">History</button>

//                 <div className="flex gap-4">

//                     <button onClick={() => openEditModal(m)} className="text-slate-400 font-bold text-[10px] uppercase">Edit</button>

//                     <button onClick={() => setDeleteId(m._id)} className="text-red-300 font-bold text-[10px] uppercase">Delete</button>

//                 </div>

//             </div>

//         </div>

//     )

// }



// function Input({ label, name, value, onChange, type = "text" }) {

//   return (

//     <div className="w-full">

//       <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{label}</label>

//       <input name={name} type={type} value={value || ""} onChange={onChange} required className="border-slate-200 border rounded-xl p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-teal-500 transition bg-slate-50 md:bg-white" />

//     </div>

//   );

// }



// function Select({ label, name, value, options, onChange }) {

//   return (

//     <div className="w-full">

//       <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{label}</label>

//       <select name={name} value={value || ""} onChange={onChange} className="border-slate-200 border rounded-xl p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-teal-500 transition bg-slate-50 md:bg-white">

//         <option value="">Select</option>

//         {options.map(o => <option key={o} value={o}>{o}</option>)}

//       </select>

//     </div>

//   );

// }





import { useEffect, useState } from "react";

import axios from "axios";

import Modal from "../components/Modal";



export default function Inventory() {

  const [data, setData] = useState([]);

  const [filteredData, setFilteredData] = useState([]);

  const [clinics, setClinics] = useState([]);



  const [selectedCity, setSelectedCity] = useState("");

  const [selectedClinic, setSelectedClinic] = useState(null);



  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);



  const [historyItem, setHistoryItem] = useState(null);

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [deleteId, setDeleteId] = useState(null);



  const [form, setForm] = useState({});

  const [cost, setCost] = useState(0);



  // Pagination states



  const [categoryPage, setCategoryPage] = useState({});

const recordsPerPage = 3;

  const AYURVEDIC_CATEGORIES = [
    "Ayurvedic Tabs",
    "Ayurvedic Churans & Bhasams",
    "Ayurvedic Oils",
  ];

  const STANDARD_CATEGORIES = [
    "Churan",
    "Tablet & Capsules",
    "Kwath (Kadha)",
    "Kashayam",
    "Arishta & Asava",
    "Syrups",
    "Leham & Prash",
    "Oils",
    "Bhasma & Ras",
    "Creams, Gels & Spray",
    "Personal Care",
  ];

  const isAyurvedicTab = form.category === "Ayurvedic Tabs";
  const isAyurvedicChuran = form.category === "Ayurvedic Churans & Bhasams";
  const isAyurvedicOil = form.category === "Ayurvedic Oils";

  const getInventoryUnit = (category) => {
    if (category === "Ayurvedic Tabs") return "Piece";
    if (category === "Ayurvedic Churans & Bhasams") return "Grams";
    if (category === "Ayurvedic Oils") return "ML";
    return form.quantityType || "Piece";
  };

  const getPriceLabel = (category) => {
    if (category === "Ayurvedic Tabs") return "Price / Tab";
    if (category === "Ayurvedic Churans & Bhasams") return "Price / Gram";
    if (category === "Ayurvedic Oils") return "Price / ML";
    return "MRP (Unit)";
  };





  const API = "http://localhost:5001/api/medicine";

  const auth = {

    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },

  };



  useEffect(() => {

    const loadClinics = async () => {

      try {

        const res = await axios.get("http://localhost:5001/api/clinics", auth);

        setClinics(res.data);



        if (res.data.length > 0) {

          const firstCity = res.data[0].city || "Default City";

          setSelectedCity(firstCity);

          const firstClinic = res.data.find((c) => (c.city || "Default City") === firstCity);

          setSelectedClinic(firstClinic?._id);

        }

      } catch (err) {

        console.error("Clinic load failed", err);

      }

    };

    loadClinics();

  }, []);



  useEffect(() => {

    if (selectedClinic) {

      fetchData();

    }

  }, [selectedClinic]);



  const fetchData = async () => {

    try {

      const res = await axios.get(`${API}/clinic/${selectedClinic}`, auth);

      setData(res.data);

    } catch (err) {

      setData([]);

    }

  };



  const cities = [...new Set(clinics.map((c) => c.city || "Default City"))];

  const clinicsInCity = clinics.filter((c) => (c.city || "Default City") === selectedCity);



  useEffect(() => {

    const result = data.filter(

      (m) =>

        m.name?.toLowerCase().includes(search.toLowerCase()) ||

        m.brand?.toLowerCase().includes(search.toLowerCase()) ||

        m.category?.toLowerCase().includes(search.toLowerCase())

    );

    setFilteredData(result);

  }, [search, data]);



  const handleChange = (e) => {

    const updated = { ...form, [e.target.name]: e.target.value };

    setForm(updated);

    const totalMrp = (Number(updated.mrp) || 0) * (Number(updated.quantity) || 0);

    const discountAmount = totalMrp * ((Number(updated.discount) || 0) / 100);

    setCost(totalMrp - discountAmount);

  };



  const openAddModal = () => {

    setEditingId(null);

    setForm({
      clinicId: selectedClinic,
      type: "Classical",
      category: "Tablet & Capsules",
      quantityType: "Piece",
      quantity: 0,
      mrp: 0,
      discount: 0,
      ayurvedicSubtype: "",
    });

    setCost(0);

    setShowModal(true);

  };



  const openEditModal = (m) => {

    setEditingId(m._id);

    setForm({ ...m, clinicId: m.clinicId?._id || m.clinicId });

    setCost(m.clinicCost || 0);

    setShowModal(true);

  };



  const saveMedicine = async (e) => {

    e.preventDefault();

    try {

      const payload = {
      ...form,
      clinicCost: cost,
      quantityType:
        form.category === "Ayurvedic Tabs"
          ? "Piece"
          : form.category === "Ayurvedic Churans & Bhasams"
          ? "Grams"
          : form.category === "Ayurvedic Oils"
          ? "ML"
          : form.quantityType,
      isAyurvedic: AYURVEDIC_CATEGORIES.includes(form.category),
    };

      if (editingId) {

        await axios.put(`${API}/${editingId}`, payload, auth);

      } else {

        await axios.post(API, payload, auth);

      }

      setShowModal(false);

      fetchData();

    } catch (err) {

      console.error("Save failed", err);

    }

  };



  const deleteItem = async () => {

    await axios.delete(`${API}/${deleteId}`, auth);

    setDeleteId(null);

    fetchData();

  };



  const handleOpenHistory = async (medicineId) => {

    try {

      const res = await axios.get(`${API}/${medicineId}`, auth);

      setHistoryItem(res.data);

    } catch (err) {

      console.error("Failed to fetch history:", err);

    }

  };



  return (

    <div className="p-3 md:p-8 min-h-screen ">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-bold text-slate-800">Inventory</h2>

          <p className="text-xs text-slate-400">Manage Stock</p>

        </div>

        <button

          onClick={openAddModal}

          className="bg-teal-600 text-white px-4 py-2 md:px-8 md:py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-teal-700 transition"

        >

          + Add New

        </button>

      </div>

      {/* 🏙️ Responsive Filter Bar */}

      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-5 items-end">

        <div className="col-span-1 md:w-48">

          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">City</label>

          <select 

            value={selectedCity}

            onChange={(e) => {

              setSelectedCity(e.target.value);

              const firstInCity = clinics.find(c => (c.city || "Default City") === e.target.value);

              setSelectedClinic(firstInCity?._id);

            }}

            className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none"

          >

            {cities.map(city => <option key={city} value={city}>{city}</option>)}

          </select>

        </div>



        <div className="col-span-1 md:w-64">

          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Clinic</label>

          <select 

            value={selectedClinic || ""}

            onChange={(e) => setSelectedClinic(e.target.value)}

            className="w-full border-slate-200 border rounded-xl p-2.5 text-sm bg-slate-50 outline-none"

          >

            {clinicsInCity.map(c => (

              <option key={c._id} value={c._id}>{c.name} - {c.location}</option>

            ))}

          </select>

        </div>



        <div className="col-span-full md:flex-1">

          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Search</label>

          <input

            placeholder="Medicine or brand..."

            value={search}

            onChange={(e) => setSearch(e.target.value)}

            className="w-full border-slate-200 border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"

          />

        </div>

      </div>



      {/* Grouped Content */}

      {Object.entries(

        filteredData.reduce((acc, item) => {
          let cat = item.category || "Other";
          if (cat === "Ayurvedic Churans & Bhasams") {
            const subtype = String(item.ayurvedicSubtype || "Churan").toLowerCase();
            cat = subtype === "bhasam" ? "Ayurvedic Bhasams" : "Ayurvedic Churans";
          }
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {})

      ).map(([category, items]) => {

        const page = categoryPage[category] || 1;



  const indexOfLast = page * recordsPerPage;

  const indexOfFirst = indexOfLast - recordsPerPage;



  const paginatedItems = items.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(items.length / recordsPerPage);

         return (

        <div key={category} className="mb-8">

          <div className="flex items-center gap-2 mb-3 px-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {category}
            </h3>
            {category === "Ayurvedic Tabs" && (
              <span className="text-[9px] font-black bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                QTY IN TABS
              </span>
            )}
            {(category === "Ayurvedic Churans" || category === "Ayurvedic Bhasams") && (
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${category === "Ayurvedic Bhasams" ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700"}`}>
                {category === "Ayurvedic Bhasams" ? "BHASAM • STOCK IN GRAMS" : "CHURAN • STOCK IN GRAMS"}
              </span>
            )}
            {category === "Ayurvedic Oils" && (
              <span className="text-[9px] font-black bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                STOCK IN ML
              </span>
            )}
          </div>

          {/* Desktop Table: Hidden on Mobile */}

          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

            <table className="w-full text-sm">

              <thead className="bg-slate-50/80 text-slate-500 text-[10px] uppercase font-bold tracking-wider">

                <tr>

                  <th className="p-4 text-left">Medicine</th>

                  <th className="p-4 text-left">Brand</th>

                  <th className="p-4 text-left">Stock</th>

                  <th className="p-4 text-right">Action</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {paginatedItems.map((m) => (

                    <DesktopRow key={m._id} m={m} handleOpenHistory={handleOpenHistory} openEditModal={openEditModal} setDeleteId={setDeleteId} />

                ))}

              </tbody>

            </table>

          </div>



          {/* Mobile Card List: Visible only on small screens */}

          <div className="md:hidden space-y-3">

            {paginatedItems.map((m) => (

               <MobileCard key={m._id} m={m} handleOpenHistory={handleOpenHistory} openEditModal={openEditModal} setDeleteId={setDeleteId} />

            ))}

          </div>

           {totalPages > 1 && (

  <div className="flex justify-between items-center mt-3 px-2">



    <span className="text-[10px] text-slate-400 font-medium">

      Page {page} of {totalPages}

    </span>



    <div className="flex gap-1">



      <button

        disabled={page === 1}

        onClick={() =>

          setCategoryPage(prev => ({

            ...prev,

            [category]: page - 1

          }))

        }

        className="px-2 py-1 text-[10px] border rounded-md disabled:opacity-40"

      >

        Prev

      </button>



      {[...Array(totalPages)].map((_, i) => (

        <button

          key={i}

          onClick={() =>

            setCategoryPage(prev => ({

              ...prev,

              [category]: i + 1

            }))

          }

          className={`

            px-2 py-1 text-[10px] border rounded-md

            ${page === i + 1

              ? "bg-teal-600 text-white border-teal-600"

              : ""}

          `}

        >

          {i + 1}

        </button>

      ))}



      <button

        disabled={page === totalPages}

        onClick={() =>

          setCategoryPage(prev => ({

            ...prev,

            [category]: page + 1

          }))

        }

        className="px-2 py-1 text-[10px] border rounded-md disabled:opacity-40"

      >

        Next

      </button>



    </div>



  </div>

)}

        </div>

      )})}









      {/* Main Modal - Responsive adjustments */}

      {/* Main Add/Edit Modal */}

{showModal && (

  <Modal 

    title={editingId ? "Edit Medicine Record" : "Add New Stock"} 

    onClose={() => setShowModal(false)}

  >

    <form onSubmit={saveMedicine} className="flex flex-col gap-6">

      {/* 1. Scalable Selection Section (City > Clinic) */}

      <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>

          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2">

            Step 1: Select City

          </label>

          <select

            value={selectedCity} // Uses the global selectedCity state

            onChange={(e) => {

              setSelectedCity(e.target.value);

              // Auto-select the first clinic in that city for the form

              const firstInCity = clinics.find(c => (c.city || "Default City") === e.target.value);

              setForm({ ...form, clinicId: firstInCity?._id });

            }}

            className="w-full bg-white border-slate-200 border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition shadow-sm"

          >

            {cities.map(city => <option key={city} value={city}>{city}</option>)}

          </select>

        </div>



        <div>

          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2">

            Step 2: Select Branch

          </label>

          <select

            name="clinicId"

            value={form.clinicId || ""}

            onChange={handleChange}

            required

            className="w-full bg-white border-slate-200 border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition shadow-sm"

          >

            <option value="">Select Branch</option>

            {clinics

              .filter(c => (c.city || "Default City") === selectedCity)

              .map((c) => (

                <option key={c._id} value={c._id}>

                  {c.name} ({c.location})

                </option>

              ))}

          </select>

        </div>

      </div>



      {/* 2. Main Details Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <Input label="Medicine Name" name="name" value={form.name} onChange={handleChange} />

        <Input label="Brand / Manufacturer" name="brand" value={form.brand} onChange={handleChange} />

        <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => {
              const category = e.target.value;
              setForm((prev) => ({
                ...prev,
                category,
                ayurvedicSubtype: category === "Ayurvedic Churans & Bhasams" ? (prev.ayurvedicSubtype || "Churan") : "",
                quantityType: category === "Ayurvedic Tabs" ? "Piece" : category === "Ayurvedic Churans & Bhasams" ? "Grams" : category === "Ayurvedic Oils" ? "ML" : (prev.quantityType || "Piece"),
              }));
            }}
            options={[...AYURVEDIC_CATEGORIES, ...STANDARD_CATEGORIES]}
        />

        {isAyurvedicChuran && (
          <Select
            label="Ayurvedic Subcategory"
            name="ayurvedicSubtype"
            value={form.ayurvedicSubtype || "Churan"}
            onChange={handleChange}
            options={["Churan", "Bhasam"]}
          />
        )}



        <Select 

            label="Type" 

            name="type" 

            value={form.type} 

            onChange={handleChange} 

            options={["Classical", "OTC"]} 

        />

      </div>



      {/* 3. Inventory Row */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <Input label={getPriceLabel(form.category)} name="mrp" type="number" value={form.mrp} onChange={handleChange} />
        <Input label="Disc %" name="discount" type="number" value={form.discount} onChange={handleChange} />
        <Input
          label={isAyurvedicTab ? "Stock (Tabs)" : isAyurvedicChuran ? "Stock (Grams)" : isAyurvedicOil ? "Stock (ML)" : "Stock"}
          name="quantity" type="number" value={form.quantity} onChange={handleChange}
        />
        {AYURVEDIC_CATEGORIES.includes(form.category) ? (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Unit</label>
            <div className="border-slate-200 border rounded-xl p-2.5 w-full text-sm bg-slate-100 text-slate-600 font-bold">{getInventoryUnit(form.category)}</div>
          </div>
        ) : (
          <Select label="Unit" name="quantityType" value={form.quantityType} onChange={handleChange} options={["Piece", "ML", "Grams"]} />
        )}
      </div>

      {/* 4. Pricing Footer */}

      <div className="bg-teal-600 p-5 rounded-2xl shadow-lg shadow-teal-200/50 flex flex-col md:flex-row justify-between items-center gap-4">

        <div className="text-center md:text-left">

          <p className="text-[10px] font-black text-teal-100 uppercase tracking-[0.2em]">Calculated Buy Cost</p>

          <p className="text-3xl font-black text-white">₹ {cost}</p>

        </div>

        <button 

          type="submit" 

          className="w-full md:w-auto bg-white text-teal-700 px-10 py-3 rounded-xl font-black text-sm uppercase hover:bg-teal-50 transition-all shadow-md"

        >

          Confirm & Save

        </button>

      </div>

    </form>

  </Modal>

)}



      {/* history modal - Full screen on mobile */}

      {/* Improved History Modal */}

{historyItem && (

  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4">

    <div className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col h-[85vh] md:h-[70vh] overflow-hidden">

      {/* Header - Fixed */}

      <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">

        <div>

          <h3 className="text-lg font-bold text-slate-800">{historyItem.name}</h3>

          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Stock Movement Log</p>

        </div>

        <button 

          onClick={() => setHistoryItem(null)}

          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"

        >

          ✕

        </button>

      </div>



      {/* Date Filters - Fixed */}

      <div className="p-4 bg-slate-50 border-b grid grid-cols-2 gap-3">

        <div>

          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">From</label>

          <input

            type="date"

            onChange={(e) => setFromDate(e.target.value)}

            className="w-full border-slate-200 border rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"

          />

        </div>

        <div>

          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">To</label>

          <input

            type="date"

            onChange={(e) => setToDate(e.target.value)}

            className="w-full border-slate-200 border rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"

          />

        </div>

      </div>



      {/* Timeline List - Scrollable */}

      <div className="flex-1 overflow-y-auto p-6 relative">

        {/* The Timeline Vertical Line */}

        <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>



        <div className="space-y-8">

          {historyItem.history

            ?.filter((h) => {

              if (!fromDate || !toDate) return true;

              const d = new Date(h.date);

              return d >= new Date(fromDate) && d <= new Date(toDate);

            })

            .reverse()

            .map((h, i) => {

              const change = h.newStock - h.previousStock;

              const isPositive = change > 0;



              return (

                <div key={i} className="relative flex items-start gap-4 group">

                  {/* Status Icon/Dot */}

                  <div className={`mt-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 flex-shrink-0 ${isPositive ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>



                  <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-transparent group-hover:border-slate-200 transition-all">

                    <div className="flex justify-between items-start mb-2">

                      <div>

                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>

                          {h.type}

                        </span>

                        <p className="text-[10px] text-slate-400 mt-1 font-medium">

                          {new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                        </p>

                      </div>

                      <div className="text-right">

                        <span className={`text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>

                          {isPositive ? `+${change}` : change}

                        </span>

                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Adjustment</p>

                      </div>

                    </div>



                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">

                      <div className="flex items-center gap-2">

                         <div className="text-center">

                            <p className="text-[9px] text-slate-400 font-bold uppercase">Before</p>

                            <p className="text-xs font-bold text-slate-600">{h.previousStock}</p>

                         </div>

                         <span className="text-slate-300">→</span>

                         <div className="text-center">

                            <p className="text-[9px] text-slate-400 font-bold uppercase">After</p>

                            <p className="text-xs font-bold text-teal-600">{h.newStock}</p>

                         </div>

                      </div>

                      <div className="text-right">

                        <p className="text-[9px] text-slate-400 font-bold uppercase">Updated By</p>

                        <p className="text-xs font-semibold text-slate-700">{h.updatedBy || "System"}</p>

                      </div>

                    </div>

                  </div>

                </div>

              );

            })}



          {(!historyItem.history || historyItem.history.length === 0) && (

            <div className="text-center py-10">

              <p className="text-slate-400 text-sm italic">No movement recorded for this item yet.</p>

            </div>

          )}

        </div>

      </div>



      {/* Footer */}

      <div className="p-4 border-t bg-white md:hidden">

        <button 

          onClick={() => setHistoryItem(null)}

          className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-lg"

        >

          Close History

        </button>

      </div>

    </div>

  </div>

)}



      {/* Delete Confirmation */}

      {deleteId && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">

          <div className="bg-white p-6 rounded-2xl w-full max-w-xs text-center shadow-xl">

            <p className="font-bold text-slate-700 mb-4">Delete this medicine?</p>

            <div className="flex gap-3">

              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border font-medium">Cancel</button>

              <button onClick={deleteItem} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium">Delete</button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}



/* Sub-components for better organization */



function DesktopRow({m, handleOpenHistory, openEditModal, setDeleteId}) {

    const low = m.quantity <= 3;

    return (

        <tr className={`transition ${low ? "bg-red-50/40" : "hover:bg-slate-50/50"}`}>

        <td className="p-4">

          <p className="font-bold text-slate-700">{m.name}</p>

          <p className="text-[10px] text-slate-400 uppercase">
            {m.ayurvedicSubtype ? `${m.type} • ${m.ayurvedicSubtype}` : m.type}
          </p>

        </td>

        <td className="p-4 text-slate-500 font-medium">{m.brand}</td>

        <td className="p-4">

          <div className="flex flex-col items-start">

            <div>

              <span className={`font-bold text-base ${low ? "text-red-600" : "text-slate-800"}`}>{m.quantity}</span>

              <span className="ml-1 text-[10px] text-slate-400 font-medium uppercase">{m.quantityType}</span>

            </div>

            {low && <span className="mt-1 text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black">LOW STOCK</span>}

          </div>

        </td>

        <td className="p-4 text-right">

          <div className="flex gap-4 justify-end items-center">

            <button onClick={() => handleOpenHistory(m._id)} className="text-teal-600 font-bold text-[11px] uppercase">History</button>

            <button onClick={() => openEditModal(m)} className="text-slate-400 hover:text-slate-600 font-medium">Edit</button>

            <button onClick={() => setDeleteId(m._id)} className="text-red-300 hover:text-red-500">Delete</button>

          </div>

        </td>

      </tr>

    )

}



function MobileCard({m, handleOpenHistory, openEditModal, setDeleteId}) {

    const low = m.quantity <= 3;

    return (

        <div className={`bg-white p-4 rounded-2xl border ${low ? 'border-red-100' : 'border-slate-200'} shadow-sm`}>

            <div className="flex justify-between items-start mb-3">

                <div>

                    <h4 className="font-bold text-slate-700">{m.name}</h4>

                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{m.brand} • {m.type}{m.ayurvedicSubtype ? ` • ${m.ayurvedicSubtype}` : ""}</p>

                </div>

                <div className="text-right">

                    <p className={`font-black text-lg ${low ? 'text-red-600' : 'text-slate-800'}`}>{m.quantity}</p>

                    <p className="text-[9px] text-slate-400 uppercase font-bold">{m.quantityType}</p>

                </div>

            </div>

            {low && (

                <div className="mb-3">

                    <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black uppercase">Low Stock Alert</span>

                </div>

            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-50">

                <button onClick={() => handleOpenHistory(m._id)} className="text-teal-600 font-bold text-[10px] uppercase">History</button>

                <div className="flex gap-4">

                    <button onClick={() => openEditModal(m)} className="text-slate-400 font-bold text-[10px] uppercase">Edit</button>

                    <button onClick={() => setDeleteId(m._id)} className="text-red-300 font-bold text-[10px] uppercase">Delete</button>

                </div>

            </div>

        </div>

    )

}



function Input({ label, name, value, onChange, type = "text" }) {

  return (

    <div className="w-full">

      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{label}</label>

      <input name={name} type={type} value={value || ""} onChange={onChange} required className="border-slate-200 border rounded-xl p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-teal-500 transition bg-slate-50 md:bg-white" />

    </div>

  );

}



function Select({ label, name, value, options, onChange }) {

  return (

    <div className="w-full">

      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{label}</label>

      <select name={name} value={value || ""} onChange={onChange} className="border-slate-200 border rounded-xl p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-teal-500 transition bg-slate-50 md:bg-white">

        <option value="">Select</option>

        {options.map(o => <option key={o} value={o}>{o}</option>)}

      </select>

    </div>

  );

}