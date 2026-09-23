import React from "react";

export default function BreakStatusBadge({ status }) {
  const s = (status || "Completed").toLowerCase();

  if (s === "on break") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
        On Break
      </span>
    );
  }

  if (s === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Completed
      </span>
    );
  }

  if (s === "exceeded" || s === "overstay") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        Exceeded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      {status}
    </span>
  );
}
