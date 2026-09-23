import React, { useState } from "react";
import {
  FiX,
  FiTrendingDown,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";

export default function DecrementSalaryModal({ record, onClose, onSuccess }) {
  const { decrementSalary, formatCurrency } = useSalary();

  if (!record) return null;

  const currentGross = record.grossSalary || record.currentSalary || 0;

  // Form State
  const [decrementMode, setDecrementMode] = useState("target_salary"); // target_salary | fixed_amount | percentage
  const [targetSalary, setTargetSalary] = useState(Math.max(10000, currentGross - 5000));
  const [percentValue, setPercentValue] = useState(10);
  const [fixedValue, setFixedValue] = useState(5000);
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate live preview numbers
  let newGrossSalary = currentGross;
  let decrementAmount = 0;

  if (decrementMode === "target_salary") {
    newGrossSalary = Math.max(0, Number(targetSalary) || 0);
    decrementAmount = currentGross - newGrossSalary;
  } else if (decrementMode === "percentage") {
    decrementAmount = Math.round((currentGross * (Number(percentValue) || 0)) / 100);
    newGrossSalary = Math.max(0, currentGross - decrementAmount);
  } else {
    decrementAmount = Math.round(Number(fixedValue) || 0);
    newGrossSalary = Math.max(0, currentGross - decrementAmount);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!reason || reason.trim() === "") {
      setError("Please provide a valid justification/reason for this salary decrement/revision.");
      return;
    }

    if (newGrossSalary <= 0) {
      setError("Calculated new salary cannot be zero or negative.");
      return;
    }

    if (newGrossSalary >= currentGross) {
      setError("New salary must be strictly lower than the current gross salary.");
      return;
    }

    if (!effectiveFrom) {
      setError("Effective date is mandatory.");
      return;
    }

    // Move to confirmation step
    setShowConfirmation(true);
  };

  const handleConfirmDecrement = async () => {
    setLoading(true);
    setError("");

    try {
      if (decrementMode === "target_salary") {
        await decrementSalary(record.employeeId, {
          targetSalary: newGrossSalary,
          effectiveFrom,
          reason: reason.trim(),
          remarks: remarks.trim(),
        });
      } else if (decrementMode === "percentage") {
        await decrementSalary(record.employeeId, {
          adjustmentType: "percentage",
          value: Number(percentValue),
          effectiveFrom,
          reason: reason.trim(),
          remarks: remarks.trim(),
        });
      } else {
        await decrementSalary(record.employeeId, {
          adjustmentType: "fixed_amount",
          value: Number(fixedValue),
          effectiveFrom,
          reason: reason.trim(),
          remarks: remarks.trim(),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to execute salary decrement.");
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/80 dark:border-gray-700 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-700 bg-rose-50/60 dark:bg-rose-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <FiTrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Salary Decrement / Revision Workflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Authorized compensation reduction for {record.employeeName} ({record.employeeId})
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

            <div className="flex items-center justify-center text-rose-600 font-bold text-xs gap-1">
              <FiArrowRight className="w-4 h-4 hidden sm:block" />
              <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 rounded-lg">
                -{formatCurrency(decrementAmount)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                Revised Gross Salary
              </span>
              <span className="text-lg sm:text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                {formatCurrency(newGrossSalary)}
              </span>
            </div>
          </div>

          {!showConfirmation ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Decrement Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Calculation Mode *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecrementMode("target_salary")}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      decrementMode === "target_salary"
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs"
                        : "bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>Target Salary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecrementMode("percentage")}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      decrementMode === "percentage"
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs"
                        : "bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-50"
                    }`}
                  >
                    <FiPercent className="w-3.5 h-3.5" />
                    <span>Percentage (%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecrementMode("fixed_amount")}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      decrementMode === "fixed_amount"
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs"
                        : "bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-50"
                    }`}
                  >
                    <FiDollarSign className="w-3.5 h-3.5" />
                    <span>Fixed Cut (₹)</span>
                  </button>
                </div>
              </div>

              {/* Mode-Specific Input Field */}
              {decrementMode === "target_salary" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Enter Target Revised Salary (₹) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max={currentGross - 1}
                    required
                    value={targetSalary}
                    onChange={(e) => setTargetSalary(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-sm font-bold font-mono text-rose-700 dark:text-rose-300 focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    System calculates difference: <strong>-{formatCurrency(decrementAmount)}</strong>
                  </span>
                </div>
              )}

              {decrementMode === "percentage" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Enter Decrement Percentage (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      step="0.5"
                      required
                      value={percentValue}
                      onChange={(e) => setPercentValue(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">%</span>
                  </div>
                </div>
              )}

              {decrementMode === "fixed_amount" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Enter Decrement Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    max={currentGross - 1000}
                    required
                    value={fixedValue}
                    onChange={(e) => setFixedValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

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
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Reason for Decrement (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Reason for Decrement / Structure Revision (Mandatory) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compensation restructuring, role band change, contractual revision"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Additional Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Formally communicated to employee during one-on-one HR session"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-rose-500"
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
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Review Decrement Details</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Step */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                  <FiAlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Confirm Salary Decrement Authorization</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-300">
                  You are about to officially decrease the monthly gross salary of <strong>{record.employeeName}</strong> from <strong>{formatCurrency(currentGross)}</strong> to <strong className="text-rose-700 dark:text-rose-400">{formatCurrency(newGrossSalary)}</strong> (-{formatCurrency(decrementAmount)}).
                </p>
                <div className="text-[11px] text-slate-500 dark:text-gray-400 pt-1 border-t border-rose-200 dark:border-rose-800">
                  <span className="block"><strong>Effective Date:</strong> {effectiveFrom}</span>
                  <span className="block"><strong>Justification:</strong> {reason}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <FiShield className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Historical records will remain intact. A new salary revision entry, audit record, and notification will be generated.</span>
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
                  onClick={handleConfirmDecrement}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiTrendingDown className="w-4 h-4" />
                  <span>{loading ? "Applying Revision..." : "Confirm & Apply Decrement"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
