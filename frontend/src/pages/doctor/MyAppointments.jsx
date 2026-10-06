import { useEffect, useState } from "react";
import axios from "axios";
import {
  UserRound,
  Stethoscope,
  FileText,
  Clock3,
  Calendar,
  X,
} from "lucide-react";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [showLockModal, setShowLockModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Helper function to safely extract local machine date string (YYYY-MM-DD)
  const getTodayDateString = () => new Date().toLocaleDateString("sv");

  // Core tracking state for running day auto-resets
  const [currentSystemDate, setCurrentSystemDate] =
    useState(getTodayDateString());

  // diet chart state
  const [showDietChart, setShowDietChart] = useState(false);

  const [showHowToTake, setShowHowToTake] = useState(false);

  const toggleDietChart = (section, item) => {
    const current = formData.dietChart[section] || [];

    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];

    setFormData((prev) => ({
      ...prev,
      dietChart: {
        ...prev.dietChart,
        [section]: updated,
      },
    }));
  };

  // FULL STATE INITIALIZATION BASED ON SCREENSHOTS
  const INITIAL_FORM_DATA = {
    prescription: [
    {
      date: new Date().toISOString().split("T")[0],
      medicine: "",
    },
  ],
    relief: "",

    pastHistory: {
      BP: { h: "", d: "", m: "", s: "" },
      DM: { h: "", d: "", m: "", s: "" },
      Thyroid: { h: "", d: "", m: "", s: "" },
      TBCAD: { h: "", d: "", m: "", s: "" },
      Others: { note: "" },
    },

    familyHistory: "",
    treatmentHistory: "",

    bowels: {
      vega: "",
      consistency: [],
      associated: [],
      evacuation: [],
      laxatives: "",
    },

    appetite: {
      hungry: "",
      timeToEat: "",
      lightheaded: "",
      drowsiness: "",
      disturbedBy: "",
    },

    gas: {
      features: [],
      intensity: "",
      medicine: "",
      others: "",
      notes:"",
    },

    acidity: {
      features: [],
      timing: [],
      intensity: "",
      medicine: "",
      notes:"",
    },

    tongue: {
      status: "",
      intensity: "",
      color: "",
      taste: "",
      others: "",
    },

    eyes: {
      pallor: "",
      icterus: "",
      vision: "",
      others: "",
    },

    urine: {
      vega: [],
      associated1: [],
      associated2: [],
      status: [],
      color: "",
      others: "",
    },

    sleep: {
      duration: "",
      intensity: "",
      pills: "",
      others: "",
      features: [],
    },

    mind: {
      features: [],
      sattva: "",
      others: "",
    },

    relationships: {
      family: "",
      relation: "",
      emotion: "",
    },

    diet: [],

    dietChart: {
      grains: [],
      flour: [],
      dryFruits: [],
      pulses: [],
      vegetables: [],
      fruits: [],
      drinks: [],
      dairy: [],
      spices: [],
      sweets: [],
      nextAppointment: "",
    },

    allergies: {
      food: "",
      medicine: "",
      others: "",
    },

    addiction: {
      habits: [],
      others: "",
    },

    menstrual: {
      duration: "",
      flow: [],
      color: "",
      others: "",
      pain: "",
      discharge: "",
      smell: [],
      medicine: "",
    },

    obs: {
      G: "",
      P: "",
      A: "",
      L: "",
      cSection: "",
      normal: "",
    },

    examination: "",

    investigation: {
      provided: "",
      details: "",
    },

    prakriti: {
      vata: "",
      pitta: "",
      kapha: "",
    },

    diagnosis: "",

    chikitsa: "",

    advices: "",

    rx: {
      churan: [],
      tablets: [],
      others: [],
    },

    howToTake: {
      beforeFood: [],
      afterFood: [],
      emptyStomach: [],
      withWater: [],
      withMilk: [],
      specialInstructions: "",
    },
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

  const addPrescription = () => {
  setFormData((prev) => ({
    ...prev,
    prescription: [
      ...(prev.prescription || []),
      {
        date: new Date().toISOString().split("T")[0],
        medicine: "",
      },
    ],
  }));
};

const updatePrescription = (index, field, value) => {
  const updated = [...formData.prescription];

  updated[index][field] = value;

  setFormData((prev) => ({
    ...prev,
    prescription: updated,
  }));
};

const removePrescription = (index) => {
  setFormData((prev) => ({
    ...prev,
    prescription: prev.prescription.filter((_, i) => i !== index),
  }));
};

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchMyAppointments();
  }, []);

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
      const res = await axios.get(
        "http://localhost:5001/api/appointments/my",
        config,
      );

      // Dynamic Smart Sort: Automatically prioritizes today's upcoming patient records at the top
      const sortedAppointments = (res.data || []).sort((a, b) => {
        const dateA = new Date(a.appointmentDate).toLocaleDateString("sv");
        const dateB = new Date(b.appointmentDate).toLocaleDateString("sv");
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

  // const safeRx = {
  //   churan: Array.isArray(appointment?.formData?.rx?.churan)
  //     ? appointment.formData.rx.churan
  //     : [],

  //   tablets: Array.isArray(appointment?.formData?.rx?.tablets)
  //     ? appointment.formData.rx.tablets
  //     : [],

  //   others: appointment?.formData?.rx?.others || "",
  // };

  const addRxItem = (type) => {
    setFormData((prev) => ({
      ...prev,
      rx: {
        ...prev.rx,
        [type]: [...prev.rx[type], { name: "", qty: "" }],
      },
    }));
  };

  const removeRxItem = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      rx: {
        ...prev.rx,
        [type]: prev.rx[type].filter((_, i) => i !== index),
      },
    }));
  };

  const updateRxItem = (type, index, field, value) => {
    const updated = [...formData.rx[type]];
    updated[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      rx: {
        ...prev.rx,
        [type]: updated,
      },
    }));
  };

  const generateMedicineId = (count, date = new Date()) => {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const month =
    typeof date === "string"
      ? months[new Date(date).getMonth()]
      : months[date.getMonth()];

  return `MDHCV-${month}-${String(count).padStart(4, "0")}`;
};

  // const openAppointment = async (appointment) => {
  //   // Lock Check
  //   if (["completed"].includes(appointment.status?.toLowerCase())) {
  //     // alert("This appointment is completed and locked. It cannot be opened or modified.");
  //     setShowLockModal(true);
  //     return;
  //   }

  //   setSelected(appointment);

  //   // 1. Reset to clean states immediately
  //   setFormData(INITIAL_FORM_DATA);
  //   setFollowUps([]);

  //   // Helper function to extract a clean YYYY-MM-DD string from an ISO timestamp
  //   const formatIncomingDate = (dateVal) => {
  //     if (!dateVal) return "";
  //     return dateVal.includes("T") ? dateVal.split("T")[0] : dateVal;
  //   };

  //   // Helper function to clean MongoDB internal properties and ensure empty string defaults
  //   const sanitizeFollowUpArray = (rawArray) => {
  //     if (!Array.isArray(rawArray)) return [];
  //     return rawArray.map(visit => ({
  //       date: formatIncomingDate(visit?.date),
  //       notes: visit?.notes || "",
  //       churan: visit?.churan || "",
  //       tablets: visit?.tablets || "",
  //       others: visit?.others || ""
  //     }));
  //   };

  //   // 2. If CURRENT active appointment already has workspace data, use it
  //   if (appointment.formData && Object.keys(appointment.formData).length > 0) {
  //     setFormData({
  //       ...INITIAL_FORM_DATA,
  //       ...appointment.formData,
  //     });

  //     const rawFollowUps = appointment.followUps || appointment.formData.followUps || [];
  //     setFollowUps(sanitizeFollowUpArray(rawFollowUps));
  //     return;
  //   }

  //   // 3. If current workspace is empty, fetch full historical data
  //   if (appointment.patient?._id) {
  //     try {
  //       const res = await axios.get(
  //         `http://localhost:5001/api/appointments/patient-history/${appointment.patient._id}`,
  //         config
  //       );

  //       console.log("👉 MY PATIENT HISTORY API RETURNED:", res.data);

  //       if (res.data) {
  //         // Populate Consultation Form details
  //         if (res.data.formData) {
  //           setFormData({
  //             ...INITIAL_FORM_DATA,
  //             ...res.data.formData,
  //           });
  //         } else {
  //           setFormData({
  //             ...INITIAL_FORM_DATA,
  //             ...res.data,
  //           });
  //         }

  //         // Pull the raw array directly from root level matching your exact console log
  //         const rawFollowUps = res.data.followUps || res.data.formData?.followUps || [];

  //         // Clean up data objects completely before sending to UI state machine
  //         const cleanedFollowUps = sanitizeFollowUpArray(rawFollowUps);

  //         setFollowUps(cleanedFollowUps);

  //       } else {
  //         console.log("No previous history found for this patient.");
  //       }
  //     } catch (err) {
  //       console.error("Error fetching patient history:", err.message);
  //     }
  //   }
  // };

  const openAppointment = async (appointment) => {
    // LOCK CHECK
    if (["completed"].includes(appointment.status?.toLowerCase())) {
      setShowLockModal(true);
      return;
    }

    setSelected(appointment);

    // RESET STATE
    setFormData(INITIAL_FORM_DATA);
    setFollowUps([]);

    // FORMAT DATE
    const formatIncomingDate = (dateVal) => {
      if (!dateVal) return "";
      return dateVal.includes("T") ? dateVal.split("T")[0] : dateVal;
    };

    // CLEAN FOLLOWUPS
    const sanitizeFollowUpArray = (rawArray) => {
      if (!Array.isArray(rawArray)) return [];

      return rawArray.map((visit) => ({
        date: formatIncomingDate(visit?.date),
        notes: visit?.notes || "",
        churan: visit?.churan || "",
        tablets: visit?.tablets || "",
        others: visit?.others || "",
      }));
    };

    // CLEAN RX DATA
    const sanitizeRx = (rxData) => {
      return {
        churan: Array.isArray(rxData?.churan) ? rxData.churan : [],

        tablets: Array.isArray(rxData?.tablets) ? rxData.tablets : [],

        others: Array.isArray(rxData?.others) ? rxData.others : [],
      };
    };

    // ======================================================
    // 1. USE CURRENT APPOINTMENT DATA IF EXISTS
    // ======================================================

    if (appointment.formData && Object.keys(appointment.formData).length > 0) {
      const safeRx = sanitizeRx(appointment.formData.rx);

      setFormData({
        ...INITIAL_FORM_DATA,
        ...appointment.formData,

        rx: {
          ...INITIAL_FORM_DATA.rx,
          ...safeRx,
        },
      });

      const rawFollowUps =
        appointment.followUps || appointment.formData.followUps || [];

      setFollowUps(sanitizeFollowUpArray(rawFollowUps));

      return;
    }

    // ======================================================
    // 2. FETCH PATIENT HISTORY
    // ======================================================

    if (appointment.patient?._id) {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/appointments/patient-history/${appointment.patient._id}`,
          config,
        );

        console.log("👉 MY PATIENT HISTORY API RETURNED:", res.data);

        if (res.data) {
          // =========================================
          // IF DATA EXISTS INSIDE formData
          // =========================================

          if (res.data.formData) {
            const safeRx = sanitizeRx(res.data.formData.rx);

            setFormData({
              ...INITIAL_FORM_DATA,
              ...res.data.formData,

              rx: {
                ...INITIAL_FORM_DATA.rx,
                ...safeRx,
              },
            });
          }

          // =========================================
          // IF ROOT LEVEL DATA
          // =========================================
          else {
            const safeRx = sanitizeRx(res.data.rx);

            setFormData({
              ...INITIAL_FORM_DATA,
              ...res.data,

              rx: {
                ...INITIAL_FORM_DATA.rx,
                ...safeRx,
              },
            });
          }

          // =========================================
          // FOLLOWUPS
          // =========================================

          const rawFollowUps =
            res.data.followUps || res.data.formData?.followUps || [];

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
    const keys = path.split(".");
    setFormData((prev) => {
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
    const current = path.split(".").reduce((o, i) => o[i], formData) || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateField(path, updated);
  };

  const savePrescription = async () => {
    try {
      await axios.put(
        `http://localhost:5001/api/appointments/${selected._id}/prescription`,
        { formData, followUps },
        config,
      );
      alert("Full Medical Record Saved");
      fetchMyAppointments();
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
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

      <div className="grid gap-4">
        {/* Filter the array out first so only matching calendar day entries remain */}
        {appointments.filter(
          (a) =>
            a.appointmentDate &&
            new Date(a.appointmentDate).toLocaleDateString("sv") ===
              currentSystemDate,
        ).length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-dashed border-slate-200 font-medium italic text-sm">
            No consultations scheduled for today.
          </div>
        ) : (
          appointments
            .filter(
              (a) =>
                a.appointmentDate &&
                new Date(a.appointmentDate).toLocaleDateString("sv") ===
                  currentSystemDate,
            )
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
                        <Calendar size={14} />{" "}
                        {new Date(a.appointmentDate).toLocaleDateString()} |{" "}
                        <Clock3 size={14} /> {a.time}
                      </p>
                    </div>

                    {/* CONSULTATION STATUS */}
                    <div
                      className={`px-4 py-2 rounded-full text-xs font-semibold capitalize ${
                        ["viewed", "completed"].includes(
                          a.status?.toLowerCase(),
                        )
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
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 md:right-6 text-3xl md:text-4xl leading-none text-slate-400 hover:text-slate-600 transition-colors"
            >
              &times;
            </button>
            <h2 className="text-xl md:text-3xl font-bold mb-8 text-center uppercase tracking-widest border-b pb-4 mt-6 md:mt-0">
              Ayurvedic Consultation Form
            </h2>

            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">
              BASIC DETAILS
            </div>

            {/* PATIENT INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Patient Name
                </label>
                <input
                  value={selected.patient?.name || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Patient Name"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Patient ID
                </label>
                <input
                  value={selected.patient?.patientId || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Patient ID"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Phone
                </label>
                <input
                  value={
                    selected.patient?.phone
                      ? selected.patient.phone
                          .slice(-4)
                          .padStart(selected.patient.phone.length, "X")
                      : ""
                  }
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Phone"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Age
                </label>
                <input
                  value={selected.patient?.age || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Age"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  DOB
                </label>
                <input
                  value={selected.patient?.dob || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="DOB"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Gender
                </label>
                <input
                  value={selected.patient?.gender || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Gender"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Email
                </label>
                <input
                  value={selected.patient?.email || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Email"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Occupation
                </label>
                <input
                  value={selected.patient?.occupation || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Occupation"
                  readOnly
                />
              </div>
              <div className="flex flex-col col-span-2 gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Address
                </label>
                <input
                  value={`${selected.patient?.address || ""}, ${selected.patient?.city || ""}, ${selected.patient?.state || ""} - ${selected.patient?.pinCode || ""}`.trim()}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Address"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Height
                </label>
                <input
                  value={`${selected.patient?.height || ""} cms`}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Height"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Weight
                </label>
                <input
                  value={`${selected.patient?.weight || ""} kg`}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Weight"
                  readOnly
                />
              </div>
              <div className="flex flex-col col-span-2 gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Reffered By
                </label>
                <input
                  value={selected.patient?.referredBy || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Referred By"
                  readOnly
                />
              </div>
              <div className="flex flex-col col-span-2 gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                  Marital Status
                </label>
                <input
                  value={selected.patient?.maritalStatus || ""}
                  className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm"
                  placeholder="Marital Status"
                  readOnly
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">
              CONSULTATION
            </div>

            {/* CHIEF COMPLAINTS & RELIEF MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border-2 border-slate-800 p-4 rounded-xl bg-slate-50/50">
                <h3 className="font-bold text-lg md:text-xl mb-3 text-center">
                  RELIEF MATRIX
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                  {[
                    "No Relief",
                    "Little Relief",
                    "Stable",
                    "Improved",
                    "Cured",
                  ].map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors text-sm"
                    >
                      <input
                        type="radio"
                        className="w-4 h-4 accent-teal-700"
                        checked={formData.relief === r}
                        onChange={() => updateField("relief", r)}
                      />{" "}
                      {r}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 border-2 border-slate-800 p-4 rounded-xl">
                <h3 className="font-bold text-lg md:text-xl mb-3">
                  CHIEF COMPLAINTS
                </h3>
                {/* <div className="overflow-hidden border border-slate-200 rounded-xl">
  <table className="w-full">
    <thead>
      <tr className="bg-slate-100">
        <th className="border p-3 w-20">S.No</th>
        <th className="border p-3 w-40">Date</th>
        <th className="border p-3 text-left">Chief Complaint</th>
        <th className="border p-3 w-24">Remove</th>
      </tr>
    </thead>

    <tbody>
      {(formData.prescription || []).map((item, index) => (
        <tr key={index}>
          <td className="border p-3 text-center">
            {index + 1}
          </td>

          <td className="border p-2">
            <input
              type="date"
              value={item.date}
              onChange={(e) =>
                updatePrescription(index, "date", e.target.value)
              }
              className="w-full outline-none bg-transparent"
            />
          </td>

          <td className="border p-2">
            <input
              type="text"
              value={item.complaint}
              placeholder="Enter Complaint"
              onChange={(e) =>
                updatePrescription(index, "complaint", e.target.value)
              }
              className="w-full outline-none bg-transparent"
            />
          </td>

          <td className="border text-center">
            <button
              type="button"
              onClick={() => removePrescription(index)}
              className="text-red-500 text-xl font-bold"
            >
              ×
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div> */}
<div className="overflow-hidden border border-slate-200 rounded-xl">
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="bg-slate-100 text-slate-700">
        <th className="border-b border-r border-slate-200 p-3 w-16 text-center font-semibold">
          S.No
        </th>
        <th className="border-b border-r border-slate-200 p-3 text-left font-semibold">
          Chief Complaint
        </th>
        <th className="border-b border-r border-slate-200 p-3 w-48 text-left font-semibold">
          Duration
        </th>
        <th className="border-b border-slate-200 p-3 w-20 text-center font-semibold">
          Actions
        </th>
      </tr>
    </thead>

    <tbody>
      {(formData.prescription || []).map((item, index) => (
        <tr key={index} className="hover:bg-slate-50 transition-colors">
          {/* Serial Number */}
          <td className="border-b border-r border-slate-200 p-3 text-center text-slate-600 bg-slate-50/50 font-medium">
            {index + 1}
          </td>

          {/* Chief Complaint Input */}
          <td className="border-b border-r border-slate-200 p-2">
            <input
              type="text"
              value={item.complaint || ""}
              placeholder="e.g., Fever, Headache"
              onChange={(e) =>
                updatePrescription(index, "complaint", e.target.value)
              }
              className="w-full px-2 py-1 outline-none bg-transparent placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded"
            />
          </td>

          {/* Duration Input */}
          <td className="border-b border-r border-slate-200 p-2">
            <input
              type="text"
              value={item.duration || ""}
              placeholder="e.g., 3 days, 2 weeks"
              onChange={(e) =>
                updatePrescription(index, "duration", e.target.value)
              }
              className="w-full px-2 py-1 outline-none bg-transparent placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded"
            />
          </td>

          {/* Remove Button */}
          <td className="border-b border-slate-200 p-2 text-center">
            <button
              type="button"
              onClick={() => removePrescription(index)}
              className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="Remove row"
            >
              Remove
            </button>
          </td>
        </tr>
      ))}
      
      {/* Fallback for empty state */}
      {(formData.prescription || []).length === 0 && (
        <tr>
          <td colSpan={4} className="p-8 text-center text-slate-400 bg-slate-50/30">
            No complaints added yet.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

<button
  type="button"
  onClick={addPrescription}
  className="mt-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
>
  + Add Complaint
</button>
              </div>
            </div>

            {/* PAST MEDICAL HISTORY TABLE */}
            <div className="mb-8">
              <h3 className="font-bold text-lg md:text-xl mb-3 uppercase">
                Past Medical History
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full border-collapse min-w-[600px] text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border-b border-r border-slate-800 p-2">
                        Condition
                      </th>
                      <th className="border-b border-r border-slate-800 p-2">
                        History (Y/N)
                      </th>
                      <th className="border-b border-r border-slate-800 p-2">
                        Duration
                      </th>
                      <th className="border-b border-r border-slate-800 p-2">
                        Medicine
                      </th>
                      <th className="border-b border-slate-800 p-2">
                        Current Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {["BP", "DM", "Thyroid", "TBCAD"].map((k) => (
                      <tr key={k}>
                        <td className="border-b border-r border-slate-800 p-2 font-bold bg-slate-50">
                          {k === "TBCAD" ? "TB/CAD/Jaundice" : k}
                        </td>
                        <td className="border-b border-r border-slate-800 p-1">
                          <input
                            className="w-full text-center outline-none bg-transparent"
                            value={formData.pastHistory[k].h}
                            onChange={(e) =>
                              updateField(`pastHistory.${k}.h`, e.target.value)
                            }
                          />
                        </td>
                        <td className="border-b border-r border-slate-800 p-1">
                          <input
                            className="w-full text-center outline-none bg-transparent"
                            value={formData.pastHistory[k].d}
                            onChange={(e) =>
                              updateField(`pastHistory.${k}.d`, e.target.value)
                            }
                          />
                        </td>
                        <td className="border-b border-r border-slate-800 p-1">
                          <input
                            className="w-full text-center outline-none bg-transparent"
                            value={formData.pastHistory[k].m}
                            onChange={(e) =>
                              updateField(`pastHistory.${k}.m`, e.target.value)
                            }
                          />
                        </td>
                        <td className="border-b border-slate-800 p-1">
                          <input
                            className="w-full text-center outline-none bg-transparent"
                            value={formData.pastHistory[k].s}
                            onChange={(e) =>
                              updateField(`pastHistory.${k}.s`, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border-r border-slate-800 p-2 font-bold bg-slate-50">
                        Others
                      </td>
                      <td colSpan={4} className="p-1">
                        <input
                          className="w-full px-2 outline-none"
                          value={formData.pastHistory.Others.note}
                          onChange={(e) =>
                            updateField(
                              "pastHistory.Others.note",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-bold text-sm shrink-0">
                    Family History:
                  </span>
                  <input
                    className="border-b border-dotted border-slate-800 flex-1 outline-none text-sm py-1"
                    value={formData.familyHistory}
                    onChange={(e) =>
                      updateField("familyHistory", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-bold text-sm shrink-0">
                    Treatment History:
                  </span>
                  <input
                    className="border-b border-dotted border-slate-800 flex-1 outline-none text-sm py-1"
                    value={formData.treatmentHistory}
                    onChange={(e) =>
                      updateField("treatmentHistory", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">
              SYSTEMIC EXAMINATION
            </div>

            {/* BOWELS SECTION */}
            <div className="mb-8 border-b pb-6">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h3 className="text-lg md:text-xl font-bold text-teal-800">
                  BOWELS
                </h3>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Frequency:
                  </span>
                  <input
                    className="border border-slate-300 w-10 text-center rounded bg-white font-bold"
                    value={formData.bowels.vega}
                    onChange={(e) => updateField("bowels.vega", e.target.value)}
                  />
                  <span className="text-xs text-slate-500">/day</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">
                    Consistency
                  </p>
                  <div className="space-y-2">
                    {["Hard", "Soft", "Loose", "Well Formed", "Mucoid"].map(
                      (i) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded accent-teal-600"
                            checked={formData.bowels.consistency.includes(i)}
                            onChange={() =>
                              toggleCheckbox("bowels.consistency", i)
                            }
                          />{" "}
                          {i}
                        </label>
                      ),
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">
                    Associated With
                  </p>
                  <div className="space-y-2">
                    {[
                      "Urgency",
                      "Strain",
                      "Pain",
                      "Bleeding",
                      "Burning Sensation",
                    ].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-teal-600"
                          checked={formData.bowels.associated.includes(i)}
                          onChange={() =>
                            toggleCheckbox("bowels.associated", i)
                          }
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">
                    Evacuation
                  </p>
                  <div className="space-y-2">
                    {["Complete", "Incomplete", "Incontinence"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-teal-600"
                          checked={formData.bowels.evacuation.includes(i)}
                          onChange={() =>
                            toggleCheckbox("bowels.evacuation", i)
                          }
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">
                    Taking Laxatives
                  </p>
                  <div className="flex flex-col gap-2">
                    {["Yes", "No"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700"
                      >
                        <input
                          type="radio"
                          className="w-4 h-4 accent-teal-600"
                          checked={formData.bowels.laxatives === i}
                          onChange={() => updateField("bowels.laxatives", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* APPETITE SECTION */}
            <div className="bg-slate-50 p-4 md:p-6 mb-8 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-lg md:text-xl mb-4 text-teal-800">
                APPETITE AND DIGESTION
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Do you feel hungry?", field: "hungry" },
                  {
                    label: "You take food because it is time to eat?",
                    field: "timeToEat",
                  },
                  {
                    label: "Do you feel lightheadedness before the next meal?",
                    field: "lightheaded",
                  },
                  {
                    label: "Do you feel drowsiness after meals?",
                    field: "drowsiness",
                  },
                ].map((q) => (
                  <div
                    key={q.field}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 last:border-0"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {q.label}
                    </span>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          className="w-4 h-4 accent-teal-600"
                          checked={formData.appetite[q.field] === "Yes"}
                          onChange={() =>
                            updateField(`appetite.${q.field}`, "Yes")
                          }
                        />{" "}
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          className="w-4 h-4 accent-teal-600"
                          checked={formData.appetite[q.field] === "No"}
                          onChange={() =>
                            updateField(`appetite.${q.field}`, "No")
                          }
                        />{" "}
                        No
                      </label>
                    </div>
                    {q.field === "hungry" && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0 sm:ml-4 flex-1">
                        <span className="text-xs font-bold uppercase text-slate-400">
                          Disturbed by:
                        </span>
                        <input
                          className="w-full border-b border-slate-300 outline-none bg-transparent text-sm py-1 focus:border-teal-500 transition-colors"
                          value={formData.appetite.disturbedBy}
                          onChange={(e) =>
                            updateField("appetite.disturbedBy", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* GAS & ACIDITY SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-slate-100 pb-8">
              <div className="bg-slate-50 p-5 rounded-3xl">
                <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">
                  Gas
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {[
                      "Bloating",
                      "Passing with ease",
                      "Passing with Difficulty",
                      "Burps",
                    ].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-teal-600"
                          checked={formData.gas.features.includes(i)}
                          onChange={() => toggleCheckbox("gas.features", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-xs uppercase text-slate-500">
                      Intensity
                    </p>
                    {["Mild", "Moderate", "Severe"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          className="w-4 h-4 accent-teal-600"
                          checked={formData.gas.intensity === i}
                          onChange={() => updateField("gas.intensity", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                   <div className="space-y-2">
                  <input
                    placeholder="Notes"
                    className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm"
                    value={formData.gas.notes}
                    onChange={(e) =>
                      updateField("gas.notes", e.target.value)
                    }
                  />
                  </div>
                  
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl">
                <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">
                  Acidity
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {["Heart burn", "Reflux", "Sour belching", "Bile"].map(
                      (i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded accent-teal-600"
                            checked={formData.acidity.features.includes(i)}
                            onChange={() =>
                              toggleCheckbox("acidity.features", i)
                            }
                          />{" "}
                          {i}
                        </label>
                      ),
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-xs uppercase text-slate-500">
                      Intensity
                    </p>
                    {["Mild", "Moderate", "Severe"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          className="w-4 h-4 accent-teal-600"
                          checked={formData.acidity.intensity === i}
                          onChange={() => updateField("acidity.intensity", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                  <input
                    placeholder="Notes"
                    className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm"
                    value={formData.acidity.notes}
                    onChange={(e) =>
                      updateField("acidity.notes", e.target.value)
                    }
                  />
                  </div>
                  
                </div>
              </div>
            </div>

            {/* TONGUE & EYES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">
                  Tongue
                </h3>
                <div className="flex gap-6 mb-4">
                  {["Coated", "Uncoated"].map((i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 text-sm cursor-pointer font-semibold"
                    >
                      <input
                        type="radio"
                        className="w-4 h-4 accent-teal-600"
                        checked={formData.tongue.status === i}
                        onChange={() => updateField("tongue.status", i)}
                      />{" "}
                      {i}
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">
                    Intensity:
                  </span>
                  {["Mild", "Moderate", "Severe"].map((i) => (
                    <label
                      key={i}
                      className="flex items-center gap-1 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        className="w-4 h-4 accent-teal-600"
                        checked={formData.tongue.intensity === i}
                        onChange={() => updateField("tongue.intensity", i)}
                      />{" "}
                      {i}
                    </label>
                  ))}
                </div>
                <div className="space-y-3">
                  <input
                    placeholder="Color"
                    className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm"
                    value={formData.tongue.color}
                    onChange={(e) =>
                      updateField("tongue.color", e.target.value)
                    }
                  />
                  <input
                    placeholder="Taste Perception"
                    className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm"
                    value={formData.tongue.taste}
                    onChange={(e) =>
                      updateField("tongue.taste", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">
                  Eyes
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-500 uppercase w-16">
                      Pallor:
                    </span>
                    {["Mild", "Moderate", "Severe"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-1 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          className="w-4 h-4 accent-teal-600"
                          checked={formData.eyes.pallor === i}
                          onChange={() => updateField("eyes.pallor", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-500 uppercase w-16">
                      Icterus:
                    </span>
                    {["Mild", "Moderate", "Severe"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-1 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          className="w-4 h-4 accent-teal-600"
                          checked={formData.eyes.icterus === i}
                          onChange={() => updateField("eyes.icterus", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                  <input
                    placeholder="Vision details"
                    className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm"
                    value={formData.eyes.vision}
                    onChange={(e) => updateField("eyes.vision", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* URINE SECTION */}
            <div className="mb-8 p-4 md:p-6 border border-slate-200 rounded-3xl bg-slate-50/30">
              <h3 className="font-bold text-lg md:text-xl mb-6 text-teal-800 uppercase tracking-wide">
                Urine
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">
                    Vega
                  </p>
                  <div className="space-y-2">
                    {["Day", "Night"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-teal-600"
                          checked={formData.urine.vega.includes(i)}
                          onChange={() => toggleCheckbox("urine.vega", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">
                    Association I
                  </p>
                  <div className="space-y-2">
                    {["Urgency", "Strain", "Pain"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-teal-600"
                          checked={formData.urine.associated1.includes(i)}
                          onChange={() =>
                            toggleCheckbox("urine.associated1", i)
                          }
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">
                    Association II
                  </p>
                  <div className="space-y-2">
                    {["Frothly", "Bleeding", "Burning Sensation"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-teal-600"
                          checked={formData.urine.associated2.includes(i)}
                          onChange={() =>
                            toggleCheckbox("urine.associated2", i)
                          }
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">
                    Status
                  </p>
                  <div className="space-y-2">
                    {["Satisfactory", "Unsatisfactory", "H/o Prostate"].map(
                      (i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded accent-teal-600"
                            checked={formData.urine.status.includes(i)}
                            onChange={() => toggleCheckbox("urine.status", i)}
                          />{" "}
                          {i}
                        </label>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MIND & SLEEP SECTION */}
            <div className="bg-slate-50 p-4 md:p-6 mb-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 border border-slate-200">
              <div>
                <h3 className="font-bold text-lg mb-4 text-teal-800 uppercase">
                  Sleep
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-bold text-slate-500 shrink-0">
                    Duration:
                  </span>
                  <input
                    className="border-b border-slate-300 flex-1 bg-transparent outline-none py-1 text-sm focus:border-teal-500"
                    value={formData.sleep.duration}
                    onChange={(e) =>
                      updateField("sleep.duration", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    {["Normal", "Sound", "Dreams"].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-teal-600"
                          checked={formData.sleep.features.includes(i)}
                          onChange={() => toggleCheckbox("sleep.features", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {["Disturbed", "Late Onset", "Disturbed in Middle"].map(
                      (i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded accent-teal-600"
                            checked={formData.sleep.features.includes(i)}
                            onChange={() => toggleCheckbox("sleep.features", i)}
                          />{" "}
                          {i}
                        </label>
                      ),
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4 text-teal-800 uppercase">
                  Mind
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <p className="font-bold text-xs uppercase text-slate-400 mb-2">
                      Features
                    </p>
                    {[
                      "Depression",
                      "Anxiety",
                      "Short Tempered",
                      "Mood Swings",
                    ].map((i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-teal-600"
                          checked={formData.mind.features.includes(i)}
                          onChange={() => toggleCheckbox("mind.features", i)}
                        />{" "}
                        {i}
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-xs uppercase text-slate-400 mb-2">
                      Sattva
                    </p>
                    {["Avara Sattva", "Pravar Sattva", "Madhyam Sattva"].map(
                      (i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <input
                            type="radio"
                            className="w-4 h-4 accent-teal-600"
                            checked={formData.mind.sattva === i}
                            onChange={() => updateField("mind.sattva", i)}
                          />{" "}
                          {i}
                        </label>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ADDICTION & DIET */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 border border-slate-200 rounded-3xl bg-white shadow-sm">
              <div>
                <h3 className="font-bold text-lg underline mb-4 text-teal-800">
                  DIET
                </h3>
                <div className="flex gap-6">
                  {["Veg", "Non-Veg", "Egg"].map((i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 text-sm cursor-pointer font-semibold"
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded accent-teal-600"
                        checked={formData.diet.includes(i)}
                        onChange={() => toggleCheckbox("diet", i)}
                      />{" "}
                      {i}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg underline mb-4 text-teal-800">
                  ADDICTION / HABITS
                </h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    "Tea",
                    "Alcohol",
                    "Smoking",
                    "Coffee",
                    "Tobacco",
                    "Gutkha",
                  ].map((i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 text-sm cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:border-teal-500 transition-all"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-teal-600"
                        checked={formData.addiction.habits.includes(i)}
                        onChange={() => toggleCheckbox("addiction.habits", i)}
                      />{" "}
                      {i}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* MENSTRUAL & OBS HISTORY */}
            <div className="mb-8 p-6 border border-slate-200 rounded-3xl bg-pink-50/20">
              <h3 className="font-bold text-xl mb-6 text-slate-800 uppercase tracking-wide border-b border-pink-100 pb-2">
                Menstrual History
              </h3>
              <div className="flex flex-wrap gap-6 mb-6 items-center">
                <span className="text-sm font-bold text-slate-500 uppercase">
                  Flow:
                </span>
                {["Scanty", "Normal", "Excessive", "Clots"].map((i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded accent-pink-600"
                      checked={formData.menstrual.flow.includes(i)}
                      onChange={() => toggleCheckbox("menstrual.flow", i)}
                    />{" "}
                    {i}
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-bold uppercase text-slate-400">
                <div className="space-y-3">
                  <p className="border-l-2 border-pink-500 pl-2">Pain</p>
                  {["Nil", "Mild", "Moderate", "Severe"].map((i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 font-normal text-slate-700 normal-case cursor-pointer"
                    >
                      <input
                        type="radio"
                        className="w-4 h-4 accent-pink-600"
                        checked={formData.menstrual.pain === i}
                        onChange={() => updateField("menstrual.pain", i)}
                      />{" "}
                      {i}
                    </label>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="border-l-2 border-pink-500 pl-2">
                    White Discharge
                  </p>
                  {["Nil", "Mild", "Moderate", "Severe"].map((i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 font-normal text-slate-700 normal-case cursor-pointer"
                    >
                      <input
                        type="radio"
                        className="w-4 h-4 accent-pink-600"
                        checked={formData.menstrual.discharge === i}
                        onChange={() => updateField("menstrual.discharge", i)}
                      />{" "}
                      {i}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-8 border-t border-pink-100 pt-6">
                <h3 className="font-bold text-lg mb-6 text-slate-800 uppercase tracking-wide">
                  OBS. HISTORY
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  {["G", "P", "A", "L"].map((k) => (
                    <div
                      key={k}
                      className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-pink-100"
                    >
                      <span className="font-black text-pink-600">{k}:</span>
                      <input
                        className="w-full outline-none text-sm font-bold text-slate-700"
                        value={formData.obs[k]}
                        onChange={(e) =>
                          updateField(`obs.${k}`, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-6 bg-white p-4 rounded-3xl border border-pink-100">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-sm font-bold text-slate-500 shrink-0">
                      C-Section:
                    </span>
                    <input
                      className="border-b border-slate-200 w-full outline-none py-1 focus:border-pink-500 text-sm"
                      value={formData.obs.cSection}
                      onChange={(e) =>
                        updateField("obs.cSection", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-sm font-bold text-slate-500 shrink-0">
                      Normal Delivery:
                    </span>
                    <input
                      className="border-b border-slate-200 w-full outline-none py-1 focus:border-pink-500 text-sm"
                      value={formData.obs.normal}
                      onChange={(e) =>
                        updateField("obs.normal", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PRAKRITI TABLE & DIAGNOSIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-slate-900 text-white p-4 md:p-8 rounded-[40px] shadow-2xl">
              <div>
                <h3 className="font-black text-xl mb-6 text-teal-400 tracking-tighter uppercase">
                  Prakriti / Naadi
                </h3>
                <div className="overflow-hidden rounded-2xl border border-slate-700">
                  <table className="w-full border-collapse bg-slate-800/50">
                    <thead>
                      <tr className="bg-slate-800">
                        <th className="p-3 text-left text-xs uppercase text-slate-400">
                          Vikriti
                        </th>
                        <th className="p-3 text-xs uppercase text-slate-400">
                          Vata
                        </th>
                        <th className="p-3 text-xs uppercase text-slate-400">
                          Pitta
                        </th>
                        <th className="p-3 text-xs uppercase text-slate-400">
                          Kapha
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {["Mild", "Moderate", "Severe"].map((lvl) => (
                        <tr
                          key={lvl}
                          className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="p-3 text-sm font-black">{lvl}</td>
                          <td className="p-3 text-center">
                            <input
                              type="radio"
                              className="w-5 h-5 accent-teal-500"
                              name="vata"
                              checked={formData.prakriti.vata === lvl}
                              onChange={() => updateField("prakriti.vata", lvl)}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="radio"
                              className="w-5 h-5 accent-teal-500"
                              name="pitta"
                              checked={formData.prakriti.pitta === lvl}
                              onChange={() =>
                                updateField("prakriti.pitta", lvl)
                              }
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="radio"
                              className="w-5 h-5 accent-teal-500"
                              name="kapha"
                              checked={formData.prakriti.kapha === lvl}
                              onChange={() =>
                                updateField("prakriti.kapha", lvl)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-lg mb-2 text-teal-400 uppercase tracking-widest">
                    Diagnosis
                  </h3>
                  <textarea
                    className="w-full border border-slate-700 p-4 bg-slate-800/50 rounded-3xl outline-none focus:ring-2 focus:ring-teal-500 text-sm placeholder:text-slate-600"
                    rows={3}
                    placeholder="Pathological inference..."
                    value={formData.diagnosis}
                    onChange={(e) => updateField("diagnosis", e.target.value)}
                  />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2 text-teal-400 uppercase tracking-widest">
                    Chikitsa Sutra
                  </h3>
                  <textarea
                    className="w-full border border-slate-700 p-4 bg-slate-800/50 rounded-3xl outline-none focus:ring-2 focus:ring-teal-500 text-sm placeholder:text-slate-600"
                    rows={2}
                    placeholder="Treatment line..."
                    value={formData.chikitsa}
                    onChange={(e) => updateField("chikitsa", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Rx SECTION */}
            {/* <div className="mb-8 p-1">
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
            </div> */}
            <div className="mb-8 p-1">
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter text-slate-800 border-l-8 border-teal-700 pl-4">
                Rx - Prescription
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-slate-800 rounded-[32px] overflow-hidden shadow-xl bg-white">
                {/* CHURAN */}
                <div className="border-b md:border-b-0 md:border-r-2 border-slate-800 p-3">
                  <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-4 border border-teal-100 uppercase text-sm">
                    Churan / Powder
                  </p>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 border border-slate-400 text-sm font-bold mb-2">
                    <div className="col-span-2 border-r p-2">S.no</div>
                    <div className="col-span-5 border-r p-2">Medicine Name</div>
                    <div className="col-span-3 border-r p-2">
                      Quantity (in grams)
                    </div>
                    <div className="col-span-2 p-2">Remove</div>
                  </div>

                  {/* Rows */}
                  {formData.rx.churan.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 border border-slate-300 text-sm mb-2"
                    >
                      <div className="col-span-2 border-r p-2 flex items-center justify-center">
                        {index + 1}
                      </div>

                      <div className="col-span-5 border-r">
                        <input
                          type="text"
                          placeholder="Medicine Name"
                          value={item.name}
                          onChange={(e) =>
                            updateRxItem(
                              "churan",
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full p-2 outline-none"
                        />
                      </div>

                      <div className="col-span-3 border-r">
                        <input
                          type="text"
                          placeholder="Quantity"
                          value={item.qty}
                          onChange={(e) =>
                            updateRxItem("churan", index, "qty", e.target.value)
                          }
                          className="w-full p-2 outline-none"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          onClick={() => removeRxItem("churan", index)}
                          className="text-red-600 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Button */}
                  {formData.rx.churan.length < 5 && (
                    <button
                      onClick={() => addRxItem("churan")}
                      className="mt-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold shadow-md"
                    >
                      + Add Churan
                    </button>
                  )}
                </div>

                {/* TABLETS */}
                <div className="border-b md:border-b-0 md:border-r-2 border-slate-800 p-3">
                  <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-4 border border-teal-100 uppercase text-sm">
                    Tablets / Vati
                  </p>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 border border-slate-400 text-sm font-bold mb-2">
                    <div className="col-span-2 border-r p-2">S.no</div>
                    <div className="col-span-8 border-r p-2">Medicine Name</div>
                    {/* <div className="col-span-3 border-r p-2">Quantity</div> */}
                    <div className="col-span-2 p-2">Remove</div>
                  </div>

                  {/* Rows */}
                  {formData.rx.tablets.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 border border-slate-300 text-sm mb-2"
                    >
                      <div className="col-span-2 border-r p-2 flex items-center justify-center">
                        {index + 1}
                      </div>

                      <div className="col-span-8 border-r">
                        <input
                          type="text"
                          placeholder="Medicine Name"
                          value={item.name}
                          onChange={(e) =>
                            updateRxItem(
                              "tablets",
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full p-2 outline-none"
                        />
                      </div>

                      {/* <div className="col-span-3 border-r">
            <input
              type="text"
              placeholder="मात्रा"
              value={item.qty}
              onChange={(e) =>
                updateRxItem("tablets", index, "qty", e.target.value)
              }
              className="w-full p-2 outline-none"
            />
          </div> */}

                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          onClick={() => removeRxItem("tablets", index)}
                          className="text-red-600 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Button */}
                  {formData.rx.tablets.length < 5 && (
                    <button
                      onClick={() => addRxItem("tablets")}
                      className="mt-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold shadow-md"
                    >
                      + Add Tablet
                    </button>
                  )}
                </div>

                {/* OTHERS */}
                {/* OTHERS */}
                <div className="p-3">
                  <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-4 border border-teal-100 uppercase text-sm">
                    Others / Syrup / Oil
                  </p>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 border border-slate-400 text-sm font-bold mb-2">
                    <div className="col-span-2 border-r p-2">S.no</div>
                    <div className="col-span-8 border-r p-2">Medicine Name</div>
                    {/* <div className="col-span-3 border-r p-2">Quantity</div> */}
                    <div className="col-span-2 p-2">Remove</div>
                  </div>

                  {/* Rows */}
                  {(Array.isArray(formData.rx.others)
                    ? formData.rx.others
                    : []
                  ).map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 border border-slate-300 text-sm mb-2"
                    >
                      <div className="col-span-2 border-r p-2 flex items-center justify-center">
                        {index + 1}
                      </div>

                      <div className="col-span-8 border-r">
                        <input
                          type="text"
                          placeholder="Medicine Name"
                          value={item.name}
                          onChange={(e) =>
                            updateRxItem(
                              "others",
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full p-2 outline-none"
                        />
                      </div>

                      {/* <div className="col-span-3 border-r">
        <input
          type="text"
          placeholder="मात्रा"
          value={item.qty}
          onChange={(e) =>
            updateRxItem("others", index, "qty", e.target.value)
          }
          className="w-full p-2 outline-none"
        />
      </div> */}

                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          onClick={() => removeRxItem("others", index)}
                          className="text-red-600 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* UNLIMITED ADD BUTTON */}
                  <button
                    onClick={() => addRxItem("others")}
                    className="mt-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold shadow-md"
                  >
                    + Add Others
                  </button>
                </div>
              </div>
            </div>

            {/* Diet Chart Section */}
            <div className="mt-12 border-t-4 border-slate-100 pt-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
                  DIET CHART
                </h2>
                <button
                  onClick={() => setShowDietChart(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-4 rounded-[20px] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Open Ayurvedic Diet Chart
                </button>
              </div>
            </div>

            {/* How To Take */}
            <div className="mt-12 border-t-4 border-slate-100 pt-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
                  How To Take
                </h2>
                <button
                  onClick={() => setShowHowToTake(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-4 rounded-[20px] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Open How To Take
                </button>
              </div>
            </div>

            {/* FOLLOW UP SECTION */}
            {/* <div className="mt-12 border-t-4 border-slate-100 pt-12">
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
            </div> */}
            {/* FOLLOW UP SECTION */}
            {/* ================= FOLLOW UP SECTION ================= */}

            <div className="mt-12 border-t-4 border-slate-100 pt-12">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                  Follow Up Form
                </h2>

                {/* ADD FOLLOWUP */}
                <button
                  onClick={() =>
                    setFollowUps([
                      ...followUps,
                      {
                        date: "",
                        patientId: "",
                        medicineId: generateMedicineId(followUps.length + 1),

                        complaints: [],

                        agni: "",
                        mala: "",
                        nidra: "",
                        nadi: "",

                        medicineCompliance: "",
                        pathaya: "",

                        notes: "",
                      },
                    ])
                  }
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-4 rounded-[20px] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  + Add Follow Up
                </button>
              </div>

              {/* FOLLOWUPS */}
              <div className="space-y-8">
                {followUps.map((visit, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 p-6 rounded-[32px] shadow-lg relative group"
                  >
                    {/* DELETE FOLLOWUP */}
                    <button
                      onClick={() => {
                        const updated = followUps.filter((_, i) => i !== idx);

                        setFollowUps(updated);
                      }}
                      className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-full shadow-lg hidden group-hover:flex items-center justify-center font-black text-lg"
                    >
                      ×
                    </button>

                    {/* TOP SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                      {/* DATE */}
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                          Visit Date
                        </label>

                        <input
                          type="date"
                          value={visit.date}
                          onChange={(e) => {
                            const f = [...followUps];
                            f[idx].date = e.target.value;
                            setFollowUps(f);
                          }}
                          className="w-full border-2 border-slate-100 rounded-2xl p-3 outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* PATIENT ID */}
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                          Patient ID
                        </label>

                        <input
                          type="text"
                          value={selected.patient?.patientId || ""}
                          onChange={(e) => {
                            const f = [...followUps];
                            f[idx].patientId = e.target.value;
                            setFollowUps(f);
                          }}
                          placeholder="Patient ID"
                          className="w-full border-2 border-slate-100 rounded-2xl p-3 focus:outline-none "
                          readOnly
                        />
                      </div>

                      {/* MEDICINE ID */}
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                          Medicine ID
                        </label>

                        <input
                          type="text"
                          value={visit.medicineId}
                          readOnly
                          onChange={(e) => {
    const f = [...followUps];

    f[idx].date = e.target.value;

    f[idx].medicineId = generateMedicineId(
      idx + 1,
      e.target.value
    );

    setFollowUps(f);
  }}
                          placeholder="Medicine ID"
                          className="w-full border-2 border-slate-100 rounded-2xl p-3 focus:outline-none "
                        />
                      </div>
                    </div>

                    {/* COMPLAINT TABLE */}
                    <div className="overflow-auto border-2 border-slate-100 rounded-3xl">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="border p-3 text-left min-w-[220px]">
                              Chief Complaints
                            </th>

                            <th className="border p-3 text-center min-w-[120px]">
                              Completely Cured
                            </th>

                            <th className="border p-3 text-center min-w-[150px]">
                              Significant Improvement
                            </th>

                            <th className="border p-3 text-center min-w-[120px]">
                              Little Improvement
                            </th>

                            <th className="border p-3 text-center min-w-[120px]">
                              No Improvement
                            </th>

                            <th className="border p-3 text-center min-w-[140px]">
                              Condition Aggravated
                            </th>

                            <th className="border p-3 text-center">Delete</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(visit.complaints || []).map((item, cIdx) => (
                            <tr key={cIdx}>
                              {/* COMPLAINT */}
                              <td className="border p-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  placeholder="Complaint"
                                  onChange={(e) => {
                                    const f = [...followUps];

                                    f[idx].complaints[cIdx].name =
                                      e.target.value;

                                    setFollowUps(f);
                                  }}
                                  className="w-full outline-none bg-transparent"
                                />
                              </td>

                              {[
                                "cured",
                                "significant",
                                "little",
                                "none",
                                "aggravated",
                              ].map((status) => (
                                <td key={status} className="border text-center">
                                  <input
                                    type="radio"
                                    name={`status-${idx}-${cIdx}`}
                                    checked={item.status === status}
                                    onChange={() => {
                                      const f = [...followUps];

                                      f[idx].complaints[cIdx].status = status;

                                      setFollowUps(f);
                                    }}
                                  />
                                </td>
                              ))}

                              {/* DELETE ROW */}
                              <td className="border text-center">
                                <button
                                  onClick={() => {
                                    const f = [...followUps];

                                    f[idx].complaints = f[
                                      idx
                                    ].complaints.filter((_, i) => i !== cIdx);

                                    setFollowUps(f);
                                  }}
                                  className="text-red-500 font-black text-lg"
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ADD COMPLAINT */}
                    <button
                      onClick={() => {
                        const f = [...followUps];

                        if (!Array.isArray(f[idx].complaints)) {
                          f[idx].complaints = [];
                        }

                        f[idx].complaints.push({
                          name: "",
                          status: "",
                        });

                        setFollowUps(f);
                      }}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-black shadow-md"
                    >
                      + Add Complaint
                    </button>

                    {/* AGNI MALA */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
                      {["agni", "mala", "nidra", "nadi"].map((field) => (
                        <div key={field}>
                          <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                            {field}
                          </label>

                          <input
                            type="text"
                            value={visit[field]}
                            onChange={(e) => {
                              const f = [...followUps];

                              f[idx][field] = e.target.value;

                              setFollowUps(f);
                            }}
                            className="w-full border-2 border-slate-100 rounded-2xl p-3 outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    {/* COMPLIANCE + PATHAYA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {/* MEDICINE */}
                      <div className="border-2 border-slate-100 rounded-3xl p-5 bg-white">
                        <h4 className="font-black mb-4 uppercase text-sm">
                          Medicine Compliance
                        </h4>

                        <div className="flex gap-6">
                          {["Regular", "Irregular"].map((val) => (
                            <label
                              key={val}
                              className="flex items-center gap-2 font-medium"
                            >
                              <input
                                type="radio"
                                checked={visit.medicineCompliance === val}
                                onChange={() => {
                                  const f = [...followUps];

                                  f[idx].medicineCompliance = val;

                                  setFollowUps(f);
                                }}
                              />

                              {val}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* PATHAYA */}
                      <div className="border-2 border-slate-100 rounded-3xl p-5 bg-white">
                        <h4 className="font-black mb-4 uppercase text-sm">
                          Pathaya (Diet)
                        </h4>

                        <div className="flex gap-6">
                          {["Regular", "Irregular"].map((val) => (
                            <label
                              key={val}
                              className="flex items-center gap-2 font-medium"
                            >
                              <input
                                type="radio"
                                checked={visit.pathaya === val}
                                onChange={() => {
                                  const f = [...followUps];

                                  f[idx].pathaya = val;

                                  setFollowUps(f);
                                }}
                              />

                              {val}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* NOTES */}
                    <div className="mt-8">
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                        Notes
                      </label>

                      <textarea
                        rows={4}
                        value={visit.notes}
                        onChange={(e) => {
                          const f = [...followUps];

                          f[idx].notes = e.target.value;

                          setFollowUps(f);
                        }}
                        placeholder="Additional notes..."
                        className="w-full border-2 border-slate-100 rounded-3xl p-4 outline-none focus:border-blue-500"
                      />
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

      {/* Diet CHart Model  */}
      {/* ========================= AYURVEDIC DIET CHART ========================= */}

      {showDietChart && (
        <div className="fixed inset-0 bg-black/70 z-[100] overflow-y-auto p-4 flex justify-center items-start">
          <div className="bg-white w-full max-w-7xl rounded-[30px] shadow-2xl p-6 md:p-10 relative">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowDietChart(false)}
              className="absolute top-4 right-4 text-4xl font-light text-slate-500 hover:text-black"
            >
              ×
            </button>

            {/* HEADER */}
            {/* <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-6 mb-8">

        <div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            आयुर्वेदिक डाइट चार्ट
          </h1>

          <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-3xl">
  यह आयुर्वेदिक डाइट चार्ट विशेष रूप से{" "}
  <span className="font-bold">
    {selected?.patient?.name || "Patient"}
  </span>{" "}
  के लिए{" "}
  <span className="font-bold">
    Dr. {user?.name || " "}
  </span>{" "}
  द्वारा बनाया गया है। यह आपके द्वारा बताई गई समस्याओं एवं लक्षणों पर आधारित है।
  इस डाइट चार्ट को नियमित रूप से पालन करें, यह आपको स्वस्थ होने में सहयोग देगा।
</p>
        </div>

        <div className="border-2 border-slate-300 rounded-2xl p-4 min-w-[250px]">
          <p className="font-black uppercase text-sm mb-3">
            YOUR NEXT APPOINTMENT
          </p>

          <input
            type="date"
            className="border w-full p-3 rounded-xl"
            value={formData.dietChart.nextAppointment}
            onChange={(e) =>
              updateField(
                "dietChart.nextAppointment",
                e.target.value
              )
            }
          />
        </div>
      </div> */}
            <div className="flex flex-col xl:flex-row justify-between items-start gap-8 border-b border-slate-300 pb-8 mb-10">
              {/* LEFT SIDE */}
              <div className="flex flex-col md:flex-row items-start gap-6 flex-1">
                {/* LOGO */}
                <div className="shrink-0">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full   border-[5px] border-white flex items-center justify-center overflow-hidden">
                    {/* IMAGE LOGO */}
                    <img
                      src="/brandicon.png"
                      alt="Clinic Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* TITLE + DESCRIPTION */}
                <div className="flex-1">
                  {/* <div className="inline-block bg-gradient-to-r from-[#111] to-[#444] text-white px-5 py-2 rounded-full text-xs md:text-sm font-black tracking-[0.3em] shadow-lg mb-5">
        AYURVEDIC WELLNESS
      </div> */}

                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1a1a1a] leading-none">
                    आयुर्वेदिक डाइट चार्ट
                  </h1>

                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1a1a1a] leading-none mt-1"></h1>

                  {/* GOLDEN LINE */}
                  <div className="w-44 h-[5px] rounded-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-300 mt-5 mb-6 shadow-md" />

                  {/* DESCRIPTION */}
                  <p className="text-[15px] md:text-[17px] leading-relaxed text-slate-700 max-w-4xl">
                    यह आयुर्वेदिक डाइट चार्ट विशेष रूप से{" "}
                    <span className="font-black text-black">
                      {selected?.patient?.name || "Patient"}
                    </span>{" "}
                    के लिए{" "}
                    <span className="font-black text-black">
                      Dr. {user?.name || ""}
                    </span>{" "}
                    द्वारा बनाया गया है। यह आपके द्वारा बताई गई समस्याओं एवं
                    लक्षणों पर आधारित है। इस डाइट चार्ट को नियमित रूप से पालन
                    करें, यह आपको स्वस्थ होने में सहयोग देगा।
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE APPOINTMENT BOX */}
              {/* <div className="w-full xl:w-[320px] bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.08)]">

    
    <div className="bg-gradient-to-r from-[#111] to-[#444] text-white px-6 py-5">

      <h2 className="text-lg font-black tracking-[0.15em]">
        YOUR NEXT APPOINTMENT
      </h2>

    </div>

    
    <div className="p-6">

      <label className="text-xs uppercase font-black tracking-widest text-slate-400 block mb-3">
        Select Date
      </label>

      <input
        type="date"
        className="w-full border-2 border-slate-200 bg-slate-50 p-4 rounded-2xl outline-none focus:border-black transition-all font-semibold"
        value={formData.dietChart.nextAppointment}
        onChange={(e) =>
          updateField(
            "dietChart.nextAppointment",
            e.target.value
          )
        }
      />

      <div className="mt-6 space-y-3">

        {[
          "खा सकते है",
          "परहेज करें",
          "नहीं खा सकते"
        ].map((item) => (

          <label
            key={item}
            className="flex items-center gap-3 text-sm font-semibold text-slate-700"
          >

            <input
              type="checkbox"
              className="w-5 h-5 accent-black rounded"
            />

            {item}

          </label>

        ))}

      </div>

    </div>
  </div> */}
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-6 text-sm">
              {/* GRAINS */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4">
                  अनाज
                </h3>

                {["गेहूं", "ज्वार", "बाजरा", "मक्का", "चावल", "दलिया"].map(
                  (item) => (
                    <label key={item} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.dietChart.grains.includes(item)}
                        onChange={() => toggleDietChart("grains", item)}
                      />
                      {item}
                    </label>
                  ),
                )}
              </div>

              {/* FLOUR */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4">
                  आटा
                </h3>

                {["मैदा", "बेसन"].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.flour.includes(item)}
                      onChange={() => toggleDietChart("flour", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              {/* DRY FRUITS */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4">
                  मेवे
                </h3>

                {[
                  "मूंगफली",
                  "बादाम",
                  "भीगे बादाम",
                  "काजू",
                  "किशमिश",
                  "पिस्ता",
                  "मुनक्का",
                  "अंजीर",
                  "अखरोट",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.dryFruits.includes(item)}
                      onChange={() => toggleDietChart("dryFruits", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              {/* PULSES */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4">
                  दाल
                </h3>

                {[
                  "मूंग छिलका",
                  "अरहर",
                  "साबुत मसूर",
                  "मसूर",
                  "साबुत उड़द",
                  "उड़द छिलका",
                  "चना",
                  "छोले",
                  "राजमा",
                  "लोबिया",
                  "सोयाबीन",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.pulses.includes(item)}
                      onChange={() => toggleDietChart("pulses", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              {/* VEGETABLES */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4">
                  सब्जियां
                </h3>

                {[
                  "मेथी",
                  "पेठा",
                  "सेम",
                  "बथुआ",
                  "गाजर",
                  "आलू",
                  "पालक",
                  "टींडा",
                  "मटर",
                  "टमाटर",
                  "सरसों",
                  "तरोई",
                  "करेला",
                  "नींबू",
                  "प्याज",
                  "पत्ता गोभी",
                  "परवल",
                  "कटहल",
                  "लहसुन",
                  "गोभी",
                  "शलगम",
                  "भिंडी",
                  "शिमला मिर्च",
                  "लौकी",
                  "बैंगन",
                  "अरबी",
                  "ग्वार की फली",
                  "चुकंदर",
                  "कद्दू",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.vegetables.includes(item)}
                      onChange={() => toggleDietChart("vegetables", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              {/* FRUITS */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4">
                  फल
                </h3>

                {[
                  "सेब",
                  "अनार",
                  "अनानास",
                  "संतरा",
                  "केला",
                  "अंगूर",
                  "चीकू",
                  "आम",
                  "अमरूद",
                  "पपीता",
                  "तरबूज",
                  "लीची",
                  "खरबूजा",
                  "आड़ू",
                  "नाशपाती",
                  "मोसंबी",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.fruits.includes(item)}
                      onChange={() => toggleDietChart("fruits", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              {/* DRINKS */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4">
                  पेय पदार्थ
                </h3>

                {[
                  "गुनगुना पानी",
                  "पानी",
                  "ठंडाई",
                  "शिकंजी",
                  "कार्बन युक्त पेय",
                  "नारियल पानी",
                  "चाय",
                  "कॉफी",
                  "आयुर्वेदिक चाय",
                  "फलों का रस",
                  "सब्जियों का सूप",
                  "सब्जियों का रस",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.drinks.includes(item)}
                      onChange={() => toggleDietChart("drinks", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              {/* DAIRY */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4">
                  दुग्ध उत्पाद
                </h3>

                {[
                  "ठंडा दूध",
                  "गरम दूध",
                  "क्रीम सहित दूध",
                  "क्रीम रहित दूध",
                  "गाय का दूध",
                  "भैंस का दूध",
                  "बकरी का दूध",
                  "मट्ठा",
                  "दही",
                  "पनीर",
                  "देसी घी",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.dairy.includes(item)}
                      onChange={() => toggleDietChart("dairy", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              {/* Spices */}
              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4 inline-block">
                  मसाले
                </h3>
                {[
                  "लाल मिर्च",
                  "हरी मिर्च",
                  "हल्दी",
                  "धनिया",
                  "अजवाइन",
                  "लौंग",
                  "सोंठ",
                  "जीरा",
                  "छोटी इलाइची",
                  "बड़ी इलाइची",
                  "काला नमक",
                  "सेंधा नमक",
                  "तेज पत्ता",
                  "खटाई/इमली",
                  "जयफल",
                  "अचार",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.spices.includes(item)}
                      onChange={() => toggleDietChart("spices", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              {/* Sweet */}

              <div>
                <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4 inline-block">
                  मीठा
                </h3>
                {["चीनी", "मिठाई", "शहद", "गुड़", "मिश्री"].map((item) => (
                  <label key={item} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.dietChart.sweets.includes(item)}
                      onChange={() => toggleDietChart("sweets", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            {/* SPICES + SWEETS */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

        <div>
          <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4 inline-block">
            मसाले
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {["लाल मिर्च","हरी मिर्च","हल्दी","धनिया","अजवाइन","लौंग","सोंठ","जीरा","छोटी इलाइची","बड़ी इलाइची","काला नमक","सेंधा नमक","तेज पत्ता","खटाई/इमली","जयफल","अचार"].map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.dietChart.spices.includes(item)}
                  onChange={() => toggleDietChart("spices", item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="bg-black text-white px-3 py-2 rounded-lg font-bold mb-4 inline-block">
            मीठा
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {["चीनी","मिठाई","शहद","गुड़","मिश्री"].map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.dietChart.sweets.includes(item)}
                  onChange={() => toggleDietChart("sweets", item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

      </div> */}

            {/* SIGNATURE */}
            {/* <div className="mt-16 flex justify-end">
  <div className="text-center">

    
    <div className="flex justify-center mb-1">
      <img
        src="/digitalsign.jpg"
        alt="Doctor Signature"
        className="h-20 object-contain"
      />
    </div>

    
    <div className="border-t border-black w-56 pt-2">
      <p className="font-semibold tracking-wide">
        Dr. {user.name}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        Authorized Ayurvedic Practitioner
      </p>

      <p className="text-[10px] text-gray-400 mt-1">
        Reg. No: AYU-45821
      </p>
    </div>

  </div>
</div> */}

            {/* FOOTER */}
            <div className="mt-12 border-t pt-6">
              <h2 className="text-2xl font-black text-center">
                “उचित आहार ही स्वास्थ्य का पहला साधन है”
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* ========================= HOW TO TAKE MODAL ========================= */}

      {showHowToTake && (
        <div className="fixed inset-0 bg-black/70 z-[120] overflow-y-auto flex justify-center items-start p-4">
          <div className="bg-[#f3f3f3] w-full max-w-7xl min-h-screen relative shadow-2xl border-[8px] border-white rounded-[18px] overflow-hidden">
            {/* CLOSE */}
            <button
              onClick={() => setShowHowToTake(false)}
              className="absolute top-4 right-5 text-5xl text-slate-500 hover:text-black z-50"
            >
              ×
            </button>

            <div className="p-5 md:p-8">
              {/* ================= HEADER ================= */}

              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* LOGO */}
                <div className="w-32 h-32 rounded-full bg-white border flex items-center justify-center overflow-hidden">
                  <img
                    src="brandicon.png"
                    alt="logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* TITLE */}
                <div className="flex-1 text-center">
                  <div className="inline-block bg-[#e7e7e7] px-10 py-5">
                    <h1 className="text-3xl md:text-6xl font-black tracking-tight">
                      औषधि पैक लेने की विधि
                    </h1>
                  </div>
                </div>
              </div>

              {/* ================= DESCRIPTION ================= */}

              <div className="mt-8 bg-[#e5e5e5] border border-slate-400 p-5">
                <p className="text-[18px] md:text-[20px] font-bold leading-10 text-slate-800">
                  ये औषधियां/दवाइयां विशेष रूप से आपकी बताई हुई समस्याओं एवं
                  लक्षणों के आधार पर दी गई हैं। इनमें पूर्णतः आयुर्वेदिक औषधि
                  द्रव्यों का प्रयोग किया गया है। इनको लेने की विधि नीचे बताई गई
                  है।
                </p>
              </div>

              {/* ================= CHURAN SECTION ================= */}

              <div className="mt-12 border-[3px] border-slate-500 bg-white">
                <div className="grid grid-cols-12">
                  {/* LEFT */}
                  <div className="col-span-2 border-r-[3px] border-slate-500 bg-[#efefef] p-3 flex flex-col items-center">
                    <h2 className="text-4xl font-black mb-6 mt-4">औषधि</h2>

                    <img
                      src="/images/churan.png"
                      alt="churan"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* TABLE */}
                  {/* TEXT AREA */}
                  <div className="col-span-8 p-6">
                    {(() => {
                      const churanData = formData.howToTake?.churan || {
                        morningQty: "-----",
                        morningTime: "-----",

                        nightQty: "-----",
                        nightTime: "-----",

                        with: "-----",
                      };

                      return (
                        <div
                          className="
          text-[24px]
          leading-[2.6]
          font-black
          text-slate-800
        "
                        >
                          डिब्बे में दिया गई औषधि आपके लिए उपयुक्त कई औषधियों के
                          मिश्रण से बना है।
                          <br />
                          इस औषधि को
                          {/* MORNING QTY */}
                          <select
                            value={churanData.morningQty}
                            onChange={(e) => {
                              updateField("howToTake.churan", {
                                ...churanData,
                                morningQty: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                          </select>
                          चम्मच
                          {/* MORNING TIME */}
                          <select
                            value={churanData.morningTime}
                            onChange={(e) => {
                              updateField("howToTake.churan", {
                                ...churanData,
                                morningTime: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>सुबह</option>
                            <option>दोपहर</option>
                            <option>सुबह एवं शाम</option>
                            <option>सुबह , दोपहर एवं शाम </option>
                            <option>रात</option>
                          </select>
                          {/* ({churanData.morningSlot})

        खाना खाने के बाद व */}
                          {/* NIGHT QTY */}
                          {/* <select
          value={churanData.nightQty}
          onChange={(e) => {

            updateField("howToTake.churan", {
              ...churanData,
              nightQty: e.target.value,
            });
          }}
          className="
            mx-2
            px-3
            border-b-4
            border-slate-500
            bg-transparent
            outline-none
          "
        >
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </select>

        चम्मच */}
                          {/* NIGHT TIME */}
                          <select
                            value={churanData.nightTime}
                            onChange={(e) => {
                              updateField("howToTake.churan", {
                                ...churanData,
                                nightTime: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>खाना खाने के बाद</option>
                            <option>खाना खाने के पहले</option>
                            {/* <option>शाम</option>
          <option>रात</option> */}
                          </select>
                          {/* ({churanData.nightSlot}) */}
                          {/* खाना खाने के बाद */}
                          {/* WITH */}
                          <select
                            value={churanData.with}
                            onChange={(e) => {
                              updateField("howToTake.churan", {
                                ...churanData,
                                with: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>गुनगुने पानी</option>
                            <option>गरम पानी</option>
                            <option>दूध</option>
                            <option>घी</option>
                          </select>
                          से लें।
                          <br />
                          <br />
                          चम्मच डिब्बे के अन्दर दी गई है।
                        </div>
                      );
                    })()}
                  </div>

                  {/* RIGHT */}
                  <div className="col-span-2 border-l-[3px] border-slate-500 bg-[#fafafa] p-3 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-black text-center mb-4">
                      औषधि की सही मात्रा
                    </h2>

                    <img
                      src="/images/spoon-guide.png"
                      alt="spoon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* ================= TABLET SECTION ================= */}

              <div className="border-x-[3px] border-b-[3px] border-slate-500 bg-white">
                <div className="grid grid-cols-12">
                  {/* LEFT */}
                  <div className="col-span-2 border-r-[3px] border-slate-500 bg-[#efefef] p-3 flex flex-col items-center">
                    <h2 className="text-4xl font-black mb-6 mt-4">टैबलेट</h2>

                    <img
                      src="/images/tablet.png"
                      alt="tablet"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* TABLE */}
                  {/* TEXT AREA */}
                  {/* TEXT AREA */}
                  <div className="col-span-10 p-6">
                    {(() => {
                      const tabletData = formData.howToTake?.tablets || {
                        type: "-----",
                        medicineName: "-----",

                        qtyPerTime: "-----",
                        totalQty: "-----",

                        morningTime: "-----",
                        // morningSlot: "8-9 बजे",

                        eveningTime: "-----",
                        // eveningSlot: "5-6 बजे",

                        with: "-----",
                      };

                      return (
                        <div
                          className="
          text-[24px]
          leading-[2.8]
          font-black
          text-slate-800
        "
                        >
                          आपको
                          {/* TYPES */}
                          <select
                            value={tabletData.type}
                            onChange={(e) => {
                              updateField("howToTake.tablets", {
                                ...tabletData,
                                type: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                          </select>
                          प्रकार की गोलियाँ मिली होंगी। ( कुल
                          <select
                            value={tabletData.totalQty}
                            onChange={(e) => {
                              updateField("howToTake.tablets", {
                                ...tabletData,
                                totalQty: e.target.value,
                              });
                            }}
                            // className="
                            //   mx-2
                            //   px-3
                            //   border-b-4
                            //   border-slate-500
                            //   bg-transparent
                            //   outline-none
                            // "
                            className="
            mx-1
            px-1
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>30</option>
                            <option>60</option>
                            <option>90</option>
                            <option>120</option>
                          </select>
                          गोलियाँ )
                          <br />
                          हर प्रकार की
                          {/* MEDICINE NAME */}
                          {/* PER TIME */}
                          <select
                            value={tabletData.qtyPerTime}
                            onChange={(e) => {
                              updateField("howToTake.tablets", {
                                ...tabletData,
                                qtyPerTime: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                          </select>
                          गोली,
                          {/* TOTAL */}
                          {/* <input
          type="text"
          value={tabletData.totalQty}
          onChange={(e) => {

            updateField("howToTake.tablets", {
              ...tabletData,
              totalQty: e.target.value,
            });
          }}
          className="
            mx-2
            px-3
            w-[120px]
            border-b-4
            border-slate-500
            bg-transparent
            outline-none
            text-center
          "
        /> */}
                          {/* MORNING */}
                          <select
                            value={tabletData.morningTime}
                            onChange={(e) => {
                              updateField("howToTake.tablets", {
                                ...tabletData,
                                morningTime: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>सुबह</option>
                            <option>दोपहर</option>
                            <option>सुबह एवं शाम</option>
                            <option>सुबह , दोपहर एवं शाम </option>
                            <option>रात</option>
                          </select>
                          {/* ({tabletData.morningSlot})

        एवं */}
                          {/* EVENING */}
                          <select
                            value={tabletData.eveningTime}
                            onChange={(e) => {
                              updateField("howToTake.tablets", {
                                ...tabletData,
                                eveningTime: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            bg-transparent
            outline-none
          "
                          >
                            {/* <option>नास्ते के समय</option> */}
                            <option>-----</option>
                            <option>नास्ते के बाद</option>

                            <option>नास्ते के पहले </option>
                            {/* <option>रात</option> */}
                          </select>
                          {/* ({tabletData.eveningSlot}) */}
                          {/* नास्ते के बाद */}
                          {/* WITH */}
                          <select
                            value={tabletData.with}
                            onChange={(e) => {
                              updateField("howToTake.tablets", {
                                ...tabletData,
                                with: e.target.value,
                              });
                            }}
                            className="
            mx-1
            px-1
            
            bg-transparent
            outline-none
          "
                          >
                            <option>-----</option>
                            <option>गुनगुने पानी</option>
                            <option>गरम पानी</option>
                            <option>दूध</option>
                          </select>
                          के साथ लें।
                          <br />
                          <br />
                          अच्छे परिणाम के लिए गोली चबाकर लें।
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-xl font-black text-slate-800 text-center mb-2 tracking-tight uppercase">
              Consultation Locked
            </h3>
            <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed">
              This appointment is marked as{" "}
              <span className="font-bold text-teal-700">Completed</span> and is
              permanently locked. System integrity rules prevent historical
              write changes.
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

// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   UserRound,
//   Stethoscope,
//   FileText,
//   Clock3,
//   Calendar,
//   X
// } from "lucide-react";

// export default function MyAppointments() {
//   const [appointments, setAppointments] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const token = localStorage.getItem("token");

//   const getTodayDateString = () => new Date().toLocaleDateString('sv');
//   const [currentSystemDate, setCurrentSystemDate] = useState(getTodayDateString());

//   const INITIAL_FORM_DATA = {
//     prescription: "",
//     relief: "",
//     pastHistory: {
//       BP: { h: "", d: "", m: "", s: "" },
//       DM: { h: "", d: "", m: "", s: "" },
//       Thyroid: { h: "", d: "", m: "", s: "" },
//       TBCAD: { h: "", d: "", m: "", s: "" },
//       Others: { note: "" }
//     },
//     familyHistory: "",
//     treatmentHistory: "",
//     bowels: {
//       vega: "",
//       consistency: [],
//       associated: [],
//       evacuation: [],
//       laxatives: ""
//     },
//     appetite: {
//       hungry: "",
//       timeToEat: "",
//       lightheaded: "",
//       drowsiness: "",
//       disturbedBy: ""
//     },
//     gas: {
//       features: [],
//       intensity: "",
//       medicine: "",
//       others: ""
//     },
//     acidity: {
//       features: [],
//       timing: [],
//       intensity: "",
//       medicine: ""
//     },
//     tongue: {
//       status: "",
//       intensity: "",
//       color: "",
//       taste: "",
//       others: ""
//     },
//     eyes: {
//       pallor: "",
//       icterus: "",
//       vision: "",
//       others: ""
//     },
//     urine: {
//       vega: [],
//       associated1: [],
//       associated2: [],
//       status: [],
//       color: "",
//       others: ""
//     },
//     sleep: {
//       duration: "",
//       intensity: "",
//       pills: "",
//       others: "",
//       features: []
//     },
//     mind: {
//       features: [],
//       sattva: "",
//       others: ""
//     },
//     relationships: {
//       family: "",
//       relation: "",
//       emotion: ""
//     },
//     diet: [],
//     allergies: {
//       food: "",
//       medicine: "",
//       others: ""
//     },
//     addiction: {
//       habits: [],
//       others: ""
//     },
//     menstrual: {
//       duration: "",
//       flow: [],
//       color: "",
//       others: "",
//       pain: "",
//       discharge: "",
//       smell: [],
//       medicine: ""
//     },
//     obs: {
//       G: "",
//       P: "",
//       A: "",
//       L: "",
//       cSection: "",
//       normal: ""
//     },
//     examination: "",
//     investigation: {
//       provided: "",
//       details: ""
//     },
//     prakriti: {
//       vata: "",
//       pitta: "",
//       kapha: ""
//     },
//     diagnosis: "",
//     chikitsa: "",
//     advices: "",
//     rx: {
//       churan: "",
//       tablets: "",
//       others: ""
//     }
//   };

//   const [formData, setFormData] = useState(INITIAL_FORM_DATA);
//   const [followUps, setFollowUps] = useState([]);

//   const config = { headers: { Authorization: `Bearer ${token}` } };

//   useEffect(() => { fetchMyAppointments(); }, []);

//   useEffect(() => {
//     const checkDateRollover = setInterval(() => {
//       const actualToday = getTodayDateString();
//       if (currentSystemDate !== actualToday) {
//         setCurrentSystemDate(actualToday);
//         fetchMyAppointments();
//       }
//     }, 60000);
//     return () => clearInterval(checkDateRollover);
//   }, [currentSystemDate]);

//   const fetchMyAppointments = async () => {
//     try {
//       const res = await axios.get("http://localhost:5001/api/appointments/my", config);
//       const sortedAppointments = (res.data || []).sort((a, b) => {
//         const dateA = new Date(a.appointmentDate).toLocaleDateString('sv');
//         const dateB = new Date(b.appointmentDate).toLocaleDateString('sv');
//         const todayStr = getTodayDateString();
//         if (dateA === todayStr && dateB !== todayStr) return -1;
//         if (dateA !== todayStr && dateB === todayStr) return 1;
//         return new Date(b.appointmentDate) - new Date(a.appointmentDate);
//       });
//       setAppointments(sortedAppointments);
//     } catch (err) {
//       console.error("Failed fetching practitioners appointments:", err);
//     }
//   };

//   // ─── HELPER: Extract clean YYYY-MM-DD from ISO timestamp ───────────────────
//   const formatIncomingDate = (dateVal) => {
//     if (!dateVal) return "";
//     if (typeof dateVal === "string") {
//       return dateVal.includes("T") ? dateVal.split("T")[0] : dateVal;
//     }
//     // Handle Date objects from MongoDB
//     return new Date(dateVal).toLocaleDateString('sv');
//   };

//   // ─── HELPER: Sanitize followUp array from MongoDB ──────────────────────────
//   const sanitizeFollowUpArray = (rawArray) => {
//     if (!Array.isArray(rawArray) || rawArray.length === 0) return [];
//     return rawArray.map(visit => ({
//       date: formatIncomingDate(visit?.date),
//       notes: visit?.notes || "",
//       churan: visit?.churan || "",
//       tablets: visit?.tablets || "",
//       others: visit?.others || ""
//     }));
//   };

//   // ─── HELPER: Extract followUps from any response shape ────────────────────
//   // Handles all possible MongoDB response structures so no data is missed
//   const extractFollowUps = (source) => {
//     if (!source) return [];

//     // Priority 1: top-level followUps array on the object
//     if (Array.isArray(source.followUps) && source.followUps.length > 0) {
//       console.log("✅ followUps found at top level:", source.followUps);
//       return sanitizeFollowUpArray(source.followUps);
//     }

//     // Priority 2: followUps nested inside formData
//     if (Array.isArray(source.formData?.followUps) && source.formData.followUps.length > 0) {
//       console.log("✅ followUps found inside formData:", source.formData.followUps);
//       return sanitizeFollowUpArray(source.formData.followUps);
//     }

//     // Priority 3: followUps inside first appointment if response has appointments array
//     if (Array.isArray(source.appointments) && source.appointments[0]?.followUps?.length > 0) {
//       console.log("✅ followUps found inside appointments[0]:", source.appointments[0].followUps);
//       return sanitizeFollowUpArray(source.appointments[0].followUps);
//     }

//     console.warn("⚠️ No followUps found in response. Full response shape:", JSON.stringify(source, null, 2));
//     return [];
//   };

//   const openAppointment = async (appointment) => {
//     // Lock Check
//     if (["completed"].includes(appointment.status?.toLowerCase())) {
//       alert("This appointment is completed and locked. It cannot be opened or modified.");
//       return;
//     }

//     setSelected(appointment);

//     // 1. Reset to clean state
//     setFormData(INITIAL_FORM_DATA);
//     setFollowUps([]);

//     // 2. If CURRENT appointment already has workspace data saved, use it directly
//     if (appointment.formData && Object.keys(appointment.formData).length > 0) {
//       console.log("📋 Loading from current appointment's saved formData");

//       setFormData({
//         ...INITIAL_FORM_DATA,
//         ...appointment.formData,
//       });

//       // *** FIX: Use extractFollowUps on the full appointment object ***
//       const loadedFollowUps = extractFollowUps(appointment);
//       console.log("📋 Follow-ups loaded from current appointment:", loadedFollowUps);
//       setFollowUps(loadedFollowUps);
//       return;
//     }

//     // 3. No current data — fetch full patient history from backend
//     if (appointment.patient?._id) {
//       try {
//         const res = await axios.get(
//           `http://localhost:5001/api/appointments/patient-history/${appointment.patient._id}`,
//           config
//         );

//         console.log("🔍 Patient history API raw response:", JSON.stringify(res.data, null, 2));

//         if (res.data) {
//           // Load formData from whichever level it exists at
//           const incomingFormData = res.data.formData || res.data;
//           setFormData({
//             ...INITIAL_FORM_DATA,
//             ...incomingFormData,
//           });

//           // *** FIX: Use extractFollowUps on the full res.data object ***
//           const loadedFollowUps = extractFollowUps(res.data);
//           console.log("📋 Follow-ups loaded from patient history:", loadedFollowUps);
//           setFollowUps(loadedFollowUps);
//         } else {
//           console.log("No previous history found for this patient.");
//         }
//       } catch (err) {
//         console.error("Error fetching patient history:", err.message);
//       }
//     }
//   };

//   const updateField = (path, value) => {
//     const keys = path.split('.');
//     setFormData(prev => {
//       let temp = { ...prev };
//       let current = temp;
//       for (let i = 0; i < keys.length - 1; i++) {
//         current[keys[i]] = { ...current[keys[i]] };
//         current = current[keys[i]];
//       }
//       current[keys[keys.length - 1]] = value;
//       return temp;
//     });
//   };

//   const toggleCheckbox = (path, item) => {
//     const current = path.split('.').reduce((o, i) => o[i], formData) || [];
//     const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
//     updateField(path, updated);
//   };

//   const savePrescription = async () => {
//     try {
//       await axios.put(
//         `http://localhost:5001/api/appointments/${selected._id}/prescription`,
//         { formData, followUps },
//         config
//       );
//       alert("Full Medical Record Saved");
//       fetchMyAppointments();
//       setSelected(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="p-4 md:p-6 min-h-screen ">
//       {/* Header */}
//       <div className="mb-8 bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-5">
//         <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
//           My Appointments
//         </h1>
//         <p className="text-slate-500 mt-2 text-sm md:text-lg">
//           Ayurvedic Consultation & Follow-Up Management
//         </p>
//       </div>

//       {/* Appointment List */}
//       <div className="grid gap-4">
//         {appointments.filter((a) => a.appointmentDate && new Date(a.appointmentDate).toLocaleDateString('sv') === currentSystemDate).length === 0 ? (
//           <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-dashed border-slate-200 font-medium italic text-sm">
//             No consultations scheduled for today.
//           </div>
//         ) : (
//           appointments
//             .filter((a) => a.appointmentDate && new Date(a.appointmentDate).toLocaleDateString('sv') === currentSystemDate)
//             .map((a) => (
//               <div
//                 key={a._id}
//                 onClick={() => openAppointment(a)}
//                 className="cursor-pointer bg-white border border-teal-200/80 shadow-md ring-2 ring-teal-500/5 rounded-[28px] p-5 md:p-6 transition-all duration-300 hover:scale-[1.012] active:scale-[0.98]"
//               >
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
//                   <div className="flex items-center gap-4">
//                     <div className="h-10 w-10 rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-500/20 flex items-center justify-center shrink-0">
//                       <UserRound size={20} />
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <h2 className="text-md font-bold text-slate-800 leading-tight">
//                           {a.patient?.name}
//                         </h2>
//                         <span className="bg-teal-100 text-teal-800 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase">
//                           Today
//                         </span>
//                       </div>
//                       <p className="text-xs text-slate-400 mt-1">
//                         Patient ID: {a.patient?.patientId || "N/A"}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex flex-wrap items-center gap-3 md:gap-4">
//                     <div className="bg-[#eef1f7] px-3 py-2 rounded-2xl">
//                       <p className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
//                         <Calendar size={14} /> {new Date(a.appointmentDate).toLocaleDateString()} | <Clock3 size={14} /> {a.time}
//                       </p>
//                     </div>
//                     <div
//                       className={`px-4 py-2 rounded-full text-xs font-semibold capitalize ${
//                         ["viewed", "completed"].includes(a.status?.toLowerCase())
//                           ? "bg-green-100 text-green-700"
//                           : "bg-yellow-100 text-yellow-700"
//                       }`}
//                     >
//                       {a.status || "pending"}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//         )}
//       </div>

//       {selected && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto p-3 md:p-6">
//           <div className="bg-white rounded-2xl p-4 md:p-8 w-full max-w-7xl relative my-4 shadow-2xl">
//             <button onClick={() => setSelected(null)} className="absolute top-4 right-4 md:right-6 text-3xl md:text-4xl leading-none text-slate-400 hover:text-slate-600 transition-colors">
//               &times;
//             </button>
//             <h2 className="text-xl md:text-3xl font-bold mb-8 text-center uppercase tracking-widest border-b pb-4 mt-6 md:mt-0">
//               Ayurvedic Consultation Form
//             </h2>

//             <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">BASIC DETAILS</div>

//             {/* PATIENT INFO */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Patient Name</label>
//                 <input value={selected.patient?.name || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Patient Name" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Patient ID</label>
//                 <input value={selected.patient?.patientId || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Patient ID" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Phone</label>
//                 <input value={selected.patient?.phone ? selected.patient.phone.slice(-4).padStart(selected.patient.phone.length, "X") : ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Phone" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Age</label>
//                 <input value={selected.patient?.age || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Age" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">DOB</label>
//                 <input value={selected.patient?.dob || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="DOB" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Gender</label>
//                 <input value={selected.patient?.gender || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Gender" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Email</label>
//                 <input value={selected.patient?.email || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Email" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Occupation</label>
//                 <input value={selected.patient?.occupation || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Occupation" readOnly />
//               </div>
//               <div className="flex flex-col col-span-2 gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Address</label>
//                 <input value={`${selected.patient?.address || ""}, ${selected.patient?.city || ""}, ${selected.patient?.state || ""} - ${selected.patient?.pinCode || ""}`.trim()} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Address" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Height</label>
//                 <input value={`${selected.patient?.height || ""} cms`} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Height" readOnly />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Weight</label>
//                 <input value={`${selected.patient?.weight || ""} kg`} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Weight" readOnly />
//               </div>
//               <div className="flex flex-col col-span-2 gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Reffered By</label>
//                 <input value={selected.patient?.referredBy || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Referred By" readOnly />
//               </div>
//               <div className="flex flex-col col-span-2 gap-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Marital Status</label>
//                 <input value={selected.patient?.maritalStatus || ""} className="border border-slate-200 bg-slate-50 p-4 rounded-2xl shadow-sm focus:outline-none text-sm" placeholder="Marital Status" readOnly />
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">CONSULTATION</div>

//             {/* CHIEF COMPLAINTS & RELIEF MATRIX */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <div className="border-2 border-slate-800 p-4 rounded-xl bg-slate-50/50">
//                 <h3 className="font-bold text-lg md:text-xl mb-3 text-center">RELIEF MATRIX</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
//                   {["No Relief", "Little Relief", "Stable", "Improved", "Cured"].map(r => (
//                     <label key={r} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors text-sm">
//                       <input type="radio" className="w-4 h-4 accent-teal-700" checked={formData.relief === r} onChange={() => updateField("relief", r)} /> {r}
//                     </label>
//                   ))}
//                 </div>
//               </div>
//               <div className="md:col-span-2 border-2 border-slate-800 p-4 rounded-xl">
//                 <h3 className="font-bold text-lg md:text-xl mb-3">CHIEF COMPLAINTS</h3>
//                 <textarea value={formData.prescription} onChange={(e) => updateField("prescription", e.target.value)} rows={4} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" placeholder="Write chief complaints here..." />
//               </div>
//             </div>

//             {/* PAST MEDICAL HISTORY TABLE */}
//             <div className="mb-8">
//               <h3 className="font-bold text-lg md:text-xl mb-3 uppercase">Past Medical History</h3>
//               <div className="overflow-x-auto rounded-xl border border-slate-800">
//                 <table className="w-full border-collapse min-w-[600px] text-sm">
//                   <thead className="bg-slate-100">
//                     <tr>
//                       <th className="border-b border-r border-slate-800 p-2">Condition</th>
//                       <th className="border-b border-r border-slate-800 p-2">History (Y/N)</th>
//                       <th className="border-b border-r border-slate-800 p-2">Duration</th>
//                       <th className="border-b border-r border-slate-800 p-2">Medicine</th>
//                       <th className="border-b border-slate-800 p-2">Current Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {["BP", "DM", "Thyroid", "TBCAD"].map(k => (
//                       <tr key={k}>
//                         <td className="border-b border-r border-slate-800 p-2 font-bold bg-slate-50">{k === "TBCAD" ? "TB/CAD/Jaundice" : k}</td>
//                         <td className="border-b border-r border-slate-800 p-1"><input className="w-full text-center outline-none bg-transparent" value={formData.pastHistory[k].h} onChange={(e) => updateField(`pastHistory.${k}.h`, e.target.value)} /></td>
//                         <td className="border-b border-r border-slate-800 p-1"><input className="w-full text-center outline-none bg-transparent" value={formData.pastHistory[k].d} onChange={(e) => updateField(`pastHistory.${k}.d`, e.target.value)} /></td>
//                         <td className="border-b border-r border-slate-800 p-1"><input className="w-full text-center outline-none bg-transparent" value={formData.pastHistory[k].m} onChange={(e) => updateField(`pastHistory.${k}.m`, e.target.value)} /></td>
//                         <td className="border-b border-slate-800 p-1"><input className="w-full text-center outline-none bg-transparent" value={formData.pastHistory[k].s} onChange={(e) => updateField(`pastHistory.${k}.s`, e.target.value)} /></td>
//                       </tr>
//                     ))}
//                     <tr>
//                       <td className="border-r border-slate-800 p-2 font-bold bg-slate-50">Others</td>
//                       <td colSpan={4} className="p-1"><input className="w-full px-2 outline-none" value={formData.pastHistory.Others.note} onChange={(e) => updateField("pastHistory.Others.note", e.target.value)} /></td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//               <div className="mt-4 space-y-3">
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//                   <span className="font-bold text-sm shrink-0">Family History:</span>
//                   <input className="border-b border-dotted border-slate-800 flex-1 outline-none text-sm py-1" value={formData.familyHistory} onChange={(e) => updateField("familyHistory", e.target.value)} />
//                 </div>
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//                   <span className="font-bold text-sm shrink-0">Treatment History:</span>
//                   <input className="border-b border-dotted border-slate-800 flex-1 outline-none text-sm py-1" value={formData.treatmentHistory} onChange={(e) => updateField("treatmentHistory", e.target.value)} />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white text-center font-black py-4 mb-8 tracking-[0.2em] md:tracking-[0.4em] rounded-2xl shadow-xl text-sm md:text-base">SYSTEMIC EXAMINATION</div>

//             {/* BOWELS SECTION */}
//             <div className="mb-8 border-b pb-6">
//               <div className="flex flex-wrap items-center gap-3 mb-6">
//                 <h3 className="text-lg md:text-xl font-bold text-teal-800">BOWELS</h3>
//                 <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
//                   <span className="text-xs font-bold uppercase text-slate-500">Frequency:</span>
//                   <input className="border border-slate-300 w-10 text-center rounded bg-white font-bold" value={formData.bowels.vega} onChange={(e) => updateField("bowels.vega", e.target.value)} />
//                   <span className="text-xs text-slate-500">/day</span>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                   <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">Consistency</p>
//                   <div className="space-y-2">
//                     {["Hard", "Soft", "Loose", "Well Formed", "Mucoid"].map(i => (
//                       <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700">
//                         <input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.bowels.consistency.includes(i)} onChange={() => toggleCheckbox("bowels.consistency", i)} /> {i}
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                   <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">Associated With</p>
//                   <div className="space-y-2">
//                     {["Urgency", "Strain", "Pain", "Bleeding", "Burning Sensation"].map(i => (
//                       <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700">
//                         <input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.bowels.associated.includes(i)} onChange={() => toggleCheckbox("bowels.associated", i)} /> {i}
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                   <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">Evacuation</p>
//                   <div className="space-y-2">
//                     {["Complete", "Incomplete", "Incontinence"].map(i => (
//                       <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700">
//                         <input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.bowels.evacuation.includes(i)} onChange={() => toggleCheckbox("bowels.evacuation", i)} /> {i}
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                   <p className="font-bold underline text-xs mb-3 text-slate-600 uppercase">Taking Laxatives</p>
//                   <div className="flex flex-col gap-2">
//                     {["Yes", "No"].map(i => (
//                       <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-teal-700">
//                         <input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.bowels.laxatives === i} onChange={() => updateField("bowels.laxatives", i)} /> {i}
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* APPETITE SECTION */}
//             <div className="bg-slate-50 p-4 md:p-6 mb-8 rounded-2xl border border-slate-100">
//               <h3 className="font-bold text-lg md:text-xl mb-4 text-teal-800">APPETITE AND DIGESTION</h3>
//               <div className="space-y-4">
//                 {[
//                   { label: "Do you feel hungry?", field: "hungry" },
//                   { label: "You take food because it is time to eat?", field: "timeToEat" },
//                   { label: "Do you feel lightheadedness before the next meal?", field: "lightheaded" },
//                   { label: "Do you feel drowsiness after meals?", field: "drowsiness" }
//                 ].map(q => (
//                   <div key={q.field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 last:border-0">
//                     <span className="text-sm font-medium text-slate-700">{q.label}</span>
//                     <div className="flex gap-6">
//                       <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.appetite[q.field] === "Yes"} onChange={() => updateField(`appetite.${q.field}`, "Yes")} /> Yes</label>
//                       <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.appetite[q.field] === "No"} onChange={() => updateField(`appetite.${q.field}`, "No")} /> No</label>
//                     </div>
//                     {q.field === "hungry" && (
//                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0 sm:ml-4 flex-1">
//                         <span className="text-xs font-bold uppercase text-slate-400">Disturbed by:</span>
//                         <input className="w-full border-b border-slate-300 outline-none bg-transparent text-sm py-1 focus:border-teal-500 transition-colors" value={formData.appetite.disturbedBy} onChange={(e) => updateField("appetite.disturbedBy", e.target.value)} />
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* GAS & ACIDITY SECTION */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-slate-100 pb-8">
//               <div className="bg-slate-50 p-5 rounded-3xl">
//                 <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">Gas</h3>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     {["Bloating", "Passing with ease", "Passing with Difficulty", "Burps"].map(i => (
//                       <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.gas.features.includes(i)} onChange={() => toggleCheckbox("gas.features", i)} /> {i}</label>
//                     ))}
//                   </div>
//                   <div className="space-y-2">
//                     <p className="font-bold text-xs uppercase text-slate-500">Intensity</p>
//                     {["Mild", "Moderate", "Severe"].map(i => (
//                       <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.gas.intensity === i} onChange={() => updateField("gas.intensity", i)} /> {i}</label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-slate-50 p-5 rounded-3xl">
//                 <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">Acidity</h3>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     {["Heart burn", "Reflux", "Sour belching", "Bile"].map(i => (
//                       <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.acidity.features.includes(i)} onChange={() => toggleCheckbox("acidity.features", i)} /> {i}</label>
//                     ))}
//                   </div>
//                   <div className="space-y-2">
//                     <p className="font-bold text-xs uppercase text-slate-500">Intensity</p>
//                     {["Mild", "Moderate", "Severe"].map(i => (
//                       <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.acidity.intensity === i} onChange={() => updateField("acidity.intensity", i)} /> {i}</label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* TONGUE & EYES */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//               <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
//                 <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">Tongue</h3>
//                 <div className="flex gap-6 mb-4">
//                   {["Coated", "Uncoated"].map(i => (
//                     <label key={i} className="flex items-center gap-2 text-sm cursor-pointer font-semibold"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.tongue.status === i} onChange={() => updateField("tongue.status", i)} /> {i}</label>
//                   ))}
//                 </div>
//                 <div className="flex flex-wrap items-center gap-4 mb-4">
//                   <span className="text-sm font-bold text-slate-500 uppercase">Intensity:</span>
//                   {["Mild", "Moderate", "Severe"].map(i => (
//                     <label key={i} className="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.tongue.intensity === i} onChange={() => updateField("tongue.intensity", i)} /> {i}</label>
//                   ))}
//                 </div>
//                 <div className="space-y-3">
//                   <input placeholder="Color" className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm" value={formData.tongue.color} onChange={(e) => updateField("tongue.color", e.target.value)} />
//                   <input placeholder="Taste Perception" className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm" value={formData.tongue.taste} onChange={(e) => updateField("tongue.taste", e.target.value)} />
//                 </div>
//               </div>
//               <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
//                 <h3 className="font-bold text-lg mb-4 uppercase text-teal-800">Eyes</h3>
//                 <div className="space-y-4">
//                   <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-2">
//                     <span className="text-sm font-bold text-slate-500 uppercase w-16">Pallor:</span>
//                     {["Mild", "Moderate", "Severe"].map(i => (
//                       <label key={i} className="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.eyes.pallor === i} onChange={() => updateField("eyes.pallor", i)} /> {i}</label>
//                     ))}
//                   </div>
//                   <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-2">
//                     <span className="text-sm font-bold text-slate-500 uppercase w-16">Icterus:</span>
//                     {["Mild", "Moderate", "Severe"].map(i => (
//                       <label key={i} className="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.eyes.icterus === i} onChange={() => updateField("eyes.icterus", i)} /> {i}</label>
//                     ))}
//                   </div>
//                   <input placeholder="Vision details" className="w-full border-b border-slate-200 py-2 outline-none focus:border-teal-500 transition-colors text-sm" value={formData.eyes.vision} onChange={(e) => updateField("eyes.vision", e.target.value)} />
//                 </div>
//               </div>
//             </div>

//             {/* URINE SECTION */}
//             <div className="mb-8 p-4 md:p-6 border border-slate-200 rounded-3xl bg-slate-50/30">
//               <h3 className="font-bold text-lg md:text-xl mb-6 text-teal-800 uppercase tracking-wide">Urine</h3>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                 <div>
//                   <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">Vega</p>
//                   <div className="space-y-2">
//                     {["Day", "Night"].map(i => (
//                       <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.urine.vega.includes(i)} onChange={() => toggleCheckbox("urine.vega", i)} /> {i}</label>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">Association I</p>
//                   <div className="space-y-2">
//                     {["Urgency", "Strain", "Pain"].map(i => (
//                       <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.urine.associated1.includes(i)} onChange={() => toggleCheckbox("urine.associated1", i)} /> {i}</label>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">Association II</p>
//                   <div className="space-y-2">
//                     {["Fourthly", "Bleeding", "Burning Sensation"].map(i => (
//                       <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.urine.associated2.includes(i)} onChange={() => toggleCheckbox("urine.associated2", i)} /> {i}</label>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="font-bold text-xs uppercase text-slate-400 mb-3 border-l-2 border-teal-500 pl-2">Status</p>
//                   <div className="space-y-2">
//                     {["Satisfactory", "Unsatisfactory", "H/o Prostate"].map(i => (
//                       <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.urine.status.includes(i)} onChange={() => toggleCheckbox("urine.status", i)} /> {i}</label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* MIND & SLEEP SECTION */}
//             <div className="bg-slate-50 p-4 md:p-6 mb-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 border border-slate-200">
//               <div>
//                 <h3 className="font-bold text-lg mb-4 text-teal-800 uppercase">Sleep</h3>
//                 <div className="flex items-center gap-3 mb-4">
//                   <span className="text-sm font-bold text-slate-500 shrink-0">Duration:</span>
//                   <input className="border-b border-slate-300 flex-1 bg-transparent outline-none py-1 text-sm focus:border-teal-500" value={formData.sleep.duration} onChange={(e) => updateField("sleep.duration", e.target.value)} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div className="space-y-2">
//                     {["Normal", "Sound", "Dreams"].map(i => (
//                       <label key={i} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.sleep.features.includes(i)} onChange={() => toggleCheckbox("sleep.features", i)} /> {i}</label>
//                     ))}
//                   </div>
//                   <div className="space-y-2">
//                     {["Disturbed", "Late Onset", "Disturbed in Middle"].map(i => (
//                       <label key={i} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.sleep.features.includes(i)} onChange={() => toggleCheckbox("sleep.features", i)} /> {i}</label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <h3 className="font-bold text-lg mb-4 text-teal-800 uppercase">Mind</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
//                   <div className="space-y-2">
//                     <p className="font-bold text-xs uppercase text-slate-400 mb-2">Features</p>
//                     {["Depression", "Anxiety", "Short Tempered", "Mood Swings"].map(i => (
//                       <label key={i} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.mind.features.includes(i)} onChange={() => toggleCheckbox("mind.features", i)} /> {i}</label>
//                     ))}
//                   </div>
//                   <div className="space-y-2">
//                     <p className="font-bold text-xs uppercase text-slate-400 mb-2">Sattva</p>
//                     {["Avara Sattva", "Pravar Sattva", "Madhyam Sattva"].map(i => (
//                       <label key={i} className="flex items-center gap-2 cursor-pointer font-medium"><input type="radio" className="w-4 h-4 accent-teal-600" checked={formData.mind.sattva === i} onChange={() => updateField("mind.sattva", i)} /> {i}</label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ADDICTION & DIET */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 border border-slate-200 rounded-3xl bg-white shadow-sm">
//               <div>
//                 <h3 className="font-bold text-lg underline mb-4 text-teal-800">DIET</h3>
//                 <div className="flex gap-6">
//                   {["Veg", "Non-Veg", "Egg"].map(i => (
//                     <label key={i} className="flex items-center gap-2 text-sm cursor-pointer font-semibold"><input type="checkbox" className="w-5 h-5 rounded accent-teal-600" checked={formData.diet.includes(i)} onChange={() => toggleCheckbox("diet", i)} /> {i}</label>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <h3 className="font-bold text-lg underline mb-4 text-teal-800">ADDICTION / HABITS</h3>
//                 <div className="flex flex-wrap gap-4">
//                   {["Tea", "Alcohol", "Smoking", "Coffee", "Tobacco", "Gutkha"].map(i => (
//                     <label key={i} className="flex items-center gap-2 text-sm cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:border-teal-500 transition-all"><input type="checkbox" className="w-4 h-4 rounded accent-teal-600" checked={formData.addiction.habits.includes(i)} onChange={() => toggleCheckbox("addiction.habits", i)} /> {i}</label>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* MENSTRUAL & OBS HISTORY */}
//             <div className="mb-8 p-6 border border-slate-200 rounded-3xl bg-pink-50/20">
//               <h3 className="font-bold text-xl mb-6 text-slate-800 uppercase tracking-wide border-b border-pink-100 pb-2">Menstrual History</h3>
//               <div className="flex flex-wrap gap-6 mb-6 items-center">
//                 <span className="text-sm font-bold text-slate-500 uppercase">Flow:</span>
//                 {["Scanty", "Normal", "Excessive", "Clots"].map(i => (
//                   <label key={i} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="w-5 h-5 rounded accent-pink-600" checked={formData.menstrual.flow.includes(i)} onChange={() => toggleCheckbox("menstrual.flow", i)} /> {i}</label>
//                 ))}
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-bold uppercase text-slate-400">
//                 <div className="space-y-3">
//                   <p className="border-l-2 border-pink-500 pl-2">Pain</p>
//                   {["Nil", "Mild", "Moderate", "Severe"].map(i => <label key={i} className="flex items-center gap-2 font-normal text-slate-700 normal-case cursor-pointer"><input type="radio" className="w-4 h-4 accent-pink-600" checked={formData.menstrual.pain === i} onChange={() => updateField("menstrual.pain", i)} /> {i}</label>)}
//                 </div>
//                 <div className="space-y-3">
//                   <p className="border-l-2 border-pink-500 pl-2">White Discharge</p>
//                   {["Nil", "Mild", "Moderate", "Severe"].map(i => <label key={i} className="flex items-center gap-2 font-normal text-slate-700 normal-case cursor-pointer"><input type="radio" className="w-4 h-4 accent-pink-600" checked={formData.menstrual.discharge === i} onChange={() => updateField("menstrual.discharge", i)} /> {i}</label>)}
//                 </div>
//               </div>
//               <div className="mt-8 border-t border-pink-100 pt-6">
//                 <h3 className="font-bold text-lg mb-6 text-slate-800 uppercase tracking-wide">OBS. HISTORY</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
//                   {["G", "P", "A", "L"].map(k => (
//                     <div key={k} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-pink-100">
//                       <span className="font-black text-pink-600">{k}:</span>
//                       <input className="w-full outline-none text-sm font-bold text-slate-700" value={formData.obs[k]} onChange={(e) => updateField(`obs.${k}`, e.target.value)} />
//                     </div>
//                   ))}
//                 </div>
//                 <div className="flex flex-col md:flex-row gap-6 bg-white p-4 rounded-3xl border border-pink-100">
//                   <div className="flex items-center gap-4 flex-1">
//                     <span className="text-sm font-bold text-slate-500 shrink-0">C-Section:</span>
//                     <input className="border-b border-slate-200 w-full outline-none py-1 focus:border-pink-500 text-sm" value={formData.obs.cSection} onChange={(e) => updateField("obs.cSection", e.target.value)} />
//                   </div>
//                   <div className="flex items-center gap-4 flex-1">
//                     <span className="text-sm font-bold text-slate-500 shrink-0">Normal Delivery:</span>
//                     <input className="border-b border-slate-200 w-full outline-none py-1 focus:border-pink-500 text-sm" value={formData.obs.normal} onChange={(e) => updateField("obs.normal", e.target.value)} />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* PRAKRITI TABLE & DIAGNOSIS */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-slate-900 text-white p-4 md:p-8 rounded-[40px] shadow-2xl">
//               <div>
//                 <h3 className="font-black text-xl mb-6 text-teal-400 tracking-tighter uppercase">Prakriti / Naadi</h3>
//                 <div className="overflow-hidden rounded-2xl border border-slate-700">
//                   <table className="w-full border-collapse bg-slate-800/50">
//                     <thead>
//                       <tr className="bg-slate-800">
//                         <th className="p-3 text-left text-xs uppercase text-slate-400">Vikriti</th>
//                         <th className="p-3 text-xs uppercase text-slate-400">Vata</th>
//                         <th className="p-3 text-xs uppercase text-slate-400">Pitta</th>
//                         <th className="p-3 text-xs uppercase text-slate-400">Kapha</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {["Mild", "Moderate", "Severe"].map(lvl => (
//                         <tr key={lvl} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
//                           <td className="p-3 text-sm font-black">{lvl}</td>
//                           <td className="p-3 text-center"><input type="radio" className="w-5 h-5 accent-teal-500" name="vata" checked={formData.prakriti.vata === lvl} onChange={() => updateField("prakriti.vata", lvl)} /></td>
//                           <td className="p-3 text-center"><input type="radio" className="w-5 h-5 accent-teal-500" name="pitta" checked={formData.prakriti.pitta === lvl} onChange={() => updateField("prakriti.pitta", lvl)} /></td>
//                           <td className="p-3 text-center"><input type="radio" className="w-5 h-5 accent-teal-500" name="kapha" checked={formData.prakriti.kapha === lvl} onChange={() => updateField("prakriti.kapha", lvl)} /></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="font-black text-lg mb-2 text-teal-400 uppercase tracking-widest">Diagnosis</h3>
//                   <textarea className="w-full border border-slate-700 p-4 bg-slate-800/50 rounded-3xl outline-none focus:ring-2 focus:ring-teal-500 text-sm placeholder:text-slate-600" rows={3} placeholder="Pathological inference..." value={formData.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} />
//                 </div>
//                 <div>
//                   <h3 className="font-black text-lg mb-2 text-teal-400 uppercase tracking-widest">Chikitsa Sutra</h3>
//                   <textarea className="w-full border border-slate-700 p-4 bg-slate-800/50 rounded-3xl outline-none focus:ring-2 focus:ring-teal-500 text-sm placeholder:text-slate-600" rows={2} placeholder="Treatment line..." value={formData.chikitsa} onChange={(e) => updateField("chikitsa", e.target.value)} />
//                 </div>
//               </div>
//             </div>

//             {/* Rx SECTION */}
//             <div className="mb-8 p-1">
//               <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter text-slate-800 border-l-8 border-teal-700 pl-4">Rx - Prescription</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-slate-800 rounded-[32px] overflow-hidden shadow-xl">
//                 <div className="border-b md:border-b-0 md:border-r-2 border-slate-800 p-4 bg-white">
//                   <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-3 border border-teal-100 uppercase text-xs">Churan / Powder</p>
//                   <textarea className="w-full h-48 md:h-64 outline-none text-sm leading-relaxed placeholder:text-slate-300 resize-none" placeholder="Enter dosage..." value={formData.rx.churan} onChange={(e) => updateField("rx.churan", e.target.value)} />
//                 </div>
//                 <div className="border-b md:border-b-0 md:border-r-2 border-slate-800 p-4 bg-white">
//                   <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-3 border border-teal-100 uppercase text-xs">Tablets / Vati</p>
//                   <textarea className="w-full h-48 md:h-64 outline-none text-sm leading-relaxed placeholder:text-slate-300 resize-none" placeholder="Enter dosage..." value={formData.rx.tablets} onChange={(e) => updateField("rx.tablets", e.target.value)} />
//                 </div>
//                 <div className="p-4 bg-white">
//                   <p className="text-center bg-teal-50 py-2 rounded-xl text-teal-900 font-black mb-3 border border-teal-100 uppercase text-xs">Others / Syrup / Oil</p>
//                   <textarea className="w-full h-48 md:h-64 outline-none text-sm leading-relaxed placeholder:text-slate-300 resize-none" placeholder="Special instructions..." value={formData.rx.others} onChange={(e) => updateField("rx.others", e.target.value)} />
//                 </div>
//               </div>
//             </div>

//             {/* FOLLOW UP SECTION */}
//             <div className="mt-12 border-t-4 border-slate-100 pt-12">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//                 <h2 className="text-2xl font-black text-slate-800 tracking-tighter">FOLLOW UP VISITS</h2>
//                 <button
//                   onClick={() => setFollowUps([...followUps, { date: "", notes: "", churan: "", tablets: "", others: "" }])}
//                   className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-4 rounded-[20px] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
//                 >
//                   + Add New Visit
//                 </button>
//               </div>

//               <div className="grid gap-6">
//                 {followUps.map((visit, idx) => (
//                   <div key={idx} className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 p-6 rounded-[32px] shadow-lg relative group">
//                     <button
//                       onClick={() => setFollowUps(followUps.filter((_, i) => i !== idx))}
//                       className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full shadow-lg items-center justify-center hidden group-hover:flex"
//                     >
//                       &times;
//                     </button>
//                     <div className="flex flex-col md:flex-row gap-6">
//                       <div className="w-full md:w-48 shrink-0">
//                         <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Visit Date</label>
//                         <input
//                           type="date"
//                           className="w-full p-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 bg-white font-bold"
//                           value={visit.date ? visit.date.split("T")[0] : ""}
//                           onChange={(e) => { const f = [...followUps]; f[idx].date = e.target.value; setFollowUps(f); }}
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Observation Notes</label>
//                         <textarea
//                           className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 bg-white text-sm"
//                           rows={2}
//                           placeholder="Progression notes..."
//                           value={visit.notes}
//                           onChange={(e) => { const f = [...followUps]; f[idx].notes = e.target.value; setFollowUps(f); }}
//                         />
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500">C:</span>
//                         <input className="w-full border-2 border-slate-100 pl-8 pr-3 py-3 rounded-xl text-xs outline-none bg-white font-medium" placeholder="Churan changes" value={visit.churan} onChange={(e) => { const f = [...followUps]; f[idx].churan = e.target.value; setFollowUps(f); }} />
//                       </div>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500">T:</span>
//                         <input className="w-full border-2 border-slate-100 pl-8 pr-3 py-3 rounded-xl text-xs outline-none bg-white font-medium" placeholder="Tablet changes" value={visit.tablets} onChange={(e) => { const f = [...followUps]; f[idx].tablets = e.target.value; setFollowUps(f); }} />
//                       </div>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500">O:</span>
//                         <input className="w-full border-2 border-slate-100 pl-8 pr-3 py-3 rounded-xl text-xs outline-none bg-white font-medium" placeholder="Other changes" value={visit.others} onChange={(e) => { const f = [...followUps]; f[idx].others = e.target.value; setFollowUps(f); }} />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* SUBMIT BUTTON */}
//             <div className="bottom-4 md:bottom-8 mt-12 px-2 pb-2">
//               <button
//                 onClick={savePrescription}
//                 className="w-full bg-slate-900 text-white py-6 rounded-[32px] text-xl font-black shadow-2xl hover:bg-teal-800 transition-all duration-500 active:scale-95 tracking-widest uppercase border-4 border-white/20"
//               >
//                 SAVE ENTIRE MEDICAL RECORD
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
