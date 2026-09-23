import React from "react";
import {
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiChevronDown,
  FiList,
  FiCalendar,
} from "react-icons/fi";
import { HOLIDAY_TYPES, HOLIDAY_STATUSES } from "../../../Data/holidayData";

export default function HolidayFilters({
  searchTerm,
  onSearchChange,
  selectedYear,
  onYearChange,
  yearList = ["2026", "2027", "2028"],
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedDuration,
  onDurationChange,
  onResetFilters,
  onOpenAddModal,
  totalResults = 0,
  isHR = false,
  viewMode = "list",
  onViewModeChange,
}) {
  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedYear !== "All Years" ||
    selectedType !== "All Types" ||
    selectedStatus !== "All Status" ||
    selectedDuration !== "All Durations";

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Top Row: Search Input + View Mode Toggle + [+ Add Holiday] Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search holidays by name, description or date..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-200/70 hover:bg-slate-200 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode Toggle & Add Button Group */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* List / Calendar View Toggle */}
          {onViewModeChange && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="List View"
              >
                <FiList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List View</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "calendar"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Calendar View"
              >
                <FiCalendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calendar View</span>
              </button>
            </div>
          )}

          {/* Primary Action Button: + Add Holiday (HR ONLY) */}
          {isHR && onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200 shadow-xs transition-all cursor-pointer shrink-0"
              title="Add New Holiday"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Filter Dropdowns (Year, Holiday Type, Status, Duration, Reset) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Filter */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              aria-label="Filter by year"
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All Years">All Years</option>
              {yearList.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Holiday Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              aria-label="Filter by holiday type"
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All Types">All Holiday Types</option>
              {HOLIDAY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Filter by status"
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All Status">All Statuses</option>
              {HOLIDAY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Duration Filter */}
          <div className="relative">
            <select
              value={selectedDuration}
              onChange={(e) => onDurationChange(e.target.value)}
              aria-label="Filter by duration"
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All Durations">All Durations</option>
              <option value="Full Day">Full Day</option>
              <option value="Half Day">Half Day</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Results Counter */}
        <div className="text-xs font-semibold text-slate-500">
          <span>{totalResults}</span> holiday{totalResults !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 text-xs">
          <span className="font-semibold text-slate-500">Active Filters:</span>
          {searchTerm && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Search: "{searchTerm}"
            </span>
          )}
          {selectedYear !== "All Years" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Year: {selectedYear}
            </span>
          )}
          {selectedType !== "All Types" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Type: {selectedType}
            </span>
          )}
          {selectedStatus !== "All Status" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Status: {selectedStatus}
            </span>
          )}
          {selectedDuration !== "All Durations" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Duration: {selectedDuration}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
