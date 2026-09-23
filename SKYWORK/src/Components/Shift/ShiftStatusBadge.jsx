import React from "react";

export default function ShiftStatusBadge({ status }) {
  const s = (status || "Active").toLowerCase();

  if (s === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Active
      </span>
    );
  }

  if (s === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Upcoming
      </span>
    );
  }

  if (s === "completed" || s === "expired") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      {status}
    </span>
  );
}
