import React, { useState, useMemo } from "react";
import {
  FiX,
  FiAlertTriangle,
  FiPlus,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiShield,
  FiDollarSign,
  FiTrash2,
  FiDownload,
  FiLayers,
  FiCalendar,
  FiAlertCircle,
  FiUserCheck,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { FINE_CATEGORIES } from "../../../Services/salaryService";

export default function ManageFinesModal({
  isOpen,
  onClose,
  onOpenImposeModal,
  onSuccess,
}) {
  const {
    fines,
    salaries,
    waiveFine,
    deleteFine,
    formatCurrency,
  } = useSalary();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Waive Dialog State
  const [waiveTargetFine, setWaiveTargetFine] = useState(null);
  const [waiverReason, setWaiverReason] = useState("");
  const [isWaiving, setIsWaiving] = useState(false);
  const [actionError, setActionError] = useState("");

  // Delete Confirm State
  const [deleteTargetFine, setDeleteTargetFine] = useState(null);

  if (!isOpen) return null;

  // Calculate Summary Metrics
  const totalFinesCount = fines.length;
  const totalFinesAmount = fines.reduce((acc, f) => acc + (f.amount || 0), 0);
  
  const pendingFines = fines.filter((f) => f.status === "Pending");
  const pendingAmount = pendingFines.reduce((acc, f) => acc + (f.amount || 0), 0);

  const waivedFines = fines.filter((f) => f.status === "Waived");
  const waivedAmount = waivedFines.reduce((acc, f) => acc + (f.amount || 0), 0);

  const deductedFines = fines.filter((f) => f.status === "Deducted");
  const deductedAmount = deductedFines.reduce((acc, f) => acc + (f.amount || 0), 0);

  // Filtered Fines List
  const filteredFines = fines.filter((f) => {
    const emp = salaries.find((s) => s.employeeId === f.employeeId);
    const empName = emp?.employeeName || f.employeeName || "";
    const empDept = emp?.department || f.department || "";

    const matchesSearch =
      searchTerm.trim() === "" ||
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.fineNumber && f.fineNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || f.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || f.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handler to Waive Fine
  const handleConfirmWaive = async () => {
    if (!waiverReason.trim()) {
      setActionError("Please enter a valid justification to waive this penalty.");
      return;
    }
    try {
      setIsWaiving(true);
      setActionError("");
      await waiveFine(waiveTargetFine.id, waiverReason.trim());
      if (onSuccess) {
        onSuccess(`Fine of ${formatCurrency(waiveTargetFine.amount)} has been waived for ${waiveTargetFine.employeeName || waiveTargetFine.employeeId}.`);
      }
      setWaiveTargetFine(null);
      setWaiverReason("");
    } catch (err) {
      setActionError(err.message || "Failed to waive fine.");
    } finally {
      setIsWaiving(false);
    }
  };

  // Handler to Delete Fine
  const handleConfirmDelete = async () => {
    try {
      await deleteFine(deleteTargetFine.id);
      if (onSuccess) {
        onSuccess(`Fine record ${deleteTargetFine.fineNumber || deleteTargetFine.id} deleted successfully.`);
      }
      setDeleteTargetFine(null);
    } catch (err) {
      setActionError(err.message || "Failed to delete fine.");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Penalty ID", "Employee ID", "Employee Name", "Department", "Category", "Amount (INR)", "Incident Date", "Payroll Cycle", "Status", "Reason", "Imposed By", "Imposed At", "Waiver Reason"];
    const rows = filteredFines.map((f) => {
      const emp = salaries.find((s) => s.employeeId === f.employeeId);
      return [
        f.fineNumber || f.id,
        f.employeeId,
        `"${emp?.employeeName || f.employeeName || ""}"`,
        `"${emp?.department || f.department || ""}"`,
        `"${f.categoryLabel || f.category}"`,
        f.amount,
        f.incidentDate,
        `"${f.effectiveMonth}"`,
        f.status,
        `"${f.reason.replace(/"/g, '""')}"`,
        `"${f.imposedBy || ""}"`,
        f.imposedAt,
        `"${(f.waiverReason || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Skywork_Fines_Penalties_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (catId, label) => {
    switch (catId) {
      case "late_arrival":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><FiClock /> {label}</span>;
      case "policy_violation":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"><FiFileText /> {label}</span>;
      case "asset_damage":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"><FiLayers /> {label}</span>;
      case "attendance_discrepancy":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"><FiCalendar /> {label}</span>;
      case "disciplinary":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"><FiAlertTriangle /> {label}</span>;
      case "security_breach":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"><FiShield /> {label}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"><FiAlertCircle /> {label}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl overflow-hidden my-6 transition-all">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg font-bold border border-rose-200 dark:border-rose-900/50">
              <FiAlertTriangle />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Fines & Statutory Penalties Hub
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
                  {totalFinesCount} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Impose, monitor, forgive (waive), and track employee disciplinary fine payroll deductions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenImposeModal) onOpenImposeModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-semibold shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all"
            >
              <FiPlus className="text-sm" />
              <span>Impose New Fine</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Action Error if any */}
        {actionError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <FiAlertCircle />
            <span>{actionError}</span>
          </div>
        )}

        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
          
          {/* 1. Summary Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Imposed</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(totalFinesAmount)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">{totalFinesCount} incidents</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
              <span className="text-xs text-amber-700 dark:text-amber-400 block font-medium">Pending Deduction</span>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(pendingAmount)}
              </div>
              <span className="text-[11px] text-amber-600/70 dark:text-amber-400/70 block mt-0.5">{pendingFines.length} pending cycle</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-medium">Deducted in Payroll</span>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(deductedAmount)}
              </div>
              <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 block mt-0.5">{deductedFines.length} processed</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40">
              <span className="text-xs text-blue-700 dark:text-blue-400 block font-medium">Waived / Forgiven</span>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(waivedAmount)}
              </div>
              <span className="text-[11px] text-blue-600/70 dark:text-blue-400/70 block mt-0.5">{waivedFines.length} pardoned</span>
            </div>
          </div>

          {/* 2. Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employee, ID, reason..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Violation Categories</option>
                {FINE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Deduction</option>
                <option value="Deducted">Deducted in Payroll</option>
                <option value="Waived">Waived / Forgiven</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                title="Export Fines Report to CSV"
              >
                <FiDownload />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 3. Fines Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Violation Category</th>
                    <th className="py-3 px-4">Penalty Amount</th>
                    <th className="py-3 px-4">Incident / Cycle</th>
                    <th className="py-3 px-4">Reason & Remarks</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFines.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        <FiAlertTriangle className="mx-auto text-2xl mb-2 text-slate-300 dark:text-slate-600" />
                        No fine records found matching the current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFines.map((fine) => {
                      const emp = salaries.find((s) => s.employeeId === fine.employeeId);
                      const isWaived = fine.status === "Waived";
                      const isDeducted = fine.status === "Deducted";

                      return (
                        <tr
                          key={fine.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isWaived ? "opacity-60 bg-slate-50/40 dark:bg-slate-900/40" : ""
                          }`}
                        >
                          {/* Employee */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs overflow-hidden">
                                {emp?.avatar ? (
                                  <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  (emp?.employeeName || fine.employeeName || "E").charAt(0)
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {emp?.employeeName || fine.employeeName || "Employee"}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {fine.employeeId} • {emp?.department || fine.department}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            {getCategoryBadge(fine.category, fine.categoryLabel || fine.category)}
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <span className={isWaived ? "line-through text-slate-400" : "text-rose-600 dark:text-rose-400 font-extrabold"}>
                              {formatCurrency(fine.amount)}
                            </span>
                          </td>

                          {/* Incident / Cycle */}
                          <td className="py-3 px-4">
                            <div className="text-slate-900 dark:text-white font-medium">
                              {fine.incidentDate}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Cycle: {fine.effectiveMonth}
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="py-3 px-4 max-w-xs">
                            <p className="line-clamp-2 text-slate-700 dark:text-slate-300" title={fine.reason}>
                              {fine.reason}
                            </p>
                            {fine.waiverReason && (
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                Waiver: {fine.waiverReason}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {fine.status === "Pending" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending
                              </span>
                            )}
                            {fine.status === "Deducted" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <FiCheckCircle />
                                Deducted
                              </span>
                            )}
                            {fine.status === "Waived" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 line-through">
                                <FiUserCheck />
                                Waived
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {fine.status === "Pending" && (
                                <button
                                  onClick={() => {
                                    setWaiveTargetFine(fine);
                                    setWaiverReason("");
                                    setActionError("");
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                  title="Waive / Forgive this fine"
                                >
                                  Waive
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteTargetFine(fine)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Delete fine record"
                              >
                                <FiTrash2 />
                              </button>
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
        </div>

        {/* WAIVE FINE CONFIRMATION SUB-MODAL */}
        {waiveTargetFine && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
                  <FiUserCheck />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Waive Disciplinary Penalty
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Forgive fine of {formatCurrency(waiveTargetFine.amount)} for {waiveTargetFine.employeeName || waiveTargetFine.employeeId}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Waiver Justification / Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  placeholder="e.g. Medical certificate approved retrospectively by Head of HR..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setWaiveTargetFine(null)}
                  disabled={isWaiving}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWaive}
                  disabled={isWaiving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                >
                  {isWaiving ? "Waiving..." : "Confirm & Waive Penalty"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM SUB-MODAL */}
        {deleteTargetFine && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-rose-600">
                <FiTrash2 className="text-2xl" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Penalty Record?
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Are you sure you want to delete penalty <strong>{deleteTargetFine.fineNumber || deleteTargetFine.id}</strong> ({formatCurrency(deleteTargetFine.amount)})? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetFine(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20"
                >
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
