import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiTrash2,
  FiCheckCircle,
  FiFileText,
  FiCalendar,
  FiUser,
  FiUsers,
  FiShield,
  FiEye,
  FiX,
  FiPrinter,
  FiBriefcase,
  FiHash,
  FiEdit2,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";
import { REPORT_CATEGORIES } from "../../../Data/employeeData";
import GenerateReportModal from "./GenerateReportModal";

// ─────────────────────────────────────────────
// REPORT PREVIEW MODAL — Full Report Detail View
// ─────────────────────────────────────────────
function ReportPreviewModal({ report, onClose, onDownload }) {
  if (!report) return null;

  const isPersonal = report.employeeId && report.employeeId !== "ALL";

  // Parse salary info from description if available
  const salaryInfo = {};
  if (report.description) {
    const grossMatch = report.description.match(/Gross:\s*([₹\d,]+)/);
    const deductMatch = report.description.match(/Deductions:\s*([₹\d,]+)/);
    const netMatch = report.description.match(/Net Pay:\s*([₹\d,]+)/);
    const statusMatch = report.description.match(/Status:\s*(\w+)/);
    if (grossMatch) salaryInfo.gross = grossMatch[1];
    if (deductMatch) salaryInfo.deductions = deductMatch[1];
    if (netMatch) salaryInfo.net = netMatch[1];
    if (statusMatch) salaryInfo.status = statusMatch[1];
  }

  const hasSalaryData = salaryInfo.gross || salaryInfo.net;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isPersonal
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                : "bg-purple-500/20 text-purple-300 border-purple-500/30"
            }`}>
              {isPersonal ? <FiUser className="w-5 h-5" /> : <FiFileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-snug">Report Preview</h3>
              <p className="text-xs text-slate-300">
                {isPersonal ? `Individual Report — ${report.employeeName}` : "Company-Wide Report"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Report Title */}
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-snug">{report.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{report.description}</p>
          </div>

          {/* Employee & Report Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Employee Name */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Employee</p>
              <div className="flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800">
                  {isPersonal ? report.employeeName : "All Employees"}
                </span>
              </div>
            </div>

            {/* Employee ID */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Employee ID</p>
              <div className="flex items-center gap-1.5">
                <FiHash className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {isPersonal ? report.employeeId : "ALL"}
                </span>
              </div>
            </div>

            {/* Department */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
              <div className="flex items-center gap-1.5">
                <FiBriefcase className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800">
                  {report.department || "All Departments"}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</p>
              <span className="text-xs font-bold text-slate-800">{report.category}</span>
            </div>

            {/* Report ID */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Report Ref ID</p>
              <span className="text-xs font-bold text-slate-800 font-mono">{report.id}</span>
            </div>

            {/* Generated Date */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Generated On</p>
              <div className="flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">{report.dateGenerated}</span>
              </div>
            </div>
          </div>

          {/* Salary Breakdown (if monthly payroll report) */}
          {hasSalaryData && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200">
              <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Monthly Salary Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {salaryInfo.gross && (
                  <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-xs">
                    <p className="text-[10px] font-semibold text-slate-400 mb-0.5">Gross Salary</p>
                    <p className="text-sm font-black text-slate-900">{salaryInfo.gross}</p>
                  </div>
                )}
                {salaryInfo.deductions && (
                  <div className="bg-white rounded-xl p-3 border border-rose-100 shadow-xs">
                    <p className="text-[10px] font-semibold text-slate-400 mb-0.5">Total Deductions</p>
                    <p className="text-sm font-black text-rose-600">{salaryInfo.deductions}</p>
                  </div>
                )}
                {salaryInfo.net && (
                  <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-xs">
                    <p className="text-[10px] font-semibold text-slate-400 mb-0.5">Net Pay</p>
                    <p className="text-sm font-black text-emerald-700">{salaryInfo.net}</p>
                  </div>
                )}
                {salaryInfo.status && (
                  <div className="bg-white rounded-xl p-3 border border-amber-100 shadow-xs">
                    <p className="text-[10px] font-semibold text-slate-400 mb-0.5">Payment Status</p>
                    <p className={`text-sm font-black ${
                      salaryInfo.status === "Paid" ? "text-emerald-600" :
                      salaryInfo.status === "Processing" ? "text-amber-600" : "text-slate-700"
                    }`}>{salaryInfo.status}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Report Meta Row */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <FiFileText className="w-3.5 h-3.5" />
              Format: <strong className="text-slate-700">{report.format}</strong>
            </span>
            <span>•</span>
            <span>Size: <strong className="text-slate-700">{report.fileSize}</strong></span>
            <span>•</span>
            <span>Downloads: <strong className="text-slate-700">{report.downloadsCount || 0}</strong></span>
            <span>•</span>
            <span>By: <strong className="text-slate-700">{report.generatedBy}</strong></span>
          </div>

          {/* CONFIDENTIAL Banner */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            <FiShield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>CONFIDENTIAL — This report is for authorized HR personnel only. Unauthorized distribution is prohibited.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              if (onDownload) onDownload(report);
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <FiDownload className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// MAIN TABLE COMPONENT
// ─────────────────────────────────────────────
export default function GeneratedReportsTable({
  onOpenGenerate,
  isUserView = false,
  employeeId = "EMP001",
}) {
  const { reports = [], employees = [], deleteReport, incrementReportDownload } = useEmployee();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Reports");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("ALL");
  const [previewReport, setPreviewReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      // 1. Strict user-view boundary
      if (isUserView) {
        const isMatch =
          rep.employeeId === employeeId ||
          rep.employeeId?.toLowerCase() === employeeId?.toLowerCase();
        if (!isMatch) return false;
      }

      // 2. HR / Manager Employee Filter
      if (!isUserView && selectedEmployeeFilter !== "ALL") {
        const isMatch =
          rep.employeeId === selectedEmployeeFilter ||
          rep.employeeId?.toLowerCase() === selectedEmployeeFilter?.toLowerCase();
        if (!isMatch) return false;
      }

      // 3. Search term match
      const search = searchTerm.trim().toLowerCase();
      const matchSearch =
        search === "" ||
        rep.title?.toLowerCase().includes(search) ||
        rep.description?.toLowerCase().includes(search) ||
        (rep.id && rep.id.toLowerCase().includes(search)) ||
        (rep.reportId && rep.reportId.toLowerCase().includes(search)) ||
        (rep.employeeName && rep.employeeName.toLowerCase().includes(search)) ||
        (rep.employeeId && rep.employeeId.toLowerCase().includes(search)) ||
        (rep.department && rep.department.toLowerCase().includes(search));

      // 4. Category match
      const matchCat =
        selectedCategory === "All Reports" || rep.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [reports, searchTerm, selectedCategory, selectedEmployeeFilter, isUserView, employeeId]);

  const handleDownload = (rep) => {
    incrementReportDownload(rep.id);

    const content = `SKYWORK HRMS - OFFICIAL EMPLOYEE REPORT\n\nTitle: ${rep.title}\nCategory: ${rep.category}\nEmployee Name: ${rep.employeeName || "Employee"}\nEmployee ID: ${rep.employeeId || "—"}\nDepartment: ${rep.department || "General"}\nGenerated By: ${rep.generatedBy}\nDate: ${rep.dateGenerated}\nRef ID: ${rep.id || rep.reportId}\n\nSummary:\n${rep.description}\n\n[CONFIDENTIAL - FOR AUTHORIZED USE ONLY]`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${rep.id || rep.reportId}_${(rep.employeeName || "Report").replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (repId, title) => {
    if (window.confirm(`Are you sure you want to delete report:\n"${title}"?`)) {
      deleteReport(repId);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  isUserView
                    ? "Search my personal reports and audits..."
                    : "Search reports by employee name, ID, title, or department..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dynamic Employee Filter (HR & Superadmin only) */}
            {!isUserView && (
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">👥 All Employees ({employees.length})</option>
                {employees.map((emp) => {
                  const eid = emp.employeeId || emp.id;
                  return (
                    <option key={eid} value={eid}>
                      👤 {emp.employeeName || emp.name} ({eid})
                    </option>
                  );
                })}
              </select>
            )}

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {REPORT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">Report Title & Scope</th>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Format & Size</th>
                <th className="px-4 py-3.5">Generated On</th>
                <th className="px-4 py-3.5">Downloads</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <FiFileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No reports found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isUserView
                        ? "You do not have any personal reports matching your search."
                        : "No organization reports matched the active filters."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => {
                  const isPersonal = rep.employeeId && rep.employeeId !== "ALL";

                  return (
                    <tr
                      key={rep.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => setPreviewReport(rep)}
                    >
                      {/* Title & Desc */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                              isPersonal
                                ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                : "bg-purple-50 text-purple-600 border-purple-100"
                            }`}
                          >
                            {isPersonal ? (
                              <FiUser className="w-4 h-4" />
                            ) : (
                              <FiFileText className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-snug">
                              {rep.title}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {rep.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono text-slate-400">
                                Ref: {rep.id}
                              </span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isPersonal
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "bg-purple-50 text-purple-700"
                                }`}
                              >
                                {isPersonal ? "Personal" : "Company-Wide"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Employee Name + ID Column */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isPersonal ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black border border-indigo-200">
                                {rep.employeeName?.charAt(0) || "?"}
                              </div>
                              <span className="font-bold text-slate-800 text-xs">{rep.employeeName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-indigo-500 ml-7.5 block mt-0.5">
                              {rep.employeeId}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200">
                              <FiUsers className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500">All Employees</span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {rep.category}
                        </span>
                      </td>

                      {/* Format & Size */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{rep.format}</div>
                        <div className="text-[10px] text-slate-400">{rep.fileSize}</div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rep.dateGenerated}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          By {rep.generatedBy}
                        </div>
                      </td>

                      {/* Downloads */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-slate-600 font-semibold text-xs">
                          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{rep.downloadsCount || 0} times</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {/* View / Open */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewReport(rep);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer border border-indigo-200"
                            title="View Report Details"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* Edit / Update */}
                          {!isUserView && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingReport(rep);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors cursor-pointer border border-amber-200"
                              title="Edit / Update Report"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Download */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(rep);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer border border-purple-200"
                            title="Download Report (CSV / PDF)"
                          >
                            <FiDownload className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>

                          {!isUserView && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(rep.id, rep.title);
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Report"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Report Preview Modal */}
      {previewReport && (
        <ReportPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
          onDownload={handleDownload}
        />
      )}

      {/* Report Edit Modal */}
      {editingReport && (
        <GenerateReportModal
          record={editingReport}
          onClose={() => setEditingReport(null)}
        />
      )}
    </>
  );
}
