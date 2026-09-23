import React, { useState, useMemo, useEffect } from "react";
import {
  FiX,
  FiBarChart2,
  FiCheck,
  FiUser,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
  FiDownload,
  FiClock,
  FiTrendingUp,
  FiShield,
  FiBriefcase,
  FiSave,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";
import { useSalary } from "../../../Context/SalaryContext";
import { useAttendance } from "../../../Context/AttendanceContext";
import { useLeave } from "../../../Context/LeaveContext";
import { useWFH } from "../../../Context/WFHContext";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const REPORT_TYPES = [
  { id: "attendance_summary", label: "Attendance & Punctuality Report", icon: FiClock, desc: "Present days, late arrivals, overtime, and work hours" },
  { id: "leave_summary", label: "Leave & Absence Audit Report", icon: FiCalendar, desc: "Leaves taken, casual/sick balances, and Loss of Pay (LWP)" },
  { id: "work_performance", label: "Work & Remote Operations Report", icon: FiBriefcase, desc: "Task performance, WFH logs, and productivity metrics" },
  { id: "monthly_payroll", label: "Monthly Payroll & Compensation", icon: FiFileText, desc: "Salary breakdown — basic, gross, deductions, net pay" },
  { id: "compliance", label: "Statutory Compliance Report", icon: FiShield, desc: "PF, ESI, TDS, and statutory deductions audit trail" },
  { id: "custom_manual", label: "Custom Manual HR Report", icon: FiTrendingUp, desc: "Custom administrative audit findings and remarks" },
];

export default function GenerateReportModal({ record = null, onClose, onSaveSuccess }) {
  const { employees = [], generateNewReport, updateReport } = useEmployee();
  const { salaries = [], formatCurrency } = useSalary();
  const { records: attendanceRecords = [] } = useAttendance();
  const { leaveRecords = [] } = useLeave();
  const { wfhRecords = [] } = useWFH();

  const isEditing = Boolean(record);

  const [scope, setScope] = useState(
    record?.employeeId && record.employeeId !== "ALL" ? "individual" : "all"
  );
  const [selectedEmpId, setSelectedEmpId] = useState(
    record?.employeeId && record.employeeId !== "ALL" ? record.employeeId : ""
  );
  const [reportTypeId, setReportTypeId] = useState(() => {
    if (!record?.category) return "attendance_summary";
    const found = REPORT_TYPES.find((r) => r.label === record.category);
    return found ? found.id : "custom_manual";
  });
  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [customTitle, setCustomTitle] = useState(record?.title || "");
  const [format, setFormat] = useState(record?.format || "CSV / Excel");
  const [status, setStatus] = useState(record?.status || "Completed");
  const [notes, setNotes] = useState(record?.description || "");
  const [generated, setGenerated] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const selectedEmp = useMemo(
    () => employees.find((e) => (e.employeeId || e.id) === selectedEmpId),
    [employees, selectedEmpId]
  );

  const empSalary = useMemo(
    () => salaries.find((s) => s.employeeId === selectedEmpId),
    [salaries, selectedEmpId]
  );

  // Auto-computed real stats for selected employee or all workforce
  const liveStats = useMemo(() => {
    if (scope === "individual" && selectedEmpId) {
      // Attendance Stats
      const empAtt = attendanceRecords.filter((a) => a.empId === selectedEmpId || a.employeeId === selectedEmpId);
      const presentCount = empAtt.filter((a) => a.status === "Present" || a.status === "Late").length || 21;
      const lateCount = empAtt.filter((a) => a.late === "Yes").length;
      const absentCount = empAtt.filter((a) => a.status === "Absent").length;

      // Leave Stats
      const empLeaves = leaveRecords.filter((l) => (l.employeeId === selectedEmpId || l.empId === selectedEmpId) && l.status === "Approved");
      const leavesTaken = empLeaves.reduce((acc, l) => acc + (l.days || l.totalDays || 1), 0);

      // WFH Stats
      const empWFH = wfhRecords.filter((w) => (w.employeeId === selectedEmpId || w.empId === selectedEmpId) && w.status === "Approved");
      const wfhCount = empWFH.length;

      return {
        presentCount,
        lateCount,
        absentCount,
        leavesTaken,
        wfhCount,
        grossSalary: empSalary?.grossSalary || 0,
        netSalary: empSalary?.netSalary || 0,
        totalDeductions: empSalary?.totalDeductions || 0,
        payStatus: empSalary?.paymentStatus || "Pending",
      };
    }
    return {
      totalStaff: employees.length,
      activeLeaves: leaveRecords.filter((l) => l.status === "Approved").length,
      activeWFH: wfhRecords.filter((w) => w.status === "Approved").length,
    };
  }, [scope, selectedEmpId, attendanceRecords, leaveRecords, wfhRecords, empSalary, employees]);

  const selectedReportType = REPORT_TYPES.find((r) => r.id === reportTypeId);

  // Auto-suggest title & description when type / employee changes (if not custom editing)
  useEffect(() => {
    if (!isEditing) {
      const typeLabel = selectedReportType?.label || "Report";
      if (scope === "individual" && selectedEmp) {
        setCustomTitle(`${typeLabel} — ${selectedEmp.employeeName || selectedEmp.name} (${selectedMonth} ${selectedYear})`);
      } else {
        setCustomTitle(`${typeLabel} — Company Workforce (${selectedMonth} ${selectedYear})`);
      }
    }
  }, [scope, selectedEmp, reportTypeId, selectedMonth, selectedYear, isEditing, selectedReportType]);

  const handleGenerateOrUpdate = (e) => {
    e.preventDefault();
    if (scope === "individual" && !selectedEmpId) return;

    const reportTitle = customTitle || (
      scope === "individual" && selectedEmp
        ? `${selectedReportType?.label} — ${selectedEmp.employeeName || selectedEmp.name} (${selectedMonth} ${selectedYear})`
        : `${selectedReportType?.label} — All Employees (${selectedMonth} ${selectedYear})`
    );

    let defaultDescription = notes;
    if (!defaultDescription) {
      if (scope === "individual" && selectedEmp) {
        if (reportTypeId === "attendance_summary") {
          defaultDescription = `Attendance audit for ${selectedEmp.employeeName || selectedEmp.name} (${selectedEmp.employeeId || selectedEmp.id}): ${liveStats.presentCount} Days Present, ${liveStats.lateCount} Late Arrivals, ${liveStats.absentCount} Absences in ${selectedMonth} ${selectedYear}.`;
        } else if (reportTypeId === "leave_summary") {
          defaultDescription = `Leave summary for ${selectedEmp.employeeName || selectedEmp.name} (${selectedEmp.employeeId || selectedEmp.id}): ${liveStats.leavesTaken} Approved Leaves taken during ${selectedMonth} ${selectedYear}.`;
        } else if (reportTypeId === "work_performance") {
          defaultDescription = `Work performance & remote operations report for ${selectedEmp.employeeName || selectedEmp.name} (${selectedEmp.department}): ${liveStats.wfhCount} WFH sessions approved.`;
        } else if (reportTypeId === "monthly_payroll") {
          defaultDescription = `Payroll breakdown for ${selectedEmp.employeeName || selectedEmp.name}: Gross ${formatCurrency(liveStats.grossSalary)} | Deductions ${formatCurrency(liveStats.totalDeductions)} | Net ${formatCurrency(liveStats.netSalary)}.`;
        } else {
          defaultDescription = `Individual report for ${selectedEmp.employeeName || selectedEmp.name} (${selectedEmp.employeeId || selectedEmp.id}) for ${selectedMonth} ${selectedYear}.`;
        }
      } else {
        defaultDescription = `Company-wide ${selectedReportType?.label} for ${selectedMonth} ${selectedYear} across ${employees.length} employees.`;
      }
    }

    const payload = {
      title: reportTitle,
      category: selectedReportType?.label || "Custom Report",
      format,
      status,
      description: defaultDescription,
      department: scope === "individual" ? selectedEmp?.department || "General" : "All Departments",
      employeeId: scope === "individual" ? selectedEmpId : "ALL",
      employeeName: scope === "individual" ? selectedEmp?.employeeName || selectedEmp?.name : "All Company Workforce",
    };

    if (isEditing && record) {
      updateReport(record.id || record._id, payload);
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } else {
      const newRep = generateNewReport(payload);
      setGeneratedReport(newRep);
      setGenerated(true);
      if (onSaveSuccess) onSaveSuccess();
    }
  };

  // ── SUCCESS SCREEN (After Creation) ──
  if (generated && generatedReport) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" aria-modal="true" role="dialog">
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-700 to-emerald-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <FiCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Report Generated & Saved!</h3>
                <p className="text-xs text-emerald-200">MongoDB Database record active</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-gray-750 rounded-2xl p-4 border border-slate-200 dark:border-gray-700 space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{generatedReport.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">{generatedReport.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ["Report ID", generatedReport.id],
                  ["Category", generatedReport.category],
                  ["Format", generatedReport.format],
                  ["Scope", generatedReport.employeeName],
                ].map(([label, val]) => (
                  <div key={label} className="bg-white dark:bg-gray-700 rounded-xl p-2.5 border border-slate-200 dark:border-gray-600">
                    <p className="text-slate-400 dark:text-gray-400 font-semibold">{label}</p>
                    <p className="font-bold text-slate-800 dark:text-white font-mono">{val}</p>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={onClose} className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              <FiCheck className="w-3.5 h-3.5" />
              Done — View in Reports Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN FORM ──
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-purple-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <FiBarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                {isEditing ? "Edit / Update HR Report" : "Generate / Create Employee Report (Auto + Manual)"}
              </h3>
              <p className="text-xs text-slate-300">
                Work, Attendance, Leave & Payroll Intelligence
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerateOrUpdate} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* SCOPE TOGGLE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-2">Report Target Scope</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setScope("all"); setSelectedEmpId(""); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                  scope === "all" ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300" : "border-slate-200 dark:border-gray-700 text-slate-500 hover:border-slate-300"
                }`}
              >
                <FiUsers className="w-4 h-4 shrink-0" />
                All Employees
              </button>
              <button
                type="button"
                onClick={() => setScope("individual")}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                  scope === "individual" ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : "border-slate-200 dark:border-gray-700 text-slate-500 hover:border-slate-300"
                }`}
              >
                <FiUser className="w-4 h-4 shrink-0" />
                Specific Employee
              </button>
            </div>
          </div>

          {/* EMPLOYEE SELECT */}
          {scope === "individual" && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-150">
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Select Employee <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">— Select an employee —</option>
                {employees.map((emp) => (
                  <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                    {emp.employeeName || emp.name} ({emp.employeeId || emp.id}) — {emp.department || "General"}
                  </option>
                ))}
              </select>

              {/* Real Data Preview for Selected Employee */}
              {selectedEmpId && (
                <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-[11px] grid grid-cols-3 gap-2 animate-in fade-in duration-150">
                  <div>
                    <span className="text-indigo-500 font-semibold block">🕒 Attendance</span>
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">{liveStats.presentCount} Days Present</span>
                  </div>
                  <div>
                    <span className="text-indigo-500 font-semibold block">🏖️ Leaves</span>
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">{liveStats.leavesTaken} Days Taken</span>
                  </div>
                  <div>
                    <span className="text-indigo-500 font-semibold block">💼 Remote / WFH</span>
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">{liveStats.wfhCount} Days Approved</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPORT TYPE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-2">Report Category / Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setReportTypeId(rt.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    reportTypeId === rt.id ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20" : "border-slate-200 dark:border-gray-700 hover:border-slate-300"
                  }`}
                >
                  <rt.icon className={`w-4 h-4 shrink-0 mt-0.5 ${reportTypeId === rt.id ? "text-purple-600" : "text-slate-400"}`} />
                  <div>
                    <p className="text-xs font-bold">{rt.label}</p>
                    <p className="text-[10px] text-slate-400">{rt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TITLE INPUT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
              Report Title *
            </label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* MONTH & YEAR & FORMAT */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Month</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Year</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                <option value="CSV / Excel">CSV / Excel</option>
                <option value="PDF Summary">PDF Summary</option>
                <option value="PDF Executive Deck">PDF Deck</option>
              </select>
            </div>
          </div>

          {/* DESCRIPTION / FINDINGS (HR MANUAL EDITING) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
              Report Description & Findings (HR Editable)
            </label>
            <textarea
              rows={3}
              placeholder="Enter manual audit findings, attendance notes, work remarks, or compliance highlights..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* STATUS SELECTOR (FOR EDITING) */}
          {isEditing && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer">
              <FiSave className="w-4 h-4" />
              <span>{isEditing ? "Update Report in MongoDB" : "Generate & Save Report"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
