// import { useEffect, useState } from "react";
// import axios from "axios";

// import Modal from "../components/Modal";
// import ConfirmPassword from "../components/ConfirmPassword";

// export default function Clinics() {
//   const [clinics, setClinics] = useState([]);
//   const [search, setSearch] = useState("");

//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState(null);

//   const [confirmBox, setConfirmBox] = useState(false);
//   const [selectedClinic, setSelectedClinic] = useState(null);

//   const [form, setForm] = useState({
//     clinicId: "DHC",
//     name: "",
//     location: "",
//     city: "",
//     phone: "",
//     gstNumber: "",
//     patientPrefix: "DHC-",
//     staffPrefix: "DHC-",
//     invoicePrefix: "DHC-",
//   });

//   // fetch clinics
//   const fetchClinics = async () => {
//     const res = await axios.get("http://localhost:5001/api/clinics");

//     setClinics(res.data);
//   };

//   useEffect(() => {
//     fetchClinics();
//   }, []);

//   // input change
//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // open add modal
//   const openAddModal = () => {
//     setEditingId(null);

//     setForm({
//       clinicId: "DHC",
//       name: "",
//       location: "",
//       city: "",
//       phone: "",
//       gstNumber: "",
//       patientPrefix: "DHC-",
//       staffPrefix: "DHC-",
//       invoicePrefix: "DHC-",
//     });

//     setShowModal(true);
//   };

//   // open edit modal
//   const openEditModal = (clinic) => {
//     setEditingId(clinic._id);

//     setForm({
//       clinicId: clinic.clinicId || "DHC",
//       name: clinic.name || "",
//       location: clinic.location || "",
//       city: clinic.city || "",
//       phone: clinic.phone || "",
//       gstNumber: clinic.gstNumber || "",
//       patientPrefix: clinic.patientPrefix || "DHC-",
//       staffPrefix: clinic.staffPrefix || "DHC-",
//       invoicePrefix: clinic.invoicePrefix || "DHC-",
//     });

//     setShowModal(true);
//   };

//   // save clinic
//   const saveClinic = async (e) => {
//     e.preventDefault();

//     try {
//       if (editingId) {
//         await axios.put(`http://localhost:5001/api/clinics/${editingId}`, form);
//       } else {
//         await axios.post("http://localhost:5001/api/clinics", form);
//       }

//       setShowModal(false);

//       fetchClinics();
//     } catch (err) {
//       alert(err.response?.data?.message);
//     }
//   };

//   // ask password before delete
//   const askDelete = (clinic) => {
//     setSelectedClinic(clinic);

//     setConfirmBox(true);
//   };

//   // confirm delete
//   const confirmDelete = async (password) => {
//     if (password !== "admin123") {
//       alert("Wrong password");

//       return;
//     }

//     await axios.delete(
//       `http://localhost:5001/api/clinics/${selectedClinic._id}`,
//     );

//     setConfirmBox(false);

//     fetchClinics();
//   };

//   // search
//   const filtered = clinics.filter(
//     (c) =>
//       c.name.toLowerCase().includes(search.toLowerCase()) ||
//       c.city?.toLowerCase().includes(search.toLowerCase()) ||
//       c.location?.toLowerCase().includes(search.toLowerCase()) ||
//       c.clinicId.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <div>

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
//         <div>
//           <h2 className="text-xl font-semibold">Clinic</h2>
//           <p className="text-sm text-slate-400">Manage Clinics</p>
//         </div>
//       {/* search + button */}

//       <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto ">
//         <input
//           placeholder="Search clinic..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full sm:w-72
//           bg-white
//           border border-slate-200
//           rounded-xl
//           px-4 py-3
//           text-sm
//           shadow-sm
//           focus:outline-none
//           focus:ring-2 focus:ring-teal-500/20"
//         />

//         <button
//           onClick={openAddModal}
//           className="bg-teal-600
//           hover:bg-teal-700
//           text-white
//           font-bold
//           px-6
//           py-3
//           rounded-xl
//           shadow-md
//           transition"
//         >
//           + Add Clinic
//         </button>
//       </div>
//       </div>
      

//       {/* cards */}

//       <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
//         {filtered.map((c) => (
//           <div
//             key={c._id}
//             className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition"
//           >
//             <div className="flex justify-between items-center mb-2">
//               <h3 className="font-semibold text-slate-800">{c.name}</h3>

//               <span className="text-xs bg-slate-100 px-2 py-1 rounded">
//                 {c.clinicId}
//               </span>
//             </div>

//             <p className="text-sm text-slate-400">{c.location}</p>

//             <div className="mt-4 text-sm text-slate-600 space-y-1">
//               <p>City: {c.city}</p>

//               <p>Phone: {c.phone}</p>

//               <p>GST: {c.gstNumber}</p>
//             </div>

//             <div className="flex gap-2 mt-4">
//               <button
//                 onClick={() => openEditModal(c)}
//                 className="flex-1 border py-2 rounded-lg text-sm hover:bg-slate-50"
//               >
//                 Edit
//               </button>

//               <button
//                 onClick={() => askDelete(c)}
//                 className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* modal */}

//       {showModal && (
//         <Modal
//           title={editingId ? "Edit Clinic" : "Add Clinic"}
//           onClose={() => setShowModal(false)}
//         >
//           <form onSubmit={saveClinic} className="grid md:grid-cols-2 gap-4">
//             <Input
//               name="clinicId"
//               label="Clinic ID"
//               value={form.clinicId}
//               onChange={handleChange}
//             />
//             <Input
//               name="name"
//               label="Clinic Name"
//               value={form.name}
//               onChange={handleChange}
//             />
//             <Input
//               name="location"
//               label="Location"
//               value={form.location}
//               onChange={handleChange}
//             />
//             <Input
//               name="city"
//               label="City"
//               value={form.city}
//               onChange={handleChange}
//             />
//             <Input
//               name="phone"
//               label="Phone"
//               value={form.phone}
//               onChange={handleChange}
//             />
//             <Input
//               name="gstNumber"
//               label="GST Number"
//               value={form.gstNumber}
//               onChange={handleChange}
//             />
//             <Input
//               name="patientPrefix"
//               label="Patient Prefix"
//               value={form.patientPrefix}
//               onChange={handleChange}
//             />
//             <Input
//               name="staffPrefix"
//               label="Staff Prefix"
//               value={form.staffPrefix}
//               onChange={handleChange}
//             />
//             <Input
//               name="invoicePrefix"
//               label="Invoice Prefix"
//               value={form.invoicePrefix}
//               onChange={handleChange}
//             />

//             <button className="col-span-full bg-teal-600 text-white py-3 rounded-xl mt-2">
//               {editingId ? "Update Clinic" : "Save Clinic"}
//             </button>
//           </form>
//         </Modal>
//       )}

//       {confirmBox && (
//         <ConfirmPassword
//           onConfirm={confirmDelete}
//           onClose={() => setConfirmBox(false)}
//         />
//       )}
//     </div>
//   );
// }

// function Input({ label, name, value, onChange }) {
//   return (
//     <div>
//       <label className="text-xs text-slate-400">{label}</label>

//       <input
//         name={name}
//         value={value}
//         onChange={onChange}
//         className="border mt-1 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-teal-500 outline-none"
//         required
//       />
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, MapPin, Phone, Hash, CreditCard, Edit2, Trash2 } from "lucide-react"; // Using Lucide for premium icons

import Modal from "../components/Modal";
import ConfirmPassword from "../components/ConfirmPassword";

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmBox, setConfirmBox] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  const [form, setForm] = useState({
    clinicId: "DHC",
    name: "",
    location: "",
    city: "",
    phone: "",
    gstNumber: "",
    patientPrefix: "DHC-",
    staffPrefix: "DHC-",
    invoicePrefix: "DHC-",
  });

  const fetchClinics = async () => {
    const res = await axios.get("http://localhost:5001/api/clinics");
    setClinics(res.data);
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      clinicId: "DHC", name: "", location: "", city: "", phone: "",
      gstNumber: "", patientPrefix: "DHC-", staffPrefix: "DHC-", invoicePrefix: "DHC-",
    });
    setShowModal(true);
  };

  const openEditModal = (clinic) => {
    setEditingId(clinic._id);
    setForm({
      clinicId: clinic.clinicId || "DHC",
      name: clinic.name || "",
      location: clinic.location || "",
      city: clinic.city || "",
      phone: clinic.phone || "",
      gstNumber: clinic.gstNumber || "",
      patientPrefix: clinic.patientPrefix || "DHC-",
      staffPrefix: clinic.staffPrefix || "DHC-",
      invoicePrefix: clinic.invoicePrefix || "DHC-",
    });
    setShowModal(true);
  };

  const saveClinic = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5001/api/clinics/${editingId}`, form);
      } else {
        await axios.post("http://localhost:5001/api/clinics", form);
      }
      setShowModal(false);
      fetchClinics();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const askDelete = (clinic) => {
    setSelectedClinic(clinic);
    setConfirmBox(true);
  };

  const confirmDelete = async (password) => {
    if (password !== "admin123") {
      alert("Wrong password");
      return;
    }
    await axios.delete(`http://localhost:5001/api/clinics/${selectedClinic._id}`);
    setConfirmBox(false);
    fetchClinics();
  };

  const filtered = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.clinicId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Clinics</h2>
          <p className="text-slate-500 mt-1">Manage your healthcare network and prefixes.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              placeholder="Search by name, ID or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none"
            />
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Clinic
          </button>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filtered.map((c) => (
          <div
            key={c._id}
            className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
               <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-100">
                {c.clinicId}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-teal-700 transition-colors">{c.name}</h3>
            
            <div className="flex items-center gap-1.5 text-slate-400 mb-6">
              <MapPin className="w-3.5 h-3.5" />
              <p className="text-xs font-medium uppercase tracking-tight">{c.city || 'No City'}, {c.location}</p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg"><Phone className="w-4 h-4 text-slate-400" /></div>
                <span className="font-medium">{c.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg"><CreditCard className="w-4 h-4 text-slate-400" /></div>
                <span className="font-medium">{c.gstNumber || "No GST"}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => openEditModal(c)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => askDelete(c)}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editingId ? "Update Clinic Details" : "Create New Clinic"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={saveClinic} className="grid md:grid-cols-2 gap-x-6 gap-y-4 p-2">
            <Input name="clinicId" label="Clinic ID" value={form.clinicId} onChange={handleChange} />
            <Input name="name" label="Clinic Name" value={form.name} onChange={handleChange} />
            <Input name="location" label="Location" value={form.location} onChange={handleChange} />
            <Input name="city" label="City" value={form.city} onChange={handleChange} />
            <Input name="phone" label="Phone Number" value={form.phone} onChange={handleChange} />
            <Input name="gstNumber" label="GST Number" value={form.gstNumber} onChange={handleChange} />
            
            <div className="col-span-full border-t border-slate-100 my-2 pt-4">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Internal Prefixes</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input name="patientPrefix" label="Patient" value={form.patientPrefix} onChange={handleChange} />
                  <Input name="staffPrefix" label="Staff" value={form.staffPrefix} onChange={handleChange} />
                  <Input name="invoicePrefix" label="Invoice" value={form.invoicePrefix} onChange={handleChange} />
               </div>
            </div>

            <button className="col-span-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4">
              {editingId ? "Save Changes" : "Create Clinic"}
            </button>
          </form>
        </Modal>
      )}

      {confirmBox && (
        <ConfirmPassword
          onConfirm={confirmDelete}
          onClose={() => setConfirmBox(false)}
        />
      )}
    </div>
  );
}

function Input({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all"
        required
      />
    </div>
  );
}
