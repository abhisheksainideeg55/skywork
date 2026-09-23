import React, { useState } from "react";
import {
  FiX,
  FiPlusCircle,
  FiMinusCircle,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";

export default function BonusDeductionModal({ record, onClose, onSuccess = () => {} }) {
  const { addBonus, addDeduction, formatCurrency } = useSalary();

  const [category, setCategory] = useState("bonus"); // "bonus" | "deduction"
  const [type, setType] = useState("Performance Incentive");
  const [amount, setAmount] = useState(10000);
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!record) return null;

  const bonusTypes = [
    "Performance Incentive",
    "Festival Bonus",
    "Overtime Payout",
    "Special Project Bonus",
    "Retention Allowance",
    "Other Earnings",
  ];

  const deductionTypes = [
    "Loan Deduction",
    "Salary Advance Recovery",
    "Equipment Loss / Damage",
    "Loss of Pay (Retroactive)",
    "Statutory Adjustment",
    "Other Deduction",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (amount <= 0) {
      setErrorMsg("Amount must be greater than zero.");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Please provide a reason / justification.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (category === "bonus") {
        await addBonus(record.employeeId, {
          type,
          amount: Number(amount),
          effectiveDate,
          reason,
        });
      } else {
        await addDeduction(record.employeeId, {
          type,
          amount: Number(amount),
          effectiveDate,
          reason,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit adjustment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6 z-10 space-y-5">
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Add Bonus / Deduction</h3>
            <p className="text-xs text-slate-300">
              {record.employeeName} ({record.employeeId})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 space-y-4 pb-5">
          {/* Category Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setCategory("bonus");
                setType(bonusTypes[0]);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === "bonus"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-50 border border-slate-200 text-slate-700"
              }`}
            >
              <FiPlusCircle className="w-4 h-4" />
              <span>+ Add Bonus</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategory("deduction");
                setType(deductionTypes[0]);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === "deduction"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-50 border border-slate-200 text-slate-700"
              }`}
            >
              <FiMinusCircle className="w-4 h-4" />
              <span>- Add Deduction</span>
            </button>
          </div>

          {/* Adjustment Type Dropdown */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {category === "bonus" ? "Bonus / Earning Category" : "Deduction Category"}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
            >
              {(category === "bonus" ? bonusTypes : deductionTypes).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Effective Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Effective Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Q3 Deliverable Bonus, Advance deduction..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              required
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50 ${
                category === "bonus"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
              }`}
            >
              {isSubmitting
                ? "Saving..."
                : category === "bonus"
                ? "Save Bonus"
                : "Save Deduction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
