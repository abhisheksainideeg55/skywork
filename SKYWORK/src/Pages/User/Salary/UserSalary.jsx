import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import {
  FiDollarSign,
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiCreditCard,
  FiShield,
  FiCalendar,
  FiClock,
  FiPlus,
  FiAlertCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";
import PayslipModal from "../../../Components/Employee/Salary/PayslipModal";
import LogOvertimeModal from "../../../Components/Employee/Salary/LogOvertimeModal";

export default function UserSalary() {
  const { salaries, overtime, formatCurrency, currentMonth, currentYear } = useSalary();
  const { currentUser, hasPermission } = useAuth();
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Authorization check
  const canView = hasPermission("salary.view");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const currentEmpId = currentUser?.employeeId || currentUser?.id || "";

  // Get current logged-in employee's own salary record
  const mySalary =
    salaries.find(
      (s) =>
        s.employeeId === currentEmpId ||
        s.employeeId?.toLowerCase() === currentEmpId.toLowerCase() ||
        s.employeeName?.toLowerCase() === currentUser?.name?.toLowerCase()
    ) || {
      employeeId: currentEmpId,
      employeeName: currentUser?.name || "Employee",
      isConfigured: false,
      baseSalary: 0,
      hra: 0,
      specialAllowance: 0,
      grossSalary: 0,
      totalDeductions: 0,
      netSalary: 0,
      annualCTC: 0,
    };

  // Filter overtime logs for this employee
  const myOvertimes = overtime.filter(
    (o) =>
      o.employeeId === currentEmpId ||
      o.employeeId?.toLowerCase() === currentEmpId.toLowerCase() ||
      o.employeeName?.toLowerCase() === currentUser?.name?.toLowerCase()
  );

  const approvedOtTotal = myOvertimes
    .filter((o) => o.status === "Approved")
    .reduce((sum, o) => sum + (o.totalAmount || o.otAmount || 0), 0);

  const pendingOtHours = myOvertimes
    .filter((o) => o.status === "Pending")
    .reduce((sum, o) => sum + (o.overtimeHours || 0), 0);

  if (!canView) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 text-center space-y-3">
          <FiShield className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Salary Information Restricted
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto">
            You do not have permission to view salary records. Please contact HR or your administrator to grant access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <FiCheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage("")}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Pay Period • {currentMonth} {currentYear}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold">My Compensation & Overtime Portal</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            View your monthly salary breakdown, track approved overtime earnings, and log extra work hours for HR verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <button
            type="button"
            onClick={() => setShowOvertimeModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Log Extra Time / OT</span>
          </button>

          {mySalary.isConfigured !== false && mySalary.baseSalary > 0 && (
            <button
              type="button"
              onClick={() => setSelectedPayslip(mySalary)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <FiFileText className="w-4 h-4" />
              <span>View Payslip</span>
            </button>
          )}
        </div>
      </div>

      {/* Unconfigured Alert Banner */}
      {(!mySalary.isConfigured || mySalary.baseSalary === 0) && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
            <FiAlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
              Salary Structure Pending HR Setup
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5">
              The HR department has not fixed your baseline compensation breakdown yet. You can still log your overtime hours below, and once HR finalizes your salary, the full payslip will be generated.
            </p>
          </div>
        </div>
      )}

      {/* Salary Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 block mb-1">
            Net Take-Home Pay
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(mySalary?.netSalary)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 block">
            {mySalary.isConfigured ? `Disbursed via ${mySalary?.bankName || "Bank"}` : "Pending HR Configuration"}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 block mb-1">
            Monthly Base Salary
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {formatCurrency(mySalary?.baseSalary)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 block">
            Fixed by HR
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 block mb-1">
            Earned Overtime Pay
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {formatCurrency(approvedOtTotal)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 block">
            {pendingOtHours > 0 ? `${pendingOtHours} hrs pending approval` : "All hours processed"}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 block mb-1">
            Total Deductions
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
            -{formatCurrency(mySalary?.totalDeductions)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 block">
            PF, ESI & Professional Tax
          </span>
        </div>
      </div>

      {/* Employee Overtime History Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200/80 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiClock className="w-5 h-5 text-indigo-600" />
              <span>My Extra Time / Overtime Records</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              All overtime requests submitted to database with live HR approval status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOvertimeModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Overtime</span>
          </button>
        </div>

        {myOvertimes.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">
              No extra hours or overtime logged yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Worked extra hours on a project? Click <strong>"Log Extra Time / OT"</strong> above to submit hours.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-gray-750 text-slate-500 dark:text-gray-400 font-bold border-b border-slate-200 dark:border-gray-700">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Project / Task</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">OT Hours</th>
                  <th className="p-3.5">Rate</th>
                  <th className="p-3.5">Calculated Amount</th>
                  <th className="p-3.5">HR Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                {myOvertimes.map((ot) => (
                  <tr key={ot.overtimeId || ot._id || ot.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-white">
                      {ot.date}
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 dark:text-gray-300">
                      {ot.project || "General"}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-gray-400 max-w-xs truncate">
                      {ot.reason || "—"}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {ot.overtimeHours} hrs
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      ₹{ot.hourlyRate || ot.otRate || 500}/hr
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">
                      +{formatCurrency(ot.totalAmount || ot.otAmount || ot.overtimeHours * (ot.hourlyRate || 500))}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          ot.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : ot.status === "Rejected"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {ot.status === "Approved" && "✓ Approved"}
                        {ot.status === "Rejected" && "✕ Rejected"}
                        {ot.status === "Pending" && "⏳ Pending HR"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Structure Breakdown Details (If Configured) */}
      {mySalary.isConfigured && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200/80 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <FiDollarSign className="w-4 h-4 text-emerald-600" />
                Earnings Breakdown
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                Monthly Credit
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 font-bold text-slate-900 dark:text-white">
                <span>Basic Pay</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{formatCurrency(mySalary?.baseSalary)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-gray-300">
                <span>House Rent Allowance (HRA)</span>
                <span className="font-mono">{formatCurrency(mySalary?.hra)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-gray-300">
                <span>Conveyance Allowance</span>
                <span className="font-mono">{formatCurrency(mySalary?.conveyance)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-gray-300">
                <span>Medical Allowance</span>
                <span className="font-mono">{formatCurrency(mySalary?.medicalAllowance)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-gray-300">
                <span>Special Allowance</span>
                <span className="font-mono">{formatCurrency(mySalary?.specialAllowance)}</span>
              </div>
              {approvedOtTotal > 0 && (
                <div className="flex justify-between py-1 text-emerald-600 font-bold">
                  <span>Approved Overtime Pay</span>
                  <span className="font-mono">+{formatCurrency(approvedOtTotal)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-gray-700 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span>Monthly Gross Salary</span>
              <span className="font-mono text-emerald-600">
                {formatCurrency((mySalary?.grossSalary || 0) + approvedOtTotal)}
              </span>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200/80 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <FiCreditCard className="w-4 h-4 text-rose-600" />
                Deductions Breakdown
              </h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">
                Statutory Debit
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 text-slate-600 dark:text-gray-300">
                <span>Provident Fund (EPF - 12%)</span>
                <span className="font-mono text-rose-600">-{formatCurrency(mySalary?.pfDeduction)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-gray-300">
                <span>Professional Tax (PT)</span>
                <span className="font-mono text-rose-600">-{formatCurrency(mySalary?.professionalTax || 200)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-gray-300">
                <span>Tax Deducted at Source (TDS)</span>
                <span className="font-mono text-rose-600">-{formatCurrency(mySalary?.taxDeduction)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-gray-700 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span>Total Deductions</span>
              <span className="font-mono text-rose-600">-{formatCurrency(mySalary?.totalDeductions)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {selectedPayslip && (
        <PayslipModal
          record={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}

      {/* Log Overtime Modal */}
      {showOvertimeModal && (
        <LogOvertimeModal
          isOpen={showOvertimeModal}
          onClose={() => setShowOvertimeModal(false)}
          onSuccess={showToast}
        />
      )}
    </div>
  );
}
