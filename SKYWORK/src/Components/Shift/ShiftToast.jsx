import React from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

export default function ShiftToast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = "success" } = toast;

  let bgClass = "bg-slate-900 text-white border-slate-700 shadow-xl shadow-slate-900/20";
  let icon = <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;

  if (type === "error") {
    bgClass = "bg-rose-950 text-rose-100 border-rose-800 shadow-xl shadow-rose-950/30";
    icon = <FiAlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
  } else if (type === "warning") {
    bgClass = "bg-amber-950 text-amber-100 border-amber-800 shadow-xl shadow-amber-950/30";
    icon = <FiAlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
  } else if (type === "info") {
    bgClass = "bg-blue-950 text-blue-100 border-blue-800 shadow-xl shadow-blue-950/30";
    icon = <FiInfo className="w-5 h-5 text-blue-400 shrink-0" />;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-md">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${bgClass}`}
      >
        {icon}
        <p className="text-sm font-medium tracking-wide leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close notification"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
