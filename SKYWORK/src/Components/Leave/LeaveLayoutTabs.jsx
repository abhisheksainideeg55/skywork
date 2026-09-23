import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiClock, FiCalendar } from "react-icons/fi";

export default function LeaveLayoutTabs() {
  const location = useLocation();

  const isHRPortal =
    location.pathname.startsWith("/hr/leave") ||
    location.pathname.startsWith("/hr/leaves") ||
    location.pathname.startsWith("/hr/holidays");

  const isHolidayPage =
    location.pathname.includes("/holidays") ||
    location.pathname.endsWith("/holidays");

  const leaveBasePath = isHRPortal ? "/hr/leave" : "/leave";
  const holidayBasePath = isHRPortal ? "/hr/leave/holidays" : "/leave/holidays";

  return (
    <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs mb-6">
      <div className="flex items-center gap-2">
        <Link
          to={leaveBasePath}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            !isHolidayPage
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FiClock className="w-4 h-4" />
          <span>Leave Requests & Summary</span>
        </Link>
        <Link
          to={holidayBasePath}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            isHolidayPage
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FiCalendar className="w-4 h-4" />
          <span>Holiday Calendar</span>
        </Link>
      </div>
    </div>
  );
}
