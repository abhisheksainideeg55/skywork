import React from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function HolidayStatusBadge({ status = "Active", size = "normal" }) {
  const isActive = status === "Active";

  if (size === "small") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
          isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
            : "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isActive ? "bg-emerald-500" : "bg-slate-400"
          }`}
        />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
          : "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {isActive ? (
        <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <FiXCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      )}
      <span>{status}</span>
    </span>
  );
}
