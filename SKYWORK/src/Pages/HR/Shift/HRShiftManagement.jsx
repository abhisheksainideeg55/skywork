import React, { useState, useMemo } from "react";
import { FiDownload, FiPlus, FiRotateCcw, FiUsers, FiClock } from "react-icons/fi";
import { useShift } from "../../../Context/ShiftContext";
import { useAuth } from "../../../Context/AuthContext";
import ShiftLayoutTabs from "../../../Components/Shift/ShiftLayoutTabs";
import ShiftSummary from "../../../Components/Shift/ShiftSummary";
import ShiftTypeCards from "../../../Components/Shift/ShiftTypeCards";
import ShiftFilters from "../../../Components/Shift/ShiftFilters";
import ShiftTable from "../../../Components/Shift/ShiftTable";
import ShiftRotaCalendar from "../../../Components/Shift/ShiftRotaCalendar";
import AllocateShiftModal from "../../../Components/Shift/AllocateShiftModal";
import BulkAllocateShiftModal from "../../../Components/Shift/BulkAllocateShiftModal";
import EditShiftModal from "../../../Components/Shift/EditShiftModal";
import ShiftDetailsModal from "../../../Components/Shift/ShiftDetailsModal";
import DeleteShiftDialog from "../../../Components/Shift/DeleteShiftDialog";
import ShiftPagination from "../../../Components/Shift/ShiftPagination";
import ShiftToast from "../../../Components/Shift/ShiftToast";

export default function HRShiftManagement() {
  const { currentUser } = useAuth();
  const {
    shiftAllocations,
    employeesDirectory,
    toast,
    clearToast,
    allocateShift,
    bulkAllocateShifts,
    updateShiftAllocation,
    removeShiftAllocation,
    resetToDefaultShifts,
  } = useShift();

  const hrCurrentUser = useMemo(() => {
    if (currentUser) {
      return {
        employeeId: currentUser.id || currentUser.employeeId || "HR001",
        name: currentUser.name || currentUser.employeeName || "HR Admin",
        employeeName: `${currentUser.name || currentUser.employeeName || "HR Admin"} (${currentUser.role === "superadmin" ? "Super Admin" : "HR Admin"})`,
        department: currentUser.department || "Human Resources",
        role: currentUser.role === "superadmin" ? "Super Admin" : "HR Administrator",
        email: currentUser.email || "hr@skywork.io",
        avatar: currentUser.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      };
    }
    return {
      employeeId: "EMP-HR01",
      name: "Priya Verma",
      employeeName: "Priya Verma (HR Admin)",
      department: "HR & Admin",
      role: "HR Administrator",
      email: "priya.hr@skywork.io",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    };
  }, [currentUser]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState("All Shifts");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [viewMode, setViewMode] = useState("table"); // "table" | "rota"

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deletingShift, setDeletingShift] = useState(null);
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
      "Email",
      "Department",
      "Role",
      "Shift Type",
      "Shift Timings",
      "Effective From",
      "Effective To",
      "Rotation Cycle",
      "Status",
      "Allocated By",
      "Notes",
    ];

    const rows = filteredAllocations.map((item) => [
      item.id,
      item.employeeId,
      `"${item.employeeName}"`,
      item.email,
      `"${item.department}"`,
      `"${item.role}"`,
      `"${item.shiftType}"`,
      `"${item.timings}"`,
      item.effectiveFrom,
      item.effectiveTo,
      `"${item.rotationCycle || "Fixed Schedule"}"`,
      item.status,
      `"${item.allocatedBy || "HR Admin"}"`,
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
      `skywork_shift_roster_${new Date().toISOString().slice(0, 10)}.csv`
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Work Management</span>
            <span>•</span>
            <span className="text-indigo-600">Shift Management</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 text-[10px]">
              HR Allocation Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Shift Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Allocate and configure company shifts (Day, Night & Rotational) across all departments.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={resetToDefaultShifts}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Reset to default company shift roster"
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
            <span>Export Roster</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FiUsers className="w-4 h-4" />
            <span className="hidden sm:inline">Bulk Allocate</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAllocateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>+ Allocate Shift</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <ShiftSummary
        allocations={shiftAllocations}
        totalEmployeesCount={employeesDirectory.length}
      />

      {/* 2. 3 Active Shift Types Details */}
      <ShiftTypeCards
        allocations={shiftAllocations}
        onFilterShift={handleQuickFilterShift}
      />

      {/* 3. Search & Filters Toolbar */}
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
        onOpenAllocateModal={() => setIsAllocateModalOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onExportCSV={handleExportCSV}
        isHR={true}
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
            isHR={true}
            onViewDetails={(item) => setSelectedShift(item)}
            onEditShift={(item) => setEditingShift(item)}
            onDeleteShift={(item) => setDeletingShift(item)}
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

      {/* 5. Modals */}
      <AllocateShiftModal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onAllocate={allocateShift}
        employeesDirectory={employeesDirectory}
        currentUser={hrCurrentUser}
      />

      <BulkAllocateShiftModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkAllocate={bulkAllocateShifts}
        employeesDirectory={employeesDirectory}
        currentUser={hrCurrentUser}
      />

      <EditShiftModal
        isOpen={Boolean(editingShift)}
        onClose={() => setEditingShift(null)}
        onUpdate={updateShiftAllocation}
        shiftRecord={editingShift}
        currentUser={hrCurrentUser}
      />

      <ShiftDetailsModal
        isOpen={Boolean(selectedShift)}
        onClose={() => setSelectedShift(null)}
        shiftRecord={selectedShift}
      />

      <DeleteShiftDialog
        isOpen={Boolean(deletingShift)}
        onClose={() => setDeletingShift(null)}
        onConfirm={(id) => {
          removeShiftAllocation(id, hrCurrentUser);
          setDeletingShift(null);
        }}
        shiftRecord={deletingShift}
      />
    </div>
  );
}
