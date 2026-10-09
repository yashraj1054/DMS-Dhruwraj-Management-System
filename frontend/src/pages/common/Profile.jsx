// import { useState } from "react";
// import axios from "axios";

// export default function Profile() {
//   const user = JSON.parse(localStorage.getItem("user"));

//   const [form, setForm] = useState({
//     currentPassword: "",

//     newPassword: "",
//   });

//   const [msg, setMsg] = useState("");

//   const handleChange = (e) => {
//     setForm({
//       ...form,

//       [e.target.name]: e.target.value,
//     });
//   };

//   const changePassword = async(e)=>{

//  e.preventDefault();

//  try{

//   await axios.put(

//    "https://dms-backend-amber.vercel.app/api/staff/change-password",

//    {

//     currentPassword:form.currentPassword,

//     newPassword:form.newPassword

//    },

//    {

//     headers:{

//      Authorization:`Bearer ${localStorage.getItem("token")}`

//     }

//    }

//   );

//   alert("Password updated");

//  }
//  catch(err){

//   console.log(err);

//  }

// };

//   return (
//     <div className="max-w-3xl">
//       <h1 className="text-lg font-semibold">Profile</h1>

//       <p className="text-sm text-slate-400 mb-6">Manage your account</p>

//       {/* profile card */}

//       <div className="bg-white p-6 rounded-xl border shadow-sm">
//         <div className="flex items-center gap-4 mb-6">
//           <img
//             src={`https://dms-backend-amber.vercel.app/uploads/${user.profileImage}`}
//             className="w-16 h-16 rounded-full object-cover border"
//           />

//           <div>
//             <p className="font-medium">{user.name}</p>

//             <p className="text-xs text-slate-400 capitalize">{user.role}</p>

//             <p className="text-xs text-slate-400">{`${user.clinicName} , ${user.clinicLocation}`}</p>
//           </div>
//         </div>

//         {/* details */}

//         <div className="grid md:grid-cols-2 gap-4 text-sm">
//           <Detail label="Name" value={user.name} />

//           <Detail label="Role" value={user.role} />

//           <Detail label="Clinic" value={`${user.clinicName} , ${user.clinicLocation}`} />

//           <Detail label="Staff ID" value={user.staffId} />
//         </div>
//       </div>

//       {/* change password */}

//       {/* <form
//         onSubmit={changePassword}
//         className="bg-white mt-6 p-6 rounded-xl border shadow-sm"
//       >
//         <h2 className="font-medium mb-4">Change Password</h2>

//         <input
//           type="password"
//           name="currentPassword"
//           placeholder="Current password"
//           value={form.currentPassword}
//           onChange={handleChange}
//           className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
//           required
//         />

//         <input
//           type="password"
//           name="newPassword"
//           placeholder="New password"
//           value={form.newPassword}
//           onChange={handleChange}
//           className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
//           required
//         />

//         {msg && <p className="text-xs text-teal-600 mb-2">{msg}</p>}

//         <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm">
//           Update Password
//         </button>
//       </form> */}
//     </div>
//   );
// }

// function Detail({ label, value }) {
//   return (
//     <div>
//       <p className="text-xs text-slate-400">{label}</p>

//       <p>{value}</p>
//     </div>
//   );
// }

import { useState } from "react";
import axios from "axios";
import {
  User,
  ShieldCheck,
  Mail,
  MapPin,
  Calendar,
  Phone,
  Briefcase,
  Award,
  Lock,
  Fingerprint,
  VenusAndMars,
  IndianRupee,
  Building,
} from "lucide-react";

export default function Profile() {
  // Use session storage or local storage consistently with your other components
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        "https://dms-backend-amber.vercel.app/api/staff/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Password updated successfully");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-slate-500 mt-1">
            View your personal details and account settings.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Verified Staff
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm text-center relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-24 bg-slate-50 -z-0"></div>

            <div className="relative z-10">
              <div className="relative inline-block">
                <img
                  src={`https://dms-backend-amber.vercel.app/uploads/${user.profileImage}`}
                  className="w-32 h-32 rounded-[40px] object-cover border-4 border-white shadow-xl mx-auto"
                  onError={(e) => {
                    e.target.src =
                      "https://ui-avatars.com/api/?name=" + user.name;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-teal-500 p-2 rounded-2xl border-4 border-white shadow-lg">
                  <Fingerprint className="w-5 h-5 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mt-6">
                {user.name}
              </h2>
              <p className="text-teal-600 font-bold text-xs uppercase tracking-[0.2em] mt-1">
                {user.role}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium">{user.staffId}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <Building className="w-4 h-4" />
                  <span className="font-medium">{user.clinicName}</span>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">
                    {" "}
                    {user.clinicLocation || "Main Branch"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          {/* <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Compensation</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <IndianRupee className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">₹{user.salary?.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-medium">Monthly Basic Salary</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon, className = "" }) {
  return (
    <div className={`group ${className}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="p-1 bg-slate-50 rounded-lg text-slate-400 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
          {icon}
        </span>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      </div>
      <p className="text-sm font-semibold text-slate-700 ml-7 tracking-tight">
        {value || "Not provided"}
      </p>
    </div>
  );
}
