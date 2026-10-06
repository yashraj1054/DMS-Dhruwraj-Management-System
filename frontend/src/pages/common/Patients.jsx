// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Trash2 , Edit2 } from "lucide-react";

// export default function Patients() {
//   const [patients, setPatients] = useState([]);
//   const [clinics, setClinics] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState({});
//   const [deleteConfirm, setDeleteConfirm] = useState(null);
//   const [preview, setPreview] = useState("");
//   const [generatedId, setGeneratedId] = useState("");

//   const [search, setSearch] = useState("");

//   const user = JSON.parse(localStorage.getItem("user"));

//   const API_BASE = "http://localhost:5001/api";
//   const config = {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   };

//   useEffect(() => {
//     fetchPatients();
//     fetchClinics();
//   }, []);

//   useEffect(() => {
//     if (open && !editing && user.role !== "admin") {
//       const userClinicId = user.clinic?._id || user.clinic;
//       setForm((prev) => ({ ...prev, clinic: userClinicId }));
//       generatePatientId(userClinicId);
//     }
//   }, [open, editing]);

//   const fetchPatients = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/patients`, config);
//       setPatients(res.data);
//     } catch (err) {
//       console.error("Failed to fetch patients", err);
//     }
//   };

//   const fetchClinics = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/clinics`);
//       setClinics(res.data);
//     } catch (err) {
//       console.error("Failed to fetch clinics", err);
//     }
//   };

//   const generatePatientId = (clinicId) => {
//     if (!clinicId) return;
//     const clinic = clinics.find((c) => c._id === clinicId);
//     if (clinic) {
//       const count = patients.filter(
//         (p) => (p.clinic?._id || p.clinic) === clinicId
//       ).length;
//       const newId = `${clinic.patientPrefix}${String(count + 1).padStart(3, "0")}`;
//       setGeneratedId(newId);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const updatedForm = { ...form, [name]: value };
//     setForm(updatedForm);
//     if (name === "clinic") {
//       generatePatientId(value);
//     }
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setEditing(null);
//     setForm({});
//     setGeneratedId("");
//     setPreview("");
//   };

//   const savePatient = async (e) => {
//     e.preventDefault();
//     const data = new FormData();
//     const submissionData = { ...form, patientId: generatedId };

//     Object.keys(submissionData).forEach((key) => {
//       if (submissionData[key] !== null) {
//         data.append(key, submissionData[key]);
//       }
//     });

//     try {
//       if (editing) {
//         await axios.put(`${API_BASE}/patients/${editing}`, data, config);
//       } else {
//         await axios.post(`${API_BASE}/patients`, data, config);
//       }
//       handleClose();
//       fetchPatients();
//     } catch (err) {
//       console.error("Save Error:", err.response?.data);
//       alert(err.response?.data?.message || "Error saving patient data");
//     }
//   };

//   const editPatient = (p) => {
//     setEditing(p._id);
//     setForm({ ...p, clinic: p.clinic?._id || p.clinic });
//     setGeneratedId(p.patientId);
//     if (p.profileImage) {
//       setPreview(`http://localhost:5001/uploads/${p.profileImage}`);
//     }
//     setOpen(true);
//   };

//   const triggerDelete = (id) => {
//     setDeleteConfirm(id);
//   };

//   const confirmDelete = async () => {
//     if (!deleteConfirm) return;
//     try {
//       await axios.delete(`${API_BASE}/patients/${deleteConfirm}`, config);
//       fetchPatients();
//       setDeleteConfirm(null);
//     } catch (err) {
//       console.error(err);
//       alert("Could not delete patient.");
//     }
//   };

//   const filteredPatients = patients.filter(
//     (p) =>
//       p.name?.toLowerCase().includes(search.toLowerCase()) ||
//       p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
//       p.phone?.includes(search) ||
//       p.clinic?.location?.toLowerCase().includes(search.toLowerCase()) ||
//       p.clinic?.name?.toLowerCase().includes(search.toLowerCase()),
//   );

//   // Logic to determine if fields should be disabled
//   // Logic: Disable if we are editing an existing patient AND user is not admin
//   const isReadOnly = editing && user.role !== "admin";

//   return (
//     <div >
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
//         <div>
//           <h2 className="text-xl font-bold text-slate-800">Patients</h2>
//           <p className="text-sm text-slate-400">Dhruwraj Health Care Records</p>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//           <input
//             placeholder="Search name or ID..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full sm:w-72
//           bg-white
//           border border-slate-200
//           rounded-xl
//           px-4 py-3
//           text-sm
//           shadow-sm
//           focus:outline-none
//           focus:ring-2 focus:ring-teal-500/20"
//           />
//           <button
//             onClick={() => setOpen(true)}
//             className="bg-teal-600
//           hover:bg-teal-700
//           text-white
//           font-bold
//           px-6
//           py-3
//           rounded-xl
//           shadow-md
//           transition"
//           >
//             + Add Patient
//           </button>
//         </div>
//       </div>

//       {/* Patient List */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filteredPatients.map((p) => (
//           <div key={p._id} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-start">
//               <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
//                 {p.patientId}
//               </span>
//               <span className="text-[10px] text-slate-400">{p.clinic?.location}</span>
//             </div>
//             <h3 className="font-bold text-slate-800 mt-2">{p.name}</h3>
//             <p className="text-sm text-slate-500">{p.phone}</p>
//             <div className="flex gap-2 mt-4">
//               <button onClick={() => editPatient(p)} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors">
//                 <Edit2 className="w-3.5 h-3.5" /> {user.role === "admin" ? "Edit" : "View Details"}
//               </button>
              
//               {/* FEATURE: DELETE ONLY FOR ADMIN */}
//               {user.role === "admin" && (
//                 <button onClick={() => triggerDelete(p._id)} className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-colors">
//                  <Trash2 className="w-3.5 h-3.5" /> Delete
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Form Modal */}
//       {open && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white p-6 rounded-2xl w-full max-w-[750px] max-h-[90vh] overflow-y-auto relative shadow-2xl">
//             <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>

//             <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-2">
//               {isReadOnly ? "Patient Details (View Only)" : "Patient Confidential Information"}
//             </h2>

//             <form onSubmit={savePatient} className="grid md:grid-cols-2 gap-4">
//               <div className="col-span-full bg-slate-900 text-white p-3 rounded-lg flex justify-between items-center">
//                 <span className="text-sm font-medium">PATIENT ID: <span className="text-teal-400 ml-2">{generatedId || "---"}</span></span>
//                 <span className="text-xs opacity-70">DATE: {new Date().toLocaleDateString()}</span>
//               </div>

//               {/* Pass isReadOnly to inputs */}
//               <Input name="name" label="Name" form={form} onChange={handleChange} disabled={isReadOnly} />
//               <div className="grid grid-cols-2 gap-2">
//                 <Input name="dob" label="DOB" type="date" form={form} onChange={handleChange} disabled={isReadOnly} />
//                 <Input name="age" label="Age" type="number" form={form} onChange={handleChange} disabled={isReadOnly} />
//               </div>

//               <Select name="gender" label="Sex" options={["M", "F", "Other"]} form={form} onChange={handleChange} disabled={isReadOnly} />
//               <Input name="phone" label="Telephone" form={form} onChange={handleChange} disabled={isReadOnly} />
//               <Input name="address" label="Address" className="col-span-full" form={form} onChange={handleChange} disabled={isReadOnly} />
              
//               <div className="grid grid-cols-2 gap-2">
//                 <Input name="city" label="City" form={form} onChange={handleChange} disabled={isReadOnly} />
//                 <Input name="state" label="State" form={form} onChange={handleChange} disabled={isReadOnly} />
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <Input name="pinCode" label="Pin Code" form={form} onChange={handleChange} disabled={isReadOnly} />
//                 <Input name="email" label="E-mail ID" form={form} onChange={handleChange} disabled={isReadOnly} />
//               </div>

//               <Input name="occupation" label="Occupation" form={form} onChange={handleChange} disabled={isReadOnly} />
//               <div className="grid grid-cols-2 gap-2">
//                 <Input name="height" label="Height" form={form} onChange={handleChange} disabled={isReadOnly} />
//                 <Input name="weight" label="Weight" form={form} onChange={handleChange} disabled={isReadOnly} />
//               </div>

//               <Input name="referredBy" label="Referred by/Found us" form={form} onChange={handleChange} disabled={isReadOnly} />
//               <Select name="maritalStatus" label="Marital Status" options={["Single", "Married", "Divorced", "Others"]} form={form} onChange={handleChange} disabled={isReadOnly} />

//               {user.role === "admin" && (
//                 <div className="col-span-full">
//                   <label className="text-xs font-semibold text-slate-500">Clinic Location</label>
//                   <select
//                     name="clinic"
//                     value={form.clinic || ""}
//                     onChange={handleChange}
//                     className="border mt-1 p-2.5 rounded-lg w-full text-sm bg-slate-50"
//                     required
//                     disabled={isReadOnly}
//                   >
//                     <option value="">Select Clinic</option>
//                     {clinics.map((c) => (
//                       <option key={c._id} value={c._id}>{c.location}</option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {/* FEATURE: HIDE SAVE BUTTON FOR NON-ADMINS ON EXISTING RECORDS */}
//               {!isReadOnly ? (
//                 <button className="col-span-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-teal-100 transition-all mt-4">
//                   {editing ? "UPDATE RECORD" : "SAVE PATIENT RECORD"}
//                 </button>
//               ) : (
//                 <div className="col-span-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-center mt-4 border border-dashed border-slate-300">
//                   READ ONLY MODE
//                 </div>
//               )}
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Popup */}
//       {deleteConfirm && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
//             <div className="flex flex-col items-center text-center">
//               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-bold text-slate-800">Confirm Delete</h3>
//               <p className="text-slate-500 mt-2 text-sm">Are you sure? This cannot be undone.</p>
//             </div>
//             <div className="flex gap-3 mt-8">
//               <button onClick={() => setDeleteConfirm(null)} className="flex-1 border py-3 rounded-xl">Cancel</button>
//               <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white py-3 rounded-xl shadow-lg shadow-red-200">Yes, Delete</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Updated Components to handle 'disabled' prop
// function Input({ label, name, form, onChange, type = "text", className = "", disabled = false }) {
//   return (
//     <div className={className}>
//       <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
//       <input
//         type={type}
//         name={name}
//         value={form[name] || ""}
//         onChange={onChange}
//         disabled={disabled}
//         className={`border mt-1 p-2.5 rounded-lg w-full text-sm outline-none transition-colors ${
//           disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "focus:border-teal-500 bg-white"
//         }`}
//       />
//     </div>
//   );
// }

// function Select({ label, name, options, form, onChange, disabled = false }) {
//   return (
//     <div>
//       <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
//       <select
//         name={name}
//         value={form[name] || ""}
//         onChange={onChange}
//         disabled={disabled}
//         className={`border mt-1 p-2.5 rounded-lg w-full text-sm outline-none transition-colors ${
//           disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "focus:border-teal-500 bg-white"
//         }`}
//       >
//         <option value="">Select</option>
//         {options.map((o) => (
//           <option key={o} value={o}>{o}</option>
//         ))}
//       </select>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit2, Search, Plus, X, User, Phone, MapPin, Calendar, Activity, ChevronRight } from "lucide-react";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [preview, setPreview] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const API_BASE = "http://localhost:5001/api";
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  useEffect(() => {
    fetchPatients();
    fetchClinics();
  }, []);

  useEffect(() => {
    if (open && !editing && user.role !== "admin") {
      const userClinicId = user.clinic?._id || user.clinic;
      setForm((prev) => ({ ...prev, clinic: userClinicId }));
      generatePatientId(userClinicId);
    }
  }, [open, editing]);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE}/patients`, config);
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    }
  };

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clinics`);
      setClinics(res.data);
    } catch (err) {
      console.error("Failed to fetch clinics", err);
    }
  };

  const generatePatientId = (clinicId) => {
    if (!clinicId) return;
    const clinic = clinics.find((c) => c._id === clinicId);
    if (clinic) {
      const count = patients.filter(
        (p) => (p.clinic?._id || p.clinic) === clinicId
      ).length;
      const newId = `${clinic.patientPrefix}${String(count + 1).padStart(3, "0")}`;
      setGeneratedId(newId);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "clinic") generatePatientId(value);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({});
    setGeneratedId("");
    setPreview("");
  };

  const savePatient = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const submissionData = { ...form, patientId: generatedId };

    Object.keys(submissionData).forEach((key) => {
      if (submissionData[key] !== null) data.append(key, submissionData[key]);
    });

    try {
      if (editing) {
        await axios.put(`${API_BASE}/patients/${editing}`, data, config);
      } else {
        await axios.post(`${API_BASE}/patients`, data, config);
      }
      handleClose();
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving patient data");
    }
  };

  const editPatient = (p) => {
    setEditing(p._id);
    setForm({ ...p, clinic: p.clinic?._id || p.clinic });
    setGeneratedId(p.patientId);
    setOpen(true);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
  );

  const isReadOnly = editing && user.role !== "admin";

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Patients
            </h1>

            <p className="text-slate-500 mt-1 italic">
              Manage clinic patient records professionally
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              <input
                placeholder="Search by name, ID or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 pl-11 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-semibold text-sm"
              />
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add New Patient
            </button>
          </div>
        </div>
      </div>
      

      {/* Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((p) => (
          <div key={p._id} className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[11px] font-bold tracking-widest uppercase">
                {p.patientId}
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                <MapPin className="w-3 h-3" />
                {p.clinic?.location || "N/A"}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{p.name}</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  {p.phone}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  Age: {p.age} • {p.gender}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex gap-3">
              <button 
                onClick={() => editPatient(p)} 
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-xl text-sm font-bold transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {user.role === "admin" ? "Edit Record" : "View Details"}
              </button>
              
              {user.role === "admin" && (
                <button 
                  onClick={() => setDeleteConfirm(p._id)} 
                  className="w-12 flex items-center justify-center bg-white border border-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modern Modal */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl my-auto relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-8 py-6 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {isReadOnly ? "Patient File" : editing ? "Edit Record" : "Registration"}
                </h2>
                <p className="text-sm text-slate-500 font-medium">Please verify all clinical information</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white rounded-full shadow-sm transition-all">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={savePatient} className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* ID Banner */}
                <div className="col-span-full flex items-center justify-between bg-teal-900 rounded-2xl p-5 text-white shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-800 p-2 rounded-lg">
                      <User className="w-5 h-5 text-teal-300" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-300 font-bold">System Patient ID</p>
                      <p className="text-lg font-mono font-bold">{generatedId || "PENDING..."}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-teal-300 font-bold">Status</p>
                    <p className="text-sm font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                      {isReadOnly ? "Authenticated" : "Active Session"}
                    </p>
                  </div>
                </div>

                <Input name="name" label="Full Name" placeholder="John Doe" form={form} onChange={handleChange} disabled={isReadOnly} />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input name="dob" label="Date of Birth" type="date" form={form} onChange={handleChange} disabled={isReadOnly} />
                  <Input name="age" label="Age" type="number" form={form} onChange={handleChange} disabled={isReadOnly} />
                </div>

                <Select name="gender" label="Gender" options={["M", "F", "Other"]} form={form} onChange={handleChange} disabled={isReadOnly} />
                <Input name="phone" label="Contact Number" placeholder="+91 00000 00000" form={form} onChange={handleChange} disabled={isReadOnly} />
                
                <div className="col-span-full">
                  <Input name="address" label="Residential Address" placeholder="Street, Landmark, Area" form={form} onChange={handleChange} disabled={isReadOnly} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input name="city" label="City" form={form} onChange={handleChange} disabled={isReadOnly} />
                  <Input name="state" label="State" form={form} onChange={handleChange} disabled={isReadOnly} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input name="pinCode" label="PIN Code" form={form} onChange={handleChange} disabled={isReadOnly} />
                  <Input name="email" label="Email Address" type="email" placeholder="email@example.com" form={form} onChange={handleChange} disabled={isReadOnly} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input name="height" label="Height (cm)" form={form} onChange={handleChange} disabled={isReadOnly} />
                  <Input name="weight" label="Weight (kg)" form={form} onChange={handleChange} disabled={isReadOnly} />
                </div>

                <Input name="occupation" label="Occupation" form={form} onChange={handleChange} disabled={isReadOnly} />
                <Select name="maritalStatus" label="Marital Status" options={["Single", "Married", "Divorced", "Others"]} form={form} onChange={handleChange} disabled={isReadOnly} />

                {user.role === "admin" && (
                  <div className="col-span-full bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Assigned Clinic</label>
                    <select
                      name="clinic"
                      value={form.clinic || ""}
                      onChange={handleChange}
                      className="mt-1 w-full bg-transparent text-sm font-bold outline-none cursor-pointer"
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">Select Location</option>
                      {clinics.map((c) => (
                        <option key={c._id} value={c._id}>{c.location} — {c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-10">
                {!isReadOnly ? (
                  <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-teal-100 transition-all flex items-center justify-center gap-2">
                    <ChevronRight className="w-5 h-5" />
                    {editing ? "Confirm & Update Record" : "Finalize & Save Patient"}
                  </button>
                ) : (
                  <div className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-bold text-center border-2 border-dashed border-slate-200 uppercase tracking-widest text-sm">
                    Read Only Archive
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="h-10 w-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Are you sure?</h3>
            <p className="text-slate-500 mt-2 font-medium">This action will permanently remove the patient record from the database.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-3.5 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, name, form, onChange, type = "text", placeholder = "", disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={form[name] || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all outline-none ${
          disabled 
          ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
          : "bg-white border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5"
        }`}
      />
    </div>
  );
}

function Select({ label, name, options, form, onChange, disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <select
        name={name}
        value={form[name] || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border transition-all outline-none appearance-none ${
          disabled 
          ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
          : "bg-white border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 cursor-pointer"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}



