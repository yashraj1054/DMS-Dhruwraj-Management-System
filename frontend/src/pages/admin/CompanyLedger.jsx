
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Filter,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Search,
  Wallet,
  X,
} from "lucide-react";

const API = "https://dms-backend-amber.vercel.app/api/company-ledger";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const today = () => new Date().toISOString().slice(0, 10);

const emptyCompany = {
  companyName: "",
  mrName: "",
  mrMobile: "",
  discountPercentage: "0",
};

const emptyProduct = () => ({
  productName: "",
  quantity: "1",
  invoiceNumber: "",
  batchNumber: "",
  mrp: "",
  purchaseRate: "",
});

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5">
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
          wide ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon size={19} className="text-blue-600" />
      </div>
      <p className="mt-2 break-words text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function CompanyLedger() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const [companyModal, setCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [adminPassword, setAdminPassword] = useState("");

  const [ledgerModal, setLedgerModal] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [products, setProducts] = useState([emptyProduct()]);
  const [ledgerNote, setLedgerNote] = useState("");

  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentLedger, setPaymentLedger] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: today(),
    method: "Cash",
    transactionNumber: "",
    note: "",
  });

  const [detailsLedger, setDetailsLedger] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "All",
    batchNumber: "",
  });

  const token = localStorage.getItem("token");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const request = useCallback(
    async (method, url, data) => {
      const response = await axios({
        method,
        url,
        data,
        headers,
      });
      return response.data;
    },
    [headers]
  );

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await request("get", API);
      const list = Array.isArray(data) ? data : [];
      setCompanies(list);

      if (
        selectedCompanyId &&
        !list.some((company) => company._id === selectedCompanyId)
      ) {
        setSelectedCompanyId("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load companies. Please check your login."
      );
    } finally {
      setLoading(false);
    }
  }, [request, selectedCompanyId]);

  const loadLedgers = useCallback(async () => {
    if (!selectedCompanyId) {
      setLedgers([]);
      return;
    }

    setError("");

    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.status !== "All") params.status = filters.status;
      if (filters.batchNumber.trim()) {
        params.batchNumber = filters.batchNumber.trim();
      }

      const response = await axios.get(
        `${API}/companies/${selectedCompanyId}/ledgers`,
        { headers, params }
      );

      setLedgers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load purchase ledgers."
      );
    }
  }, [selectedCompanyId, filters, headers]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    loadLedgers();
  }, [loadLedgers]);

  const selectedCompany = companies.find(
    (company) => company._id === selectedCompanyId
  );

  const visibleCompanies = companies.filter((company) =>
    [
      company.companyName,
      company.mrName,
      company.mrMobile,
    ].some((value) =>
      String(value || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const summary = useMemo(
    () =>
      ledgers.reduce(
        (acc, ledger) => {
          acc.purchase += Number(ledger.totalAmount || 0);
          acc.paid += Number(ledger.paidAmount || 0);
          acc.pending += Number(ledger.pendingAmount || 0);
          return acc;
        },
        { purchase: 0, paid: 0, pending: 0 }
      ),
    [ledgers]
  );

  const openAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm(emptyCompany);
    setAdminPassword("");
    setError("");
    setCompanyModal(true);
  };

  const openEditCompany = () => {
    if (!selectedCompany) return;

    setEditingCompany(selectedCompany);
    setCompanyForm({
      companyName: selectedCompany.companyName || "",
      mrName: selectedCompany.mrName || "",
      mrMobile: selectedCompany.mrMobile || "",
      discountPercentage: String(
        selectedCompany.discountPercentage ?? 0
      ),
    });
    setAdminPassword("");
    setError("");
    setCompanyModal(true);
  };

  const saveCompany = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...companyForm,
        discountPercentage: Number(companyForm.discountPercentage),
      };

      let saved;

      if (editingCompany) {
        payload.adminPassword = adminPassword;
        saved = await request(
          "put",
          `${API}/companies/${editingCompany._id}`,
          payload
        );
      } else {
        saved = await request("post", `${API}/companies`, payload);
      }

      setCompanyModal(false);
      setNotice(
        editingCompany
          ? "Company details updated successfully."
          : "Company added successfully."
      );

      await loadCompanies();

      if (!editingCompany && saved?._id) {
        setSelectedCompanyId(saved._id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save company."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = (index, field, value) => {
    setProducts((current) =>
      current.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  };

  const purchaseTotal = products.reduce(
    (sum, product) =>
      sum +
      Number(product.quantity || 0) *
        Number(product.purchaseRate || 0),
    0
  );

  const saveLedger = async (event) => {
    event.preventDefault();
    if (!selectedCompanyId) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        purchaseDate,
        products: products.map((product) => ({
          ...product,
          quantity: Number(product.quantity),
          mrp: Number(product.mrp),
          purchaseRate: Number(product.purchaseRate),
        })),
        note: ledgerNote,
      };

      await request(
        "post",
        `${API}/companies/${selectedCompanyId}/ledgers`,
        payload
      );

      setLedgerModal(false);
      setProducts([emptyProduct()]);
      setPurchaseDate(today());
      setLedgerNote("");
      setNotice("Purchase ledger created successfully.");
      await loadLedgers();
      await loadCompanies();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create ledger."
      );
    } finally {
      setSaving(false);
    }
  };

  const openPayment = (ledger) => {
    setPaymentLedger(ledger);
    setPaymentForm({
      amount: String(ledger.pendingAmount || ""),
      paymentDate: today(),
      method: "Cash",
      transactionNumber: "",
      note: "",
    });
    setError("");
    setPaymentModal(true);
  };

  const savePayment = async (event) => {
    event.preventDefault();
    if (!paymentLedger || !selectedCompanyId) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await request(
        "post",
        `${API}/companies/${selectedCompanyId}/ledgers/${paymentLedger._id}/payments`,
        {
          ...paymentForm,
          amount: Number(paymentForm.amount),
        }
      );

      setPaymentModal(false);
      setNotice("Payment recorded successfully.");
      await loadLedgers();
      await loadCompanies();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to record payment."
      );
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      from: "",
      to: "",
      status: "All",
      batchNumber: "",
    });
  };

  const companyLedgerCount = selectedCompany?.ledgers?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Building2 size={17} />
              Admin / Company Ledger
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Company Ledger
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage supplier purchases, payment history and outstanding balances.
            </p>
          </div>

          <button className={buttonPrimary} onClick={openAddCompany}>
            <Plus size={18} /> Add Company
          </button>
        </div>

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message">
              <X size={17} />
            </button>
          </div>
        )}

        {!selectedCompanyId ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your Companies
                </h2>
                <p className="text-sm text-slate-500">
                  Select a company to view its purchase ledgers.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  className={`${inputClass} pl-10`}
                  placeholder="Search companies..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoaderCircle className="animate-spin text-blue-600" />
              </div>
            ) : visibleCompanies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
                <Building2 className="mx-auto text-slate-400" size={36} />
                <p className="mt-3 font-semibold text-slate-700">
                  No companies found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add your first company to start recording purchases.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCompanies.map((company) => (
                  <button
                    key={company._id}
                    onClick={() => setSelectedCompanyId(company._id)}
                    className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                          <Building2 size={22} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-900">
                            {company.companyName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            MR: {company.mrName}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={19} className="shrink-0 text-slate-400" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                      <span className="text-slate-500">
                        {company.mrMobile}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {company.discountPercentage || 0}% discount
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <button
              className={buttonSecondary}
              onClick={() => setSelectedCompanyId("")}
            >
              <ArrowLeft size={17} /> All Companies
            </button>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Building2 size={25} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedCompany?.companyName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      MR: {selectedCompany?.mrName} · {selectedCompany?.mrMobile}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Company discount: {selectedCompany?.discountPercentage || 0}%
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className={buttonSecondary} onClick={openEditCompany}>
                    <LockKeyhole size={17} /> Edit Details
                  </button>
                  <button
                    className={buttonSecondary}
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    <Filter size={17} /> Filters
                  </button>
                  <button
                    className={buttonPrimary}
                    onClick={() => {
                      setProducts([emptyProduct()]);
                      setPurchaseDate(today());
                      setLedgerNote("");
                      setError("");
                      setLedgerModal(true);
                    }}
                  >
                    <Plus size={18} /> Add Ledger
                  </button>
                </div>
              </div>
            </section>

            {filtersOpen && (
              <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
                <Field label="Purchase date from">
                  <input
                    type="date"
                    className={inputClass}
                    value={filters.from}
                    max={filters.to || undefined}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, from: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Purchase date to">
                  <input
                    type="date"
                    className={inputClass}
                    value={filters.to}
                    min={filters.from || undefined}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, to: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Payment status">
                  <select
                    className={inputClass}
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    <option>All</option>
                    <option>Pending</option>
                    <option>Paid</option>
                  </select>
                </Field>
                <Field label="Batch number">
                  <input
                    className={inputClass}
                    placeholder="Search batch..."
                    value={filters.batchNumber}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        batchNumber: e.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="flex items-end">
                  <button
                    className={`${buttonSecondary} w-full`}
                    onClick={resetFilters}
                  >
                    Reset filters
                  </button>
                </div>
              </section>
            )}

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                label="Purchase Total"
                value={money(summary.purchase)}
                icon={FileText}
              />
              <SummaryCard
                label="Total Paid"
                value={money(summary.paid)}
                icon={CheckCircle2}
              />
              <SummaryCard
                label="Pending Balance"
                value={money(summary.pending)}
                icon={Wallet}
              />
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-1 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-bold text-slate-900">Purchase Ledgers</h2>
                <span className="text-sm text-slate-500">
                  {ledgers.length} ledger(s)
                </span>
              </div>

              {ledgers.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto text-slate-400" size={34} />
                  <p className="mt-3 font-semibold text-slate-700">
                    No ledgers match these filters
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Add a ledger or reset the filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Ledger ID / Date</th>
                          <th className="px-4 py-3">Products</th>
                          <th className="px-4 py-3">Invoices / Batches</th>
                          <th className="px-4 py-3">Purchase total</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Pending</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledgers.map((ledger) => (
                          <tr key={ledger._id} className="align-top hover:bg-slate-50">
                            <td className="px-4 py-4">
                              <p className="font-bold text-blue-700">{ledger.ledgerId}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
                              </p>
                            </td>
                            <td className="max-w-56 px-4 py-4">
                              {ledger.products.map((product, index) => (
                                <p key={product._id || index} className="mb-1">
                                  {product.productName}{" "}
                                  <span className="text-slate-500">
                                    × {product.quantity}
                                  </span>
                                </p>
                              ))}
                            </td>
                            <td className="max-w-48 px-4 py-4">
                              {ledger.products.map((product, index) => (
                                <p key={product._id || index} className="mb-1 text-xs text-slate-600">
                                  Inv: {product.invoiceNumber || "—"} · Batch: {product.batchNumber || "—"}
                                </p>
                              ))}
                            </td>
                            <td className="px-4 py-4 font-semibold">{money(ledger.totalAmount)}</td>
                            <td className="px-4 py-4 text-emerald-700">{money(ledger.paidAmount)}</td>
                            <td className="px-4 py-4 font-semibold text-rose-700">{money(ledger.pendingAmount)}</td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                ledger.paymentStatus === "Paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {ledger.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col items-start gap-2">
                                <button
                                  className="text-xs font-semibold text-blue-700 hover:underline"
                                  onClick={() => setDetailsLedger(ledger)}
                                >
                                  View details
                                </button>
                                {ledger.pendingAmount > 0.009 && (
                                  <button
                                    className="text-xs font-semibold text-emerald-700 hover:underline"
                                    onClick={() => openPayment(ledger)}
                                  >
                                    Add payment
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3 p-3 md:hidden">
                    {ledgers.map((ledger) => (
                      <div key={ledger._id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-blue-700">{ledger.ledgerId}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(ledger.purchaseDate).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ledger.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {ledger.paymentStatus}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm">
                          {ledger.products.map((product, index) => (
                            <p key={product._id || index} className="text-slate-700">
                              {product.productName} × {product.quantity}
                            </p>
                          ))}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Purchase total</p>
                            <p className="mt-1 font-bold">{money(ledger.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Pending</p>
                            <p className="mt-1 font-bold text-rose-700">{money(ledger.pendingAmount)}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button className={buttonSecondary} onClick={() => setDetailsLedger(ledger)}>
                            View details
                          </button>
                          {ledger.pendingAmount > 0.009 && (
                            <button className={buttonPrimary} onClick={() => openPayment(ledger)}>
                              <CreditCard size={16} /> Add payment
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>

      {companyModal && (
        <Modal
          title={editingCompany ? "Edit Company Details" : "Add Company"}
          onClose={() => setCompanyModal(false)}
        >
          <form onSubmit={saveCompany} className="space-y-4">
            <Field label="Company Name *">
              <input
                required
                className={inputClass}
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm((f) => ({ ...f, companyName: e.target.value }))}
                placeholder="Enter company name"
              />
            </Field>
            <Field label="MR Name *">
              <input
                required
                className={inputClass}
                value={companyForm.mrName}
                onChange={(e) => setCompanyForm((f) => ({ ...f, mrName: e.target.value }))}
                placeholder="Enter MR name"
              />
            </Field>
            <Field label="MR Mobile Number *">
              <input
                required
                inputMode="tel"
                className={inputClass}
                value={companyForm.mrMobile}
                onChange={(e) => setCompanyForm((f) => ({ ...f, mrMobile: e.target.value }))}
                placeholder="Enter mobile number"
              />
            </Field>
            <Field label="Company Discount (%)">
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={inputClass}
                value={companyForm.discountPercentage}
                onChange={(e) => setCompanyForm((f) => ({ ...f, discountPercentage: e.target.value }))}
              />
            </Field>

            {editingCompany && (
              <Field label="Admin Password (required to approve changes) *">
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your admin login password"
                />
              </Field>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button type="button" className={buttonSecondary} onClick={() => setCompanyModal(false)}>
                Cancel
              </button>
              <button className={buttonPrimary} disabled={saving}>
                {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
                {editingCompany ? "Verify & Save" : "Save Company"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {ledgerModal && (
        <Modal title="Add Purchase Ledger" onClose={() => setLedgerModal(false)} wide>
          <form onSubmit={saveLedger} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Purchase Date *">
                <input
                  required
                  type="date"
                  className={inputClass}
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </Field>
              <Field label="Company">
                <input
                  readOnly
                  className={`${inputClass} bg-slate-50`}
                  value={selectedCompany?.companyName || ""}
                />
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-900">Products</h3>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => setProducts((current) => [...current, emptyProduct()])}
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {products.map((product, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700">Product {index + 1}</p>
                    {products.length > 1 && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-600 hover:underline"
                        onClick={() => setProducts((current) => current.filter((_, i) => i !== index))}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Product Name *">
                      <input
                        required
                        className={inputClass}
                        value={product.productName}
                        onChange={(e) => updateProduct(index, "productName", e.target.value)}
                        placeholder="Medicine / product name"
                      />
                    </Field>
                    <Field label="Number of Items *">
                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        className={inputClass}
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, "quantity", e.target.value)}
                      />
                    </Field>
                    <Field label="Invoice Number">
                      <input
                        className={inputClass}
                        value={product.invoiceNumber}
                        onChange={(e) => updateProduct(index, "invoiceNumber", e.target.value)}
                      />
                    </Field>
                    <Field label="Batch Number">
                      <input
                        className={inputClass}
                        value={product.batchNumber}
                        onChange={(e) => updateProduct(index, "batchNumber", e.target.value)}
                      />
                    </Field>
                    <Field label="MRP per Item (₹) *">
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={product.mrp}
                        onChange={(e) => updateProduct(index, "mrp", e.target.value)}
                      />
                    </Field>
                    <Field label="Purchase Rate per Item (₹) *">
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={product.purchaseRate}
                        onChange={(e) => updateProduct(index, "purchaseRate", e.target.value)}
                      />
                    </Field>
                  </div>

                  <p className="mt-3 text-right text-sm text-slate-600">
                    Line total:{" "}
                    <strong>
                      {money(Number(product.quantity || 0) * Number(product.purchaseRate || 0))}
                    </strong>
                  </p>
                </div>
              ))}
            </div>

            <Field label="Notes (optional)">
              <textarea
                rows={2}
                className={inputClass}
                value={ledgerNote}
                onChange={(e) => setLedgerNote(e.target.value)}
                placeholder="Optional purchase notes"
              />
            </Field>

            <div className="rounded-xl bg-blue-50 p-4 text-right">
              <p className="text-sm text-blue-800">Total purchase amount</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{money(purchaseTotal)}</p>
              <p className="mt-1 text-xs text-blue-700">
                Payments can be added after the ledger is saved.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className={buttonSecondary} onClick={() => setLedgerModal(false)}>
                Cancel
              </button>
              <button className={buttonPrimary} disabled={saving}>
                {saving ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}
                Save Ledger
              </button>
            </div>
          </form>
        </Modal>
      )}

      {paymentModal && paymentLedger && (
        <Modal title={`Add Payment · ${paymentLedger.ledgerId}`} onClose={() => setPaymentModal(false)}>
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-xs text-slate-500">Pending balance</p>
              <p className="mt-1 font-bold text-rose-700">{money(paymentLedger.pendingAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Already paid</p>
              <p className="mt-1 font-bold text-emerald-700">{money(paymentLedger.paidAmount)}</p>
            </div>
          </div>

          <form onSubmit={savePayment} className="space-y-4">
            <Field label="Payment Amount (₹) *">
              <input
                required
                type="number"
                min="0.01"
                max={paymentLedger.pendingAmount}
                step="0.01"
                className={inputClass}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </Field>
            <Field label="Payment Date *">
              <input
                required
                type="date"
                className={inputClass}
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm((f) => ({ ...f, paymentDate: e.target.value }))}
              />
            </Field>
            <Field label="Payment Method *">
              <select
                className={inputClass}
                value={paymentForm.method}
                onChange={(e) => setPaymentForm((f) => ({
                  ...f,
                  method: e.target.value,
                  transactionNumber: e.target.value === "Cash" ? "" : f.transactionNumber,
                }))}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </Field>

            {paymentForm.method === "UPI" && (
              <Field label="UPI Transaction Number *">
                <input
                  required
                  className={inputClass}
                  value={paymentForm.transactionNumber}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, transactionNumber: e.target.value }))}
                  placeholder="Enter UPI transaction/reference ID"
                />
              </Field>
            )}

            <Field label="Payment Note (optional)">
              <textarea
                rows={2}
                className={inputClass}
                value={paymentForm.note}
                onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
              />
            </Field>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className={buttonSecondary} onClick={() => setPaymentModal(false)}>
                Cancel
              </button>
              <button className={buttonPrimary} disabled={saving}>
                {saving ? <LoaderCircle className="animate-spin" size={17} /> : <CreditCard size={17} />}
                Record Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detailsLedger && (
        <Modal
          title={`Ledger Details · ${detailsLedger.ledgerId}`}
          onClose={() => setDetailsLedger(null)}
          wide
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Purchase total</p>
              <p className="mt-1 font-bold">{money(detailsLedger.totalAmount)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Total paid</p>
              <p className="mt-1 font-bold text-emerald-800">{money(detailsLedger.paidAmount)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3">
              <p className="text-xs text-rose-700">Pending balance</p>
              <p className="mt-1 font-bold text-rose-800">{money(detailsLedger.pendingAmount)}</p>
            </div>
          </div>

          <h3 className="mb-2 mt-5 font-bold text-slate-900">Products</h3>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">Batch</th>
                  <th className="px-3 py-2">MRP</th>
                  <th className="px-3 py-2">Purchase rate</th>
                  <th className="px-3 py-2">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {detailsLedger.products.map((product, index) => (
                  <tr key={product._id || index}>
                    <td className="px-3 py-3">{product.productName}</td>
                    <td className="px-3 py-3">{product.quantity}</td>
                    <td className="px-3 py-3">{product.invoiceNumber || "—"}</td>
                    <td className="px-3 py-3">{product.batchNumber || "—"}</td>
                    <td className="px-3 py-3">{money(product.mrp)}</td>
                    <td className="px-3 py-3">{money(product.purchaseRate)}</td>
                    <td className="px-3 py-3 font-semibold">
                      {money(Number(product.quantity) * Number(product.purchaseRate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900">Payment History</h3>
            {detailsLedger.pendingAmount > 0.009 && (
              <button
                className={buttonPrimary}
                onClick={() => {
                  const current = detailsLedger;
                  setDetailsLedger(null);
                  openPayment(current);
                }}
              >
                <Plus size={16} /> Add Payment
              </button>
            )}
          </div>

          {(detailsLedger.payments || []).length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
              No payments recorded yet.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {detailsLedger.payments.map((payment, index) => (
                <div
                  key={payment._id || index}
                  className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {money(payment.amount)} · {payment.method}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                    </p>
                    {payment.transactionNumber && (
                      <p className="mt-1 text-xs text-slate-600">
                        Transaction: {payment.transactionNumber}
                      </p>
                    )}
                    {payment.note && (
                      <p className="mt-1 text-xs text-slate-500">{payment.note}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="mr-1 inline" size={15} />
                    Recorded
                  </span>
                </div>
              ))}
            </div>
          )}

          {detailsLedger.note && (
            <p className="mt-4 text-sm text-slate-500">
              Note: {detailsLedger.note}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
