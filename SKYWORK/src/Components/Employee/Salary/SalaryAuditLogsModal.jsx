import React, { useState } from "react";
import {
  FiX,
  FiShield,
  FiSearch,
  FiClock,
  FiActivity,
  FiDownload,
  FiFilter,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";

export default function SalaryAuditLogsModal({ isOpen, onClose }) {
  const { auditLogs } = useSalary();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("All Actions");

  if (!isOpen) return null;

  const actions = [
    "All Actions",
    "Salary Created",
    "Salary Updated",
    "Salary Incremented",
    "Salary Decremented",
    "Bonus Added",
    "Deduction Added",
    "Payroll Generated",
    "Payroll Locked",
    "Salary Slip Generated",
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.employeeName && log.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchAction =
      selectedAction === "All Actions" || log.action === selectedAction;

    return matchSearch && matchAction;
  });

  const handleExportLogs = () => {
    const headers = [
      "Log ID",
      "Timestamp",
      "Action",
      "Employee ID",
      "Employee Name",
      "Previous Value",
      "New Value",
      "Reason",
      "Performed By",
      "IP Address",
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.action}"`,
      l.employeeId,
      `"${l.employeeName || ""}"`,
      `"${l.previousValue || ""}"`,
      `"${l.newValue || ""}"`,
      `"${l.reason || ""}"`,
      `"${l.performedBy || ""}"`,
      `"${l.ipAddress || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Salary_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6 z-10 space-y-5">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Salary Security Audit Trail</h3>
              <p className="text-xs text-slate-300">
                Confidential Log of all Compensation Modifications & Approvals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
              >
                {actions.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportLogs}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 font-bold text-xs"
              >
                <FiDownload className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[750px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-3">Timestamp & ID</th>
                    <th className="px-3.5 py-3">Action Event</th>
                    <th className="px-3.5 py-3">Target Employee</th>
                    <th className="px-3.5 py-3">Delta Change</th>
                    <th className="px-3.5 py-3">Reason / Context</th>
                    <th className="px-3.5 py-3 text-right">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                        No audit events match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="px-3.5 py-3">
                          <div className="font-semibold text-slate-800">
                            {new Date(log.timestamp).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{log.id}</span>
                        </td>

                        <td className="px-3.5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {log.action}
                          </span>
                        </td>

                        <td className="px-3.5 py-3">
                          <span className="font-bold text-slate-900 block">
                            {log.employeeName || log.employeeId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.employeeId}
                          </span>
                        </td>

                        <td className="px-3.5 py-3">
                          <div className="text-[11px]">
                            <span className="text-slate-400 line-through mr-1">
                              {log.previousValue}
                            </span>
                            <span className="font-bold text-emerald-700">
                              → {log.newValue}
                            </span>
                          </div>
                        </td>

                        <td className="px-3.5 py-3">
                          <span className="text-slate-700 truncate max-w-[200px] block">
                            {log.reason || "Administrative compensation update"}
                          </span>
                        </td>

                        <td className="px-3.5 py-3 text-right">
                          <span className="font-bold text-slate-800 block">
                            {log.performedBy}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.ipAddress || "VPN Secured"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total recorded audit events: <strong>{filteredLogs.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer"
          >
            Close Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
}
