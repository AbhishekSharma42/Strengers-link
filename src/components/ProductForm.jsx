import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  Search,
  Package,
  Tag,
  IndianRupee,
  Boxes,
  Truck,
  FileText,
  X,
  Check,
} from "lucide-react";

import { useStore } from "../context/StoreContext";
import { validateProduct } from "../utils/validators";

/* =====================================================
   BLANK PRODUCT
===================================================== */

const blank = {
  productName: "",
  category: "",
  subCategory: "",
  sku: "",
  purchasePrice: 0,
  sellingPrice: 0,
  openingStock: 0,
  currentStock: 0,
  soldQuantity: 0,
  minimumStock: 10,
  supplier: "",
  description: "",
  status: "Active",
};

export default function ProductForm({
  open,
  onClose,
  editing,
}) {
  const {
    categories = [],
    products = [],
    addProduct,
    updateProduct,
    saving,
  } = useStore();

  const [f, setF] = useState(blank);
  const [e, setE] = useState({});

  /* =====================================================
     CATEGORY DROPDOWN
  ===================================================== */

  const [categoryOpen, setCategoryOpen] =
    useState(false);

  const [categorySearch, setCategorySearch] =
    useState("");

  const categoryRef = useRef(null);

  /* =====================================================
     LOAD PRODUCT
  ===================================================== */

  useEffect(() => {
    if (editing) {
      setF({
        ...blank,
        ...editing,

        currentStock:
          editing.currentStock ??
          editing.openingStock ??
          0,

        minimumStock:
          editing.minimumStock ??
          editing.minStock ??
          10,
      });
    } else {
      setF({
        ...blank,
      });
    }

    setE({});
    setCategoryOpen(false);
    setCategorySearch("");
  }, [editing, open]);

  /* =====================================================
     CLICK OUTSIDE CATEGORY
  ===================================================== */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target)
      ) {
        setCategoryOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =====================================================
     SET FIELD
  ===================================================== */

  const set = (key, value) => {
    setF((prev) => ({
      ...prev,
      [key]: value,
    }));

    setE((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  /* =====================================================
     CATEGORY LIST
  ===================================================== */

  const categoryList = categories
    .map((category) => ({
      id:
        category.categoryId ||
        category.id ||
        category.name ||
        category.categoryName,

      name:
        category.name ||
        category.categoryName ||
        "",
    }))
    .filter(
      (category) =>
        category.name.trim() !== ""
    );

  const filteredCategories =
    categoryList.filter((category) =>
      category.name
        .toLowerCase()
        .includes(
          categorySearch
            .trim()
            .toLowerCase()
        )
    );

  /* =====================================================
     SELECT CATEGORY
  ===================================================== */

  function selectCategory(categoryName) {
    set("category", categoryName);

    setCategoryOpen(false);
    setCategorySearch("");
  }

  /* =====================================================
     SUBMIT
  ===================================================== */

  async function submit(event) {
    event.preventDefault();

    const errors = validateProduct(
      f,
      products,
      editing?.productId || ""
    );

    /* -----------------------------------------------
       CURRENT STOCK VALIDATION
    ------------------------------------------------ */

    const currentStock = Number(
      f.currentStock
    );

    if (
      !Number.isFinite(currentStock) ||
      currentStock < 0
    ) {
      errors.currentStock =
        "Current stock must be 0 or greater.";
    }

    setE(errors);

    if (Object.keys(errors).length) {
      return;
    }

    /* -----------------------------------------------
       PREPARE PRODUCT
    ------------------------------------------------ */

    const product = {
      ...f,

      purchasePrice: Number(
        f.purchasePrice
      ),

      sellingPrice: Number(
        f.sellingPrice
      ),

      openingStock: Number(
        f.openingStock
      ),

      currentStock: Number(
        f.currentStock
      ),

      minimumStock: Number(
        f.minimumStock
      ),
    };

    /* -----------------------------------------------
       NEW PRODUCT
    ------------------------------------------------ */

    if (!editing) {
      product.currentStock =
        product.openingStock;
    }

    /* -----------------------------------------------
       SAVE
    ------------------------------------------------ */

    try {
      if (editing) {
        await updateProduct(product);
      } else {
        await addProduct(product);
      }

      onClose?.();
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );
    }
  }

  /* =====================================================
     IF FORM CLOSED
  ===================================================== */

  if (!open) {
    return null;
  }

  /* =====================================================
     INPUT CLASS
  ===================================================== */

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  const disabledInputClass =
    "w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 outline-none";

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <form
      onSubmit={submit}
      className="w-full"
    >

      {/* =================================================
          BASIC INFORMATION
      ================================================= */}

      <div className="mb-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm stock-management-card">

        {/* SECTION HEADER */}

        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Package size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Product Information
            </h2>

            <p className="text-xs text-slate-500">
              Add basic information about your product.
            </p>
          </div>

        </div>

        {/* FORM */}

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:p-6">

          {/* PRODUCT NAME */}

          <label className="block">

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Product Name
              <span className="ml-1 text-red-500">
                *
              </span>
            </span>

            <input
              type="text"
              value={
                f.productName ?? ""
              }
              onChange={(event) =>
                set(
                  "productName",
                  event.target.value
                )
              }
              placeholder="Enter product name"
              disabled={saving}
              className={inputClass}
            />

            {e.productName && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.productName}
              </small>
            )}

          </label>

          {/* SKU */}

          <label className="block">

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              SKU
            </span>

            <input
              type="text"
              value={f.sku ?? ""}
              onChange={(event) =>
                set(
                  "sku",
                  event.target.value
                )
              }
              placeholder="e.g. SKU-001"
              disabled={saving}
              className={inputClass}
            />

            {e.sku && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.sku}
              </small>
            )}

          </label>

          {/* =================================================
              CATEGORY CUSTOM DROPDOWN
          ================================================= */}

          <div
            ref={categoryRef}
            className={`relative ${
              categoryOpen
                ? "z-[9999]"
                : "z-20"
            }`}
          >

            <label className="block">

              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Category
                <span className="ml-1 text-red-500">
                  *
                </span>
              </span>

              {/* SELECT BUTTON */}

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setCategoryOpen(
                    (prev) => !prev
                  );
                  setCategorySearch("");
                }}
                className={`flex w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm outline-none transition ${
                  categoryOpen
                    ? "border-blue-500 ring-4 ring-blue-500/10"
                    : "border-slate-200 hover:border-slate-300"
                } disabled:cursor-not-allowed disabled:bg-slate-100`}
              >

                <span
                  className={
                    f.category
                      ? "font-medium text-slate-800"
                      : "text-slate-400"
                  }
                >
                  {f.category ||
                    "Select category"}
                </span>

                <ChevronDown
                  size={18}
                  className={`shrink-0 text-slate-400 transition ${
                    categoryOpen
                      ? "rotate-180 text-blue-500"
                      : ""
                  }`}
                />

              </button>

            </label>

            {/* =================================================
                CATEGORY DROPDOWN
            ================================================= */}

            {categoryOpen && (
              <div
                className="absolute left-0 right-0 top-full z-[99999] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                style={{
                  minWidth:
                    "100%",
                }}
              >

                {/* SEARCH */}

                <div className="border-b border-slate-100 bg-white p-2">

                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">

                    <Search
                      size={17}
                      className="shrink-0 text-slate-400"
                    />

                    <input
                      type="text"
                      autoFocus
                      value={
                        categorySearch
                      }
                      onChange={(event) =>
                        setCategorySearch(
                          event.target.value
                        )
                      }
                      placeholder="Search category..."
                      className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                    />

                    {categorySearch && (
                      <button
                        type="button"
                        onClick={() =>
                          setCategorySearch(
                            ""
                          )
                        }
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      >
                        <X size={15} />
                      </button>
                    )}

                  </div>

                </div>

                {/* CATEGORY LIST */}

                <div className="max-h-60 overflow-y-auto overscroll-contain p-1.5">

                  {filteredCategories.length >
                  0 ? (
                    filteredCategories.map(
                      (category) => {
                        const selected =
                          String(
                            f.category
                          ).toLowerCase() ===
                          String(
                            category.name
                          ).toLowerCase();

                        return (
                          <button
                            key={
                              category.id
                            }
                            type="button"
                            onClick={() =>
                              selectCategory(
                                category.name
                              )
                            }
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                              selected
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >

                            <div className="flex min-w-0 items-center gap-3">

                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  selected
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <Tag
                                  size={15}
                                />
                              </div>

                              <span className="truncate font-medium">
                                {
                                  category.name
                                }
                              </span>

                            </div>

                            {selected && (
                              <Check
                                size={17}
                                className="shrink-0 text-blue-600"
                              />
                            )}

                          </button>
                        );
                      }
                    )
                  ) : (
                    <div className="px-4 py-8 text-center">

                      <Tag
                        size={30}
                        className="mx-auto mb-2 text-slate-300"
                      />

                      <p className="text-sm font-medium text-slate-500">
                        No category found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try another search.
                      </p>

                    </div>
                  )}

                </div>

              </div>
            )}

            {e.category && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.category}
              </small>
            )}

          </div>

          {/* SUB CATEGORY */}

          <label className="block">

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Sub Category
            </span>

            <input
              type="text"
              value={
                f.subCategory ?? ""
              }
              onChange={(event) =>
                set(
                  "subCategory",
                  event.target.value
                )
              }
              placeholder="Enter sub category"
              disabled={saving}
              className={inputClass}
            />

            {e.subCategory && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.subCategory}
              </small>
            )}

          </label>

        </div>

      </div>

      {/* =================================================
          PRICING
      ================================================= */}

      <div className="mb-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <IndianRupee size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Pricing
            </h2>

            <p className="text-xs text-slate-500">
              Set purchase and selling prices.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:p-6">

          {/* PURCHASE PRICE */}

          <label>

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Purchase Price
            </span>

            <div className="relative">

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  f.purchasePrice ?? ""
                }
                onChange={(event) =>
                  set(
                    "purchasePrice",
                    event.target.value
                  )
                }
                placeholder="0.00"
                disabled={saving}
                className={`${inputClass} pl-8`}
              />

            </div>

            {e.purchasePrice && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.purchasePrice}
              </small>
            )}

          </label>

          {/* SELLING PRICE */}

          <label>

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Selling Price
            </span>

            <div className="relative">

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  f.sellingPrice ?? ""
                }
                onChange={(event) =>
                  set(
                    "sellingPrice",
                    event.target.value
                  )
                }
                placeholder="0.00"
                disabled={saving}
                className={`${inputClass} pl-8`}
              />

            </div>

            {e.sellingPrice && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.sellingPrice}
              </small>
            )}

          </label>

        </div>

      </div>

      {/* =================================================
          STOCK MANAGEMENT
      ================================================= */}

      <div className="mb-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Boxes size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Stock Management
            </h2>

            <p className="text-xs text-slate-500">
              Manage product inventory and stock limits.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">

          {/* OPENING STOCK */}

          <label>

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Opening Stock
            </span>

            <input
              type="number"
              min="0"
              value={
                f.openingStock ?? ""
              }
              onChange={(event) =>
                set(
                  "openingStock",
                  event.target.value
                )
              }
              disabled={
                Boolean(editing) ||
                saving
              }
              className={
                editing
                  ? disabledInputClass
                  : inputClass
              }
            />

            {editing && (
              <small className="mt-1.5 block text-xs text-slate-400">
                Opening stock cannot be changed while editing.
              </small>
            )}

            {e.openingStock && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.openingStock}
              </small>
            )}

          </label>

          {/* CURRENT STOCK */}

          <label>

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Current Stock
            </span>

            <input
              type="number"
              min="0"
              value={
                f.currentStock ?? ""
              }
              onChange={(event) =>
                set(
                  "currentStock",
                  event.target.value
                )
              }
              disabled={
                !editing ||
                saving
              }
              className={
                !editing
                  ? disabledInputClass
                  : inputClass
              }
            />

            {!editing ? (
              <small className="mt-1.5 block text-xs text-slate-400">
                Automatically set from opening stock.
              </small>
            ) : (
              <small className="mt-1.5 block text-xs text-blue-600">
                Use this field to correct stock if required.
              </small>
            )}

            {e.currentStock && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.currentStock}
              </small>
            )}

          </label>

          {/* MINIMUM STOCK */}

          <label>

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Minimum Stock
            </span>

            <input
              type="number"
              min="0"
              value={
                f.minimumStock ?? ""
              }
              onChange={(event) =>
                set(
                  "minimumStock",
                  event.target.value
                )
              }
              disabled={saving}
              className={inputClass}
            />

            <small className="mt-1.5 block text-xs text-slate-400">
              Product will be shown as low stock at or below this value.
            </small>

            {e.minimumStock && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.minimumStock}
              </small>
            )}

          </label>

        </div>

        {/* STOCK NOTICE */}

        {editing && (
          <div className="mx-5 mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 lg:mx-6">

            <p className="text-sm font-semibold text-blue-800">
              Stock Correction
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Agar current stock galat enter ho gaya
              tha, to Current Stock field me correct
              quantity enter karke product update karein.
            </p>

          </div>
        )}

      </div>

      {/* =================================================
          SUPPLIER & DESCRIPTION
      ================================================= */}

      <div className="mb-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Truck size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Supplier & Details
            </h2>

            <p className="text-xs text-slate-500">
              Add supplier and additional product information.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 p-5 lg:p-6">

          {/* SUPPLIER */}

          <label>

            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Supplier
            </span>

            <input
              type="text"
              value={
                f.supplier ?? ""
              }
              onChange={(event) =>
                set(
                  "supplier",
                  event.target.value
                )
              }
              placeholder="Enter supplier name"
              disabled={saving}
              className={inputClass}
            />

            {e.supplier && (
              <small className="mt-1 block text-xs font-medium text-red-600">
                {e.supplier}
              </small>
            )}

          </label>

          {/* DESCRIPTION */}

          <label>

            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <FileText size={14} />
              Description
            </span>

            <textarea
              rows="4"
              value={
                f.description ?? ""
              }
              onChange={(event) =>
                set(
                  "description",
                  event.target.value
                )
              }
              placeholder="Enter product description..."
              disabled={saving}
              className={`${inputClass} resize-none`}
            />

          </label>

        </div>

      </div>

      {/* =================================================
          BUTTONS
      ================================================= */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving
            ? "Saving..."
            : editing
            ? "Update Product"
            : "Add Product"}
        </button>

      </div>

    </form>
  );
}