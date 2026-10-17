import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal,
  Package,
  Boxes,
  IndianRupee,
  X,
  ChevronDown,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useStore } from "../context/StoreContext";
import Modal from "../components/Modal";
import ProductForm from "../components/ProductForm";
import DataTable from "../components/DataTable";
import StockBadge from "../components/StockBadge";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

export default function Products() {
  const {
    products = [],
    categories = [],
    deleteProduct: removeProduct,
    saving,
  } = useStore();

  const [params] = useSearchParams();

  const [search, setSearch] = useState(
    params.get("search") || ""
  );

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  /* =========================================
     DELETE MODAL STATE
  ========================================= */

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  /* =========================================
     CATEGORY NAME
  ========================================= */

  const getCategoryName = (category) => {
    return (
      category?.name ||
      category?.categoryName ||
      category?.Name ||
      ""
    );
  };

  /* =========================================
     FILTER PRODUCTS
  ========================================= */

  const filteredProducts = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const productName =
        product?.productName || "";

      const sku =
        product?.sku || "";

      const productId =
        product?.productId || "";

      const productCategory =
        product?.category || "";

      const searchableText = `
        ${productName}
        ${sku}
        ${productId}
      `.toLowerCase();

      const matchesSearch =
        !searchText ||
        searchableText.includes(searchText);

      const matchesCategory =
        !categoryFilter ||
        productCategory === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    categoryFilter,
  ]);

  /* =========================================
     SUMMARY
  ========================================= */

  const totalProducts =
    products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total +
      Number(
        product?.currentStock || 0
      ),
    0
  );

  const lowStockCount =
    products.filter((product) => {
      const stock = Number(
        product?.currentStock || 0
      );

      const minimum = Number(
        product?.minimumStock ??
          product?.minStock ??
          0
      );

      return stock <= minimum;
    }).length;

  const totalValue = products.reduce(
    (total, product) =>
      total +
      Number(
        product?.sellingPrice || 0
      ) *
        Number(
          product?.currentStock || 0
        ),
    0
  );

  /* =========================================
     MODAL
  ========================================= */

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleAddProduct = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEditProduct = (
    product
  ) => {
    setEditing(product);
    setOpen(true);
  };

  /* =========================================
     OPEN DELETE CONFIRMATION
  ========================================= */

  const handleDelete = (product) => {
    if (!product?.productId) {
      console.error(
        "Product ID not found."
      );
      return;
    }

    setDeleteTarget(product);
  };

  /* =========================================
     CONFIRM DELETE
  ========================================= */

  const confirmDelete = async () => {
    if (!deleteTarget?.productId) {
      return;
    }

    try {
      await removeProduct(
        deleteTarget.productId
      );

      /*
       * Delete successful
       * Close custom modal
       */

      setDeleteTarget(null);

    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      /*
       * Modal close nahi hoga agar
       * delete fail hota hai.
       *
       * User dobara try kar sakta hai.
       */

    }
  };

  /* =========================================
     CANCEL DELETE
  ========================================= */

  const cancelDelete = () => {
    if (saving) return;

    setDeleteTarget(null);
  };

  /* =========================================
     CLEAR FILTERS
  ========================================= */

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
  };

  const hasFilters =
    search.trim() ||
    categoryFilter;

  return (
    <div className="space-y-6 pb-8">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/70 p-5 shadow-sm sm:p-6">

        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">

              <Package size={14} />

              Inventory Management

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Products
            </h1>

            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Manage your products, pricing,
              categories and inventory from
              one place.
            </p>

          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-600/20 active:translate-y-0"
          >

            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 transition group-hover:bg-white/20">
              <Plus size={17} />
            </span>

            Add Product

          </button>

        </div>

      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        {/* TOTAL PRODUCTS */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-medium text-slate-500">
                Total Products
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                {totalProducts}
              </p>

            </div>

            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Boxes size={19} />
            </div>

          </div>

        </div>

        {/* TOTAL STOCK */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-medium text-slate-500">
                Current Stock
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                {totalStock.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Package size={19} />
            </div>

          </div>

        </div>

        {/* STOCK VALUE */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-medium text-slate-500">
                Stock Value
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900 sm:text-2xl">
                ₹
                {totalValue.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <IndianRupee size={19} />
            </div>

          </div>

        </div>

        {/* LOW STOCK */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-medium text-slate-500">
                Low Stock
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                {lowStockCount}
              </p>

            </div>

            <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
              <Package size={19} />
            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          FILTER PANEL
      ========================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="mb-3 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <SlidersHorizontal size={16} />
            </div>

            <div>

              <h2 className="text-sm font-semibold text-slate-900">
                Product Filters
              </h2>

              <p className="hidden text-xs text-slate-400 sm:block">
                Find products quickly
              </p>

            </div>

          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={14} />
              Clear
            </button>
          )}

        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by product name, SKU or ID..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}

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
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >

              <option value="">
                All Categories
              </option>

              {categories.map(
                (category) => {
                  const categoryName =
                    getCategoryName(
                      category
                    );

                  if (!categoryName) {
                    return null;
                  }

                  return (
                    <option
                      key={
                        category.categoryId ||
                        categoryName
                      }
                      value={
                        categoryName
                      }
                    >
                      {categoryName}
                    </option>
                  );
                }
              )}

            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

          </div>

        </div>

        {/* RESULT INFO */}

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

          <p className="text-xs text-slate-500">

            Showing{" "}

            <span className="font-semibold text-slate-700">
              {filteredProducts.length}
            </span>{" "}

            of{" "}

            <span className="font-semibold text-slate-700">
              {products.length}
            </span>{" "}

            products

          </p>

          {saving && (
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">

              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />

              Saving changes...

            </div>
          )}

        </div>

      </div>

      {/* =========================================
          PRODUCT TABLE
      ========================================= */}

      {filteredProducts.length > 0 ? (

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <DataTable
              storageKey="products"

            columns={[
              {
                key: "productName",

                label: "Product",

                render: (product) => (
                  <div className="flex min-w-[180px] items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 font-semibold text-blue-600">

                      {(product.productName ||
                        "P")
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-slate-800">
                        {product.productName ||
                          "-"}
                      </p>

                      {product.sku && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          SKU:{" "}
                          {product.sku}
                        </p>
                      )}

                    </div>

                  </div>
                ),
              },

              {
                key: "category",

                label: "Category",

                render: (product) => (
                  <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {product.category ||
                      "-"}
                  </span>
                ),
              },

              {
                key: "sellingPrice",

                label: "Sell Price",

                render: (product) => (
                  <span className="font-semibold text-slate-800">

                    ₹
                    {Number(
                      product.sellingPrice ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </span>
                ),
              },

              {
                key: "currentStock",

                label: "Stock",

                render: (product) => {
                  const stock =
                    Number(
                      product.currentStock ||
                        0
                    );

                  return (
                    <span className="font-semibold text-slate-700">
                      {stock.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  );
                },
              },

              {
                key: "status",

                label: "Status",

                render: (product) => (
                  <StockBadge
                    value={Number(
                      product.currentStock ||
                        0
                    )}
                    limit={Number(
                      product.minimumStock ??
                        product.minStock ??
                        0
                    )}
                  />
                ),
              },
            ]}

            rows={filteredProducts}

            actions={(product) => (
              <div className="flex items-center justify-end gap-1">

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() =>
                    handleEditProduct(
                      product
                    )
                  }
                  disabled={saving}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Edit Product"
                >
                  <Pencil size={16} />
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      product
                    )
                  }
                  disabled={saving}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Delete Product"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            )}
          />

        </div>

      ) : (

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <EmptyState
            title={
              hasFilters
                ? "No products found"
                : "No products yet"
            }
            text={
              hasFilters
                ? "Try changing your search or category filter."
                : "Add your first product to start managing inventory."
            }
          />

          {!hasFilters && (
            <div className="mt-4 flex justify-center">

              <button
                type="button"
                onClick={
                  handleAddProduct
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Add Your First Product
              </button>

            </div>
          )}

        </div>

      )}

      {/* =========================================
          ADD / EDIT PRODUCT MODAL
      ========================================= */}

      <Modal
        open={open}
        onClose={closeModal}
        title={
          editing
            ? "Edit Product"
            : "Add Product"
        }
      >

        <ProductForm
          open={open}
          onClose={closeModal}
          editing={editing}
        />

      </Modal>

      {/* =========================================
          CUSTOM DELETE CONFIRM MODAL
      ========================================= */}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.productName || "this product"}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Product"
        cancelText="Cancel"
        loading={saving}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

    </div>
  );
}