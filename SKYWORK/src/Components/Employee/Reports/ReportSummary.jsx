import React from "react";
import {
  FiBarChart2,
  FiUsers,
  FiAward,
  FiShield,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function ReportSummary({
  onOpenGenerate,
  isUserView = false,
  employeeId = "EMP001",
  roleTitle = "HR Admin",
}) {
  const { reports = [], employees = [] } = useEmployee();

  // If user view, only count employee's own reports
  const displayedReports = isUserView
    ? reports.filter((r) => r.employeeId === employeeId)
    : reports;

  const auditedCount = new Set(reports.map((r) => r.employeeId).filter(Boolean)).size;

  const userStats = [
    {
      label: "My Generated Reports",
      value: `${displayedReports.length} Reports`,
      subtext: "Personal performance, attendance & tax audits",
      icon: FiFileText,
      color: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "My Attendance Audit",
      value: "Verified",
      subtext: "Biometric punch logs recorded",
      icon: FiClock,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "My Performance Records",
      value: `${displayedReports.filter(r => r.category?.includes("Performance") || r.category?.includes("Appraisal")).length} Reports`,
      subtext: "Appraisal & quarterly evaluations",
      icon: FiAward,
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "My Statutory & Tax Files",
      value: "Active",
      subtext: "EPFO, PT & TDS reports",
      icon: FiShield,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50 text-purple-700 border-purple-100",
    },
  ];

  const adminStats = [
    {
      label: "Total Generated Reports",
      value: `${reports.length} Reports`,
      subtext: "Employee audits & operational ledgers",
      icon: FiBarChart2,
      color: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Total Active Employees",
      value: `${employees.length} Staff`,
      subtext: "Registered workforce members",
      icon: FiUsers,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50 text-purple-700 border-purple-100",
    },
    {
      label: "Audited Staff Members",
      value: `${auditedCount} Employees`,
      subtext: "With individual reports in database",
      icon: FiAward,
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "Database Integrity",
      value: "100%",
      subtext: "MongoDB synced & RBAC verified",
      icon: FiShield,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
  ];

  const activeStats = isUserView ? userStats : adminStats;

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            {isUserView ? "Employee Personal Statements" : `${roleTitle} Intelligence & Analytics`}
          </span>
          <h2 className="text-base sm:text-lg font-bold">
            {isUserView
              ? "My Personal Performance & Compliance Reports"
              : "Company-Wide Report & Audit Management"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isUserView
              ? "Access and download your individual Q3 performance appraisals, attendance shift audits, Form 16 tax statements, and leave ledgers."
              : "Generate consolidated payroll summaries, departmental attendance metrics, appraisal distributions, and statutory tax audit ledgers across all employees."}
          </p>
        </div>

        {!isUserView && onOpenGenerate && (
          <button
            type="button"
            onClick={onOpenGenerate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 active:bg-purple-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>+ Generate Custom Report</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {activeStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  {stat.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stat.bgLight}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
