import React from "react";
import {
  FiFileText,
  FiEdit2,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiEye,
  FiDollarSign,
  FiCalendar,
  FiAlertTriangle,
  FiGift,
  FiMinusCircle,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";

export default function SalaryCardsView({
  salaries = [],
  onViewSalary,
  onEditSalary,
  onIncrementSalary,
  onDecrementSalary,
  onViewHistory,
  onGeneratePayslip,
  onAddBonus,
  onAddDeduction,
  onImposeFine,
}) {
  const { formatCurrency } = useSalary();
  const { hasPermission } = useAuth();

  const canView = hasPermission("salary.view");
  const canEdit = hasPermission("salary.edit");
  const canIncrement = hasPermission("salary.increment");
  const canDecrement = hasPermission("salary.decrement");
  const canFine = hasPermission("salary.fine");
  const canDeduction = hasPermission("salary.deduction");
  const canBonus = hasPermission("salary.bonus");
  const canHistory = hasPermission("salary.history") || canView;
  const canPayslip = hasPermission("salary-slip.generate");

  if (salaries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
      {salaries.map((s) => (
        <div
          key={s.employeeId}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 p-4 shadow-xs space-y-3"
        >
          {/* Header with Avatar & ID */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={s.avatar}
                alt={s.employeeName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/10 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {s.employeeName}
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                    {s.employeeId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {s.role} • {s.department}
                </p>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              s.status === "active"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
            }`}>
              {s.status || "Active"}
            </span>
          </div>

          {/* Salary Numbers */}
          {Number(s.baseSalary || 0) > 0 || s.isConfigured === true || s.status === 'active' ? (
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-gray-750 p-2.5 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Basic</span>
                <span className="text-xs font-bold text-slate-800 dark:text-gray-200 font-mono">
                  {formatCurrency(s.baseSalary)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Gross</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(s.grossSalary || s.currentSalary)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 block uppercase font-bold">Net Pay</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(s.netSalary)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl text-center border border-amber-200 dark:border-amber-800/40">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                Pending Configuration
              </span>
              <span className="text-[10px] text-amber-600/80 block mt-0.5">
                Salary structure not fixed by HR yet
              </span>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-gray-400">
            <span>Deductions: {Number(s.baseSalary || 0) > 0 ? `-${formatCurrency(s.totalDeductions)}` : "—"}</span>
            <span>Updated: {s.lastRevision || "—"}</span>
          </div>

          {/* Actions Toolbar */}
          <div className="pt-2 border-t border-slate-100 dark:border-gray-700 flex flex-wrap items-center gap-1.5">
            {Number(s.baseSalary || 0) === 0 && s.isConfigured !== true && s.status !== 'active' ? (
              <button
                type="button"
                onClick={() => onEditSalary(s)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
                <span>Fix / Set Salary Structure</span>
              </button>
            ) : (
              <>
                {canView && (
                  <button
                    type="button"
                    onClick={() => onViewSalary(s)}
                    className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs"
                  >
                    <FiEye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>
                )}

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEditSalary(s)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 font-semibold text-xs"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
