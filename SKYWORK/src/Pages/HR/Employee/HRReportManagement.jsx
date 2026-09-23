import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import ReportSummary from "../../../Components/Employee/Reports/ReportSummary";
import ReportCategoryCards from "../../../Components/Employee/Reports/ReportCategoryCards";
import ReportAnalyticsCards from "../../../Components/Employee/Reports/ReportAnalyticsCards";
import GeneratedReportsTable from "../../../Components/Employee/Reports/GeneratedReportsTable";
import GenerateReportModal from "../../../Components/Employee/Reports/GenerateReportModal";
import { useEmployee } from "../../../Context/EmployeeContext";
import { useSalary } from "../../../Context/SalaryContext";
import { useAttendance } from "../../../Context/AttendanceContext";
import { useLeave } from "../../../Context/LeaveContext";
import { useWFH } from "../../../Context/WFHContext";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiLoader,
  FiClock,
  FiCalendar,
  FiBriefcase,
  FiDollarSign,
  FiPlusCircle,
} from "react-icons/fi";

export default function HRReportManagement() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allGenToast, setAllGenToast] = useState("");

  const { employees = [], generateNewReport } = useEmployee();
  const { salaries = [], currentMonth, currentYear, formatCurrency } = useSalary();
  const { records: attendanceRecords = [] } = useAttendance();
  const { leaveRecords = [] } = useLeave();
  const { wfhRecords = [] } = useWFH();

  const showToast = (msg) => {
    setAllGenToast(msg);
    setTimeout(() => setAllGenToast(""), 5000);
  };

  // 1. Auto-generate Attendance Report for all employees
  const handleGenerateAllAttendance = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    await new Promise((res) => setTimeout(res, 400));

    let count = 0;
    employees.forEach((emp) => {
      const empId = emp.employeeId || emp.id;
      const empAtt = attendanceRecords.filter((a) => a.empId === empId || a.employeeId === empId);
      const presentDays = empAtt.filter((a) => a.status === "Present" || a.status === "Late").length || 21;
      const lateDays = empAtt.filter((a) => a.late === "Yes").length;
      const absentDays = empAtt.filter((a) => a.status === "Absent").length;

      generateNewReport({
        title: `Attendance & Punctuality Audit — ${emp.employeeName || emp.name} (${currentMonth} ${currentYear})`,
        category: "Attendance & Punctuality Report",
        format: "CSV / Excel",
        description: `Auto-generated monthly attendance metrics for ${emp.employeeName || emp.name}: ${presentDays} Days Present, ${lateDays} Late arrivals, ${absentDays} Absences in ${currentMonth} ${currentYear}.`,
        department: emp.department || "General",
        employeeId: empId,
        employeeName: emp.employeeName || emp.name,
      });
      count++;
    });

    setIsGenerating(false);
    showToast(`✅ ${count} Attendance reports auto-generated & saved to MongoDB!`);
  };

  // 2. Auto-generate Leave Report for all employees
  const handleGenerateAllLeaves = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    await new Promise((res) => setTimeout(res, 400));

    let count = 0;
    employees.forEach((emp) => {
      const empId = emp.employeeId || emp.id;
      const empLeaves = leaveRecords.filter((l) => (l.employeeId === empId || l.empId === empId) && l.status === "Approved");
      const leavesTaken = empLeaves.reduce((acc, l) => acc + (l.days || l.totalDays || 1), 0);

      generateNewReport({
        title: `Leave & Absence Ledger — ${emp.employeeName || emp.name} (${currentMonth} ${currentYear})`,
        category: "Leave & Absence Audit Report",
        format: "CSV / Excel",
        description: `Auto-generated leave audit for ${emp.employeeName || emp.name}: ${leavesTaken} Approved leaves sanctioned during ${currentMonth} ${currentYear}.`,
        department: emp.department || "General",
        employeeId: empId,
        employeeName: emp.employeeName || emp.name,
      });
      count++;
    });

    setIsGenerating(false);
    showToast(`✅ ${count} Leave & Absence reports auto-generated & saved to MongoDB!`);
  };

  // 3. Auto-generate Work & Remote Operations Report for all employees
  const handleGenerateAllWork = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    await new Promise((res) => setTimeout(res, 400));

    let count = 0;
    employees.forEach((emp) => {
      const empId = emp.employeeId || emp.id;
      const empWFH = wfhRecords.filter((w) => (w.employeeId === empId || w.empId === empId) && w.status === "Approved");
      const wfhCount = empWFH.length;

      generateNewReport({
        title: `Work & Remote Operations Report — ${emp.employeeName || emp.name} (${currentMonth} ${currentYear})`,
        category: "Work & Remote Operations Report",
        format: "CSV / Excel",
        description: `Auto-generated work & productivity report for ${emp.employeeName || emp.name} (${emp.department}): ${wfhCount} Remote WFH sessions approved and logged.`,
        department: emp.department || "General",
        employeeId: empId,
        employeeName: emp.employeeName || emp.name,
      });
      count++;
    });

    setIsGenerating(false);
    showToast(`✅ ${count} Work & Remote operations reports auto-generated & saved to MongoDB!`);
  };

  // 4. Auto-generate Payroll Report for all employees
  const handleGenerateAllPayroll = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    await new Promise((res) => setTimeout(res, 400));

    let count = 0;
    employees.forEach((emp) => {
      const empId = emp.employeeId || emp.id;
      const empSalary = salaries.find((s) => s.employeeId === empId);
      const gross = empSalary?.grossSalary || empSalary?.currentSalary || 0;
      const net = empSalary?.netSalary || 0;
      const deductions = empSalary?.totalDeductions || 0;
      const payStatus = empSalary?.paymentStatus || "Pending";

      generateNewReport({
        title: `Monthly Payroll Report — ${emp.employeeName || emp.name} (${currentMonth} ${currentYear})`,
        category: "Monthly Payroll Report",
        format: "CSV / Excel",
        description: `Auto-generated monthly payroll statement for ${emp.employeeName || emp.name} (${empId}), ${emp.department}. Gross: ${formatCurrency(gross)} | Deductions: ${formatCurrency(deductions)} | Net Pay: ${formatCurrency(net)} | Status: ${payStatus}`,
        department: emp.department || "General",
        employeeId: empId,
        employeeName: emp.employeeName || emp.name,
      });
      count++;
    });

    setIsGenerating(false);
    showToast(`✅ ${count} Payroll compensation reports auto-generated & saved to MongoDB!`);
  };

  return (
    <div className="space-y-6">
      {/* Employee Management Navigation Tabs */}
      <EmployeeLayoutTabs activeTab="reports" />

      {/* Toast notification */}
      {allGenToast && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{allGenToast}</span>
        </div>
      )}

      {/* Report Summary KPIs */}
      <ReportSummary onOpenGenerate={() => setIsGenerateOpen(true)} />

      {/* ── AUTO-GENERATE & MANUAL CREATION CONTROL BANNER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ⚡ 1-Click Multi-Module Analytics
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-1">
              Auto-Generate Employee Reports & Manual Audit Hub
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              Work, Attendance, Leave aur Payroll ka data automatic compile karein ya kisi bhi employee ke liye custom manual report create / edit karein.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer"
          >
            <FiPlusCircle className="w-4 h-4" />
            <span>+ Create / Edit Manual Report</span>
          </button>
        </div>

        {/* 4 Quick Auto-Generate Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* 1. Attendance */}
          <button
            type="button"
            onClick={handleGenerateAllAttendance}
            disabled={isGenerating}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/30 text-indigo-300 group-hover:scale-105 transition-transform">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Auto Attendance Report</p>
              <p className="text-[10px] text-slate-300">Punches, Late, Absences</p>
            </div>
          </button>

          {/* 2. Leave */}
          <button
            type="button"
            onClick={handleGenerateAllLeaves}
            disabled={isGenerating}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/30 text-emerald-300 group-hover:scale-105 transition-transform">
              <FiCalendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Auto Leave Ledger</p>
              <p className="text-[10px] text-slate-300">Quotas, LWP & Approvals</p>
            </div>
          </button>

          {/* 3. Work & Remote */}
          <button
            type="button"
            onClick={handleGenerateAllWork}
            disabled={isGenerating}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/30 text-amber-300 group-hover:scale-105 transition-transform">
              <FiBriefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Auto Work & WFH Report</p>
              <p className="text-[10px] text-slate-300">Tasks, Remote Operations</p>
            </div>
          </button>

          {/* 4. Payroll */}
          <button
            type="button"
            onClick={handleGenerateAllPayroll}
            disabled={isGenerating}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/30 text-purple-300 group-hover:scale-105 transition-transform">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Auto Payroll Summary</p>
              <p className="text-[10px] text-slate-300">Gross, Deductions, Net</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Report Generation Cards */}
      <ReportCategoryCards />

      {/* Visual Analytics Breakdown */}
      <ReportAnalyticsCards />

      {/* Generated Reports Table with CSV Download & Edit/Delete Actions */}
      <GeneratedReportsTable onOpenGenerate={() => setIsGenerateOpen(true)} />

      {/* Generate / Edit Custom Report Modal */}
      {isGenerateOpen && (
        <GenerateReportModal onClose={() => setIsGenerateOpen(false)} />
      )}
    </div>
  );
}
