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
    _id: "",

    inventoryId: "",

    inventoryCategory: "",

    name: "",

    price: "",

    qty: 1,

    unit: "Qty",

    availableStock: 0,

    gst: 5,

    discount: 0,
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

  // Ayurvedic products are loaded from the same clinic inventory used by regular medicines.

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
      const [clinicRes, billRes, therapyRes] = await Promise.all([
        axios.get("https://dms-backend-amber.vercel.app/api/clinics", auth),

        axios.get("https://dms-backend-amber.vercel.app/api/bills", auth),

        axios.get("https://dms-backend-amber.vercel.app/api/therapies", auth),
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
      `https://dms-backend-amber.vercel.app/api/medicine/clinic/${selectedClinic}`,

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
    const invoiceId = previewData?.invoiceId || "Invoice";
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
    if (!selectedClinic) {
      alert("Please select a clinic.");
      return;
    }

    if (!formData.patientName?.trim()) {
      alert("Please enter patient name.");
      return;
    }

    if (!cart.length) {
      alert("Please add at least one item to the cart.");
      return;
    }

    const normalizedItems = cart.map((item) => {
      const qty = Number(item.qty) || 1;
      const price = Number(item.price) || 0;
      const gst = Number(item.gst) || 0;
      const discount = Number(item.discount) || 0;

      const baseAmount = price * qty;
      const discountAmount = baseAmount * (discount / 100);
      const taxableAmount = baseAmount - discountAmount;
      const gstAmount = taxableAmount * (gst / 100);
      const total = taxableAmount + gstAmount;

      return {
        name: String(item.name || "Item"),
        category: String(item.category || "Medicine"),
        qty,
        unit: item.unit || "Qty",
        price,
        pricePerUnit: Number(item.pricePerUnit ?? price),
        gst,
        discount,
        base: Number(baseAmount.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        taxableAmount: Number(taxableAmount.toFixed(2)),
        gstAmount: Number(gstAmount.toFixed(2)),
        total: Number(total.toFixed(2)),

        // Inventory identity is sent for every stock-backed line.
        ...(item.inventoryId
          ? {
              inventoryId: item.inventoryId,
              inventoryCategory: item.inventoryCategory || undefined,
              ayurvedicSubtype: item.ayurvedicSubtype || undefined,
              availableStock:
                item.availableStock != null
                  ? Number(item.availableStock)
                  : undefined,
            }
          : {}),

        // Ayurvedic-specific fields. Normal items simply omit these.
        ...(item.pricePerGram != null
          ? { pricePerGram: Number(item.pricePerGram) }
          : {}),
        ...(item.pricePerMl != null
          ? { pricePerMl: Number(item.pricePerMl) }
          : {}),
        ...(item.ingredients
          ? {
              ingredients: item.ingredients.map((ingredient) => ({
                _id: ingredient._id || undefined,
                inventoryId:
                  ingredient.inventoryId || ingredient._id || undefined,
                inventoryCategory:
                  ingredient.inventoryCategory || "Ayurvedic Churans & Bhasams",
                name: String(ingredient.name || ""),
                type: String(
                  ingredient.type ||
                    (String(ingredient.ayurvedicSubtype || "").toLowerCase() ===
                    "bhasam"
                      ? "Bhasam"
                      : "Churan"),
                ),
                ayurvedicSubtype:
                  ingredient.ayurvedicSubtype ||
                  (String(ingredient.type || "").toLowerCase() === "bhasam"
                    ? "Bhasam"
                    : "Churan"),
                qty: Number(ingredient.qty) || 0,
                unit: ingredient.unit || "gm",
                pricePerGram:
                  ingredient.pricePerGram != null
                    ? Number(ingredient.pricePerGram)
                    : undefined,
                availableStock:
                  ingredient.stock != null
                    ? Number(ingredient.stock)
                    : undefined,
              })),
            }
          : {}),
        ...(item.totalGm != null ? { totalGm: Number(item.totalGm) } : {}),
      };
    });

    const totalAmount = Number(
      normalizedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2),
    );

    const payload = {
      patientName: formData.patientName.trim(),
      mobileNo: String(formData.mobileNo || "").trim(),
      consultationFee: Number(formData.consultationFee) || 0,
      clinicId: selectedClinic,
      invoiceId: generatedInvoiceId,
      paymentMethod: formData.paymentMethod?.includes(" ")
        ? formData.paymentMethod.split(" ")[0]
        : formData.paymentMethod || "Cash",
      totalAmount,
      items: normalizedItems,
    };

    try {
      const res = await axios.post(
        "https://dms-backend-amber.vercel.app/api/bills/generate",
        payload,
        auth,
      );

      if (!res.data) {
        throw new Error("Server returned an empty bill response.");
      }

      setPreviewData(res.data);
      setShowPreview(true);
      setShowModal(false);
      setCart([]);

      await fetchInitialData();
    } catch (err) {
      console.error("BILL GENERATION ERROR:", err);
      console.error("SERVER RESPONSE:", err.response?.data);

      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message;

      alert(
        serverMessage ||
          (err.response
            ? `Error generating bill (${err.response.status})`
            : `Error generating bill: ${err.message}`),
      );
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

                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

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

      {showPreview &&
        previewData &&
        (() => {
          const clinic =
            clinics.find(
              (c) =>
                c._id === (previewData.clinicId?._id || previewData.clinicId),
            ) ||
            previewData.clinicId ||
            {};

          const items = Array.isArray(previewData.items)
            ? previewData.items
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
            previewData.totalAmount ?? taxableValue + gstValue,
          );

          const paymentLabel =
            String(previewData.paymentMethod || "Cash")
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
                        #{previewData.invoiceId}
                      </div>

                      <div className="mt-1 text-[12px] text-[#667A96]">
                        {new Date(
                          previewData.createdAt || Date.now(),
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
                        {previewData.patientName}
                      </p>

                      <p className="mt-1 text-[13px] text-[#667A96]">
                        {previewData.mobileNo
                          ? `+91 ${previewData.mobileNo}`
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
                    onClick={() => setShowPreview(false)}
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
    </div>
  );
};

export default Invoice;
