// import { useEffect, useState } from "react";
// import axios from "axios";

// import {
//   Plus,
//   Search,
//   Edit2,
//   Trash2,
//   User,
//   Phone,
//   MapPin,
//   Briefcase,
//   Building2,
//   Calendar,
//   Shield,
//   CreditCard,
//   Image as ImageIcon,
//   IndianRupee,
//   Target,
//   Trophy,
// } from "lucide-react";

// import Modal from "../components/Modal";
// import ConfirmPassword from "../components/ConfirmPassword";

// export default function Staff() {
//   const [staff, setStaff] = useState([]);
//   const [clinics, setClinics] = useState([]);

//   const [search, setSearch] = useState("");

//   const [showModal, setShowModal] = useState(false);

//   const [editingId, setEditingId] = useState(null);

//   const [confirmBox, setConfirmBox] = useState(false);

//   const [selectedStaff, setSelectedStaff] = useState(null);

//   const [preview, setPreview] = useState(null);

//   const [certificatePreview, setCertificatePreview] = useState(null);

//   const [generatedId, setGeneratedId] = useState("");

//   /*
//   FORM STATE
//   */

//   const [form, setForm] = useState({
//     profileImage: null,
//     certificateImage: null,

//     name: "",
//     phone: "",
//     aadhaar: "",
//     address: "",
//     dob: "",
//     certificateNumber: "",

//     gender: "male",

//     role: "doctor",

//     clinic: "",

//     /*
//     SALARY STRUCTURE
//     */

//     ctc: "",

//     base: "",
//     hra: "",
//     da: "",
//     other: "",

//     target: "",
//     targetAchieved: "",

//     bonus: "",

//     password: "",
//   });

//   /*
//   FETCH DATA
//   */

//   const fetchData = async () => {
//     try {
//       const [staffRes, clinicRes] = await Promise.all([
//         axios.get("http://localhost:5001/api/staff"),

//         axios.get("http://localhost:5001/api/clinics"),
//       ]);

//       setStaff(staffRes.data);

//       setClinics(clinicRes.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   /*
//   HANDLE INPUT
//   */

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm({
//       ...form,

//       [name]: value,
//     });

//     /*
//     AUTO STAFF ID
//     */

//     if (name === "clinic") {
//       const clinic = clinics.find(
//         (c) => c._id === value,
//       );

//       if (clinic) {
//         const count = staff.filter(
//           (s) => s.clinic?._id === clinic._id,
//         ).length;

//         const id =
//           clinic.staffPrefix +
//           String(count + 1).padStart(3, "0");

//         setGeneratedId(id);
//       }
//     }
//   };

//   /*
//   IMAGE
//   */

//   const handleImage = (e) => {
//     const file = e.target.files[0];

//     setForm({
//       ...form,

//       profileImage: file,
//     });

//     setPreview(URL.createObjectURL(file));
//   };

//   const handleCertificateImage = (e) => {
//   const file = e.target.files[0];

//   setForm({
//     ...form,

//     certificateImage: file,
//   });

//   setCertificatePreview(
//     URL.createObjectURL(file),
//   );
// };

//   /*
//   OPEN ADD
//   */

//   const openAddModal = () => {
//     setEditingId(null);


//     setPreview(null);

//     setCertificatePreview(null);

//     setGeneratedId("");

//     setForm({
//       profileImage: null,
//       certificateImage: null,

//       name: "",
//       phone: "",
//       aadhaar: "",
//       address: "",
//       dob: "",
//       certificateNumber: "",

//       gender: "male",

//       role: "doctor",

//       clinic: "",

//       ctc: "",

//       base: "",
//       hra: "",
//       da: "",
//       other: "",

//       target: "",
//       targetAchieved: "",

//       bonus: "",

//       password: "",
//     });

//     setShowModal(true);
//   };

//   /*
//   OPEN EDIT
//   */

//   const openEditModal = (s) => {
//     setEditingId(s._id);

//     setCertificatePreview(
//   s.certificateImage
//     ? `http://localhost:5001/uploads/${s.certificateImage}`
//     : null,
// );

//     setForm({
//       profileImage: null,
//       certificateImage: null,

//       name: s.name,
//       phone: s.phone,
//       aadhaar: s.aadhaar,
//       address: s.address,
//       dob: s.dob,
//       certificateNumber: s.certificateNumber,

//       gender: s.gender,

//       role: s.role,

//       clinic: s.clinic?._id,

//       ctc: s.ctc,

//       base: s.salaryStructure?.base || "",
//       hra: s.salaryStructure?.hra || "",
//       da: s.salaryStructure?.da || "",
//       other: s.salaryStructure?.other || "",

//       target: s.target || "",
//       targetAchieved:
//         s.targetAchieved || "",

//       bonus: s.bonus || "",

//       password: "",
//     });

//     setPreview(
//       s.profileImage
//         ? `http://localhost:5001/uploads/${s.profileImage}`
//         : null,
//     );

//     setGeneratedId(s.staffId);

//     setShowModal(true);
//   };

//   /*
//   SAVE STAFF
//   */

//   const saveStaff = async (e) => {
//     e.preventDefault();

//     try {
//       const data = new FormData();

//       Object.keys(form).forEach((k) => {
//         if (form[k] !== null) {
//           data.append(k, form[k]);
//         }
//       });

//       if (editingId) {
//         await axios.put(
//           `http://localhost:5001/api/staff/${editingId}`,
//           data,
//         );
//       } else {
//         await axios.post(
//           "http://localhost:5001/api/staff",
//           data,
//         );
//       }

//       setShowModal(false);

//       fetchData();
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   /*
//   DELETE
//   */

//   const askDelete = (s) => {
//     setSelectedStaff(s);

//     setConfirmBox(true);
//   };

//   const confirmDelete = async (password) => {
//     if (password !== "admin123") {
//       alert("Wrong password");

//       return;
//     }

//     await axios.delete(
//       `http://localhost:5001/api/staff/${selectedStaff._id}`,
//     );

//     setConfirmBox(false);

//     fetchData();
//   };

//   /*
//   SEARCH
//   */

//   const filteredStaff = staff.filter(
//     (s) =>
//       s.name
//         ?.toLowerCase()
//         .includes(search.toLowerCase()) ||

//       s.role
//         ?.toLowerCase()
//         .includes(search.toLowerCase()) ||

//       s.phone?.includes(search) ||

//       s.clinic?.name
//         ?.toLowerCase()
//         .includes(search.toLowerCase()),
//   );

//   return (
//     <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
//       {/* HEADER */}

//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
//             Staff Directory
//           </h2>

//           <p className="text-slate-500 mt-1">
//             Manage clinic employees &
//             payroll
//           </p>
//         </div>

//         <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
//           {/* SEARCH */}

//           <div className="relative w-full sm:w-80 group">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

//             <input
//               placeholder="Search staff..."
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none"
//             />
//           </div>

//           {/* ADD BUTTON */}

//           <button
//             onClick={openAddModal}
//             className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2"
//           >
//             <Plus className="w-5 h-5" />
//             Add Staff
//           </button>
//         </div>
//       </div>

//       {/* STAFF GRID */}

//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//         {filteredStaff.map((s) => (
//           <div
//             key={s._id}
//             className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all"
//           >
//             {/* TOP */}

//             <div className="flex items-start gap-4 mb-6">
//               <div className="relative">
//                 <img
//                   src={`http://localhost:5001/uploads/${s.profileImage}`}
//                   alt={s.name}
//                   className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50"
//                   onError={(e) => {
//                     e.target.src =
//                       "https://ui-avatars.com/api/?name=" +
//                       s.name;
//                   }}
//                 />
//               </div>

//               <div className="flex-1">
//                 <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
//                   {s.role}
//                 </span>

//                 <h3 className="text-xl font-bold text-slate-800 mt-1">
//                   {s.name}
//                 </h3>

//                 <p className="text-xs text-slate-400">
//                   {s.staffId}
//                 </p>
//               </div>
//             </div>

//             {/* DETAILS */}

//             <div className="space-y-3 mb-5 bg-slate-50 p-4 rounded-2xl">
//               <div className="flex items-center gap-3 text-sm">
//                 <Building2 className="w-4 h-4 text-slate-400" />

//                 <span>
//                   {s.clinic?.name}
//                 </span>
//               </div>

//               <div className="flex items-center gap-3 text-sm">
//                 <Phone className="w-4 h-4 text-slate-400" />

//                 <span>{s.phone}</span>
//               </div>

//               <div className="flex items-center gap-3 text-sm">
//                 <MapPin className="w-4 h-4 text-slate-400" />

//                 <span>
//                   {s.clinic?.location}
//                 </span>
//               </div>
//             </div>

//             {/* SALARY */}

//             <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 mb-5 border border-teal-100">
//               <div className="flex items-center gap-2 mb-3">
//                 <IndianRupee className="w-4 h-4 text-teal-600" />

//                 <h4 className="font-semibold text-slate-700">
//                   Payroll Details
//                 </h4>
//               </div>

//               <div className="space-y-1 text-sm">
//                 <p>
//                   <strong>CTC:</strong> ₹
//                   {s.ctc || 0}
//                 </p>

//                 <p>
//                   <strong>Base:</strong> ₹
//                   {s.salaryStructure?.base || 0}
//                 </p>

//                 <p>
//                   <strong>HRA:</strong> ₹
//                   {s.salaryStructure?.hra || 0}
//                 </p>

//                 <p>
//                   <strong>DA:</strong> ₹
//                   {s.salaryStructure?.da || 0}
//                 </p>

//                 <p>
//                   <strong>Other:</strong> ₹
//                   {s.salaryStructure?.other || 0}
//                 </p>

//                 <p className="text-green-600 font-semibold">
//                   <strong>Bonus:</strong> ₹
//                   {s.bonus || 0}
//                 </p>

//                 <p className="text-lg font-bold text-teal-700 mt-2">
//                   Total Salary: ₹
//                   {s.totalSalary || 0}
//                 </p>
//               </div>
//             </div>

//             {s.certificateImage && (
//   <a
//     href={`http://localhost:5001/uploads/${s.certificateImage}`}
//     target="_blank"
//     rel="noreferrer"
//     className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold mt-3"
//   >
//     <Briefcase className="w-4 h-4" />
//     View Certificate
//   </a>
// )}

//             {/* TARGET */}

//             <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
//               <div className="flex items-center gap-2 mb-2">
//                 <Target className="w-4 h-4 text-orange-500" />

//                 <h4 className="font-semibold text-slate-700">
//                   Target Status
//                 </h4>
//               </div>

//               <p className="text-sm">
//                 Achieved:
//                 <span className="font-bold ml-2">
//                   {s.targetAchieved || 0}/
//                   {s.target || 0}
//                 </span>
//               </p>

//               {(s.targetAchieved || 0) >=
//                 (s.target || 0) && (
//                 <div className="flex items-center gap-2 text-green-600 text-sm font-semibold mt-2">
//                   <Trophy className="w-4 h-4" />
//                   Target Completed
//                 </div>
//               )}
//             </div>

//             {/* ACTIONS */}

//             <div className="flex gap-3">
//               <button
//                 onClick={() =>
//                   openEditModal(s)
//                 }
//                 className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50"
//               >
//                 <Edit2 className="w-3.5 h-3.5" />
//                 Edit
//               </button>

//               <button
//                 onClick={() =>
//                   askDelete(s)
//                 }
//                 className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-100"
//               >
//                 <Trash2 className="w-3.5 h-3.5" />
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* MODAL */}

//       {showModal && (
//         <Modal
//           title={
//             editingId
//               ? "Update Staff"
//               : "Register Staff"
//           }
//           onClose={() =>
//             setShowModal(false)
//           }
//         >
//           <form
//             onSubmit={saveStaff}
//             className="p-1"
//           >
//             {/* STAFF ID */}

//             <div className="bg-slate-900 rounded-2xl p-4 mb-6 text-white">
//               <div className="flex items-center gap-3">
//                 <Shield className="w-5 h-5 text-teal-400" />

//                 <div>
//                   <p className="text-xs uppercase text-slate-400">
//                     Staff ID
//                   </p>

//                   <p className="text-lg font-bold text-teal-400">
//                     {generatedId ||
//                       "PENDING"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* FORM GRID */}

//             <div className="grid md:grid-cols-2 gap-4">
//               {/* IMAGE */}

//               <div className="col-span-full">
//                 <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
//                   <ImageIcon className="w-3 h-3" />
//                   Profile Image
//                 </label>

//                 <div className="mt-2 flex items-center gap-4">
//                   <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden">
//                     {preview ? (
//                       <img
//                         src={preview}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <User className="text-slate-300" />
//                       </div>
//                     )}
//                   </div>

//                   <input
//                     type="file"
//                     onChange={handleImage}
//                     className="text-xs"
//                   />
//                 </div>
//               </div>

//               {/* BASIC */}

//               <Input
//                 name="name"
//                 label="Full Name"
//                 value={form.name}
//                 onChange={handleChange}
//                 icon={
//                   <User className="w-3.5 h-3.5" />
//                 }
//               />

//               <Input
//                 name="phone"
//                 label="Phone"
//                 value={form.phone}
//                 onChange={handleChange}
//                 icon={
//                   <Phone className="w-3.5 h-3.5" />
//                 }
//               />

//               <Input
//                 name="aadhaar"
//                 label="Aadhar Number"
//                 value={form.aadhaar}
//                 onChange={handleChange}
//                 icon={
//                   <CreditCard className="w-3.5 h-3.5" />
//                 }
//               />

//               <Input
//                 name="dob"
//                 label="DOB"
//                 type="date"
//                 value={form.dob}
//                 onChange={handleChange}
//                 icon={
//                   <Calendar className="w-3.5 h-3.5" />
//                 }
//               />

//               <div className="col-span-full">
//                 <Input
//                   name="address"
//                   label="Address"
//                   value={form.address}
//                   onChange={handleChange}
//                   icon={
//                     <MapPin className="w-3.5 h-3.5" />
//                   }
//                 />
//               </div>

//               {/* GENDER */}

//               <Select
//                 label="Gender"
//                 name="gender"
//                 value={form.gender}
//                 options={[
//                   "male",
//                   "female",
//                   "other",
//                 ]}
//                 onChange={handleChange}
//               />

//               {/* ROLE */}

//               <Select
//                 label="Role"
//                 name="role"
//                 value={form.role}
//                 options={[
//                   "doctor",
//                   "receptionist",
//                   "pharmacist",
//                   "therapist",
//                   "cleaning",
//                 ]}
//                 onChange={handleChange}
//               />

//               {/* CLINIC */}

//               <div>
//                 <label className="text-xs font-bold text-slate-500">
//                   Clinic
//                 </label>

//                 <select
//                   name="clinic"
//                   value={form.clinic}
//                   onChange={handleChange}
//                   className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full text-sm"
//                   required
//                 >
//                   <option value="">
//                     Select Clinic
//                   </option>

//                   {clinics.map((c) => (
//                     <option
//                       key={c._id}
//                       value={c._id}
//                     >
//                       {c.name} -{" "}
//                       {c.location}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* CERTIFICATE */}

//               <Input
//                 name="certificateNumber"
//                 label="Certificate Number"
//                 value={
//                   form.certificateNumber
//                 }
//                 onChange={handleChange}
//                 icon={
//                   <Briefcase className="w-3.5 h-3.5" />
//                 }
//               />

//               <div className="col-span-full">
//   <label className="text-xs font-bold text-slate-500 flex items-center gap-2 mb-2">
//     <Briefcase className="w-3.5 h-3.5" />
//     Certificate Upload
//   </label>

//   <input
//     type="file"
//     onChange={handleCertificateImage}
//     className="text-sm"
//   />

//   {certificatePreview && (
//     <div className="mt-3">
//       <img
//         src={certificatePreview}
//         alt="certificate"
//         className="w-40 h-28 object-cover rounded-xl border"
//       />

//       <a
//         href={certificatePreview}
//         target="_blank"
//         rel="noreferrer"
//         className="text-teal-600 text-sm font-semibold mt-2 inline-block"
//       >
//         View Certificate
//       </a>
//     </div>
//   )}
// </div>

//               {/* SALARY SECTION */}

//               <Input
//                 name="ctc"
//                 label="Yearly CTC"
//                 value={form.ctc}
//                 onChange={handleChange}
//                 icon={
//                   <IndianRupee className="w-3.5 h-3.5" />
//                 }
//               />

//               <Input
//                 name="base"
//                 label="Base Salary"
//                 value={form.base}
//                 onChange={handleChange}
//               />

//               <Input
//                 name="hra"
//                 label="HRA"
//                 value={form.hra}
//                 onChange={handleChange}
//               />

//               <Input
//                 name="da"
//                 label="DA"
//                 value={form.da}
//                 onChange={handleChange}
//               />

//               <Input
//                 name="other"
//                 label="Other Allowance"
//                 value={form.other}
//                 onChange={handleChange}
//               />

//               {/* TARGET */}

//               <Input
//                 name="target"
//                 label="Monthly Target"
//                 value={form.target}
//                 onChange={handleChange}
//                 icon={
//                   <Target className="w-3.5 h-3.5" />
//                 }
//               />

//               <Input
//                 name="targetAchieved"
//                 label="Target Achieved"
//                 value={
//                   form.targetAchieved
//                 }
//                 onChange={handleChange}
//               />

//               <Input
//                 name="bonus"
//                 label="Bonus"
//                 value={form.bonus}
//                 onChange={handleChange}
//                 icon={
//                   <Trophy className="w-3.5 h-3.5" />
//                 }
//               />

//               {/* PASSWORD */}

//               <Input
//                 name="password"
//                 label="Portal Password"
//                 type="password"
//                 value={form.password}
//                 onChange={handleChange}
//               />

//               {/* SUBMIT */}

//               <button
//                 type="submit"
//                 className="col-span-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl mt-4"
//               >
//                 {editingId
//                   ? "Update Staff"
//                   : "Save Staff"}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {/* DELETE */}

//       {confirmBox && (
//         <ConfirmPassword
//           onConfirm={confirmDelete}
//           onClose={() =>
//             setConfirmBox(false)
//           }
//         />
//       )}
//     </div>
//   );
// }

// /*
// INPUT COMPONENT
// */

// function Input({
//   label,
//   name,
//   value,
//   onChange,
//   type = "text",
//   icon,
// }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
//         {icon}
//         {label}
//       </label>

//       <input
//         name={name}
//         value={value || ""}
//         type={type}
//         onChange={onChange}
//         className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none"
//       />
//     </div>
//   );
// }

// /*
// SELECT COMPONENT
// */

// function Select({
//   label,
//   name,
//   value,
//   options,
//   onChange,
// }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
//         {label}
//       </label>

//       <select
//         name={name}
//         value={value}
//         onChange={onChange}
//         className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full text-sm font-medium"
//       >
//         {options.map((o) => (
//           <option key={o} value={o}>
//             {o.charAt(0).toUpperCase() +
//               o.slice(1)}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import axios from "axios";

import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Shield,
  CreditCard,
  Image as ImageIcon,
  IndianRupee,
  Target,
  Trophy,
  Eye,
EyeOff,
RefreshCcw,
Copy,
} from "lucide-react";

import Modal from "../components/Modal";
import ConfirmPassword from "../components/ConfirmPassword";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [clinics, setClinics] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [confirmBox, setConfirmBox] = useState(false);

  const [selectedStaff, setSelectedStaff] =
    useState(null);

  const [preview, setPreview] = useState(null);

  const [certificatePreview, setCertificatePreview] =
    useState(null);

  const [generatedId, setGeneratedId] =
    useState("");

  const [showPassword, setShowPassword] =
  useState(false);

const [generatedPassword, setGeneratedPassword] =
  useState("");

  /*
  FORM STATE
  */

  const [form, setForm] = useState({
    profileImage: null,
    certificateImage: null,

    name: "",
    phone: "",
    aadhaar: "",
    address: "",
    dob: "",
    certificateNumber: "",

    gender: "male",

    role: "doctor",

    clinic: "",

    ctc: "",

    base: "",
    hra: "",
    da: "",
    other: "",

    

    bonus: "",

    password: "",
  });

  /*
  FETCH
  */

  const fetchData = async () => {
    try {
      const [staffRes, clinicRes] =
        await Promise.all([
          axios.get(
            "http://localhost:5001/api/staff",
          ),

          axios.get(
            "http://localhost:5001/api/clinics",
          ),
        ]);

      setStaff(staffRes.data);

      setClinics(clinicRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /*
  HANDLE INPUT
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

setForm((prev) => ({
  ...prev,
  [name]: value,
}));

    /*
    AUTO STAFF ID
    */

    if (name === "clinic") {
      const clinic = clinics.find(
        (c) => c._id === value,
      );

      if (clinic) {
        const count = staff.filter(
          (s) => s.clinic?._id === clinic._id,
        ).length;

        const id =
          clinic.staffPrefix +
          String(count + 1).padStart(3, "0");

        setGeneratedId(id);
      }
    }
  };

  /*
  PROFILE IMAGE
  */

  const handleImage = (e) => {
    const file = e.target.files[0];

    setForm((prev) => ({
  ...prev,

  profileImage: file,
}));

    setPreview(URL.createObjectURL(file));
  };

  /*
  CERTIFICATE IMAGE
  */

  const handleCertificateImage = (e) => {
    const file = e.target.files[0];

    setForm((prev) => ({
  ...prev,

  certificateImage: file,
}));

    setCertificatePreview(
      URL.createObjectURL(file),
    );
  };

  /*
  ADD
  */

  const openAddModal = () => {
    setEditingId(null);

    setPreview(null);

    setCertificatePreview(null);

    setGeneratedId("");

    const autoPassword = Math.random()
  .toString(36)
  .slice(-8);

    setForm({
      profileImage: null,
      certificateImage: null,

      name: "",
      phone: "",
      aadhaar: "",
      address: "",
      dob: "",
      certificateNumber: "",

      gender: "male",

      role: "doctor",

      clinic: "",

      ctc: "",

      base: "",
      hra: "",
      da: "",
      other: "",

      
    

      bonus: "",

      password: autoPassword,
    });

    setShowModal(true);
  };

  /*
  EDIT
  */

  const openEditModal = (s) => {
    setEditingId(s._id);

    setCertificatePreview(
      s.certificateImage
        ? `http://localhost:5001/uploads/${s.certificateImage}`
        : null,
    );

    setForm({
      profileImage: null,
      certificateImage: null,

      name: s.name,
      phone: s.phone,
      aadhaar: s.aadhaar,
      address: s.address,
      dob: s.dob,
      certificateNumber:
        s.certificateNumber,

      gender: s.gender,

      role: s.role,

      clinic: s.clinic?._id,

      ctc: s.ctc,

      base:
        s.salaryStructure?.base || "",

      hra: s.salaryStructure?.hra || "",

      da: s.salaryStructure?.da || "",

      other:
        s.salaryStructure?.other || "",

      

      bonus: s.bonus || "",

      password: s.password || "",
    });

    setPreview(
      s.profileImage
        ? `http://localhost:5001/uploads/${s.profileImage}`
        : null,
    );

    setGeneratedId(s.staffId);

    setShowModal(true);
  };

  /*
  SAVE
  */

  const saveStaff = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(form).forEach((k) => {
        if (form[k] !== null) {
          data.append(k, form[k]);
        }
      });

      if (editingId) {
        await axios.put(
          `http://localhost:5001/api/staff/${editingId}`,
          data,
        );
      } else {
        await axios.post(
          "http://localhost:5001/api/staff",
          data,
        );
      }

      setShowModal(false);

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  /*
  DELETE
  */

  const askDelete = (s) => {
    setSelectedStaff(s);

    setConfirmBox(true);
  };

  const confirmDelete = async (password) => {
    if (password !== "admin123") {
      alert("Wrong password");

      return;
    }

    await axios.delete(
      `http://localhost:5001/api/staff/${selectedStaff._id}`,
    );

    setConfirmBox(false);

    fetchData();
  };

  /*
RESET PASSWORD
*/

const resetPassword = async (staffData) => {
  try {
    const res = await axios.post(
      "http://localhost:5001/api/staff/forgot-password",
      {
        phone: staffData.phone,
      },
    );

    setGeneratedPassword(
      res.data.password,
    );

    alert(
      `New Password: ${res.data.password}`,
    );

    fetchData();
  } catch (err) {
    console.log(err);

    alert("Password reset failed");
  }
};
  /*
  SEARCH
  */

  const filteredStaff = staff.filter(
    (s) =>
      s.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      s.role
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      s.phone?.includes(search) ||

      s.clinic?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-6">

        {/* HEADER */}

        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <User className="text-white w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                    Staff Management
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Manage employees,
                    payroll & targets
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

              {/* SEARCH */}

              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  placeholder="Search staff..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* ADD */}

              <button
                onClick={openAddModal}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Staff
              </button>
            </div>
          </div>
        </div>

        {/* STAFF GRID */}

        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">

          {filteredStaff.map((s) => (
            <div
              key={s._id}
              className="group relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white rounded-[28px] p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >

              {/* TOP LINE */}

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500"></div>

              {/* PROFILE */}

              <div className="flex items-start gap-4 mb-6">

                <div className="relative">
                  <img
                    src={`http://localhost:5001/uploads/${s.profileImage}`}
                    alt={s.name}
                    className="w-20 h-20 rounded-3xl object-cover ring-4 ring-white shadow-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=" +
                        s.name;
                    }}
                  />
                </div>

                <div className="flex-1">

                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm">
                    {s.role}
                  </span>

                  <h3 className="text-xl font-black text-slate-800 mt-2">
                    {s.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {s.staffId}
                  </p>
                </div>
              </div>

              {/* DETAILS */}

              <div className="space-y-3 mb-5 bg-slate-50/80 border border-slate-100 p-4 rounded-3xl">

                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" />

                  <span>
                    {s.clinic?.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />

                  <span>{s.phone}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />

                  <span>
                    {s.clinic?.location}
                  </span>
                </div>
              </div>

              {/* PAYROLL */}

              {/* <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-5 mb-5 text-white shadow-xl shadow-teal-500/20">

                <div className="flex items-center gap-2 mb-4">
                  <IndianRupee className="w-4 h-4" />

                  <h4 className="font-bold">
                    Payroll Details
                  </h4>
                </div>

                <div className="space-y-2 text-sm text-white/95">

                  <p>
                    <strong>CTC:</strong> ₹
                    {s.ctc || 0}
                  </p>

                  <p>
                    <strong>Base:</strong> ₹
                    {s.salaryStructure?.base ||
                      0}
                  </p>

                  <p>
                    <strong>HRA:</strong> ₹
                    {s.salaryStructure?.hra ||
                      0}
                  </p>

                  <p>
                    <strong>DA:</strong> ₹
                    {s.salaryStructure?.da ||
                      0}
                  </p>

                  <p>
                    <strong>Other:</strong> ₹
                    {s.salaryStructure?.other ||
                      0}
                  </p>

                  <p>
                    <strong>Bonus:</strong> ₹
                    {s.bonus || 0}
                  </p>

                  <p className="text-2xl font-black text-white mt-4">
                    ₹
                    {s.totalSalary || 0}
                  </p>
                </div>
              </div> */}

              {/* CERTIFICATE */}

              {s.certificateImage && (
                <a
                  href={`http://localhost:5001/uploads/${s.certificateImage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold mb-5"
                >
                  <Briefcase className="w-4 h-4" />
                  View Certificate
                </a>
              )}

              {/* TARGET */}

              {/* <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-5 mb-5">

                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-500" />

                  <h4 className="font-semibold text-slate-700">
                    Target Status
                  </h4>
                </div>

                <p className="text-sm">
                  Achieved:
                  <span className="font-bold ml-2">
                    {s.targetAchieved || 0}/
                    {s.target || 0}
                  </span>
                </p>

                {(s.targetAchieved || 0) >=
                  (s.target || 0) && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-semibold mt-3">
                    <Trophy className="w-4 h-4" />
                    Target Completed
                  </div>
                )}
              </div> */}

              {/* ACTIONS */}

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    openEditModal(s)
                  }
                  className="flex-1 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() =>
                    askDelete(s)
                  }
                  className="flex-1 h-11 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

                <button
  onClick={() =>
    resetPassword(s)
  }
  className="flex-2 h-11 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
>
  <RefreshCcw className="w-4 h-4" />
  Reset Password
</button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}

        {showModal && (
          <Modal
            title={
              editingId
                ? "Update Staff"
                : "Register Staff"
            }
            onClose={() =>
              setShowModal(false)
            }
          >

            <form
              onSubmit={saveStaff}
              className="space-y-6"
            >

              {/* STAFF ID */}

              <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 text-white shadow-2xl">

                <div className="flex items-center gap-3">

                  <Shield className="w-5 h-5 text-teal-400" />

                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      Staff ID
                    </p>

                    <p className="text-lg font-bold text-teal-400">
                      {generatedId ||
                        "PENDING"}
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* PROFILE */}

                <div className="col-span-full">

                  <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" />
                    Profile Image
                  </label>

                  <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">

                    <div className="w-20 h-20 rounded-3xl bg-slate-100 overflow-hidden shadow-md">

                      {preview ? (
                        <img
                          src={preview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      onChange={handleImage}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* INPUTS */}

                <Input
                  name="name"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  icon={
                    <User className="w-3.5 h-3.5" />
                  }
                />

                <Input
                  name="phone"
                  label="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  icon={
                    <Phone className="w-3.5 h-3.5" />
                  }
                />

                <Input
                  name="aadhaar"
                  label="Aadhar Number"
                  value={form.aadhaar}
                  onChange={handleChange}
                  icon={
                    <CreditCard className="w-3.5 h-3.5" />
                  }
                />

                <Input
                  name="dob"
                  label="DOB"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  icon={
                    <Calendar className="w-3.5 h-3.5" />
                  }
                />

                <div className="col-span-full">
                  <Input
                    name="address"
                    label="Address"
                    value={form.address}
                    onChange={handleChange}
                    icon={
                      <MapPin className="w-3.5 h-3.5" />
                    }
                  />
                </div>

                {/* SELECTS */}

                <Select
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  options={[
                    "male",
                    "female",
                    "other",
                  ]}
                  onChange={handleChange}
                />

                <Select
                  label="Role"
                  name="role"
                  value={form.role}
                  options={[
                    "doctor",
                    "receptionist",
                    "pharmacist",
                    "therapist",
                    "cleaning",
                  ]}
                  onChange={handleChange}
                />

                {/* CLINIC */}

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                    Clinic
                  </label>

                  <select
                    name="clinic"
                    value={form.clinic}
                    onChange={handleChange}
                    className="h-12 bg-white border border-slate-200 px-4 rounded-2xl w-full text-sm font-medium shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                  >
                    <option value="">
                      Select Clinic
                    </option>

                    {clinics.map((c) => (
                      <option
                        key={c._id}
                        value={c._id}
                      >
                        {c.name} -{" "}
                        {c.location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CERTIFICATE */}

                <Input
                  name="certificateNumber"
                  label="Certificate Number"
                  value={
                    form.certificateNumber
                  }
                  onChange={handleChange}
                  icon={
                    <Briefcase className="w-3.5 h-3.5" />
                  }
                />

                {/* CERTIFICATE IMAGE */}

                <div className="col-span-full">

                  <label className="text-xs font-bold text-slate-500 flex items-center gap-2 mb-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    Certificate Upload
                  </label>

                  <input
                    type="file"
                    onChange={
                      handleCertificateImage
                    }
                    className="text-sm"
                  />

                  {certificatePreview && (
                    <div className="mt-4">
                      <img
                        src={
                          certificatePreview
                        }
                        alt="certificate"
                        className="w-48 h-32 object-cover rounded-2xl border shadow-md"
                      />

                      <a
                        href={
                          certificatePreview
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-600 text-sm font-bold mt-2 inline-block"
                      >
                        View Certificate
                      </a>
                    </div>
                  )}
                </div>

                {/* PAYROLL */}

                <Input
                  name="ctc"
                  label="Yearly CTC"
                  value={form.ctc}
                  onChange={handleChange}
                  icon={
                    <IndianRupee className="w-3.5 h-3.5" />
                  }
                />

                <Input
                  name="base"
                  label="Base Salary"
                  value={form.base}
                  onChange={handleChange}
                />

                <Input
                  name="hra"
                  label="HRA"
                  value={form.hra}
                  onChange={handleChange}
                />

                <Input
                  name="da"
                  label="DA"
                  value={form.da}
                  onChange={handleChange}
                />

                <Input
                  name="other"
                  label="Other Allowance"
                  value={form.other}
                  onChange={handleChange}
                />

                {/* TARGET */}
{/* 
                <Input
                  name="target"
                  label="Monthly Target"
                  value={form.target}
                  onChange={handleChange}
                  icon={
                    <Target className="w-3.5 h-3.5" />
                  }
                /> */}

                <Input
                  name="targetAchieved"
                  label="Target Achieved"
                  value={
                    form.targetAchieved
                  }
                  onChange={handleChange}
                />

                <Input
                  name="bonus"
                  label="Bonus"
                  value={form.bonus}
                  onChange={handleChange}
                  icon={
                    <Trophy className="w-3.5 h-3.5" />
                  }
                />

                {/* PASSWORD */}

                <div className="relative">

  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 mb-1 flex items-center gap-2">
    <Shield className="w-3.5 h-3.5" />
    Portal Password
  </label>

  <input
    name="password"
    type={
      showPassword
        ? "text"
        : "password"
    }
    value={form.password}
    onChange={handleChange}
    className="h-12 bg-white border border-slate-200 px-4 pr-24 rounded-2xl w-full text-sm font-medium shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
  />

  <div className="absolute right-3 top-[38px] flex items-center gap-2">

    {/* SHOW/HIDE */}

    <button
      type="button"
      onClick={() =>
        setShowPassword(
          !showPassword,
        )
      }
      className="text-slate-500 hover:text-teal-600"
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>

    {/* COPY */}

    {form.password && (
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(
            form.password,
          );

          alert(
            "Password copied",
          );
        }}
        className="text-slate-500 hover:text-teal-600"
      >
        <Copy className="w-4 h-4" />
      </button>
    )}
  </div>
</div>
                {/* SAVE */}

                <button
                  type="submit"
                  className="col-span-full h-14 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black tracking-wide shadow-xl shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {editingId
                    ? "Update Staff"
                    : "Save Staff"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* DELETE */}

        {confirmBox && (
          <ConfirmPassword
            onConfirm={confirmDelete}
            onClose={() =>
              setConfirmBox(false)
            }
          />
        )}
      </div>
    </div>
  );
}

/*
INPUT
*/

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  icon,
}) {
  return (
    <div className="flex flex-col gap-1.5">

      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
        {icon}
        {label}
      </label>

      <input
        name={name}
        value={value || ""}
        type={type}
        onChange={onChange}
        className="h-12 bg-white border border-slate-200 px-4 rounded-2xl w-full text-sm font-medium shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
      />
    </div>
  );
}

/*
SELECT
*/

function Select({
  label,
  name,
  value,
  options,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-1.5">

      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-12 bg-white border border-slate-200 px-4 rounded-2xl w-full text-sm font-medium shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0).toUpperCase() +
              o.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
