import React from "react";
import { FiSearch, FiRefreshCw, FiChevronDown, FiPlus, FiLogOut, FiCheckCircle, FiCalendar, FiFilter } from "react-icons/fi";
import { DEPARTMENTS, STATUS_LIST } from "./attendanceData";

export default function AttendanceFilters({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  selectedDate,
  onDateChange,
  onResetFilters,
  onOpenManualModal,
  userTodayStatus,
  totalResults,
}) {
  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedDepartment !== "All Departments" ||
    selectedStatus !== "All Status" ||
    Boolean(selectedDate);

  const isCheckedIn = userTodayStatus?.status === "checked_in";
  const isCompleted = userTodayStatus?.status === "completed";

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Top Row: Search Input + Single Manual Attendance Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search employee by name, ID or email..."
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

        {/* The ONLY Manual Attendance Button on this page */}
        {onOpenManualModal && (
          <button
            type="button"
            onClick={onOpenManualModal}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0 ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                : isCheckedIn
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200 hover:shadow-indigo-300"
            }`}
            title="Manual Attendance"
          >
            {isCompleted ? (
              <>
                <FiCheckCircle className="w-4 h-4" />
                <span>Completed ✓</span>
              </>
            ) : isCheckedIn ? (
              <>
                <FiLogOut className="w-4 h-4" />
                <span>Check Out ({userTodayStatus.checkIn})</span>
              </>
            ) : (
              <>
                <FiPlus className="w-4 h-4" />
                <span>Manual Attendance</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Bottom Row: Filters (Date, Department, Status, Reset) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker Filter */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              title="Filter by Date"
            />
          </div>

          {/* Department Select */}
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              aria-label="Filter by department"
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Select */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Filter by attendance status"
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              {STATUS_LIST.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
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
          <span>{totalResults}</span> record{totalResults !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 text-xs">
          <span className="font-semibold text-slate-500">Active:</span>
          {searchTerm && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Search: "{searchTerm}"
            </span>
          )}
          {selectedDepartment !== "All Departments" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              {selectedDepartment}
            </span>
          )}
          {selectedStatus !== "All Status" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              {selectedStatus}
            </span>
          )}
          {selectedDate && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Date: {selectedDate}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
