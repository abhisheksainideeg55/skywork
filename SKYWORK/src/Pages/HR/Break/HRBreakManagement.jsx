import React, { useState, useMemo } from "react";
import { FiDownload, FiPlus, FiRotateCcw, FiCoffee, FiBell } from "react-icons/fi";
import { useBreak } from "../../../Context/BreakContext";
import BreakLayoutTabs from "../../../Components/Break/BreakLayoutTabs";
import BreakSummary from "../../../Components/Break/BreakSummary";
import BreakLiveClockBanner from "../../../Components/Break/BreakLiveClockBanner";
import BreakPolicyCards from "../../../Components/Break/BreakPolicyCards";
import BreakFilters from "../../../Components/Break/BreakFilters";
import BreakLogsTable from "../../../Components/Break/BreakLogsTable";
import AddBreakPolicyModal from "../../../Components/Break/AddBreakPolicyModal";
import EditBreakPolicyModal from "../../../Components/Break/EditBreakPolicyModal";
import DeleteBreakDialog from "../../../Components/Break/DeleteBreakDialog";
import BreakPagination from "../../../Components/Break/BreakPagination";
import BreakToast from "../../../Components/Break/BreakToast";

export default function HRBreakManagement() {
  const {
    breakPolicies,
    breakLogs,
    toast,
    clearToast,
    addBreakPolicy,
    updateBreakPolicy,
    deleteBreakPolicy,
    resetToDefaultPolicies,
  } = useBreak();

  const hrCurrentUser = {
    employeeId: "EMP-HR01",
    name: "Priya Verma",
    employeeName: "Priya Verma (HR Admin)",
    department: "HR & Admin",
    role: "HR Administrator",
    email: "priya.hr@skywork.io",
  };

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreakType, setSelectedBreakType] = useState("All Types");
  const [selectedShiftType, setSelectedShiftType] = useState("All Shifts");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deletingPolicy, setDeletingPolicy] = useState(null);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return breakLogs.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item.role && item.role.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.breakType && item.breakType.toLowerCase().includes(q));

      const matchesType =
        selectedBreakType === "All Types" || item.breakType === selectedBreakType;

      const matchesShift =
        selectedShiftType === "All Shifts" ||
        item.shiftType === selectedShiftType;

      const matchesStatus =
        selectedStatus === "All Statuses" || item.status === selectedStatus;

      return matchesSearch && matchesType && matchesShift && matchesStatus;
    });
  }, [
    breakLogs,
    searchTerm,
    selectedBreakType,
    selectedShiftType,
    selectedStatus,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedBreakType("All Types");
    setSelectedShiftType("All Shifts");
    setSelectedStatus("All Statuses");
    setCurrentPage(1);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Log ID",
      "Employee ID",
      "Employee Name",
      "Department",
      "Shift Type",
      "Break Type",
      "Start Time",
      "End Time",
      "Duration (Mins)",
      "Allowed (Mins)",
      "Status",
      "Notes",
    ];

    const rows = filteredLogs.map((item) => [
      item.id,
      item.employeeId,
      `"${item.employeeName}"`,
      `"${item.department}"`,
      `"${item.shiftType}"`,
      `"${item.breakType}"`,
      item.startTime,
      item.endTime || "Active",
      item.durationMinutes,
      item.allowedMinutes,
      item.status,
      `"${(item.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `skywork_break_logs_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      <BreakToast toast={toast} onClose={clearToast} />

      {/* Role Layout Tabs */}
      <BreakLayoutTabs />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Work Management</span>
            <span>•</span>
            <span className="text-indigo-600">Break Management</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 text-[10px]">
              HR Policy & Alarm Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Break Management System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure shift break policies, alarm sound triggers, and track real-time employee break compliance.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={resetToDefaultPolicies}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Reset to default company break schedules"
          >
            <FiRotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FiDownload className="w-4 h-4 text-slate-500" />
            <span>Export Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>+ Add Break Policy</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <BreakSummary policies={breakPolicies} logs={breakLogs} />

      {/* 2. Live Real-Time Clock & Alarm Test Banner */}
      <BreakLiveClockBanner userShift="Day Shift" />

      {/* 3. Official Shift Break Schedules (Cards with HR Edit/Delete) */}
      <BreakPolicyCards
        policies={breakPolicies}
        isHR={true}
        onEditPolicy={(p) => setEditingPolicy(p)}
        onDeletePolicy={(p) => setDeletingPolicy(p)}
      />

      {/* 4. Filter Toolbar */}
      <BreakFilters
        searchTerm={searchTerm}
        setSearchTerm={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedBreakType={selectedBreakType}
        setSelectedBreakType={(val) => {
          setSelectedBreakType(val);
          setCurrentPage(1);
        }}
        selectedShiftType={selectedShiftType}
        setSelectedShiftType={(val) => {
          setSelectedShiftType(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCSV={handleExportCSV}
        isHR={true}
        totalResults={filteredLogs.length}
      />

      {/* 5. Logs Table & Pagination */}
      <BreakLogsTable logs={paginatedLogs} />

      <BreakPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLogs.length}
        pageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
      />

      {/* 6. Modals */}
      <AddBreakPolicyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addBreakPolicy}
        currentUser={hrCurrentUser}
      />

      <EditBreakPolicyModal
        isOpen={Boolean(editingPolicy)}
        onClose={() => setEditingPolicy(null)}
        onUpdate={updateBreakPolicy}
        policy={editingPolicy}
        currentUser={hrCurrentUser}
      />

      <DeleteBreakDialog
        isOpen={Boolean(deletingPolicy)}
        onClose={() => setDeletingPolicy(null)}
        onConfirm={(id) => {
          deleteBreakPolicy(id, hrCurrentUser);
          setDeletingPolicy(null);
        }}
        policy={deletingPolicy}
      />
    </div>
  );
}
