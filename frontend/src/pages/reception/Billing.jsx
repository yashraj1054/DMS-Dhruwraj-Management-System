import React, { useState, useEffect } from "react";

import axios from "axios";

import Select from "react-select";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
  Trash2,
  Send,
} from "lucide-react";

const Billing = () => {
  // --- STATE MANAGEMENT ---

  const [bills, setBills] = useState([]);

  const [filteredBills, setFilteredBills] = useState([]);

  const [clinics, setClinics] = useState([]);

  const [inventory, setInventory] = useState([]);

  const [therapies, setTherapies] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const [viewInvoice, setViewInvoice] = useState(null);

  // --- PAGINATION CONFIGURATION ---

  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  const indexOfLast = currentPage * recordsPerPage;

  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentRecords = filteredBills.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredBills.length / recordsPerPage);

  const [generatedInvoiceId, setGeneratedInvoiceId] = useState("Loading...");

  const [cart, setCart] = useState([]);

  const [formData, setFormData] = useState({
    patientName: "",

    mobileNo: "",

    paymentMethod: "Cash Payment",

    clinicId: "",
  });

  // --- FORM INPUT FIELDS DATA ---

  const [activeMedicine, setActiveMedicine] = useState({
    name: "",
    price: "",
    qty: "",
    gst: 5,
    discount: "",
  });

  // =====================================================

  // AYURVEDIC MEDICINE STATES

  // =====================================================

  const [ayurvedicType, setAyurvedicType] = useState("");

  const [ayurvedicTab, setAyurvedicTab] = useState({
    name: "",

    pricePerTab: 0,

    qty: 1,

    gst: 5,

    discount: 0,
  });

  const [ayurvedicOil, setAyurvedicOil] = useState({
    name: "",

    pricePerMl: 0,

    qty: 1,

    gst: 5,

    discount: 0,
  });

  const [ayurvedicChuran, setAyurvedicChuran] = useState({
    bhasams: [],

    churans: [],
  });

  const MAX_BHASAM = 2;

  const MAX_CHURAN = 3;

  const [activeTherapy, setActiveTherapy] = useState({
    name: "",
    price: 0,
    discount: "",
  });

  const auth = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  // The logged-in user's assigned clinic is the source of truth for billing.
  const getUserClinicId = (userData) => {
    if (!userData?.clinic) return "";
    return typeof userData.clinic === "object"
      ? userData.clinic._id || userData.clinic.id || ""
      : userData.clinic;
  };

  // --- INITIAL DATA LOADING ---

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- LIVE FILTER / SEARCH LOGIC ---

  useEffect(() => {
    const res = bills.filter((b) => {
      const nameMatch = b.patientName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const dateMatch = new Date(b.createdAt)
        .toLocaleDateString()
        .includes(search);

      const idMatch = b.invoiceId?.toLowerCase().includes(search.toLowerCase());

      const mobileMatch = b.mobileNo
        ?.toLowerCase()
        .includes(search.toLowerCase());

      return nameMatch || dateMatch || idMatch || mobileMatch;
    });

    setFilteredBills(res);
  }, [search, bills]);

  // Reset page number on filter changes

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchInitialData = async () => {
    try {
      const [clinicRes, billRes, therapyRes] = await Promise.all([
        axios.get("https://dms-backend-amber.vercel.app/api/clinics", auth),
        axios.get("https://dms-backend-amber.vercel.app/api/bills", auth),
        axios.get("https://dms-backend-amber.vercel.app/api/therapies", auth),
      ]);

      const clinicList = Array.isArray(clinicRes.data)
        ? clinicRes.data
        : clinicRes.data?.clinics || [];

      const allBillsData = Array.isArray(billRes.data)
        ? billRes.data
        : billRes.data?.bills || [];

      const therapyList = Array.isArray(therapyRes.data)
        ? therapyRes.data
        : therapyRes.data?.therapies || [];

      setClinics(clinicList);
      setTherapies(therapyList);

      // Automatically get the clinic assigned to the logged-in user.
      const storedUser = localStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      setCurrentUser(userData);

      const myClinicId = getUserClinicId(userData);

      if (!myClinicId) {
        console.error("No clinic assigned to logged-in user.");
        setBills([]);
        setFilteredBills([]);
        setInventory([]);
        return;
      }

      const myClinic = clinicList.find(
        (clinic) => String(clinic._id) === String(myClinicId),
      );

      if (!myClinic) {
        console.error("Assigned clinic was not found.");
        setBills([]);
        setFilteredBills([]);
        setInventory([]);
        return;
      }

      // Reception-style behaviour: only this clinic's bills are shown.
      const clinicBills = allBillsData.filter(
        (bill) =>
          String(bill.clinicId?._id || bill.clinicId) === String(myClinic._id),
      );

      setBills(clinicBills);
      setFilteredBills(clinicBills);

      // Clinic is auto-filled; it is never selected manually.
      setFormData((prev) => ({
        ...prev,
        clinicId: myClinic._id,
      }));

      // Generate the next invoice number from this clinic.
      const prefix = myClinic.invoicePrefix || "INV";
      setGeneratedInvoiceId(
        `${prefix}${String(clinicBills.length + 1).padStart(4, "0")}`,
      );

      // Load inventory for the same clinic.
      const inventoryRes = await axios.get(
        `https://dms-backend-amber.vercel.app/api/medicine/clinic/${myClinic._id}`,
        auth,
      );

      setInventory(
        Array.isArray(inventoryRes.data)
          ? inventoryRes.data
          : inventoryRes.data?.medicines || inventoryRes.data?.inventory || [],
      );
    } catch (err) {
      console.error("Data Fetch Error:", err);
      alert(
        "Unable to load billing data: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleWhatsAppShare = () => {
    const mobile = viewInvoice.mobileNo;

    const message = `Hello ${viewInvoice.patientName},\n\nYour invoice has been generated successfully.\n\nInvoice ID: ${viewInvoice.invoiceId}\nAmount: ₹${viewInvoice.totalAmount}\n\nDownload Invoice:\nhttp://localhost:5173/invoice/${viewInvoice._id}\n\nThank you.`;

    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/91${mobile}?text=${encodedMessage}`, "_blank");
  };

  const handleMedicineChange = (selected) => {
    if (selected) {
      setActiveMedicine({
        ...activeMedicine,

        _id: selected._id,

        name: selected.name,

        price: selected.mrp,

        discount: selected.discount || 0,

        qty: 1,
      });
    }
  };

  // =====================================================
  // AYURVEDIC INVENTORY OPTIONS
  // =====================================================
  // Inventory categories are the same values used by the Inventory module:
  // Ayurvedic Tabs -> Piece, Ayurvedic Churans & Bhasams -> Grams,
  // Ayurvedic Oils -> ML.
  const ayurvedicInventory = Array.isArray(inventory)
    ? inventory.filter((item) => Number(item.quantity) > 0)
    : [];

  const ayurvedicTabs = ayurvedicInventory
    .filter((item) => item.category === "Ayurvedic Tabs")
    .map((item) => ({
      ...item,
      id: item._id,
      pricePerTab: Number(item.mrp || 0),
      stock: Number(item.quantity || 0),
    }));

  const ayurvedicOils = ayurvedicInventory
    .filter((item) => item.category === "Ayurvedic Oils")
    .map((item) => ({
      ...item,
      id: item._id,
      pricePerMl: Number(item.mrp || 0),
      stock: Number(item.quantity || 0),
    }));

  const ayurvedicBhasams = ayurvedicInventory
    .filter(
      (item) =>
        item.category === "Ayurvedic Churans & Bhasams" &&
        String(item.ayurvedicSubtype || "").toLowerCase() === "bhasam",
    )
    .map((item) => ({
      ...item,
      id: item._id,
      pricePerGram: Number(item.mrp || 0),
      stock: Number(item.quantity || 0),
    }));

  const ayurvedicChurans = ayurvedicInventory
    .filter(
      (item) =>
        item.category === "Ayurvedic Churans & Bhasams" &&
        String(item.ayurvedicSubtype || "").toLowerCase() === "churan",
    )
    .map((item) => ({
      ...item,
      id: item._id,
      pricePerGram: Number(item.mrp || 0),
      stock: Number(item.quantity || 0),
    }));

  const addToCart = (item, category) => {
    if (!item.name || Number(item.price) < 0) return;

    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const gst = Number(item.gst) || 0;
    const discount = Number(item.discount) || 0;

    // Inventory-backed items must never exceed the currently loaded stock.
    if (item.inventoryId) {
      const availableStock = Number(item.availableStock ?? item.stock ?? 0);

      if (qty <= 0) {
        alert("Please enter a valid quantity.");
        return;
      }

      if (qty > availableStock) {
        alert(
          `Only ${availableStock} ${item.unit || "units"} of ${item.name} are available in stock.`,
        );
        return;
      }

      // Also account for the same inventory item already present in the cart.
      const alreadyInCart = cart
        .filter((cartItem) => cartItem.inventoryId === item.inventoryId)
        .reduce((sum, cartItem) => sum + Number(cartItem.qty || 0), 0);

      if (alreadyInCart + qty > availableStock) {
        alert(
          `Only ${availableStock} ${item.unit || "units"} of ${item.name} are available. ` +
            `${alreadyInCart} ${item.unit || "units"} are already in the cart.`,
        );
        return;
      }
    }

    const base = price * qty;
    const discountAmount = base * (discount / 100);
    const afterDiscount = base - discountAmount;
    const total = afterDiscount + afterDiscount * (gst / 100);

    setCart((prev) => [
      ...prev,
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

  // =====================================================
  // AYURVEDIC HELPERS
  // =====================================================

  const addBhasam = () => {
    if (ayurvedicChuran.bhasams.length >= MAX_BHASAM) {
      alert("Maximum 2 Bhasams can be added.");
      return;
    }

    setAyurvedicChuran((prev) => ({
      ...prev,
      bhasams: [
        ...prev.bhasams,
        {
          id: `bhasam-${Date.now()}-${Math.random()}`,
          name: "",
          pricePerGram: 0,
          qty: 1,
        },
      ],
    }));
  };

  const addChuran = () => {
    if (ayurvedicChuran.churans.length >= MAX_CHURAN) {
      alert("Maximum 3 Churans can be added.");
      return;
    }

    setAyurvedicChuran((prev) => ({
      ...prev,
      churans: [
        ...prev.churans,
        {
          id: `churan-${Date.now()}-${Math.random()}`,
          name: "",
          pricePerGram: 0,
          qty: 1,
        },
      ],
    }));
  };

  const removeBhasam = (id) => {
    setAyurvedicChuran((prev) => ({
      ...prev,
      bhasams: prev.bhasams.filter((item) => item.id !== id),
    }));
  };

  const removeChuran = (id) => {
    setAyurvedicChuran((prev) => ({
      ...prev,
      churans: prev.churans.filter((item) => item.id !== id),
    }));
  };

  const updateBhasam = (id, field, value) => {
    setAyurvedicChuran((prev) => ({
      ...prev,
      bhasams: prev.bhasams.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateChuran = (id, field, value) => {
    setAyurvedicChuran((prev) => ({
      ...prev,
      churans: prev.churans.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addAyurvedicTabToCart = () => {
    if (!ayurvedicTab.name) {
      alert("Please select an Ayurvedic Tablet.");
      return;
    }

    const qty = Number(ayurvedicTab.qty);
    const price = Number(ayurvedicTab.pricePerTab);
    const stock = Number(ayurvedicTab.stock || 0);

    if (!qty || qty <= 0) {
      alert("Please enter a valid tablet quantity.");
      return;
    }

    if (price < 0) {
      alert("Invalid tablet price.");
      return;
    }

    if (qty > stock) {
      alert(`Only ${stock} tablets are available in stock.`);
      return;
    }

    addToCart(
      {
        _id: ayurvedicTab._id,
        inventoryId: ayurvedicTab._id,
        inventoryCategory: "Ayurvedic Tabs",
        ayurvedicSubtype: "Tab",
        name: ayurvedicTab.name,
        price,
        qty,
        unit: "Tab",
        pricePerUnit: price,
        availableStock: stock,
        gst: Number(ayurvedicTab.gst),
        discount: Number(ayurvedicTab.discount),
      },
      "Ayurvedic Tab",
    );

    setAyurvedicTab({
      name: "",
      pricePerTab: 0,
      qty: 1,
      gst: 5,
      discount: 0,
    });
  };

  const addAyurvedicOilToCart = () => {
    if (!ayurvedicOil.name) {
      alert("Please select an Ayurvedic Oil.");
      return;
    }

    const qty = Number(ayurvedicOil.qty);
    const price = Number(ayurvedicOil.pricePerMl);
    const stock = Number(ayurvedicOil.stock || 0);

    if (!qty || qty <= 0) {
      alert("Please enter a valid oil quantity.");
      return;
    }

    if (price < 0) {
      alert("Invalid oil price.");
      return;
    }

    if (qty > stock) {
      alert(`Only ${stock} ml is available in stock.`);
      return;
    }

    addToCart(
      {
        _id: ayurvedicOil._id,
        inventoryId: ayurvedicOil._id,
        inventoryCategory: "Ayurvedic Oils",
        ayurvedicSubtype: "Oil",
        name: ayurvedicOil.name,
        price,
        qty,
        unit: "ml",
        pricePerUnit: price,
        pricePerMl: price,
        availableStock: stock,
        gst: Number(ayurvedicOil.gst),
        discount: Number(ayurvedicOil.discount),
      },
      "Ayurvedic Oil",
    );

    setAyurvedicOil({
      name: "",
      pricePerMl: 0,
      qty: 1,
      gst: 5,
      discount: 0,
    });
  };

  const addAyurvedicChuranToCart = () => {
    const allIngredients = [
      ...ayurvedicChuran.bhasams,
      ...ayurvedicChuran.churans,
    ];

    if (allIngredients.length === 0) {
      alert("Please add at least one Bhasam or Churan.");
      return;
    }

    const invalidIngredient = allIngredients.find(
      (item) =>
        !item.inventoryId ||
        !item.name ||
        Number(item.qty) <= 0 ||
        Number(item.pricePerGram) < 0 ||
        Number(item.qty) > Number(item.stock || 0),
    );

    if (invalidIngredient) {
      alert(
        "Please select all Churans/Bhasams and make sure each requested quantity is within available stock.",
      );
      return;
    }

    // Prevent the same inventory item from being selected multiple times
    // and collectively exceeding its stock.
    const requestedByInventory = allIngredients.reduce((acc, item) => {
      const id = String(item.inventoryId);
      acc[id] = (acc[id] || 0) + Number(item.qty || 0);
      return acc;
    }, {});

    const overStock = allIngredients.find(
      (item) =>
        requestedByInventory[String(item.inventoryId)] >
        Number(item.stock || 0),
    );

    if (overStock) {
      alert(
        `${overStock.name}: requested ${requestedByInventory[String(overStock.inventoryId)]} gm, ` +
          `but only ${Number(overStock.stock || 0)} gm is available.`,
      );
      return;
    }

    const normalizedIngredients = allIngredients.map((item) => ({
      ...item,
      inventoryCategory: "Ayurvedic Churans & Bhasams",
      ayurvedicSubtype:
        item.ayurvedicSubtype ||
        (ayurvedicChuran.bhasams.some((b) => b.id === item.id)
          ? "Bhasam"
          : "Churan"),
      type:
        item.type ||
        (ayurvedicChuran.bhasams.some((b) => b.id === item.id)
          ? "Bhasam"
          : "Churan"),
      unit: "gm",
    }));

    const totalGm = normalizedIngredients.reduce(
      (sum, item) => sum + Number(item.qty),
      0,
    );

    const totalPrice = normalizedIngredients.reduce(
      (sum, item) => sum + Number(item.qty) * Number(item.pricePerGram),
      0,
    );

    if (!totalGm || totalGm <= 0) {
      alert("Total Churan quantity must be greater than 0.");
      return;
    }

    const averagePricePerGram = totalPrice / totalGm;

    const churanName = normalizedIngredients
      .map((item) => item.name)
      .join(" + ");

    // Existing addToCart calculates price × qty.
    // For a mixed Churan, price is the weighted average ₹/gm
    // and qty is total grams, so the final total remains exact.
    addToCart(
      {
        name: `Ayurvedic Churan - ${churanName}`,
        price: Number(averagePricePerGram.toFixed(4)),
        qty: Number(totalGm.toFixed(3)),
        unit: "gm",
        pricePerUnit: Number(averagePricePerGram.toFixed(2)),
        pricePerGram: Number(averagePricePerGram.toFixed(4)),
        totalGm: Number(totalGm.toFixed(3)),
        ingredients: normalizedIngredients,
        gst: 5,
        discount: 0,
      },
      "Ayurvedic Churan",
    );

    setAyurvedicChuran({
      bhasams: [],
      churans: [],
    });
  };

  const handlePrintInvoice = () => {
    const invoiceElement = document.getElementById("printable-invoice");

    if (!invoiceElement) {
      alert("Invoice preview not found.");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const printDocument =
      iframe.contentDocument || iframe.contentWindow.document;
    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    const invoiceHTML = invoiceElement.outerHTML;
    const invoiceId = viewInvoice?.invoiceId || "Invoice";
    let printed = false;

    const cleanup = () => {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1000);
    };

    const startPrint = () => {
      if (printed) return;
      printed = true;

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } finally {
          cleanup();
        }
      }, 250);
    };

    printDocument.open();
    printDocument.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Tax Invoice - ${invoiceId}</title>
          ${styles}
          <style>
            @page { size: A4 portrait; margin: 0; }
            * {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
              min-width: 210mm !important;
              background: #fff !important;
            }
            body { overflow: visible !important; }
            #printable-invoice {
              position: relative !important;
              display: block !important;
              width: 210mm !important;
              min-width: 210mm !important;
              max-width: 210mm !important;
              min-height: 297mm !important;
              height: auto !important;
              margin: 0 !important;
              padding: 14mm 16mm 12mm 16mm !important;
              background: #fff !important;
              overflow: visible !important;
              border: 0 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              transform: none !important;
            }
            .no-print { display: none !important; }
            img { display: block !important; max-width: 100% !important; }
            table { width: 100% !important; border-collapse: collapse !important; }
            tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
          </style>
        </head>
        <body>${invoiceHTML}</body>
      </html>
    `);
    printDocument.close();

    const images = Array.from(printDocument.images || []);
    if (!images.length) {
      startPrint();
      return;
    }

    let remaining = images.length;
    const imageDone = () => {
      remaining -= 1;
      if (remaining <= 0) startPrint();
    };

    images.forEach((img) => {
      if (img.complete) imageDone();
      else {
        img.onload = imageDone;
        img.onerror = imageDone;
      }
    });

    setTimeout(startPrint, 2000);
  };

  const handleGenerateBill = async () => {
    if (!formData.patientName || cart.length === 0) {
      alert("Please add patient details and items to cart");

      return;
    }

    // Always resolve the clinic from the logged-in user when generating.
    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const myClinicId = getUserClinicId(userData);

    if (!myClinicId) {
      alert("No clinic is assigned to the logged-in user.");
      return;
    }

    const myClinic = clinics.find(
      (clinic) => String(clinic._id) === String(myClinicId),
    );

    if (!myClinic) {
      alert("Assigned clinic could not be found.");
      return;
    }

    const clinicBills = bills.filter(
      (bill) =>
        String(bill.clinicId?._id || bill.clinicId) === String(myClinic._id),
    );

    const prefix = myClinic.invoicePrefix || "INV";
    const invoiceId = `${prefix}${String(clinicBills.length + 1).padStart(4, "0")}`;

    try {
      const cleanedPaymentMethod = formData.paymentMethod.includes(" ")
        ? formData.paymentMethod.split(" ")[0]
        : formData.paymentMethod;

      const payload = {
        ...formData,

        invoiceId,

        clinicId: myClinic._id,

        paymentMethod: cleanedPaymentMethod,

        totalAmount: Number(
          cart.reduce((sum, item) => sum + item.total, 0).toFixed(2),
        ),

        items: cart.map((item) => ({
          ...item,

          price: Number(item.price),

          qty: Number(item.qty),

          discount: Number(item.discount),

          gst: Number(item.gst),

          total: Number(item.total),
        })),
      };

      const response = await axios.post(
        "https://dms-backend-amber.vercel.app/api/bills/generate",
        payload,
        auth,
      );

      if (response.data) {
        setShowModal(false);

        setCart([]);

        fetchInitialData();

        setViewInvoice(response.data);
      }
    } catch (err) {
      console.error("Submission Error:", err.response?.data);

      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  // Separate cart content categories for display mapping

  const consultationItems =
    viewInvoice?.items?.filter((item) => item.category === "Consultation") ||
    [];

  const therapyItems =
    viewInvoice?.items?.filter((item) => item.category === "Therapy") || [];

  const medicineItems =
    viewInvoice?.items?.filter((item) => item.category === "Medicine") || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 text-slate-600">
      {/* PAGE HEADER OVERVIEW */}

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Billing
            </h2>

            <p className="text-xs text-slate-400 font-medium">
              Manage Clinic Invoices
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                placeholder="Search Name or ID..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium text-slate-800"
              />
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Generate Bill
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD BILL HISTORY VIEW TABLE */}

      <div className="w-full mb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                    Invoice ID
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                    Patient
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                    Mobile
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                    Issue Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold text-slate-500">
                    Total Amount
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {currentRecords.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-md text-xs">
                        {b.invoiceId}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {b.patientName}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {b.mobileNo}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{b.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setViewInvoice(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Blocks */}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <span className="text-xs text-slate-400">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- ENHANCED INVOICE PREVIEW & PRINT MODAL --- */}

      {viewInvoice &&
        (() => {
          const clinic =
            clinics.find(
              (c) =>
                c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId),
            ) ||
            viewInvoice.clinicId ||
            {};

          const items = Array.isArray(viewInvoice.items)
            ? viewInvoice.items
            : [];

          const consultationItems = items.filter(
            (i) => i.category === "Consultation",
          );

          const therapyItems = items.filter((i) => i.category === "Therapy");

          const medicineItems = items.filter((i) => i.category === "Medicine");

          const ayurvedicItems = items.filter((i) =>
            ["Ayurvedic Tab", "Ayurvedic Churan", "Ayurvedic Oil"].includes(
              i.category,
            ),
          );

          const baseValue = items.reduce(
            (sum, item) =>
              sum +
              Number(
                item.base ?? Number(item.price || 0) * Number(item.qty || 1),
              ),

            0,
          );

          const discountValue = items.reduce(
            (sum, item) =>
              sum +
              Number(
                item.discountAmount ??
                  (Number(item.price || 0) *
                    Number(item.qty || 1) *
                    Number(item.discount || 0)) /
                    100,
              ),

            0,
          );

          const taxableValue = items.reduce(
            (sum, item) =>
              sum +
              Number(
                item.taxableAmount ??
                  Number(
                    item.base ??
                      Number(item.price || 0) * Number(item.qty || 1),
                  ) - Number(item.discountAmount || 0),
              ),

            0,
          );

          const gstValue = items.reduce(
            (sum, item) =>
              sum +
              Number(
                item.gstAmount ??
                  (Number(
                    item.taxableAmount ??
                      Number(item.price || 0) * Number(item.qty || 1),
                  ) *
                    Number(item.gst || 0)) /
                    100,
              ),

            0,
          );

          const cgst = gstValue / 2;

          const sgst = gstValue / 2;

          const grandTotal = Number(
            viewInvoice.totalAmount ?? taxableValue + gstValue,
          );

          const paymentLabel =
            String(viewInvoice.paymentMethod || "Cash")
              .replace(/\s*Payment\s*/i, "")

              .trim() || "Cash";

          const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

          const formatQty = (item) => {
            const qty = Number(item.qty || 0);

            const unit = item.unit || "";

            return `${qty % 1 === 0 ? qty : qty.toFixed(2)}${unit ? ` ${unit}` : ""}`;
          };

          const sectionTitle = (title) => (
            <div className="mt-7 mb-2">
              <h3 className="text-[13px] font-extrabold tracking-[0.08em] uppercase text-[#91A6C2]">
                {title}
              </h3>

              <div className="mt-1 border-b border-[#E5EBF2]" />
            </div>
          );

          const renderRows = (sectionItems, type) => {
            if (!sectionItems.length) return null;

            return (
              <div className="mb-1">
                {sectionTitle(type)}

                <div className="grid grid-cols-[1fr_62px_88px_72px_72px_92px] items-center border-b border-[#E5EBF2] pb-1.5 text-[11px] font-bold text-[#91A6C2]">
                  <span>
                    {type === "Consultation Fees"
                      ? "Fee Description"
                      : type === "Panchkarma & Therapies"
                        ? "Therapy Name"
                        : "Medicine Name"}
                  </span>

                  {type !== "Consultation Fees" && (
                    <span className="text-center">Qty</span>
                  )}

                  {type !== "Consultation Fees" && (
                    <span className="text-right">MRP</span>
                  )}

                  {type !== "Consultation Fees" && (
                    <span className="text-right">Disc %</span>
                  )}

                  {type !== "Consultation Fees" && (
                    <span className="text-right">GST %</span>
                  )}

                  <span className="text-right">Amount</span>
                </div>

                {sectionItems.map((item, idx) => (
                  <div
                    key={`${type}-${idx}`}
                    className={
                      type === "Consultation Fees"
                        ? "grid grid-cols-[1fr_92px] items-center py-2 text-[12px] text-[#30415D]"
                        : "grid grid-cols-[1fr_62px_88px_72px_72px_92px] items-center py-2 text-[12px] text-[#30415D]"
                    }
                  >
                    <div className="pr-2">
                      <div className="font-medium">{item.name}</div>

                      {item.category === "Ayurvedic Churan" &&
                      item.ingredients?.length ? (
                        <div className="mt-0.5 text-[8px] text-slate-400">
                          {item.ingredients
                            .map((x) => `${x.name} ${x.qty}${x.unit || "gm"}`)
                            .join(" • ")}
                        </div>
                      ) : null}
                    </div>

                    {type !== "Consultation Fees" && (
                      <span className="text-center">{formatQty(item)}</span>
                    )}

                    {type !== "Consultation Fees" && (
                      <span className="text-right">
                        {formatMoney(item.pricePerUnit ?? item.price)}

                        {item.unit ? (
                          <small className="block text-[8px] text-slate-400">
                            / {item.unit}
                          </small>
                        ) : null}
                      </span>
                    )}

                    {type !== "Consultation Fees" && (
                      <span className="text-right">
                        {Number(item.discount || 0)}%
                      </span>
                    )}

                    {type !== "Consultation Fees" && (
                      <span className="text-right">
                        {Number(item.gst || 0)}%
                      </span>
                    )}

                    <span className="text-right font-semibold">
                      {formatMoney(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            );
          };

          return (
            <div
              id="invoice-print-overlay"
              className="fixed inset-0 bg-black/80 flex justify-center items-start z-[60] p-4 overflow-y-auto"
            >
              <div
                id="invoice-print-card"
                className="my-4 w-full max-w-[794px] rounded-2xl overflow-hidden shadow-2xl bg-white"
              >
                <div
                  id="printable-invoice"
                  className="min-h-[1123px] bg-white px-[40px] py-[48px] text-[#30415D]"
                >
                  {/* Header */}

                  <div className="flex items-start justify-between border-b border-[#DCE4EE] pb-7">
                    <div className="flex items-center gap-4">
                      <img
                        src="/brandicon.png"
                        alt="Dhruwraj Logo"
                        className="h-[48px] w-[48px] object-contain"
                      />

                      <div>
                        <h1 className="text-[20px] leading-none font-extrabold text-[#172238] tracking-[-0.02em]">
                          {clinic.name || "DHRUWRAJ AYURVEDA & PANCHKARMA"}
                        </h1>

                        <p className="mt-2 text-[14px] text-[#71839D]">
                          {clinic.location || "Vikas Nagar"}
                          {clinic.city ? `, ${clinic.city}` : ", Kanpur"}
                        </p>

                        <p className="mt-1 text-[12px] font-bold tracking-wide text-[#008B83]">
                          GSTIN: {clinic.gstNumber || "GSTIN"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#91A6C2]">
                        Tax Invoice
                      </div>

                      <div className="mt-1 text-[19px] font-extrabold tracking-wide text-[#172238]">
                        #{viewInvoice.invoiceId}
                      </div>

                      <div className="mt-1 text-[12px] text-[#667A96]">
                        {new Date(
                          viewInvoice.createdAt || Date.now(),
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",

                          month: "short",

                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bill To / Payment */}

                  <div className="mt-7 grid grid-cols-2 rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] px-5 py-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#91A6C2]">
                        Bill To:
                      </p>

                      <p className="mt-1 text-[15px] font-extrabold text-[#172238]">
                        {viewInvoice.patientName}
                      </p>

                      <p className="mt-1 text-[13px] text-[#667A96]">
                        {viewInvoice.mobileNo
                          ? `+91 ${viewInvoice.mobileNo}`
                          : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#91A6C2]">
                        Payment Info:
                      </p>

                      <p className="mt-1 text-[15px] font-extrabold text-[#172238]">
                        {paymentLabel}
                      </p>

                      <p className="mt-1 text-[13px] text-[#667A96]">
                        Status: Settlement Complete
                      </p>
                    </div>
                  </div>

                  {/* Sections */}

                  {renderRows(consultationItems, "Consultation Fees")}

                  {renderRows(therapyItems, "Panchkarma & Therapies")}

                  {renderRows(medicineItems, "Pharmacy Dispersals")}

                  {renderRows(ayurvedicItems, "Ayurvedic Medicines")}

                  {/* Totals */}

                  <div className="mt-8 border-t border-[#DCE4EE] pt-5">
                    <div className="ml-auto w-[280px] space-y-2 text-[12px]">
                      <div className="flex justify-between text-[#667A96]">
                        <span>Gross Value:</span>

                        <span>{formatMoney(baseValue)}</span>
                      </div>

                      <div className="flex justify-between text-[#667A96]">
                        <span>
                          CGST (@{" "}
                          {(gstValue
                            ? items.reduce(
                                (s, i) => s + Number(i.gst || 0),
                                0,
                              ) /
                              Math.max(items.length, 1) /
                              2
                            : 0
                          ).toFixed(1)}
                          %):
                        </span>

                        <span>+ {formatMoney(cgst)}</span>
                      </div>

                      <div className="flex justify-between text-[#667A96]">
                        <span>
                          SGST (@{" "}
                          {(gstValue
                            ? items.reduce(
                                (s, i) => s + Number(i.gst || 0),
                                0,
                              ) /
                              Math.max(items.length, 1) /
                              2
                            : 0
                          ).toFixed(1)}
                          %):
                        </span>

                        <span>+ {formatMoney(sgst)}</span>
                      </div>

                      <div className="flex justify-between text-[#00A34A]">
                        <span>Total Discount :</span>

                        <span>- {formatMoney(discountValue)}</span>
                      </div>

                      <div className="mt-2 flex justify-between border-t border-[#DCE4EE] pt-3 text-[16px] font-extrabold text-[#172238]">
                        <span>Grand Total :</span>

                        <span>{formatMoney(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}

                  <div className="mt-12 border-t border-[#E5EBF2] pt-5 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#91A6C2]">
                      Authorized System Generation
                    </p>

                    <p className="mt-2 text-[10px] italic text-[#C3CDDA]">
                      No physical signature required.
                    </p>
                  </div>
                </div>

                {/* Actions */}

                <div className="no-print flex gap-3 bg-slate-900 p-4">
                  <button
                    onClick={() => setViewInvoice(null)}
                    className="flex-1 py-3 text-xs font-bold text-white opacity-70 hover:opacity-100"
                  >
                    CLOSE PREVIEW
                  </button>

                  <button
                    onClick={handlePrintInvoice}
                    className="flex-[2] rounded-xl bg-teal-500 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-teal-400"
                  >
                    🖨️ Print Invoice
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[850px] rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Create New Invoice
                </h2>

                <p className="text-xs text-slate-400">
                  Add client demographics, select inventory units, and add them
                  to the bill.
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-md border border-teal-100">
                Invoice ID: {generatedInvoiceId}
              </span>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-300 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Demographics Setup Section */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Patient Name
                  </label>

                  <input
                    type="text"
                    placeholder="Patient Name"
                    className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 text-sm outline-none focus:bg-white focus:border-teal-500 transition"
                    value={formData.patientName}
                    onChange={(e) => {
                      let val = e.target.value
                        .replace(/[^A-Za-z\s]/g, "")
                        .replace(/\s+/g, " ")
                        .replace(/^\s/, "");

                      setFormData({ ...formData, patientName: val });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Mobile No"
                    className={`w-full border p-2.5 rounded-xl text-sm bg-slate-50 outline-none focus:bg-white transition ${formData.mobileNo.length > 0 && formData.mobileNo.length < 10 ? "border-red-400" : "border-slate-200"}`}
                    value={formData.mobileNo}
                    maxLength={10}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobileNo: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      })
                    }
                  />
                </div>
              </div>

              {/* Consultation Allocation Inputs */}

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Consultation Fees
                </span>

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      id="cons_input"
                      placeholder="Consultation Fee (₹)"
                      className="w-full border border-slate-200 p-2.5 bg-white text-sm rounded-xl outline-none"
                      type="number"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const val = document.getElementById("cons_input").value;

                      if (val) {
                        addToCart(
                          {
                            name: "Consultation Fee",
                            price: val,
                            gst: 0,
                            discount: 0,
                          },
                          "Consultation",
                        );

                        document.getElementById("cons_input").value = "";
                      }
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 h-[40px] rounded-xl transition"
                  >
                    Add Fee
                  </button>
                </div>
              </div>

              {/* Therapy Configuration Block */}

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Therapies & Services
                </span>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3">
                    <Select
                      options={therapies.map((t) => ({
                        label: `${t.name} (₹${t.price})`,
                        value: t._id,
                        ...t,
                      }))}
                      onChange={(s) =>
                        setActiveTherapy({
                          _id: s._id,
                          name: s.name,
                          price: s.price,
                          discount: "",
                          gst: s.gst || 0,
                          qty: 1,
                        })
                      }
                      placeholder="Select Therapy..."
                      styles={{
                        control: (b) => ({
                          ...b,
                          padding: "2px",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                        }),
                      }}
                    />
                  </div>

                  <input
                    placeholder="Disc %"
                    className="w-full border border-slate-200 p-2 text-sm rounded-xl outline-none"
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
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-xl transition"
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
                      options={inventory
                        .filter(
                          (med) =>
                            ![
                              "Ayurvedic Tabs",
                              "Ayurvedic Churans & Bhasams",
                              "Ayurvedic Oils",
                            ].includes(med.category) &&
                            Number(med.quantity) > 0,
                        )
                        .map((med) => ({
                          label: `${med.name} (Stock: ${med.quantity} ${med.quantityType || "Qty"})`,
                          value: med._id,
                          ...med,
                        }))}
                      onChange={(selected) =>
                        setActiveMedicine({
                          ...activeMedicine,
                          _id: selected?._id || "",
                          inventoryId: selected?._id || "",
                          inventoryCategory: selected?.category || "",
                          name: selected?.name || "",
                          price: Number(selected?.mrp || 0),
                          availableStock: Number(selected?.quantity || 0),
                          unit: selected?.quantityType || "Qty",
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
                  onClick={() => {
                    if (!activeMedicine.inventoryId || !activeMedicine.name) {
                      alert("Please select a medicine from inventory.");
                      return;
                    }

                    const qty = Number(activeMedicine.qty || 0);
                    const stock = Number(activeMedicine.availableStock || 0);

                    if (qty <= 0) {
                      alert("Please enter a valid quantity.");
                      return;
                    }

                    if (qty > stock) {
                      alert(
                        `Only ${stock} ${activeMedicine.unit || "units"} available in stock.`,
                      );
                      return;
                    }

                    addToCart(activeMedicine, "Medicine");
                  }}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-black shadow-lg"
                >
                  Add Medicine to Cart
                </button>
              </div>

              {/* =====================================================
                AYURVEDIC MEDICINES
            ===================================================== */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-wider">
                    Ayurvedic Medicines
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Select medicine type. Unit price is fixed automatically.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["tab", "Ayurvedic Tab"],
                    ["churan", "Ayurvedic Churan"],
                    ["oil", "Ayurvedic Oil"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAyurvedicType(value)}
                      className={`p-4 rounded-xl border text-sm font-bold transition ${
                        ayurvedicType === value
                          ? "bg-teal-600 text-white border-teal-600 shadow-md"
                          : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* TAB */}
                {ayurvedicType === "tab" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                          Select Tablet
                        </p>
                        <Select
                          options={ayurvedicTabs.map((tab) => ({
                            label: `${tab.name} — ₹${Number(tab.pricePerTab).toFixed(2)}/Tab • Stock: ${tab.stock} Tab`,
                            value: tab.id,
                            ...tab,
                            isDisabled: Number(tab.stock) <= 0,
                          }))}
                          value={
                            ayurvedicTab.name
                              ? {
                                  label: `${ayurvedicTab.name} — ₹${Number(
                                    ayurvedicTab.pricePerTab,
                                  ).toFixed(2)}/Tab`,
                                  value: ayurvedicTab.name,
                                }
                              : null
                          }
                          onChange={(selected) =>
                            setAyurvedicTab((prev) => ({
                              ...prev,
                              _id: selected?._id || "",
                              inventoryId: selected?._id || "",
                              name: selected?.name || "",
                              pricePerTab: Number(selected?.pricePerTab || 0),
                              stock: Number(selected?.stock || 0),
                            }))
                          }
                          placeholder={
                            ayurvedicTabs.length
                              ? "Search Ayurvedic Tablet..."
                              : "No Ayurvedic tablets in stock"
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
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                          Qty (Tab)
                        </p>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={ayurvedicTab.qty}
                          onChange={(e) =>
                            setAyurvedicTab((prev) => ({
                              ...prev,
                              qty: e.target.value,
                            }))
                          }
                          className="border p-3 rounded-xl w-full h-[48px] bg-white"
                        />
                      </div>

                      <div className="bg-white border border-dashed rounded-xl p-3 text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">
                          Price / Tab
                        </span>
                        <span className="font-black text-teal-700">
                          ₹{Number(ayurvedicTab.pricePerTab || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between bg-white border rounded-xl p-4">
                      <div>
                        <p className="text-[9px] uppercase text-slate-400 font-bold">
                          Calculation
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {ayurvedicTab.qty || 0} Tab × ₹
                          {Number(ayurvedicTab.pricePerTab || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase text-slate-400 font-bold">
                          Subtotal
                        </p>
                        <p className="text-lg font-black text-teal-700">
                          ₹
                          {(
                            Number(ayurvedicTab.qty || 0) *
                            Number(ayurvedicTab.pricePerTab || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={ayurvedicTab.gst}
                        onChange={(e) =>
                          setAyurvedicTab((prev) => ({
                            ...prev,
                            gst: e.target.value,
                          }))
                        }
                        className="border p-3 rounded-xl bg-white"
                      >
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="0">0% GST</option>
                      </select>

                      <input
                        type="number"
                        min="0"
                        placeholder="Discount %"
                        value={ayurvedicTab.discount}
                        onChange={(e) =>
                          setAyurvedicTab((prev) => ({
                            ...prev,
                            discount: e.target.value,
                          }))
                        }
                        className="border p-3 rounded-xl bg-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addAyurvedicTabToCart}
                      className="w-full bg-slate-800 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md"
                    >
                      Add Ayurvedic Tab to Cart
                    </button>
                  </div>
                )}

                {/* CHURAN */}
                {ayurvedicType === "churan" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                    {/* BHASAM */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-700 uppercase">
                            Bhasam
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Maximum 2 Bhasams
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={
                            ayurvedicChuran.bhasams.length >= MAX_BHASAM
                          }
                          onClick={addBhasam}
                          className="text-xs font-bold text-teal-600 disabled:text-slate-300"
                        >
                          + Add Bhasam
                        </button>
                      </div>

                      {ayurvedicChuran.bhasams.length === 0 && (
                        <div className="bg-white border border-dashed rounded-xl p-4 text-center text-xs text-slate-400">
                          No Bhasam added
                        </div>
                      )}

                      <div className="space-y-3">
                        {ayurvedicChuran.bhasams.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-white border rounded-xl p-3"
                          >
                            <div className="grid grid-cols-5 gap-2 items-end">
                              <div className="col-span-2">
                                <label className="text-[8px] uppercase font-bold text-slate-400">
                                  Bhasam {index + 1}
                                </label>
                                <Select
                                  options={ayurvedicBhasams.map((bhasam) => ({
                                    label: `${bhasam.name} — ₹${Number(
                                      bhasam.pricePerGram,
                                    ).toFixed(
                                      2,
                                    )}/gm • Stock: ${bhasam.stock} gm`,
                                    value: bhasam.id,
                                    ...bhasam,
                                    isDisabled: Number(bhasam.stock) <= 0,
                                  }))}
                                  value={
                                    item.name
                                      ? {
                                          label: `${item.name} — ₹${Number(
                                            item.pricePerGram,
                                          ).toFixed(2)}/gm`,
                                          value: item.name,
                                        }
                                      : null
                                  }
                                  onChange={(selected) => {
                                    updateBhasam(
                                      item.id,
                                      "_id",
                                      selected?._id || "",
                                    );
                                    updateBhasam(
                                      item.id,
                                      "inventoryId",
                                      selected?._id || "",
                                    );
                                    updateBhasam(
                                      item.id,
                                      "name",
                                      selected?.name || "",
                                    );
                                    updateBhasam(
                                      item.id,
                                      "pricePerGram",
                                      Number(selected?.pricePerGram || 0),
                                    );
                                    updateBhasam(
                                      item.id,
                                      "stock",
                                      Number(selected?.stock || 0),
                                    );
                                  }}
                                  placeholder={
                                    ayurvedicBhasams.length
                                      ? "Select Bhasam"
                                      : "No Bhasam in stock"
                                  }
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      minHeight: "44px",
                                      borderRadius: "12px",
                                    }),
                                  }}
                                />
                              </div>

                              <div>
                                <label className="text-[8px] uppercase font-bold text-slate-400">
                                  Qty (gm)
                                </label>
                                <input
                                  type="number"
                                  min="0.001"
                                  step="0.001"
                                  value={item.qty}
                                  onChange={(e) =>
                                    updateBhasam(item.id, "qty", e.target.value)
                                  }
                                  className="border p-2.5 rounded-xl w-full"
                                />
                              </div>

                              <div className="bg-slate-50 border rounded-xl p-2.5 text-center">
                                <span className="text-[8px] uppercase font-bold text-slate-400 block">
                                  ₹ / gm
                                </span>
                                <span className="text-sm font-black text-teal-700">
                                  ₹{Number(item.pricePerGram || 0).toFixed(2)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeBhasam(item.id)}
                                className="text-red-400 font-bold py-3"
                              >
                                ✕
                              </button>
                            </div>

                            {item.name && (
                              <div className="text-right mt-2">
                                <span className="text-[10px] text-slate-400">
                                  {item.qty} gm × ₹
                                  {Number(item.pricePerGram).toFixed(2)}/gm
                                  ={" "}
                                </span>
                                <span className="font-black text-teal-700">
                                  ₹
                                  {(
                                    Number(item.qty || 0) *
                                    Number(item.pricePerGram || 0)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CHURAN INGREDIENTS */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-700 uppercase">
                            Churan
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Maximum 3 Churans
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={
                            ayurvedicChuran.churans.length >= MAX_CHURAN
                          }
                          onClick={addChuran}
                          className="text-xs font-bold text-teal-600 disabled:text-slate-300"
                        >
                          + Add Churan
                        </button>
                      </div>

                      {ayurvedicChuran.churans.length === 0 && (
                        <div className="bg-white border border-dashed rounded-xl p-4 text-center text-xs text-slate-400">
                          No Churan added
                        </div>
                      )}

                      <div className="space-y-3">
                        {ayurvedicChuran.churans.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-white border rounded-xl p-3"
                          >
                            <div className="grid grid-cols-5 gap-2 items-end">
                              <div className="col-span-2">
                                <label className="text-[8px] uppercase font-bold text-slate-400">
                                  Churan {index + 1}
                                </label>
                                <Select
                                  options={ayurvedicChurans.map((churan) => ({
                                    label: `${churan.name} — ₹${Number(
                                      churan.pricePerGram,
                                    ).toFixed(
                                      2,
                                    )}/gm • Stock: ${churan.stock} gm`,
                                    value: churan.id,
                                    ...churan,
                                    isDisabled: Number(churan.stock) <= 0,
                                  }))}
                                  value={
                                    item.name
                                      ? {
                                          label: `${item.name} — ₹${Number(
                                            item.pricePerGram,
                                          ).toFixed(2)}/gm`,
                                          value: item.name,
                                        }
                                      : null
                                  }
                                  onChange={(selected) => {
                                    updateChuran(
                                      item.id,
                                      "_id",
                                      selected?._id || "",
                                    );
                                    updateChuran(
                                      item.id,
                                      "inventoryId",
                                      selected?._id || "",
                                    );
                                    updateChuran(
                                      item.id,
                                      "name",
                                      selected?.name || "",
                                    );
                                    updateChuran(
                                      item.id,
                                      "pricePerGram",
                                      Number(selected?.pricePerGram || 0),
                                    );
                                    updateChuran(
                                      item.id,
                                      "stock",
                                      Number(selected?.stock || 0),
                                    );
                                  }}
                                  placeholder={
                                    ayurvedicChurans.length
                                      ? "Select Churan"
                                      : "No Churan in stock"
                                  }
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      minHeight: "44px",
                                      borderRadius: "12px",
                                    }),
                                  }}
                                />
                              </div>

                              <div>
                                <label className="text-[8px] uppercase font-bold text-slate-400">
                                  Qty (gm)
                                </label>
                                <input
                                  type="number"
                                  min="0.001"
                                  step="0.001"
                                  value={item.qty}
                                  onChange={(e) =>
                                    updateChuran(item.id, "qty", e.target.value)
                                  }
                                  className="border p-2.5 rounded-xl w-full"
                                />
                              </div>

                              <div className="bg-slate-50 border rounded-xl p-2.5 text-center">
                                <span className="text-[8px] uppercase font-bold text-slate-400 block">
                                  ₹ / gm
                                </span>
                                <span className="text-sm font-black text-teal-700">
                                  ₹{Number(item.pricePerGram || 0).toFixed(2)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeChuran(item.id)}
                                className="text-red-400 font-bold py-3"
                              >
                                ✕
                              </button>
                            </div>

                            {item.name && (
                              <div className="text-right mt-2">
                                <span className="text-[10px] text-slate-400">
                                  {item.qty} gm × ₹
                                  {Number(item.pricePerGram).toFixed(2)}/gm
                                  ={" "}
                                </span>
                                <span className="font-black text-teal-700">
                                  ₹
                                  {(
                                    Number(item.qty || 0) *
                                    Number(item.pricePerGram || 0)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CHURAN SUMMARY */}
                    <div className="bg-white border-2 border-dashed border-teal-200 rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400">
                            Ingredients
                          </p>
                          <p className="font-bold text-slate-700">
                            {ayurvedicChuran.bhasams.length} Bhasam +{" "}
                            {ayurvedicChuran.churans.length} Churan
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-[9px] uppercase font-bold text-slate-400">
                            Total Quantity
                          </p>
                          <p className="font-black text-slate-700">
                            {[
                              ...ayurvedicChuran.bhasams,
                              ...ayurvedicChuran.churans,
                            ]
                              .reduce(
                                (sum, item) => sum + Number(item.qty || 0),
                                0,
                              )
                              .toFixed(3)}{" "}
                            gm
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[9px] uppercase font-bold text-slate-400">
                            Churan Total
                          </p>
                          <p className="text-lg font-black text-teal-700">
                            ₹
                            {[
                              ...ayurvedicChuran.bhasams,
                              ...ayurvedicChuran.churans,
                            ]
                              .reduce(
                                (sum, item) =>
                                  sum +
                                  Number(item.qty || 0) *
                                    Number(item.pricePerGram || 0),
                                0,
                              )
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addAyurvedicChuranToCart}
                      className="w-full bg-slate-800 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md"
                    >
                      Add Ayurvedic Churan to Cart
                    </button>
                  </div>
                )}

                {/* OIL */}
                {ayurvedicType === "oil" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                          Select Ayurvedic Oil
                        </p>
                        <Select
                          options={ayurvedicOils.map((oil) => ({
                            label: `${oil.name} — ₹${Number(oil.pricePerMl).toFixed(2)}/ml • Stock: ${oil.stock} ml`,
                            value: oil.id,
                            ...oil,
                            isDisabled: Number(oil.stock) <= 0,
                          }))}
                          value={
                            ayurvedicOil.name
                              ? {
                                  label: `${ayurvedicOil.name} — ₹${Number(
                                    ayurvedicOil.pricePerMl,
                                  ).toFixed(2)}/ml`,
                                  value: ayurvedicOil.name,
                                }
                              : null
                          }
                          onChange={(selected) =>
                            setAyurvedicOil((prev) => ({
                              ...prev,
                              _id: selected?._id || "",
                              inventoryId: selected?._id || "",
                              name: selected?.name || "",
                              pricePerMl: Number(selected?.pricePerMl || 0),
                              stock: Number(selected?.stock || 0),
                            }))
                          }
                          placeholder={
                            ayurvedicOils.length
                              ? "Search Ayurvedic Oil..."
                              : "No Ayurvedic oils in stock"
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
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                          Qty (ml)
                        </p>
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={ayurvedicOil.qty}
                          onChange={(e) =>
                            setAyurvedicOil((prev) => ({
                              ...prev,
                              qty: e.target.value,
                            }))
                          }
                          className="border p-3 rounded-xl w-full h-[48px] bg-white"
                        />
                      </div>

                      <div className="bg-white border border-dashed rounded-xl p-3 text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">
                          Price / ml
                        </span>
                        <span className="font-black text-teal-700">
                          ₹{Number(ayurvedicOil.pricePerMl || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between bg-white border rounded-xl p-4">
                      <div>
                        <p className="text-[9px] uppercase text-slate-400 font-bold">
                          Calculation
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {ayurvedicOil.qty || 0} ml × ₹
                          {Number(ayurvedicOil.pricePerMl || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase text-slate-400 font-bold">
                          Subtotal
                        </p>
                        <p className="text-lg font-black text-teal-700">
                          ₹
                          {(
                            Number(ayurvedicOil.qty || 0) *
                            Number(ayurvedicOil.pricePerMl || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={ayurvedicOil.gst}
                        onChange={(e) =>
                          setAyurvedicOil((prev) => ({
                            ...prev,
                            gst: e.target.value,
                          }))
                        }
                        className="border p-3 rounded-xl bg-white"
                      >
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="0">0% GST</option>
                      </select>

                      <input
                        type="number"
                        min="0"
                        placeholder="Discount %"
                        value={ayurvedicOil.discount}
                        onChange={(e) =>
                          setAyurvedicOil((prev) => ({
                            ...prev,
                            discount: e.target.value,
                          }))
                        }
                        className="border p-3 rounded-xl bg-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addAyurvedicOilToCart}
                      className="w-full bg-slate-800 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md"
                    >
                      Add Ayurvedic Oil to Cart
                    </button>
                  </div>
                )}
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
                            {item.category} • {item.qty} {item.unit || "Qty"}
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

            {/* Form Action Submissions Bar */}

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-4">
              <select
                className="border border-slate-200 p-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-white outline-none focus:border-teal-500"
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
              >
                <option value="Cash Payment">💵 Cash Payment</option>

                <option value="UPI Payment">📱 UPI Payment</option>
              </select>

              <button
                onClick={handleGenerateBill}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xl shadow-sm flex-1 transition-all"
              >
                Generate Final Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

// with whatsapp share button but has some issues with printing and preview of invoice. Need to fix that.

// import React, { useState, useEffect } from "react";

// import axios from "axios";

// import Select from "react-select";

// import {
//   Search,
//   Plus,
//   ChevronLeft,
//   ChevronRight,
//   Eye,
//   Printer,
//   Trash2,
//   Send,
// } from "lucide-react";

// const Billing = () => {
//   // --- STATE MANAGEMENT ---

//   const [bills, setBills] = useState([]);

//   const [filteredBills, setFilteredBills] = useState([]);

//   const [clinics, setClinics] = useState([]);

//   const [inventory, setInventory] = useState([]);

//   const [therapies, setTherapies] = useState([]);

//   const [showModal, setShowModal] = useState(false);

//   const [search, setSearch] = useState("");

//   const [currentUser, setCurrentUser] = useState(null);

//   const [viewInvoice, setViewInvoice] = useState(null);

//   // --- PAGINATION CONFIGURATION ---

//   const [currentPage, setCurrentPage] = useState(1);

//   const recordsPerPage = 10;

//   const indexOfLast = currentPage * recordsPerPage;

//   const indexOfFirst = indexOfLast - recordsPerPage;

//   const currentRecords = filteredBills.slice(indexOfFirst, indexOfLast);

//   const totalPages = Math.ceil(filteredBills.length / recordsPerPage);

//   const [generatedInvoiceId, setGeneratedInvoiceId] = useState("Loading...");

//   const [cart, setCart] = useState([]);

//   const [formData, setFormData] = useState({
//     patientName: "",

//     mobileNo: "",

//     paymentMethod: "Cash Payment",

//     clinicId: "",
//   });

//   // --- FORM INPUT FIELDS DATA ---

//   const [activeMedicine, setActiveMedicine] = useState({
//     name: "",
//     price: "",
//     qty: "",
//     gst: 5,
//     discount: "",
//   });

//   // =====================================================

//   // AYURVEDIC MEDICINE STATES

//   // =====================================================

//   const [ayurvedicType, setAyurvedicType] = useState("");

//   const [ayurvedicTab, setAyurvedicTab] = useState({
//     name: "",

//     pricePerTab: 0,

//     qty: 1,

//     gst: 5,

//     discount: 0,
//   });

//   const [ayurvedicOil, setAyurvedicOil] = useState({
//     name: "",

//     pricePerMl: 0,

//     qty: 1,

//     gst: 5,

//     discount: 0,
//   });

//   const [ayurvedicChuran, setAyurvedicChuran] = useState({
//     bhasams: [],

//     churans: [],
//   });

//   const MAX_BHASAM = 2;

//   const MAX_CHURAN = 3;

//   const [activeTherapy, setActiveTherapy] = useState({
//     name: "",
//     price: 0,
//     discount: "",
//   });

//   const auth = {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   };

//   // The logged-in user's assigned clinic is the source of truth for billing.
//   const getUserClinicId = (userData) => {
//     if (!userData?.clinic) return "";
//     return typeof userData.clinic === "object"
//       ? userData.clinic._id || userData.clinic.id || ""
//       : userData.clinic;
//   };

//   // --- INITIAL DATA LOADING ---

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   // --- LIVE FILTER / SEARCH LOGIC ---

//   useEffect(() => {
//     const res = bills.filter((b) => {
//       const nameMatch = b.patientName
//         ?.toLowerCase()
//         .includes(search.toLowerCase());

//       const dateMatch = new Date(b.createdAt)
//         .toLocaleDateString()
//         .includes(search);

//       const idMatch = b.invoiceId?.toLowerCase().includes(search.toLowerCase());

//       const mobileMatch = b.mobileNo
//         ?.toLowerCase()
//         .includes(search.toLowerCase());

//       return nameMatch || dateMatch || idMatch || mobileMatch;
//     });

//     setFilteredBills(res);
//   }, [search, bills]);

//   // Reset page number on filter changes

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search]);

//   const fetchInitialData = async () => {
//     try {
//       const [clinicRes, billRes, therapyRes] = await Promise.all([
//         axios.get("https://dms-backend-amber.vercel.app/api/clinics", auth),
//         axios.get("https://dms-backend-amber.vercel.app/api/bills", auth),
//         axios.get("https://dms-backend-amber.vercel.app/api/therapies", auth),
//       ]);

//       const clinicList = Array.isArray(clinicRes.data)
//         ? clinicRes.data
//         : clinicRes.data?.clinics || [];

//       const allBillsData = Array.isArray(billRes.data)
//         ? billRes.data
//         : billRes.data?.bills || [];

//       const therapyList = Array.isArray(therapyRes.data)
//         ? therapyRes.data
//         : therapyRes.data?.therapies || [];

//       setClinics(clinicList);
//       setTherapies(therapyList);

//       // Automatically get the clinic assigned to the logged-in user.
//       const storedUser = localStorage.getItem("user");
//       const userData = storedUser ? JSON.parse(storedUser) : null;
//       setCurrentUser(userData);

//       const myClinicId = getUserClinicId(userData);

//       if (!myClinicId) {
//         console.error("No clinic assigned to logged-in user.");
//         setBills([]);
//         setFilteredBills([]);
//         setInventory([]);
//         return;
//       }

//       const myClinic = clinicList.find(
//         (clinic) => String(clinic._id) === String(myClinicId),
//       );

//       if (!myClinic) {
//         console.error("Assigned clinic was not found.");
//         setBills([]);
//         setFilteredBills([]);
//         setInventory([]);
//         return;
//       }

//       // Reception-style behaviour: only this clinic's bills are shown.
//       const clinicBills = allBillsData.filter(
//         (bill) =>
//           String(bill.clinicId?._id || bill.clinicId) === String(myClinic._id),
//       );

//       setBills(clinicBills);
//       setFilteredBills(clinicBills);

//       // Clinic is auto-filled; it is never selected manually.
//       setFormData((prev) => ({
//         ...prev,
//         clinicId: myClinic._id,
//       }));

//       // Generate the next invoice number from this clinic.
//       const prefix = myClinic.invoicePrefix || "INV";
//       setGeneratedInvoiceId(
//         `${prefix}${String(clinicBills.length + 1).padStart(4, "0")}`,
//       );

//       // Load inventory for the same clinic.
//       const inventoryRes = await axios.get(
//         `https://dms-backend-amber.vercel.app/api/medicine/clinic/${myClinic._id}`,
//         auth,
//       );

//       setInventory(
//         Array.isArray(inventoryRes.data)
//           ? inventoryRes.data
//           : inventoryRes.data?.medicines || inventoryRes.data?.inventory || [],
//       );
//     } catch (err) {
//       console.error("Data Fetch Error:", err);
//       alert(
//         "Unable to load billing data: " +
//         (err.response?.data?.message || err.message),
//       );
//     }
//   };

//   const handleWhatsAppShare = () => {
//     const mobile = viewInvoice.mobileNo;

//     const message = `Hello ${viewInvoice.patientName},\n\nYour invoice has been generated successfully.\n\nInvoice ID: ${viewInvoice.invoiceId}\nAmount: ₹${viewInvoice.totalAmount}\n\nDownload Invoice:\nhttp://localhost:5173/invoice/${viewInvoice._id}\n\nThank you.`;

//     const encodedMessage = encodeURIComponent(message);

//     window.open(`https://wa.me/91${mobile}?text=${encodedMessage}`, "_blank");
//   };

//   const handleMedicineChange = (selected) => {
//     if (selected) {
//       setActiveMedicine({
//         ...activeMedicine,

//         _id: selected._id,

//         name: selected.name,

//         price: selected.mrp,

//         discount: selected.discount || 0,

//         qty: 1,
//       });
//     }
//   };

//   // =====================================================
//   // AYURVEDIC INVENTORY OPTIONS
//   // =====================================================
//   // Inventory categories are the same values used by the Inventory module:
//   // Ayurvedic Tabs -> Piece, Ayurvedic Churans & Bhasams -> Grams,
//   // Ayurvedic Oils -> ML.
//   const ayurvedicInventory = Array.isArray(inventory)
//     ? inventory.filter((item) => Number(item.quantity) > 0)
//     : [];

//   const ayurvedicTabs = ayurvedicInventory
//     .filter((item) => item.category === "Ayurvedic Tabs")
//     .map((item) => ({
//       ...item,
//       id: item._id,
//       pricePerTab: Number(item.mrp || 0),
//       stock: Number(item.quantity || 0),
//     }));

//   const ayurvedicOils = ayurvedicInventory
//     .filter((item) => item.category === "Ayurvedic Oils")
//     .map((item) => ({
//       ...item,
//       id: item._id,
//       pricePerMl: Number(item.mrp || 0),
//       stock: Number(item.quantity || 0),
//     }));

//   const ayurvedicBhasams = ayurvedicInventory
//     .filter(
//       (item) =>
//         item.category === "Ayurvedic Churans & Bhasams" &&
//         String(item.ayurvedicSubtype || "").toLowerCase() === "bhasam",
//     )
//     .map((item) => ({
//       ...item,
//       id: item._id,
//       pricePerGram: Number(item.mrp || 0),
//       stock: Number(item.quantity || 0),
//     }));

//   const ayurvedicChurans = ayurvedicInventory
//     .filter(
//       (item) =>
//         item.category === "Ayurvedic Churans & Bhasams" &&
//         String(item.ayurvedicSubtype || "").toLowerCase() === "churan",
//     )
//     .map((item) => ({
//       ...item,
//       id: item._id,
//       pricePerGram: Number(item.mrp || 0),
//       stock: Number(item.quantity || 0),
//     }));

//   const addToCart = (item, category) => {
//     if (!item.name || Number(item.price) < 0) return;

//     const qty = Number(item.qty) || 1;
//     const price = Number(item.price) || 0;
//     const gst = Number(item.gst) || 0;
//     const discount = Number(item.discount) || 0;

//     // Inventory-backed items must never exceed the currently loaded stock.
//     if (item.inventoryId) {
//       const availableStock = Number(item.availableStock ?? item.stock ?? 0);

//       if (qty <= 0) {
//         alert("Please enter a valid quantity.");
//         return;
//       }

//       if (qty > availableStock) {
//         alert(
//           `Only ${availableStock} ${item.unit || "units"} of ${item.name} are available in stock.`,
//         );
//         return;
//       }

//       // Also account for the same inventory item already present in the cart.
//       const alreadyInCart = cart
//         .filter((cartItem) => cartItem.inventoryId === item.inventoryId)
//         .reduce((sum, cartItem) => sum + Number(cartItem.qty || 0), 0);

//       if (alreadyInCart + qty > availableStock) {
//         alert(
//           `Only ${availableStock} ${item.unit || "units"} of ${item.name} are available. ` +
//           `${alreadyInCart} ${item.unit || "units"} are already in the cart.`,
//         );
//         return;
//       }
//     }

//     const base = price * qty;
//     const discountAmount = base * (discount / 100);
//     const afterDiscount = base - discountAmount;
//     const total = afterDiscount + afterDiscount * (gst / 100);

//     setCart((prev) => [
//       ...prev,
//       {
//         ...item,
//         category,
//         qty,
//         price,
//         gst,
//         discount,
//         total: Number(total.toFixed(2)),
//       },
//     ]);
//   };

//   // =====================================================
//   // AYURVEDIC HELPERS
//   // =====================================================

//   const addBhasam = () => {
//     if (ayurvedicChuran.bhasams.length >= MAX_BHASAM) {
//       alert("Maximum 2 Bhasams can be added.");
//       return;
//     }

//     setAyurvedicChuran((prev) => ({
//       ...prev,
//       bhasams: [
//         ...prev.bhasams,
//         {
//           id: `bhasam-${Date.now()}-${Math.random()}`,
//           name: "",
//           pricePerGram: 0,
//           qty: 1,
//         },
//       ],
//     }));
//   };

//   const addChuran = () => {
//     if (ayurvedicChuran.churans.length >= MAX_CHURAN) {
//       alert("Maximum 3 Churans can be added.");
//       return;
//     }

//     setAyurvedicChuran((prev) => ({
//       ...prev,
//       churans: [
//         ...prev.churans,
//         {
//           id: `churan-${Date.now()}-${Math.random()}`,
//           name: "",
//           pricePerGram: 0,
//           qty: 1,
//         },
//       ],
//     }));
//   };

//   const removeBhasam = (id) => {
//     setAyurvedicChuran((prev) => ({
//       ...prev,
//       bhasams: prev.bhasams.filter((item) => item.id !== id),
//     }));
//   };

//   const removeChuran = (id) => {
//     setAyurvedicChuran((prev) => ({
//       ...prev,
//       churans: prev.churans.filter((item) => item.id !== id),
//     }));
//   };

//   const updateBhasam = (id, field, value) => {
//     setAyurvedicChuran((prev) => ({
//       ...prev,
//       bhasams: prev.bhasams.map((item) =>
//         item.id === id ? { ...item, [field]: value } : item,
//       ),
//     }));
//   };

//   const updateChuran = (id, field, value) => {
//     setAyurvedicChuran((prev) => ({
//       ...prev,
//       churans: prev.churans.map((item) =>
//         item.id === id ? { ...item, [field]: value } : item,
//       ),
//     }));
//   };

//   const addAyurvedicTabToCart = () => {
//     if (!ayurvedicTab.name) {
//       alert("Please select an Ayurvedic Tablet.");
//       return;
//     }

//     const qty = Number(ayurvedicTab.qty);
//     const price = Number(ayurvedicTab.pricePerTab);
//     const stock = Number(ayurvedicTab.stock || 0);

//     if (!qty || qty <= 0) {
//       alert("Please enter a valid tablet quantity.");
//       return;
//     }

//     if (price < 0) {
//       alert("Invalid tablet price.");
//       return;
//     }

//     if (qty > stock) {
//       alert(`Only ${stock} tablets are available in stock.`);
//       return;
//     }

//     addToCart(
//       {
//         _id: ayurvedicTab._id,
//         inventoryId: ayurvedicTab._id,
//         inventoryCategory: "Ayurvedic Tabs",
//         ayurvedicSubtype: "Tab",
//         name: ayurvedicTab.name,
//         price,
//         qty,
//         unit: "Tab",
//         pricePerUnit: price,
//         availableStock: stock,
//         gst: Number(ayurvedicTab.gst),
//         discount: Number(ayurvedicTab.discount),
//       },
//       "Ayurvedic Tab",
//     );

//     setAyurvedicTab({
//       name: "",
//       pricePerTab: 0,
//       qty: 1,
//       gst: 5,
//       discount: 0,
//     });
//   };

//   const addAyurvedicOilToCart = () => {
//     if (!ayurvedicOil.name) {
//       alert("Please select an Ayurvedic Oil.");
//       return;
//     }

//     const qty = Number(ayurvedicOil.qty);
//     const price = Number(ayurvedicOil.pricePerMl);
//     const stock = Number(ayurvedicOil.stock || 0);

//     if (!qty || qty <= 0) {
//       alert("Please enter a valid oil quantity.");
//       return;
//     }

//     if (price < 0) {
//       alert("Invalid oil price.");
//       return;
//     }

//     if (qty > stock) {
//       alert(`Only ${stock} ml is available in stock.`);
//       return;
//     }

//     addToCart(
//       {
//         _id: ayurvedicOil._id,
//         inventoryId: ayurvedicOil._id,
//         inventoryCategory: "Ayurvedic Oils",
//         ayurvedicSubtype: "Oil",
//         name: ayurvedicOil.name,
//         price,
//         qty,
//         unit: "ml",
//         pricePerUnit: price,
//         pricePerMl: price,
//         availableStock: stock,
//         gst: Number(ayurvedicOil.gst),
//         discount: Number(ayurvedicOil.discount),
//       },
//       "Ayurvedic Oil",
//     );

//     setAyurvedicOil({
//       name: "",
//       pricePerMl: 0,
//       qty: 1,
//       gst: 5,
//       discount: 0,
//     });
//   };

//   const addAyurvedicChuranToCart = () => {
//     const allIngredients = [
//       ...ayurvedicChuran.bhasams,
//       ...ayurvedicChuran.churans,
//     ];

//     if (allIngredients.length === 0) {
//       alert("Please add at least one Bhasam or Churan.");
//       return;
//     }

//     const invalidIngredient = allIngredients.find(
//       (item) =>
//         !item.inventoryId ||
//         !item.name ||
//         Number(item.qty) <= 0 ||
//         Number(item.pricePerGram) < 0 ||
//         Number(item.qty) > Number(item.stock || 0),
//     );

//     if (invalidIngredient) {
//       alert(
//         "Please select all Churans/Bhasams and make sure each requested quantity is within available stock.",
//       );
//       return;
//     }

//     // Prevent the same inventory item from being selected multiple times
//     // and collectively exceeding its stock.
//     const requestedByInventory = allIngredients.reduce((acc, item) => {
//       const id = String(item.inventoryId);
//       acc[id] = (acc[id] || 0) + Number(item.qty || 0);
//       return acc;
//     }, {});

//     const overStock = allIngredients.find(
//       (item) =>
//         requestedByInventory[String(item.inventoryId)] >
//         Number(item.stock || 0),
//     );

//     if (overStock) {
//       alert(
//         `${overStock.name}: requested ${requestedByInventory[String(overStock.inventoryId)]} gm, ` +
//         `but only ${Number(overStock.stock || 0)} gm is available.`,
//       );
//       return;
//     }

//     const normalizedIngredients = allIngredients.map((item) => ({
//       ...item,
//       inventoryCategory: "Ayurvedic Churans & Bhasams",
//       ayurvedicSubtype:
//         item.ayurvedicSubtype ||
//         (ayurvedicChuran.bhasams.some((b) => b.id === item.id)
//           ? "Bhasam"
//           : "Churan"),
//       type:
//         item.type ||
//         (ayurvedicChuran.bhasams.some((b) => b.id === item.id)
//           ? "Bhasam"
//           : "Churan"),
//       unit: "gm",
//     }));

//     const totalGm = normalizedIngredients.reduce(
//       (sum, item) => sum + Number(item.qty),
//       0,
//     );

//     const totalPrice = normalizedIngredients.reduce(
//       (sum, item) => sum + Number(item.qty) * Number(item.pricePerGram),
//       0,
//     );

//     if (!totalGm || totalGm <= 0) {
//       alert("Total Churan quantity must be greater than 0.");
//       return;
//     }

//     const averagePricePerGram = totalPrice / totalGm;

//     const churanName = normalizedIngredients
//       .map((item) => item.name)
//       .join(" + ");

//     // Existing addToCart calculates price × qty.
//     // For a mixed Churan, price is the weighted average ₹/gm
//     // and qty is total grams, so the final total remains exact.
//     addToCart(
//       {
//         name: `Ayurvedic Churan - ${churanName}`,
//         price: Number(averagePricePerGram.toFixed(4)),
//         qty: Number(totalGm.toFixed(3)),
//         unit: "gm",
//         pricePerUnit: Number(averagePricePerGram.toFixed(2)),
//         pricePerGram: Number(averagePricePerGram.toFixed(4)),
//         totalGm: Number(totalGm.toFixed(3)),
//         ingredients: normalizedIngredients,
//         gst: 5,
//         discount: 0,
//       },
//       "Ayurvedic Churan",
//     );

//     setAyurvedicChuran({
//       bhasams: [],
//       churans: [],
//     });
//   };

//   const handlePrintInvoice = () => {
//     const invoiceElement = document.getElementById("printable-invoice");

//     if (!invoiceElement) {
//       alert("Invoice preview not found.");
//       return;
//     }

//     const iframe = document.createElement("iframe");
//     iframe.setAttribute("aria-hidden", "true");
//     iframe.style.position = "fixed";
//     iframe.style.right = "0";
//     iframe.style.bottom = "0";
//     iframe.style.width = "1px";
//     iframe.style.height = "1px";
//     iframe.style.border = "0";
//     iframe.style.opacity = "0";
//     iframe.style.pointerEvents = "none";
//     document.body.appendChild(iframe);

//     const printDocument =
//       iframe.contentDocument || iframe.contentWindow.document;
//     const styles = Array.from(
//       document.querySelectorAll('link[rel="stylesheet"], style'),
//     )
//       .map((node) => node.outerHTML)
//       .join("\n");

//     const invoiceHTML = invoiceElement.outerHTML;
//     const invoiceId = viewInvoice?.invoiceId || "Invoice";
//     let printed = false;

//     const cleanup = () => {
//       setTimeout(() => {
//         if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
//       }, 1000);
//     };

//     const startPrint = () => {
//       if (printed) return;
//       printed = true;

//       setTimeout(() => {
//         try {
//           iframe.contentWindow.focus();
//           iframe.contentWindow.print();
//         } finally {
//           cleanup();
//         }
//       }, 250);
//     };

//     printDocument.open();
//     printDocument.write(`
//       <!doctype html>
//       <html>
//         <head>
//           <meta charset="UTF-8" />
//           <title>Tax Invoice - ${invoiceId}</title>
//           ${styles}
//           <style>
//             @page { size: A4 portrait; margin: 0; }
//             * {
//               box-sizing: border-box !important;
//               -webkit-print-color-adjust: exact !important;
//               print-color-adjust: exact !important;
//             }
//             html, body {
//               margin: 0 !important;
//               padding: 0 !important;
//               width: 210mm !important;
//               min-width: 210mm !important;
//               background: #fff !important;
//             }
//             body { overflow: visible !important; }
//             #printable-invoice {
//               position: relative !important;
//               display: block !important;
//               width: 210mm !important;
//               min-width: 210mm !important;
//               max-width: 210mm !important;
//               min-height: 297mm !important;
//               height: auto !important;
//               margin: 0 !important;
//               padding: 14mm 16mm 12mm 16mm !important;
//               background: #fff !important;
//               overflow: visible !important;
//               border: 0 !important;
//               border-radius: 0 !important;
//               box-shadow: none !important;
//               transform: none !important;
//             }
//             .no-print { display: none !important; }
//             img { display: block !important; max-width: 100% !important; }
//             table { width: 100% !important; border-collapse: collapse !important; }
//             tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
//           </style>
//         </head>
//         <body>${invoiceHTML}</body>
//       </html>
//     `);
//     printDocument.close();

//     const images = Array.from(printDocument.images || []);
//     if (!images.length) {
//       startPrint();
//       return;
//     }

//     let remaining = images.length;
//     const imageDone = () => {
//       remaining -= 1;
//       if (remaining <= 0) startPrint();
//     };

//     images.forEach((img) => {
//       if (img.complete) imageDone();
//       else {
//         img.onload = imageDone;
//         img.onerror = imageDone;
//       }
//     });

//     setTimeout(startPrint, 2000);
//   };

//   const handleGenerateBill = async () => {
//     if (!formData.patientName || cart.length === 0) {
//       alert("Please add patient details and items to cart");

//       return;
//     }

//     // Always resolve the clinic from the logged-in user when generating.
//     const storedUser = localStorage.getItem("user");
//     const userData = storedUser ? JSON.parse(storedUser) : null;
//     const myClinicId = getUserClinicId(userData);

//     if (!myClinicId) {
//       alert("No clinic is assigned to the logged-in user.");
//       return;
//     }

//     const myClinic = clinics.find(
//       (clinic) => String(clinic._id) === String(myClinicId),
//     );

//     if (!myClinic) {
//       alert("Assigned clinic could not be found.");
//       return;
//     }

//     const clinicBills = bills.filter(
//       (bill) =>
//         String(bill.clinicId?._id || bill.clinicId) === String(myClinic._id),
//     );

//     const prefix = myClinic.invoicePrefix || "INV";
//     const invoiceId = `${prefix}${String(clinicBills.length + 1).padStart(4, "0")}`;

//     try {
//       const cleanedPaymentMethod = formData.paymentMethod.includes(" ")
//         ? formData.paymentMethod.split(" ")[0]
//         : formData.paymentMethod;

//       const payload = {
//         ...formData,

//         invoiceId,

//         clinicId: myClinic._id,

//         paymentMethod: cleanedPaymentMethod,

//         totalAmount: Number(
//           cart.reduce((sum, item) => sum + item.total, 0).toFixed(2),
//         ),

//         items: cart.map((item) => ({
//           ...item,

//           price: Number(item.price),

//           qty: Number(item.qty),

//           discount: Number(item.discount),

//           gst: Number(item.gst),

//           total: Number(item.total),
//         })),
//       };

//       const response = await axios.post(
//         "https://dms-backend-amber.vercel.app/api/bills/generate",
//         payload,
//         auth,
//       );

//       if (response.data) {
//         setShowModal(false);

//         setCart([]);

//         fetchInitialData();

//         setViewInvoice(response.data);
//       }
//     } catch (err) {
//       console.error("Submission Error:", err.response?.data);

//       alert("Error: " + (err.response?.data?.message || err.message));
//     }
//   };

//   // Separate cart content categories for display mapping

//   const consultationItems =
//     viewInvoice?.items?.filter((item) => item.category === "Consultation") ||
//     [];

//   const therapyItems =
//     viewInvoice?.items?.filter((item) => item.category === "Therapy") || [];

//   const medicineItems =
//     viewInvoice?.items?.filter((item) => item.category === "Medicine") || [];

//   return (
//     <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 text-slate-600">
//       {/* PAGE HEADER OVERVIEW */}

//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 lg:px-8">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
//               Billing
//             </h2>

//             <p className="text-xs text-slate-400 font-medium">
//               Manage Clinic Invoices
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

//               <input
//                 placeholder="Search Name or ID..."
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full sm:w-72 pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-medium text-slate-800"
//               />
//             </div>

//             <button
//               onClick={() => setShowModal(true)}
//               className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
//             >
//               <Plus className="w-4 h-4" />
//               Generate Bill
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* DASHBOARD BILL HISTORY VIEW TABLE */}

//       <div className="w-full mb-10">
//         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
//           <div className="hidden md:block overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-200">
//                   <th className="px-6 py-4 text-xs font-semibold text-slate-500">
//                     Invoice ID
//                   </th>

//                   <th className="px-6 py-4 text-xs font-semibold text-slate-500">
//                     Patient
//                   </th>

//                   <th className="px-6 py-4 text-xs font-semibold text-slate-500">
//                     Mobile
//                   </th>

//                   <th className="px-6 py-4 text-xs font-semibold text-slate-500">
//                     Issue Date
//                   </th>

//                   <th className="px-6 py-4 text-xs font-semibold text-slate-500">
//                     Total Amount
//                   </th>

//                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-center">
//                     Action
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {currentRecords.map((b) => (
//                   <tr
//                     key={b._id}
//                     className="hover:bg-slate-50/50 transition-colors"
//                   >
//                     <td className="px-6 py-4">
//                       <span className="font-mono font-medium text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-md text-xs">
//                         {b.invoiceId}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 font-semibold text-slate-800">
//                       {b.patientName}
//                     </td>

//                     <td className="px-6 py-4 text-sm font-medium text-slate-600">
//                       {b.mobileNo}
//                     </td>

//                     <td className="px-6 py-4 text-xs text-slate-500">
//                       {new Date(b.createdAt).toLocaleDateString()}
//                     </td>

//                     <td className="px-6 py-4 font-bold text-slate-900">
//                       ₹{b.totalAmount.toLocaleString()}
//                     </td>

//                     <td className="px-6 py-4 text-center">
//                       <button
//                         onClick={() => setViewInvoice(b)}
//                         className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all shadow-sm"
//                       >
//                         <Eye className="w-3.5 h-3.5" /> View
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Blocks */}

//           {totalPages > 1 && (
//             <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
//               <span className="text-xs text-slate-400">
//                 Page {currentPage} of {totalPages}
//               </span>

//               <div className="flex items-center gap-1">
//                 <button
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                   className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40"
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                 </button>

//                 <button
//                   disabled={currentPage === totalPages}
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                   className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40"
//                 >
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* --- ENHANCED INVOICE PREVIEW & PRINT MODAL --- */}

//       {viewInvoice &&
//         (() => {
//           const clinic =
//             clinics.find(
//               (c) =>
//                 c._id === (viewInvoice.clinicId?._id || viewInvoice.clinicId),
//             ) ||
//             viewInvoice.clinicId ||
//             {};

//           const items = Array.isArray(viewInvoice.items)
//             ? viewInvoice.items
//             : [];

//           const consultationItems = items.filter(
//             (i) => i.category === "Consultation",
//           );

//           const therapyItems = items.filter((i) => i.category === "Therapy");

//           const medicineItems = items.filter((i) => i.category === "Medicine");

//           const ayurvedicItems = items.filter((i) =>
//             ["Ayurvedic Tab", "Ayurvedic Churan", "Ayurvedic Oil"].includes(
//               i.category,
//             ),
//           );

//           const baseValue = items.reduce(
//             (sum, item) =>
//               sum +
//               Number(
//                 item.base ?? Number(item.price || 0) * Number(item.qty || 1),
//               ),

//             0,
//           );

//           const discountValue = items.reduce(
//             (sum, item) =>
//               sum +
//               Number(
//                 item.discountAmount ??
//                   (Number(item.price || 0) *
//                     Number(item.qty || 1) *
//                     Number(item.discount || 0)) /
//                     100,
//               ),

//             0,
//           );

//           const taxableValue = items.reduce(
//             (sum, item) =>
//               sum +
//               Number(
//                 item.taxableAmount ??
//                   Number(
//                     item.base ??
//                       Number(item.price || 0) * Number(item.qty || 1),
//                   ) - Number(item.discountAmount || 0),
//               ),

//             0,
//           );

//           const gstValue = items.reduce(
//             (sum, item) =>
//               sum +
//               Number(
//                 item.gstAmount ??
//                   (Number(
//                     item.taxableAmount ??
//                       Number(item.price || 0) * Number(item.qty || 1),
//                   ) *
//                     Number(item.gst || 0)) /
//                     100,
//               ),

//             0,
//           );

//           const cgst = gstValue / 2;

//           const sgst = gstValue / 2;

//           const grandTotal = Number(
//             viewInvoice.totalAmount ?? taxableValue + gstValue,
//           );

//           const paymentLabel =
//             String(viewInvoice.paymentMethod || "Cash")
//               .replace(/\s*Payment\s*/i, "")

//               .trim() || "Cash";

//           const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

//           const formatQty = (item) => {
//             const qty = Number(item.qty || 0);

//             const unit = item.unit || "";

//             return `${qty % 1 === 0 ? qty : qty.toFixed(2)}${unit ? ` ${unit}` : ""}`;
//           };

//           const sectionTitle = (title) => (
//             <div className="mt-7 mb-2">
//               <h3 className="text-[13px] font-extrabold tracking-[0.08em] uppercase text-[#91A6C2]">
//                 {title}
//               </h3>

//               <div className="mt-1 border-b border-[#E5EBF2]" />
//             </div>
//           );

//           const renderRows = (sectionItems, type) => {
//             if (!sectionItems.length) return null;

//             return (
//               <div className="mb-1">
//                 {sectionTitle(type)}

//                 <div className="grid grid-cols-[1fr_62px_88px_72px_72px_92px] items-center border-b border-[#E5EBF2] pb-1.5 text-[11px] font-bold text-[#91A6C2]">
//                   <span>
//                     {type === "Consultation Fees"
//                       ? "Fee Description"
//                       : type === "Panchkarma & Therapies"
//                         ? "Therapy Name"
//                         : "Medicine Name"}
//                   </span>

//                   {type !== "Consultation Fees" && (
//                     <span className="text-center">Qty</span>
//                   )}

//                   {type !== "Consultation Fees" && (
//                     <span className="text-right">MRP</span>
//                   )}

//                   {type !== "Consultation Fees" && (
//                     <span className="text-right">Disc %</span>
//                   )}

//                   {type !== "Consultation Fees" && (
//                     <span className="text-right">GST %</span>
//                   )}

//                   <span className="text-right">Amount</span>
//                 </div>

//                 {sectionItems.map((item, idx) => (
//                   <div
//                     key={`${type}-${idx}`}
//                     className={
//                       type === "Consultation Fees"
//                         ? "grid grid-cols-[1fr_92px] items-center py-2 text-[12px] text-[#30415D]"
//                         : "grid grid-cols-[1fr_62px_88px_72px_72px_92px] items-center py-2 text-[12px] text-[#30415D]"
//                     }
//                   >
//                     <div className="pr-2">
//                       <div className="font-medium">{item.name}</div>

//                       {item.category === "Ayurvedic Churan" &&
//                       item.ingredients?.length ? (
//                         <div className="mt-0.5 text-[8px] text-slate-400">
//                           {item.ingredients
//                             .map((x) => `${x.name} ${x.qty}${x.unit || "gm"}`)
//                             .join(" • ")}
//                         </div>
//                       ) : null}
//                     </div>

//                     {type !== "Consultation Fees" && (
//                       <span className="text-center">{formatQty(item)}</span>
//                     )}

//                     {type !== "Consultation Fees" && (
//                       <span className="text-right">
//                         {formatMoney(item.pricePerUnit ?? item.price)}

//                         {item.unit ? (
//                           <small className="block text-[8px] text-slate-400">
//                             / {item.unit}
//                           </small>
//                         ) : null}
//                       </span>
//                     )}

//                     {type !== "Consultation Fees" && (
//                       <span className="text-right">
//                         {Number(item.discount || 0)}%
//                       </span>
//                     )}

//                     {type !== "Consultation Fees" && (
//                       <span className="text-right">
//                         {Number(item.gst || 0)}%
//                       </span>
//                     )}

//                     <span className="text-right font-semibold">
//                       {formatMoney(item.total)}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             );
//           };

//           return (
//             <div
//               id="invoice-print-overlay"
//               className="fixed inset-0 bg-black/80 flex justify-center items-start z-[60] p-4 overflow-y-auto"
//             >
//               <div
//                 id="invoice-print-card"
//                 className="my-4 w-full max-w-[794px] rounded-2xl overflow-hidden shadow-2xl bg-white"
//               >
//                 <div
//                   id="printable-invoice"
//                   className="min-h-[1123px] bg-white px-[40px] py-[48px] text-[#30415D]"
//                 >
//                   {/* Header */}

//                   <div className="flex items-start justify-between border-b border-[#DCE4EE] pb-7">
//                     <div className="flex items-center gap-4">
//                       <img
//                         src="/brandicon.png"
//                         alt="Dhruwraj Logo"
//                         className="h-[48px] w-[48px] object-contain"
//                       />

//                       <div>
//                         <h1 className="text-[20px] leading-none font-extrabold text-[#172238] tracking-[-0.02em]">
//                           {clinic.name || "DHRUWRAJ AYURVEDA & PANCHKARMA"}
//                         </h1>

//                         <p className="mt-2 text-[14px] text-[#71839D]">
//                           {clinic.location || "Vikas Nagar"}
//                           {clinic.city ? `, ${clinic.city}` : ", Kanpur"}
//                         </p>

//                         <p className="mt-1 text-[12px] font-bold tracking-wide text-[#008B83]">
//                           GSTIN: {clinic.gstNumber || "GSTIN"}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#91A6C2]">
//                         Tax Invoice
//                       </div>

//                       <div className="mt-1 text-[19px] font-extrabold tracking-wide text-[#172238]">
//                         #{viewInvoice.invoiceId}
//                       </div>

//                       <div className="mt-1 text-[12px] text-[#667A96]">
//                         {new Date(
//                           viewInvoice.createdAt || Date.now(),
//                         ).toLocaleDateString("en-IN", {
//                           day: "2-digit",

//                           month: "short",

//                           year: "numeric",
//                         })}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Bill To / Payment */}

//                   <div className="mt-7 grid grid-cols-2 rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] px-5 py-4">
//                     <div>
//                       <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#91A6C2]">
//                         Bill To:
//                       </p>

//                       <p className="mt-1 text-[15px] font-extrabold text-[#172238]">
//                         {viewInvoice.patientName}
//                       </p>

//                       <p className="mt-1 text-[13px] text-[#667A96]">
//                         {viewInvoice.mobileNo
//                           ? `+91 ${viewInvoice.mobileNo}`
//                           : ""}
//                       </p>
//                     </div>

//                     <div className="text-right">
//                       <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#91A6C2]">
//                         Payment Info:
//                       </p>

//                       <p className="mt-1 text-[15px] font-extrabold text-[#172238]">
//                         {paymentLabel}
//                       </p>

//                       <p className="mt-1 text-[13px] text-[#667A96]">
//                         Status: Settlement Complete
//                       </p>
//                     </div>
//                   </div>

//                   {/* Sections */}

//                   {renderRows(consultationItems, "Consultation Fees")}

//                   {renderRows(therapyItems, "Panchkarma & Therapies")}

//                   {renderRows(medicineItems, "Pharmacy Dispersals")}

//                   {renderRows(ayurvedicItems, "Ayurvedic Medicines")}

//                   {/* Totals */}

//                   <div className="mt-8 border-t border-[#DCE4EE] pt-5">
//                     <div className="ml-auto w-[280px] space-y-2 text-[12px]">
//                       <div className="flex justify-between text-[#667A96]">
//                         <span>Gross Value:</span>

//                         <span>{formatMoney(baseValue)}</span>
//                       </div>

//                       <div className="flex justify-between text-[#667A96]">
//                         <span>
//                           CGST (@{" "}
//                           {(gstValue
//                             ? items.reduce(
//                                 (s, i) => s + Number(i.gst || 0),
//                                 0,
//                               ) /
//                               Math.max(items.length, 1) /
//                               2
//                             : 0
//                           ).toFixed(1)}
//                           %):
//                         </span>

//                         <span>+ {formatMoney(cgst)}</span>
//                       </div>

//                       <div className="flex justify-between text-[#667A96]">
//                         <span>
//                           SGST (@{" "}
//                           {(gstValue
//                             ? items.reduce(
//                                 (s, i) => s + Number(i.gst || 0),
//                                 0,
//                               ) /
//                               Math.max(items.length, 1) /
//                               2
//                             : 0
//                           ).toFixed(1)}
//                           %):
//                         </span>

//                         <span>+ {formatMoney(sgst)}</span>
//                       </div>

//                       <div className="flex justify-between text-[#00A34A]">
//                         <span>Total Discount :</span>

//                         <span>- {formatMoney(discountValue)}</span>
//                       </div>

//                       <div className="mt-2 flex justify-between border-t border-[#DCE4EE] pt-3 text-[16px] font-extrabold text-[#172238]">
//                         <span>Grand Total :</span>

//                         <span>{formatMoney(grandTotal)}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Footer */}

//                   <div className="mt-12 border-t border-[#E5EBF2] pt-5 text-center">
//                     <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#91A6C2]">
//                       Authorized System Generation
//                     </p>

//                     <p className="mt-2 text-[10px] italic text-[#C3CDDA]">
//                       No physical signature required.
//                     </p>
//                   </div>
//                 </div>

//                 {/* Actions */}

//                 <div className="no-print flex gap-3 bg-slate-900 p-4">
//                   <button
//                     onClick={() => setViewInvoice(null)}
//                     className="flex-1 py-3 text-xs font-bold text-white opacity-70 hover:opacity-100"
//                   >
//                     CLOSE PREVIEW
//                   </button>

//                   <button
//                     onClick={handleWhatsAppShare}
//                     className="flex-[2] rounded-xl bg-green-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-green-500"
//                   >
//                     💬 Share on WhatsApp
//                   </button>

//                   <button
//                     onClick={handlePrintInvoice}
//                     className="flex-[2] rounded-xl bg-teal-500 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-teal-400"
//                   >
//                     🖨️ Print Invoice
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })()}

//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
//           <div className="bg-white w-full max-w-[850px] rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
//             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
//               <div>
//                 <h2 className="text-base font-bold text-slate-900">
//                   Create New Invoice
//                 </h2>

//                 <p className="text-xs text-slate-400">
//                   Add client demographics, select inventory units, and add them
//                   to the bill.
//                 </p>
//               </div>

//               <span className="text-xs font-mono font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-md border border-teal-100">
//                 Invoice ID: {generatedInvoiceId}
//               </span>

//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-slate-300 text-2xl"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto space-y-6">
//               {/* Demographics Setup Section */}

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-500 mb-1">
//                     Patient Name
//                   </label>

//                   <input
//                     type="text"
//                     placeholder="Patient Name"
//                     className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 text-sm outline-none focus:bg-white focus:border-teal-500 transition"
//                     value={formData.patientName}
//                     onChange={(e) => {
//                       let val = e.target.value
//                         .replace(/[^A-Za-z\s]/g, "")
//                         .replace(/\s+/g, " ")
//                         .replace(/^\s/, "");

//                       setFormData({ ...formData, patientName: val });
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-500 mb-1">
//                     Mobile Number
//                   </label>

//                   <input
//                     type="tel"
//                     placeholder="Mobile No"
//                     className={`w-full border p-2.5 rounded-xl text-sm bg-slate-50 outline-none focus:bg-white transition ${formData.mobileNo.length > 0 && formData.mobileNo.length < 10 ? "border-red-400" : "border-slate-200"}`}
//                     value={formData.mobileNo}
//                     maxLength={10}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         mobileNo: e.target.value
//                           .replace(/\D/g, "")
//                           .slice(0, 10),
//                       })
//                     }
//                   />
//                 </div>
//               </div>

//               {/* Consultation Allocation Inputs */}

//               <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
//                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
//                   Consultation Fees
//                 </span>

//                 <div className="flex gap-3 items-end">
//                   <div className="flex-1">
//                     <input
//                       id="cons_input"
//                       placeholder="Consultation Fee (₹)"
//                       className="w-full border border-slate-200 p-2.5 bg-white text-sm rounded-xl outline-none"
//                       type="number"
//                     />
//                   </div>

//                   <button
//                     onClick={() => {
//                       const val = document.getElementById("cons_input").value;

//                       if (val) {
//                         addToCart(
//                           {
//                             name: "Consultation Fee",
//                             price: val,
//                             gst: 0,
//                             discount: 0,
//                           },
//                           "Consultation",
//                         );

//                         document.getElementById("cons_input").value = "";
//                       }
//                     }}
//                     className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 h-[40px] rounded-xl transition"
//                   >
//                     Add Fee
//                   </button>
//                 </div>
//               </div>

//               {/* Therapy Configuration Block */}

//               <div className="space-y-2">
//                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
//                   Therapies & Services
//                 </span>

//                 <div className="grid grid-cols-4 gap-3">
//                   <div className="col-span-3">
//                     <Select
//                       options={therapies.map((t) => ({
//                         label: `${t.name} (₹${t.price})`,
//                         value: t._id,
//                         ...t,
//                       }))}
//                       onChange={(s) =>
//                         setActiveTherapy({
//                           _id: s._id,
//                           name: s.name,
//                           price: s.price,
//                           discount: "",
//                           gst: s.gst || 0,
//                           qty: 1,
//                         })
//                       }
//                       placeholder="Select Therapy..."
//                       styles={{
//                         control: (b) => ({
//                           ...b,
//                           padding: "2px",
//                           borderRadius: "12px",
//                           border: "1px solid #e2e8f0",
//                         }),
//                       }}
//                     />
//                   </div>

//                   <input
//                     placeholder="Disc %"
//                     className="w-full border border-slate-200 p-2 text-sm rounded-xl outline-none"
//                     type="number"
//                     value={activeTherapy.discount}
//                     onChange={(e) =>
//                       setActiveTherapy({
//                         ...activeTherapy,
//                         discount: e.target.value,
//                       })
//                     }
//                   />
//                 </div>

//                 <button
//                   onClick={() => addToCart(activeTherapy, "Therapy")}
//                   className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-xl transition"
//                 >
//                   Add Therapy to Cart
//                 </button>
//               </div>

//               {/* Medicine Section */}

//               <div className="space-y-3">
//                 <div className="grid grid-cols-4 gap-3">
//                   <div className="col-span-3">
//                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
//                       Search Medicine
//                     </p>

//                     <Select
//                       options={inventory
//                         .filter(
//                           (med) =>
//                             ![
//                               "Ayurvedic Tabs",
//                               "Ayurvedic Churans & Bhasams",
//                               "Ayurvedic Oils",
//                             ].includes(med.category) &&
//                             Number(med.quantity) > 0,
//                         )
//                         .map((med) => ({
//                           label: `${med.name} (Stock: ${med.quantity} ${med.quantityType || "Qty"})`,
//                           value: med._id,
//                           ...med,
//                         }))}
//                       onChange={(selected) =>
//                         setActiveMedicine({
//                           ...activeMedicine,
//                           _id: selected?._id || "",
//                           inventoryId: selected?._id || "",
//                           inventoryCategory: selected?.category || "",
//                           name: selected?.name || "",
//                           price: Number(selected?.mrp || 0),
//                           availableStock: Number(selected?.quantity || 0),
//                           unit: selected?.quantityType || "Qty",
//                         })
//                       }
//                       styles={{
//                         control: (base) => ({
//                           ...base,

//                           padding: "4px",

//                           borderRadius: "12px",
//                         }),
//                       }}
//                     />
//                   </div>

//                   <div>
//                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
//                       Qty
//                     </p>

//                     <input
//                       type="number"
//                       value={activeMedicine.qty}
//                       className="border p-3 rounded-xl w-full h-[48px]"
//                       onChange={(e) =>
//                         setActiveMedicine({
//                           ...activeMedicine,

//                           qty: e.target.value,
//                         })
//                       }
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                   <div className="bg-slate-50 p-3 rounded-xl border border-dashed text-center">
//                     <span className="text-[9px] font-bold text-slate-400 uppercase block">
//                       MRP
//                     </span>

//                     <span className="font-bold">
//                       ₹ {activeMedicine.price || "0.00"}
//                     </span>
//                   </div>

//                   <select
//                     className="border p-3 rounded-xl"
//                     value={activeMedicine.gst}
//                     onChange={(e) =>
//                       setActiveMedicine({
//                         ...activeMedicine,

//                         gst: e.target.value,
//                       })
//                     }
//                   >
//                     <option value="5">5% GST</option>

//                     <option value="12">12% GST</option>
//                   </select>

//                   <input
//                     type="number"
//                     value={activeMedicine.discount}
//                     placeholder="Disc %"
//                     className="border p-3 rounded-xl w-full"
//                     onChange={(e) =>
//                       setActiveMedicine({
//                         ...activeMedicine,

//                         discount: e.target.value,
//                       })
//                     }
//                   />
//                 </div>

//                 <button
//                   onClick={() => {
//                     if (!activeMedicine.inventoryId || !activeMedicine.name) {
//                       alert("Please select a medicine from inventory.");
//                       return;
//                     }

//                     const qty = Number(activeMedicine.qty || 0);
//                     const stock = Number(activeMedicine.availableStock || 0);

//                     if (qty <= 0) {
//                       alert("Please enter a valid quantity.");
//                       return;
//                     }

//                     if (qty > stock) {
//                       alert(
//                         `Only ${stock} ${activeMedicine.unit || "units"} available in stock.`,
//                       );
//                       return;
//                     }

//                     addToCart(activeMedicine, "Medicine");
//                   }}
//                   className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-black shadow-lg"
//                 >
//                   Add Medicine to Cart
//                 </button>
//               </div>

//               {/* =====================================================
//                 AYURVEDIC MEDICINES
//             ===================================================== */}
//               <div className="space-y-4 border-t border-slate-100 pt-6">
//                 <div>
//                   <p className="text-[10px] font-black text-teal-600 uppercase tracking-wider">
//                     Ayurvedic Medicines
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1">
//                     Select medicine type. Unit price is fixed automatically.
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                   {[
//                     ["tab", "Ayurvedic Tab"],
//                     ["churan", "Ayurvedic Churan"],
//                     ["oil", "Ayurvedic Oil"],
//                   ].map(([value, label]) => (
//                     <button
//                       key={value}
//                       type="button"
//                       onClick={() => setAyurvedicType(value)}
//                       className={`p-4 rounded-xl border text-sm font-bold transition ${ayurvedicType === value
//                           ? "bg-teal-600 text-white border-teal-600 shadow-md"
//                           : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
//                         }`}
//                     >
//                       {label}
//                     </button>
//                   ))}
//                 </div>

//                 {/* TAB */}
//                 {ayurvedicType === "tab" && (
//                   <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
//                     <div className="grid grid-cols-4 gap-3">
//                       <div className="col-span-2">
//                         <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
//                           Select Tablet
//                         </p>
//                         <Select
//                           options={ayurvedicTabs.map((tab) => ({
//                             label: `${tab.name} — ₹${Number(tab.pricePerTab).toFixed(2)}/Tab • Stock: ${tab.stock} Tab`,
//                             value: tab.id,
//                             ...tab,
//                             isDisabled: Number(tab.stock) <= 0,
//                           }))}
//                           value={
//                             ayurvedicTab.name
//                               ? {
//                                 label: `${ayurvedicTab.name} — ₹${Number(
//                                   ayurvedicTab.pricePerTab,
//                                 ).toFixed(2)}/Tab`,
//                                 value: ayurvedicTab.name,
//                               }
//                               : null
//                           }
//                           onChange={(selected) =>
//                             setAyurvedicTab((prev) => ({
//                               ...prev,
//                               _id: selected?._id || "",
//                               inventoryId: selected?._id || "",
//                               name: selected?.name || "",
//                               pricePerTab: Number(selected?.pricePerTab || 0),
//                               stock: Number(selected?.stock || 0),
//                             }))
//                           }
//                           placeholder={
//                             ayurvedicTabs.length
//                               ? "Search Ayurvedic Tablet..."
//                               : "No Ayurvedic tablets in stock"
//                           }
//                           styles={{
//                             control: (base) => ({
//                               ...base,
//                               padding: "4px",
//                               borderRadius: "12px",
//                             }),
//                           }}
//                         />
//                       </div>

//                       <div>
//                         <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
//                           Qty (Tab)
//                         </p>
//                         <input
//                           type="number"
//                           min="1"
//                           step="1"
//                           value={ayurvedicTab.qty}
//                           onChange={(e) =>
//                             setAyurvedicTab((prev) => ({
//                               ...prev,
//                               qty: e.target.value,
//                             }))
//                           }
//                           className="border p-3 rounded-xl w-full h-[48px] bg-white"
//                         />
//                       </div>

//                       <div className="bg-white border border-dashed rounded-xl p-3 text-center">
//                         <span className="text-[9px] font-bold text-slate-400 uppercase block">
//                           Price / Tab
//                         </span>
//                         <span className="font-black text-teal-700">
//                           ₹{Number(ayurvedicTab.pricePerTab || 0).toFixed(2)}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex justify-between bg-white border rounded-xl p-4">
//                       <div>
//                         <p className="text-[9px] uppercase text-slate-400 font-bold">
//                           Calculation
//                         </p>
//                         <p className="text-sm font-bold text-slate-700">
//                           {ayurvedicTab.qty || 0} Tab × ₹
//                           {Number(ayurvedicTab.pricePerTab || 0).toFixed(2)}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-[9px] uppercase text-slate-400 font-bold">
//                           Subtotal
//                         </p>
//                         <p className="text-lg font-black text-teal-700">
//                           ₹
//                           {(
//                             Number(ayurvedicTab.qty || 0) *
//                             Number(ayurvedicTab.pricePerTab || 0)
//                           ).toFixed(2)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                       <select
//                         value={ayurvedicTab.gst}
//                         onChange={(e) =>
//                           setAyurvedicTab((prev) => ({
//                             ...prev,
//                             gst: e.target.value,
//                           }))
//                         }
//                         className="border p-3 rounded-xl bg-white"
//                       >
//                         <option value="5">5% GST</option>
//                         <option value="12">12% GST</option>
//                         <option value="0">0% GST</option>
//                       </select>

//                       <input
//                         type="number"
//                         min="0"
//                         placeholder="Discount %"
//                         value={ayurvedicTab.discount}
//                         onChange={(e) =>
//                           setAyurvedicTab((prev) => ({
//                             ...prev,
//                             discount: e.target.value,
//                           }))
//                         }
//                         className="border p-3 rounded-xl bg-white"
//                       />
//                     </div>

//                     <button
//                       type="button"
//                       onClick={addAyurvedicTabToCart}
//                       className="w-full bg-slate-800 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md"
//                     >
//                       Add Ayurvedic Tab to Cart
//                     </button>
//                   </div>
//                 )}

//                 {/* CHURAN */}
//                 {ayurvedicType === "churan" && (
//                   <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
//                     {/* BHASAM */}
//                     <div>
//                       <div className="flex justify-between items-center mb-3">
//                         <div>
//                           <p className="text-[10px] font-black text-slate-700 uppercase">
//                             Bhasam
//                           </p>
//                           <p className="text-[9px] text-slate-400">
//                             Maximum 2 Bhasams
//                           </p>
//                         </div>

//                         <button
//                           type="button"
//                           disabled={
//                             ayurvedicChuran.bhasams.length >= MAX_BHASAM
//                           }
//                           onClick={addBhasam}
//                           className="text-xs font-bold text-teal-600 disabled:text-slate-300"
//                         >
//                           + Add Bhasam
//                         </button>
//                       </div>

//                       {ayurvedicChuran.bhasams.length === 0 && (
//                         <div className="bg-white border border-dashed rounded-xl p-4 text-center text-xs text-slate-400">
//                           No Bhasam added
//                         </div>
//                       )}

//                       <div className="space-y-3">
//                         {ayurvedicChuran.bhasams.map((item, index) => (
//                           <div
//                             key={item.id}
//                             className="bg-white border rounded-xl p-3"
//                           >
//                             <div className="grid grid-cols-5 gap-2 items-end">
//                               <div className="col-span-2">
//                                 <label className="text-[8px] uppercase font-bold text-slate-400">
//                                   Bhasam {index + 1}
//                                 </label>
//                                 <Select
//                                   options={ayurvedicBhasams.map((bhasam) => ({
//                                     label: `${bhasam.name} — ₹${Number(
//                                       bhasam.pricePerGram,
//                                     ).toFixed(
//                                       2,
//                                     )}/gm • Stock: ${bhasam.stock} gm`,
//                                     value: bhasam.id,
//                                     ...bhasam,
//                                     isDisabled: Number(bhasam.stock) <= 0,
//                                   }))}
//                                   value={
//                                     item.name
//                                       ? {
//                                         label: `${item.name} — ₹${Number(
//                                           item.pricePerGram,
//                                         ).toFixed(2)}/gm`,
//                                         value: item.name,
//                                       }
//                                       : null
//                                   }
//                                   onChange={(selected) => {
//                                     updateBhasam(
//                                       item.id,
//                                       "_id",
//                                       selected?._id || "",
//                                     );
//                                     updateBhasam(
//                                       item.id,
//                                       "inventoryId",
//                                       selected?._id || "",
//                                     );
//                                     updateBhasam(
//                                       item.id,
//                                       "name",
//                                       selected?.name || "",
//                                     );
//                                     updateBhasam(
//                                       item.id,
//                                       "pricePerGram",
//                                       Number(selected?.pricePerGram || 0),
//                                     );
//                                     updateBhasam(
//                                       item.id,
//                                       "stock",
//                                       Number(selected?.stock || 0),
//                                     );
//                                   }}
//                                   placeholder={
//                                     ayurvedicBhasams.length
//                                       ? "Select Bhasam"
//                                       : "No Bhasam in stock"
//                                   }
//                                   styles={{
//                                     control: (base) => ({
//                                       ...base,
//                                       minHeight: "44px",
//                                       borderRadius: "12px",
//                                     }),
//                                   }}
//                                 />
//                               </div>

//                               <div>
//                                 <label className="text-[8px] uppercase font-bold text-slate-400">
//                                   Qty (gm)
//                                 </label>
//                                 <input
//                                   type="number"
//                                   min="0.001"
//                                   step="0.001"
//                                   value={item.qty}
//                                   onChange={(e) =>
//                                     updateBhasam(item.id, "qty", e.target.value)
//                                   }
//                                   className="border p-2.5 rounded-xl w-full"
//                                 />
//                               </div>

//                               <div className="bg-slate-50 border rounded-xl p-2.5 text-center">
//                                 <span className="text-[8px] uppercase font-bold text-slate-400 block">
//                                   ₹ / gm
//                                 </span>
//                                 <span className="text-sm font-black text-teal-700">
//                                   ₹{Number(item.pricePerGram || 0).toFixed(2)}
//                                 </span>
//                               </div>

//                               <button
//                                 type="button"
//                                 onClick={() => removeBhasam(item.id)}
//                                 className="text-red-400 font-bold py-3"
//                               >
//                                 ✕
//                               </button>
//                             </div>

//                             {item.name && (
//                               <div className="text-right mt-2">
//                                 <span className="text-[10px] text-slate-400">
//                                   {item.qty} gm × ₹
//                                   {Number(item.pricePerGram).toFixed(2)}/gm
//                                   ={" "}
//                                 </span>
//                                 <span className="font-black text-teal-700">
//                                   ₹
//                                   {(
//                                     Number(item.qty || 0) *
//                                     Number(item.pricePerGram || 0)
//                                   ).toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* CHURAN INGREDIENTS */}
//                     <div>
//                       <div className="flex justify-between items-center mb-3">
//                         <div>
//                           <p className="text-[10px] font-black text-slate-700 uppercase">
//                             Churan
//                           </p>
//                           <p className="text-[9px] text-slate-400">
//                             Maximum 3 Churans
//                           </p>
//                         </div>

//                         <button
//                           type="button"
//                           disabled={
//                             ayurvedicChuran.churans.length >= MAX_CHURAN
//                           }
//                           onClick={addChuran}
//                           className="text-xs font-bold text-teal-600 disabled:text-slate-300"
//                         >
//                           + Add Churan
//                         </button>
//                       </div>

//                       {ayurvedicChuran.churans.length === 0 && (
//                         <div className="bg-white border border-dashed rounded-xl p-4 text-center text-xs text-slate-400">
//                           No Churan added
//                         </div>
//                       )}

//                       <div className="space-y-3">
//                         {ayurvedicChuran.churans.map((item, index) => (
//                           <div
//                             key={item.id}
//                             className="bg-white border rounded-xl p-3"
//                           >
//                             <div className="grid grid-cols-5 gap-2 items-end">
//                               <div className="col-span-2">
//                                 <label className="text-[8px] uppercase font-bold text-slate-400">
//                                   Churan {index + 1}
//                                 </label>
//                                 <Select
//                                   options={ayurvedicChurans.map((churan) => ({
//                                     label: `${churan.name} — ₹${Number(
//                                       churan.pricePerGram,
//                                     ).toFixed(
//                                       2,
//                                     )}/gm • Stock: ${churan.stock} gm`,
//                                     value: churan.id,
//                                     ...churan,
//                                     isDisabled: Number(churan.stock) <= 0,
//                                   }))}
//                                   value={
//                                     item.name
//                                       ? {
//                                         label: `${item.name} — ₹${Number(
//                                           item.pricePerGram,
//                                         ).toFixed(2)}/gm`,
//                                         value: item.name,
//                                       }
//                                       : null
//                                   }
//                                   onChange={(selected) => {
//                                     updateChuran(
//                                       item.id,
//                                       "_id",
//                                       selected?._id || "",
//                                     );
//                                     updateChuran(
//                                       item.id,
//                                       "inventoryId",
//                                       selected?._id || "",
//                                     );
//                                     updateChuran(
//                                       item.id,
//                                       "name",
//                                       selected?.name || "",
//                                     );
//                                     updateChuran(
//                                       item.id,
//                                       "pricePerGram",
//                                       Number(selected?.pricePerGram || 0),
//                                     );
//                                     updateChuran(
//                                       item.id,
//                                       "stock",
//                                       Number(selected?.stock || 0),
//                                     );
//                                   }}
//                                   placeholder={
//                                     ayurvedicChurans.length
//                                       ? "Select Churan"
//                                       : "No Churan in stock"
//                                   }
//                                   styles={{
//                                     control: (base) => ({
//                                       ...base,
//                                       minHeight: "44px",
//                                       borderRadius: "12px",
//                                     }),
//                                   }}
//                                 />
//                               </div>

//                               <div>
//                                 <label className="text-[8px] uppercase font-bold text-slate-400">
//                                   Qty (gm)
//                                 </label>
//                                 <input
//                                   type="number"
//                                   min="0.001"
//                                   step="0.001"
//                                   value={item.qty}
//                                   onChange={(e) =>
//                                     updateChuran(item.id, "qty", e.target.value)
//                                   }
//                                   className="border p-2.5 rounded-xl w-full"
//                                 />
//                               </div>

//                               <div className="bg-slate-50 border rounded-xl p-2.5 text-center">
//                                 <span className="text-[8px] uppercase font-bold text-slate-400 block">
//                                   ₹ / gm
//                                 </span>
//                                 <span className="text-sm font-black text-teal-700">
//                                   ₹{Number(item.pricePerGram || 0).toFixed(2)}
//                                 </span>
//                               </div>

//                               <button
//                                 type="button"
//                                 onClick={() => removeChuran(item.id)}
//                                 className="text-red-400 font-bold py-3"
//                               >
//                                 ✕
//                               </button>
//                             </div>

//                             {item.name && (
//                               <div className="text-right mt-2">
//                                 <span className="text-[10px] text-slate-400">
//                                   {item.qty} gm × ₹
//                                   {Number(item.pricePerGram).toFixed(2)}/gm
//                                   ={" "}
//                                 </span>
//                                 <span className="font-black text-teal-700">
//                                   ₹
//                                   {(
//                                     Number(item.qty || 0) *
//                                     Number(item.pricePerGram || 0)
//                                   ).toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* CHURAN SUMMARY */}
//                     <div className="bg-white border-2 border-dashed border-teal-200 rounded-xl p-4">
//                       <div className="grid grid-cols-3 gap-3">
//                         <div>
//                           <p className="text-[9px] uppercase font-bold text-slate-400">
//                             Ingredients
//                           </p>
//                           <p className="font-bold text-slate-700">
//                             {ayurvedicChuran.bhasams.length} Bhasam +{" "}
//                             {ayurvedicChuran.churans.length} Churan
//                           </p>
//                         </div>

//                         <div className="text-center">
//                           <p className="text-[9px] uppercase font-bold text-slate-400">
//                             Total Quantity
//                           </p>
//                           <p className="font-black text-slate-700">
//                             {[
//                               ...ayurvedicChuran.bhasams,
//                               ...ayurvedicChuran.churans,
//                             ]
//                               .reduce(
//                                 (sum, item) => sum + Number(item.qty || 0),
//                                 0,
//                               )
//                               .toFixed(3)}{" "}
//                             gm
//                           </p>
//                         </div>

//                         <div className="text-right">
//                           <p className="text-[9px] uppercase font-bold text-slate-400">
//                             Churan Total
//                           </p>
//                           <p className="text-lg font-black text-teal-700">
//                             ₹
//                             {[
//                               ...ayurvedicChuran.bhasams,
//                               ...ayurvedicChuran.churans,
//                             ]
//                               .reduce(
//                                 (sum, item) =>
//                                   sum +
//                                   Number(item.qty || 0) *
//                                   Number(item.pricePerGram || 0),
//                                 0,
//                               )
//                               .toFixed(2)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={addAyurvedicChuranToCart}
//                       className="w-full bg-slate-800 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md"
//                     >
//                       Add Ayurvedic Churan to Cart
//                     </button>
//                   </div>
//                 )}

//                 {/* OIL */}
//                 {ayurvedicType === "oil" && (
//                   <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
//                     <div className="grid grid-cols-4 gap-3">
//                       <div className="col-span-2">
//                         <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
//                           Select Ayurvedic Oil
//                         </p>
//                         <Select
//                           options={ayurvedicOils.map((oil) => ({
//                             label: `${oil.name} — ₹${Number(oil.pricePerMl).toFixed(2)}/ml • Stock: ${oil.stock} ml`,
//                             value: oil.id,
//                             ...oil,
//                             isDisabled: Number(oil.stock) <= 0,
//                           }))}
//                           value={
//                             ayurvedicOil.name
//                               ? {
//                                 label: `${ayurvedicOil.name} — ₹${Number(
//                                   ayurvedicOil.pricePerMl,
//                                 ).toFixed(2)}/ml`,
//                                 value: ayurvedicOil.name,
//                               }
//                               : null
//                           }
//                           onChange={(selected) =>
//                             setAyurvedicOil((prev) => ({
//                               ...prev,
//                               _id: selected?._id || "",
//                               inventoryId: selected?._id || "",
//                               name: selected?.name || "",
//                               pricePerMl: Number(selected?.pricePerMl || 0),
//                               stock: Number(selected?.stock || 0),
//                             }))
//                           }
//                           placeholder={
//                             ayurvedicOils.length
//                               ? "Search Ayurvedic Oil..."
//                               : "No Ayurvedic oils in stock"
//                           }
//                           styles={{
//                             control: (base) => ({
//                               ...base,
//                               padding: "4px",
//                               borderRadius: "12px",
//                             }),
//                           }}
//                         />
//                       </div>

//                       <div>
//                         <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
//                           Qty (ml)
//                         </p>
//                         <input
//                           type="number"
//                           min="0.001"
//                           step="0.001"
//                           value={ayurvedicOil.qty}
//                           onChange={(e) =>
//                             setAyurvedicOil((prev) => ({
//                               ...prev,
//                               qty: e.target.value,
//                             }))
//                           }
//                           className="border p-3 rounded-xl w-full h-[48px] bg-white"
//                         />
//                       </div>

//                       <div className="bg-white border border-dashed rounded-xl p-3 text-center">
//                         <span className="text-[9px] font-bold text-slate-400 uppercase block">
//                           Price / ml
//                         </span>
//                         <span className="font-black text-teal-700">
//                           ₹{Number(ayurvedicOil.pricePerMl || 0).toFixed(2)}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex justify-between bg-white border rounded-xl p-4">
//                       <div>
//                         <p className="text-[9px] uppercase text-slate-400 font-bold">
//                           Calculation
//                         </p>
//                         <p className="text-sm font-bold text-slate-700">
//                           {ayurvedicOil.qty || 0} ml × ₹
//                           {Number(ayurvedicOil.pricePerMl || 0).toFixed(2)}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-[9px] uppercase text-slate-400 font-bold">
//                           Subtotal
//                         </p>
//                         <p className="text-lg font-black text-teal-700">
//                           ₹
//                           {(
//                             Number(ayurvedicOil.qty || 0) *
//                             Number(ayurvedicOil.pricePerMl || 0)
//                           ).toFixed(2)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-3">
//                       <select
//                         value={ayurvedicOil.gst}
//                         onChange={(e) =>
//                           setAyurvedicOil((prev) => ({
//                             ...prev,
//                             gst: e.target.value,
//                           }))
//                         }
//                         className="border p-3 rounded-xl bg-white"
//                       >
//                         <option value="5">5% GST</option>
//                         <option value="12">12% GST</option>
//                         <option value="0">0% GST</option>
//                       </select>

//                       <input
//                         type="number"
//                         min="0"
//                         placeholder="Discount %"
//                         value={ayurvedicOil.discount}
//                         onChange={(e) =>
//                           setAyurvedicOil((prev) => ({
//                             ...prev,
//                             discount: e.target.value,
//                           }))
//                         }
//                         className="border p-3 rounded-xl bg-white"
//                       />
//                     </div>

//                     <button
//                       type="button"
//                       onClick={addAyurvedicOilToCart}
//                       className="w-full bg-slate-800 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md"
//                     >
//                       Add Ayurvedic Oil to Cart
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Cart Summary (Live Cart) */}

//               <div className="bg-teal-50 border-2 border-dashed border-teal-200 rounded-2xl p-5">
//                 <div className="flex justify-between items-center mb-4">
//                   <p className="text-xs font-bold text-teal-600 uppercase">
//                     Live Cart Items
//                   </p>

//                   <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full">
//                     {cart.length} Total
//                   </span>
//                 </div>

//                 {cart.length === 0 ? (
//                   <p className="text-center text-slate-400 py-4 italic text-sm">
//                     Cart is empty
//                   </p>
//                 ) : (
//                   <div className="space-y-2">
//                     {cart.map((item, index) => (
//                       <div
//                         key={index}
//                         className="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm"
//                       >
//                         <div className="flex flex-col">
//                           <span className="font-medium text-slate-700">
//                             {item.name}
//                           </span>

//                           <span className="text-slate-400 text-[10px] uppercase">
//                             {item.category} • {item.qty} {item.unit || "Qty"}
//                           </span>
//                         </div>

//                         <div className="flex gap-4 items-center">
//                           <span className="font-black text-teal-700">
//                             ₹{item.total.toFixed(2)}
//                           </span>

//                           <button
//                             onClick={() =>
//                               setCart(cart.filter((_, i) => i !== index))
//                             }
//                             className="text-red-400 font-bold"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       </div>
//                     ))}

//                     <div className="border-t border-teal-200 pt-3 mt-4 flex justify-between font-black text-lg text-teal-800">
//                       <span>Grand Total</span>

//                       <span>
//                         ₹{cart.reduce((s, i) => s + i.total, 0).toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Form Action Submissions Bar */}

//             <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-4">
//               <select
//                 className="border border-slate-200 p-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-white outline-none focus:border-teal-500"
//                 onChange={(e) =>
//                   setFormData({ ...formData, paymentMethod: e.target.value })
//                 }
//               >
//                 <option value="Cash Payment">💵 Cash Payment</option>

//                 <option value="UPI Payment">📱 UPI Payment</option>
//               </select>

//               <button
//                 onClick={handleGenerateBill}
//                 className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xl shadow-sm flex-1 transition-all"
//               >
//                 Generate Final Invoice
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Billing;
