import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Plus,
  Printer,
  Search,
  X,
  Receipt,
  ShoppingBag,
  IndianRupee,
  CreditCard,
  UserRound,
  CalendarDays,
  Clock3,
  ChevronRight,
  Store,
  Trash2,
  Save,
} from "lucide-react";

import { useStore } from "../context/StoreContext";
import SaleForm from "../components/SaleForm";
import Invoice from "../components/Invoice";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";

export default function Sales() {
  const { sales, settings, categories = [], createOutsideSale } = useStore();

  const [salesPageSize, setSalesPageSize] = useState(() => { const n=Number(localStorage.getItem("page-size:sales")); return [10,20,50].includes(n)?n:10; });
  const [salesPage, setSalesPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [search, setSearch] = useState("");

  /* =====================================================
     OUTSIDE SALE
     Product inventory ko touch nahi karta.
     Invoice locally generate hota hai.
  ===================================================== */

  const [outsideSaleOpen, setOutsideSaleOpen] = useState(false);
  const [outsideSaleSaving, setOutsideSaleSaving] = useState(false);

  const [outsideSale, setOutsideSale] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "Cash",
    discount: 0,
    items: [],
  });

  // Keep the dashboard/page behind an open sale modal from scrolling.
  useEffect(() => {
    const modalOpen = open || outsideSaleOpen;
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [open, outsideSaleOpen]);

  const [outsideProduct, setOutsideProduct] = useState({
    productName: "",
    category: "",
    sellingPrice: "",
    quantity: 1,
  });

  /* =====================================================
     OUTSIDE SALE HELPERS
  ===================================================== */

  const toNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const number = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(number) ? number : 0;
  };

  const capitalizeWords = (value) =>
    String(value || "").replace(/(^|\s)([a-z])/g, (_, space, letter) =>
      `${space}${letter.toUpperCase()}`
    );

  const updateOutsideProduct = (field, value) => {
    setOutsideProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addOutsideProduct = () => {
    const productName = String(
      outsideProduct.productName || ""
    ).trim();

    const category = String(
      outsideProduct.category || ""
    ).trim();

    const sellingPrice = Math.max(
      0,
      toNumber(outsideProduct.sellingPrice)
    );

    const quantity = Math.max(
      1,
      Math.floor(toNumber(outsideProduct.quantity))
    );

    if (!productName) {
      alert("Please enter product name.");
      return;
    }

    if (!category) {
      alert("Please enter category.");
      return;
    }

    if (sellingPrice <= 0) {
      alert("Please enter a valid sale price.");
      return;
    }

    const itemAmount = quantity * sellingPrice;

    setOutsideSale((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          outsideSale: true,
          itemId: `OUT-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`,
          productId: "",
          productName,
          category,
          sellingPrice,
          quantity,
          discount: 0,
          total: itemAmount,
        },
      ],
    }));

    setOutsideProduct({
      productName: "",
      category: "",
      sellingPrice: "",
      quantity: 1,
    });
  };

  const removeOutsideProduct = (itemId) => {
    setOutsideSale((prev) => ({
      ...prev,
      items: prev.items.filter(
        (item) => item.itemId !== itemId
      ),
    }));
  };

  const outsideSubtotal = useMemo(
    () =>
      outsideSale.items.reduce(
        (total, item) =>
          total +
          toNumber(item.quantity) *
            toNumber(item.sellingPrice),
        0
      ),
    [outsideSale.items]
  );

  const outsideDiscount = Math.min(
    outsideSubtotal,
    Math.max(0, toNumber(outsideSale.discount))
  );

  const outsideGrandTotal = Math.max(
    0,
    outsideSubtotal - outsideDiscount
  );

  // The preview is intentionally driven directly from the current form state.
  // This also shows the product currently being typed before it is added.
  const outsidePreviewItems = useMemo(() => {
    const savedItems = outsideSale.items.map((item) => ({
      ...item,
      discount: 0,
      total: toNumber(item.quantity) * toNumber(item.sellingPrice),
    }));

    const draftName = String(outsideProduct.productName || "").trim();
    const draftPrice = toNumber(outsideProduct.sellingPrice);
    const draftQty = Math.max(0, Math.floor(toNumber(outsideProduct.quantity)));
    const draftCategory = String(outsideProduct.category || "").trim();

    if (draftName || draftPrice > 0 || draftCategory) {
      savedItems.push({
        itemId: "OUT-DRAFT",
        productId: "",
        productName: draftName || "Product name...",
        category: draftCategory,
        sellingPrice: draftPrice,
        quantity: draftQty || 1,
        discount: 0,
        total: (draftQty || 1) * draftPrice,
        isDraft: true,
      });
    }

    return savedItems;
  }, [outsideSale.items, outsideProduct]);

  const outsidePreviewSubtotal = useMemo(
    () => outsidePreviewItems.reduce(
      (sum, item) => sum + toNumber(item.quantity) * toNumber(item.sellingPrice),
      0
    ),
    [outsidePreviewItems]
  );
  const outsidePreviewDiscount = Math.min(
    outsidePreviewSubtotal,
    Math.max(0, toNumber(outsideSale.discount))
  );
  const outsidePreviewGrandTotal = Math.max(
    0,
    outsidePreviewSubtotal - outsidePreviewDiscount
  );

  // Live invoice model used by the Outside Sale bill preview.
  // It intentionally mirrors the saved sale shape so the preview matches
  // the final invoice without creating or calling any API.
  const outsidePreviewSale = useMemo(
    () => ({
      invoiceNo: "DRAFT-INVOICE",
      saleId: "DRAFT-INVOICE",
      saleType: "Outside Sale",
      date: new Date().toISOString(),
      saleDate: new Date().toISOString(),
      time: new Date().toISOString(),
      saleTime: new Date().toISOString(),
      customerName:
        outsideSale.customerName.trim() || "Outside Customer",
      customerPhone: outsideSale.customerPhone.trim(),
      paymentMethod: outsideSale.paymentMethod || "Cash",
      items: outsidePreviewItems,
      products: outsidePreviewItems,
      subtotal: outsidePreviewSubtotal,
      discount: outsidePreviewDiscount,
      total: outsidePreviewGrandTotal,
      totalAmount: outsidePreviewGrandTotal,
      grandTotal: outsidePreviewGrandTotal,
    }),
    [
      outsideSale.customerName,
      outsideSale.customerPhone,
      outsideSale.paymentMethod,
      outsideSale.items,
      outsideProduct,
      outsidePreviewItems,
      outsidePreviewSubtotal,
      outsidePreviewDiscount,
      outsidePreviewGrandTotal,
    ]
  );

  const resetOutsideSale = () => {
    setOutsideSale({
      customerName: "",
      customerPhone: "",
      paymentMethod: "Cash",
      discount: 0,
      items: [],
    });

    setOutsideProduct({
      productName: "",
      category: "",
      sellingPrice: "",
      quantity: 1,
    });
  };

  const closeOutsideSale = () => {
    if (outsideSaleSaving) return;
    setOutsideSaleOpen(false);
    resetOutsideSale();
  };

  const saveOutsideSale = async () => {
    if (outsideSaleSaving) return;

    if (outsideSale.items.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    setOutsideSaleSaving(true);

    try {
      const now = new Date();

      const invoiceNo = undefined;

      const payload = {
        saleId: invoiceNo,
        invoiceNo,
        saleType: "Outside Sale",
        customerName:
          outsideSale.customerName.trim() ||
          "Outside Customer",
        customerPhone:
          outsideSale.customerPhone.trim(),
        paymentMethod:
          outsideSale.paymentMethod || "Cash",
        date: now,
        saleDate: now,
        time: now,
        saleTime: now,
        items: outsideSale.items.map((item) => ({
          ...item,
          saleId: invoiceNo,
          invoiceNo,
          saleType: "Outside Sale",
        })),
        subtotal: outsideSubtotal,
        discount: outsideDiscount,
        total: outsideGrandTotal,
        totalAmount: outsideGrandTotal,
        grandTotal: outsideGrandTotal,
        createdAt: now,
      };

      const saved = await createOutsideSale(payload);
      setInvoice({ ...payload, ...(saved || {}), items: saved?.items || payload.items, products: saved?.products || payload.items });
      setOutsideSaleOpen(false);
      resetOutsideSale();
    } catch (error) {
      console.error("OUTSIDE SALE ERROR:", error);
      alert(
        error?.message ||
          "Outside sale could not be saved."
      );
    } finally {
      setOutsideSaleSaving(false);
    }
  };

  /* =====================================================
     GROUP SALES BY INVOICE
  ===================================================== */

  const invoices = useMemo(() => {
    const map = {};

    (sales || []).forEach((sale) => {
      const invoiceNo =
        sale.invoiceNo ||
        sale.saleId ||
        "UNKNOWN";

      if (!map[invoiceNo]) {
        map[invoiceNo] = {
          invoiceNo,

          saleId:
            sale.saleId || "",

          date:
            sale.saleDate ||
            sale.date ||
            null,

          time:
            sale.saleTime ||
            sale.time ||
            "",

          customerName:
            sale.customerName || "",

          customerPhone:
            sale.customerPhone || "",

          paymentMethod:
            sale.paymentMethod || "",

          items: [],

          subtotal: 0,
          discount: 0,
          total: 0,
        };
      }

      const quantity = Number(
        sale.quantity || 0
      );

      const sellingPrice = Number(
        sale.sellingPrice || 0
      );

      const discount = Number(
        sale.discount || 0
      );

      const itemTotal = Number(
        sale.total ??
          sale.totalAmount ??
          Math.max(
            0,
            quantity * sellingPrice - discount
          )
      );

      map[invoiceNo].items.push({
        ...sale,
        quantity,
        sellingPrice,
        discount,
        total: itemTotal,
      });

      map[invoiceNo].subtotal +=
        quantity * sellingPrice;

      map[invoiceNo].discount +=
        discount;

      map[invoiceNo].total +=
        itemTotal;
    });

    return Object.values(map).sort(
      (a, b) => {
        const dateA = a.date
          ? new Date(a.date).getTime()
          : 0;

        const dateB = b.date
          ? new Date(b.date).getTime()
          : 0;

        return dateB - dateA;
      }
    );
  }, [sales]);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredInvoices = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return invoices;
    }

    return invoices.filter((item) => {
      const invoiceNo = String(
        item.invoiceNo || ""
      ).toLowerCase();

      const customerName = String(
        item.customerName || ""
      ).toLowerCase();

      const customerPhone = String(
        item.customerPhone || ""
      ).toLowerCase();

      return (
        invoiceNo.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query)
      );
    });
  }, [invoices, search]);

  useEffect(() => { localStorage.setItem("page-size:sales", String(salesPageSize)); setSalesPage(1); }, [salesPageSize]);
  const pagedInvoices = useMemo(() => filteredInvoices.slice((salesPage-1)*salesPageSize, salesPage*salesPageSize), [filteredInvoices, salesPage, salesPageSize]);
  useEffect(() => { const max=Math.max(1,Math.ceil(filteredInvoices.length/salesPageSize)); if(salesPage>max) setSalesPage(max); }, [filteredInvoices.length, salesPageSize, salesPage]);

  /* =====================================================
     TOTAL ITEMS
  ===================================================== */

  const totalItemsSold = useMemo(() => {
    return invoices.reduce(
      (total, invoiceItem) => {
        return (
          total +
          invoiceItem.items.reduce(
            (sum, item) =>
              sum + Number(item.quantity || 0),
            0
          )
        );
      },
      0
    );
  }, [invoices]);

  /* =====================================================
     TOTAL REVENUE
  ===================================================== */

  const totalRevenue = useMemo(() => {
    return invoices.reduce(
      (total, item) =>
        total + Number(item.total || 0),
      0
    );
  }, [invoices]);

  /* =====================================================
     TODAY'S SALES
  ===================================================== */

  const todaysSales = useMemo(() => {
    const today = new Date();

    return invoices.reduce(
      (total, item) => {
        if (!item.date) {
          return total;
        }

        const date = new Date(item.date);

        if (Number.isNaN(date.getTime())) {
          return total;
        }

        const sameDay =
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();

        if (!sameDay) {
          return total;
        }

        return (
          total +
          Number(item.total || 0)
        );
      },
      0
    );
  }, [invoices]);

  /* =====================================================
     FORMAT CURRENCY
  ===================================================== */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    if (date.getFullYear() < 2000) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  function formatTime(invoiceData) {
    const value =
      invoiceData?.time ||
      invoiceData?.saleTime ||
      "";

    if (!value) {
      const dateValue =
        invoiceData?.date ||
        invoiceData?.saleDate;

      if (!dateValue) {
        return "-";
      }

      const date = new Date(dateValue);

      if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() < 2000
      ) {
        return "-";
      }

      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );
    }

    if (
      typeof value === "string" &&
      value.includes("T")
    ) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        );
      }
    }

    if (
      typeof value === "string" &&
      (value.includes("1899") ||
        value.includes("1900"))
    ) {
      const match = value.match(
        /T(\d{2}):(\d{2})(?::(\d{2}))?/
      );

      if (match) {
        let hour = Number(match[1]);

        const minute = match[2];
        const second = match[3] || "00";

        const ampm =
          hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${String(hour).padStart(
          2,
          "0"
        )}:${minute}:${second} ${ampm}`;
      }
    }

    if (typeof value === "string") {
      const match = value.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?/
      );

      if (match) {
        let hour = Number(match[1]);

        const minute = match[2];
        const second = match[3] || "";

        const ampm =
          hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${String(hour).padStart(
          2,
          "0"
        )}:${minute}${
          second ? `:${second}` : ""
        } ${ampm}`;
      }
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );
    }

    return "-";
  }

  /* =====================================================
     PAYMENT STYLE
  ===================================================== */

  function getPaymentStyle(payment) {
    const value = String(
      payment || ""
    ).toLowerCase();

    if (
      value.includes("cash")
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (
      value.includes("upi") ||
      value.includes("online")
    ) {
      return "bg-violet-50 text-violet-700 border-violet-100";
    }

    if (
      value.includes("card")
    ) {
      return "bg-blue-50 text-blue-700 border-blue-100";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  }

  /* =====================================================
     VIEW INVOICE
  ===================================================== */

  const viewInvoice = (sale) => {
    setInvoice(sale);
  };

  /* =====================================================
     PRINT INVOICE
  ===================================================== */

  const printInvoice = () => {
    const element =
      document.getElementById("invoice");

    if (!element) {
      alert("Invoice not found.");
      return;
    }

    const w = window.open(
      "",
      "_blank",
      "width=900,height=900"
    );

    if (!w) {
      alert(
        "Please allow popups to print the invoice."
      );
      return;
    }

    const styles = Array.from(
      document.querySelectorAll(
        'link[rel="stylesheet"], style'
      )
    )
      .map(
        (node) => node.outerHTML
      )
      .join("\n");

    w.document.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>
            Invoice - ${
              invoice?.invoiceNo ||
              "Invoice"
            }
          </title>

          ${styles}

          <style>

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: white;
              color: #111827;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            body {
              padding: 20px;
            }

            #invoice {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              background: white !important;
            }

            table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
            }

            th,
            td {
              box-sizing: border-box !important;
              vertical-align: top !important;
            }

            th:nth-child(2),
            td:nth-child(2) {
              width: 34% !important;
              text-align: left !important;
              word-break: break-word !important;
              overflow-wrap: anywhere !important;
            }

            th:nth-child(3),
            td:nth-child(3) {
              width: 10% !important;
              text-align: center !important;
            }

            th:nth-child(4),
            td:nth-child(4) {
              width: 16% !important;
              text-align: right !important;
              white-space: nowrap !important;
            }

            th:nth-child(5),
            td:nth-child(5) {
              width: 16% !important;
              text-align: right !important;
              white-space: nowrap !important;
            }

            th:nth-child(6),
            td:nth-child(6) {
              width: 18% !important;
              text-align: right !important;
              white-space: nowrap !important;
            }

            #invoice
              .flex.justify-end {
              display: flex !important;
              justify-content: flex-end !important;
              width: 100% !important;
            }

            #invoice
              .text-right {
              text-align: right !important;
            }

            #invoice
              .bg-slate-900 {
              width: 100% !important;
              display: grid !important;
              grid-template-columns:
                1fr 150px !important;
              align-items: center !important;
            }

            #invoice
              .bg-slate-900
              span:last-child {
              text-align: right !important;
              white-space: nowrap !important;
            }

            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            #invoice > div {
              page-break-inside: avoid;
            }

            @page {
              size: A4;
              margin: 10mm;
            }

            @media print {

              html,
              body {
                width: 100%;
                margin: 0;
                padding: 0;
              }

              body {
                padding: 0;
              }

              #invoice {
                width: 100% !important;
                max-width: 100% !important;
                padding: 20px !important;
                margin: 0 !important;
              }

            }

          </style>

        </head>

        <body>

          ${element.outerHTML}

        </body>

      </html>
    `);

    w.document.close();

    setTimeout(() => {
      w.focus();

      setTimeout(() => {
        w.print();

        setTimeout(() => {
          w.close();
        }, 500);
      }, 500);
    }, 800);
  };

  /* =====================================================
     CLEAR SEARCH
  ===================================================== */

  function clearSearch() {
    setSearch("");
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <Receipt size={20} />
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Sales Management
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Sales & Invoices
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create, review and manage your store transactions.
            </p>

          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-blue-600 sales-new-sale-shadow"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
              <Plus size={17} />
            </span>

            New Sale

            <ChevronRight
              size={16}
              className="transition group-hover:translate-x-0.5"
            />
          </button>

          <button
            type="button"
            onClick={() => setOutsideSaleOpen(true)}
            className="group flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-100 sales-outside-shadow"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
              <Store size={17} />
            </span>

            Outside Sale

            <ChevronRight
              size={16}
              className="transition group-hover:translate-x-0.5"
            />
          </button>
          </div>

        </div>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* INVOICES */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Invoices
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {invoices.length}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                All transactions
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-105">
              <Receipt size={21} />
            </div>

          </div>

        </div>

        {/* REVENUE */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Revenue
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalRevenue)}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Overall sales
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
              <IndianRupee size={21} />
            </div>

          </div>

        </div>

        {/* TODAY */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Today's Sales
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(todaysSales)}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Sales generated today
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:scale-105">
              <CalendarDays size={21} />
            </div>

          </div>

        </div>

        {/* ITEMS */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Items Sold
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {totalItemsSold}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Total quantity sold
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
              <ShoppingBag size={21} />
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          SEARCH AREA
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search invoice, customer name or phone..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}

          </div>

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Receipt size={15} />
              </span>

              <span>
                {search
                  ? `${filteredInvoices.length} results`
                  : `${invoices.length} invoices`}
              </span>

            </div>

            {search && (
              <span className="max-w-[180px] truncate rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                “{search}”
              </span>
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          SALES TABLE
      ================================================= */}

      {filteredInvoices.length ? (

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="font-semibold text-slate-900">
                Recent Transactions
              </h2>

              <p className="text-xs text-slate-400">
                Your latest invoices and payments
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Live sales data

            </div>

          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Invoice
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date & Time
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Items
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {pagedInvoices.map(
                  (sale) => (
                    <tr
                      key={sale.invoiceNo}
                      className="group border-b border-slate-100 last:border-0 transition hover:bg-slate-50/80"
                    >

                      {/* INVOICE */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Receipt size={18} />
                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {sale.invoiceNo}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Invoice
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* CUSTOMER */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <UserRound size={15} />
                          </div>

                          <div className="min-w-0">

                            <p className="max-w-[170px] truncate font-medium text-slate-700">
                              {sale.customerName ||
                                "Walk-in Customer"}
                            </p>

                            {sale.customerPhone && (
                              <p className="text-xs text-slate-400">
                                {sale.customerPhone}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          <div>

                            <p className="font-medium text-slate-700">
                              {formatDate(
                                sale.date
                              )}
                            </p>

                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">

                              <Clock3 size={11} />

                              {formatTime(
                                sale
                              )}

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ITEMS */}

                      <td className="px-5 py-4">

                        <div className="max-w-[210px]">

                          {sale.items
                            .slice(0, 2)
                            .map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={index}
                                  className="truncate text-xs text-slate-600"
                                >
                                  <span className="font-medium">
                                    {item.productName ||
                                      "Product"}
                                  </span>

                                  <span className="text-slate-400">
                                    {" "}
                                    ×{" "}
                                    {item.quantity}
                                  </span>
                                </div>
                              )
                            )}

                          {sale.items.length >
                            2 && (
                            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              +
                              {sale.items.length -
                                2}{" "}
                              more
                            </span>
                          )}

                        </div>

                      </td>

                      {/* TOTAL */}

                      <td className="px-5 py-4 text-right">

                        <p className="font-bold text-slate-900">
                          {formatCurrency(
                            sale.total
                          )}
                        </p>

                        {sale.discount > 0 && (
                          <p className="mt-0.5 text-xs text-emerald-600">
                            Discount ₹
                            {Number(
                              sale.discount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        )}

                      </td>

                      {/* PAYMENT */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getPaymentStyle(
                            sale.paymentMethod
                          )}`}
                        >

                          <CreditCard size={13} />

                          {sale.paymentMethod ||
                            "Unknown"}

                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            viewInvoice(
                              sale
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >

                          <Eye size={16} />

                          View

                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          <Pagination page={salesPage} pageSize={salesPageSize} total={filteredInvoices.length} onPageChange={setSalesPage} onPageSizeChange={setSalesPageSize} storageKey="sales" />

          {/* MOBILE CARDS */}

          <div className="divide-y divide-slate-100 md:hidden">

            {pagedInvoices.map(
              (sale) => (
                <div
                  key={sale.invoiceNo}
                  className="p-4 transition active:bg-slate-50"
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Receipt size={19} />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-bold text-slate-800">
                          {sale.invoiceNo}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {sale.customerName ||
                            "Walk-in Customer"}
                        </p>

                      </div>

                    </div>

                    <p className="shrink-0 font-bold text-slate-900">
                      {formatCurrency(
                        sale.total
                      )}
                    </p>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-50 p-3">

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarDays size={13} />
                        Date
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDate(
                          sale.date
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock3 size={13} />
                        Time
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatTime(
                          sale
                        )}
                      </p>

                    </div>

                  </div>

                  {/* ITEMS */}

                  <div className="mt-3 rounded-xl border border-slate-100 p-3">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Items
                    </p>

                    <div className="space-y-1">

                      {sale.items
                        .slice(0, 3)
                        .map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >

                              <span className="min-w-0 truncate text-slate-600">
                                {item.productName ||
                                  "Product"}
                              </span>

                              <span className="ml-3 shrink-0 font-medium text-slate-700">
                                ×{" "}
                                {item.quantity}
                              </span>

                            </div>
                          )
                        )}

                      {sale.items.length >
                        3 && (
                        <p className="pt-1 text-xs text-slate-400">
                          +
                          {sale.items.length -
                            3}{" "}
                          more items
                        </p>
                      )}

                    </div>

                  </div>

                  {/* BOTTOM */}

                  <div className="mt-4 flex items-center justify-between gap-3">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getPaymentStyle(
                        sale.paymentMethod
                      )}`}
                    >
                      <CreditCard size={13} />

                      {sale.paymentMethod ||
                        "Unknown"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        viewInvoice(
                          sale
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                    >
                      <Eye size={16} />
                      View Invoice
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      ) : (

        <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">

          <EmptyState
            title={
              search
                ? "No matching sales found"
                : "No sales yet"
            }
            text={
              search
                ? "Try searching with another customer name, phone or invoice number."
                : "Create your first sale to see transactions here."
            }
          />

        </div>

      )}

      {/* =================================================
          NEW SALE
      ================================================= */}

      <SaleForm
        open={open}
        onClose={() =>
          setOpen(false)
        }
        onCompleted={(sale) => {
          setInvoice(sale);
        }}
      />

      {/* =================================================
          OUTSIDE SALE MODAL
      ================================================= */}

      {outsideSaleOpen && (
        <div className="sale-dialog fixed inset-0 z-50 flex h-[100dvh] w-full items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4 lg:p-5">

          <div className="sale-dialog-panel flex h-full w-full max-w-[1800px] flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl ring-1 ring-white/10 sm:h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-2.5rem)]">

            {/* OUTSIDE SALE HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                  <Store size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Create Outside Sale
                  </h2>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    Add products without affecting your inventory stock.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeOutsideSale}
                disabled={outsideSaleSaving}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-3 lg:p-4">
              <div className="sale-workspace grid h-full min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] xl:grid-cols-[minmax(0,1fr)_minmax(400px,500px)] xl:items-stretch">

                <div className="sale-form-scroll min-w-0 min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-4">

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Store size={17} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Outside Sale
                </h3>
                <p className="text-xs text-slate-500">
                  Product inventory se deduct nahi hoga.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={outsideSale.customerName}
                  onChange={(e) =>
                    setOutsideSale((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder="Customer name"
                  onBlur={() => setOutsideSale((prev) => ({ ...prev, customerName: capitalizeWords(prev.customerName) }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Customer Mobile
                </label>
                <input
                  type="text"
                  value={outsideSale.customerPhone}
                  onChange={(e) =>
                    setOutsideSale((prev) => ({
                      ...prev,
                      customerPhone: e.target.value,
                    }))
                  }
                  placeholder="Mobile number"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Payment Method
                </label>
                <select
                  value={outsideSale.paymentMethod}
                  onChange={(e) =>
                    setOutsideSale((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Credit</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900">
                Add Product
              </h3>
              <p className="text-xs text-slate-500">
                Ye product sirf is outside sale ke invoice me rahega.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={outsideProduct.productName}
                  onChange={(e) =>
                    updateOutsideProduct(
                      "productName",
                      e.target.value
                    )
                  }
                  placeholder="Enter product name"
                  onBlur={() => updateOutsideProduct("productName", capitalizeWords(outsideProduct.productName))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Category *
                </label>
                <select
                  value={outsideProduct.category}
                  onChange={(e) =>
                    updateOutsideProduct(
                      "category",
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                >
                  <option value="">Select category</option>
                  {categories
                    .filter((category) => {
                      const name = String(
                        category?.name ||
                          category?.categoryName ||
                          ""
                      ).trim();
                      return Boolean(name);
                    })
                    .map((category) => {
                      const name = String(
                        category?.name ||
                          category?.categoryName ||
                          ""
                      ).trim();

                      return (
                        <option
                          key={
                            category?.categoryId ||
                            name
                          }
                          value={name}
                        >
                          {name}
                        </option>
                      );
                    })}
                </select>

                {categories.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-600">
                    No categories found in the database.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Sale Price *
                </label>
                <input
                  type="number"
                  min="0"
                  value={outsideProduct.sellingPrice}
                  onChange={(e) =>
                    updateOutsideProduct(
                      "sellingPrice",
                      e.target.value
                    )
                  }
                  placeholder="₹ Sale price"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={outsideProduct.quantity}
                  onChange={(e) =>
                    updateOutsideProduct(
                      "quantity",
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />
              </div>

            </div>

            <button
              type="button"
              onClick={addOutsideProduct}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus size={17} />
              Add Product
            </button>
          </div>

          {outsideSale.items.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Added Products
                    </h3>
                    <p className="text-xs text-slate-500">
                      {outsideSale.items.length} product(s)
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Outside
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {outsideSale.items.map((item, index) => (
                  <div
                    key={item.itemId}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">
                            {index + 1}
                          </span>
                          <h4 className="truncate font-semibold text-slate-800">
                            {item.productName}
                          </h4>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            {item.category}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            Price: {formatCurrency(item.sellingPrice)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeOutsideProduct(item.itemId)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                        title="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-500">
                        Item Total
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(outsideSubtotal)}
                </span>
              </div>

              <div className="max-w-sm">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Discount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={outsideSubtotal}
                    step="0.01"
                    value={outsideSale.discount}
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        Math.min(outsideSubtotal, toNumber(e.target.value))
                      );
                      setOutsideSale((prev) => ({
                        ...prev,
                        discount: value,
                      }));
                    }}
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-sm font-semibold text-red-600 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Discount subtotal se minus hoga.
                </p>
              </div>
            </div>

            <div className="flex min-h-[150px] flex-col justify-center rounded-2xl bg-emerald-600 px-5 py-5 text-white shadow-lg shadow-emerald-600/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                    Grand Total
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {formatCurrency(outsideGrandTotal)}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <IndianRupee size={21} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-xs text-emerald-50">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(outsideSubtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-emerald-50">
                <span>Discount</span>
                <span className="font-semibold">- {formatCurrency(outsideDiscount)}</span>
              </div>
            </div>
          </div>

                </div>

                {/* LIVE OUTSIDE SALE BILL PREVIEW */}
                <div className="sale-preview min-w-0 min-h-0 flex h-full max-h-full flex-col overflow-hidden">
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-slate-100 shadow-sm">
                    <div className="flex items-center justify-between border-b border-emerald-100 bg-white px-4 py-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                          BILL PREVIEW
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-800">
                          Live Outside Sale invoice
                        </p>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        {outsideSale.paymentMethod || "Cash"}
                      </span>
                    </div>

                    <div className="sale-preview-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2 sm:p-3">
                      <div className="sale-receipt mx-auto w-full max-w-[430px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                        <Invoice
                          sale={outsidePreviewSale}
                          settings={settings}
                          compact
                        />
                      </div>
                    </div>

                    <div className="shrink-0 border-t border-emerald-100 bg-white p-3 sm:p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={closeOutsideSale}
                          disabled={outsideSaleSaving}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveOutsideSale}
                          disabled={outsideSaleSaving || outsideSale.items.length === 0}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Save size={17} />
                          {outsideSaleSaving ? "Saving..." : "Save & Generate Bill"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          INVOICE MODAL
      ================================================= */}

      <Modal
        open={!!invoice}
        onClose={() =>
          setInvoice(null)
        }
        title="Invoice / Receipt"
      >

        <Invoice
          sale={invoice}
          settings={settings}
        />

        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              setInvoice(null)
            }
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={printInvoice}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-600"
          >
            <Printer size={17} />
            Print / Save PDF
          </button>

        </div>

      </Modal>

    </div>
  );
}