import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import logo from "../assets/brandicon.png";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "https://dms-backend-amber.vercel.app/api/auth/login",
        form,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("clinicId", res.data.user.clinicId);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else if (res.data.user.role === "doctor") {
        // setError("Doctor login is currently disabled. Please contact admin.");
        navigate("/doctor");
      } else {
        navigate("/reception");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2">
        {/* left branding */}

        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
          {/* logo */}

          <div className="flex items-center gap-4 mb-6">
            <img src={logo} alt="logo" className="w-20 h-20 object-contain" />

            <h1 className="text-2xl lg:text-3xl font-semibold">
              Dhruwraj <br /> Management System
            </h1>
          </div>

          <p className="text-sm opacity-90 leading-relaxed">
            Modern clinic management platform designed for multi-location
            practices.
          </p>

          <div className="mt-10 space-y-3 text-sm opacity-90">
            <p>✔ Multi clinic management</p>
            <p>✔ Patient records</p>
            <p>✔ Billing & GST</p>
            <p>✔ Staff management</p>
          </div>
        </div>

        {/* form */}

        <div className="p-6 sm:p-10">
          {/* mobile logo */}

          <div className="md:hidden flex justify-center  mb-6">
            <img src={logo} alt="logo" className="w-45" />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Welcome Back
            </h2>

            <p className="text-sm text-slate-400">Login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

<div>

<label className="text-xs text-slate-400">

 Email or Phone

</label>



<input

 type="text"

 name="email"

 placeholder="Enter email or phone number"

 onChange={handleChange}

 className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"

 required

/>

</div>



<div>

<label className="text-xs text-slate-400">

 Password

</label>



<input

 type="password"

 name="password"

 placeholder="Enter password"

 onChange={handleChange}

 className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"

 required

/>

</div>



{error && (

<p className="text-xs text-red-500">

 {error}

</p>

)}



<button

 disabled={loading}

 className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium transition shadow-sm"

>

 {loading ? "Signing in..." : "Login"}

</button>



</form>

          <p className="text-xs text-slate-400 mt-8 text-center">
            Secure clinic management system
          </p>
        </div>
      </div>
    </div>
  );
}
