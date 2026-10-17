import { AlertTriangle, Loader2, X, Trash2 } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Delete Product",
  message = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel?.();
        }
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {title}
              </h2>

              <p className="text-xs text-slate-500">
                This action cannot be undone.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>

        {/* MESSAGE */}

        <div className="px-5 py-5">

          <p className="text-sm leading-6 text-slate-600">
            {message}
          </p>

        </div>

        {/* BUTTONS */}

        <div className="flex justify-end gap-3 border-t bg-slate-50 px-5 py-4">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex min-w-[110px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={17} />

                {confirmText}
              </>
            )}

          </button>

        </div>

      </div>
    </div>
  );
}