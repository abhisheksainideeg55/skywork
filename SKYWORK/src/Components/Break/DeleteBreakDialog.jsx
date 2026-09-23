import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function DeleteBreakDialog({
  isOpen,
  onClose,
  onConfirm,
  policy,
}) {
  if (!isOpen || !policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden p-5 sm:p-6 my-auto animate-scale-up">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          Delete Break Policy?
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete the{" "}
          <strong className="text-slate-800 font-semibold">{policy.name}</strong>{" "}
          schedule ({policy.displayTime})? Employees on this shift will no longer receive automated break alarm alerts.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(policy.id)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs shadow-rose-200 transition-all hover:shadow-md cursor-pointer"
          >
            Yes, Delete Policy
          </button>
        </div>
      </div>
    </div>
  );
}
