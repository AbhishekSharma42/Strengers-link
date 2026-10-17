import { useEffect, useState } from "react";
import {
  FolderTree,
  FileText,
  Save,
  X,
  Loader2,
} from "lucide-react";

import { useStore } from "../context/StoreContext";

export default function CategoryForm({
  open,
  onClose,
  editing,
}) {
  const {
    addCategory,
    updateCategory,
    saving,
  } = useStore();

  /*
   * =====================================================
   * FORM STATE
   * =====================================================
   */

  const [f, setF] = useState({
    categoryId: "",
    name: "",
    categoryName: "",
    description: "",
  });

  const [error, setError] = useState("");

  /*
   * =====================================================
   * LOAD / RESET FORM
   * =====================================================
   */

  useEffect(() => {
    if (!open) return;

    if (editing) {
      const existingName =
        editing.name ||
        editing.categoryName ||
        editing.Name ||
        "";

      setF({
        categoryId:
          editing.categoryId ||
          editing.id ||
          "",

        name: existingName,

        categoryName: existingName,

        description:
          editing.description || "",
      });
    } else {
      setF({
        categoryId: "",
        name: "",
        categoryName: "",
        description: "",
      });
    }

    setError("");
  }, [editing, open]);

  /*
   * =====================================================
   * FIELD CHANGE
   * =====================================================
   */

  function changeField(key, value) {
    setF((old) => {
      /*
       * name aur categoryName ko
       * same rakhenge.
       *
       * Isse Google Sheets ke existing
       * data structure ke saath compatibility rahegi.
       */

      if (
        key === "name" ||
        key === "categoryName"
      ) {
        return {
          ...old,
          name: value,
          categoryName: value,
        };
      }

      return {
        ...old,
        [key]: value,
      };
    });

    setError("");
  }

  /*
   * =====================================================
   * SUBMIT
   * =====================================================
   */

  async function submit(e) {
    e.preventDefault();

    if (saving) return;

    setError("");

    const categoryName =
      String(f.name || "").trim();

    const description =
      String(f.description || "").trim();

    /*
     * CATEGORY NAME VALIDATION
     */

    if (!categoryName) {
      setError(
        "Please enter category name."
      );
      return;
    }

    /*
     * CATEGORY NAME LENGTH
     */

    if (categoryName.length < 2) {
      setError(
        "Category name must contain at least 2 characters."
      );
      return;
    }

    /*
     * UPDATE VALIDATION
     */

    if (
      editing &&
      !String(f.categoryId || "").trim()
    ) {
      setError(
        "Category ID missing. This category cannot be updated."
      );
      return;
    }

    /*
     * ===================================================
     * CATEGORY DATA
     * ===================================================
     *
     * name + categoryName dono bhej rahe hain
     * taaki existing Google Sheets API compatible rahe.
     */

    const categoryData = {
      categoryId: f.categoryId,

      name: categoryName,

      categoryName: categoryName,

      description,
    };

    try {
      /*
       * UPDATE
       */

      if (editing) {
        await updateCategory(
          categoryData
        );
      }

      /*
       * ADD
       */

      else {
        await addCategory({
          name: categoryName,

          categoryName: categoryName,

          description,
        });
      }

      /*
       * SUCCESS
       */

      onClose?.();

    } catch (err) {
      console.error(
        "CATEGORY SAVE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Category save nahi ho saki."
      );
    }
  }

  /*
   * =====================================================
   * CLOSE FORM
   * =====================================================
   */

  function handleClose() {
    if (saving) return;

    setError("");

    onClose?.();
  }

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <form
      onSubmit={submit}
      className="w-full"
    >

      {/* =================================================
          FORM HEADER
      ================================================= */}

      <div className="mb-6 flex items-start gap-4">

        {/* ICON */}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

          <FolderTree size={23} />

        </div>

        {/* TITLE */}

        <div className="min-w-0">

          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
            {editing
              ? "Edit Category"
              : "Create New Category"}
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {editing
              ? "Update your category information below."
              : "Add a new category to organize your products."}
          </p>

        </div>

      </div>

      {/* =================================================
          FORM BODY
      ================================================= */}

      <div className="space-y-5">

        {/* =================================================
            CATEGORY NAME
        ================================================= */}

        <div>

          <label
            htmlFor="category-name"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Category Name
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">

            <FolderTree
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="category-name"
              type="text"
              required
              disabled={saving}
              autoComplete="off"
              placeholder="e.g. Electronics"
              value={f.name}
              onChange={(e) =>
                changeField(
                  "name",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

          </div>

          <p className="mt-1.5 text-xs text-slate-400">
            Use a short and clear category name.
          </p>

        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div>

          <label
            htmlFor="category-description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Description
          </label>

          <div className="relative">

            <FileText
              size={18}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
            />

            <textarea
              id="category-description"
              disabled={saving}
              rows={5}
              placeholder="Write a short description about this category..."
              value={f.description}
              onChange={(e) =>
                changeField(
                  "description",
                  e.target.value
                )
              }
              className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

          </div>

          <div className="mt-1.5 flex justify-between">

            <p className="text-xs text-slate-400">
              Optional
            </p>

            <p className="text-xs text-slate-400">
              {String(
                f.description || ""
              ).length}{" "}
              characters
            </p>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
              !
            </div>

            <div className="min-w-0">

              <p className="text-sm font-semibold text-red-700">
                Unable to save category
              </p>

              <p className="mt-0.5 text-xs leading-5 text-red-600">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            EDIT MODE INFO
        ================================================= */}

        {editing && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">

            <div className="flex items-start gap-3">

              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FolderTree size={15} />
              </div>

              <div>

                <p className="text-sm font-semibold text-blue-800">
                  Editing Category
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Changes will be saved to your existing
                  category.
                </p>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          FOOTER BUTTONS
      ================================================= */}

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

        {/* CANCEL */}

        <button
          type="button"
          disabled={saving}
          onClick={handleClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >

          <X size={17} />

          Cancel

        </button>

        {/* SAVE */}

        <button
          type="submit"
          disabled={
            saving ||
            !String(
              f.name || ""
            ).trim()
          }
          className="flex w-full min-w-[170px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-none sm:w-auto"
        >

          {saving ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              <span>
                Saving...
              </span>
            </>
          ) : (
            <>
              <Save size={18} />

              <span>
                {editing
                  ? "Update Category"
                  : "Add Category"}
              </span>
            </>
          )}

        </button>

      </div>

    </form>
  );
}