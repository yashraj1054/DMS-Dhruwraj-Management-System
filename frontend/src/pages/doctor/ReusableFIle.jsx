// MyAppointments.jsx


import { useEffect, useState } from "react";
import axios from "axios";
import {
  UserRound,
  Stethoscope,
  FileText,
  Clock3,
  Calendar,
  X
} from "lucide-react";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [showLockModal, setShowLockModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const token = localStorage.getItem("token");

  // Helper function to safely extract local machine date string (YYYY-MM-DD)
  const getTodayDateString = () => new Date().toLocaleDateString('sv');

  // Core tracking state for running day auto-resets
  const [currentSystemDate, setCurrentSystemDate] = useState(getTodayDateString());

  // FULL STATE INITIALIZATION BASED ON SCREENSHOTS
  const INITIAL_FORM_DATA = {
    prescription: "",
    relief: "",

    pastHistory: {
      BP: { h: "", d: "", m: "", s: "" },
      DM: { h: "", d: "", m: "", s: "" },
      Thyroid: { h: "", d: "", m: "", s: "" },
      TBCAD: { h: "", d: "", m: "", s: "" },
      Others: { note: "" }
    },

    familyHistory: "",
    treatmentHistory: "",

    bowels: {
      vega: "",
      consistency: [],
      associated: [],
      evacuation: [],
      laxatives: ""
    },

    appetite: {
      hungry: "",
      timeToEat: "",
      lightheaded: "",
      drowsiness: "",
      disturbedBy: ""
    },

    gas: {
      features: [],
      intensity: "",
      medicine: "",
      others: ""
    },

    acidity: {
      features: [],
      timing: [],
      intensity: "",
      medicine: ""
    },

    tongue: {
      status: "",
      intensity: "",
      color: "",
      taste: "",
      others: ""
    },

    eyes: {
      pallor: "",
      icterus: "",
      vision: "",
      others: ""
    },

    urine: {
      vega: [],
      associated1: [],
      associated2: [],
      status: [],
      color: "",
      others: ""
    },

    sleep: {
      duration: "",
      intensity: "",
      pills: "",
      others: "",
      features: []
    },

    mind: {
      features: [],
      sattva: "",
      others: ""
    },

    relationships: {
      family: "",
      relation: "",
      emotion: ""
    },

    diet: [],

    allergies: {
      food: "",
      medicine: "",
      others: ""
    },

    addiction: {
      habits: [],
      others: ""
    },

    menstrual: {
      duration: "",
      flow: [],
      color: "",
      others: "",
      pain: "",
      discharge: "",
      smell: [],
      medicine: ""
    },

    obs: {
      G: "",
      P: "",
      A: "",
      L: "",
      cSection: "",
      normal: ""
    },

    examination: "",

    investigation: {
      provided: "",
      details: ""
    },

    prakriti: {
      vata: "",
      pitta: "",
      kapha: ""
    },

    diagnosis: "",

    chikitsa: "",

    advices: "",

    rx: {
      churan: "",
      tablets: "",
      others: ""
    }
  };

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // const [formData, setFormData] = useState({
  //   prescription: "", // Chief Complaints
  //   relief: "",
  //   pastHistory: {
  //     BP: { h: "", d: "", m: "", s: "" },
  //     DM: { h: "", d: "", m: "", s: "" },
  //     Thyroid: { h: "", d: "", m: "", s: "" },
  //     TBCAD: { h: "", d: "", m: "", s: "" },
  //     Others: { note: "" }
  //   },
  //   familyHistory: "",
  //   treatmentHistory: "",
  //   bowels: { vega: "", consistency: [], associated: [], evacuation: [], laxatives: "" },
  //   appetite: { hungry: "", timeToEat: "", lightheaded: "", drowsiness: "", disturbedBy: "" },
  //   gas: { features: [], intensity: "", medicine: "", others: "" },
  //   acidity: { features: [], timing: [], intensity: "", medicine: "" },
  //   tongue: { status: "", intensity: "", color: "", taste: "", others: "" },
  //   eyes: { pallor: "", icterus: "", vision: "", others: "" },
  //   urine: { vega: [], associated1: [], associated2: [], status: [], color: "", others: "" },
  //   sleep: { duration: "", intensity: "", pills: "", others: "", features: [] },
  //   mind: { features: [], sattva: "", others: "" },
  //   relationships: { family: "", relation: "", emotion: "" },
  //   diet: [],
  //   allergies: { food: "", medicine: "", others: "" },
  //   addiction: { habits: [], others: "" },
  //   menstrual: { duration: "", flow: [], color: "", others: "", pain: "", discharge: "", smell: [], medicine: "" },
  //   obs: { G: "", P: "", A: "", L: "", cSection: "", normal: "" },
  //   examination: "",
  //   investigation: { provided: "", details: "" },
  //   prakriti: { vata: "", pitta: "", kapha: "" },
  //   diagnosis: "",
  //   chikitsa: "",
  //   advices: "",
  //   rx: { churan: "", tablets: "", others: "" }
  // });

  const [followUps, setFollowUps] = useState([]);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchMyAppointments(); }, []);

  // BACKGROUND LIFECYCLE WATCHER: Audits the clock every minute to catch midnight rollovers
  useEffect(() => {
    const checkDateRollover = setInterval(() => {
      const actualToday = getTodayDateString();
      if (currentSystemDate !== actualToday) {
        setCurrentSystemDate(actualToday);
        fetchMyAppointments(); // Refresh records instantly when the day changes
      }
    }, 60000);

    return () => clearInterval(checkDateRollover);
  }, [currentSystemDate]);

  // const fetchMyAppointments = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:5001/api/appointments/my", config);
  //     setAppointments(res.data);
  //   } catch (err) { console.error(err); }
  // };

  const fetchMyAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/appointments/my", config);
      
      // Dynamic Smart Sort: Automatically prioritizes today's upcoming patient records at the top
      const sortedAppointments = (res.data || []).sort((a, b) => {
        const dateA = new Date(a.appointmentDate).toLocaleDateString('sv');
        const dateB = new Date(b.appointmentDate).toLocaleDateString('sv');
        const todayStr = getTodayDateString();

        if (dateA === todayStr && dateB !== todayStr) return -1;
        if (dateA !== todayStr && dateB === todayStr) return 1;
        return new Date(b.appointmentDate) - new Date(a.appointmentDate); // Standard chronological fallback
      });

      setAppointments(sortedAppointments);
    } catch (err) { 
      console.error("Failed fetching practitioners appointments:", err); 
    }
  };

  // const openAppointment = (appointment) => {
  //   setSelected(appointment);
  //   // RESET FIRST
  //   setFormData(INITIAL_FORM_DATA);
  //   setFollowUps([]);
  //   // LOAD SAVED DATA
  //   if (appointment.formData) {
  //     setFormData({
  //       ...INITIAL_FORM_DATA,
  //       ...appointment.formData,
  //     });
  //   }
  //   if (appointment.followUps) {
  //     setFollowUps(appointment.followUps);
  //   } else {
  //     setFollowUps([]);
  //   }
  // };

//   const openAppointment = async (appointment) => {

//     if (["completed"].includes(appointment.status?.toLowerCase())) {
//     alert("This appointment is completed and locked. It cannot be opened or modified.");
//     return; 
//   }
//   setSelected(appointment);
  
  
//   setFormData(INITIAL_FORM_DATA);
//   setFollowUps([]);

  
//   if (appointment.formData && Object.keys(appointment.formData).length > 0) {
//     setFormData({
//       ...INITIAL_FORM_DATA,
//       ...appointment.formData,
//     });
//     setFollowUps(appointment.followUps || []);
//     return; 
//   } 

  
//   if (appointment.patient?._id) {
//     try {
//       const res = await axios.get(
//         `http://localhost:5001/api/appointments/patient-history/${appointment.patient._id}`, 
//         config
//       );

      
//       if (res.data && res.data.formData) {
        
//         setFormData({
//           ...INITIAL_FORM_DATA,
//           ...res.data.formData,
//         });
//         setFollowUps(res.data.followUps || []);
//       } else {
//         console.log("No previous history found for this patient.");
//       }
//     } catch (err) {
      
//       console.error("Error fetching patient history:", err.message);
//     }
//   }
// };

const openAppointment = async (appointment) => {
  // Lock Check
  if (["completed"].includes(appointment.status?.toLowerCase())) {
    // alert("This appointment is completed and locked. It cannot be opened or modified.");
    setShowLockModal(true);
    return; 
  }
  
  setSelected(appointment);
  
  // 1. Reset to clean states immediately
  setFormData(INITIAL_FORM_DATA);
  setFollowUps([]);

  // Helper function to extract a clean YYYY-MM-DD string from an ISO timestamp
  const formatIncomingDate = (dateVal) => {
    if (!dateVal) return "";
    return dateVal.includes("T") ? dateVal.split("T")[0] : dateVal;
  };

  // Helper function to clean MongoDB internal properties and ensure empty string defaults
  const sanitizeFollowUpArray = (rawArray) => {
    if (!Array.isArray(rawArray)) return [];
    return rawArray.map(visit => ({
      date: formatIncomingDate(visit?.date),
      notes: visit?.notes || "",
      churan: visit?.churan || "",
      tablets: visit?.tablets || "",
      others: visit?.others || ""
    }));
  };

  // 2. If CURRENT active appointment already has workspace data, use it
  if (appointment.formData && Object.keys(appointment.formData).length > 0) {
    setFormData({
      ...INITIAL_FORM_DATA,
      ...appointment.formData,
    });
    
    const rawFollowUps = appointment.followUps || appointment.formData.followUps || [];
    setFollowUps(sanitizeFollowUpArray(rawFollowUps));
    return; 
  } 

  // 3. If current workspace is empty, fetch full historical data
  if (appointment.patient?._id) {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/appointments/patient-history/${appointment.patient._id}`, 
        config
      );

      console.log("👉 MY PATIENT HISTORY API RETURNED:", res.data);

      if (res.data) {
        // Populate Consultation Form details
        if (res.data.formData) {
          setFormData({
            ...INITIAL_FORM_DATA,
            ...res.data.formData,
          });
        } else {
          setFormData({
            ...INITIAL_FORM_DATA,
            ...res.data,
          });
        }

        // Pull the raw array directly from root level matching your exact console log
        const rawFollowUps = res.data.followUps || res.data.formData?.followUps || [];
        
        // Clean up data objects completely before sending to UI state machine
        const cleanedFollowUps = sanitizeFollowUpArray(rawFollowUps);
        
        setFollowUps(cleanedFollowUps);
        
      } else {
        console.log("No previous history found for this patient.");
      }
    } catch (err) {
      console.error("Error fetching patient history:", err.message);
    }
  }
};

  const updateField = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      let temp = { ...prev };
      let current = temp;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return temp;
    });
  };

  const toggleCheckbox = (path, item) => {
    const current = path.split('.').reduce((o, i) => o[i], formData) || [];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    updateField(path, updated);
  };

  const savePrescription = async () => {
    try {
      await axios.put(`http://localhost:5001/api/appointments/${selected._id}/prescription`, { formData, followUps }, config);
      alert("Full Medical Record Saved");
      fetchMyAppointments();
      setSelected(null);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen ">
      {/* Header */}
      <div className="mb-8 bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-5">
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
          My Appointments
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-lg">
          Ayurvedic Consultation & Follow-Up Management
        </p>
      </div>

      {/* Appointment List View */}
      {/* <div className="grid gap-4">
        {appointments.map((a) => (
          <div
            key={a._id}
            onClick={() => openAppointment(a)}
            className="cursor-pointer bg-[#f8f9fb] rounded-[28px] p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-white hover:shadow-xl hover:scale-[1.01] transition-all duration-300 active:scale-[0.98]"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              
              <div className="flex items-center gap-4">
                
                <div className="h-8 w-8 md:h-8 md:w-8 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
                  <UserRound size={20} className="text-teal-700" />
                </div>
                
                <div>
                  <h2 className="text-md md:text-md font-bold text-slate-800 leading-tight">
                    {a.patient?.name}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Patient ID: {a.patient?.patientId}
                  </p>
                </div>
              </div>

              
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                
                <div className="bg-[#eef1f7] px-3 py-2 rounded-2xl">
                  <p className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
                    <Calendar size={14} /> {new Date(a.appointmentDate).toLocaleDateString()} | <Clock3 size={14} /> {a.time}
                  </p>
                </div>
                
                <div
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold capitalize ${
                    ["viewed", "completed"].includes(a.status?.toLowerCase())
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {a.status || "pending"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}
      <div className="grid gap-4">
  {/* Filter the array out first so only matching calendar day entries remain */}
  {appointments.filter((a) => a.appointmentDate && new Date(a.appointmentDate).toLocaleDateString('sv') === currentSystemDate).length === 0 ? (
    <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-dashed border-slate-200 font-medium italic text-sm">
      No consultations scheduled for today.
    </div>
  ) : (
    appointments
      .filter((a) => a.appointmentDate && new Date(a.appointmentDate).toLocaleDateString('sv') === currentSystemDate)
      .map((a) => (
        <div
          key={a._id}
          onClick={() => openAppointment(a)}
          className="cursor-pointer bg-white border border-teal-200/80 shadow-md ring-2 ring-teal-500/5 rounded-[28px] p-5 md:p-6 transition-all duration-300 hover:scale-[1.012] active:scale-[0.98]"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">
              {/* STATUS ICON */}
              <div className="h-10 w-10 rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-500/20 flex items-center justify-center shrink-0">
                <UserRound size={20} />
              </div>
              
              {/* TEXT INFORMATION */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-md font-bold text-slate-800 leading-tight">
                    {a.patient?.name}
                  </h2>
                  <span className="bg-teal-100 text-teal-800 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase">
                    Today
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Patient ID: {a.patient?.patientId || "N/A"}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {/* DATE / TIME BADGE */}
              <div className="bg-[#eef1f7] px-3 py-2 rounded-2xl">
                <p className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <Calendar size={14} /> {new Date(a.appointmentDate).toLocaleDateString()} | <Clock3 size={14} /> {a.time}
                </p>
              </div>
              
              {/* CONSULTATION STATUS */}
              <div
                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize ${
                  ["viewed", "completed"].includes(a.status?.toLowerCase())
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {a.status || "pending"}
              </div>
            </div>
          </div>
        </div>
      ))
  )}
</div>

      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto p-3 md:p-6">
          <div className="bg-white rounded-2xl p-4 md:p-8 w-full max-w-7xl relative my-4 shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 md:right-6 text-3xl md:text-4xl leading-none text-slate-400 hover:text-slate-600 transition-colors">
              &times;
            </button>
            <h2 className="text-xl md:text-3xl font-bold mb-8 text-center uppercase tracking-widest border-b pb-4 mt-6 md:mt-0">
              Ayurvedic Consultation Form
            </h2>

            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">BASIC DETAILS</div>


            {/* PATIENT INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Patient Name</label>
                <input
                  value={selected.patient?.name || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Patient Name"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Patient ID</label>
                <input
                  value={selected.patient?.patientId || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Patient ID"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Phone</label>
                <input
                  value={selected.patient?.phone ? selected.patient.phone.slice(-4).padStart(selected.patient.phone.length, "X") : ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Phone"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Age</label>
                <input
                  value={selected.patient?.age || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Age"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">DOB</label>
                <input
                  value={selected.patient?.dob || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="DOB"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Gender</label>
                <input
                  value={selected.patient?.gender || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Gender"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Email</label>
                <input
                  value={selected.patient?.email || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Email"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Occupation</label>
                <input
                  value={selected.patient?.occupation || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Occupation"
                  readOnly
                />
              </div>
              <div className="flex flex-col col-span-2 gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Address</label>
                <input
                  value={`${selected.patient?.address || ""}, ${selected.patient?.city || ""}, ${selected.patient?.state || ""} - ${selected.patient?.pinCode || ""}`.trim()}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Address"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Height</label>
                <input
                  value={`${selected.patient?.height || ""} cms`} 
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Height"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Weight</label>
                <input
                  value={`${selected.patient?.weight || ""} kg`} 
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Weight"
                  readOnly
                />
              </div>
              <div className="flex flex-col col-span-2 gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Reffered By</label>
                <input
                  value={selected.patient?.referredBy || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Referred By"
                  readOnly
                />
              </div>
              <div className="flex flex-col col-span-2 gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Marital Status</label>
                <input
                  value={selected.patient?.maritalStatus || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Marital Status"
                  readOnly
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">CONSULTATION</div>


            {/* CHIEF COMPLAINTS & RELIEF MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border-2 border-slate-800 p-4 rounded-xl bg-slate-50/50">
                <h3 className="font-bold text-lg md:text-xl mb-3 text-center">RELIEF MATRIX</h3>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                  {["No Relief", "Little Relief", "Stable", "Improved", "Cured"].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors text-sm">
                      <input type="radio" className="w-4 h-4 accent-teal-700" checked={formData.relief === r} onChange={() => updateField("relief", r)} /> {r}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 border-2 border-slate-800 p-4 rounded-xl">
                <h3 className="font-bold text-lg md:text-xl mb-3">CHIEF COMPLAINTS</h3>
                <textarea 
                  value={formData.prescription} 
                  onChange={(e) => updateField("prescription", e.target.value)} 
                  rows={4} 
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" 
                  placeholder="Write chief complaints here..." 
                />
              </div>
            </div>

            {/* PAST MEDICAL HISTORY TABLE */}
            <div className="mb-8">
              <h3 className="font-bold text-lg md:text-xl mb-3 uppercase">Past Medical History</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full border-collapse min-w-[600px] text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border-b border-r border-slate-800 p-2">Condition</th>
                      <th className="border-b border-r border-slate-800 p-2">History (Y/N)</th>
                      <th className="border-b border-r border-slate-800 p-2">Duration</th>
                      <th className="border-b border-r border-slate-800 p-2">Medicine</th>
                      <th className="border-b border-slate-800 p-2">Current Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["BP", "DM", "Thyroid", "TBCAD"].map(k => (
                      <tr key={k}>
                        <td className="border-b border-r border-slate-800 p-2 font-bold bg-slate-50">{k === "TBCAD" ? "TB/CAD/Jaundice" : k}</td>
                        <td className="border-b border-r border-slate-800 p-1"><input className="w-full text-center outline-none bg-transparent" value={formData.pastHistory[k].h} onChange={(e) => updateField(`pastHistory.${k}.h`, e.target.value)} /></td>
                        <td className="border-b border-r border-slate-800 p-1"><input className="w-full text-center outline-none bg-transparent" value={formData.pastHistory[k].d} onChange={(e) => updateField(`pastHistory.${k}.d`, e.target.value)} /></td>
                        <td className="border-b border-r border-slate-800 p-1"><input className="w-full text-center outline-none bg-transparent" value={formData.pastHistory[k].m} onChange={(e) => updateField(`pastHistory.${k}.m`, e.target.value)} /></td>
                        <td className="border-b border-slate-800 p-1"><input className="w-full text-center outline-none bg-transparent" value={formData.pastHistory[k].s} onChange={(e) => updateField(`pastHistory.${k}.s`, e.target.value)} /></td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border-r border-slate-800 p-2 font-bold bg-slate-50">Others</td>
                      <td colSpan={4} className="p-1"><input className="w-full px-2 outline-none" value={formData.pastHistory.Others.note} onChange={(e) => updateField("pastHistory.Others.note", e.target.value)} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-bold text-sm shrink-0">Family History:</span>
                  <input className="border-b border-dotted border-slate-800 flex-1 outline-none text-sm py-1" value={formData.familyHistory} onChange={(e) => updateField("familyHistory", e.target.value)} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-bold text-sm shrink-0">Treatment History:</span>
                  <input className="border-b border-dotted border-slate-800 flex-1 outline-none text-sm py-1" value={formData.treatmentHistory} onChange={(e) => updateField("treatmentHistory", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">SYSTEMIC EXAMINATION</div>

            {/* BOWELS SECTION */}
            <div className="mb-8 border-b pb-6">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="text-lg md:text-xl font-bold text-teal-800">BOWELS</h3> 
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold uppercase text-slate-500">Frequency:</span> 
                  <input className="border border-slate-300 w-10 text-center rounded bg-white font-bold" value={formData.bowels.vega} onChange={(e) => updateField("bowels.vega", e.target.value)} /> 
                  <span className="text-xs text-slate-500">/day</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">Consistency</p>
                  <div className="space-y-2">
                    {["Hard", "Soft", "Loose", "Well Formed", "Mucoid"].map(i => (
                      <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700">
                        <input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.bowels.consistency.includes(i)} onChange={() => toggleCheckbox("bowels.consistency", i)} /> {i}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">Associated With</p>
                  <div className="space-y-2">
                    {["Urgency", "Strain", "Pain", "Bleeding", "Burning Sensation"].map(i => (
                      <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700">
                        <input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.bowels.associated.includes(i)} onChange={() => toggleCheckbox("bowels.associated", i)} /> {i}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">Evacuation</p>
                  <div className="space-y-2">
                    {["Complete", "Incomplete", "Incontinence"].map(i => (
                      <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700">
                        <input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.bowels.evacuation.includes(i)} onChange={() => toggleCheckbox("bowels.evacuation", i)} /> {i}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">Taking Laxatives</p>
                  <div className="flex flex-col gap-2">
                    {["Yes", "No"].map(i => (
                      <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700">
                        <input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.bowels.laxatives === i} onChange={() => updateField("bowels.laxatives", i)} /> {i}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* APPETITE SECTION */}
            <div className="bg-slate-50 p-4 md:p-6 mb-8 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-lg md:text-xl mb-4 text-teal-800">APPETITE AND DIGESTION</h3>
              <div className="space-y-4">
                {[
                  { label: "Do you feel hungry?", field: "hungry" },
                  { label: "You take food because it is time to eat?", field: "timeToEat" },
                  { label: "Do you feel lightheadedness before the next meal?", field: "lightheaded" },
                  { label: "Do you feel drowsiness after meals?", field: "drowsiness" }
                ].map(q => (
                  <div key={q.field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 last:border-0">
                    <span className="text-sm font-medium text-slate-700">{q.label}</span>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.appetite[q.field] === "Yes"} onChange={() => updateField(`appetite.${q.field}`, "Yes")} /> Yes</label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.appetite[q.field] === "No"} onChange={() => updateField(`appetite.${q.field}`, "No")} /> No</label>
                    </div>
                    {q.field === "hungry" && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0 sm:ml-4 flex-1">
                        <span className="text-xs font-bold uppercase text-slate-400">Disturbed by:</span>
                        <input className="w-full border-b border-slate-300 outline-none bg-transparent text-sm py-1 focus:border-teal-500 transition-colors" value={formData.appetite.disturbedBy} onChange={(e) => updateField("appetite.disturbedBy", e.target.value)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* GAS & ACIDITY SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-slate-100 pb-8">
              <div className="bg-slate-50 p-5 rounded-3xl">
                <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">Gas</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {["Bloating", "Passing with ease", "Passing with Difficulty", "Burps"].map(i => (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.gas.features.includes(i)} onChange={() => toggleCheckbox("gas.features", i)} /> {i}</label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-xs uppercase text-slate-500">Intensity</p>
                    {["Mild", "Moderate", "Severe"].map(i => (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.gas.intensity === i} onChange={() => updateField("gas.intensity", i)} /> {i}</label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl">
                <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">Acidity</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {["Heart burn", "Reflux", "Sour belching", "Bile"].map(i => (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.acidity.features.includes(i)} onChange={() => toggleCheckbox("acidity.features", i)} /> {i}</label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-xs uppercase text-slate-500">Intensity</p>
                    {["Mild", "Moderate", "Severe"].map(i => (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.acidity.intensity === i} onChange={() => updateField("acidity.intensity", i)} /> {i}</label>
                    ))}
                  </div>
                  
                </div>
              </div>
            </div>

            {/* TONGUE & EYES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">Tongue</h3>
                <div className="flex gap-6 mb-4">
                  {["Coated", "Uncoated"].map(i => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer font-semibold"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.tongue.status === i} onChange={() => updateField("tongue.status", i)} /> {i}</label>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Intensity:</span> 
                  {["Mild", "Moderate", "Severe"].map(i => (
                    <label key={i} className="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.tongue.intensity === i} onChange={() => updateField("tongue.intensity", i)} /> {i}</label>
                  ))}
                </div>
                <div className="space-y-3">
                  <input placeholder="Color" className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm" value={formData.tongue.color} onChange={(e) => updateField("tongue.color", e.target.value)} />
                  <input placeholder="Taste Perception" className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm" value={formData.tongue.taste} onChange={(e) => updateField("tongue.taste", e.target.value)} />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">Eyes</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-500 uppercase w-16">Pallor:</span> 
                    {["Mild", "Moderate", "Severe"].map(i => (
                      <label key={i} className="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.eyes.pallor === i} onChange={() => updateField("eyes.pallor", i)} /> {i}</label>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-500 uppercase w-16">Icterus:</span> 
                    {["Mild", "Moderate", "Severe"].map(i => (
                      <label key={i} className="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.eyes.icterus === i} onChange={() => updateField("eyes.icterus", i)} /> {i}</label>
                    ))}
                  </div>
                  <input placeholder="Vision details" className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm" value={formData.eyes.vision} onChange={(e) => updateField("eyes.vision", e.target.value)} />
                </div>
              </div>
            </div>

            {/* URINE SECTION */}
            <div className="mb-8 p-4 md:p-6 border border-slate-200 rounded-3xl bg-slate-50/30">
              <h3 className="font-bold text-lg md:text-xl mb-6 text-teal-800 uppercase tracking-wide">Urine</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">Vega</p>
                  <div className="space-y-2">
                    {["Day", "Night"].map(i => (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.urine.vega.includes(i)} onChange={() => toggleCheckbox("urine.vega", i)} /> {i}</label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">Association I</p>
                  <div className="space-y-2">
                    {["Urgency", "Strain", "Pain"].map(i => (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.urine.associated1.includes(i)} onChange={() => toggleCheckbox("urine.associated1", i)} /> {i}</label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">Association II</p>
                  <div className="space-y-2">
                    {["Fourthly", "Bleeding", "Burning Sensation"].map(i => (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.urine.associated2.includes(i)} onChange={() => toggleCheckbox("urine.associated2", i)} /> {i}</label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">Status</p>
                  <div className="space-y-2">
                    {["Satisfactory", "Unsatisfactory", "H/o Prostate"].map(i => (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.urine.status.includes(i)} onChange={() => toggleCheckbox("urine.status", i)} /> {i}</label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MIND & SLEEP SECTION */}
            <div className="bg-slate-50 p-4 md:p-6 mb-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 border border-slate-200">
              <div>
                <h3 className="font-bold text-lg mb-4 text-teal-800 uppercase">Sleep</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-bold text-slate-500 shrink-0">Duration:</span>
                  <input className="border-b border-slate-300 flex-1 bg-transparent outline-none py-1 text-sm focus:border-teal-500" value={formData.sleep.duration} onChange={(e) => updateField("sleep.duration", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    {["Normal", "Sound", "Dreams"].map(i => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.sleep.features.includes(i)} onChange={() => toggleCheckbox("sleep.features", i)} /> {i}</label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {["Disturbed", "Late Onset", "Disturbed in Middle"].map(i => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.sleep.features.includes(i)} onChange={() => toggleCheckbox("sleep.features", i)} /> {i}</label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4 text-teal-800 uppercase">Mind</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <p className="font-bold text-xs uppercase text-slate-400 mb-2">Features</p>
                    {["Depression", "Anxiety", "Short Tempered", "Mood Swings"].map(i => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.mind.features.includes(i)} onChange={() => toggleCheckbox("mind.features", i)} /> {i}</label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-xs uppercase text-slate-400 mb-2">Sattva</p>
                    {["Avara Sattva", "Pravar Sattva", "Madhyam Sattva"].map(i => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer font-medium"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.mind.sattva === i} onChange={() => updateField("mind.sattva", i)} /> {i}</label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ADDICTION & DIET */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 border border-slate-200 rounded-3xl bg-white shadow-sm">
              <div>
                <h3 className="font-bold text-lg underline mb-4 text-teal-800">DIET</h3>
                <div className="flex gap-6">
                  {["Veg", "Non-Veg", "Egg"].map(i => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer font-semibold"><input type="checkbox" className="w-5 h-5 rounded accent-teal-600" checked={formData.diet.includes(i)} onChange={() => toggleCheckbox("diet", i)} /> {i}</label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg underline mb-4 text-teal-800">ADDICTION / HABITS</h3>
                <div className="flex flex-wrap gap-4">
                  {["Tea", "Alcohol", "Smoking", "Coffee", "Tobacco", "Gutkha"].map(i => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:border-teal-500 transition-all"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.addiction.habits.includes(i)} onChange={() => toggleCheckbox("addiction.habits", i)} /> {i}</label>
                  ))}
                </div>
              </div>
            </div>

            {/* MENSTRUAL & OBS HISTORY */}
            <div className="mb-8 p-6 border border-slate-200 rounded-3xl bg-pink-50/20">
              <h3 className="font-bold text-xl mb-6 text-slate-800 uppercase tracking-wide border-b border-pink-100 pb-2">Menstrual History</h3>
              <div className="flex flex-wrap gap-6 mb-6 items-center">
                <span className="text-sm font-bold text-slate-500 uppercase">Flow:</span>
                {["Scanty", "Normal", "Excessive", "Clots"].map(i => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-5 h-5 rounded accent-pink-600" checked={formData.menstrual.flow.includes(i)} onChange={() => toggleCheckbox("menstrual.flow", i)} /> {i}</label>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-bold uppercase text-slate-400">
                 <div className="space-y-3">
                   <p className="border-l-2 border-pink-500 pl-2">Pain</p>
                   {["Nil", "Mild", "Moderate", "Severe"].map(i => <label key={i} className="flex items-center gap-2 font-normal text-slate-700 normal-case cursor-pointer"><input type="radio" className="w-4 h-4 accent-pink-600" checked={formData.menstrual.pain === i} onChange={() => updateField("menstrual.pain", i)} /> {i}</label>)}
                 </div>
                 <div className="space-y-3">
                   <p className="border-l-2 border-pink-500 pl-2">White Discharge</p>
                   {["Nil", "Mild", "Moderate", "Severe"].map(i => <label key={i} className="flex items-center gap-2 font-normal text-slate-700 normal-case cursor-pointer"><input type="radio" className="w-4 h-4 accent-pink-600" checked={formData.menstrual.discharge === i} onChange={() => updateField("menstrual.discharge", i)} /> {i}</label>)}
                 </div>
              </div>
              <div className="mt-8 border-t border-pink-100 pt-6">
                <h3 className="font-bold text-lg mb-6 text-slate-800 uppercase tracking-wide">OBS. HISTORY</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  {["G", "P", "A", "L"].map(k => (
                    <div key={k} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-pink-100">
                      <span className="font-black text-pink-600">{k}:</span>
                      <input className="w-full outline-none text-sm font-bold text-slate-700" value={formData.obs[k]} onChange={(e) => updateField(`obs.${k}`, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-6 bg-white p-4 rounded-3xl border border-pink-100">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-sm font-bold text-slate-500 shrink-0">C-Section:</span>
                    <input className="border-b border-slate-200 w-full outline-none py-1 focus:border-pink-500 text-sm" value={formData.obs.cSection} onChange={(e) => updateField("obs.cSection", e.target.value)} />
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-sm font-bold text-slate-500 shrink-0">Normal Delivery:</span>
                    <input className="border-b border-slate-200 w-full outline-none py-1 focus:border-pink-500 text-sm" value={formData.obs.normal} onChange={(e) => updateField("obs.normal", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* PRAKRITI TABLE & DIAGNOSIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-slate-900 text-white p-4 md:p-8 rounded-[40px] shadow-2xl">
              <div>
                <h3 className="font-black text-xl mb-6 text-teal-400 tracking-tighter uppercase">Prakriti / Naadi</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-700">
                  <table className="w-full border-collapse bg-slate-800/50">
                    <thead>
                      <tr className="bg-slate-800">
                        <th className="p-3 text-left text-xs uppercase text-slate-400">Vikriti</th>
                        <th className="p-3 text-xs uppercase text-slate-400">Vata</th>
                        <th className="p-3 text-xs uppercase text-slate-400">Pitta</th>
                        <th className="p-3 text-xs uppercase text-slate-400">Kapha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["Mild", "Moderate", "Severe"].map(lvl => (
                        <tr key={lvl} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                          <td className="p-3 text-sm font-black">{lvl}</td>
                          <td className="p-3 text-center"><input type="radio" className="w-5 h-5 accent-teal-500" name="vata" checked={formData.prakriti.vata === lvl} onChange={() => updateField("prakriti.vata", lvl)} /></td>
                          <td className="p-3 text-center"><input type="radio" className="w-5 h-5 accent-teal-500" name="pitta" checked={formData.prakriti.pitta === lvl} onChange={() => updateField("prakriti.pitta", lvl)} /></td>
                          <td className="p-3 text-center"><input type="radio" className="w-5 h-5 accent-teal-500" name="kapha" checked={formData.prakriti.kapha === lvl} onChange={() => updateField("prakriti.kapha", lvl)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-lg mb-2 text-teal-400 uppercase tracking-widest">Diagnosis</h3>
                  <textarea className="w-full border border-slate-700 p-4 bg-slate-800/50 rounded-3xl outline-none focus:ring-2 focus:ring-teal-500 text-sm placeholder:text-slate-600" rows={3} placeholder="Pathological inference..." value={formData.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2 text-teal-400 uppercase tracking-widest">Chikitsa Sutra</h3>
                  <textarea className="w-full border border-slate-700 p-4 bg-slate-800/50 rounded-3xl outline-none focus:ring-2 focus:ring-teal-500 text-sm placeholder:text-slate-600" rows={2} placeholder="Treatment line..." value={formData.chikitsa} onChange={(e) => updateField("chikitsa", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Rx SECTION */}
            <div className="mb-8 p-1">
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter text-slate-800 border-l-8 border-teal-700 pl-4">Rx - Prescription</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-slate-800 rounded-[32px] overflow-hidden shadow-xl">
                <div className="border-b md:border-b-0 md:border-r-2 border-slate-800 p-4 bg-white">
                  <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-3 border border-teal-100 uppercase text-xs">Churan / Powder</p>
                  <textarea className="w-full h-48 md:h-64 outline-none text-sm leading-relaxed placeholder:text-slate-300 resize-none" placeholder="Enter dosage..." value={formData.rx.churan} onChange={(e) => updateField("rx.churan", e.target.value)} />
                </div>
                <div className="border-b md:border-b-0 md:border-r-2 border-slate-800 p-4 bg-white">
                  <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-3 border border-teal-100 uppercase text-xs">Tablets / Vati</p>
                  <textarea className="w-full h-48 md:h-64 outline-none text-sm leading-relaxed placeholder:text-slate-300 resize-none" placeholder="Enter dosage..." value={formData.rx.tablets} onChange={(e) => updateField("rx.tablets", e.target.value)} />
                </div>
                <div className="p-4 bg-white">
                  <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-3 border border-teal-100 uppercase text-xs">Others / Syrup / Oil</p>
                  <textarea className="w-full h-48 md:h-64 outline-none text-sm leading-relaxed placeholder:text-slate-300 resize-none" placeholder="Special instructions..." value={formData.rx.others} onChange={(e) => updateField("rx.others", e.target.value)} />
                </div>
              </div>
            </div>

            {/* FOLLOW UP SECTION */}
            <div className="mt-12 border-t-4 border-slate-100 pt-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">FOLLOW UP VISITS</h2> 
                <button 
                  onClick={() => setFollowUps([...followUps, { date: "", notes: "", churan: "", tablets: "", others: "" }])} 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-4 rounded-[20px] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  + Add New Visit
                </button>
              </div>
              
              <div className="grid gap-6">
                {followUps.map((visit, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 p-6 rounded-[32px] shadow-lg relative group">
                    <button 
                      onClick={() => setFollowUps(followUps.filter((_, i) => i !== idx))}
                      className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full shadow-lg items-center justify-center hidden group-hover:flex"
                    >
                      &times;
                    </button>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 shrink-0">
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Visit Date</label>
                        <input type="date" className="w-full p-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 bg-white font-bold" value={visit.date ? visit.date.split("T")[0] : ""} onChange={(e) => { const f = [...followUps]; f[idx].date = e.target.value; setFollowUps(f); }} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Observation Notes</label>
                        <textarea className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 bg-white text-sm" rows={2} placeholder="Progression notes..." value={visit.notes} onChange={(e) => { const f = [...followUps]; f[idx].notes = e.target.value; setFollowUps(f); }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500">C:</span>
                        <input className="w-full border-2 border-slate-100 pl-8 pr-3 py-3 rounded-xl text-xs outline-none bg-white font-medium" placeholder="Churan changes" value={visit.churan} onChange={(e) => { const f = [...followUps]; f[idx].churan = e.target.value; setFollowUps(f); }} />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500">T:</span>
                        <input className="w-full border-2 border-slate-100 pl-8 pr-3 py-3 rounded-xl text-xs outline-none bg-white font-medium" placeholder="Tablet changes" value={visit.tablets} onChange={(e) => { const f = [...followUps]; f[idx].tablets = e.target.value; setFollowUps(f); }} />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500">O:</span>
                        <input className="w-full border-2 border-slate-100 pl-8 pr-3 py-3 rounded-xl text-xs outline-none bg-white font-medium" placeholder="Other changes" value={visit.others} onChange={(e) => { const f = [...followUps]; f[idx].others = e.target.value; setFollowUps(f); }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className=" bottom-4 md:bottom-8 mt-12 px-2 pb-2">
              <button 
                onClick={savePrescription} 
                className="w-full bg-slate-900 text-white py-6 rounded-[32px] text-xl font-black shadow-2xl hover:bg-teal-800 transition-all duration-500 active:scale-95 tracking-widest uppercase border-4 border-white/20"
              >
                SAVE ENTIRE MEDICAL RECORD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCK MODAL */}
      {showLockModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            
            {/* Warning Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-5 mx-auto border border-amber-200/60 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-black text-slate-800 text-center mb-2 tracking-tight uppercase">
              Consultation Locked
            </h3>
            <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed">
              This appointment is marked as <span className="font-bold text-teal-700">Completed</span> and is permanently locked. System integrity rules prevent historical write changes.
            </p>
            
            {/* Button */}
            <button
              onClick={() => setShowLockModal(false)}
              className="w-full bg-slate-900 hover:bg-teal-800 text-white font-black py-4 px-6 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-slate-900/10 active:scale-[0.98] uppercase tracking-wider"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

