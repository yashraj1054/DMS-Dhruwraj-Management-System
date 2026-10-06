import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Building2, Activity, ArrowUpRight, MapPin, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:5001/api";
  const auth = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/clinics`, auth);
        setClinics(res.data);
        if (res.data.length > 0) {
          const firstCity = res.data[0].city || "Default City";
          setSelectedCity(firstCity);
          const firstClinic = res.data.find((c) => (c.city || "Default City") === firstCity);
          setSelectedClinic(firstClinic?._id);
        }
      } catch (err) { console.error("Clinic load failed", err); }
    };
    loadClinics();
  }, []);

  const fetchStats = useCallback(async () => {
    if (!selectedClinic) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/stats`, {
        ...auth,
        params: { selectedClinicId: selectedClinic }
      });
      setData(res.data);
    } catch (err) { console.error("Stats load err", err); }
    finally { setLoading(false); }
  }, [selectedClinic]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cities = [...new Set(clinics.map((c) => c.city || "Default City"))];
  const clinicsInCity = clinics.filter((c) => (c.city || "Default City") === selectedCity);

  if (!data && loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">DHCM SYSTEM INITIALIZING...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen space-y-6 md:space-y-8 pb-20 md:pb-8">
      
      {/* 📊 TOP ROW: GLOBAL SYSTEM SUMMARY */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Global System Summary</h2>
        {/* Grid: 2 columns on mobile, 3 on tablet, 5 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <SummaryCard title="Total Sales" value={data?.systemSummary?.totalSales || 0} color="teal" icon={<TrendingUp size={16}/>} />
          <SummaryCard title="Net Profit" value={data?.systemSummary?.netProfit || 0} color="emerald" icon={<ArrowUpRight size={16}/>} />
          <SummaryCard title="Clinics" value={data?.systemSummary?.totalClinics || 0} color="blue" icon={<Building2 size={16}/>} isCurrency={false} />
          <SummaryCard title="Staff" value={data?.systemSummary?.totalStaff || 0} color="indigo" icon={<Users size={16}/>} isCurrency={false} />
          {/* On mobile, last card spans 2 columns to keep the grid even */}
          <div className="col-span-2 lg:col-span-1">
            <SummaryCard title="Patients" value={data?.systemSummary?.totalPatients || 0} color="orange" icon={<Activity size={16}/>} isCurrency={false} />
          </div>
        </div>
      </div>

      {/* 🏙️ SECTION 2: BRANCH OVERVIEW */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header with Responsive Selectors */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
          <div>
              <h3 className="font-black text-slate-800 text-[10px] md:text-xs uppercase tracking-widest">Branch Wise Overview</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 italic">Scaling: City - Branch Selection</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between min-w-[120px]">
              <span className="text-[9px] font-black text-slate-400 mr-2 uppercase">City</span>
              <select 
                value={selectedCity} 
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  const firstInCity = clinics.find(c => (c.city || "Default City") === e.target.value);
                  setSelectedClinic(firstInCity?._id);
                }}
                className="text-xs font-bold text-slate-700 outline-none border-none bg-transparent cursor-pointer flex-1"
              >
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between min-w-[140px]">
              <span className="text-[9px] font-black text-slate-400 mr-2 uppercase">Branch</span>
              <select 
                value={selectedClinic || ""} 
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="text-xs font-bold text-slate-700 outline-none border-none bg-transparent cursor-pointer flex-1"
              >
                {clinicsInCity.map(c => <option key={c._id} value={c._id}>{c.location}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* BRANCH OVERVIEW GRID (Optimized for Mobile) */}
        <div className="p-5 md:p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-10">
          <DetailItem label="Branch Staff" value={data?.clinicDetail?.staffCount || 0} />
          <DetailItem label="Branch Patients" value={data?.clinicDetail?.patientCount || 0} />
          <DetailItem label="Branch Sales" value={data?.clinicDetail?.sales || 0} isCurrency />
          <DetailItem label="Branch Expense" value={data?.clinicDetail?.expense || 0} isExpense isCurrency />
          <div className="sm:col-span-2 md:col-span-1 border-t sm:border-t-0 pt-4 sm:pt-0">
            <DetailItem 
                label="Branch Profit" 
                value={data?.clinicDetail?.netProfit || 0} 
                isCurrency 
                colorClass={data?.clinicDetail?.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function SummaryCard({ title, value, color, icon, isCurrency = true }) {
  const themes = { 
    teal: "bg-teal-50 text-teal-600", 
    emerald: "bg-emerald-50 text-emerald-600", 
    blue: "bg-blue-50 text-blue-600", 
    indigo: "bg-indigo-50 text-indigo-600", 
    orange: "bg-orange-50 text-orange-600" 
  };
  
  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md h-full">
      <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center mb-3 md:mb-4 ${themes[color]}`}>
        {icon}
      </div>
      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h2 className="text-sm md:text-xl font-black text-slate-800 mt-1 break-all">
        {isCurrency ? `₹${(value || 0).toLocaleString()}` : (value || 0)}
      </h2>
    </div>
  );
}

function DetailItem({ label, value, isExpense, isCurrency, colorClass }) {
  const textColor = colorClass || (isExpense ? 'text-rose-500' : 'text-slate-800');
  return (
    <div className="text-center sm:text-left">
      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl md:text-2xl font-black ${textColor}`}>
        {isCurrency ? `₹${(value || 0).toLocaleString()}` : (value || 0)}
      </p>
    </div>
  );
}