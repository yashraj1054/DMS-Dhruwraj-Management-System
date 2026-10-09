import { useEffect, useState } from "react";
import axios from "axios";
import {
  UserRound,
  Clock3,
  Calendar,
  History,
  Search,
  X,
  RefreshCw,
  ChevronRight,
  Eye,
  Phone,
  User,
  AlertCircle,
  Activity,
  ClipboardList,
  Printer,
  Share2,
  MessageCircle,
  Download,
  CheckCircle2,
} from "lucide-react";

export default function Prescriptions() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  const [showHowToTakeModal, setShowHowToTakeModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Helper function to safely pull local ISO date string (YYYY-MM-DD)
  const getTodayDateString = () => new Date().toLocaleDateString("sv");

  const [dateFilter, setDateFilter] = useState(getTodayDateString());
  const [userClinicId, setUserClinicId] = useState("");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const API_BASE = "https://dms-backend-amber.vercel.app/api";

  // 1. Initial User Fetch
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.clinic) setUserClinicId(userData.clinic);
    else setError("Clinic association not found.");
  }, []);

  // 2. Data Fetch triggers on clinic changes or date filter changes
  useEffect(() => {
    if (userClinicId) loadDashboard();
  }, [userClinicId, dateFilter]);

  // 3. Auto-Reset Clock: Checks every 60 seconds if the calendar rolled over to a new day
  useEffect(() => {
    const checkDateRollover = setInterval(() => {
      const actualToday = getTodayDateString();
      // If the current actual date differs from the dateFilter, auto-reset it
      if (dateFilter !== actualToday) {
        setDateFilter(actualToday);
      }
    }, 60000); // 1-minute check interval

    return () => clearInterval(checkDateRollover);
  }, [dateFilter]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchPatients();
      const res = await axios.get(
        `${API_BASE}/appointments/clinics/${userClinicId}?date=${dateFilter}`,
        config,
      );
      setAppointments(res.data);
    } catch (err) {
      setError("Failed to fetch clinical records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE}/patients`, config);
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAppointment = (appt) => {
    const targetId = appt.patient?._id || appt.patient;
    const meta = patients.find((p) => p._id === targetId);
    setSelected({ ...appt, patient: { ...appt.patient, ...meta } });
    setFollowUps(appt.followUps || []);
  };

  const filteredAppointments = appointments.filter((appt) => {
    const q = searchQuery.toLowerCase();
    const p = appt.patient || {};
    return (
      p.name?.toLowerCase().includes(q) ||
      p.patientId?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  const shareDietChart = async () => {
    const patientId = selected?.patient?._id;

    // PUBLIC URL
    const publicUrl = `${window.location.origin}/diet-chart/${patientId}`;

    const whatsappText = `
🌿 आयुर्वेदिक डाइट चार्ट

Patient: ${selected?.patient?.name}

View Diet Chart:
${publicUrl}

Thankyou - ${user?.clinicName || "Ayurveda Clinic"}
`;

    window.open(
      `https://wa.me/91${selected?.patient?.phone}?text=${encodeURIComponent(whatsappText)}`,
      "_blank",
    );
  };

  const printDietChart = () => {
    window.print();
  };

  // useEffect(() => {

  //   const style = document.createElement("style");

  //   style.innerHTML = `

  //     @media print {

  //       html,
  //       body {
  //         background: white !important;
  //         margin: 0 !important;
  //         padding: 0 !important;
  //       }

  //       body * {
  //         display: none !important;
  //       }

  //       #diet-chart-print,
  //       #diet-chart-print * {
  //         display: block !important;
  //         visibility: visible !important;
  //       }

  //       #diet-chart-print {
  //         width: 100% !important;
  //         margin: 0 auto !important;
  //         padding: 0 !important;
  //         box-shadow: none !important;
  //         background: white !important;
  //       }

  //       .diet-section {
  //         break-inside: avoid;
  //         page-break-inside: avoid;
  //       }

  //       @page {
  //         size: A4 portrait;
  //         margin: 8mm;
  //       }

  //       * {
  //         -webkit-print-color-adjust: exact !important;
  //         print-color-adjust: exact !important;
  //       }

  //     }

  //   `;

  //   document.head.appendChild(style);

  //   return () => {
  //     document.head.removeChild(style);
  //   };

  // }, []);

  return (
    <div className="p-4 md:p-6  min-h-screen font-sans text-[#2d3748] antialiased">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 mb-8">
          <h1 className="text-4xl font-bold text-[#1a202c]">
            Today's Prescriptions
          </h1>
          <p className="text-slate-500 text-md italic font-medium mt-0.5 tracking-tight">
            Ayurvedic Consultation & Follow-Up Management
          </p>
          <div className="flex flex-col mt-5 md:flex-row gap-3 ">
            <div className="relative flex-grow ">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search patient, ID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#e6f4f1] transition-all shadow-sm"
              />
            </div>
            <div className="relative md:w-56">
              <Calendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-700 outline-none shadow-sm cursor-pointer"
              />
            </div>
            <button
              onClick={loadDashboard}
              className="p-3 bg-[#3da29e] text-white rounded-2xl hover:bg-[#328a85] shadow-sm active:scale-95 transition-all"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((a) => (
              <div
                key={a._id}
                onClick={() => openAppointment(a)}
                className="group cursor-pointer bg-white p-5 rounded-[24px] shadow-sm hover:shadow-md border border-transparent hover:border-teal-100 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#e6f4f1] flex items-center justify-center text-[#3da29e]">
                    <UserRound size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1a202c] leading-tight">
                      {a.patient?.name || "Patient"}
                    </h2>
                    <p className="text-slate-400 font-semibold text-xs mt-0.5">
                      Patient ID: {a.patient?.patientId || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-[#f1f5f9]/60 px-4 py-2 rounded-xl flex items-center gap-2 text-[#4a5568] font-bold text-xs">
                    <Calendar size={14} className="text-slate-400" />{" "}
                    {dateFilter} | <Clock3 size={14} /> {a.time}
                  </div>
                  <span
                    className={`px-5 py-2 rounded-full font-bold text-[11px] uppercase tracking-wider ${
                      a.status === "completed"
                        ? "bg-[#e7f9ee] text-[#28a745]"
                        : "bg-[#fff9db] text-[#f59f00]"
                    }`}
                  >
                    {a.status}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-teal-500 transition-all"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-[24px] border border-dashed border-slate-200 text-slate-400 text-sm italic font-medium">
              {loading
                ? "Re-indexing records..."
                : "No operational match discovered."}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          {/* MAIN MODAL */}
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-2xl font-bold">Patient Details</h2>

                <p className="text-sm text-gray-500">Appointment Overview</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6">
              {/* BASIC DETAILS */}
              <div className="bg-slate-50 rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-4">Basic Details</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Patient Name</p>
                    <p className="font-semibold">{selected.patient?.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Patient ID</p>
                    <p className="font-semibold">
                      {selected.patient?.patientId}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-semibold">
                      +91 {selected.patient?.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Age</p>
                    <p className="font-semibold">
                      {selected.patient?.age || "--"} Years
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION CARDS */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* PRESCRIPTION */}
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="bg-[#e6f4f1] hover:bg-[#d7eeea] rounded-2xl p-5 text-left transition-all"
                >
                  <ClipboardList className="mb-3 text-[#3da29e]" />

                  <h3 className="font-bold text-lg">Prescriptions</h3>

                  <p className="text-sm text-gray-600 mt-1">
                    View medicine details
                  </p>
                </button>

                {/* DIET CHART */}
                <button
                  onClick={() => setShowDietModal(true)}
                  className="bg-orange-50 hover:bg-orange-100 rounded-2xl p-5 text-left transition-all"
                >
                  <Activity className="mb-3 text-orange-500" />

                  <h3 className="font-bold text-lg">Diet Chart</h3>

                  <p className="text-sm text-gray-600 mt-1">
                    View diet instructions
                  </p>
                </button>

                {/* HOW TO TAKE */}
                <button
                  onClick={() => setShowHowToTakeModal(true)}
                  className="bg-blue-50 hover:bg-blue-100 rounded-2xl p-5 text-left transition-all"
                >
                  <AlertCircle className="mb-3 text-blue-500" />

                  <h3 className="font-bold text-lg">How To Take</h3>

                  <p className="text-sm text-gray-600 mt-1">
                    Medicine usage instructions
                  </p>
                </button>
              </div>
            </div>
          </div>

          {showPrescriptionModal && (
            <div className="fixed inset-0 bg-black/60 z-[90] overflow-y-auto p-6">
              {/* MAIN PAPER */}
              <div
                className="
        bg-[#fffef9]
        mx-auto
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        border-[1px]
        border-[#d8d8d8]
        relative
        overflow-hidden
      "
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                }}
              >
                {/* WATERMARK */}
                <div
                  className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        pointer-events-none
        opacity-[0.03]
        z-0
      "
                >
                  <img
                    src="/brandicon.png"
                    alt=""
                    className="w-[450px] h-[450px] object-contain"
                  />
                </div>

                {/* TOP STRIP */}
                <div className="h-3 bg-[#1d5c42]" />

                {/* CLOSE */}
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="
          absolute
          top-5
          right-5
          z-50
          h-11
          w-11
          rounded-full
          bg-white
          shadow-md
          border
          flex
          items-center
          justify-center
          hover:bg-red-50
          transition
          print:hidden
        "
                >
                  <X size={20} />
                </button>

                {/* PRINT */}
                <button
                  onClick={() => window.print()}
                  className="
          absolute
          top-5
          right-20
          z-50
          px-5
          h-11
          rounded-full
          bg-[#1d5c42]
          text-white
          font-bold
          shadow-lg
          hover:opacity-90
          transition
          print:hidden
        "
                >
                  Print
                </button>

                {/* CONTENT */}
                <div className="relative z-10 px-8 pt-6 pb-10">
                  {/* ================= HEADER ================= */}

                  <div className="flex justify-between items-start">
                    {/* LEFT */}
                    <div className="flex gap-5">
                      {/* LOGO */}
                      <div
                        className="
              h-24
              w-24
              rounded-full
              overflow-hidden
              border-[3px]
              border-[#1d5c42]
              bg-white
              flex
              items-center
              justify-center
              shadow-md
            "
                      >
                        <img
                          src="/brandicon.png"
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* TITLE */}
                      <div>
                        <h1
                          className="
                text-[42px]
                font-black
                uppercase
                tracking-wide
                text-[#1d5c42]
                leading-none
              "
                        >
                          Dhruwraj Ayurveda
                        </h1>

                        <h2
                          className="
                text-[28px]
                font-bold
                uppercase
                tracking-wide
                text-slate-700
                mt-1
              "
                        >
                          & Panchkarma Clinic
                        </h2>

                        <div
                          className="
                mt-3
                text-sm
                text-slate-600
                leading-6
              "
                        >
                          Ayurveda | Panchkarma | Lifestyle Correction
                          <br />
                          Holistic Healing & Natural Treatment
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right">
                      <h2
                        className="
              text-3xl
              font-black
              text-[#1d5c42]
            "
                      >
                        Dr. AMREKHA PAL
                      </h2>

                      <p className="text-sm mt-1 text-slate-600">
                        B.H.M.S. (Agra)
                      </p>

                      <p className="text-sm text-slate-600">
                        Ayurveda & Panchkarma Specialist
                      </p>

                      <div
                        className="
              mt-4
              bg-[#eef7f2]
              border
              border-[#cfe4d8]
              px-4
              py-2
              rounded-xl
              text-xs
              text-slate-700
            "
                      >
                        OPD Timing: 10 AM - 8 PM
                      </div>
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div
                    className="
          mt-6
          border-t-[3px]
          border-[#1d5c42]
        "
                  />

                  {/* ================= PATIENT INFO ================= */}

                  <div
                    className="
          mt-6
          grid
          grid-cols-4
          gap-4
        "
                  >
                    {[
                      {
                        label: "Patient Name",
                        value: selected?.patient?.name || "--",
                      },
                      {
                        label: "Phone",
                        value: selected?.patient?.phone || "--",
                      },
                      {
                        label: "Patient ID",
                        value: selected?.patient?.patientId || "--",
                      },
                      {
                        label: "Age",
                        value: `${selected?.patient?.age || "--"} Years`,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="
                bg-[#f9fbfa]
                border
                border-[#dbe8e0]
                rounded-2xl
                px-4
                py-3
              "
                      >
                        <p
                          className="
                text-xs
                uppercase
                tracking-wide
                text-slate-500
                font-semibold
              "
                        >
                          {item.label}
                        </p>

                        <p
                          className="
                mt-1
                text-lg
                font-black
                text-slate-800
              "
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ================= COMPLAINTS ================= */}

                  <div className="mt-8">
                    <div
                      className="
            bg-[#f8f8f8]
            border
            border-[#d7d7d7]
            rounded-2xl
            p-5
          "
                    >
                      <h2
                        className="
              text-lg
              font-black
              text-[#1d5c42]
              mb-3
            "
                      >
                        Chief Complaints
                      </h2>

                      <p
                        className="
              text-[15px]
              leading-8
              text-slate-700
            "
                      >
                        {selected?.patient?.complaints ||
                          "Gas, Acidity, Weak Digestion, Constipation"}
                      </p>
                    </div>
                  </div>

                  {/* ================= RX ================= */}

                  <div className="mt-10">
                    <div
                      className="
            text-7xl
            font-black
            text-[#1d5c42]
            leading-none
            mb-4
          "
                    >
                      ℞
                    </div>

                    {/* CHURAN */}
                    {selected.formData?.rx?.churan && (
                      <div className="mb-10">
                        <div
                          className="
                flex
                items-center
                gap-3
                mb-5
              "
                        >
                          <div
                            className="
                  h-10
                  w-10
                  rounded-full
                  bg-[#1d5c42]
                  text-white
                  flex
                  items-center
                  justify-center
                  font-black
                "
                          >
                            C
                          </div>

                          <h2
                            className="
                  text-3xl
                  font-black
                  text-[#1d5c42]
                "
                          >
                            चूर्ण
                          </h2>
                        </div>

                        <div
                          className="
                bg-[#fcfcfc]
                border-l-[5px]
                border-[#1d5c42]
                rounded-r-2xl
                p-5
                whitespace-pre-wrap
                text-[18px]
                leading-10
                shadow-sm
              "
                        >
                          {selected.formData?.rx?.churan}
                        </div>
                      </div>
                    )}

                    {/* TABLETS */}
                    {selected.formData?.rx?.tablets && (
                      <div className="mb-10">
                        <div
                          className="
                flex
                items-center
                gap-3
                mb-5
              "
                        >
                          <div
                            className="
                  h-10
                  w-10
                  rounded-full
                  bg-[#1d5c42]
                  text-white
                  flex
                  items-center
                  justify-center
                  font-black
                "
                          >
                            T
                          </div>

                          <h2
                            className="
                  text-3xl
                  font-black
                  text-[#1d5c42]
                "
                          >
                            टैबलेट
                          </h2>
                        </div>

                        <div
                          className="
                bg-[#fcfcfc]
                border-l-[5px]
                border-[#1d5c42]
                rounded-r-2xl
                p-5
                whitespace-pre-wrap
                text-[18px]
                leading-10
                shadow-sm
              "
                        >
                          {selected.formData?.rx?.tablets}
                        </div>
                      </div>
                    )}

                    {/* OTHERS */}
                    {selected.formData?.rx?.others && (
                      <div className="mb-10">
                        <div
                          className="
                flex
                items-center
                gap-3
                mb-5
              "
                        >
                          <div
                            className="
                  h-10
                  w-10
                  rounded-full
                  bg-[#1d5c42]
                  text-white
                  flex
                  items-center
                  justify-center
                  font-black
                "
                          >
                            O
                          </div>

                          <h2
                            className="
                  text-3xl
                  font-black
                  text-[#1d5c42]
                "
                          >
                            Other Medicines
                          </h2>
                        </div>

                        <div
                          className="
                bg-[#fcfcfc]
                border-l-[5px]
                border-[#1d5c42]
                rounded-r-2xl
                p-5
                whitespace-pre-wrap
                text-[18px]
                leading-10
                shadow-sm
              "
                        >
                          {selected.formData?.rx?.others}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ================= ADVICE ================= */}

                  <div className="mt-12">
                    <div
                      className="
            bg-[#eef7f2]
            border
            border-[#cfe4d8]
            rounded-3xl
            p-6
          "
                    >
                      <h2
                        className="
              text-2xl
              font-black
              text-[#1d5c42]
              mb-4
            "
                      >
                        Advice & Precautions
                      </h2>

                      <div
                        className="
              grid
              grid-cols-2
              gap-4
              text-[15px]
              text-slate-700
            "
                      >
                        <div className="flex gap-3">
                          <span>✓</span>
                          <p>Take medicines on proper time.</p>
                        </div>

                        <div className="flex gap-3">
                          <span>✓</span>
                          <p>Avoid oily and spicy foods.</p>
                        </div>

                        <div className="flex gap-3">
                          <span>✓</span>
                          <p>Drink enough water daily.</p>
                        </div>

                        <div className="flex gap-3">
                          <span>✓</span>
                          <p>Sleep on time and avoid stress.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================= SIGNATURE ================= */}

                  <div
                    className="
          mt-20
          flex
          justify-end
        "
                  >
                    <div className="text-center">
                      <div
                        className="
              h-[80px]
              w-[220px]
              border-b-2
              border-[#1d5c42]
            "
                      />

                      <p
                        className="
              mt-2
              font-bold
              text-slate-700
            "
                      >
                        Authorized Signature
                      </p>
                    </div>
                  </div>

                  {/* ================= FOOTER ================= */}

                  <div
                    className="
            mt-16
            border-t-[3px]
            border-[#1d5c42]
            pt-6
            pb-2
          "
                  >
                    <div
                      className="
            flex
            justify-between
            items-center
          "
                    >
                      {/* LEFT */}
                      <div>
                        <h2
                          className="
                text-[#1d5c42]
                font-black
                text-xl
                tracking-wide
              "
                        >
                          Dhruwraj Ayurveda & Panchkarma Clinic
                        </h2>

                        <p
                          className="
                text-sm
                mt-2
                text-slate-700
                leading-7
              "
                        >
                          20 A, Zoo Road, Vikas Nagar, Kanpur (U.P.)
                          <br />
                          Contact: +91 8299532791
                        </p>
                      </div>

                      {/* RIGHT */}
                      <div className="text-right">
                        <div
                          className="
                bg-[#1d5c42]
                text-white
                px-5
                py-3
                rounded-2xl
                shadow-md
              "
                        >
                          Follow Up After 15 Days
                        </div>
                      </div>
                    </div>

                    {/* NOTE */}
                    <div
                      className="
            mt-6
            pt-4
            border-t
            border-dashed
            border-slate-300
            flex
            justify-between
            items-center
            text-xs
            text-slate-600
          "
                    >
                      <p>
                        Kindly bring this prescription during follow up visit.
                      </p>

                      {/* MUST LINE */}
                      <p
                        className="
              font-black
              uppercase
              tracking-wider
              text-[#1d5c42]
            "
                      >
                        Not For Legal Medicose Purpose
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DIET MODAL */}

          {showDietModal && (
            <div className="fixed inset-0 bg-[#eef2f7] z-[100] overflow-y-auto p-6">
              {/* ACTION BAR */}
              <div
                className="
      max-w-[210mm]
      mx-auto
      mb-4
      flex
      justify-end
      gap-3
      print:hidden
    "
              >
                {/* WHATSAPP */}
                <button
                  onClick={() => {
                    const publicUrl = `${window.location.origin}/diet-chart/${selected?.patient?._id}`;

                    const whatsappText = `
🌿 आयुर्वेदिक डाइट चार्ट

Patient: ${selected?.patient?.name}

View Diet Chart:
${publicUrl}

Thankyou - ${user?.clinicName || "Ayurveda Clinic"};`;

                    window.open(
                      `https://wa.me/91${selected?.patient?.phone}?text=${encodeURIComponent(whatsappText)}`,
                      "_blank",
                    );
                  }}
                  className="
          h-12
          px-5
          rounded-xl
          bg-green-500
          text-white
          font-bold
          flex
          items-center
          gap-2
          shadow-md
        "
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </button>

                {/* PRINT */}
                <button
                  onClick={() => {
                    const printElement =
                      document.getElementById("diet-chart-print");

                    if (!printElement) return;

                    const printContents = printElement.innerHTML;

                    const printWindow = window.open(
                      "",
                      "",
                      "width=1200,height=900",
                    );

                    // POPUP BLOCKED
                    if (!printWindow) {
                      alert("Popup blocked. Please allow popups.");
                      return;
                    }

                    printWindow.document.write(`
      <html>
        <head>
          <title>Diet Chart</title>

          <script src="https://cdn.tailwindcss.com"></script>

          <style>
            body {
              font-family: sans-serif;
              background: white;
              padding: 20px;
            }

            .diet-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>

        <body>
          <div style="width:210mm;margin:auto;">
            ${printContents}
          </div>
        </body>
      </html>
    `);

                    printWindow.document.close();

                    setTimeout(() => {
                      printWindow.focus();
                      printWindow.print();
                      printWindow.close();
                    }, 500);
                  }}
                  className="
          h-12
          px-5
          rounded-xl
          bg-black
          text-white
          font-bold
          flex
          items-center
          gap-2
          shadow-md
        "
                >
                  <Printer size={18} />
                  Print
                </button>

                {/* CLOSE */}
                <button
                  onClick={() => setShowDietModal(false)}
                  className="
          h-12
          w-12
          rounded-xl
          bg-white
          border
          flex
          items-center
          justify-center
        "
                >
                  <X size={18} />
                </button>
              </div>

              {/* A4 SHEET */}
              <div
                id="diet-chart-print"
                className="
        bg-white
        mx-auto
        shadow-2xl
        print:shadow-none
      "
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "10mm",
                }}
              >
                {/* TOP HEADER */}
                <div
                  className="
        flex
        justify-between
        items-start
        border-b-4
        border-[#d4a017]
        pb-4
        mb-5
      "
                >
                  {/* LEFT */}
                  <div className="flex gap-4">
                    <div
                      className="
            h-20
            w-20
            rounded-full
            overflow-hidden
            border
            bg-white
            flex
            items-center
            justify-center
          "
                    >
                      <img
                        src="/brandicon.png"
                        alt=""
                        className="w-35 h-35 object-contain"
                      />
                    </div>

                    <div>
                      <h1
                        className="
              text-4xl
              font-black
              tracking-tight
              leading-none
            "
                      >
                        आयुर्वेदिक डाइट चार्ट
                      </h1>

                      <p
                        className="
              text-gray-500
              mt-2
              text-sm
            "
                      >
                        Personalized Ayurvedic Diet Recommendation
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right text-sm">
                    <p className="font-bold text-lg">{user?.clinicName}</p>
                  </div>
                </div>

                {/* PATIENT INFO */}
                <div
                  className="
        grid
        grid-cols-4
        gap-4
        bg-[#f8fafc]
        border
        rounded-2xl
        p-4
        mb-5
        text-sm
      "
                >
                  <div>
                    <p className="text-gray-400">Patient</p>

                    <p className="font-bold">{selected?.patient?.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Phone</p>

                    <p className="font-bold">+91 {selected?.patient?.phone}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Patient ID</p>

                    <p className="font-bold">{selected?.patient?.patientId}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Age</p>

                    <p className="font-bold">
                      {selected?.patient?.age || "--"} Years
                    </p>
                  </div>
                </div>

                {/* FOOD TABLE */}
                <div
                  className="
        grid
        grid-cols-3
        gap-3
      "
                >
                  {[
                    {
                      title: "अनाज",
                      key: "grains",
                      items: [
                        "गेहूं",
                        "ज्वार",
                        "बाजरा",
                        "मक्का",
                        "चावल",
                        "दलिया",
                      ],
                    },
                    {
                      title: "आटा",
                      key: "flour",
                      items: ["मैदा", "बेसन"],
                    },
                    {
                      title: "मेवे",
                      key: "dryFruits",
                      items: [
                        "मूंगफली",
                        "बादाम",
                        "भीगे बादाम",
                        "काजू",
                        "किशमिश",
                        "पिस्ता",
                        "मुनक्का",
                        "अंजीर",
                        "अखरोट",
                      ],
                    },
                    {
                      title: "दाल",
                      key: "pulses",
                      items: [
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
                      ],
                    },
                    {
                      title: "सब्जियां",
                      key: "vegetables",
                      items: [
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
                      ],
                    },
                    {
                      title: "फल",
                      key: "fruits",
                      items: [
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
                      ],
                    },
                    {
                      title: "पेय पदार्थ",
                      key: "drinks",
                      items: [
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
                      ],
                    },
                    {
                      title: "दुग्ध उत्पाद",
                      key: "dairy",
                      items: [
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
                      ],
                    },
                    {
                      title: "मसाले",
                      key: "spices",
                      items: [
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
                      ],
                    },
                  ].map((section) => (
                    <div
                      key={section.key}
                      className="
            diet-section
              border
              rounded-xl
              overflow-hidden
            "
                    >
                      {/* TITLE */}
                      <div
                        className="
              bg-black
              text-white
              px-3
              py-2
              text-center
              font-bold
              text-sm
            "
                      >
                        {section.title}
                      </div>

                      {/* ITEMS */}
                      <div
                        className="
              p-3
              space-y-1.5
              text-[13px]
            "
                      >
                        {section.items.map((item) => {
                          const checked =
                            selected.formData?.dietChart?.[
                              section.key
                            ]?.includes(item);

                          return (
                            <div
                              key={item}
                              className="
                      flex
                      items-start
                      gap-2
                    "
                            >
                              {checked ? (
                                <>
                                  <input
                                    type="checkbox"
                                    checked
                                    readOnly
                                    className="
                            mt-[2px]
                            h-3.5
                            w-3.5
                            accent-green-600
                          "
                                  />

                                  <span className="font-medium">{item}</span>
                                </>
                              ) : (
                                <>
                                  <div
                                    className="
                          mt-[2px]
                          h-3.5
                          w-3.5
                          border
                          border-red-400
                          flex
                          items-center
                          justify-center
                          text-[8px]
                          text-red-400
                        "
                                  >
                                    ✕
                                  </div>

                                  <span
                                    className="
                          line-through
                          text-red-400
                        "
                                  >
                                    {item}
                                  </span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div
                  className="
        mt-6
        border-t
        pt-4
        text-center
      "
                >
                  <p
                    className="
          text-xl
          font-black
        "
                  >
                    “उचित आहार ही स्वास्थ्य का पहला साधन है”
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* HOW TO TAKE MODAL */}

          {showHowToTakeModal && (
            <div className="fixed inset-0 bg-[#eef2f7] z-[100] overflow-y-auto p-6">
              {/* ACTION BAR */}
              <div
                className="
        max-w-[210mm]
        mx-auto
        mb-4
        flex
        justify-end
        gap-3
        print:hidden
      "
              >
                {/* WHATSAPP */}
                <button
                  onClick={() => {
                    const publicUrl = `${window.location.origin}/how-to-take/${selected?.patient?._id}`;

                    const whatsappText = `
💊 औषधि लेने की विधि

Patient: ${selected?.patient?.name}

View Instructions:
${publicUrl}

Thankyou - ${user?.clinicName || "Ayurveda Clinic"}
`;

                    window.open(
                      `https://wa.me/91${selected?.patient?.phone}?text=${encodeURIComponent(whatsappText)}`,
                      "_blank",
                    );
                  }}
                  className="
          h-12
          px-5
          rounded-xl
          bg-green-500
          text-white
          font-bold
          flex
          items-center
          gap-2
          shadow-md
        "
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </button>

                {/* PRINT */}
                <button
                  onClick={() => {
                    const printElement =
                      document.getElementById("how-to-take-print");

                    if (!printElement) return;

                    const printContents = printElement.innerHTML;

                    const printWindow = window.open(
                      "",
                      "",
                      "width=1200,height=900",
                    );

                    if (!printWindow) {
                      alert("Popup blocked");
                      return;
                    }

                    printWindow.document.write(`
            <html>
              <head>
                <title>How To Take</title>

                <script src="https://cdn.tailwindcss.com"></script>

                <style>
                  body {
                    font-family: sans-serif;
                    background: white;
                    padding: 20px;
                  }

                  @page {
                    size: A4 portrait;
                    margin: 10mm;
                  }

                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                </style>
              </head>

              <body>
                <div style="width:210mm;margin:auto;">
                  ${printContents}
                </div>
              </body>
            </html>
          `);

                    printWindow.document.close();

                    setTimeout(() => {
                      printWindow.focus();
                      printWindow.print();
                      printWindow.close();
                    }, 500);
                  }}
                  className="
          h-12
          px-5
          rounded-xl
          bg-black
          text-white
          font-bold
          flex
          items-center
          gap-2
          shadow-md
        "
                >
                  <Printer size={18} />
                  Print
                </button>

                {/* CLOSE */}
                <button
                  onClick={() => setShowHowToTakeModal(false)}
                  className="
          h-12
          w-12
          rounded-xl
          bg-white
          border
          flex
          items-center
          justify-center
        "
                >
                  <X size={18} />
                </button>
              </div>

              {/* MAIN SHEET */}
              <div
                id="how-to-take-print"
                className="
        bg-white
        mx-auto
        shadow-2xl
      "
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "10mm",
                }}
              >
                {/* HEADER */}
                <div
                  className="
        flex
        justify-between
        items-start
        border-b-4
        border-black
        pb-4
        mb-5
      "
                >
                  {/* LEFT */}
                  <div className="flex gap-4">
                    <div
                      className="
            h-20
            w-20
            rounded-full
            overflow-hidden
            border
            bg-white
            flex
            items-center
            justify-center
          "
                    >
                      <img
                        src="/brandicon.png"
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div>
                      <h1
                        className="
              text-4xl
              font-black
              tracking-tight
              leading-none
            "
                      >
                        औषध पैक लेने की विधि
                      </h1>

                      <p
                        className="
              text-gray-500
              mt-2
              text-sm
            "
                      >
                        Ayurvedic Medicine Instructions
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right text-sm">
                    <p className="font-bold text-lg">{user?.clinicName}</p>
                  </div>
                </div>

                {/* PATIENT INFO */}
                <div
                  className="
        grid
        grid-cols-4
        gap-4
        bg-[#f8fafc]
        border
        rounded-2xl
        p-4
        mb-5
        text-sm
      "
                >
                  <div>
                    <p className="text-gray-400">Patient</p>

                    <p className="font-bold">{selected?.patient?.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Phone</p>

                    <p className="font-bold">+91 {selected?.patient?.phone}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Patient ID</p>

                    <p className="font-bold">{selected?.patient?.patientId}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Age</p>

                    <p className="font-bold">
                      {selected?.patient?.age || "--"} Years
                    </p>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div
                  className="
        bg-[#ececec]
        border
        p-4
        text-[15px]
        font-semibold
        leading-8
        mb-8
      "
                >
                  ये औषधियां/दवाइयां विशेष रूप से आपकी बताई हुई समस्याओं एवं
                  लक्षणों के आधार पर दी गई हैं। इनमें पूर्णतः आयुर्वेदिक औषधि
                  द्रव्यों का प्रयोग किया गया है। इनको लेने की विधि नीचे बताई गई
                  है।
                </div>

                {/* CHURAN SECTION */}
                <div className="border-[2px] border-black">
                  <div className="grid grid-cols-12">
                    {/* LEFT */}
                    <div
                      className="
            col-span-2
            border-r-[2px]
            border-black
            bg-[#f5f5f5]
            p-3
            flex
            flex-col
            items-center
          "
                    >
                      <h2 className="text-4xl font-black mb-5">औषधि</h2>

                      <img
                        src="/images/churan.png"
                        alt=""
                        className="w-full object-contain"
                      />
                    </div>

                    {/* TABLE */}
                    <div className="col-span-8 p-2">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#ececec]">
                            {[
                              "(क्र.सं.)",
                              "दवा का नाम",
                              "कब - कब लेना है",
                              "कितनी मात्रा में",
                              "किसके साथ",
                              "कब तक",
                            ].map((h) => (
                              <th
                                key={h}
                                className="
                        border
                        border-black
                        p-2
                        text-xs
                        font-black
                      "
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {/* {(selected?.formData?.howToTake?.churan || []).map((item, idx) => (

                  <tr key={idx}>

                    <td className="border border-black p-2 text-center font-bold">
                      {idx + 1}
                    </td>

                    <td className="border border-black p-2">
                      {item.name}
                    </td>

                    <td className="border border-black p-2">
                      {item.time}
                    </td>

                    <td className="border border-black p-2">
                      {item.quantity}
                    </td>

                    <td className="border border-black p-2">
                      {item.with}
                    </td>

                    <td className="border border-black p-2">
                      {item.duration}
                    </td>

                  </tr>

                ))} */}
                          {Array.isArray(
                            selected?.formData?.howToTake?.churan,
                          ) ? (
                            selected.formData.howToTake.churan.map(
                              (item, idx) => (
                                <tr key={idx}>
                                  <td className="border border-black p-2 text-center font-bold">
                                    {idx + 1}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.name}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.time}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.quantity}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.with}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.duration}
                                  </td>
                                </tr>
                              ),
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="text-center p-4 text-gray-400 italic"
                              >
                                No churan instructions available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* RIGHT */}
                    <div
                      className="
            col-span-2
            border-l-[2px]
            border-black
            p-3
            flex
            items-center
            justify-center
          "
                    >
                      <img
                        src="/images/spoon-guide.png"
                        alt=""
                        className="w-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* TABLETS */}
                <div
                  className="
        border-x-[2px]
        border-b-[2px]
        border-black
      "
                >
                  <div className="grid grid-cols-12">
                    {/* LEFT */}
                    <div
                      className="
            col-span-2
            border-r-[2px]
            border-black
            bg-[#f5f5f5]
            p-3
            flex
            flex-col
            items-center
          "
                    >
                      <h2 className="text-4xl font-black mb-5">टैबलेट</h2>

                      <img
                        src="/images/tablet.png"
                        alt=""
                        className="w-full object-contain"
                      />
                    </div>

                    {/* TABLE */}
                    <div className="col-span-10 p-2">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#ececec]">
                            {[
                              "(क्र.सं.)",
                              "दवा का नाम",
                              "कब - कब लेना है",
                              "कितनी मात्रा में",
                              "किसके साथ",
                              "कब तक",
                            ].map((h) => (
                              <th
                                key={h}
                                className="
                        border
                        border-black
                        p-2
                        text-xs
                        font-black
                      "
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {/* {(selected?.formData?.howToTake?.tablets || []).map((item, idx) => (

                  <tr key={idx}>

                    <td className="border border-black p-2 text-center font-bold">
                      {idx + 1}
                    </td>

                    <td className="border border-black p-2">
                      {item.name}
                    </td>

                    <td className="border border-black p-2">
                      {item.time}
                    </td>

                    <td className="border border-black p-2">
                      {item.quantity}
                    </td>

                    <td className="border border-black p-2">
                      {item.with}
                    </td>

                    <td className="border border-black p-2">
                      {item.duration}
                    </td>

                  </tr>

                ))} */}
                          {Array.isArray(
                            selected?.formData?.howToTake?.tablets,
                          ) ? (
                            selected.formData.howToTake.tablets.map(
                              (item, idx) => (
                                <tr key={idx}>
                                  <td className="border border-black p-2 text-center font-bold">
                                    {idx + 1}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.name}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.time}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.quantity}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.with}
                                  </td>
                                  <td className="border border-black p-2">
                                    {item.duration}
                                  </td>
                                </tr>
                              ),
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="text-center p-4 text-gray-400 italic"
                              >
                                No tablet instructions available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
