import React from "react";
import {
  FiX,
  FiUser,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
  FiClock,
  FiCreditCard,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiCalendar,
  FiBriefcase,
  FiLayers,
  FiMinusCircle,
} from "react-icons/fi";
import { useSalary, numberToWords } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";

export default function ViewSalaryModal({
  record,
  onClose,
  onOpenIncrement,
  onOpenDecrement,
  onOpenHistory,
  onOpenPayslip,
  onImposeFine,
}) {
  const { formatCurrency, fines = [], bonuses = [], deductions = [], advances = [], loans = [] } = useSalary();
  const { hasPermission } = useAuth();

  if (!record) return null;

  const canIncrement = hasPermission("salary.increment");
  const canDecrement = hasPermission("salary.decrement");
  const canFine = hasPermission("salary.fine");
  const canPayslip = hasPermission("salary-slip.generate");

  // Get active fines, bonuses, and custom deductions for this employee
  const empFines = (fines || []).filter((f) => f && f.employeeId === record.employeeId && (f.status === "Approved" || f.status === "Applied"));
  const totalFineAmount = empFines.reduce((acc, f) => acc + (f.amount || 0), 0);

  const empBonuses = (bonuses || []).filter((b) => b && b.employeeId === record.employeeId && b.status === "Approved");
  const totalBonusAmount = empBonuses.reduce((acc, b) => acc + (b.amount || 0), 0);

  const empAdvances = (advances || []).filter((a) => a && a.employeeId === record.employeeId && a.status === "Active");
  const totalAdvanceRecovery = empAdvances.reduce((acc, a) => acc + (a.monthlyRecoveryAmount || 0), 0);

  const empLoans = (loans || []).filter((l) => l && l.employeeId === record.employeeId && l.emiStatus === "Active");
  const totalLoanEmi = empLoans.reduce((acc, l) => acc + (l.emiAmount || 0), 0);

  const earningsList = [
    { label: "Basic Salary", value: record.baseSalary || 0, isBase: true },
    { label: "House Rent Allowance (HRA)", value: record.hra || 0 },
    { label: "Conveyance Allowance", value: record.conveyance || 0 },
    { label: "Medical Allowance", value: record.medicalAllowance || 0 },
    { label: "Special Allowance", value: record.specialAllowance || 0 },
    { label: "Other Allowances", value: record.otherAllowance || 0 },
  ];

  if (totalBonusAmount > 0) {
    earningsList.push({ label: "Approved Bonus / Incentive", value: totalBonusAmount, highlight: true });
  }

  const deductionsList = [
    { label: "Provident Fund (PF / EPF)", value: record.pfDeduction || 0 },
    { label: "Employee State Insurance (ESI)", value: record.esiDeduction || 0 },
    { label: "Professional Tax (PT)", value: record.professionalTax || 200 },
    { label: "Tax Deducted at Source (TDS)", value: record.taxDeduction || 0 },
    { label: "Loss of Pay (LWP / Unpaid Leave)", value: record.lossOfPayDeduction || 0 },
    { label: "Fine / Penalties", value: totalFineAmount, isFine: totalFineAmount > 0 },
    { label: "Salary Advance Recovery", value: totalAdvanceRecovery || record.advanceDeduction || 0 },
    { label: "Loan / EMI Recovery", value: totalLoanEmi || record.loanDeduction || 0 },
    { label: "Other Deductions", value: record.otherDeduction || 0 },
  ];

  const totalEarnings = (record.grossSalary || record.currentSalary || 0) + totalBonusAmount;
  const totalAllDeductions = (record.totalDeductions || 0) + totalFineAmount + totalAdvanceRecovery + totalLoanEmi;
  const netTakeHome = Math.max(0, totalEarnings - totalAllDeductions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200/80 dark:border-gray-700 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-850 shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={record.avatar}
              alt={record.employeeName}
              className="w-12 h-12 rounded-2xl object-cover ring-4 ring-indigo-500/10 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {record.employeeName}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {record.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                {record.role} • {record.department}
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

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* 1. Employee Profile Information Grid */}
          <div className="bg-slate-50/80 dark:bg-gray-750 p-4 rounded-2xl border border-slate-200/60 dark:border-gray-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 block mb-3">
              Employee Information
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 dark:text-gray-400 text-[11px] block">Employee ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{record.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-gray-400 text-[11px] block">Full Name</span>
                <span className="font-bold text-slate-800 dark:text-white">{record.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-gray-400 text-[11px] block">Department</span>
                <span className="font-medium text-slate-800 dark:text-gray-200">{record.department}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-gray-400 text-[11px] block">Designation</span>
                <span className="font-medium text-slate-800 dark:text-gray-200">{record.role}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-gray-400 text-[11px] block">Joining Date</span>
                <span className="font-medium text-slate-800 dark:text-gray-200">{record.joiningDate || "12 Jan 2023"}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-gray-400 text-[11px] block">Employment Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  {record.status === "active" ? "Active Full-time" : record.status}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Earnings & Deductions Breakdown Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Earnings Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 pb-2.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <FiDollarSign className="w-4 h-4 text-emerald-600" />
                  Salary Information (Earnings)
                </span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Credit
                </span>
              </div>

              <div className="space-y-2">
                {earningsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span className={`text-slate-600 dark:text-gray-300 ${item.isBase ? "font-bold text-slate-800 dark:text-white" : ""}`}>
                      {item.label}
                    </span>
                    <span className={`font-mono font-bold ${item.isBase ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-gray-200"}`}>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total Gross Salary</span>
                <span className="text-emerald-600 font-mono">{formatCurrency(totalEarnings)}</span>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 pb-2.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <FiMinusCircle className="w-4 h-4 text-rose-600" />
                  Monthly Deductions
                </span>
                <span className="text-[11px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                  Debit
                </span>
              </div>

              <div className="space-y-2">
                {deductionsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-600 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className={`font-mono font-bold ${item.value > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`}>
                      {item.value > 0 ? `-${formatCurrency(item.value)}` : "₹0"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total Deductions</span>
                <span className="text-rose-600 font-mono">-{formatCurrency(totalAllDeductions)}</span>
              </div>
            </div>
          </div>

          {/* 3. Final Summary Calculation Banner */}
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:text-left">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Gross Salary</span>
                <span className="text-lg sm:text-xl font-bold font-mono">{formatCurrency(record.grossSalary)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Total Earnings</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">{formatCurrency(totalEarnings)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Total Deductions</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-rose-400">-{formatCurrency(totalAllDeductions)}</span>
              </div>
              <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 text-center">
                <span className="text-[11px] text-emerald-300 font-bold block uppercase">Net Take-Home Salary</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-300">{formatCurrency(netTakeHome)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center border-t border-slate-800 pt-2 font-mono">
              In Words: <strong className="text-slate-200">{numberToWords(netTakeHome)}</strong>
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-gray-850 border-t border-slate-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 dark:text-gray-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {canIncrement && onOpenIncrement && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenIncrement(record);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FiTrendingUp className="w-3.5 h-3.5" />
                <span>Add Increment</span>
              </button>
            )}

            {canDecrement && onOpenDecrement && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDecrement(record);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FiTrendingDown className="w-3.5 h-3.5" />
                <span>Add Decrement</span>
              </button>
            )}

            {onOpenHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory(record);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FiClock className="w-3.5 h-3.5" />
                <span>Salary History</span>
              </button>
            )}

            {canPayslip && onOpenPayslip && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPayslip(record);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FiFileText className="w-3.5 h-3.5" />
                <span>View Salary Slip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
