import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { Printer } from "lucide-react";

export default function PublicHowToTake() {
  const { patientId } = useParams();

  // SAFE USER PARSE
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch (error) {
    console.error("Invalid user JSON in localStorage");
    user = {};
  }

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // ================= FETCH DATA =================

  const fetchHowToTake = useCallback(async () => {
    try {
      if (!patientId) return;

      setLoading(true);

      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL || "https://dms-backend-amber.vercel.app"
        }/api/appointments/public/how-to-take/${patientId}`,
      );

      console.log("PUBLIC HOW TO TAKE DATA => ", res.data);

      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch how to take instructions:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchHowToTake();
  }, [fetchHowToTake]);

  // ================= PRINT FUNCTION =================

  const handlePrint = () => {
    const printElement = document.getElementById("how-to-take-print");

    if (!printElement) return;

    const printContents = printElement.innerHTML;

    const printWindow = window.open("", "", "width=1200,height=900");

    if (!printWindow) {
      alert("Popup blocked");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>How To Take</title>

          <script src="https://cdn.tailwindcss.com"></script>

          <style>

            body {
              font-family: sans-serif;
              background: white;
              padding: 20px;
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

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    );
  }

  // ================= NO DATA =================

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        No instructions found.
      </div>
    );
  }

  // ================= NORMALIZED DATA =================

  const howToTake = data?.formData?.howToTake || data?.howToTake || {};

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

      {/* ================= A4 SHEET ================= */}

      <div
        id="how-to-take-print"
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
        {/* ================= HEADER ================= */}

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
                औषध पैक लेने की विधि
              </h1>

              <p className="text-gray-500 mt-2 text-sm">
                Ayurvedic Medicine Instructions
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

        {/* ================= PATIENT INFO ================= */}

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

        {/* ================= DESCRIPTION ================= */}

        <div
          className="
            bg-[#ececec]
            border
            p-4
            text-[15px]
            font-semibold
            leading-8
            mb-8
          "
        >
          ये औषधियां/दवाइयां विशेष रूप से आपकी बताई हुई समस्याओं एवं लक्षणों के
          आधार पर दी गई हैं। इनमें पूर्णतः आयुर्वेदिक औषधि द्रव्यों का प्रयोग
          किया गया है। इनको लेने की विधि नीचे बताई गई है।
        </div>

        {/* ================= CHURAN SECTION ================= */}

        <div className="border-[2px] border-black">
          <div className="grid grid-cols-12">
            {/* LEFT */}
            <div
              className="
                col-span-2
                border-r-[2px]
                border-black
                bg-[#f5f5f5]
                p-3
                flex
                flex-col
                items-center
              "
            >
              <h2 className="text-4xl font-black mb-5">चूर्ण</h2>

              <img
                src="/images/churan.png"
                alt=""
                className="w-full object-contain"
              />
            </div>

            {/* TABLE */}
            <div className="col-span-8 p-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#ececec]">
                    {[
                      "(क्र.सं.)",
                      "दवा का नाम",
                      "कब - कब लेना है",
                      "कितनी मात्रा में",
                      "किसके साथ",
                      "कब तक",
                    ].map((h) => (
                      <th
                        key={h}
                        className="
                          border
                          border-black
                          p-2
                          text-xs
                          font-black
                        "
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {(howToTake?.churan || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-2 text-center font-bold">
                        {idx + 1}
                      </td>

                      <td className="border border-black p-2">{item.name}</td>

                      <td className="border border-black p-2">{item.time}</td>

                      <td className="border border-black p-2">
                        {item.quantity}
                      </td>

                      <td className="border border-black p-2">{item.with}</td>

                      <td className="border border-black p-2">
                        {item.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RIGHT */}
            <div
              className="
                col-span-2
                border-l-[2px]
                border-black
                p-3
                flex
                items-center
                justify-center
              "
            >
              <img
                src="/images/spoon-guide.png"
                alt=""
                className="w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* ================= TABLETS ================= */}

        <div
          className="
            border-x-[2px]
            border-b-[2px]
            border-black
          "
        >
          <div className="grid grid-cols-12">
            {/* LEFT */}
            <div
              className="
                col-span-2
                border-r-[2px]
                border-black
                bg-[#f5f5f5]
                p-3
                flex
                flex-col
                items-center
              "
            >
              <h2 className="text-4xl font-black mb-5">टैबलेट</h2>

              <img
                src="/images/tablet.png"
                alt=""
                className="w-full object-contain"
              />
            </div>

            {/* TABLE */}
            <div className="col-span-10 p-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#ececec]">
                    {[
                      "(क्र.सं.)",
                      "दवा का नाम",
                      "कब - कब लेना है",
                      "कितनी मात्रा में",
                      "किसके साथ",
                      "कब तक",
                    ].map((h) => (
                      <th
                        key={h}
                        className="
                          border
                          border-black
                          p-2
                          text-xs
                          font-black
                        "
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {(howToTake?.tablets || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-2 text-center font-bold">
                        {idx + 1}
                      </td>

                      <td className="border border-black p-2">{item.name}</td>

                      <td className="border border-black p-2">{item.time}</td>

                      <td className="border border-black p-2">
                        {item.quantity}
                      </td>

                      <td className="border border-black p-2">{item.with}</td>

                      <td className="border border-black p-2">
                        {item.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= LIFESTYLE INSTRUCTIONS ================= */}

        <div className="mt-10 border-[2px] border-black">
          {/* SECTION TITLE */}
          <div className="bg-black text-white text-center py-2">
            <h2 className="text-2xl font-black tracking-wide">
              व्यायाम एवं जीवन शैली
            </h2>
          </div>

          <div className="p-5">
            {/* TIPS */}
            <div className="mb-8">
              <div className="bg-black text-white text-center py-2 mb-4">
                <h3 className="font-bold text-lg">
                  जीवन शैली की प्रमुख बातें (टिप्स)
                </h3>
              </div>

              <ul className="list-disc pl-6 space-y-3 text-[15px] leading-7">
                <li>सुबह जल्दी उठने की आदत डालें।</li>

                <li>
                  सुबह उठते ही पहला कार्य यह करें कि दो से तीन गिलास पानी पिएं।
                  तांबे के बर्तन में रात भर रखा पानी अधिक लाभदायक होता है।
                  सर्दियों में गुनगुना पानी पिएं।
                </li>

                <li>नियमित ध्यान योग व व्यायाम करें।</li>

                <li>
                  प्राकृतिक वेगों को न रोकें जैसे मल, मूत्र, खांसी, छींक और यहां
                  तक कि रोना भी।
                </li>

                <li>ध्यान दें कि आप स्वच्छ हवा, उचित आराम व नींद लें।</li>

                <li>
                  सुबह व रात भोजन के बाद भ्रमण को अपनी दिनचर्या में शामिल करें।
                </li>

                <li>देर रात तक न जागें।</li>
              </ul>
            </div>

            {/* FOOD INSTRUCTIONS */}
            <div>
              <div className="bg-black text-white text-center py-2 mb-4">
                <h3 className="font-bold text-lg">
                  खाते समय ध्यान रखने योग्य कुछ बातें
                </h3>
              </div>

              <ul className="list-disc pl-6 space-y-3 text-[15px] leading-7">
                <li>
                  खाने का समय निर्धारित करें। दो समय के भोजन में कम से कम 4 घंटे
                  का अंतराल रखें।
                </li>

                <li>
                  ताजा व प्राकृतिक भोजन लें। पिज्जा, केक व फास्ट-फूड न खाएं।
                </li>

                <li>
                  पाचन शक्ति को ठीक रखने का सबसे आसान तरीका है अधिक खाने की आदत
                  को छोड़ना। पाचन प्रक्रिया को ठीक रखने के लिए भूख से कुछ कम
                  खाएं।
                </li>

                <li>रात को सोने से 2 घंटे पहले भोजन लें।</li>

                <li>दोपहर व रात को भोजन लेने से पहले थोड़ा घूमें।</li>

                <li>तला, भुना व चिकनाई युक्त भोजन न लें।</li>

                <li>
                  शराब, तम्बाकू, बीड़ी, सिगरेट व अन्य किसी नशीली वस्तुओं का सेवन
                  न करें।
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}

        <div
          className="
            mt-8
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
            “समय पर औषध सेवन ही स्वास्थ्य का आधार है”
          </p>
        </div>
      </div>
    </div>
  );
}
