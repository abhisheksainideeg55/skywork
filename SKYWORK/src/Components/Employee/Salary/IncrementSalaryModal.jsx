import React, { useState } from "react";
import {
  FiX,
  FiTrendingUp,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";

export default function IncrementSalaryModal({ record, onClose, onSuccess }) {
  const { incrementSalary, formatCurrency } = useSalary();

  if (!record) return null;

  const currentGross = record.grossSalary || record.currentSalary || 0;

  // Form State
  const [adjustmentType, setAdjustmentType] = useState("percentage"); // percentage | fixed_amount
  const [value, setValue] = useState(10);
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Live calculated preview
  let incrementAmount = 0;
  if (adjustmentType === "percentage") {
    incrementAmount = Math.round((currentGross * (Number(value) || 0)) / 100);
  } else {
    incrementAmount = Math.round(Number(value) || 0);
  }

  const newGrossSalary = currentGross + incrementAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!reason || reason.trim() === "") {
      setError("Please provide a valid justification/reason for the increment.");
      return;
    }

    if (Number(value) <= 0) {
      setError("Increment value must be greater than zero.");
      return;
    }

    if (!effectiveFrom) {
      setError("Effective date is mandatory.");
      return;
    }

    // Move to confirmation step
    setShowConfirmation(true);
  };

  const handleConfirmIncrement = async () => {
    setLoading(true);
    setError("");

    try {
      await incrementSalary(record.employeeId, {
        adjustmentType,
        value: Number(value),
        effectiveFrom,
        reason: reason.trim(),
        remarks: remarks.trim(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to execute salary increment.");
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/80 dark:border-gray-700 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-700 bg-emerald-50/60 dark:bg-emerald-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Salary Increment Workflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Authorized compensation increment for {record.employeeName} ({record.employeeId})
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs New Salary Interactive Card */}
          <div className="p-4 bg-slate-50 dark:bg-gray-750 rounded-2xl border border-slate-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">
                Current Gross
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-800 dark:text-gray-200">
                {formatCurrency(currentGross)}
              </span>
            </div>

            <div className="flex items-center justify-center text-emerald-600 font-bold text-xs gap-1">
              <FiArrowRight className="w-4 h-4 hidden sm:block" />
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg">
                +{formatCurrency(incrementAmount)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                New Gross Salary
              </span>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(newGrossSalary)}
              </span>
            </div>
          </div>

          {!showConfirmation ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Increment Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Increment Mode *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType("percentage");
                      setValue(10);
                    }}
                    className={`py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      adjustmentType === "percentage"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                        : "bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-50"
                    }`}
                  >
                    <FiPercent className="w-4 h-4" />
                    <span>Percentage (%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType("fixed_amount");
                      setValue(5000);
                    }}
                    className={`py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      adjustmentType === "fixed_amount"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                        : "bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-50"
                    }`}
                  >
                    <FiDollarSign className="w-4 h-4" />
                    <span>Fixed Amount (₹)</span>
                  </button>
                </div>
              </div>

              {/* Increment Value Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  {adjustmentType === "percentage" ? "Enter Increment Percentage (%)" : "Enter Increment Amount (₹)"} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.1"
                    step={adjustmentType === "percentage" ? "0.5" : "500"}
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full pl-3 pr-12 py-2.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    {adjustmentType === "percentage" ? "%" : "INR"}
                  </span>
                </div>
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Effective From Date *
                </label>
                <input
                  type="date"
                  required
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Reason for Increment (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Reason for Increment (Mandatory) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Appraisal Q3 FY26, Top 5% Performance Rating, Promotion"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Additional Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approved by department head during appraisal review"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Preview & Review Increment</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Step */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Confirm Salary Increment Authorization</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-300">
                  You are about to officially increment the monthly gross salary of <strong>{record.employeeName}</strong> from <strong>{formatCurrency(currentGross)}</strong> to <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(newGrossSalary)}</strong> (+{formatCurrency(incrementAmount)} / +{((incrementAmount / currentGross) * 100).toFixed(1)}%).
                </p>
                <div className="text-[11px] text-slate-500 dark:text-gray-400 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                  <span className="block"><strong>Effective Date:</strong> {effectiveFrom}</span>
                  <span className="block"><strong>Justification:</strong> {reason}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <FiShield className="w-4 h-4 shrink-0 text-indigo-600" />
                <span>This action will generate an immutable revision history record, create a secure audit log, and notify the employee.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-gray-700 flex justify-between gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                >
                  ← Back to Edit
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmIncrement}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>{loading ? "Applying Increment..." : "Confirm & Apply Increment"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
