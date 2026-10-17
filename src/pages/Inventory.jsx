import { useMemo, useState } from "react";
import {
  Plus,
  Loader2,
  Search,
  X,
  ChevronDown,
  Check,
  Package,
  Boxes,
  AlertTriangle,
  PackageCheck,
  PackageX,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

import { useStore } from "../context/StoreContext";

import DataTable from "../components/DataTable";
import StockBadge from "../components/StockBadge";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

export default function Inventory() {
  const {
    products = [],
    categories = [],
    sales = [],
    addStock,
    saving,
  } = useStore();

  /* =====================================================
     FILTER STATES
  ===================================================== */

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("");
  const [stockFilter, setStockFilter] =
    useState("");

  /* =====================================================
     STOCK MODAL
  ===================================================== */

  const [open, setOpen] = useState(false);

  const [f, setF] = useState({
    productId: "",
    quantity: 1,
    reason: "Purchase / Restock",
  });

  /* =====================================================
     PRODUCT SEARCH DROPDOWN
  ===================================================== */

  const [productSearch, setProductSearch] =
    useState("");

  const [productDropdownOpen, setProductDropdownOpen] =
    useState(false);

  /* =====================================================
     SOLD QUANTITY
  ===================================================== */

  const soldQuantityMap = useMemo(() => {
    const map = {};

    if (!Array.isArray(sales)) {
      return map;
    }

    sales.forEach((sale) => {
      const saleProducts = Array.isArray(
        sale?.products
      )
        ? sale.products
        : Array.isArray(sale?.items)
        ? sale.items
        : [];

      saleProducts.forEach((item) => {
        const productId =
          item?.productId ??
          item?.id ??
          "";

        if (
          productId === null ||
          productId === undefined ||
          String(productId).trim() === ""
        ) {
          return;
        }

        const key = String(productId).trim();

        const quantity =
          Number(item?.quantity) || 0;

        map[key] =
          (map[key] || 0) + quantity;
      });
    });

    return map;
  }, [sales]);

  /* =====================================================
     GET SOLD QUANTITY
  ===================================================== */

  function getSoldQuantity(product) {
    const productId =
      product?.productId ??
      product?.id ??
      "";

    const key = String(productId).trim();

    if (
      key &&
      Object.prototype.hasOwnProperty.call(
        soldQuantityMap,
        key
      )
    ) {
      return Number(
        soldQuantityMap[key]
      ) || 0;
    }

    return (
      Number(
        product?.soldQuantity ??
          product?.totalSold ??
          0
      ) || 0
    );
  }

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const productName = String(
        product?.productName || ""
      ).toLowerCase();

      const sku = String(
        product?.sku ||
          product?.skuId ||
          product?.SKU ||
          product?.productId ||
          ""
      ).toLowerCase();

      const category = String(
        product?.category || ""
      ).toLowerCase();

      const currentStock = Number(
        product?.currentStock || 0
      );

      const minimumStock = Number(
        product?.minimumStock ??
          product?.minStock ??
          0
      );

      const matchesSearch =
        !searchText ||
        productName.includes(searchText) ||
        sku.includes(searchText);

      const matchesCategory =
        !categoryFilter ||
        category ===
          String(categoryFilter).toLowerCase();

      let matchesStock = true;

      if (stockFilter === "in-stock") {
        matchesStock = currentStock > 0;
      }

      if (stockFilter === "out-of-stock") {
        matchesStock = currentStock <= 0;
      }

      if (stockFilter === "low-stock") {
        matchesStock =
          currentStock > 0 &&
          currentStock <= minimumStock;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    stockFilter,
  ]);

  /* =====================================================
     SEARCHABLE PRODUCTS
  ===================================================== */

  const searchableProducts = useMemo(() => {
    const searchText = productSearch
      .trim()
      .toLowerCase();

    if (!searchText) {
      return products;
    }

    return products.filter((product) => {
      const name = String(
        product?.productName || ""
      ).toLowerCase();

      const sku = String(
        product?.sku ||
          product?.skuId ||
          product?.SKU ||
          ""
      ).toLowerCase();

      const productId = String(
        product?.productId || ""
      ).toLowerCase();

      return (
        name.includes(searchText) ||
        sku.includes(searchText) ||
        productId.includes(searchText)
      );
    });
  }, [products, productSearch]);

  /* =====================================================
     SELECTED PRODUCT
  ===================================================== */

  const selectedProduct = useMemo(() => {
    return products.find(
      (product) =>
        String(
          product?.productId || ""
        ) ===
        String(f.productId || "")
    );
  }, [products, f.productId]);

  /* =====================================================
     CATEGORY OPTIONS
  ===================================================== */

  const categoryOptions = useMemo(() => {
    const names = [];

    categories.forEach((category) => {
      const name =
        category?.categoryName ||
        category?.name ||
        category?.Name ||
        "";

      const cleanName =
        String(name).trim();

      if (
        cleanName &&
        !names.some(
          (item) =>
            item.toLowerCase() ===
            cleanName.toLowerCase()
        )
      ) {
        names.push(cleanName);
      }
    });

    products.forEach((product) => {
      const name =
        product?.category || "";

      const cleanName =
        String(name).trim();

      if (
        cleanName &&
        !names.some(
          (item) =>
            item.toLowerCase() ===
            cleanName.toLowerCase()
        )
      ) {
        names.push(cleanName);
      }
    });

    return names.sort((a, b) =>
      a.localeCompare(b)
    );
  }, [categories, products]);

  /* =====================================================
     INVENTORY STATS
  ===================================================== */

  const inventoryStats = useMemo(() => {
    let totalStock = 0;
    let totalSold = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((product) => {
      const stock = Number(
        product?.currentStock || 0
      );

      const minimum = Number(
        product?.minimumStock ??
          product?.minStock ??
          0
      );

      totalStock += stock;
      totalSold += getSoldQuantity(product);

      if (stock <= 0) {
        outOfStock++;
      } else if (stock <= minimum) {
        lowStock++;
      }
    });

    return {
      totalProducts: products.length,
      totalStock,
      totalSold,
      lowStock,
      outOfStock,
    };
  }, [products, soldQuantityMap]);

  /* =====================================================
     FILTER HELPERS
  ===================================================== */

  const hasFilters =
    Boolean(search) ||
    Boolean(categoryFilter) ||
    Boolean(stockFilter);

  function clearFilters() {
    setSearch("");
    setCategoryFilter("");
    setStockFilter("");
  }

  /* =====================================================
     SELECT PRODUCT
  ===================================================== */

  function selectProduct(product) {
    setF((old) => ({
      ...old,
      productId: product.productId,
    }));

    setProductSearch("");
    setProductDropdownOpen(false);
  }

  /* =====================================================
     CLEAR PRODUCT
  ===================================================== */

  function clearSelectedProduct() {
    setF((old) => ({
      ...old,
      productId: "",
    }));

    setProductSearch("");
    setProductDropdownOpen(true);
  }

  /* =====================================================
     OPEN MODAL
  ===================================================== */

  function openStockModal() {
    if (saving) return;

    setF({
      productId: "",
      quantity: 1,
      reason: "Purchase / Restock",
    });

    setProductSearch("");
    setProductDropdownOpen(false);
    setOpen(true);
  }

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  function closeModal() {
    if (saving) return;

    setProductDropdownOpen(false);
    setOpen(false);
  }

  /* =====================================================
     SUBMIT STOCK
  ===================================================== */

  async function submit(e) {
    e.preventDefault();

    if (saving) return;

    if (!f.productId) return;

    const quantity =
      Number(f.quantity);

    if (quantity <= 0) return;

    try {
      await addStock({
        productId: f.productId,
        quantity,
        note: f.reason,
      });

      setF({
        productId: "",
        quantity: 1,
        reason: "Purchase / Restock",
      });

      setProductSearch("");
      setProductDropdownOpen(false);
      setOpen(false);
    } catch (error) {
      console.error(
        "ADD STOCK ERROR:",
        error
      );
    }
  }

  /* =====================================================
     STAT CARD
  ===================================================== */

  function SummaryCard({
    title,
    value,
    icon: Icon,
    description,
    type = "default",
  }) {
    const styles = {
      default:
        "bg-blue-50 text-blue-600",
      success:
        "bg-emerald-50 text-emerald-600",
      warning:
        "bg-amber-50 text-amber-600",
      danger:
        "bg-red-50 text-red-600",
    };

    return (
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>

            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {value.toLocaleString("en-IN")}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${styles[type]}`}
          >
            <Icon size={21} />
          </div>
        </div>

        <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-slate-50 opacity-70" />
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6 pb-8">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 inventory-stock-in-shadow">
              <Boxes size={19} />
            </div>

            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Store Management
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track stock, sold items and product availability.
          </p>
        </div>

        <button
          type="button"
          onClick={openStockModal}
          disabled={saving}
          className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          <Plus
            size={19}
            className="transition-transform duration-300 group-hover:rotate-90"
          />

          Stock In
        </button>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Products"
          value={inventoryStats.totalProducts}
          icon={Package}
          description="Products in your store"
        />

        <SummaryCard
          title="Current Stock"
          value={inventoryStats.totalStock}
          icon={PackageCheck}
          description="Available units"
          type="success"
        />

        <SummaryCard
          title="Low Stock"
          value={inventoryStats.lowStock}
          icon={AlertTriangle}
          description="Need restocking"
          type="warning"
        />

        <SummaryCard
          title="Out of Stock"
          value={inventoryStats.outOfStock}
          icon={PackageX}
          description="Currently unavailable"
          type="danger"
        />
      </div>

      {/* =================================================
          FILTER PANEL
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <SlidersHorizontal size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Inventory Filters
              </h2>

              <p className="text-xs text-slate-400">
                Quickly find the products you need.
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <RotateCcw size={15} />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-3">

          {/* SEARCH */}

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search product or SKU..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {/* CATEGORY */}

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="">
                All Categories
              </option>

              {categoryOptions.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* STOCK */}

          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(
                  e.target.value
                )
              }
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="">
                All Stock Status
              </option>

              <option value="in-stock">
                In Stock
              </option>

              <option value="low-stock">
                Low Stock
              </option>

              <option value="out-of-stock">
                Out of Stock
              </option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700">
              {products.length}
            </span>{" "}
            products
          </p>

          {hasFilters && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Filters Active
            </span>
          )}
        </div>
      </div>

      {/* =================================================
          INVENTORY TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Stock Overview
            </h2>

            <p className="text-xs text-slate-400">
              Current inventory status of all products.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Inventory
          </div>
        </div>

        {filteredProducts.length ? (
          <div className="overflow-x-auto">
            <DataTable
              storageKey="inventory"
              columns={[
                {
                  key: "productName",
                  label: "Product",
                  render: (p) => (
                    <div className="flex min-w-[200px] items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Package size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {p.productName ||
                            "Unnamed Product"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {p.sku ||
                            p.skuId ||
                            p.SKU ||
                            p.productId ||
                            "No SKU"}
                        </p>
                      </div>
                    </div>
                  ),
                },

                {
                  key: "category",
                  label: "Category",
                  render: (p) => (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {p.category || "-"}
                    </span>
                  ),
                },

                {
                  key: "openingStock",
                  label: "Opening",
                  render: (p) => (
                    <span className="font-medium text-slate-600">
                      {Number(
                        p.openingStock || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  ),
                },

                {
                  key: "soldQuantity",
                  label: "Sold",
                  render: (p) => (
                    <span className="font-semibold text-slate-700">
                      {getSoldQuantity(
                        p
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  ),
                },

                {
                  key: "currentStock",
                  label: "Current",
                  render: (p) => {
                    const stock = Number(
                      p.currentStock || 0
                    );

                    return (
                      <span
                        className={`text-base font-bold ${
                          stock <= 0
                            ? "text-red-600"
                            : "text-slate-900"
                        }`}
                      >
                        {stock.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    );
                  },
                },

                {
                  key: "minimumStock",
                  label: "Minimum",
                  render: (p) => (
                    <span className="font-medium text-slate-500">
                      {Number(
                        p.minimumStock ??
                          p.minStock ??
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  ),
                },

                {
                  key: "status",
                  label: "Status",
                  render: (p) => (
                    <StockBadge
                      value={Number(
                        p.currentStock || 0
                      )}
                      limit={Number(
                        p.minimumStock ??
                          p.minStock ??
                          0
                      )}
                    />
                  ),
                },
              ]}
              rows={filteredProducts}
            />
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title={
                hasFilters
                  ? "No matching products"
                  : "No products found"
              }
              text={
                hasFilters
                  ? "Try changing or clearing your filters."
                  : "Add products to manage inventory."
              }
            />
          </div>
        )}
      </div>

      {/* =================================================
          STOCK IN MODAL
      ================================================= */}

      <Modal
        open={open}
        onClose={closeModal}
        title="Add Stock"
      >
        <form
          onSubmit={submit}
          className="space-y-5"
        >

          {/* PRODUCT */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Select Product
            </label>

            {selectedProduct ? (
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">

                <div className="flex items-center justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                      <Package size={21} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-800">
                        {selectedProduct.productName ||
                          "Unnamed Product"}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                        <span>
                          SKU:{" "}
                          {selectedProduct.sku ||
                            selectedProduct.skuId ||
                            selectedProduct.productId ||
                            "-"}
                        </span>

                        <span>
                          Stock:{" "}
                          <strong className="text-slate-700">
                            {selectedProduct.currentStock ??
                              0}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      clearSelectedProduct
                    }
                    disabled={saving}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-red-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={productSearch}
                  disabled={saving}
                  onFocus={() =>
                    setProductDropdownOpen(
                      true
                    )
                  }
                  onChange={(e) => {
                    setProductSearch(
                      e.target.value
                    );

                    setProductDropdownOpen(
                      true
                    );
                  }}
                  placeholder="Search product, SKU or ID..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                />

                <ChevronDown
                  size={19}
                  className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${
                    productDropdownOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </div>
            )}

            {!selectedProduct &&
              productDropdownOpen && (
                <div className="relative z-[60] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                  <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Select Product
                    </span>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {
                        searchableProducts.length
                      }{" "}
                      found
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto">

                    {searchableProducts.length > 0 ? (
                      searchableProducts.map(
                        (product) => {
                          const sku =
                            product?.sku ||
                            product?.skuId ||
                            product?.SKU ||
                            product?.productId ||
                            "-";

                          const stock =
                            Number(
                              product?.currentStock ||
                                0
                            );

                          return (
                            <button
                              type="button"
                              key={
                                product.productId
                              }
                              onClick={() =>
                                selectProduct(
                                  product
                                )
                              }
                              className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-blue-50"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <Package
                                  size={18}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {product.productName ||
                                    "Unnamed Product"}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  SKU: {sku}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                  Stock
                                </p>

                                <p
                                  className={`font-bold ${
                                    stock <= 0
                                      ? "text-red-600"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {stock}
                                </p>
                              </div>

                              <Check
                                size={17}
                                className="text-slate-200"
                              />
                            </button>
                          );
                        }
                      )
                    ) : (
                      <div className="px-4 py-10 text-center">
                        <Search
                          size={24}
                          className="mx-auto mb-3 text-slate-300"
                        />

                        <p className="font-semibold text-slate-700">
                          No product found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try another name or SKU.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {!selectedProduct && (
              <p className="mt-2 text-xs text-slate-400">
                Search by product name, SKU or Product ID.
              </p>
            )}
          </div>

          {/* QUANTITY */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Quantity
            </label>

            <input
              required
              disabled={saving}
              type="number"
              min="1"
              value={f.quantity}
              onChange={(e) =>
                setF({
                  ...f,
                  quantity:
                    e.target.value,
                })
              }
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              placeholder="Enter quantity"
            />
          </div>

          {/* REASON */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Reason
            </label>

            <input
              disabled={saving}
              value={f.reason}
              onChange={(e) =>
                setF({
                  ...f,
                  reason:
                    e.target.value,
                })
              }
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              placeholder="Purchase / Restock"
            />
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !f.productId ||
                Number(f.quantity) <= 0
              }
              className="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Stock
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}