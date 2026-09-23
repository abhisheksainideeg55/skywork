import React, { useState } from "react";
import {
  FiX,
  FiLock,
  FiUnlock,
  FiAlertTriangle,
  FiCheckCircle,
  FiShield,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";

export default function PayrollHistoryLockModal({ isOpen, onClose }) {
  const { payrollPeriods, lockPayroll, formatCurrency } = useSalary();

  const [confirmLockTarget, setConfirmLockTarget] = useState(null); // period object to lock
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  if (!isOpen) return null;

  const handleConfirmLock = async () => {
    if (!confirmLockTarget) return;
    setIsProcessing(true);
    try {
      await lockPayroll(confirmLockTarget.month, confirmLockTarget.year);
      setSuccessToast(`Payroll period ${confirmLockTarget.month} ${confirmLockTarget.year} locked successfully!`);
      setConfirmLockTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6 z-10 space-y-5">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <FiLock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Payroll History & Period Lock</h3>
              <p className="text-xs text-slate-300">
                Statutory Payroll Finalization & Period Freezing
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

        {/* Toast */}
        {successToast && (
          <div className="mx-6 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="px-5 sm:px-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Information Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
            <FiShield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">What happens when a Payroll Period is Locked?</p>
              <p className="text-indigo-800 leading-relaxed">
                Once locked, past salary revisions and compensation changes will not modify the finalized payroll register. Any subsequent financial corrections must be recorded as explicit retroactive adjustments in the next cycle.
              </p>
            </div>
          </div>

          {/* Confirmation Dialog Overlay when user clicks Lock */}
          {confirmLockTarget && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-3 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Lock {confirmLockTarget.month} {confirmLockTarget.year} Payroll Period?</span>
              </div>
              <p className="text-xs text-amber-800">
                Are you sure you want to finalize and lock the payroll for <strong>{confirmLockTarget.month} {confirmLockTarget.year}</strong> ({confirmLockTarget.totalEmployees} employees, net payable: {formatCurrency(confirmLockTarget.netPayable)})? This action creates a permanent compliance record.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmLockTarget(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-900 font-bold text-xs hover:bg-amber-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLock}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-300 cursor-pointer disabled:opacity-50"
                >
                  <FiLock className="w-3.5 h-3.5" />
                  <span>{isProcessing ? "Locking..." : "Confirm Lock Period"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Periods Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Payroll Cycle</th>
                  <th className="px-4 py-3">Employees</th>
                  <th className="px-4 py-3">Gross / Net</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Processed Date & By</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollPeriods.map((period) => (
                  <tr key={period.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {period.month} {period.year}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {period.id}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {period.totalEmployees} Staff
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">
                        {formatCurrency(period.netPayable)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Gross: {formatCurrency(period.grossSalary)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {period.status === "Locked" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <FiLock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      ) : period.status === "Processed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <FiCheckCircle className="w-3 h-3" />
                          <span>Processed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <FiClock className="w-3 h-3" />
                          <span>{period.status}</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      <span className="font-medium text-slate-700 block">{period.processedDate}</span>
                      <span className="text-[10px] text-slate-400">{period.processedBy}</span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {period.status === "Locked" ? (
                        <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1">
                          <FiLock className="w-3 h-3" />
                          <span>Finalized</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmLockTarget(period)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors cursor-pointer"
                        >
                          Lock Period
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
