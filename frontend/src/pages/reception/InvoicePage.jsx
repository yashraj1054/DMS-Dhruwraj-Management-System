import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { ArrowDownToLine } from "lucide-react";

const InvoicePage = () => {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(
        `https://dms-backend-amber.vercel.app/api/bills/public/${id}`,
      );

      setInvoice(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!invoice) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
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

      <div className="bg-white w-full max-w-[550px] rounded-2xl overflow-hidden shadow-2xl mx-auto">
        <div id="printable-invoice" className="p-10 bg-white text-slate-800">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <img
                  src="/brandicon.png"
                  alt="Dhruwraj Logo"
                  className="h-20 w-20 object-contain"
                />
              </div>

              <div>
                <h1 className="text-[15px] font-black text-slate-900 uppercase">
                  {invoice.clinicId?.name || "Clinic"}
                </h1>

                <p className="text-[10px] text-slate-500 max-w-[200px] leading-tight mt-1">
                  {invoice.clinicId?.location || "Clinic Address"} -{" "}
                  {invoice.clinicId?.city || "City"}
                </p>

                <p className="text-[10px] font-bold text-teal-600 mt-1">
                  GSTIN: {invoice.clinicId?.gstNumber || "GSTIN"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-sm font-black text-slate-400 uppercase">
                Tax Invoice
              </h2>

              <p className="text-sm font-bold text-slate-900">
                #{invoice.invoiceId}
              </p>

              <p className="text-[10px] text-slate-500">
                {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
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
                {invoice.patientName}
              </p>

              <p className="text-slate-600 font-medium">
                +91 {invoice.mobileNo}
              </p>
            </div>

            <div className="text-right">
              <p className="text-slate-400 font-bold uppercase mb-1">
                Payment Method:
              </p>

              <p className="text-sm font-black text-slate-800">
                {invoice.paymentMethod}
              </p>
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
              {invoice.items?.map((item, idx) => (
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

                  <td className="py-3 text-right font-bold">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-[200px] space-y-2 border-t-2 border-slate-900 pt-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Gross Total</span>

                <span className="font-bold text-slate-700">
                  ₹
                  {invoice.items
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
                  {invoice.items
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

              <div className="flex justify-between text-[11px] text-green-600">
                <span className="font-medium">Total Savings</span>

                <span className="font-bold">
                  - ₹
                  {invoice.items
                    .reduce(
                      (acc, curr) =>
                        acc +
                        curr.price * (curr.qty || 1) * (curr.discount / 100),
                      0,
                    )
                    .toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-md font-black text-slate-900 border-t border-dashed border-slate-200 pt-2">
                <span>Grand Total</span>

                <span>₹{invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
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

        {/* Buttons */}
        <div className="p-4 bg-slate-900 flex gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="
      flex-1 bg-teal-500 hover:bg-teal-400 text-white py-3 px-4 cursor-pointer rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowDownToLine className="w-4 h-4" />

            <span>Download Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
