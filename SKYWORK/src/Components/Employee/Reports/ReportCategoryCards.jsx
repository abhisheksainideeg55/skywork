import React from "react";
import {
  FiDollarSign,
  FiCalendar,
  FiAward,
  FiPieChart,
  FiDownloadCloud,
  FiFileText,
  FiShield,
  FiClock,
  FiBriefcase,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function ReportCategoryCards({ isUserView = false, employeeId = "EMP001" }) {
  const { generateNewReport, reports, incrementReportDownload } = useEmployee();

  const handleDownloadPersonal = (title, category, filename) => {
    // Find matching report or generate simulated download
    const matchingReport = reports.find(
      (r) => r.employeeId === employeeId && r.category === category
    );
    if (matchingReport) {
      incrementReportDownload(matchingReport.id);
    }

    const content = `SKYWORK HRMS - OFFICIAL EMPLOYEE PERSONAL STATEMENT\n\nEmployee: Abhishek Sharma (EMP001)\nDepartment: Engineering\nRole: Senior Frontend Lead\nTitle: ${title}\nCategory: ${category}\nGenerated Date: ${new Date().toISOString().split("T")[0]}\n\n[CONFIDENTIAL - FOR EMPLOYEE PERSONAL RECORDS]`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const userTemplates = [
    {
      title: "My Form 16 Tax Certificate",
      category: "Statutory & Compliance",
      format: "PDF Form 16",
      desc: "Annual TDS computation, tax exemption certificates, and verified Form 16.",
      icon: FiShield,
      color: "purple",
      borderColor: "border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700 text-white",
      filename: "EMP001_Form16_Tax_Statement",
    },
    {
      title: "My Q3 Appraisal Scorecard",
      category: "Performance & Appraisals",
      format: "PDF Scorecard",
      desc: "Individual performance rating (4.9/5.0), promotion notes, and goal milestones.",
      icon: FiAward,
      color: "amber",
      borderColor: "border-amber-200",
      buttonColor: "bg-amber-600 hover:bg-amber-700 text-white",
      filename: "EMP001_Q3_Performance_Scorecard",
    },
    {
      title: "My Shift & Attendance Log",
      category: "Attendance & Hours",
      format: "CSV / Excel",
      desc: "Personal monthly check-in history, 164 work hours, and shift rotation sheet.",
      icon: FiClock,
      color: "indigo",
      borderColor: "border-indigo-200",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
      filename: "EMP001_Attendance_Shift_Log",
    },
    {
      title: "My Leave Ledger Summary",
      category: "Payroll & Compensation",
      format: "CSV / Excel",
      desc: "Year-to-date leave entitlement, 14 days remaining balance, and comp-off credits.",
      icon: FiCalendar,
      color: "emerald",
      borderColor: "border-emerald-200",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      filename: "EMP001_Leave_Accrual_Summary",
    },
  ];

  const adminTemplates = [
    {
      title: "Attendance & Punctuality Audit",
      category: "Attendance & Punctuality Report",
      format: "CSV / Excel",
      desc: "Daily biometric punches, late arrivals, shift hours, and absence metrics.",
      icon: FiClock,
      color: "indigo",
      borderColor: "border-indigo-200",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
    {
      title: "Leave & Absence Ledger",
      category: "Leave & Absence Audit Report",
      format: "CSV / Excel",
      desc: "Approved leaves, casual/sick leave quotas, Loss of Pay (LWP), and encashments.",
      icon: FiCalendar,
      color: "emerald",
      borderColor: "border-emerald-200",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    {
      title: "Work & Remote Operations Report",
      category: "Work & Remote Operations Report",
      format: "CSV / Excel",
      desc: "Task performance, remote WFH logs, project milestones, and productivity hours.",
      icon: FiBriefcase,
      color: "amber",
      borderColor: "border-amber-200",
      buttonColor: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    {
      title: "Consolidated Payroll Ledger",
      category: "Monthly Payroll Report",
      format: "CSV / Excel",
      desc: "Full salary components, tax deductions, PF, statutory fines, and net pay disbursement.",
      icon: FiDollarSign,
      color: "purple",
      borderColor: "border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700 text-white",
    },
  ];

  const handleAdminGenerate = (item) => {
    generateNewReport({
      title: item.title,
      category: item.category,
      format: item.format,
      description: item.desc,
      department: "All Departments",
      employeeId: "ALL",
      employeeName: "All Company Workforce",
    });
  };

  const templates = isUserView ? userTemplates : adminTemplates;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">
          {isUserView
            ? "Quick 1-Click Statement Downloads"
            : "Quick One-Click Report Generators"}
        </h3>
        <span className="text-xs text-slate-500">
          {isUserView
            ? "Instant download ready official employee certificates"
            : "Instant download ready company templates"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {templates.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-4 border ${cat.borderColor} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${cat.color}-50 text-${cat.color}-600 border border-${cat.color}-100`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {cat.format}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {cat.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    isUserView
                      ? handleDownloadPersonal(cat.title, cat.category, cat.filename)
                      : handleAdminGenerate(cat)
                  }
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${cat.buttonColor}`}
                >
                  <FiDownloadCloud className="w-4 h-4" />
                  <span>{isUserView ? "Download Statement" : "Generate & Export"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
