import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function HolidayPagination({
  currentPage = 1,
  totalPages = 1,
  totalEntries = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
}) {
  if (totalEntries === 0) return null;

  const startIdx = (currentPage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(currentPage * rowsPerPage, totalEntries);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-2">
      {/* Left: Showing entries info & Rows per page */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
        <span>
          Showing <span className="font-bold text-slate-700">{startIdx}</span>–
          <span className="font-bold text-slate-700">{endIdx}</span> of{" "}
          <span className="font-bold text-slate-700">{totalEntries}</span> holidays
        </span>

        {onRowsPerPageChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Pagination Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="p-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Buttons */}
        {pageNumbers.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`min-w-[34px] h-[34px] px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentPage === p
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="p-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
