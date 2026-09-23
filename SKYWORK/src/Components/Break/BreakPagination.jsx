import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function BreakPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-slate-200/80 rounded-b-2xl">
      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{startItem}</strong> to{" "}
          <strong className="text-slate-800 font-semibold">{endItem}</strong> of{" "}
          <strong className="text-slate-800 font-semibold">{totalItems}</strong> break logs
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <label htmlFor="break-page-size" className="text-slate-400 text-xs">
              Rows:
            </label>
            <select
              id="break-page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous page"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              return (
                p === 1 ||
                p === totalPages ||
                Math.abs(p - currentPage) <= 1
              );
            })
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) {
                acc.push("ellipsis-" + p);
              }
              acc.push(p);
              return acc;
            }, [])
            .map((item) => {
              if (typeof item === "string") {
                return (
                  <span
                    key={item}
                    className="px-2 py-1 text-xs text-slate-400 font-medium select-none"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = item === currentPage;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  className={`min-w-[28px] h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item}
                </button>
              );
            })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next page"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
