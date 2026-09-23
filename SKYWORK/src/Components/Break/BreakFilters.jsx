import React from "react";
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiRotateCcw,
  FiLock,
  FiFilter,
} from "react-icons/fi";
import { BREAK_TYPES } from "../../Data/breakData";

export default function BreakFilters({
  searchTerm,
  setSearchTerm,
  selectedBreakType,
  setSelectedBreakType,
  selectedShiftType,
  setSelectedShiftType,
  selectedStatus,
  setSelectedStatus,
  onResetFilters,
  onOpenAddModal,
  onExportCSV,
  isHR = false,
  totalResults = 0,
}) {
  const hasActiveFilters =
    searchTerm ||
    selectedBreakType !== "All Types" ||
    selectedShiftType !== "All Shifts" ||
    selectedStatus !== "All Statuses";

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search employee name, ID, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
            title="Export break audit logs to CSV"
          >
            <FiDownload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Logs</span>
          </button>

          {isHR ? (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-200 transition-all hover:shadow-md cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              <span>+ Add Break Policy</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
              <FiLock className="w-3.5 h-3.5 text-slate-500" />
              <span>Break Policies: HR Controlled</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Break Type Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Break Type
          </label>
          <select
            value={selectedBreakType}
            onChange={(e) => setSelectedBreakType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All Types">All Break Types</option>
            {BREAK_TYPES.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Type Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Shift Type
          </label>
          <select
            value={selectedShiftType}
            onChange={(e) => setSelectedShiftType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All Shifts">All Shifts</option>
            <option value="Day Shift">☀️ Day Shift</option>
            <option value="Night Shift">🌙 Night Shift</option>
            <option value="Rotational Shift">🔄 Rotational Shift</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Break Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="On Break">On Break (Live)</option>
            <option value="Completed">Completed</option>
            <option value="Exceeded">Exceeded / Overstay</option>
          </select>
        </div>

        {/* Reset / Results Count */}
        <div className="flex items-end justify-between gap-2">
          <div className="text-xs text-slate-500 font-medium pb-2">
            Showing <strong className="text-slate-800 font-bold">{totalResults}</strong> logs
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors mb-0.5 cursor-pointer"
            >
              <FiRotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
