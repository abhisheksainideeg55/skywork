import React, { useState, useMemo } from "react";
import { FiDownload, FiLock, FiUsers, FiClock } from "react-icons/fi";
import { useBreak } from "../../../Context/BreakContext";
import BreakLayoutTabs from "../../../Components/Break/BreakLayoutTabs";
import BreakSummary from "../../../Components/Break/BreakSummary";
import BreakLiveClockBanner from "../../../Components/Break/BreakLiveClockBanner";
import BreakPolicyCards from "../../../Components/Break/BreakPolicyCards";
import BreakFilters from "../../../Components/Break/BreakFilters";
import BreakLogsTable from "../../../Components/Break/BreakLogsTable";
import BreakPagination from "../../../Components/Break/BreakPagination";
import BreakToast from "../../../Components/Break/BreakToast";

export default function ManagerBreakManagement() {
  const { breakPolicies, breakLogs, toast, clearToast } = useBreak();

  const managerUser = {
    employeeId: "EMP-MGR01",
    name: "Marcus Vance",
    employeeName: "Marcus Vance (Manager)",
    department: "Engineering",
    role: "Engineering Lead / Manager",
    email: "marcus.vance@skywork.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  };

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreakType, setSelectedBreakType] = useState("All Types");
  const [selectedShiftType, setSelectedShiftType] = useState("All Shifts");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Export CSV
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
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `team_break_logs_${new Date().toISOString().slice(0, 10)}.csv`
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

      {/* Manager Access Alert Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <img
            src={managerUser.avatar}
            alt={managerUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Team Break Monitor (Manager View)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                View-Only Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Signed in as {managerUser.name} ({managerUser.role}) • Break policies and schedules are configured by HR Admin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 self-start sm:self-auto">
          <FiLock className="w-3.5 h-3.5 text-amber-400" />
          <span>Policies Managed by HR</span>
        </div>
      </div>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Work Management</span>
            <span>•</span>
            <span className="text-indigo-600">Team Break Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Department Break Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor active team breaks, duration compliance, and daily refreshment hours.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FiDownload className="w-4 h-4 text-slate-500" />
          <span>Export Team Logs</span>
        </button>
      </div>

      {/* 1. Summary Cards */}
      <BreakSummary policies={breakPolicies} logs={breakLogs} />

      {/* 2. Live Clock Banner with Test Alarm */}
      <BreakLiveClockBanner userShift="Day Shift" />

      {/* 3. Official Shift Break Schedules (View Only) */}
      <BreakPolicyCards policies={breakPolicies} isHR={false} />

      {/* 4. Filter Toolbar (isHR = false -> View-Only) */}
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
        onExportCSV={handleExportCSV}
        isHR={false}
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
    </div>
  );
}
