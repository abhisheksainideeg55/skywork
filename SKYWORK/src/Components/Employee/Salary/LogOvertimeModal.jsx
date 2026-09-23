import React, { useState } from "react";
import {
  FiX,
  FiClock,
  FiCalendar,
  FiBriefcase,
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";

export default function LogOvertimeModal({ isOpen, onClose, onSuccess }) {
  const { requestOvertime, formatCurrency } = useSalary();
  const { currentUser } = useAuth();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [overtimeHours, setOvertimeHours] = useState(2);
  const [regularHours, setRegularHours] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(500);
  const [project, setProject] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!date) {
      setError("Please select the date of overtime work.");
      return;
    }
    if (!overtimeHours || Number(overtimeHours) <= 0) {
      setError("Please enter valid overtime hours (minimum 0.5 hours).");
      return;
    }
    if (!reason.trim()) {
      setError("Please describe the reason / work done during overtime.");
      return;
    }

    setLoading(true);
    try {
      await requestOvertime({
        employeeId: currentUser?.employeeId || currentUser?.id,
        employeeName: currentUser?.name || "Employee",
        department: currentUser?.department || "Engineering",
        date,
        regularHours: Number(regularHours) || 8,
        overtimeHours: Number(overtimeHours),
        hourlyRate: Number(hourlyRate) || 500,
        project: project.trim() || "General Project",
        reason: reason.trim(),
      });

      if (onSuccess) {
        onSuccess("Overtime request submitted to HR for approval!");
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit overtime request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const estimatedPay = Number(overtimeHours || 0) * Number(hourlyRate || 500);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-gray-700 bg-indigo-50/60 dark:bg-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Log Extra Time / Overtime
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Submit extra hours worked for HR verification & salary credit.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-indigo-500" />
                Work Date *
              </label>
              <input
                type="date"
                required
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-gray-750 border border-slate-200 dark:border-gray-600 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {/* Overtime Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-indigo-500" />
                Extra / Overtime Hours *
              </label>
              <input
                type="number"
                min="0.5"
                max="16"
                step="0.5"
                required
                placeholder="e.g. 2.5"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-gray-750 border border-slate-200 dark:border-gray-600 text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>

          {/* Project / Task */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <FiBriefcase className="w-3.5 h-3.5 text-indigo-500" />
              Project / Client / Task *
            </label>
            <input
              type="text"
              placeholder="e.g. Payment Gateway Migration, Production Hotfix, Sprint Deployment"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-gray-750 border border-slate-200 dark:border-gray-600 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          {/* Reason / Work Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5 text-indigo-500" />
              Details / Reason for Extra Hours *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explain why extra time was required and what tasks were completed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-gray-750 border border-slate-200 dark:border-gray-600 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none"
            />
          </div>

          {/* Estimated Payout Banner */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Estimated Overtime Payout:
              </span>
            </div>
            <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(estimatedPay)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to HR...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Submit Overtime Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
