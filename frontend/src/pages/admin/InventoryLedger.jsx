import React, { useState, useEffect } from "react";
import axios from "axios";

import StatCard from "../components/StatCard";

import {
  ArrowLeft,
  Plus,
  Phone,
  BadgePercent,
  Wallet,
  CreditCard,
  IndianRupee,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react";

const BASE_URL = "https://dms-backend-amber.vercel.app/api";

const InventoryLedger = () => {
  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [view, setView] = useState("list");

  const [data, setData] = useState({
    stats: {},
    companies: [],
  });

  const [history, setHistory] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const [showMedicineModal, setShowMedicineModal] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [editingCompanyId, setEditingCompanyId] = useState(null);

  const [paymentAmount, setPaymentAmount] = useState("");

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    mrName: "",
    mrPhone: "",
    discount: "",
  });

  const [medicineForm, setMedicineForm] = useState({
    medicineId: "",
    quantity: "",
    freeQuantity: "",
    unitPrice: "",
    invoiceNumber: "",
    batchNumber: "",
    paidAmount: "",
    reason: "Stock Purchase",
  });

  const [filters, setFilters] = useState({
    search: "",
  });

  // =========================================
  // FETCH COMPANIES
  // =========================================
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/companies`, {
        params: {
          search: filters.search,
        },
        ...authConfig,
      });

      const companiesData = Array.isArray(res.data?.companies)
        ? res.data.companies
        : [];

      setData({
        stats: res.data?.stats || {},
        companies: companiesData,
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FETCH COMPANY HISTORY
  // =========================================
  const showHistory = async (company) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/inventory-ledger/company/${company._id}`,
        authConfig,
      );

      setHistory(res.data?.history || []);

      setSelectedCompany(company);

      setView("history");
    } catch (err) {
      console.error("History Error:", err);

      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // ADD COMPANY
  // =========================================
  const addCompany = async () => {
    try {
      await axios.post(
        `${BASE_URL}/companies`,
        {
          companyName: companyForm.companyName,
          mrName: companyForm.mrName,
          mrPhone: companyForm.mrPhone,
          discount: Number(companyForm.discount),
        },
        authConfig,
      );

      setShowCompanyModal(false);

      setCompanyForm({
        companyName: "",
        mrName: "",
        mrPhone: "",
        discount: "",
      });

      fetchData();
    } catch (err) {
      console.error("Add Company Error:", err);
    }
  };

  // =========================================
  // ADD MEDICINE
  // =========================================
  const addMedicine = async () => {
    try {
      const totalAmount =
        Number(medicineForm.quantity) * Number(medicineForm.unitPrice);

      const dueAmount = totalAmount - Number(medicineForm.paidAmount || 0);

      await axios.post(
        `${BASE_URL}/inventory-ledger`,
        {
          companyId: selectedCompany._id,
          medicineId: medicineForm.medicineId,
          quantity: Number(medicineForm.quantity),
          freeQuantity: Number(medicineForm.freeQuantity),
          unitPrice: Number(medicineForm.unitPrice),
          totalAmount,
          invoiceNumber: medicineForm.invoiceNumber,
          batchNumber: medicineForm.batchNumber,
          paidAmount: Number(medicineForm.paidAmount),
          dueAmount,
          reason: medicineForm.reason,
          type: "IN",
        },
        authConfig,
      );

      setShowMedicineModal(false);

      setMedicineForm({
        medicineId: "",
        quantity: "",
        freeQuantity: "",
        unitPrice: "",
        invoiceNumber: "",
        batchNumber: "",
        paidAmount: "",
        reason: "Stock Purchase",
      });

      showHistory(selectedCompany);

      fetchData();
    } catch (err) {
      console.error("Add Medicine Error:", err);
    }
  };

  // =========================================
  // UPDATE PAYMENT
  // =========================================
  const updatePayment = async () => {
    try {
      await axios.put(
        `${BASE_URL}/companies/payment/${selectedCompany._id}`,
        {
          amount: Number(paymentAmount),
        },
        authConfig,
      );

      setShowPaymentModal(false);

      setPaymentAmount("");

      fetchData();

      showHistory(selectedCompany);
    } catch (err) {
      console.error("Payment Error:", err);
    }
  };

  const updateCompany = async () => {
    try {
      await axios.put(
        `${BASE_URL}/companies/${editingCompanyId}`,
        {
          ...companyForm,
          totalPaid: selectedCompany?.totalPaid || 0,
        },
        authConfig,
      );

      setShowCompanyModal(false);

      setIsEditing(false);

      setEditingCompanyId(null);

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCompany = async (companyId) => {
    try {
      const confirmDelete = window.confirm("Delete this company?");

      if (!confirmDelete) return;

      await axios.delete(`${BASE_URL}/companies/${companyId}`, authConfig);

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Ledger</h1>

          <p className="text-gray-500">Company wise purchase ledger</p>
        </div>

        {view === "list" && (
          <button
            onClick={() => setShowCompanyModal(true)}
            className="bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add Company
          </button>
        )}
      </div>

      {view === "list" ? (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Companies"
              value={data?.companies?.length || 0}
              color="blue"
            />

            <StatCard
              title="Total Business"
              value={`₹${data?.stats?.totalBusiness || 0}`}
              color="green"
            />

            <StatCard
              title="Pending Due"
              value={`₹${data?.stats?.totalDue || 0}`}
              color="red"
            />
          </div>

          {/* SEARCH */}
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <input
              type="text"
              placeholder="Search company..."
              className="border p-3 rounded-xl w-full"
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  search: e.target.value,
                })
              }
            />
          </div>

          {/* COMPANY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data?.companies?.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl shadow border p-5 space-y-4"
              >
                <div onClick={() => showHistory(c)} className="cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Building2 className="text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">{c.companyName}</h2>

                      <p className="text-gray-500">MR: {c.mrName}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-5">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      {c.mrPhone}
                    </div>

                    <div className="flex items-center gap-2">
                      <BadgePercent size={16} />
                      Discount:
                      {c.discount}%
                    </div>

                    <div className="flex items-center gap-2">
                      <IndianRupee size={16} />
                      Business: ₹{c.totalBusiness}
                    </div>

                    <div className="flex items-center gap-2 text-green-600">
                      <CreditCard size={16} />
                      Paid: ₹{c.totalPaid}
                    </div>

                    <div className="flex items-center gap-2 text-red-600">
                      <Wallet size={16} />
                      Due: ₹{c.balanceDue}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCompany(c);
                    setShowPaymentModal(true);
                  }}
                  className="w-full bg-black text-white py-2 rounded-xl"
                >
                  Update Payment
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);

                      setEditingCompanyId(c._id);

                      setCompanyForm({
                        companyName: c.companyName,

                        mrName: c.mrName,

                        mrPhone: c.mrPhone,

                        discount: c.discount,
                      });

                      setSelectedCompany(c);

                      setShowCompanyModal(true);
                    }}
                    className="bg-blue-600 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Pencil size={16} />
                    Update
                  </button>

                  <button
                    onClick={() => deleteCompany(c._id)}
                    className="bg-red-600 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 mb-5"
          >
            <ArrowLeft />
            Back
          </button>

          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-3xl font-bold">
                {selectedCompany?.companyName}
              </h2>

              <p className="text-gray-500">
                MR:
                {selectedCompany?.mrName}
              </p>
            </div>

            <button
              onClick={() => setShowMedicineModal(true)}
              className="bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2"
            >
              <Plus size={18} />
              Add Medicine
            </button>
          </div>

          {/* HISTORY TABLE */}
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Date</th>

                  <th className="p-4">Medicine</th>

                  <th className="p-4">Qty</th>

                  <th className="p-4">Invoice</th>

                  <th className="p-4">Batch</th>

                  <th className="p-4">Total</th>

                  <th className="p-4">Paid</th>

                  <th className="p-4">Due</th>
                </tr>
              </thead>

              <tbody>
                {history?.map((h) => (
                  <tr key={h._id} className="border-t">
                    <td className="p-4">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4">{h.medicineId?.name}</td>

                    <td className="p-4">{h.quantity}</td>

                    <td className="p-4">{h.invoiceNumber}</td>

                    <td className="p-4">{h.batchNumber}</td>

                    <td className="p-4 font-bold">₹{h.totalAmount}</td>

                    <td className="p-4 text-green-600">₹{h.paidAmount}</td>

                    <td className="p-4 text-red-600">₹{h.dueAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD COMPANY MODAL */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Add Company</h2>

            <input
              type="text"
              placeholder="Company Name"
              className="border p-3 rounded-xl w-full"
              value={companyForm.companyName}
              onChange={(e) =>
                setCompanyForm({
                  ...companyForm,
                  companyName: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="MR Name"
              className="border p-3 rounded-xl w-full"
              value={companyForm.mrName}
              onChange={(e) =>
                setCompanyForm({
                  ...companyForm,
                  mrName: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="MR Phone"
              className="border p-3 rounded-xl w-full"
              value={companyForm.mrPhone}
              onChange={(e) =>
                setCompanyForm({
                  ...companyForm,
                  mrPhone: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Discount %"
              className="border p-3 rounded-xl w-full"
              value={companyForm.discount}
              onChange={(e) =>
                setCompanyForm({
                  ...companyForm,
                  discount: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCompanyModal(false)}
                className="border px-4 py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={addCompany}
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {showMedicineModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-5">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg space-y-4">
            <h2 className="text-2xl font-bold">Add Medicine</h2>

            <input
              type="text"
              placeholder="Medicine ID"
              className="border p-3 rounded-xl w-full"
              value={medicineForm.medicineId}
              onChange={(e) =>
                setMedicineForm({
                  ...medicineForm,
                  medicineId: e.target.value,
                })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Quantity"
                className="border p-3 rounded-xl"
                value={medicineForm.quantity}
                onChange={(e) =>
                  setMedicineForm({
                    ...medicineForm,
                    quantity: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Free Quantity"
                className="border p-3 rounded-xl"
                value={medicineForm.freeQuantity}
                onChange={(e) =>
                  setMedicineForm({
                    ...medicineForm,
                    freeQuantity: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Unit Price"
                className="border p-3 rounded-xl"
                value={medicineForm.unitPrice}
                onChange={(e) =>
                  setMedicineForm({
                    ...medicineForm,
                    unitPrice: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Paid Amount"
                className="border p-3 rounded-xl"
                value={medicineForm.paidAmount}
                onChange={(e) =>
                  setMedicineForm({
                    ...medicineForm,
                    paidAmount: e.target.value,
                  })
                }
              />
            </div>

            <input
              type="text"
              placeholder="Invoice Number"
              className="border p-3 rounded-xl w-full"
              value={medicineForm.invoiceNumber}
              onChange={(e) =>
                setMedicineForm({
                  ...medicineForm,
                  invoiceNumber: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Batch Number"
              className="border p-3 rounded-xl w-full"
              value={medicineForm.batchNumber}
              onChange={(e) =>
                setMedicineForm({
                  ...medicineForm,
                  batchNumber: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMedicineModal(false)}
                className="border px-4 py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={addMedicine}
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Update Payment</h2>

            <p className="text-gray-500">{selectedCompany?.companyName}</p>

            <input
              type="number"
              placeholder="Enter Amount"
              className="border p-3 rounded-xl w-full"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="border px-4 py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={updatePayment}
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryLedger;
