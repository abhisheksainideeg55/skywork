import React, { useRef } from "react";
import {
  FiX,
  FiPrinter,
  FiDownload,
  FiCheckCircle,
  FiShield,
  FiCreditCard,
  FiCalendar,
  FiFileText,
  FiDollarSign,
} from "react-icons/fi";
import { useSalary, numberToWords } from "../../../Context/SalaryContext";

export default function PayslipModal({ record, onClose }) {
  const { formatCurrency, currentMonth, currentYear, fines, bonuses, deductions, advances, loans, overtime } = useSalary();
  const printRef = useRef(null);

  if (!record) return null;

  const monthStr = `${currentMonth} ${currentYear}`;
  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Calculate specific bonuses/fines/advances/loans for this payslip
  const empBonus = (bonuses || [])
    .filter((b) => b && b.employeeId === record.employeeId && b.status === "Approved")
    .reduce((acc, b) => acc + (b.amount || 0), 0);

  const empOT = (overtime || [])
    .filter((o) => o && o.employeeId === record.employeeId && o.status === "Approved")
    .reduce((acc, o) => acc + (o.otAmount || 0), 0);

  const empFines = (fines || [])
    .filter((f) => f && f.employeeId === record.employeeId && (f.status === "Approved" || f.status === "Applied"))
    .reduce((acc, f) => acc + (f.amount || 0), 0);

  const empAdvance = (advances || [])
    .filter((a) => a && a.employeeId === record.employeeId && a.status === "Active")
    .reduce((acc, a) => acc + (a.monthlyRecoveryAmount || 0), 0);

  const empLoan = (loans || [])
    .filter((l) => l && l.employeeId === record.employeeId && l.emiStatus === "Active")
    .reduce((acc, l) => acc + (l.emiAmount || 0), 0);

  const empCustomDed = (deductions || [])
    .filter((d) => d && d.employeeId === record.employeeId && d.status === "Active")
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  const totalEarnings = (record.grossSalary || record.currentSalary || 0) + empBonus + empOT;
  const totalAllDeductions = (record.totalDeductions || 0) + empFines + empAdvance + empLoan + empCustomDed;
  const netPayable = Math.max(0, totalEarnings - totalAllDeductions);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Standard trigger for print-to-PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-850 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-gray-700 max-h-[95vh] flex flex-col">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-lg">
              <FiFileText className="w-4 h-4" />
            </span>
            <span className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
              Official Payslip & Compensation Statement
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 text-slate-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div ref={printRef} className="p-8 overflow-y-auto flex-1 space-y-6 text-slate-800 dark:text-gray-200 bg-white dark:bg-gray-850">
          {/* Company Branding Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-indigo-600 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  SW
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  SKYWORK HRMS
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
                Skywork Cloud Technologies Pvt. Ltd. • Corporate Identification No: U72200DL2024PTC123456
              </p>
              <p className="text-[11px] text-slate-400">
                Tower B, 8th Floor, Tech Park Boulevard, Sector 62 • support@skywork.io
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200">
                Verified Salary Slip
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                Pay Period: {monthStr}
              </p>
              <p className="text-[10px] text-slate-400">
                Generated On: {todayStr}
              </p>
            </div>
          </div>

          {/* Employee Profile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{record.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{record.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
              <span className="font-medium text-slate-800 dark:text-gray-200">{record.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation</span>
              <span className="font-medium text-slate-800 dark:text-gray-200">{record.role}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name</span>
              <span className="font-medium text-slate-800 dark:text-gray-200">{record.bankName || "HDFC Bank"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Account No</span>
              <span className="font-mono text-slate-800 dark:text-gray-200">{record.accountNumber || "•••• 4892"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN / Tax ID</span>
              <span className="font-mono text-slate-800 dark:text-gray-200">{record.panNumber || "ABCDE1234F"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Joining Date</span>
              <span className="font-medium text-slate-800 dark:text-gray-200">{record.joiningDate || "12 Jan 2023"}</span>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Earnings Column */}
            <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-gray-750 px-4 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700 dark:text-gray-200 flex justify-between">
                <span>Earnings (Credits)</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Basic Salary</span>
                  <span className="font-mono">{formatCurrency(record.baseSalary)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono">{formatCurrency(record.hra)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>Conveyance Allowance</span>
                  <span className="font-mono">{formatCurrency(record.conveyance)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>Medical Allowance</span>
                  <span className="font-mono">{formatCurrency(record.medicalAllowance)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>Special Allowance</span>
                  <span className="font-mono">{formatCurrency(record.specialAllowance)}</span>
                </div>
                {record.otherAllowance > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-gray-300">
                    <span>Other Allowances</span>
                    <span className="font-mono">{formatCurrency(record.otherAllowance)}</span>
                  </div>
                )}
                {empBonus > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Bonus / Incentive Award</span>
                    <span className="font-mono">+{formatCurrency(empBonus)}</span>
                  </div>
                )}
                {empOT > 0 && (
                  <div className="flex justify-between font-semibold text-sky-600">
                    <span>Shift Overtime Payout</span>
                    <span className="font-mono">+{formatCurrency(empOT)}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-gray-800 px-4 py-2.5 border-t border-slate-200 dark:border-gray-700 font-bold flex justify-between text-slate-900 dark:text-white">
                <span>Total Gross Earnings</span>
                <span className="font-mono text-emerald-600">{formatCurrency(totalEarnings)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-gray-750 px-4 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700 dark:text-gray-200 flex justify-between">
                <span>Deductions (Debits)</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>Provident Fund (PF / EPF)</span>
                  <span className="font-mono">-{formatCurrency(record.pfDeduction)}</span>
                </div>
                {record.esiDeduction > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-gray-300">
                    <span>ESI Contribution</span>
                    <span className="font-mono">-{formatCurrency(record.esiDeduction)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>Professional Tax (PT)</span>
                  <span className="font-mono">-{formatCurrency(record.professionalTax || 200)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-300">
                  <span>TDS / Income Tax</span>
                  <span className="font-mono">-{formatCurrency(record.taxDeduction)}</span>
                </div>
                {empFines > 0 && (
                  <div className="flex justify-between font-semibold text-rose-600">
                    <span>Penalties / Fines Applied</span>
                    <span className="font-mono">-{formatCurrency(empFines)}</span>
                  </div>
                )}
                {empAdvance > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Advance Recovery Installment</span>
                    <span className="font-mono">-{formatCurrency(empAdvance)}</span>
                  </div>
                )}
                {empLoan > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Loan Monthly EMI</span>
                    <span className="font-mono">-{formatCurrency(empLoan)}</span>
                  </div>
                )}
                {record.otherDeduction > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-gray-300">
                    <span>Other Deductions</span>
                    <span className="font-mono">-{formatCurrency(record.otherDeduction)}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-gray-800 px-4 py-2.5 border-t border-slate-200 dark:border-gray-700 font-bold flex justify-between text-slate-900 dark:text-white">
                <span>Total Deductions</span>
                <span className="font-mono text-rose-600">-{formatCurrency(totalAllDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Take-Home Highlight Card */}
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
                Net Disbursed Take-Home Pay
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono text-indigo-900 dark:text-white mt-0.5">
                {formatCurrency(netPayable)}
              </p>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                Amount in Words: <em>{numberToWords(netPayable)}</em>
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <FiCheckCircle className="w-4 h-4" />
                Status: {record.paymentStatus || "Disbursed"}
              </span>
              <p className="mt-1">Disbursement Date: {record.disbursementDate || "01 Sep 2026"}</p>
            </div>
          </div>

          {/* Authorized Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="border-b border-slate-300 dark:border-gray-600 w-3/4 mx-auto mb-1"></div>
              <span className="font-bold text-slate-800 dark:text-white block">Employer / HR Authorization</span>
              <span className="text-[10px]">Digitally verified & authorized via Skywork HRMS</span>
            </div>
            <div>
              <div className="border-b border-slate-300 dark:border-gray-600 w-3/4 mx-auto mb-1"></div>
              <span className="font-bold text-slate-800 dark:text-white block">Employee Acknowledgment</span>
              <span className="text-[10px]">System generated electronic slip — no physical signature required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
