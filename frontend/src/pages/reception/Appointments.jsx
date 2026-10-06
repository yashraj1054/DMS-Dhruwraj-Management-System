// import { useEffect, useState } from "react";
// import axios from "axios";
// import Select from "react-select";

// export default function Appointments() {
//   const [appointments, setAppointments] = useState([]);
//   const [patients, setPatients] = useState([]);
//   const [doctors, setDoctors] = useState([]);

//   const [open, setOpen] = useState(false);

//   const [form, setForm] = useState({
//     patient: "",
//     doctor: "",
//     appointmentDate: "",
//     time: "",
//     notes: "",
//   });

//   const API_BASE = "http://localhost:5001/api";

//   const user =
//     JSON.parse(localStorage.getItem("user")) || {};

//   const token = localStorage.getItem("token");

//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const timeSlots = [
//     "04:30 PM",
//     "04:45 PM",
//     "05:00 PM",
//     "05:15 PM",
//     "05:30 PM",
//     "05:45 PM",
//     "06:00 PM",
//     "06:15 PM",
//     "06:30 PM",
//     "06:45 PM",
//     "07:00 PM",
//     "07:15 PM",
//     "07:30 PM",
//     "07:45 PM",
//     "08:00 PM",
//   ];

//   useEffect(() => {
//     fetchAppointments();
//     fetchPatients();
//     fetchDoctors();
//   }, []);

//   const fetchAppointments = async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/appointments`,
//         config
//       );

//       setAppointments(res.data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchPatients = async () => {
//   try {
//     const token = localStorage.getItem("token");

//     console.log("TOKEN:", token);

//     const res = await axios.get(
//       "http://localhost:5001/api/patients",
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log("PATIENTS:", res.data);

//     setPatients(res.data || []);
//   } catch (err) {
//     console.error(
//       "PATIENT FETCH ERROR:",
//       err.response?.data || err.message
//     );
//   }
// };

//   const fetchDoctors = async () => {
//   try {
//     const res = await axios.get(
//       `${API_BASE}/staff/doctors`,
//       config
//     );

//     console.log("DOCTOR API RESPONSE:", res.data);

//     setDoctors(res.data || []);
//   } catch (err) {
//     console.error(
//       "DOCTOR FETCH ERROR:",
//       err.response?.data || err.message
//     );
//   }
// };

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleClose = () => {
//     setOpen(false);

//     setForm({
//       patient: "",
//       doctor: "",
//       appointmentDate: "",
//       time: "",
//       notes: "",
//     });
//   };

//   const saveAppointment = async (e) => {
//     e.preventDefault();

//     try {
//       await axios.post(
//         `${API_BASE}/appointments`,
//         {
//           ...form,
//           clinic: user.clinic,
//           createdBy: user._id,
//         },
//         config
//       );

//       alert("Appointment booked successfully");

//       fetchAppointments();

//       handleClose();
//     } catch (err) {
//       console.error(err);

//       alert(
//         err.response?.data?.message ||
//           "Failed to book appointment"
//       );
//     }
//   };

//   const patientOptions = patients.map((p) => ({
//     value: p._id,
//     label: `${p.patientId || "PID"} - ${p.name}`,
//   }));

//   const doctorOptions = doctors.map((d) => ({
//     value: d._id,
//     label: `Dr. ${d.name}`,
//   }));

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold">
//             Appointments
//           </h1>

//           <p className="text-gray-500">
//             Manage clinic appointments
//           </p>
//         </div>

//         <button
//           onClick={() => setOpen(true)}
//           className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl"
//         >
//           + Book Appointment
//         </button>
//       </div>

//       <div className="grid gap-4">
//         {appointments.length === 0 ? (
//           <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
//             No appointments found
//           </div>
//         ) : (
//           appointments.map((a) => (
//             <div
//               key={a._id}
//               className={`border rounded-xl p-5 shadow-sm ${
//                 a.status === "viewed"
//                   ? "bg-green-100 border-green-400"
//                   : "bg-white"
//               }`}
//             >
//               <div className="flex justify-between">
//                 <div>
//                   <h2 className="font-bold text-lg">
//                     {a.patient?.name}
//                   </h2>

//                   <p className="text-gray-600">
//                     Patient ID: {a.patient?.patientId}
//                   </p>

//                   <p className="text-gray-600">
//                     Doctor: Dr. {a.doctor?.name}
//                   </p>

//                   <p className="text-gray-600">
//                     Notes: {a.notes || "N/A"}
//                   </p>
//                 </div>

//                 <div className="text-right">
//                   <p className="font-semibold">
//                     {new Date(
//                       a.appointmentDate
//                     ).toLocaleDateString()}
//                   </p>

//                   <p>{a.time}</p>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {open && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-full max-w-2xl">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold">
//                 Book Appointment
//               </h2>

//               <button
//                 type="button"
//                 onClick={handleClose}
//                 className="text-2xl font-bold text-gray-500 hover:text-black"
//               >
//                 ×
//               </button>
//             </div>

//             <form
//               onSubmit={saveAppointment}
//               className="grid gap-5"
//             >
//               <div>
//                 <label className="block mb-2 font-medium">
//                   Search Patient
//                 </label>

//                 <Select
//                   options={patientOptions}
//                   placeholder="Search by Patient ID or Name"
//                   onChange={(selected) =>
//                     setForm({
//                       ...form,
//                       patient: selected.value,
//                     })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="block mb-2 font-medium">
//                   Search Doctor
//                 </label>

//                 <Select
//                   options={doctorOptions}
//                   placeholder="Search Doctor"
//                   onChange={(selected) =>
//                     setForm({
//                       ...form,
//                       doctor: selected.value,
//                     })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="block mb-2 font-medium">
//                   Appointment Date
//                 </label>

//                 <input
//                   type="date"
//                   name="appointmentDate"
//                   value={form.appointmentDate}
//                   onChange={handleChange}
//                   className="border p-3 rounded-lg w-full"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block mb-2 font-medium">
//                   Select Time Slot
//                 </label>

//                 <select
//                   name="time"
//                   value={form.time}
//                   onChange={handleChange}
//                   className="border p-3 rounded-lg w-full"
//                   required
//                 >
//                   <option value="">
//                     Select Slot
//                   </option>

//                   {timeSlots.map((slot) => (
//                     <option key={slot} value={slot}>
//                       {slot}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block mb-2 font-medium">
//                   Notes
//                 </label>

//                 <textarea
//                   name="notes"
//                   value={form.notes}
//                   onChange={handleChange}
//                   rows={4}
//                   className="border p-3 rounded-lg w-full"
//                   placeholder="Appointment notes..."
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3"
//               >
//                 Book Appointment
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import {
  CalendarDays,
  Search,
  Clock3,
  User,
  Stethoscope,
  FileText,
  Plus,
  Calendar
} from "lucide-react";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  
  const getTodayDateString = () => new Date().toLocaleDateString('sv');

  const [filterDate, setFilterDate] = useState(getTodayDateString());

  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    appointmentDate: "",
    time: "",
    notes: "",
  });

  const API_BASE = "http://localhost:5001/api";

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const timeSlots = [
    "04:30 PM",
    "04:45 PM",
    "05:00 PM",
    "05:15 PM",
    "05:30 PM",
    "05:45 PM",
    "06:00 PM",
    "06:15 PM",
    "06:30 PM",
    "06:45 PM",
    "07:00 PM",
    "07:15 PM",
    "07:30 PM",
    "07:45 PM",
    "08:00 PM",
  ];

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);


  // Auto-Reset: Tracks day rollovers and updates the filter state dynamically
useEffect(() => {
  const checkDateRollover = setInterval(() => {
    const actualToday = getTodayDateString();
    
    // If the internal clock shifts to a new day, update the calendar selection automatically
    if (filterDate !== actualToday) {
      setFilterDate(actualToday);
    }
  }, 60000); // 60-second check loop

  return () => clearInterval(checkDateRollover);
}, [filterDate]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/appointments`,
        config
      );

      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/patients`,
        config
      );

      setPatients(res.data || []);
    } catch (err) {
      console.error(
        "PATIENT FETCH ERROR:",
        err.response?.data || err.message
      );
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/staff/doctors`,
        config
      );

      setDoctors(res.data || []);
    } catch (err) {
      console.error(
        "DOCTOR FETCH ERROR:",
        err.response?.data || err.message
      );
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setOpen(false);

    setForm({
      patient: "",
      doctor: "",
      appointmentDate: "",
      time: "",
      notes: "",
    });
  };

  const saveAppointment = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_BASE}/appointments`,
        {
          ...form,
          clinic: user.clinic,
          createdBy: user._id,
        },
        config
      );

      alert("Appointment booked successfully");

      fetchAppointments();

      handleClose();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to book appointment"
      );
    }
  };

  const patientOptions = patients.map((p) => ({
    value: p._id,
    label: `${p.patientId || "PID"} - ${p.name}`,
  }));

  const doctorOptions = doctors.map((d) => ({
    value: d._id,
    label: `Dr. ${d.name}`,
  }));

  // FILTER + SEARCH
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const patientName =
        a.patient?.name?.toLowerCase() || "";

      const patientId =
        a.patient?.patientId?.toLowerCase() || "";

      const doctorName =
        a.doctor?.name?.toLowerCase() || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        patientName.includes(searchText) ||
        patientId.includes(searchText) ||
        doctorName.includes(searchText);

      // const appointmentDate = new Date(
      //   a.appointmentDate
      // )
      //   .toISOString()
      //   .split("T")[0];

      const appointmentDate = new Date(a.appointmentDate)
  .toLocaleDateString('sv');

      const matchesDate = filterDate
        ? appointmentDate === filterDate
        : true;

      return matchesSearch && matchesDate;
    });
  }, [appointments, search, filterDate]);

  return (
    <div className="min-h-screen  p-6">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Appointments
            </h1>

            <p className="text-slate-500 mt-1 italic">
              Manage clinic appointments professionally
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-2xl shadow-lg"
          >
            <Plus size={20} />
            Book Appointment
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search patient, doctor, patient ID..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-slate-50 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
              
            />
          </div>

          <div className="relative">
            <CalendarDays
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />

            <input
              type="date"
              value={filterDate}
              onChange={(e) =>
                setFilterDate(e.target.value)
              }
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-slate-50 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* APPOINTMENTS */}
      <div className="grid gap-5">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-500">
            No appointments found
          </div>
        ) : (
          filteredAppointments.map((a) => (
            <div
              key={a._id}
              className={`rounded-3xl border p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] ${
                a.status === "viewed"
                  ? "bg-green-50 border-green-300"
                  : "bg-white/90 border-white"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
                {/* LEFT */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-3 rounded-2xl">
                      <User
                        className="text-teal-700"
                        size={20}
                      />
                    </div>

                    <div>
                      <h2 className="font-bold text-xl text-slate-800">
                        {a.patient?.name}
                      </h2>

                      <p className="text-gray-500 text-sm">
                        Patient ID:{" "}
                        {a.patient?.patientId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Stethoscope size={18} />
                    <p>
                      Doctor:{" "}
                      <span className="font-semibold">
                        Dr. {a.doctor?.name}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700">
                    <FileText
                      size={18}
                      className="mt-1"
                    />

                    <p>
                      {a.notes || "No notes added"}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex lg:flex-col gap-5 lg:items-end">
                  <div className="bg-slate-100 px-5 py-3 rounded-2xl text-center">
                    

                    <div className="flex items-center justify-center gap-2 mt-1 text-gray-600">
                      <Calendar size={15} />
                    <p className="font text-slate-700">
                      
                      {new Date(
                        a.appointmentDate
                      ).toLocaleDateString()}
                    </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-1 text-gray-600">
                      <Clock3 size={15} />
                      <p>{a.time}</p>
                    </div>
                  </div>

                  <span
  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
    a.status === "completed"  || a.status === "viewed"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700"
  }`}
>
  {a.status || "Pending"}
</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-7 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-7">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">
                  Book Appointment
                </h2>

                <p className="text-gray-500">
                  Schedule patient consultation
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveAppointment}
              className="grid gap-5"
            >
              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  Search Patient
                </label>

                <Select
                  options={patientOptions}
                  placeholder="Search by Patient ID or Name"
                  onChange={(selected) =>
                    setForm({
                      ...form,
                      patient: selected.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  Search Doctor
                </label>

                <Select
                  options={doctorOptions}
                  placeholder="Search Doctor"
                  onChange={(selected) =>
                    setForm({
                      ...form,
                      doctor: selected.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  Appointment Date
                </label>

                <input
                  type="date"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                  className="border border-gray-200 p-3 rounded-2xl w-full focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  Select Time Slot
                </label>

                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="border border-gray-200 p-3 rounded-2xl w-full focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                >
                  <option value="">
                    Select Slot
                  </option>

                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  className="border border-gray-200 p-3 rounded-2xl w-full focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Appointment notes..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-95 text-white rounded-2xl py-4 font-semibold shadow-lg transition-all"
              >
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}