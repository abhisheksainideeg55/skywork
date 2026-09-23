import React, { useMemo } from "react";
import {
  FiX,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiShield,
  FiCalendar,
  FiUser,
  FiInfo,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";

export default function SalaryHistoryModal({ record, onClose }) {
  const { salaryHistory, formatCurrency } = useSalary();

  if (!record) return null;

  // Filter history for this employee, sorted newest first
  const employeeHistory = useMemo(() => {
    return (salaryHistory || [])
      .filter((h) => h && h.employeeId === record.employeeId)
      .sort((a, b) => new Date(b?.date || b?.effectiveFrom || 0) - new Date(a?.date || a?.effectiveFrom || 0));
  }, [salaryHistory, record.employeeId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6 z-10 space-y-5">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={record.avatar}
              alt={record.employeeName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-400/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{record.employeeName}</h3>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-indigo-200">
                  {record.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Immutable Salary Revision & Compensation History
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Notice Banner */}
        <div className="mx-5 sm:mx-6 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2.5 text-xs text-indigo-900">
          <FiShield className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Historical compensation logs are <strong>tamper-proof & immutable</strong>. All previous increments and adjustments are retained permanently for tax audits.
          </span>
        </div>

        {/* History Timeline */}
        <div className="px-5 sm:px-6 max-h-[60vh] overflow-y-auto space-y-4">
          {employeeHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <FiClock className="w-6 h-6 text-slate-300 mx-auto mb-1" />
              <p className="font-semibold text-slate-600">No previous adjustments found.</p>
              <p className="text-slate-400 mt-0.5">Current initial salary is active.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 border-l-2 border-indigo-100 ml-3">
              {employeeHistory.map((item, idx) => {
                const isIncrement = item.type === "increment";
                const isDecrement = item.type === "decrement";
                const isInitial = item.type === "initial";

                return (
                  <div key={item.id || idx} className="relative space-y-1.5 group">
                    {/* Dot on Timeline */}
                    <div
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isIncrement
                          ? "bg-emerald-500"
                          : isDecrement
                          ? "bg-rose-500"
                          : "bg-indigo-500"
                      }`}
                    />

                    {/* Timeline Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-colors space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isIncrement
                                ? "bg-emerald-100 text-emerald-800"
                                : isDecrement
                                ? "bg-rose-100 text-rose-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {isIncrement && <FiTrendingUp className="w-3 h-3" />}
                            {isDecrement && <FiTrendingDown className="w-3 h-3" />}
                            <span className="capitalize">{item.type} Revision</span>
                          </span>

                          <span className="text-xs text-slate-400 font-medium">
                            {item.date || item.effectiveFrom}
                          </span>
                        </div>

                        <span className="font-mono text-xs font-bold text-slate-500">
                          ID: {item.id}
                        </span>
                      </div>

                      {/* Salary Change Numbers */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            Previous
                          </span>
                          <span className="font-semibold text-slate-700">
                            {formatCurrency(item.previousSalary)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            Adjustment
                          </span>
                          <span
                            className={`font-black ${
                              isIncrement
                                ? "text-emerald-600"
                                : isDecrement
                                ? "text-rose-600"
                                : "text-indigo-600"
                            }`}
                          >
                            {isInitial
                              ? "Joining Base"
                              : item.adjustmentType === "percentage"
                              ? `${isIncrement ? "+" : "-"}${item.adjustmentValue}%`
                              : `${isIncrement ? "+" : "-"}${formatCurrency(item.adjustmentValue)}`}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            New Gross
                          </span>
                          <span className="font-black text-slate-900 text-sm">
                            {formatCurrency(item.newSalary)}
                          </span>
                        </div>
                      </div>

                      {/* Reason & Changed By */}
                      <div className="text-xs space-y-1">
                        <p className="text-slate-700 font-medium">
                          <strong>Reason:</strong> {item.reason}
                        </p>
                        {item.remarks && (
                          <p className="text-slate-500 text-[11px]">
                            <em>Note: {item.remarks}</em>
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>Authorized by: <strong>{item.changedBy || "HR Admin"}</strong></span>
                          <span>Effective: <strong>{item.effectiveFrom}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
