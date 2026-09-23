import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function LeavePagination({
  currentPage = 1,
  totalPages = 1,
  totalEntries = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
}) {
  if (totalEntries === 0) return null;

  const startEntry = Math.min((currentPage - 1) * rowsPerPage + 1, totalEntries);
  const endEntry = Math.min(currentPage * rowsPerPage, totalEntries);

  // Generate page numbers with windowing
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 bg-transparent text-xs text-slate-500">
      {/* Entries Info & Rows Per Page */}
      <div className="flex flex-wrap items-center gap-4">
        <span>
          Showing <span className="font-semibold text-slate-800">{startEntry}</span> to{" "}
          <span className="font-semibold text-slate-800">{endEntry}</span> of{" "}
          <span className="font-semibold text-slate-800">{totalEntries}</span> entries
        </span>

        {onRowsPerPageChange && (
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {[10, 20, 30, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            currentPage === 1
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer shadow-2xs"
          }`}
        >
          <FiChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentPage === pageNum
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            currentPage === totalPages || totalPages === 0
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer shadow-2xs"
          }`}
        >
          <span>Next</span>
          <FiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
