import React from "react";
import {
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiChevronDown,
} from "react-icons/fi";
import { LEAVE_TYPES, LEAVE_STATUSES } from "../../Data/leaveData";
import { DEPARTMENTS } from "../../Pages/HR/EmployeeAttendance/attendanceData";

export default function LeaveFilters({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedLeaveType,
  onLeaveTypeChange,
  selectedStatus,
  onStatusChange,
  selectedDuration,
  onDurationChange,
  selectedDate,
  onDateChange,
  onResetFilters,
  onOpenApplyModal,
  totalResults,
  isHRView = false,
}) {
  const hasActiveFilters =
    Boolean(searchTerm) ||
    (isHRView && selectedDepartment !== "All Departments") ||
    selectedLeaveType !== "All Types" ||
    selectedStatus !== "All Status" ||
    selectedDuration !== "All Durations" ||
    Boolean(selectedDate);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Top Row: Search Input + Single + Apply Leave Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isHRView
                ? "Search employee name, ID, department or reason..."
                : "Search leaves by type, reason or date..."
            }
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

        {/* Primary Action: + Apply Leave Button */}
        {onOpenApplyModal && (
          <button
            type="button"
            onClick={onOpenApplyModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200 hover:shadow-indigo-300 shadow-xs transition-all cursor-pointer shrink-0"
            title="Apply for Leave"
          >
            <FiPlus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        )}
      </div>

      {/* Bottom Row: Filters (Date, Department, Type, Status, Duration, Reset) */}
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

          {/* Department Filter (Only for HR / Admin view) */}
          {isHRView && (
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
          )}

          {/* Leave Type Select */}
          <div className="relative">
            <select
              value={selectedLeaveType}
              onChange={(e) => onLeaveTypeChange(e.target.value)}
              aria-label="Filter by leave type"
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All Types">All Leave Types</option>
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
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
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All Durations">All Durations</option>
              <option value="Full Day">Full Day</option>
              <option value="Half Day">Half Day</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Select */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Filter by leave status"
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All Status">All Status</option>
              {LEAVE_STATUSES.map((status) => (
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
          {isHRView && selectedDepartment !== "All Departments" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Dept: {selectedDepartment}
            </span>
          )}
          {selectedLeaveType !== "All Types" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Type: {selectedLeaveType}
            </span>
          )}
          {selectedDuration !== "All Durations" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Duration: {selectedDuration}
            </span>
          )}
          {selectedStatus !== "All Status" && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Status: {selectedStatus}
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
