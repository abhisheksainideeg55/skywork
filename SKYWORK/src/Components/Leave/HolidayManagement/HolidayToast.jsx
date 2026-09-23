import React from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";
import { useHoliday } from "../../../Context/HolidayContext";

export default function HolidayToast() {
  const { toast, clearToast } = useHoliday();

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";
  const isWarning = toast.type === "warning";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold max-w-md ${
          isSuccess
            ? "bg-emerald-900 text-emerald-50 border-emerald-700/80 shadow-emerald-950/20"
            : isError
            ? "bg-rose-900 text-rose-50 border-rose-700/80 shadow-rose-950/20"
            : isWarning
            ? "bg-amber-900 text-amber-50 border-amber-700/80 shadow-amber-950/20"
            : "bg-slate-900 text-slate-50 border-slate-700 shadow-slate-950/20"
        }`}
        role="alert"
      >
        {isSuccess && <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isError && <FiAlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {isWarning && <FiAlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
        {!isSuccess && !isError && !isWarning && (
          <FiInfo className="w-5 h-5 text-indigo-400 shrink-0" />
        )}

        <p className="flex-1 leading-snug">{toast.message}</p>

        <button
          type="button"
          onClick={clearToast}
          className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
