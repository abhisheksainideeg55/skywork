import React from "react";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiCalendar,
  FiLayers,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";

export default function SalaryFilterToolbar({
  searchTerm,
  setSearchTerm,
  selectedDept,
  setSelectedDept,
  selectedDesignation,
  setSelectedDesignation,
  selectedStatus,
  setSelectedStatus,
  selectedMonth,
  setSelectedMonth,
  selectedSalaryRange,
  setSelectedSalaryRange,
  sortBy,
  setSortBy,
  departments = [],
  designations = [],
  onClearFilters,
  totalResultsCount = 0,
  currentPage = 1,
  setCurrentPage,
  itemsPerPage = 10,
  setItemsPerPage,
}) {
  const months = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const salaryRanges = [
    { label: "All Salary Ranges", value: "all" },
    { label: "Under ₹50,000", value: "under_50k" },
    { label: "₹50,000 - ₹1,00,000", value: "50k_100k" },
    { label: "₹1,00,000 - ₹1,50,000", value: "100k_150k" },
    { label: "Above ₹1,50,000", value: "above_150k" },
  ];

  const totalPages = Math.max(1, Math.ceil(totalResultsCount / itemsPerPage));

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedDept !== "All Departments" ||
    selectedDesignation !== "All Designations" ||
    selectedStatus !== "All Statuses" ||
    (selectedMonth && selectedMonth !== "All Months") ||
    (selectedSalaryRange && selectedSalaryRange !== "all") ||
    sortBy !== "recently_updated";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-200/80 dark:border-gray-700 shadow-xs space-y-3.5">
      {/* Top Search & Sorting Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employee by name or ID (e.g. EMP001)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (setCurrentPage) setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Department Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              if (setCurrentPage) setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All Departments">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="md:col-span-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="recently_updated">Sort: Recently Updated</option>
            <option value="highest_salary">Sort: Highest Salary (Gross)</option>
            <option value="lowest_salary">Sort: Lowest Salary (Gross)</option>
            <option value="name_asc">Sort: Employee Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Secondary Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Designation Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Designation
          </label>
          <select
            value={selectedDesignation}
            onChange={(e) => {
              setSelectedDesignation(e.target.value);
              if (setCurrentPage) setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-xs text-slate-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All Designations">All Designations</option>
            {designations.map((desig) => (
              <option key={desig} value={desig}>
                {desig}
              </option>
            ))}
          </select>
        </div>

        {/* Salary Status */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Salary Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              if (setCurrentPage) setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-xs text-slate-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="active">Active</option>
            <option value="revised">Revised</option>
            <option value="scheduled">Scheduled</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Payroll Month */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Payroll Month
          </label>
          <select
            value={selectedMonth || "All Months"}
            onChange={(e) => {
              if (setSelectedMonth) setSelectedMonth(e.target.value);
              if (setCurrentPage) setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-xs text-slate-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Salary Range
          </label>
          <select
            value={selectedSalaryRange || "all"}
            onChange={(e) => {
              if (setSelectedSalaryRange) setSelectedSalaryRange(e.target.value);
              if (setCurrentPage) setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-xs text-slate-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {salaryRanges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="w-full py-1.5 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <FiX className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          ) : (
            <div className="w-full py-1.5 text-center text-[11px] text-slate-400 dark:text-gray-500 font-medium">
              Filters active
            </div>
          )}
        </div>
      </div>

      {/* Pagination & Results Count Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-gray-400">
        <div>
          Showing <span className="font-bold text-slate-800 dark:text-white">{totalResultsCount}</span> employee records
        </div>

        {setCurrentPage && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  if (setItemsPerPage) setItemsPerPage(Number(e.target.value));
                  if (setCurrentPage) setCurrentPage(1);
                }}
                className="px-2 py-1 rounded bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-semibold cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-slate-800 dark:text-white px-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
