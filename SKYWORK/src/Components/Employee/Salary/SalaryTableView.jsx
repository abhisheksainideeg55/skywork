import React, { useState } from "react";
import {
  FiFileText,
  FiEdit2,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiEye,
  FiMoreVertical,
  FiPlusCircle,
  FiMinusCircle,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiCalendar,
  FiShield,
  FiGift,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";

export default function SalaryTableView({
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
  const { currentUser, hasPermission } = useAuth();
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Granular Permission Checks (HR & Superadmin always have full rights)
  const isHR = currentUser?.role === "superadmin" || currentUser?.role === "hr" || currentUser?.role === "Admin" || currentUser?.role === "HR";
  const canView = isHR || hasPermission("salary.view");
  const canEdit = isHR || hasPermission("salary.edit");
  const canIncrement = isHR || hasPermission("salary.increment");
  const canDecrement = isHR || hasPermission("salary.decrement");
  const canFine = isHR || hasPermission("salary.fine");
  const canDeduction = isHR || hasPermission("salary.deduction");
  const canBonus = isHR || hasPermission("salary.bonus");
  const canHistory = isHR || hasPermission("salary.history") || canView;
  const canPayslip = isHR || hasPermission("salary-slip.generate");

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending_setup":
      case "not_configured":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending HR Setup
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "revised":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Revised
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Scheduled
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case "on_hold":
      case "on hold":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300">
            {status || "Active"}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-xs overflow-hidden hidden md:block">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs text-slate-600 dark:text-gray-300 border-collapse min-w-[1100px]">
          <thead className="bg-slate-50/90 dark:bg-gray-750 text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3.5">Employee ID</th>
              <th className="px-4 py-3.5">Employee Name</th>
              <th className="px-4 py-3.5">Department</th>
              <th className="px-4 py-3.5">Designation</th>
              <th className="px-4 py-3.5">Basic Salary</th>
              <th className="px-4 py-3.5">Gross Salary</th>
              <th className="px-4 py-3.5">Total Deductions</th>
              <th className="px-4 py-3.5">Net Salary</th>
              <th className="px-4 py-3.5">Salary Status</th>
              <th className="px-4 py-3.5">Last Updated</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
            {salaries.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-16 text-center text-slate-400 dark:text-gray-500">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-100 dark:border-indigo-800">
                    <FiDollarSign className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">
                    No Employee Salaries Fixed Yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                    No salary records are saved in the database. When HR assigns and saves a salary structure for an employee, it will be listed here.
                  </p>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onEditSalary && onEditSalary(null)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                    >
                      <FiPlusCircle className="w-4 h-4" />
                      <span>+ Assign & Set Salary Now</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              salaries.map((s) => {
                const isMenuOpen = activeMenuId === s.employeeId;
                const isConfigured = Number(s.baseSalary || 0) > 0 || s.isConfigured === true || s.status === 'active';

                return (
                  <tr
                    key={s.employeeId}
                    className="hover:bg-slate-50/70 dark:hover:bg-gray-750/50 transition-colors group"
                  >
                    {/* 1. Employee ID */}
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-700 dark:text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-[11px]">
                        {s.employeeId}
                      </span>
                    </td>

                    {/* 2. Employee Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.employeeName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/10 shadow-2xs shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {s.employeeName}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-400">
                            Joined {s.joiningDate || "Jan 2024"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 3. Department */}
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-gray-300">
                      {s.department}
                    </td>

                    {/* 4. Designation */}
                    <td className="px-4 py-3.5 font-medium text-slate-600 dark:text-gray-400">
                      {s.role}
                    </td>

                    {/* 5. Basic Salary */}
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-800 dark:text-gray-200">
                      {isConfigured ? (
                        formatCurrency(s.baseSalary)
                      ) : (
                        <span className="text-slate-400 font-normal italic text-[11px]">Not Fixed</span>
                      )}
                    </td>

                    {/* 6. Gross Salary */}
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white font-mono">
                      {isConfigured ? (
                        formatCurrency(s.grossSalary || s.currentSalary)
                      ) : (
                        <span className="text-slate-400 font-normal italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* 7. Total Deductions */}
                    <td className="px-4 py-3.5 font-semibold text-rose-600 dark:text-rose-400 font-mono">
                      {isConfigured ? (
                        `-${formatCurrency(s.totalDeductions)}`
                      ) : (
                        <span className="text-slate-400 font-normal italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* 8. Net Salary */}
                    <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {isConfigured ? (
                        formatCurrency(s.netSalary)
                      ) : (
                        <span className="text-slate-400 font-normal italic text-[11px]">Not Set</span>
                      )}
                    </td>

                    {/* 9. Salary Status */}
                    <td className="px-4 py-3.5">{getStatusBadge(s.status)}</td>

                    {/* 10. Last Updated */}
                    <td className="px-4 py-3.5 text-slate-500 dark:text-gray-400 text-[11px]">
                      <span className="block font-medium text-slate-700 dark:text-gray-300">
                        {s.lastRevision || "—"}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500">
                        By {s.lastRevisedBy || "—"}
                      </span>
                    </td>

                    {/* 11. Actions */}
                    <td className="px-4 py-3.5 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        {!isConfigured ? (
                          <button
                            type="button"
                            onClick={() => onEditSalary(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            title="Fix / Set Employee Salary"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                            <span>Fix / Set Salary</span>
                          </button>
                        ) : (
                          <>
                            {/* View Salary */}
                            {canView && (
                              <button
                                type="button"
                                onClick={() => onViewSalary(s)}
                                className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                                title="View Full Salary Profile"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => onEditSalary(s)}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                              title="Edit Salary Structure"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* More Menu Dropdown Toggle */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId((prev) =>
                                prev === s.employeeId ? null : s.employeeId
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            title="More Actions"
                          >
                            <FiMoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-gray-700 py-1.5 z-30 text-left text-xs font-semibold animate-in fade-in zoom-in-95 duration-100">
                                {canView && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onViewSalary(s);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer text-left"
                                  >
                                    <FiEye className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>View Salary Profile</span>
                                  </button>
                                )}

                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onEditSalary(s);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer text-left"
                                  >
                                    <FiEdit2 className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Edit Salary Structure</span>
                                  </button>
                                )}

                                {canHistory && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onViewHistory(s);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer text-left"
                                  >
                                    <FiClock className="w-3.5 h-3.5 text-purple-500" />
                                    <span>Salary History</span>
                                  </button>
                                )}

                                {canPayslip && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onGeneratePayslip(s);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer text-left"
                                  >
                                    <FiFileText className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Generate Salary Slip</span>
                                  </button>
                                )}

                                <div className="border-t border-slate-100 dark:border-gray-700 my-1" />

                                {canBonus && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      if (onAddBonus) onAddBonus(s);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer text-left"
                                  >
                                    <FiGift className="w-3.5 h-3.5 text-sky-500" />
                                    <span>Add Bonus</span>
                                  </button>
                                )}

                                {canDeduction && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      if (onAddDeduction) onAddDeduction(s);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer text-left"
                                  >
                                    <FiMinusCircle className="w-3.5 h-3.5 text-orange-500" />
                                    <span>Add Deduction</span>
                                  </button>
                                )}

                                {canFine && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      if (onImposeFine) onImposeFine(s);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer text-left"
                                  >
                                    <FiAlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Add Fine / Penalty</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
