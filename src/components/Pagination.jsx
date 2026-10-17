import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  options = [10, 20, 50],
  storageKey,
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (!total) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="reports-pagination flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="text-slate-500">
        Showing <span className="font-semibold text-slate-700">{start}-{end}</span> of <span className="font-semibold text-slate-700">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-slate-500">
          Rows
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-medium text-slate-700 outline-none focus:border-emerald-500"
            aria-label="Rows per page"
          >
            {options.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button type="button" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={16}/></button>
        <span className="min-w-[64px] text-center font-semibold text-slate-700">{page} / {pages}</span>
        <button type="button" disabled={page >= pages} onClick={() => onPageChange?.(page + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight size={16}/></button>
      </div>
    </div>
  );
}
