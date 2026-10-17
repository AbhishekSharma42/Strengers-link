import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";

export default function DataTable({
  columns = [],
  rows = [],
  actions,
  loading = false,
  emptyMessage = "No data found.",
  storageKey = "global-table",
  defaultPageSize = 10,
}) {
  /*
   * ---------------------------------------------------
   * SAFE DATA
   * ---------------------------------------------------
   */

  const safeColumns = Array.isArray(columns)
    ? columns
    : [];

  const safeRows = Array.isArray(rows)
    ? rows
    : [];

  const [pageSize, setPageSize] = useState(() => {
    const n = Number(localStorage.getItem(`page-size:${storageKey}`));
    return [10, 20, 50].includes(n) ? n : defaultPageSize;
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    localStorage.setItem(`page-size:${storageKey}`, String(pageSize));
    setPage(1);
  }, [pageSize, storageKey]);

  const totalPages = Math.max(1, Math.ceil(safeRows.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const pagedRows = useMemo(() => safeRows.slice((page - 1) * pageSize, page * pageSize), [safeRows, page, pageSize]);

  /*
   * ---------------------------------------------------
   * ROW KEY
   * ---------------------------------------------------
   */

  function getRowKey(row, index) {
    return (
      row?.productId ||
      row?.categoryId ||
      row?.saleId ||
      row?.id ||
      row?._id ||
      index
    );
  }

  /*
   * ---------------------------------------------------
   * LOADING
   * ---------------------------------------------------
   */

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}

        <div className="overflow-x-auto">

          <table className="min-w-full text-left text-sm">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>
                {safeColumns.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {column.label}
                  </th>
                ))}

                {actions && (
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                )}
              </tr>

            </thead>

            <tbody>

              {Array.from({
                length: 5,
              }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 last:border-0"
                >

                  {safeColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-4"
                    >
                      <div className="h-4 w-full max-w-[180px] animate-pulse rounded-lg bg-slate-200" />
                    </td>
                  ))}

                  {actions && (
                    <td className="px-4 py-4">
                      <div className="ml-auto h-8 w-20 animate-pulse rounded-lg bg-slate-200" />
                    </td>
                  )}

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    );
  }

  /*
   * ---------------------------------------------------
   * EMPTY STATE
   * ---------------------------------------------------
   */

  if (safeRows.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">

          {/* ICON */}

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7h18M5 7v12h14V7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6M9 16h4"
              />
            </svg>

          </div>

          <h3 className="text-sm font-semibold text-slate-700">
            {emptyMessage}
          </h3>

          <p className="mt-1 max-w-sm text-xs text-slate-400">
            There is currently no information available
            to display here.
          </p>

        </div>

      </div>
    );
  }

  /*
   * ---------------------------------------------------
   * TABLE
   * ---------------------------------------------------
   */

  return (
    <div className="relative z-0 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* =================================================
          TABLE SCROLL AREA
      ================================================= */}

      <div className="max-h-[70vh] overflow-auto">

        <table className="min-w-full text-left text-sm">

          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <thead className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">

            <tr>

              {safeColumns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                    column.className || ""
                  }`}
                >
                  {column.label}
                </th>
              ))}

              {actions && (
                <th className="sticky right-0 z-30 whitespace-nowrap border-l border-slate-200 bg-slate-50/95 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">
                  Actions
                </th>
              )}

            </tr>

          </thead>

          {/* =================================================
              TABLE BODY
          ================================================= */}

          <tbody className="divide-y divide-slate-100">

            {pagedRows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="group transition-colors duration-150 hover:bg-blue-50/40"
              >

                {safeColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3.5 align-middle text-slate-700 ${
                      column.className || ""
                    }`}
                  >

                    <div
                      className={
                        column.noWrap
                          ? "whitespace-nowrap"
                          : "max-w-[300px]"
                      }
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key] ?? "-"}
                    </div>

                  </td>
                ))}

                {/* =================================================
                    ACTIONS
                ================================================= */}

                {actions && (
                  <td className="sticky right-0 z-10 border-l border-slate-100 bg-white px-4 py-3.5 text-right transition-colors group-hover:bg-blue-50/40">

                    <div className="flex items-center justify-end gap-2">
                      {actions(row)}
                    </div>

                  </td>
                )}

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={safeRows.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        storageKey={storageKey}
      />

      {/* =================================================
          MOBILE SCROLL HINT
      ================================================= */}

      <div className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] text-white opacity-70 sm:hidden">
        Swipe → 
      </div>

    </div>
  );
}