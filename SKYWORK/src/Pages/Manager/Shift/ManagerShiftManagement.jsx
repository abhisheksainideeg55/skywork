import React, { useState, useMemo } from "react";
import { FiDownload, FiLock, FiInfo, FiUsers } from "react-icons/fi";
import { useShift } from "../../../Context/ShiftContext";
import ShiftLayoutTabs from "../../../Components/Shift/ShiftLayoutTabs";
import ShiftSummary from "../../../Components/Shift/ShiftSummary";
import ShiftTypeCards from "../../../Components/Shift/ShiftTypeCards";
import ShiftFilters from "../../../Components/Shift/ShiftFilters";
import ShiftTable from "../../../Components/Shift/ShiftTable";
import ShiftRotaCalendar from "../../../Components/Shift/ShiftRotaCalendar";
import ShiftDetailsModal from "../../../Components/Shift/ShiftDetailsModal";
import ShiftPagination from "../../../Components/Shift/ShiftPagination";
import ShiftToast from "../../../Components/Shift/ShiftToast";

export default function ManagerShiftManagement() {
  const { shiftAllocations, employeesDirectory, toast, clearToast } = useShift();

  const managerUser = {
    employeeId: "EMP-MGR01",
    name: "Marcus Vance",
    employeeName: "Marcus Vance (Manager)",
    department: "Engineering",
    role: "Engineering Lead / Manager",
    email: "marcus.vance@skywork.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  };

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState("All Shifts");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [viewMode, setViewMode] = useState("table"); // "table" | "rota"

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [selectedShift, setSelectedShift] = useState(null);

  // Filtered Allocations
  const filteredAllocations = useMemo(() => {
    return shiftAllocations.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item.role && item.role.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.shiftType && item.shiftType.toLowerCase().includes(q));

      const matchesShiftType =
        selectedShiftType === "All Shifts" || item.shiftType === selectedShiftType;

      const matchesDept =
        selectedDepartment === "All Departments" ||
        item.department === selectedDepartment;

      const matchesStatus =
        selectedStatus === "All Statuses" || item.status === selectedStatus;

      return matchesSearch && matchesShiftType && matchesDept && matchesStatus;
    });
  }, [
    shiftAllocations,
    searchTerm,
    selectedShiftType,
    selectedDepartment,
    selectedStatus,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAllocations.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAllocations = filteredAllocations.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedShiftType("All Shifts");
    setSelectedDepartment("All Departments");
    setSelectedStatus("All Statuses");
    setCurrentPage(1);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Allocation ID",
      "Employee ID",
      "Employee Name",
      "Department",
      "Role",
      "Shift Type",
      "Shift Timings",
      "Effective From",
      "Effective To",
      "Rotation Cycle",
      "Status",
    ];

    const rows = filteredAllocations.map((item) => [
      item.id,
      item.employeeId,
      `"${item.employeeName}"`,
      `"${item.department}"`,
      `"${item.role}"`,
      `"${item.shiftType}"`,
      `"${item.timings}"`,
      item.effectiveFrom,
      item.effectiveTo,
      `"${item.rotationCycle || "Fixed Schedule"}"`,
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
      `team_shift_roster_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickFilterShift = (type) => {
    setSelectedShiftType(type);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <ShiftToast toast={toast} onClose={clearToast} />

      {/* Role Layout Tabs */}
      <ShiftLayoutTabs />

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
                Team Shift Roster (Manager View)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                View-Only Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Signed in as {managerUser.name} ({managerUser.role}) • Shift allocation is strictly managed by HR Admin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 text-xs font-medium border border-white/10">
            <FiLock className="w-3.5 h-3.5 text-amber-400" />
            <span>Shift Allotment: HR Only</span>
          </div>
        </div>
      </div>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Work Management</span>
            <span>•</span>
            <span className="text-indigo-600">Shift Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Department Shift Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor active work shifts, timings, and weekly rota schedules across team members.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FiDownload className="w-4 h-4 text-slate-500" />
          <span>Export Team Roster</span>
        </button>
      </div>

      {/* 1. Summary Cards */}
      <ShiftSummary
        allocations={shiftAllocations}
        totalEmployeesCount={employeesDirectory.length}
      />

      {/* 2. 3 Shift Types Info */}
      <ShiftTypeCards
        allocations={shiftAllocations}
        onFilterShift={handleQuickFilterShift}
      />

      {/* 3. Search & Filters Toolbar (isHR = false -> View-Only) */}
      <ShiftFilters
        searchTerm={searchTerm}
        setSearchTerm={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedShiftType={selectedShiftType}
        setSelectedShiftType={(val) => {
          setSelectedShiftType(val);
          setCurrentPage(1);
        }}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={(val) => {
          setSelectedDepartment(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onResetFilters={handleResetFilters}
        onExportCSV={handleExportCSV}
        isHR={false}
        totalResults={filteredAllocations.length}
      />

      {/* 4. Table View or Weekly Rota Calendar View */}
      {viewMode === "rota" ? (
        <ShiftRotaCalendar
          allocations={filteredAllocations}
          onViewDetails={(item) => setSelectedShift(item)}
        />
      ) : (
        <>
          <ShiftTable
            allocations={paginatedAllocations}
            isHR={false}
            onViewDetails={(item) => setSelectedShift(item)}
          />

          <ShiftPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAllocations.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </>
      )}

      {/* 5. View Shift Details Modal */}
      <ShiftDetailsModal
        isOpen={Boolean(selectedShift)}
        onClose={() => setSelectedShift(null)}
        shiftRecord={selectedShift}
      />
    </div>
  );
}
