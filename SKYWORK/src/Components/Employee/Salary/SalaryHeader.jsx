import React from "react";
import {
  FiPlus,
  FiFileText,
  FiLock,
  FiShield,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiAlertTriangle,
  FiGift,
  FiMinusCircle,
  FiLayers,
} from "react-icons/fi";
import { useAuth } from "../../../Context/AuthContext";

export default function SalaryHeader({
  currentMonth = "September",
  currentYear = 2026,
  pendingFinesCount = 0,
  onOpenAddModal,
  onOpenPayrollSummary,
  onOpenPayrollLock,
  onOpenAuditLogs,
  onOpenManageFines,
  onOpenDeductions,
  onOpenBonuses,
  onOpenReports,
}) {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission("salary.create");
  const canFine = hasPermission("salary.fine");
  const canDeduction =
    hasPermission("salary.deduction") ||
    hasPermission("salary.advance") ||
    hasPermission("salary.loan");
  const canBonus =
    hasPermission("salary.bonus") || hasPermission("salary.overtime");
  const canPayroll =
    hasPermission("payroll.view") || hasPermission("payroll.process");
  const canLock = hasPermission("payroll.lock");
  const canReports = hasPermission("salary.report");
  const canAudit = hasPermission("audit.view");

  return (
    <div className="space-y-4">
      {/* 1. Dedicated Top Action Tabs Group */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-gray-700 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Fines & Penalties */}
          {canFine && (
            <button
              type="button"
              onClick={onOpenManageFines}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              title="Manage Employee Fines & Penalties"
            >
              <FiAlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Penalty Register</span>
              {pendingFinesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                  {pendingFinesCount}
                </span>
              )}
            </button>
          )}

          {/* Deductions & Advances */}
          {canDeduction && onOpenDeductions && (
            <button
              type="button"
              onClick={onOpenDeductions}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200/80 dark:border-orange-800/60 text-orange-700 dark:text-orange-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              title="Manage Statutory Deductions, Advances & Loans"
            >
              <FiMinusCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Deductions & Loans</span>
            </button>
          )}

          {/* Bonuses & Overtime */}
          {canBonus && onOpenBonuses && (
            <button
              type="button"
              onClick={onOpenBonuses}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              title="Manage Bonuses, Incentives & Overtime"
            >
              <FiGift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Bonus & Overtime</span>
            </button>
          )}

          {/* Run Payroll Summary */}
          {canPayroll && (
            <button
              type="button"
              onClick={onOpenPayrollSummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              title="Calculate Payroll Summary with Attendance, Leaves & Fines"
            >
              <FiLayers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Run Payroll</span>
            </button>
          )}

          {/* Payroll History & Lock */}
          {canLock && (
            <button
              type="button"
              onClick={onOpenPayrollLock}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-gray-750 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200/80 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              title="View Payroll History & Lock Payroll Period"
            >
              <FiLock className="w-4 h-4 text-slate-600 dark:text-gray-400" />
              <span>Payroll Lock</span>
            </button>
          )}

          {/* Salary Reports */}
          {canReports && onOpenReports && (
            <button
              type="button"
              onClick={onOpenReports}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              title="Salary & Payroll Reports & Analytics"
            >
              <FiFileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Salary Reports</span>
            </button>
          )}

          {/* Audit Logs */}
          {canAudit && (
            <button
              type="button"
              onClick={onOpenAuditLogs}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/80 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              title="View Security & Revision Audit Trail"
            >
              <FiShield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Audit Trail</span>
            </button>
          )}
        </div>

        {/* Create Salary Action Button */}
        {canCreate && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>+ Assign Salary</span>
          </button>
        )}
      </div>

      {/* 2. Main Salary Dashboard Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title & Period Info */}
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HR Administration • Salary Hub
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/10">
              <FiCalendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                Payroll Period: {currentMonth} {currentYear}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Salary & Payroll Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage employee compensation structures, process increments & decrements with audit trails, impose statutory fines, run monthly payroll cycles, and generate tax-compliant payslips.
          </p>
        </div>

        {/* Status Badge Info Chip */}
        <div className="hidden lg:flex items-center gap-3 z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-right space-y-1">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
              Active Pay Cycle
            </span>
            <span className="text-base font-extrabold text-white block">
              {currentMonth} {currentYear}
            </span>
            <span className="text-[11px] text-emerald-300 font-medium inline-flex items-center gap-1">
              <FiCheckCircle className="w-3 h-3" />
              Tax & PF Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
