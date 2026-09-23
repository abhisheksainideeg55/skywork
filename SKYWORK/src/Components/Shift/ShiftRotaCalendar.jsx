import React, { useState } from "react";
import {
  FiCalendar,
  FiSun,
  FiMoon,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
} from "react-icons/fi";
import { getShiftColorToken } from "../../Utils/shiftUtils";

export default function ShiftRotaCalendar({ allocations = [], onViewDetails }) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const daysOfWeek = [
    { day: "Mon", full: "Monday" },
    { day: "Tue", full: "Tuesday" },
    { day: "Wed", full: "Wednesday" },
    { day: "Thu", full: "Thursday" },
    { day: "Fri", full: "Friday" },
    { day: "Sat", full: "Saturday" },
    { day: "Sun", full: "Sunday" },
  ];

  // Group allocations by shift type
  const dayStaff = allocations.filter((a) => a.shiftType === "Day Shift");
  const nightStaff = allocations.filter((a) => a.shiftType === "Night Shift");
  const rotationalStaff = allocations.filter(
    (a) => a.shiftType === "Rotational Shift"
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-indigo-600" />
            <span>Weekly Shift Coverage Roster</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual schedule of operational shifts across daytime and night coverage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Week {currentWeekOffset === 0 ? "Current" : currentWeekOffset > 0 ? `+${currentWeekOffset}` : currentWeekOffset}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              title="Previous week"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              title="Next week"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Shifts Rota Lanes */}
      <div className="mt-5 space-y-4">
        {/* Day Shift Row */}
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <FiSun className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  ☀️ Day Shift (09:00 AM – 06:00 PM)
                </h4>
                <span className="text-[11px] text-amber-700 font-medium">
                  Standard Business Hours • {dayStaff.length} Employees Active
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 self-start sm:self-auto">
              {dayStaff.length} On Duty
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {dayStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => onViewDetails && onViewDetails(staff)}
                className="bg-white/90 hover:bg-white rounded-xl p-2.5 border border-amber-200/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <img
                  src={staff.avatar}
                  alt={staff.employeeName}
                  className="w-7 h-7 rounded-full object-cover border border-amber-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {staff.employeeName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{staff.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Night Shift Row */}
        <div className="rounded-2xl border border-purple-200/90 bg-purple-50/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <FiMoon className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-purple-900">
                  🌙 Night Shift (09:00 PM – 06:00 AM)
                </h4>
                <span className="text-[11px] text-purple-700 font-medium">
                  24/7 Ops & Monitoring • +20% Night Allowance • {nightStaff.length} Employees
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 self-start sm:self-auto">
              {nightStaff.length} On Duty
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {nightStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => onViewDetails && onViewDetails(staff)}
                className="bg-white/90 hover:bg-white rounded-xl p-2.5 border border-purple-200/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <img
                  src={staff.avatar}
                  alt={staff.employeeName}
                  className="w-7 h-7 rounded-full object-cover border border-purple-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {staff.employeeName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{staff.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rotational Shift Row */}
        <div className="rounded-2xl border border-teal-200/90 bg-teal-50/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                <FiRefreshCw className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-teal-900">
                  🔄 Rotational Shift (02:00 PM – 11:00 PM)
                </h4>
                <span className="text-[11px] text-teal-700 font-medium">
                  Bi-Weekly Schedule • Evening Desk Coverage • {rotationalStaff.length} Employees
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 self-start sm:self-auto">
              {rotationalStaff.length} On Duty
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {rotationalStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => onViewDetails && onViewDetails(staff)}
                className="bg-white/90 hover:bg-white rounded-xl p-2.5 border border-teal-200/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <img
                  src={staff.avatar}
                  alt={staff.employeeName}
                  className="w-7 h-7 rounded-full object-cover border border-teal-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {staff.employeeName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{staff.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
