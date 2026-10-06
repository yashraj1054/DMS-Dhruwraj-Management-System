import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { Printer } from "lucide-react";

export default function PublicPrescription() {

  const { patientId } = useParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // ================= FETCH =================

  const fetchPrescription = useCallback(async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL ||
          "http://localhost:5001"
        }/api/appointments/public/how-to-take/${patientId}`
      );

      setData(res.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }, [patientId]);

  useEffect(() => {

    fetchPrescription();

  }, [fetchPrescription]);

  // ================= PRINT =================

  const handlePrint = () => {

    window.print();

  };

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-2xl font-bold">

        Loading...

      </div>

    );

  }

  const patient = data?.patient || {};

  const howToTake =
    data?.formData?.howToTake ||
    data?.howToTake ||
    {};

  return (

    <div className="bg-[#dfe5eb] min-h-screen py-10 px-4">

      {/* ACTIONS */}
      <div className="max-w-[210mm] mx-auto flex justify-end mb-4 print:hidden">

        <button
          onClick={handlePrint}
          className="
            bg-green-700
            hover:bg-green-800
            text-white
            px-6
            py-3
            rounded-lg
            font-bold
            flex
            items-center
            gap-2
            shadow-lg
          "
        >
          <Printer size={18} />
          Print Prescription
        </button>

      </div>

      {/* PAPER */}
      <div
        className="
          bg-[#fffefb]
          mx-auto
          shadow-2xl
          border
          relative
          print:shadow-none
        "
        style={{
          width: "210mm",
          minHeight: "297mm",
        }}
      >

        {/* ================= HEADER ================= */}

        <div className="bg-[#1d5c42] text-white px-6 py-4">

          <div className="flex justify-between items-start">

            {/* LEFT */}
            <div className="flex gap-4">

              {/* LOGO */}
              <div className="
                h-20
                w-20
                rounded-full
                overflow-hidden
                bg-white
                flex
                items-center
                justify-center
              ">

                <img
                  src="/brandicon.png"
                  alt="logo"
                  className="w-full h-full object-contain"
                />

              </div>

              <div>

                <h1 className="
                  text-4xl
                  font-black
                  uppercase
                  tracking-wide
                ">
                  DHRUWRAJ AYURVEDA
                </h1>

                <h2 className="
                  text-2xl
                  font-bold
                  uppercase
                  tracking-wide
                ">
                  & Panchkarma Clinic
                </h2>

                <p className="text-sm mt-1 opacity-90">
                  Ayurvedic & Panchkarma Specialist
                </p>

              </div>

            </div>

            {/* RIGHT */}
            <div className="text-right">

              <h2 className="text-2xl font-black">
                Dr. AMREKHA PAL
              </h2>

              <p className="text-sm mt-1">
                B.H.M.S. (Agra)
              </p>

              <p className="text-sm">
                Ayurveda & Panchkarma Specialist
              </p>

            </div>

          </div>

        </div>

        {/* ================= PATIENT DETAILS ================= */}

        <div className="px-8 pt-6 text-[15px]">

          <div className="grid grid-cols-4 gap-5">

            <div>
              <span className="font-bold">
                Name:
              </span>{" "}

              <span className="
                border-b
                border-black
                inline-block
                min-w-[150px]
                ml-2
                pb-1
              ">
                {patient?.name || "____________"}
              </span>
            </div>

            <div>
              <span className="font-bold">
                Age/Sex:
              </span>{" "}

              <span className="
                border-b
                border-black
                inline-block
                min-w-[100px]
                ml-2
                pb-1
              ">
                {patient?.age || "--"} / M
              </span>
            </div>

            <div>
              <span className="font-bold">
                Date:
              </span>{" "}

              <span className="
                border-b
                border-black
                inline-block
                min-w-[120px]
                ml-2
                pb-1
              ">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="font-bold">
                Weight:
              </span>{" "}

              <span className="
                border-b
                border-black
                inline-block
                min-w-[100px]
                ml-2
                pb-1
              ">
                {patient?.weight || "--"} Kg
              </span>
            </div>

          </div>

        </div>

        {/* ================= COMPLAINTS ================= */}

        <div className="px-8 mt-6">

          <div className="flex gap-10">

            {/* LEFT */}
            <div className="flex-1">

              <p className="font-bold mb-2">
                Chief Complaints:
              </p>

              <div className="
                border-b
                border-dashed
                border-black
                pb-2
                min-h-[70px]
                leading-8
                text-[15px]
              ">

                {patient?.complaints ||
                  "Gas, Acidity, Constipation, Weak Digestion"}

              </div>

            </div>

            {/* RIGHT */}
            <div className="w-[220px] text-[15px]">

              <div className="space-y-2">

                <div className="flex justify-between">
                  <span className="font-bold">
                    B.P.
                  </span>

                  <span>
                    Normal
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-bold">
                    Thyroid
                  </span>

                  <span>
                    No
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-bold">
                    Diabetes
                  </span>

                  <span>
                    No
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= RX ================= */}

        <div className="px-8 mt-8">

          {/* RX */}
          <div className="text-6xl font-bold mb-4">
            ℞
          </div>

          {/* CHURAN */}
          {(howToTake?.churan || []).length > 0 && (

            <div className="mb-8">

              <h2 className="
                text-2xl
                font-black
                border-b
                border-black
                inline-block
                mb-4
              ">
                चूर्ण
              </h2>

              <div className="space-y-4">

                {(howToTake?.churan || []).map((item, idx) => (

                  <div
                    key={idx}
                    className="
                      text-[18px]
                      leading-8
                    "
                  >

                    <div className="flex gap-3">

                      <span className="font-bold">
                        {idx + 1}.
                      </span>

                      <div>

                        <p className="font-semibold">
                          {item.name}
                        </p>

                        <p className="text-[15px] text-slate-700">

                          {item.time} • {item.quantity}

                          {" "}• {item.with}

                          {" "}• {item.duration}

                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

          {/* TABLETS */}
          {(howToTake?.tablets || []).length > 0 && (

            <div className="mb-8">

              <h2 className="
                text-2xl
                font-black
                border-b
                border-black
                inline-block
                mb-4
              ">
                टैबलेट
              </h2>

              <div className="space-y-4">

                {(howToTake?.tablets || []).map((item, idx) => (

                  <div
                    key={idx}
                    className="
                      text-[18px]
                      leading-8
                    "
                  >

                    <div className="flex gap-3">

                      <span className="font-bold">
                        {idx + 1}.
                      </span>

                      <div>

                        <p className="font-semibold">
                          {item.name}
                        </p>

                        <p className="text-[15px] text-slate-700">

                          {item.time} • {item.quantity}

                          {" "}• {item.with}

                          {" "}• {item.duration}

                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

        {/* ================= ADVICE ================= */}

        <div className="px-8 mt-10">

          <h2 className="
            text-xl
            font-black
            mb-3
          ">
            Advice:
          </h2>

          <ul className="
            list-disc
            pl-6
            text-[15px]
            leading-8
          ">

            <li>
              समय पर औषध सेवन करें।
            </li>

            <li>
              तला-भुना एवं मसालेदार भोजन कम लें।
            </li>

            <li>
              पर्याप्त मात्रा में पानी पिएं।
            </li>

            <li>
              रात को देर तक जागने से बचें।
            </li>

          </ul>

        </div>

        {/* ================= SIGNATURE ================= */}

        <div className="
          px-8
          mt-16
          flex
          justify-end
        ">

          <div className="text-center">

            <div className="
              h-[80px]
              w-[200px]
              border-b
              border-black
            " />

            <p className="mt-2 font-semibold">
              Doctor Signature
            </p>

          </div>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="
          absolute
          bottom-0
          left-0
          right-0
          bg-[#1d5c42]
          text-white
          px-8
          py-3
        ">

          <div className="
            flex
            justify-between
            items-center
            text-sm
          ">

            <p>
              20 A, Zoo Road, Vikas Nagar,
              Kanpur (U.P.)
            </p>

            <p className="font-semibold">
              Kindly Bring This Paper During Follow Up
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}