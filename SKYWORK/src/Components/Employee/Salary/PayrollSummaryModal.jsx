import React, { useState } from "react";
import {
  FiX,
  FiLayers,
  FiCheckCircle,
  FiLock,
  FiDownload,
  FiAlertCircle,
  FiCalendar,
  FiTrendingUp,
  FiArrowRight,
  FiShield,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";

export default function PayrollSummaryModal({
  isOpen,
  onClose,
  onDisburseSuccess,
}) {
  const {
    getCalculatedPayrollSummary,
    formatCurrency,
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    approvePayroll,
    lockPayroll,
    disburseAll,
    payrollPeriods,
  } = useSalary();

  const { hasPermission } = useAuth();
  const canProcess = hasPermission("payroll.process");
  const canApprove = hasPermission("payroll.approve");
  const canLock = hasPermission("payroll.lock");

  // Workflow Step: 1 = Review & Calculation, 2 = Approval & Lock, 3 = Disbursement
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentPeriod = payrollPeriods.find(
    (p) => p.month === currentMonth && p.year === Number(currentYear)
  ) || {
    status: "Processing",
    isLocked: false,
  };

  const isPeriodLocked = currentPeriod.isLocked || currentPeriod.status === "Locked";

  // Get full dynamic calculation integrating attendance, leaves (LWP), overtime, bonuses, fines, deductions, advances, loans
  const summary = getCalculatedPayrollSummary(currentMonth, currentYear);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleApprove = async () => {
    setError("");
    setIsProcessing(true);
    try {
      await approvePayroll(currentMonth, currentYear);
      setActiveStep(2);
    } catch (err) {
      setError(err.message || "Failed to approve payroll.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLock = async () => {
    setError("");
    setIsProcessing(true);
    try {
      await lockPayroll(currentMonth, currentYear);
    } catch (err) {
      setError(err.message || "Failed to lock payroll.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisburse = () => {
    disburseAll(currentMonth, currentYear);
    if (onDisburseSuccess) onDisburseSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200/80 dark:border-gray-700 max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-850 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              <FiLayers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Monthly Payroll Workflow & Processing
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isPeriodLocked
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                    : currentPeriod.status === "Approved"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200"
                }`}>
                  {isPeriodLocked ? "Locked 🔒" : currentPeriod.status || "Processing"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Multi-stage payroll calculation with Attendance, Leaves, Overtime, Bonuses, and Fines integration.
              </p>
            </div>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-bold"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-bold"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow Steps Indicator */}
        <div className="px-6 py-3 bg-slate-100/70 dark:bg-gray-750 border-b border-slate-200/60 dark:border-gray-700 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
              Calculation & Review
            </span>
            <span className="text-slate-300">→</span>
            <span className={`flex items-center gap-1.5 ${currentPeriod.status === "Approved" || isPeriodLocked ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
              <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-gray-600 text-slate-700 dark:text-gray-200 flex items-center justify-center text-[10px]">2</span>
              Executive Approval
            </span>
            <span className="text-slate-300">→</span>
            <span className={`flex items-center gap-1.5 ${isPeriodLocked ? "text-rose-600 font-bold" : "text-slate-400"}`}>
              <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-gray-600 text-slate-700 dark:text-gray-200 flex items-center justify-center text-[10px]">3</span>
              Lock & Payslips
            </span>
          </div>

          {isPeriodLocked && (
            <span className="text-rose-600 text-xs font-bold flex items-center gap-1">
              <FiLock className="w-3.5 h-3.5" />
              Payroll Locked — Direct modifications disabled
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-slate-50 dark:bg-gray-750 p-3.5 rounded-2xl border border-slate-200 dark:border-gray-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Staff</span>
              <span className="text-base font-black text-slate-800 dark:text-white">{summary.totalEmployees}</span>
            </div>

            <div className="bg-slate-50 dark:bg-gray-750 p-3.5 rounded-2xl border border-slate-200 dark:border-gray-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Payroll</span>
              <span className="text-base font-black text-slate-800 dark:text-white font-mono">{formatCurrency(summary.totalGross)}</span>
            </div>

            <div className="bg-slate-50 dark:bg-gray-750 p-3.5 rounded-2xl border border-slate-200 dark:border-gray-700 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">Total Deductions</span>
              <span className="text-base font-black text-rose-600 font-mono">-{formatCurrency(summary.totalDeductions)}</span>
            </div>

            <div className="bg-slate-50 dark:bg-gray-750 p-3.5 rounded-2xl border border-slate-200 dark:border-gray-700 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Total Bonuses</span>
              <span className="text-base font-black text-amber-600 font-mono">+{formatCurrency(summary.totalBonuses)}</span>
            </div>

            <div className="bg-slate-50 dark:bg-gray-750 p-3.5 rounded-2xl border border-slate-200 dark:border-gray-700 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Total Fines</span>
              <span className="text-base font-black text-purple-600 font-mono">-{formatCurrency(summary.totalFines)}</span>
            </div>

            <div className="bg-slate-50 dark:bg-gray-750 p-3.5 rounded-2xl border border-slate-200 dark:border-gray-700 text-center">
              <span className="text-[10px] uppercase font-bold text-sky-600 block">Total Overtime</span>
              <span className="text-base font-black text-sky-600 font-mono">+{formatCurrency(summary.totalOvertime)}</span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Net Payable</span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatCurrency(summary.totalNet)}</span>
            </div>
          </div>

          {/* Employee Breakdown Table */}
          <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-3 bg-slate-50 dark:bg-gray-750 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between font-bold text-xs">
              <span>Employee Compensation & Attendance Adjustment Breakdown</span>
              <span className="text-slate-400 font-normal">{currentMonth} {currentYear}</span>
            </div>

            <div className="overflow-x-auto max-h-[320px]">
              <table className="w-full text-left text-xs min-w-[950px]">
                <thead className="bg-white dark:bg-gray-800 text-slate-500 font-bold border-b border-slate-200 dark:border-gray-700 sticky top-0">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Present / LWP</th>
                    <th className="p-3">Gross Base</th>
                    <th className="p-3">OT + Bonus</th>
                    <th className="p-3">Fines + LWP</th>
                    <th className="p-3">Advances & Loans</th>
                    <th className="p-3">Statutory Deductions</th>
                    <th className="p-3 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {summary.employeeBreakdowns.map((emp) => (
                    <tr key={emp.employeeId} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-semibold text-slate-800 dark:text-white">
                        {emp.employeeName} ({emp.employeeId})
                      </td>
                      <td className="p-3 text-slate-600 dark:text-gray-300">
                        {emp.presentDays} Days / <span className={emp.unpaidLeaves > 0 ? "text-rose-600 font-bold" : ""}>{emp.unpaidLeaves} LWP</span>
                      </td>
                      <td className="p-3 font-mono font-medium">{formatCurrency(emp.grossSalary)}</td>
                      <td className="p-3 font-mono text-emerald-600 font-medium">
                        +{formatCurrency(emp.overtimeAmount + emp.bonusAmount)}
                      </td>
                      <td className="p-3 font-mono text-rose-600 font-medium">
                        -{formatCurrency(emp.fineDeductions + emp.lwpDeduction)}
                      </td>
                      <td className="p-3 font-mono text-purple-600 font-medium">
                        -{formatCurrency(emp.advanceRecovery + emp.loanEmi)}
                      </td>
                      <td className="p-3 font-mono text-rose-600 font-medium">
                        -{formatCurrency(emp.totalDeductions)}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(emp.finalNet)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-gray-850 border-t border-slate-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 dark:text-gray-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {!isPeriodLocked && canApprove && currentPeriod.status !== "Approved" && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                <FiCheckCircle className="w-4 h-4" />
                <span>{isProcessing ? "Approving..." : "Approve Payroll Batch"}</span>
              </button>
            )}

            {!isPeriodLocked && canLock && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleLock}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                <FiLock className="w-4 h-4" />
                <span>{isProcessing ? "Locking..." : "Finalize & Lock Period"}</span>
              </button>
            )}

            {!isPeriodLocked && canProcess && (
              <button
                type="button"
                onClick={handleDisburse}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                <FiCheckCircle className="w-4 h-4" />
                <span>Disburse Company Payroll</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
