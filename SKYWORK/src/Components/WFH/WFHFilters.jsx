import React from "react";
import {
  FiSearch,
  FiRotateCcw,
  FiPlus,
  FiFilter,
  FiCalendar,
} from "react-icons/fi";
import { WFH_TYPES, WFH_DURATIONS } from "../../Data/wfhData";

export default function WFHFilters({
  searchTerm = "",
  onSearchChange,
  selectedDepartment = "All Departments",
  onDepartmentChange,
  selectedWFHType = "All Types",
  onWFHTypeChange,
  selectedStatus = "All Status",
  onStatusChange,
  selectedDuration = "All Durations",
  onDurationChange,
  selectedDate = "",
  onDateChange,
  onResetFilters,
  onOpenApplyModal,
  totalResults = 0,
  isHRView = false,
}) {
  const departments = [
    "All Departments",
    "Engineering",
    "HR",
    "Marketing",
    "Sales",
    "Design",
    "Product",
    "Finance",
  ];

  const statuses = ["All Status", "Pending", "Approved", "Rejected", "Cancelled"];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
      {/* Search Bar & Apply Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isHRView
                ? "Search employee name, ID, department, reason or deliverables..."
                : "Search your WFH requests by type, reason, deliverables..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Primary "+ Apply WFH" Button */}
        <button
          type="button"
          onClick={onOpenApplyModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs shadow-indigo-200 transition-all cursor-pointer shrink-0"
        >
          <FiPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Apply WFH</span>
        </button>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Department Filter (HR / Manager) */}
        {isHRView && (
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        )}

        {/* WFH Type Filter */}
        <select
          value={selectedWFHType}
          onChange={(e) => onWFHTypeChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="All Types">All WFH Types</option>
          {WFH_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Duration Filter */}
        <select
          value={selectedDuration}
          onChange={(e) => onDurationChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="All Durations">All Durations</option>
          {WFH_DURATIONS.map((dur) => (
            <option key={dur} value={dur}>
              {dur}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Reset Filter Button */}
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
        >
          <FiRotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Results Count Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
        <span className="flex items-center gap-1.5">
          <FiFilter className="w-3 h-3 text-slate-400" />
          <span>Showing filtered results</span>
        </span>
        <span className="font-semibold text-slate-700">{totalResults} records found</span>
      </div>
    </div>
  );
}
