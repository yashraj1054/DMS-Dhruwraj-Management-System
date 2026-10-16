
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Printer, RefreshCw, AlertCircle } from "lucide-react";

const API_URL = "https://dms-backend-amber.vercel.app/api/bills/public";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const InvoicePage = () => {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchInvoice = async () => {
      setLoading(true);
      setError("");
      setInvoice(null);

      try {
        const res = await axios.get(
          `${API_URL}/${encodeURIComponent(id)}`
        );

        if (!active) return;

        const data = res.data?.invoice || res.data;

        if (
          !data ||
          typeof data !== "object" ||
          !data._id
        ) {
          throw new Error("Invalid invoice data received.");
        }

        setInvoice(data);
      } catch (err) {
        if (!active) return;

        console.error(
          "Invoice fetch failed:",
          err.response?.data || err
        );

        setError(
          err.response?.status === 404
            ? "Invoice not found. Please check the invoice link."
            : err.response?.status === 401 ||
                err.response?.status === 403
              ? "You are not authorized to view this invoice."
              : "Unable to load the invoice. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    } else {
      setLoading(false);
      setError("Invoice ID is missing.");
    }

    return () => {
      active = false;
    };
  }, [id]);

  const items = useMemo(
    () => (Array.isArray(invoice?.items) ? invoice.items : []),
    [invoice]
  );

  const clinic =
    invoice?.clinicId &&
    typeof invoice.clinicId === "object"
      ? invoice.clinicId
      : {};

  const patientName = invoice?.patientName || "—";
  const patientCode =
    invoice?.patientCode ||
    (typeof invoice?.patientId === "string"
      ? invoice.patientId
      : invoice?.patientId?.patientCode) ||
    "—";

  const patientAddress = invoice?.patientAddress || "—";

  const paymentLabel = String(
    invoice?.paymentMethod || "Cash"
  ).replace(/\s*Payment\s*/i, "").trim();

  const isAyurvedic = (item) => {
    const category = String(item?.category || "").toLowerCase();
    const name = String(item?.name || "").toLowerCase();

    return (
      category.includes("ayurvedic") ||
      category.includes("churan") ||
      category.includes("bhasam") ||
      category.includes("bhasma") ||
      category.includes("ayurvedic oil") ||
      name.includes("ayurvedic")
    );
  };

  const consultationItems = items.filter((item) =>
    String(item?.category || "")
      .toLowerCase()
      .includes("consultation")
  );

  const therapyItems = items.filter((item) =>
    String(item?.category || "")
      .toLowerCase()
      .includes("therapy")
  );

  const ayurvedicItems = items.filter(
    (item) =>
      !String(item?.category || "")
        .toLowerCase()
        .includes("consultation") &&
      !String(item?.category || "")
        .toLowerCase()
        .includes("therapy") &&
      isAyurvedic(item)
  );

  const medicineItems = items.filter(
    (item) =>
      !String(item?.category || "")
        .toLowerCase()
        .includes("consultation") &&
      !String(item?.category || "")
        .toLowerCase()
        .includes("therapy") &&
      !isAyurvedic(item)
  );

  const sum = (list, field) =>
    list.reduce(
      (total, item) => total + Number(item?.[field] || 0),
      0
    );

  const baseValue = items.reduce(
    (total, item) =>
      total +
      Number(
        item?.base ??
          item?.taxableAmount ??
          item?.total ??
          0
      ),
    0
  );

  const discountValue = sum(items, "discountAmount");
  const gstValue = sum(items, "gstAmount");

  // Bill data is authoritative; split GST equally.
  const cgst = Number(invoice?.cgst ?? gstValue / 2);
  const sgst = Number(invoice?.sgst ?? gstValue / 2);

  const grandTotal = Number(
    invoice?.totalAmount ??
      items.reduce(
        (total, item) => total + Number(item?.total || 0),
        0
      )
  );

  const renderRows = (rows, heading) => {
    if (!rows.length) return null;

    return (
      <section className="mt-7">
        <h2 className="mb-3 text-[12px] font-extrabold uppercase tracking-wider text-[#30415D]">
          {heading}
        </h2>

        <div className="overflow-x-auto rounded-xl border border-[#E8EDF3]">
          <table className="w-full min-w-[500px] text-left text-[12px]">
            <thead className="bg-[#F3F6FA] text-[#667A96]">
              <tr>
                <th className="px-4 py-3 font-bold">Item</th>
                <th className="px-3 py-3 text-right font-bold">Qty</th>
                <th className="px-3 py-3 text-right font-bold">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right font-bold">
                  Disc %
                </th>
                <th className="px-4 py-3 text-right font-bold">
                  GST %
                </th>

                <th className="px-4 py-3 text-right font-bold">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((item, index) => (
                <tr
                  key={item._id || `${item.name}-${index}`}
                  className="border-t border-[#E8EDF3]"
                >
                  <td className="px-4 py-3 text-[#30415D]">
                    <div className="font-bold">
                      {item.name || "Item"}
                    </div>

                    {item.category && (
                      <div className="mt-1 text-[10px] text-[#91A6C2]">
                        {item.category}
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3 text-right text-[#667A96]">
                    {Number(item.qty ?? 1)}{" "}
                    {item.unit || ""}
                  </td>

                  <td className="px-3 py-3 text-right text-[#667A96]">
                    {formatMoney(
                      item.pricePerUnit ??
                        item.price ??
                        0
                    )}
                  </td>

                  <td className="px-4 py-3 text-right text-[#667A96]">
                    {
                      item.discount ? `${item.discount}%` : "-"
                    }
                  </td>
                  
                  <td className="px-4 py-3 text-right text-[#667A96]">
                    {item.gst ? `${item.gst}%` : "-"}
                  </td>

                  <td className="px-4 py-3 text-right font-bold text-[#172238]">
                    {formatMoney(
                      item.total ??
                        item.taxableAmount ??
                        0
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin text-teal-600" />
          <p className="text-sm font-semibold text-slate-600">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={38} />

          <h1 className="text-xl font-extrabold text-slate-800">
            Invoice unavailable
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {error || "Invoice data could not be loaded."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen  px-3 py-6 sm:px-6">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .invoice-page {
            padding: 0 !important;
            background: white !important;
          }

          .invoice-card {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .invoice-content {
            min-height: auto !important;
            padding: 8px !important;
          }

          section,
          table,
          tr {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="invoice-page mx-auto max-w-[794px]">
        <div className="no-print mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-slate-800">
              Invoice Preview
            </p>
            <p className="text-xs text-slate-500">
              {invoice.invoiceId || invoice._id}
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-xs font-extrabold text-white shadow hover:bg-teal-700"
          >
            <Printer size={16} />
            PRINT / SAVE PDF
          </button>
        </div>

        <article className="invoice-card overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="invoice-content min-h-[1123px] bg-white px-5 py-8 text-[#30415D] sm:px-10 sm:py-12">
            {/* Clinic header */}
            <header className="flex items-start justify-between gap-4 border-b border-[#DCE4EE] pb-7">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src="/brandicon.png"
                  alt="Dhruwraj Logo"
                  className="h-12 w-12 shrink-0 object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />

                <div className="min-w-0">
                  <h1 className="break-words text-base font-extrabold tracking-tight text-[#172238] sm:text-xl">
                    {clinic.name ||
                      "DHRUWRAJ AYURVEDA & PANCHKARMA"}
                  </h1>

                  <p className="mt-2 text-xs text-[#71839D] sm:text-sm">
                    {[clinic.location, clinic.city]
                      .filter(Boolean)
                      .join(", ") || "Kanpur"}
                  </p>

                  {clinic.phone && (
                    <p className="mt-1 text-xs text-[#71839D]">
                      Phone: {clinic.phone}
                    </p>
                  )}

                  {clinic.gstNumber &&
                    clinic.gstNumber !== "NA" && (
                      <p className="mt-1 text-xs text-[#71839D]">
                        GSTIN: {clinic.gstNumber}
                      </p>
                    )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#91A6C2] sm:text-[13px]">
                  Invoice
                </p>

                <p className="mt-1 break-all text-sm font-extrabold text-[#172238] sm:text-lg">
                  #{invoice.invoiceId || "—"}
                </p>

                <p className="mt-1 text-xs text-[#667A96]">
                  {formatDate(invoice.createdAt)}
                </p>
              </div>
            </header>

            {/* Patient and payment details */}
            <div className="mt-7 grid grid-cols-1 gap-5 rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] px-4 py-4 sm:grid-cols-2 sm:px-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#91A6C2]">
                  Bill To
                </p>

                <p className="mt-2 break-words text-sm font-extrabold text-[#172238]">
                  {patientName}
                </p>

                {invoice.mobileNo && (
                  <p className="mt-1 text-xs text-[#667A96]">
                    Mobile: {invoice.mobileNo}
                  </p>
                )}

                <p className="mt-2 break-words text-xs text-[#667A96]">
                  <span className="font-bold text-[#30415D]">
                    Patient ID:{" "}
                  </span>
                  {patientCode}
                </p>

                <p className="mt-1 break-words text-xs text-[#667A96]">
                  <span className="font-bold text-[#30415D]">
                    Address:{" "}
                  </span>
                  {patientAddress}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#91A6C2]">
                  Payment Info
                </p>

                <p className="mt-2 text-sm font-extrabold text-[#172238]">
                  {paymentLabel || "Cash"}
                </p>

                <p className="mt-1 text-xs text-[#667A96]">
                  Invoice generated successfully
                </p>
              </div>
            </div>

            {/* Item sections */}
            {renderRows(
              consultationItems,
              "Consultation Fees"
            )}

            {renderRows(
              therapyItems,
              "Panchkarma & Therapies"
            )}

            {renderRows(
              medicineItems,
              "Pharmacy Dispersals"
            )}

            {renderRows(
              ayurvedicItems,
              "Ayurvedic Medicines"
            )}

            {!items.length && (
              <p className="mt-8 text-sm text-slate-500">
                No invoice items found.
              </p>
            )}

            {/* Totals */}
            <div className="mt-8 border-t border-[#DCE4EE] pt-5">
              <div className="ml-auto w-full max-w-[280px] space-y-3 text-xs">
                <div className="flex justify-between gap-4 text-[#667A96]">
                  <span>Gross / Taxable Value</span>
                  <span>{formatMoney(baseValue)}</span>
                </div>

                <div className="flex justify-between gap-4 text-[#667A96]">
                  <span>CGST</span>
                  <span>{formatMoney(cgst)}</span>
                </div>

                <div className="flex justify-between gap-4 text-[#667A96]">
                  <span>SGST</span>
                  <span>{formatMoney(sgst)}</span>
                </div>

                <div className="flex justify-between gap-4 text-green-600">
                  <span>Total Discount</span>
                  <span>- {formatMoney(discountValue)}</span>
                </div>

                <div className="flex justify-between gap-4 border-t border-[#DCE4EE] pt-4 text-base font-extrabold text-[#172238]">
                  <span>Grand Total</span>
                  <span>{formatMoney(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 border-t border-[#E5EBF2] pt-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#91A6C2]">
                Dhruwraj Ayurveda & Panchkarma
              </p>

              <p className="mt-2 text-[10px] italic text-[#91A6C2]">
                Computer-generated invoice. No physical signature required.
              </p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
};

export default InvoicePage;
