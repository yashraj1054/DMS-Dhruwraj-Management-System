// import {useState} from "react";

// export default function ConfirmPassword({

//  onConfirm,
//  onClose

// }){

//  const [password,setPassword] = useState("");

//  return(

//   <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

//    <div className="bg-white p-6 rounded-xl w-80 shadow-xl">

//     <h3 className="font-semibold mb-3">

//      Enter Admin Password

//     </h3>



//     <input

//     type="password"

//     placeholder="Password"

//     value={password}

//     onChange={(e)=>setPassword(e.target.value)}

//     className="border p-2 w-full rounded-lg mb-3"

//     />

//     <div className="text-sm text-red-500 mb-5">

//      This action is irreversible. Please confirm your password to proceed.

//     </div>



//     <div className="flex gap-2">

//      <button

//      onClick={()=>onConfirm(password)}

//      className="bg-teal-600 text-white hover:bg-teal-700 text-white px-4 py-2 rounded-lg w-full">

//       Confirm

//      </button>



//      <button

//      onClick={onClose}

//      className="border px-4 py-2 rounded-lg w-full">

//       Cancel

//      </button>

//     </div>

//    </div>

//   </div>

//  );
// }

import { useState } from "react";
import { ShieldCheck, Lock, AlertCircle, X } from "lucide-react";

export default function ConfirmPassword({ onConfirm, onClose }) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header/Banner */}
        <div className="bg-slate-50 p-6 flex flex-col items-center text-center relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-colors shadow-sm border border-transparent hover:border-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-rose-500" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Security Verification
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">
            Admin Authorization Required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">
              Enter Admin Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
              <input
                autoFocus
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold tracking-widest focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                required
              />
            </div>
            <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-[11px] text-rose-700 leading-relaxed font-semibold">
                WARNING: This action is irreversible. Proceeding will permanently delete the selected record from the secure database.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Confirm & Execute
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-2xl hover:text-slate-900 transition-colors text-sm"
            >
              Cancel Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}