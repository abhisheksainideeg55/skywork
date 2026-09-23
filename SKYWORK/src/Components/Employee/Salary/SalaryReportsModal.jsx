import React, { useState, useMemo } from "react";
import {
  FiX,
  FiFileText,
  FiDownload,
  FiPrinter,
  FiFilter,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiAlertTriangle,
  FiGift,
  FiClock,
  FiLayers,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";

export default function SalaryReportsModal({ isOpen, onClose }) {
  const {
    salaries,
    salaryHistory,
    fines,
    bonuses,
    deductions,
    advances,
    loans,
    overtime,
    formatCurrency,
    currentMonth,
    currentYear,
  } = useSalary();

  const [reportType, setReportType] = useState("monthly_payroll");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  if (!isOpen) return null;

  const reportOptions = [
    { id: "monthly_payroll", label: "Monthly Payroll Master Report", icon: FiLayers },
    { id: "employee_salary", label: "Employee Salary Structure Report", icon: FiDollarSign },
    { id: "department_salary", label: "Department CTC & Headcount Report", icon: FiFileText },
    { id: "gross_net", label: "Gross vs Net Take-Home Report", icon: FiDollarSign },
    { id: "deductions", label: "Statutory & Custom Deductions Report", icon: FiDollarSign },
    { id: "fines", label: "Fines & Penalties Audit Report", icon: FiAlertTriangle },
    { id: "bonuses", label: "Bonus & Incentives Disbursement Report", icon: FiGift },
    { id: "overtime", label: "Overtime Hours & Payouts Report", icon: FiClock },
    { id: "increments", label: "Salary Increment & Appraisal Report", icon: FiTrendingUp },
    { id: "decrements", label: "Salary Decrements & Revisions Report", icon: FiTrendingDown },
    { id: "advances", label: "Salary Advances & Recovery Schedules", icon: FiCalendar },
    { id: "loans", label: "Employee Loan & EMI Status Report", icon: FiCalendar },
  ];

  const departments = Array.from(new Set((salaries || []).map((s) => s?.department).filter(Boolean)));

  // Filtered dataset generator based on active reportType
  const reportData = useMemo(() => {
    const filteredEmps = (salaries || []).filter(
      (s) => s && (selectedDept === "All Departments" || s.department === selectedDept)
    );

    switch (reportType) {
      case "increments":
        return (salaryHistory || []).filter((h) => h && h.type === "increment");
      case "decrements":
        return (salaryHistory || []).filter((h) => h && (h.type === "decrement" || h.type === "revision"));
      case "fines":
        return (fines || []).filter((f) => f && (selectedDept === "All Departments" || f.department === selectedDept));
      case "bonuses":
        return bonuses || [];
      case "overtime":
        return overtime || [];
      case "advances":
        return advances || [];
      case "loans":
        return loans || [];
      case "deductions":
        return deductions || [];
      case "department_salary": {
        const deptMap = {};
        filteredEmps.forEach((s) => {
          if (!deptMap[s.department]) {
            deptMap[s.department] = { count: 0, gross: 0, net: 0, deductions: 0 };
          }
          deptMap[s.department].count += 1;
          deptMap[s.department].gross += (s.grossSalary || s.currentSalary || 0);
          deptMap[s.department].net += (s.netSalary || 0);
          deptMap[s.department].deductions += (s.totalDeductions || 0);
        });
        return Object.entries(deptMap).map(([dept, vals]) => ({ department: dept, ...vals }));
      }
      case "monthly_payroll":
      case "employee_salary":
      case "gross_net":
      default:
        return filteredEmps;
    }
  }, [reportType, selectedDept, salaries, salaryHistory, fines, bonuses, overtime, advances, loans, deductions]);

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];

    if (reportType === "monthly_payroll" || reportType === "employee_salary" || reportType === "gross_net") {
      headers = ["Employee ID", "Name", "Department", "Designation", "Basic", "HRA", "Gross Salary", "Deductions", "Net Salary", "Status"];
      rows = reportData.map((s) => [
        s.employeeId,
        `"${s.employeeName}"`,
        `"${s.department}"`,
        `"${s.role}"`,
        s.baseSalary,
        s.hra,
        s.grossSalary,
        s.totalDeductions,
        s.netSalary,
        s.status,
      ]);
    } else if (reportType === "increments" || reportType === "decrements") {
      headers = ["ID", "Employee ID", "Date", "Type", "Previous Salary", "New Salary", "Difference", "Reason", "Authorized By"];
      rows = reportData.map((h) => [
        h.id,
        h.employeeId,
        h.date,
        h.type,
        h.previousSalary,
        h.newSalary,
        h.difference,
        `"${h.reason}"`,
        `"${h.changedBy}"`,
      ]);
    } else if (reportType === "fines") {
      headers = ["Fine No", "Employee ID", "Employee Name", "Category", "Amount", "Effective Month", "Status", "Reason", "Imposed By"];
      rows = reportData.map((f) => [
        f.fineNumber || f.id,
        f.employeeId,
        `"${f.employeeName || ""}"`,
        `"${f.categoryLabel || f.category}"`,
        f.amount,
        f.effectiveMonth,
        f.status,
        `"${f.reason}"`,
        `"${f.imposedBy}"`,
      ]);
    } else {
      headers = ["Record ID", "Employee ID", "Details"];
      rows = reportData.map((r) => [r.id, r.employeeId, JSON.stringify(r)]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Skywork_${reportType}_report_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200/80 dark:border-gray-700 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-850 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Salary & Compensation Analytics Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Generate statutory payroll statements, tax deduction ledgers, and appraisal audits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 text-slate-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-gray-750 border-b border-slate-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-gray-400 mb-1">
              Select Report Template
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {reportOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-gray-400 mb-1">
              Filter by Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-gray-400 mb-1">
              Reporting Month & Year
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-2 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs font-semibold"
              >
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-2 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs font-semibold"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Table View */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            {reportType === "department_salary" ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-750 font-bold text-slate-600 dark:text-gray-300 border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Department</th>
                    <th className="p-3">Headcount</th>
                    <th className="p-3">Total Monthly Gross</th>
                    <th className="p-3">Total Deductions</th>
                    <th className="p-3">Total Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {reportData.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{d.department}</td>
                      <td className="p-3 font-semibold">{d.count} Staff</td>
                      <td className="p-3 font-mono font-bold">{formatCurrency(d.gross)}</td>
                      <td className="p-3 font-mono text-rose-600 font-bold">-{formatCurrency(d.deductions)}</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">{formatCurrency(d.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : reportType === "increments" || reportType === "decrements" ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-750 font-bold text-slate-600 dark:text-gray-300 border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">Effective Date</th>
                    <th className="p-3">Previous Salary</th>
                    <th className="p-3">New Salary</th>
                    <th className="p-3">Adjustment</th>
                    <th className="p-3">Justification</th>
                    <th className="p-3">Authorized By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {reportData.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-mono">{h.id}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">{h.employeeId}</td>
                      <td className="p-3">{h.effectiveFrom || h.date}</td>
                      <td className="p-3 font-mono">{formatCurrency(h.previousSalary)}</td>
                      <td className="p-3 font-mono font-bold">{formatCurrency(h.newSalary)}</td>
                      <td className={`p-3 font-mono font-bold ${h.type === "increment" ? "text-emerald-600" : "text-rose-600"}`}>
                        {h.type === "increment" ? "+" : "-"}{formatCurrency(Math.abs(h.difference || h.adjustmentValue || 0))}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-gray-300">{h.reason}</td>
                      <td className="p-3 font-medium text-slate-500">{h.changedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : reportType === "fines" ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-750 font-bold text-slate-600 dark:text-gray-300 border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Fine No</th>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Incident Date</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {reportData.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-gray-300">{f.fineNumber || f.id}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{f.employeeName || f.employeeId}</td>
                      <td className="p-3">{f.categoryLabel || f.category}</td>
                      <td className="p-3 font-mono font-bold text-purple-600">-{formatCurrency(f.amount)}</td>
                      <td className="p-3 text-slate-500">{f.incidentDate}</td>
                      <td className="p-3 text-slate-600 dark:text-gray-300">{f.reason}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.status === "Approved" ? "bg-amber-50 text-amber-700" : f.status === "Waived" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Master Employee Salary / Payroll Report */
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-750 font-bold text-slate-600 dark:text-gray-300 border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Basic Salary</th>
                    <th className="p-3">Monthly Gross</th>
                    <th className="p-3">Deductions</th>
                    <th className="p-3 font-black text-emerald-600">Net Take-Home</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {reportData.map((s) => (
                    <tr key={s.employeeId} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-gray-300">{s.employeeId}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.employeeName}</td>
                      <td className="p-3">{s.department}</td>
                      <td className="p-3 font-mono">{formatCurrency(s.baseSalary)}</td>
                      <td className="p-3 font-mono font-bold">{formatCurrency(s.grossSalary || s.currentSalary)}</td>
                      <td className="p-3 font-mono font-semibold text-rose-600">-{formatCurrency(s.totalDeductions)}</td>
                      <td className="p-3 font-mono font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(s.netSalary)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 text-[10px] font-bold">
                          {s.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-gray-850 border-t border-slate-100 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 dark:text-gray-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
