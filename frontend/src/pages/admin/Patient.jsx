import { useEffect, useState } from "react";
import axios from "axios";
import { Edit2, Trash2 } from "lucide-react";

export default function Patient() {
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [preview, setPreview] = useState("");
  const [generatedId, setGeneratedId] = useState("");

  const [search, setSearch] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));

  const API_BASE = "https://dms-backend-amber.vercel.app/api";
  const config = {
    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
  };

  useEffect(() => {
    fetchPatients();
    fetchClinics();
  }, []);

  useEffect(() => {
    if (open && !editing && user.role !== "admin") {
      const userClinicId = user.clinic?._id || user.clinic;
      setForm((prev) => ({ ...prev, clinic: userClinicId }));
      generatePatientId(userClinicId);
    }
  }, [open, editing]);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE}/patients`, config);
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    }
  };

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clinics`);
      setClinics(res.data);
    } catch (err) {
      console.error("Failed to fetch clinics", err);
    }
  };

  const generatePatientId = (clinicId) => {
    if (!clinicId) return;
    const clinic = clinics.find((c) => c._id === clinicId);
    if (clinic) {
      const count = patients.filter(
        (p) => (p.clinic?._id || p.clinic) === clinicId,
      ).length;
      const newId = `${clinic.patientPrefix}${String(count + 1).padStart(3, "0")}`;
      setGeneratedId(newId);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    if (name === "clinic") {
      generatePatientId(value);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({});
    setGeneratedId("");
    setPreview("");
  };

  const savePatient = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const submissionData = { ...form, patientId: generatedId };

    Object.keys(submissionData).forEach((key) => {
      if (submissionData[key] !== null) {
        data.append(key, submissionData[key]);
      }
    });

    try {
      if (editing) {
        await axios.put(`${API_BASE}/patients/${editing}`, data, config);
      } else {
        await axios.post(`${API_BASE}/patients`, data, config);
      }
      handleClose();
      fetchPatients();
    } catch (err) {
      console.error("Save Error:", err.response?.data);
      alert(err.response?.data?.message || "Error saving patient data");
    }
  };

  const editPatient = (p) => {
    setEditing(p._id);
    setForm({ ...p, clinic: p.clinic?._id || p.clinic });
    setGeneratedId(p.patientId);
    if (p.profileImage) {
      setPreview(
        `https://dms-backend-amber.vercel.app/uploads/${p.profileImage}`,
      );
    }
    setOpen(true);
  };

  const triggerDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`${API_BASE}/patients/${deleteConfirm}`, config);
      fetchPatients();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert("Could not delete patient.");
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.clinic?.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.clinic?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  // Logic to determine if fields should be disabled
  // Logic: Disable if we are editing an existing patient AND user is not admin
  const isReadOnly = editing && user.role !== "admin";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Patients</h2>
          <p className="text-sm text-slate-400">Dhruwraj Health Care Records</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            placeholder="Search name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72
          bg-white
          border border-slate-200
          rounded-xl
          px-4 py-3
          text-sm
          shadow-sm
          focus:outline-none
          focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            onClick={() => setOpen(true)}
            className="bg-teal-600
          hover:bg-teal-700
          text-white
          font-bold
          px-6
          py-3
          rounded-xl
          shadow-md
          transition"
          >
            + Add Patient
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((p) => (
          <div
            key={p._id}
            className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                {p.patientId}
              </span>
              <span className="text-[10px] text-slate-400">
                {p.clinic?.location}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 mt-2">{p.name}</h3>
            <p className="text-sm text-slate-500">{p.phone}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editPatient(p)}
                className="flex-1 border py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {user.role === "admin" ? "Edit" : "View Details"}
              </button>

              {/* FEATURE: DELETE ONLY FOR ADMIN */}
              {user.role === "admin" && (
                <button
                  onClick={() => triggerDelete(p._id)}
                  className="flex-1 bg-red-50 text-red-600 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-[750px] max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-2">
              {isReadOnly
                ? "Patient Details (View Only)"
                : "Patient Confidential Information"}
            </h2>

            <form onSubmit={savePatient} className="grid md:grid-cols-2 gap-4">
              <div className="col-span-full bg-slate-900 text-white p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium">
                  PATIENT ID:{" "}
                  <span className="text-teal-400 ml-2">
                    {generatedId || "---"}
                  </span>
                </span>
                <span className="text-xs opacity-70">
                  DATE: {new Date().toLocaleDateString()}
                </span>
              </div>

              {/* Pass isReadOnly to inputs */}
              <Input
                name="name"
                label="Name"
                form={form}
                onChange={handleChange}
                disabled={isReadOnly}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="dob"
                  label="DOB"
                  type="date"
                  form={form}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
                <Input
                  name="age"
                  label="Age"
                  type="number"
                  form={form}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
              </div>

              <Select
                name="gender"
                label="Sex"
                options={["M", "F", "Other"]}
                form={form}
                onChange={handleChange}
                disabled={isReadOnly}
              />
              <Input
                name="phone"
                label="Telephone"
                form={form}
                onChange={handleChange}
                disabled={isReadOnly}
              />
              <Input
                name="address"
                label="Address"
                className="col-span-full"
                form={form}
                onChange={handleChange}
                disabled={isReadOnly}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="city"
                  label="City"
                  form={form}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
                <Input
                  name="state"
                  label="State"
                  form={form}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="pinCode"
                  label="Pin Code"
                  form={form}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
                <Input
                  name="email"
                  label="E-mail ID"
                  form={form}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
              </div>

              <Input
                name="occupation"
                label="Occupation"
                form={form}
                onChange={handleChange}
                disabled={isReadOnly}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="height"
                  label="Height"
                  form={form}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
                <Input
                  name="weight"
                  label="Weight"
                  form={form}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
              </div>

              <Input
                name="referredBy"
                label="Referred by/Found us"
                form={form}
                onChange={handleChange}
                disabled={isReadOnly}
              />
              <Select
                name="maritalStatus"
                label="Marital Status"
                options={["Single", "Married", "Divorced", "Others"]}
                form={form}
                onChange={handleChange}
                disabled={isReadOnly}
              />

              {user.role === "admin" && (
                <div className="col-span-full">
                  <label className="text-xs font-semibold text-slate-500">
                    Clinic Location
                  </label>
                  <select
                    name="clinic"
                    value={form.clinic || ""}
                    onChange={handleChange}
                    className="border mt-1 p-2.5 rounded-lg w-full text-sm bg-slate-50"
                    required
                    disabled={isReadOnly}
                  >
                    <option value="">Select Clinic</option>
                    {clinics.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* FEATURE: HIDE SAVE BUTTON FOR NON-ADMINS ON EXISTING RECORDS */}
              {!isReadOnly ? (
                <button className="col-span-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-teal-100 transition-all mt-4">
                  {editing ? "UPDATE RECORD" : "SAVE PATIENT RECORD"}
                </button>
              ) : (
                <div className="col-span-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-center mt-4 border border-dashed border-slate-300">
                  READ ONLY MODE
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Confirm Delete
              </h3>
              <p className="text-slate-500 mt-2 text-sm">
                Are you sure? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Updated Components to handle 'disabled' prop
function Input({
  label,
  name,
  form,
  onChange,
  type = "text",
  className = "",
  disabled = false,
}) {
  return (
    <div className={className}>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] || ""}
        onChange={onChange}
        disabled={disabled}
        className={`border mt-1 p-2.5 rounded-lg w-full text-sm outline-none transition-colors ${
          disabled
            ? "bg-slate-50 text-slate-400 cursor-not-allowed"
            : "focus:border-teal-500 bg-white"
        }`}
      />
    </div>
  );
}

function Select({ label, name, options, form, onChange, disabled = false }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <select
        name={name}
        value={form[name] || ""}
        onChange={onChange}
        disabled={disabled}
        className={`border mt-1 p-2.5 rounded-lg w-full text-sm outline-none transition-colors ${
          disabled
            ? "bg-slate-50 text-slate-400 cursor-not-allowed"
            : "focus:border-teal-500 bg-white"
        }`}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
