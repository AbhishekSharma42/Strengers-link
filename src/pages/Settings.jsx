import { useEffect, useState } from "react";
import {
  Save,
  Store,
  MapPin,
  ReceiptText,
  Phone,
  Mail,
  User,
  FileText,
  Pencil,
  X,
  Package,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from "lucide-react";

import { useStore } from "../context/StoreContext";

export default function Settings() {
  const {
    settings = {},
    updateSettings,
    saving = false,
  } = useStore();

  /* =====================================================
     EDIT MODE
  ===================================================== */

  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("store-theme") || "light");

  const changeTheme = (next) => {
    setTheme(next);
    localStorage.setItem("store-theme", next);
    document.documentElement.dataset.theme = next;
  };

  /* =====================================================
     TOAST
  ===================================================== */

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  /* =====================================================
     FORM STATE
  ===================================================== */

  const [f, setF] = useState({
    storeName: "",
    ownerName: "",
    storeAddress: "",
    phone: "",
    email: "",
    gstNumber: "",
    currency: "INR",
    lowStockLimit: 10,
  });

  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  useEffect(() => {
    setF({
      storeName: settings?.storeName ?? "",
      ownerName: settings?.ownerName ?? "",
      storeAddress: settings?.storeAddress ?? "",
      phone: settings?.phone ?? "",
      email: settings?.email ?? "",
      gstNumber: settings?.gstNumber ?? "",
      currency: settings?.currency ?? "INR",

      lowStockLimit:
        settings?.lowStockLimit ??
        settings?.minStock ??
        10,
    });
  }, [settings]);

  /* =====================================================
     AUTO HIDE TOAST
  ===================================================== */

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast.show]);

  /* =====================================================
     SET FIELD
  ===================================================== */

  function set(key, value) {
    setF((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  /* =====================================================
     SHOW TOAST
  ===================================================== */

  function showToast(type, message) {
    setToast({
      show: true,
      type,
      message,
    });
  }

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  function openEdit() {
    setF({
      storeName: settings?.storeName ?? "",
      ownerName: settings?.ownerName ?? "",
      storeAddress: settings?.storeAddress ?? "",
      phone: settings?.phone ?? "",
      email: settings?.email ?? "",
      gstNumber: settings?.gstNumber ?? "",
      currency: settings?.currency ?? "INR",

      lowStockLimit:
        settings?.lowStockLimit ??
        settings?.minStock ??
        10,
    });

    setEditing(true);
  }

  /* =====================================================
     CLOSE EDIT
  ===================================================== */

  function closeEdit() {
    if (saving) return;

    setEditing(false);

    setF({
      storeName: settings?.storeName ?? "",
      ownerName: settings?.ownerName ?? "",
      storeAddress: settings?.storeAddress ?? "",
      phone: settings?.phone ?? "",
      email: settings?.email ?? "",
      gstNumber: settings?.gstNumber ?? "",
      currency: settings?.currency ?? "INR",

      lowStockLimit:
        settings?.lowStockLimit ??
        settings?.minStock ??
        10,
    });
  }

  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  async function submit(e) {
    e.preventDefault();

    if (saving) return;

    const storeName = String(
      f.storeName || ""
    ).trim();

    if (!storeName) {
      showToast(
        "error",
        "Please enter your shop name."
      );
      return;
    }

    const lowStockLimit = Number(
      f.lowStockLimit
    );

    if (
      !Number.isFinite(lowStockLimit) ||
      lowStockLimit < 0
    ) {
      showToast(
        "error",
        "Low stock limit must be 0 or greater."
      );
      return;
    }

    const payload = {
      storeName,

      ownerName: String(
        f.ownerName || ""
      ).trim(),

      storeAddress: String(
        f.storeAddress || ""
      ).trim(),

      phone: String(
        f.phone || ""
      ).trim(),

      email: String(
        f.email || ""
      ).trim(),

      gstNumber: String(
        f.gstNumber || ""
      )
        .trim()
        .toUpperCase(),

      currency:
        f.currency || "INR",

      lowStockLimit,
    };

    try {
      await updateSettings(payload);

      setEditing(false);

      showToast(
        "success",
        "Settings saved successfully."
      );
    } catch (error) {
      console.error(
        "SETTINGS SAVE ERROR:",
        error
      );

      showToast(
        "error",
        error?.message ||
          "Settings save nahi ho payi."
      );
    }
  }

  /* =====================================================
     CURRENCY LABEL
  ===================================================== */

  function getCurrencyLabel() {
    const currency =
      settings?.currency || "INR";

    if (currency === "USD") {
      return "USD - $ US Dollar";
    }

    if (currency === "EUR") {
      return "EUR - € Euro";
    }

    return "INR - ₹ Indian Rupee";
  }

  /* =====================================================
     EMPTY VALUE
  ===================================================== */

  function valueOrDash(value) {
    return value || "Not provided";
  }

  /* =====================================================
     VIEW MODE
  ===================================================== */

  return (
    <div className="relative min-h-full w-full pb-10">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/70 p-5 shadow-sm sm:p-6 settings-page-header">

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <SettingsIcon size={22} />
            </div>

            <div>
              <div className="mb-1 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                Store Configuration
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your shop information,
                billing and inventory preferences.
              </p>
            </div>

          </div>

          {/* EDIT BUTTON */}

          {!editing && (
            <button
              type="button"
              onClick={openEdit}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600 active:translate-y-0"
            >
              <Pencil size={17} />
              Edit Settings
            </button>
          )}

        </div>

      </div>

      {/* =================================================
          MODERN VIEW
      ================================================= */}

      {!editing && (
        <div className="space-y-5">

          {/* =================================================
              APPEARANCE
          ================================================= */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm appearance-card">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">Appearance</h2>
                <p className="mt-1 text-xs text-slate-500">Choose light or dark mode. This preference is saved only in this browser cache.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                onClick={() => changeTheme(theme === "dark" ? "light" : "dark")}
                className={`group relative inline-flex h-11 w-[92px] shrink-0 items-center rounded-full border p-1 transition-all duration-300 focus:outline-none focus:ring-4 ${theme === "dark" ? "justify-end border-slate-600 bg-slate-800 focus:ring-slate-700/40" : "justify-start border-slate-200 bg-slate-100 focus:ring-blue-100"}`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${theme === "dark" ? "bg-slate-950 text-amber-300" : "bg-white text-amber-500"}`}>
                  {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </span>
                <span className={`absolute text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "left-3 text-slate-300" : "right-3 text-slate-500"}`}>
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </button>
            </div>
          </div>

          {/* =================================================
              SHOP PROFILE CARD
          ================================================= */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shop-info-card">

            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <Store size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Shop Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Your basic shop and contact details
                  </p>
                </div>

              </div>

            </div>

            <div className="p-5 sm:p-6">

              {/* SHOP NAME HERO */}

              <div className="mb-5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 p-5 text-white">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Store size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300">
                      Store Name
                    </p>

                    <h3 className="mt-1 truncate text-xl font-bold">
                      {valueOrDash(
                        settings?.storeName
                      )}
                    </h3>
                  </div>

                </div>

              </div>

              {/* INFORMATION GRID */}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {/* OWNER */}

                <InfoCard
                  icon={User}
                  label="Owner Name"
                  value={valueOrDash(
                    settings?.ownerName
                  )}
                />

                {/* PHONE */}

                <InfoCard
                  icon={Phone}
                  label="Mobile Number"
                  value={valueOrDash(
                    settings?.phone
                  )}
                />

                {/* EMAIL */}

                <InfoCard
                  icon={Mail}
                  label="Email"
                  value={valueOrDash(
                    settings?.email
                  )}
                />

                {/* GST */}

                <InfoCard
                  icon={FileText}
                  label="GST Number"
                  value={valueOrDash(
                    settings?.gstNumber
                  )}
                />

                {/* CURRENCY */}

                <InfoCard
                  icon={CreditCard}
                  label="Currency"
                  value={getCurrencyLabel()}
                />

                {/* LOW STOCK */}

                <InfoCard
                  icon={Package}
                  label="Low Stock Limit"
                  value={`${Number(
                    settings?.lowStockLimit ??
                      settings?.minStock ??
                      10
                  )} units`}
                />

              </div>

              {/* ADDRESS */}

              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="rounded-xl bg-white p-2.5 text-slate-600 shadow-sm">
                    <MapPin size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Shop Address
                    </p>

                    <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
                      {valueOrDash(
                        settings?.storeAddress
                      )}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              INVENTORY CARD
          ================================================= */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 settings-edit-card">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <ReceiptText size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Invoice & Inventory
                </h2>

                <p className="text-xs text-slate-500">
                  Current billing and stock preferences
                </p>
              </div>

            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Currency
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-800">
                      {settings?.currency ||
                        "INR"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {getCurrencyLabel()}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 text-emerald-600 shadow-sm">
                    <CreditCard size={20} />
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Low Stock Alert
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-800">
                      {Number(
                        settings?.lowStockLimit ??
                          settings?.minStock ??
                          10
                      )}{" "}
                      Units
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Stock at or below this
                      level is considered low.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 text-orange-500 shadow-sm">
                    <Package size={20} />
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          EDIT FORM
      ================================================= */}

      {editing && (
        <form
          onSubmit={submit}
          className="mx-auto w-full max-w-5xl"
        >

          {/* EDIT HEADER */}

          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between settings-edit-header">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-600 p-2.5 text-white">
                <Pencil size={18} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Edit Store Settings
                </h2>

                <p className="text-xs text-slate-500">
                  Update your store information below.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={closeEdit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <X size={16} />
              Cancel Editing
            </button>

          </div>

          <div className="space-y-5">

            {/* =================================================
                SHOP INFORMATION
            ================================================= */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionHeader
                icon={Store}
                title="Shop Information"
                description="Basic information about your shop."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <FormInput
                  icon={Store}
                  label="Shop Name"
                  required
                  value={f.storeName}
                  disabled={saving}
                  placeholder="Enter shop name"
                  onChange={(e) =>
                    set(
                      "storeName",
                      e.target.value
                    )
                  }
                />

                <FormInput
                  icon={User}
                  label="Owner Name"
                  value={f.ownerName}
                  disabled={saving}
                  placeholder="Enter owner name"
                  onChange={(e) =>
                    set(
                      "ownerName",
                      e.target.value
                    )
                  }
                />

                <FormInput
                  icon={Phone}
                  label="Mobile Number"
                  type="tel"
                  value={f.phone}
                  disabled={saving}
                  placeholder="Enter mobile number"
                  onChange={(e) =>
                    set(
                      "phone",
                      e.target.value
                    )
                  }
                />

                <FormInput
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={f.email}
                  disabled={saving}
                  placeholder="Enter email"
                  onChange={(e) =>
                    set(
                      "email",
                      e.target.value
                    )
                  }
                />

                <FormInput
                  icon={FileText}
                  label="GST Number"
                  value={f.gstNumber}
                  disabled={saving}
                  placeholder="Enter GST number"
                  uppercase
                  onChange={(e) =>
                    set(
                      "gstNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                />

                {/* CURRENCY */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Currency
                  </label>

                  <div className="relative">

                    <CreditCard
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={f.currency}
                      disabled={saving}
                      onChange={(e) =>
                        set(
                          "currency",
                          e.target.value
                        )
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="INR">
                        INR - ₹ Indian Rupee
                      </option>

                      <option value="USD">
                        USD - $ US Dollar
                      </option>

                      <option value="EUR">
                        EUR - € Euro
                      </option>
                    </select>

                  </div>
                </div>

              </div>

              {/* ADDRESS */}

              <div className="mt-4">

                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <MapPin size={14} />
                  Shop Address
                </label>

                <textarea
                  value={f.storeAddress}
                  disabled={saving}
                  rows={4}
                  placeholder="Enter complete shop address"
                  onChange={(e) =>
                    set(
                      "storeAddress",
                      e.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

              </div>

            </div>

            {/* =================================================
                INVENTORY
            ================================================= */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionHeader
                icon={ReceiptText}
                title="Invoice & Inventory"
                description="Configure your billing and stock warning preferences."
              />

              <div className="mt-6 max-w-md">

                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Low Stock Limit
                </label>

                <div className="relative">

                  <Package
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={f.lowStockLimit}
                    disabled={saving}
                    onChange={(e) =>
                      set(
                        "lowStockLimit",
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Stock at or below this quantity
                  will be considered low stock.
                </p>

              </div>

            </div>

            {/* =================================================
                SAVE AREA
            ================================================= */}

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Save your changes
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Your updated settings will be
                    used throughout the application.
                  </p>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">

                  <button
                    type="button"
                    onClick={closeEdit}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:flex-none"
                  >
                    <Save
                      size={17}
                      className={
                        saving
                          ? "animate-pulse"
                          : ""
                      }
                    />

                    {saving
                      ? "Saving..."
                      : "Save Settings"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        </form>
      )}

      {/* =====================================================
          BOTTOM CENTER TOAST
      ===================================================== */}

      {toast.show && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-[slideUp_.25s_ease-out]">

          <div
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-200 bg-white/95"
                : "border-red-200 bg-white/95"
            }`}
          >

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={21} />
              ) : (
                <AlertCircle size={21} />
              )}
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-bold text-slate-900">
                {toast.type === "success"
                  ? "Success"
                  : "Something went wrong"}
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {toast.message}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setToast({
                  show: false,
                  type: "",
                  message: "",
                })
              }
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          ANIMATION
      ===================================================== */}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 16px);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="font-bold text-slate-900">
          {title}
        </h2>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  uppercase = false,
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <div className="relative">

        <Icon
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          required={required}
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 ${
            uppercase
              ? "uppercase"
              : ""
          }`}
        />

      </div>

    </label>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm">

      <div className="flex items-start gap-3">

        <div className="rounded-xl bg-white p-2.5 text-slate-500 shadow-sm transition group-hover:text-blue-600">
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}