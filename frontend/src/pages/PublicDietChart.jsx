import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { Printer } from "lucide-react";

export default function PublicDietChart() {
  const { patientId } = useParams();

  // SAFE USER PARSE
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch (error) {
    console.error("Invalid user JSON in localStorage");
    user = {};
  }

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH FUNCTION
  const fetchDietChart = useCallback(async () => {
    try {
      if (!patientId) return;

      setLoading(true);

      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL || "https://dms-backend-amber.vercel.app"
        }/api/appointments/public/diet-chart/${patientId}`,
      );

      console.log("PUBLIC DIET DATA => ", res.data);

      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch diet chart:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchDietChart();
  }, [fetchDietChart]);

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    );
  }

  // NO DATA
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        No diet chart found.
      </div>
    );
  }

  // NORMALIZED DIET DATA
  const dietChartData =
    data?.formData?.dietChart ||
    data?.dietChart ||
    data?.patient?.dietChart ||
    {};

  // PRINT FUNCTION
  const handlePrint = () => {
    const printElement = document.getElementById("diet-chart-print");

    if (!printElement) return;

    const printContents = printElement.innerHTML;

    const printWindow = window.open("", "", "width=1200,height=900");

    // POPUP BLOCKED
    if (!printWindow) {
      alert("Popup blocked. Please allow popups.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Diet Chart</title>

          <script src="https://cdn.tailwindcss.com"></script>

          <style>
            body {
              font-family: sans-serif;
              background: white;
              padding: 20px;
            }

            .diet-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>

        <body>
          <div style="width:210mm;margin:auto;">
            ${printContents}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // FOOD SECTIONS
  const sections = [
    {
      title: "अनाज",
      key: "grains",
      items: ["गेहूं", "ज्वार", "बाजरा", "मक्का", "चावल", "दलिया"],
    },
    {
      title: "आटा",
      key: "flour",
      items: ["मैदा", "बेसन"],
    },
    {
      title: "मेवे",
      key: "dryFruits",
      items: [
        "मूंगफली",
        "बादाम",
        "भीगे बादाम",
        "काजू",
        "किशमिश",
        "पिस्ता",
        "मुनक्का",
        "अंजीर",
        "अखरोट",
      ],
    },
    {
      title: "दाल",
      key: "pulses",
      items: [
        "मूंग छिलका",
        "अरहर",
        "साबुत मसूर",
        "मसूर",
        "साबुत उड़द",
        "उड़द छिलका",
        "चना",
        "छोले",
        "राजमा",
        "लोबिया",
        "सोयाबीन",
      ],
    },
    {
      title: "सब्जियां",
      key: "vegetables",
      items: [
        "मेथी",
        "पेठा",
        "सेम",
        "बथुआ",
        "गाजर",
        "आलू",
        "पालक",
        "टींडा",
        "मटर",
        "टमाटर",
        "सरसों",
        "तरोई",
        "करेला",
        "नींबू",
        "प्याज",
        "पत्ता गोभी",
        "परवल",
        "कटहल",
        "लहसुन",
        "गोभी",
        "शलगम",
        "भिंडी",
        "शिमला मिर्च",
        "लौकी",
        "बैंगन",
        "अरबी",
        "ग्वार की फली",
        "चुकंदर",
        "कद्दू",
      ],
    },
    {
      title: "फल",
      key: "fruits",
      items: [
        "सेब",
        "अनार",
        "अनानास",
        "संतरा",
        "केला",
        "अंगूर",
        "चीकू",
        "आम",
        "अमरूद",
        "पपीता",
        "तरबूज",
        "लीची",
        "खरबूजा",
        "आड़ू",
        "नाशपाती",
        "मोसंबी",
      ],
    },
    {
      title: "पेय पदार्थ",
      key: "drinks",
      items: [
        "गुनगुना पानी",
        "पानी",
        "ठंडाई",
        "शिकंजी",
        "कार्बन युक्त पेय",
        "नारियल पानी",
        "चाय",
        "कॉफी",
        "आयुर्वेदिक चाय",
        "फलों का रस",
        "सब्जियों का सूप",
        "सब्जियों का रस",
      ],
    },
    {
      title: "दुग्ध उत्पाद",
      key: "dairy",
      items: [
        "ठंडा दूध",
        "गरम दूध",
        "क्रीम सहित दूध",
        "क्रीम रहित दूध",
        "गाय का दूध",
        "भैंस का दूध",
        "बकरी का दूध",
        "मट्ठा",
        "दही",
        "पनीर",
        "देसी घी",
      ],
    },
    {
      title: "मसाले",
      key: "spices",
      items: [
        "लाल मिर्च",
        "हरी मिर्च",
        "हल्दी",
        "धनिया",
        "अजवाइन",
        "लौंग",
        "सोंठ",
        "जीरा",
        "छोटी इलाइची",
        "बड़ी इलाइची",
        "काला नमक",
        "सेंधा नमक",
        "तेज pत्ता",
        "खटाई/इमली",
        "जयफल",
        "अचार",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-[#eef2f7] z-[100] overflow-y-auto p-6">
      {/* ACTION BAR */}
      <div
        className="
          max-w-[210mm]
          mx-auto
          mb-4
          flex
          justify-end
          gap-3
          print:hidden
        "
      >
        {/* PRINT BUTTON */}
        <button
          onClick={handlePrint}
          className="
            h-12
            px-5
            rounded-xl
            bg-black
            text-white
            font-bold
            flex
            items-center
            gap-2
            shadow-md
            hover:opacity-90
            transition
          "
        >
          <Printer size={18} />
          Print
        </button>
      </div>

      {/* A4 SHEET */}
      <div
        id="diet-chart-print"
        className="
          bg-white
          mx-auto
          shadow-2xl
          print:shadow-none
        "
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "10mm",
        }}
      >
        {/* HEADER */}
        <div
          className="
            flex
            justify-between
            items-start
            border-b-4
            border-[#d4a017]
            pb-4
            mb-5
          "
        >
          {/* LEFT */}
          <div className="flex gap-4">
            <div
              className="
                h-20
                w-20
                rounded-full
                overflow-hidden
                border
                bg-white
                flex
                items-center
                justify-center
              "
            >
              <img
                src="/brandicon.png"
                alt="Clinic Logo"
                className="w-[140px] h-[140px] object-contain"
              />
            </div>

            <div>
              <h1
                className="
                  text-4xl
                  font-black
                  tracking-tight
                  leading-none
                "
              >
                आयुर्वेदिक डाइट चार्ट
              </h1>

              <p className="text-gray-500 mt-2 text-sm">
                Personalized Ayurvedic Diet Recommendation
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="text-right text-sm">
            <p className="font-bold text-lg">
              {user?.clinicName || "Dhruwraj Health Care"}
            </p>
          </div>
        </div>

        {/* PATIENT INFO */}
        <div
          className="
            grid
            grid-cols-4
            gap-4
            bg-[#f8fafc]
            border
            rounded-2xl
            p-4
            mb-5
            text-sm
          "
        >
          <div>
            <p className="text-gray-400">Patient</p>
            <p className="font-bold">{data?.patient?.name || "--"}</p>
          </div>

          <div>
            <p className="text-gray-400">Phone</p>
            <p className="font-bold">+91 {data?.patient?.phone || "--"}</p>
          </div>

          <div>
            <p className="text-gray-400">Patient ID</p>
            <p className="font-bold">{data?.patient?.patientId || "--"}</p>
          </div>

          <div>
            <p className="text-gray-400">Age</p>
            <p className="font-bold">{data?.patient?.age || "--"} Years</p>
          </div>
        </div>

        {/* FOOD TABLE */}
        <div
          className="
            grid
            grid-cols-3
            gap-3
          "
        >
          {sections.map((section) => (
            <div
              key={section.key}
              className="
                diet-section
                border
                rounded-xl
                overflow-hidden
              "
            >
              {/* TITLE */}
              <div
                className="
                  bg-black
                  text-white
                  px-3
                  py-2
                  text-center
                  font-bold
                  text-sm
                "
              >
                {section.title}
              </div>

              {/* ITEMS */}
              <div
                className="
                  p-3
                  space-y-1.5
                  text-[13px]
                "
              >
                {section.items.map((item) => {
                  const checked =
                    dietChartData?.[section.key]?.includes(item) || false;

                  return (
                    <div
                      key={item}
                      className="
                        flex
                        items-start
                        gap-2
                      "
                    >
                      {checked ? (
                        <>
                          <input
                            type="checkbox"
                            checked={true}
                            readOnly
                            className="
                              mt-[2px]
                              h-3.5
                              w-3.5
                              accent-green-600
                            "
                          />

                          <span className="font-medium">{item}</span>
                        </>
                      ) : (
                        <>
                          <div
                            className="
                              mt-[2px]
                              h-3.5
                              w-3.5
                              border
                              border-red-400
                              flex
                              items-center
                              justify-center
                              text-[8px]
                              text-red-400
                            "
                          >
                            ✕
                          </div>

                          <span
                            className="
                              line-through
                              text-red-400
                            "
                          >
                            {item}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div
          className="
            mt-6
            border-t
            pt-4
            text-center
          "
        >
          <p
            className="
              text-xl
              font-black
            "
          >
            “उचित आहार ही स्वास्थ्य का पहला साधन है”
          </p>
        </div>
      </div>
    </div>
  );
}
