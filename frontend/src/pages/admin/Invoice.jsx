import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";

const Invoice = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState("Loading...");
  const [cart, setCart] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");


  

  //Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // pagination logic
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredBills.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredBills.length / recordsPerPage);

  // reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // New State for Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    mobileNo: "",
    paymentMethod: "Cash Payment",
    consultationFee: "",
  });

  const [activeMedicine, setActiveMedicine] = useState({
    name: "",
    price: "",
    qty: 1,
    gst: 5,
    discount: 0,
  });
  const [activeTherapy, setActiveTherapy] = useState({
    name: "",
    price: 0,
    discount: 0,
  });

  // const therapyOptions = [
  //   { name: "Abhyangam", price: 1200 },
  //   { name: "Shirodhara", price: 1500 },
  //   { name: "Potli Massage", price: 1000 },
  //   { name: "Panchakarma Session", price: 5000 },
  //   { name: "Kati Vasti", price: 800 },
  // ];

  const auth = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [clinicRes, billRes , therapyRes] = await Promise.all([
        axios.get("http://localhost:5001/api/clinics", auth),
        axios.get("http://localhost:5001/api/bills", auth),
        axios.get("http://localhost:5001/api/therapies", auth),
      ]);
      setClinics(clinicRes.data);
      // console.log("THERAPY API RESPONSE", therapyRes.data);

setTherapies(
  Array.isArray(therapyRes.data)
    ? therapyRes.data
    : therapyRes.data.therapies || [],
);
      const allBillsData = Array.isArray(billRes.data)
        ? billRes.data
        : billRes.data.bills || [];
      setBills(allBillsData);
      setFilteredBills(allBillsData);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    }
  };

  // Filter Logic for Search
  useEffect(() => {
    const res = bills.filter((b) => {
      return (
        b.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        b.invoiceId?.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredBills(res);
  }, [search, bills]);

  useEffect(() => {
    if (!selectedClinic) return;
    loadClinicData();
  }, [selectedClinic]);

  const loadClinicData = async () => {
    const res = await axios.get(
      `http://localhost:5001/api/medicine/clinic/${selectedClinic}`,
      auth,
    );
    setInventory(res.data);
    const clinic = clinics.find((c) => c._id === selectedClinic);
    const clinicBills = bills.filter(
      (b) => (b.clinicId?._id || b.clinicId) === selectedClinic,
    );
    const prefix = clinic?.invoicePrefix || "INV";
    setGeneratedInvoiceId(
      `${prefix}${String(clinicBills.length + 1).padStart(4, "0")}`,
    );
  };

  const addToCart = (item, category) => {
    if (!item.name || !item.price) return;
    const qty = Number(item.qty) || 1;
    const price = Number(item.price);
    const gst = Number(item.gst) || 0;
    const discount = Number(item.discount) || 0;
    const base = price * qty;
    const afterDiscount = base - base * (discount / 100);
    const total = afterDiscount + afterDiscount * (gst / 100);

    setCart([
      ...cart,
      {
        ...item,
        category,
        qty,
        price,
        gst,
        discount,
        total: Number(total.toFixed(2)),
      },
    ]);
  };

  const handleGenerateBill = async () => {
    if (!selectedClinic || !formData.patientName || cart.length === 0)
      return alert("Fill all fields");

    const payload = {
      ...formData,
      clinicId: selectedClinic,
      invoiceId: generatedInvoiceId,
      paymentMethod: formData.paymentMethod.split(" ")[0],
      totalAmount: Number(cart.reduce((s, i) => s + i.total, 0).toFixed(2)),
      items: cart,
    };

    try {
      const res = await axios.post(
        "http://localhost:5001/api/bills/generate",
        payload,
        auth,
      );
      // Set preview data and show preview modal
      setPreviewData(res.data);
      setShowPreview(true);

      // Reset Terminal
      setShowModal(false);
      setCart([]);
      fetchInitialData();
    } catch (err) {
      alert("Error generating bill");
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* Header Area */}
      {/* Page Header */}
      <div className="md:items-center md:justify-between gap-3 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 ">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-800">Billing</h2>
            <p className="text-sm text-slate-400">Manage Clinic Invoices</p>
          </div>
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              placeholder="Search Name or ID..."
              onChange={(e) => setSearch(e.target.value)}
              className="
          w-full sm:w-72
          bg-white
          border border-slate-200
          rounded-xl
          px-4 py-3
          text-sm
          shadow-sm
          focus:outline-none
          focus:ring-2 focus:ring-teal-500/20
        "
            />

            <button
              onClick={() => setShowModal(true)}
              className="
          bg-teal-600
          hover:bg-teal-700
          text-white
          font-bold
          px-6
          py-3
          rounded-xl
          shadow-md
          transition
        "
            >
              + Generate Bill
            </button>
          </div>
        </div>
      </div>

      {/* --- RESPONSIVE BILLING HISTORY --- */}
      <div className="w-full  mb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* DESKTOP TABLE: Visible only on md screens and up */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Patient Details</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentRecords.map((bill) => (
                  <tr
                    key={bill._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 font-bold text-teal-600">
                      {bill.invoiceId}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-700">
                        {bill.patientName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {bill.mobileNo}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 font-bold text-slate-600">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-800">
                      ₹{bill.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setPreviewData(bill);
                          setShowPreview(true);
                        }}
                        className="text-teal-600 text-sm font-bold hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS: Visible only on screens smaller than md */}
          <div className="md:hidden divide-y justify-center divide-slate-100">
            {currentRecords.map((bill) => (
              <div
                key={bill._id}
                className="p-4 active:bg-slate-50 transition-colors flex items-center justify-between"
                onClick={() => {
                  setPreviewData(bill);
                  setShowPreview(true);
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                      {bill.invoiceId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-500">
                      {bill.paymentMethod}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">
                    {bill.patientName}
                  </p>
                  <div className="flex items-center text-[10px] text-slate-400 gap-2">
                    <span>
                      {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <span>•</span>
                    <span>{bill.mobileNo}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-slate-900">
                    ₹{bill.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-teal-600 font-bold uppercase tracking-wider mt-1">
                    Tap to View
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredBills.length === 0 && (
            <div className="p-10 text-center text-slate-400 italic">
              No invoices found.
            </div>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
              <p className="text-xs text-slate-400 font-medium">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="
          px-3 py-1.5
          text-xs font-bold
          rounded-lg
          border
          disabled:opacity-40
          hover:bg-slate-50
        "
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`
            px-3 py-1.5
            text-xs font-bold
            rounded-lg
            border
            ${
              currentPage === i + 1
                ? "bg-teal-600 text-white border-teal-600"
                : "hover:bg-slate-50"
            }
          `}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="
          px-3 py-1.5
          text-xs font-bold
          rounded-lg
          border
          disabled:opacity-40
          hover:bg-slate-50
        "
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- BILLING TERMINAL MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[850px] rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black">
                Billing Terminal
                <span className="ml-3 text-xs px-3 py-1 bg-teal-50 text-teal-600 rounded-full">
                  ID: {generatedInvoiceId}
                </span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* City & Clinic */}
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="border p-3 rounded-xl bg-slate-50 outline-none"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedClinic("");
                  }}
                >
                  <option value="">Select City</option>
                  {[...new Set(clinics.map((c) => c.city))].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <select
                  className="border p-3 rounded-xl bg-slate-50 outline-none"
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                >
                  <option value="">Select Clinic</option>
                  {clinics
                    .filter((c) => c.city === selectedCity)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} - {c.location}
                      </option>
                    ))}
                </select>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4">
  
  {/* Patient Name */}
  <div> 
    <input
  type="text"
  placeholder="Patient Name"
  className="border p-3 rounded-xl bg-slate-50 outline-none w-full"
  value={formData.patientName}
  onChange={(e) => {
    let value = e.target.value;

    // Allow only alphabets and spaces
    value = value.replace(/[^A-Za-z\s]/g, "");

    // Prevent multiple spaces
    value = value.replace(/\s+/g, " ");

    // Prevent starting space
    value = value.replace(/^\s/, "");

    setFormData({
      ...formData,
      patientName: value,
    });
  }}
/>
  </div>

  {/* Mobile Number */}
  <div>
    <input
      type="tel"
      placeholder="Mobile No"
      className={`border p-3 rounded-xl bg-slate-50 outline-none w-full ${
        formData.mobileNo.length > 0 &&
        formData.mobileNo.length < 10
          ? "border-red-500"
          : ""
      }`}
      value={formData.mobileNo}
      maxLength={10}
      onChange={(e) => {
        // Allow only digits
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);

        setFormData({
          ...formData,
          mobileNo: value,
        });
      }}
    />

    {/* Error Message */}
    {formData.mobileNo.length > 0 &&
      formData.mobileNo.length < 10 && (
        <p className="text-red-500 text-sm mt-1">
          Please enter a proper 10-digit mobile number
        </p>
      )}
  </div>
</div>

              {/* Consultation */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Consultation
                  </p>
                  <input
                    placeholder="Fee (₹)"
                    className="border p-3 rounded-xl w-full outline-none"
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultationFee: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  onClick={() => {
                    addToCart(
                      {
                        name: "Consultation Fee",
                        price: formData.consultationFee,
                        gst: 0,
                        discount: 0,
                      },
                      "Consultation",
                    );
                    setFormData({ ...formData, consultationFee: "" });
                  }}
                  className="bg-slate-800 text-white px-6 py-3 h-[52px] rounded-xl font-bold"
                >
                  Add Fee
                </button>
              </div>

              {/* Therapy Section */}
              {/* Therapy Section */}
<div className="space-y-3">
  <p className="text-[10px] font-bold text-teal-600 uppercase">
    Therapy & Services
  </p>

  <div className="grid grid-cols-4 gap-3">
    <div className="col-span-3">
      <Select
        options={therapies.map((therapy) => ({
          label: `${therapy.name} (₹${therapy.price})`,
          value: therapy._id,
          ...therapy,
        }))}
        onChange={(selected) =>
          setActiveTherapy({
            _id: selected._id,
            name: selected.name,
            price: selected.price,
            discount: 0,
            gst: selected.gst || 0,
            qty: 1,
          })
        }
        styles={{
          control: (base) => ({
            ...base,
            padding: "4px",
            borderRadius: "12px",
          }),
        }}
      />
    </div>

    <input
      placeholder="Disc %"
      className="border p-3 rounded-xl w-full"
      type="number"
      value={activeTherapy.discount}
      onChange={(e) =>
        setActiveTherapy({
          ...activeTherapy,
          discount: e.target.value,
        })
      }
    />
  </div>

  <button
    onClick={() => addToCart(activeTherapy, "Therapy")}
    className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold shadow-md"
  >
    Add Therapy to Cart
  </button>
</div>

              {/* Medicine Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Search Medicine
                    </p>
                    <Select
                      options={inventory.map((med) => ({
                        label: `${med.name} (Stock: ${med.quantity})`,
                        value: med._id,
                        ...med,
                      }))}
                      onChange={(selected) =>
                        setActiveMedicine({
                          ...activeMedicine,
                          _id: selected._id,
                          name: selected.name,
                          price: selected.mrp,
                        })
                      }
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "4px",
                          borderRadius: "12px",
                        }),
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Qty
                    </p>
                    <input
                      type="number"
                      value={activeMedicine.qty}
                      className="border p-3 rounded-xl w-full h-[48px]"
                      onChange={(e) =>
                        setActiveMedicine({
                          ...activeMedicine,
                          qty: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-dashed text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">
                      MRP
                    </span>
                    <span className="font-bold">
                      ₹ {activeMedicine.price || "0.00"}
                    </span>
                  </div>
                  <select
                    className="border p-3 rounded-xl"
                    value={activeMedicine.gst}
                    onChange={(e) =>
                      setActiveMedicine({
                        ...activeMedicine,
                        gst: e.target.value,
                      })
                    }
                  >
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                  </select>
                  <input
                    type="number"
                    value={activeMedicine.discount}
                    placeholder="Disc %"
                    className="border p-3 rounded-xl w-full"
                    onChange={(e) =>
                      setActiveMedicine({
                        ...activeMedicine,
                        discount: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  onClick={() => addToCart(activeMedicine, "Medicine")}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-black shadow-lg"
                >
                  Add Medicine to Cart
                </button>
              </div>

              {/* Cart Summary (Live Cart) */}
              <div className="bg-teal-50 border-2 border-dashed border-teal-200 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold text-teal-600 uppercase">
                    Live Cart Items
                  </p>
                  <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full">
                    {cart.length} Total
                  </span>
                </div>
                {cart.length === 0 ? (
                  <p className="text-center text-slate-400 py-4 italic text-sm">
                    Cart is empty
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">
                            {item.name}
                          </span>
                          <span className="text-slate-400 text-[10px] uppercase">
                            {item.category} • {item.qty} Qty
                          </span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className="font-black text-teal-700">
                            ₹{item.total.toFixed(2)}
                          </span>
                          <button
                            onClick={() =>
                              setCart(cart.filter((_, i) => i !== index))
                            }
                            className="text-red-400 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-teal-200 pt-3 mt-4 flex justify-between font-black text-lg text-teal-800">
                      <span>Grand Total</span>
                      <span>
                        ₹{cart.reduce((s, i) => s + i.total, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-4 sticky bottom-0 rounded-b-3xl">
              <select
                className="border p-3 rounded-lg flex-1 font-bold outline-none bg-white"
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
              >
                <option value="Cash Payment">💵 Cash Payment</option>
                <option value="UPI Payment">📱 UPI Payment</option>
              </select>
              <button
                onClick={handleGenerateBill}
                className="bg-teal-600 hover:bg-teal-700 text-white px-10 py-3 rounded-xl flex-[2] font-black uppercase text-sm shadow-lg"
              >
                Generate Final Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ENHANCED INVOICE PREVIEW & PRINT MODAL --- */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60] p-4 overflow-y-auto">
          <style>
            {`
        @media print {

      body * {
        visibility: hidden;
      }

      #printable-invoice,
      #printable-invoice * {
        visibility: visible;
      }

      #printable-invoice {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
      }

      .no-print {
        display: none !important;
      }

    }
      `}
          </style>

          <div className="bg-white w-full max-w-[550px] rounded-2xl overflow-hidden shadow-2xl my-auto">
            <div
              id="printable-invoice"
              className="p-10 bg-white text-slate-800"
            >
              {/* Header: Logo & Clinic Info */}
              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  {/* Clinic Logo Placeholder */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center ">
                    <img
                      src="/brandicon.png"
                      alt="Dhruwraj Logo"
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-[15px] font-black text-slate-900 uppercase">
                      {
                        clinics.find(
                          (c) =>
                            c._id ===
                            (previewData.clinicId?._id || previewData.clinicId),
                        )?.name
                      }
                    </h1>
                    <p className="text-[10px] text-slate-500 max-w-[200px] leading-tight mt-1">
                      {clinics.find(
                        (c) =>
                          c._id ===
                          (previewData.clinicId?._id || previewData.clinicId),
                      )?.location || "Clinic Address"}{" "}
                      -{" "}
                      {clinics.find(
                        (c) =>
                          c._id ===
                          (previewData.clinicId?._id || previewData.clinicId),
                      )?.city || "City"}
                    </p>

                    <p className="text-[10px] font-bold text-teal-600 mt-1">
                      GSTIN:{" "}
                      {clinics.find(
                        (c) =>
                          c._id ===
                          (previewData.clinicId?._id || previewData.clinicId),
                      )?.gstNumber || "GSTIN"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-black text-slate-400 uppercase ">
                    Tax Invoice
                  </h2>
                  <p className="text-sm font-bold text-slate-900">
                    #{previewData.invoiceId}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(previewData.createdAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-4 text-[11px] mb-8 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-slate-400 font-bold uppercase mb-1">
                    Bill To:
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {previewData.patientName}
                  </p>
                  <p className="text-slate-600 font-medium">
                    +91 {previewData.mobileNo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase mb-1">
                    Payment Method:
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {previewData.paymentMethod}
                  </p>
                  {/* <p className="text-teal-600 font-bold">Status: PAID</p> */}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 text-left">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">MRP</th>
                    <th className="pb-2 text-right">Discount</th>
                    <th className="pb-2 text-right">GST</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {previewData.items?.map((item, idx) => (
                    <tr key={idx} className="text-[12px]">
                      <td className="py-3">
                        <p className="font-bold text-slate-700">{item.name}</p>
                        <p className="text-[9px] text-slate-400 italic">
                          {item.category}
                        </p>
                      </td>
                      <td className="py-3 text-center">{item.qty}</td>
                      <td className="py-3 text-right">₹{item.price}</td>
                      <td className="py-3 text-right text-[10px] text-slate-500">
                        {item.discount}%
                      </td>
                      <td className="py-3 text-right text-[10px] text-slate-500">
                        {item.gst}%
                      </td>
                      <td className="py-3 text-right font-bold">
                        ₹{item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Summary */}
              <div className="flex justify-end">
                <div className="w-full max-w-[200px] space-y-2 border-t-2 border-slate-900 pt-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Gross Total
                    </span>
                    <span className="font-bold text-slate-700">
                      ₹
                      {previewData.items
                        .reduce(
                          (acc, curr) => acc + curr.price * (curr.qty || 1),
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">GST</span>
                    <span className="font-bold text-slate-700">
                      + ₹
                      {previewData.items
                        .reduce(
                          (acc, curr) =>
                            acc +
                            (curr.price * (curr.qty || 1) -
                              curr.price *
                                (curr.qty || 1) *
                                (curr.discount / 100)) *
                              (curr.gst / 100),
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>

                  {/* Calculated Discount (Total items vs Total Amount) */}
                  <div className="flex justify-between text-[11px] text-green-600">
                    <span className="font-medium">Total Savings</span>
                    <span className="font-bold">
                      - ₹
                      {previewData.items
                        .reduce(
                          (acc, curr) =>
                            acc +
                            curr.price *
                              (curr.qty || 1) *
                              (curr.discount / 100),
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-md font-black text-slate-900 border-t border-dashed border-slate-200 pt-2">
                    <span>Grand Total</span>
                    <span>₹{previewData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center border-t border-slate-100 pt-2">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
                  Authorized Signatory
                </p>
                <p className="text-[9px] text-slate-300 mt-2 italic">
                  This is a computer-generated invoice and does not require a
                  physical signature.
                </p>
              </div>
            </div>

            {/* Action Buttons (Hidden on Print) */}
            <div className="p-4 bg-slate-900 flex gap-3 no-print">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 text-white text-xs font-bold opacity-60 hover:opacity-100 transition"
              >
                CLOSE PREVIEW
              </button>
              <button
                onClick={() => window.print()}
                className="flex-[2] bg-teal-500 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-teal-400 shadow-lg transition-transform active:scale-95"
              >
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
