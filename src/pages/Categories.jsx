import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FolderTree,
  Package,
  Layers3,
  X,
} from "lucide-react";

import { useStore } from "../context/StoreContext";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import CategoryForm from "../components/CategoryForm";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";

export default function Categories() {
  const {
    categories = [],
    products = [],
    deleteCategory,
  } = useStore();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /*
   * =====================================================
   * CATEGORY NAME
   * =====================================================
   */

  const getCategoryName = (category) => {
    return String(
      category?.name ||
        category?.categoryName ||
        ""
    ).trim();
  };

  /*
   * =====================================================
   * CATEGORY ID
   * =====================================================
   */

  const getCategoryId = (category) => {
    return (
      category?.categoryId ||
      category?.id ||
      category?._id ||
      null
    );
  };

  /*
   * =====================================================
   * PRODUCT CATEGORY NAME
   * =====================================================
   */

  const getProductCategoryName = (product) => {
    if (!product) {
      return "";
    }

    if (typeof product.category === "string") {
      return product.category.trim();
    }

    if (
      product.category &&
      typeof product.category === "object"
    ) {
      return String(
        product.category.name ||
          product.category.categoryName ||
          product.category.title ||
          ""
      ).trim();
    }

    return String(
      product.categoryName ||
        product.category_name ||
        ""
    ).trim();
  };

  /*
   * =====================================================
   * CATEGORY DATA
   * =====================================================
   */

  const rows = useMemo(() => {
    const search = q.trim().toLowerCase();

    return categories
      .map((category) => {
        const categoryName =
          getCategoryName(category);

        const count = products.filter(
          (product) => {
            const productCategory =
              getProductCategoryName(product);

            return (
              productCategory.toLowerCase() ===
              categoryName.toLowerCase()
            );
          }
        ).length;

        return {
          ...category,
          name: categoryName,
          categoryId: getCategoryId(category),
          count,
        };
      })
      .filter((category) => {
        if (!search) {
          return true;
        }

        const name = String(
          category.name || ""
        ).toLowerCase();

        const description = String(
          category.description || ""
        ).toLowerCase();

        return (
          name.includes(search) ||
          description.includes(search)
        );
      });
  }, [categories, products, q]);

  /*
   * =====================================================
   * TOTAL PRODUCTS
   * =====================================================
   */

  const totalProducts = products.length;

  /*
   * =====================================================
   * CLOSE CATEGORY MODAL
   * =====================================================
   */

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  /*
   * =====================================================
   * ADD CATEGORY
   * =====================================================
   */

  const handleAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  /*
   * =====================================================
   * EDIT CATEGORY
   * =====================================================
   */

  const handleEdit = (category) => {
    setEditing(category);
    setOpen(true);
  };

  /*
   * =====================================================
   * OPEN DELETE CONFIRMATION
   * =====================================================
   */

  const handleDelete = (category) => {
    if (!category) {
      return;
    }

    setDeleteTarget(category);
  };

  /*
   * =====================================================
   * CANCEL DELETE
   * =====================================================
   */

  const handleCancelDelete = () => {
    if (deleteLoading) {
      return;
    }

    setDeleteTarget(null);
  };

  /*
   * =====================================================
   * CONFIRM DELETE
   * =====================================================
   */

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    if (deleteLoading) {
      return;
    }

    const categoryId =
      getCategoryId(deleteTarget);

    if (!categoryId) {
      console.error(
        "Category ID is missing:",
        deleteTarget
      );
      return;
    }

    if (
      typeof deleteCategory !== "function"
    ) {
      console.error(
        "deleteCategory function is not available."
      );
      return;
    }

    try {
      setDeleteLoading(true);

      /*
       * ACTUAL DELETE
       *
       * Ye function sirf tab chalega jab
       * ConfirmModal ka Delete button press hoga.
       */
      await deleteCategory(categoryId);

      /*
       * Delete successful hone ke baad
       * modal close hoga.
       */
      setDeleteTarget(null);
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /*
   * =====================================================
   * DELETE MESSAGE
   * =====================================================
   */

  const deleteName = deleteTarget
    ? getCategoryName(deleteTarget)
    : "this category";

  const deleteProductCount =
    deleteTarget?.count || 0;

  let deleteMessage =
    'Are you sure you want to delete "' +
    deleteName +
    '"? This action cannot be undone.';

  if (deleteProductCount > 0) {
    deleteMessage =
      'The category "' +
      deleteName +
      '" contains ' +
      deleteProductCount +
      " product" +
      (deleteProductCount === 1 ? "" : "s") +
      ". Please remove or reassign the product" +
      (deleteProductCount === 1 ? "" : "s") +
      " first. Do you still want to continue?";
  }

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <div className="space-y-6">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FolderTree size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Categories
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Organize and manage your store categories.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0"
        >
          <Plus
            size={18}
            className="transition-transform duration-200 group-hover:rotate-90"
          />

          Add Category
        </button>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* TOTAL CATEGORIES */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Categories
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {categories.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers3 size={21} />
            </div>
          </div>
        </div>

        {/* TOTAL PRODUCTS */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Products
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalProducts}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Package size={21} />
            </div>
          </div>
        </div>

        {/* CATEGORIES IN VIEW */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Categories in View
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {rows.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FolderTree size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          SEARCH + TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* TOOLBAR */}

        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                All Categories
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {rows.length}{" "}
                {rows.length === 1
                  ? "category"
                  : "categories"}{" "}
                found
              </p>
            </div>

            {/* SEARCH */}

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={q}
                onChange={(e) =>
                  setQ(e.target.value)
                }
                placeholder="Search categories..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              {q ? (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="p-2 sm:p-4">
          {rows.length > 0 ? (
            <DataTable
              storageKey="categories"
              columns={[
                {
                  key: "name",
                  label: "Category",

                  render: (category) => (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-semibold text-blue-600">
                        {String(
                          category.name || "?"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {category.name ||
                            "Unnamed Category"}
                        </p>

                        <p className="text-xs text-slate-400">
                          ID:{" "}
                          {category.categoryId ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  ),
                },

                {
                  key: "description",
                  label: "Description",

                  render: (category) => (
                    <p className="max-w-xs truncate text-sm text-slate-500">
                      {category.description ||
                        "No description"}
                    </p>
                  ),
                },

                {
                  key: "count",
                  label: "Products",

                  render: (category) => {
                    const hasProducts =
                      category.count > 0;

                    return (
                      <span
                        className={
                          hasProducts
                            ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                            : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                        }
                      >
                        <Package size={13} />

                        {category.count}
                      </span>
                    );
                  },
                },

                {
                  key: "createdAt",
                  label: "Created",

                  render: (category) => (
                    <span className="text-sm text-slate-500">
                      {category.createdAt
                        ? new Date(
                            category.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </span>
                  ),
                },
              ]}
              rows={rows}
              actions={(category) => (
                <div className="flex items-center justify-end gap-1">
                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(category)
                    }
                    className="rounded-xl p-2 text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600"
                    title="Edit category"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(category)
                    }
                    className="rounded-xl p-2 text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          ) : (
            <div className="py-8">
              <EmptyState
                title={
                  q
                    ? "No categories found"
                    : "No categories yet"
                }
                text={
                  q
                    ? "Try searching with a different category name."
                    : "Create your first category to organize your products."
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          CATEGORY FORM MODAL
      ================================================= */}

      <Modal
        open={open}
        onClose={close}
        title={
          editing
            ? "Edit Category"
            : "Create Category"
        }
      >
        <CategoryForm
          open={open}
          onClose={close}
          editing={editing}
        />
      </Modal>

      {/* =================================================
          DELETE CONFIRM MODAL
      ================================================= */}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Category"
        message={deleteMessage}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}