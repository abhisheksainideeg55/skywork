import React from "react";
import { FiChevronLeft, FiChevronRight, FiChevronDown } from "react-icons/fi";

export default function AttendancePagination({
  currentPage,
  totalPages,
  totalEntries,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  if (totalEntries === 0) return null;

  const startEntry = (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, totalEntries);

  // Generate page numbers to show (e.g. 1, 2, 3, 4, 5)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:px-5 sm:py-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
      {/* Left Section: Rows Per Page & Showing Entries */}
      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {[10, 20, 30, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-700">{startEntry}–{endEntry}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalEntries}</span> entries
        </div>
      </div>

      {/* Right Section: Pagination Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <FiChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs">
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          aria-label="Next page"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
