import React, { useState, useMemo } from "react";
import { FiDownload, FiPlus, FiRotateCcw } from "react-icons/fi";
import { useHoliday } from "../../../Context/HolidayContext";
import HolidayLayoutTabs from "../../../Components/Leave/HolidayManagement/HolidayLayoutTabs";
import HolidaySummary from "../../../Components/Leave/HolidayManagement/HolidaySummary";
import HolidayFilters from "../../../Components/Leave/HolidayManagement/HolidayFilters";
import HolidayTable from "../../../Components/Leave/HolidayManagement/HolidayTable";
import HolidayCalendarView from "../../../Components/Leave/HolidayManagement/HolidayCalendarView";
import UpcomingHolidays from "../../../Components/Leave/HolidayManagement/UpcomingHolidays";
import AddHolidayModal from "../../../Components/Leave/HolidayManagement/AddHolidayModal";
import EditHolidayModal from "../../../Components/Leave/HolidayManagement/EditHolidayModal";
import HolidayDetailsModal from "../../../Components/Leave/HolidayManagement/HolidayDetailsModal";
import DeleteHolidayDialog from "../../../Components/Leave/HolidayManagement/DeleteHolidayDialog";
import HolidayPagination from "../../../Components/Leave/HolidayManagement/HolidayPagination";
import HolidayToast from "../../../Components/Leave/HolidayManagement/HolidayToast";
import { getYearList } from "../../../Utils/holidayUtils";

export default function HRHolidayManagement() {
  const {
    holidays,
    toggleHolidayStatus,
    resetToDefaultHolidays,
  } = useHoliday();

  const hrCurrentUser = {
    employeeId: "EMP-HR01",
    name: "Abhishek Sharma",
    employeeName: "Abhishek Sharma (HR)",
    department: "HR & People Ops",
    role: "HR Administrator",
    email: "abhishek.hr@skywork.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [viewMode, setViewMode] = useState("list"); // "list" | "calendar"

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [deletingHoliday, setDeletingHoliday] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  // Dynamic Year List
  const yearList = useMemo(() => getYearList(holidays), [holidays]);

  // Keep selected / editing records synced with updated holidays
  const activeSelectedHoliday = useMemo(() => {
    if (!selectedHoliday) return null;
    return holidays.find((h) => h.id === selectedHoliday.id) || selectedHoliday;
  }, [holidays, selectedHoliday]);

  // Filtered Holidays
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.description &&
          h.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        h.date.includes(searchTerm) ||
        h.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.day && h.day.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchYear =
        selectedYear === "All Years" ||
        (h.date && h.date.startsWith(selectedYear));

      const matchType =
        selectedType === "All Types" || h.type === selectedType;

      const matchStatus =
        selectedStatus === "All Status" || h.status === selectedStatus;

      const matchDuration =
        selectedDuration === "All Durations" || h.duration === selectedDuration;

      return (
        matchSearch && matchYear && matchType && matchStatus && matchDuration
      );
    });
  }, [
    holidays,
    searchTerm,
    selectedYear,
    selectedType,
    selectedStatus,
    selectedDuration,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredHolidays.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedHolidays = filteredHolidays.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedYear("All Years");
    setSelectedType("All Types");
    setSelectedStatus("All Status");
    setSelectedDuration("All Durations");
    setCurrentPage(1);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Holiday Name",
      "Date",
      "Day",
      "Type",
      "Duration",
      "Description",
      "Status",
      "Created By",
    ];
    const rows = filteredHolidays.map((h) => [
      h.id,
      `"${h.name}"`,
      h.date,
      h.day || "",
      `"${h.type}"`,
      h.duration,
      `"${(h.description || "").replace(/"/g, '""')}"`,
      h.status,
      `"${h.createdByName || h.createdBy || "-"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `skywork_holidays_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notifications */}
      <HolidayToast />

      {/* Role Layout Tabs */}
      <HolidayLayoutTabs />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>HR Management</span>
            <span>•</span>
            <span className="text-indigo-600">Holiday Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Holiday Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage the company's official holiday calendar.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={resetToDefaultHolidays}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Reset to default company holiday schedule"
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
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        </div>
      </div>

      {/* 1. Dynamic Summary Cards */}
      <HolidaySummary holidays={holidays} />

      {/* 2. Upcoming Holidays Highlight Banner */}
      <UpcomingHolidays
        holidays={holidays}
        limit={4}
        onSelectHoliday={(h) => setSelectedHoliday(h)}
      />

      {/* 3. Search & Filter Toolbar */}
      <HolidayFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedYear={selectedYear}
        onYearChange={(y) => {
          setSelectedYear(y);
          setCurrentPage(1);
        }}
        yearList={yearList}
        selectedType={selectedType}
        onTypeChange={(t) => {
          setSelectedType(t);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s);
          setCurrentPage(1);
        }}
        selectedDuration={selectedDuration}
        onDurationChange={(d) => {
          setSelectedDuration(d);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        totalResults={filteredHolidays.length}
        isHR={true}
        viewMode={viewMode}
        onViewModeChange={(m) => setViewMode(m)}
      />

      {/* 4. Holiday Calendar or Table View */}
      {viewMode === "calendar" ? (
        <HolidayCalendarView
          holidays={filteredHolidays}
          onSelectHoliday={(h) => setSelectedHoliday(h)}
        />
      ) : (
        <>
          <HolidayTable
            holidays={paginatedHolidays}
            startIndex={startIndex}
            isHR={true}
            onViewDetails={(h) => setSelectedHoliday(h)}
            onEditHoliday={(h) => setEditingHoliday(h)}
            onDeleteHoliday={(h) => setDeletingHoliday(h)}
            onToggleStatus={(id) => toggleHolidayStatus(id, hrCurrentUser)}
          />

          {/* Pagination */}
          <HolidayPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={filteredHolidays.length}
            rowsPerPage={rowsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        </>
      )}

      {/* 5. Add Holiday Modal */}
      <AddHolidayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={hrCurrentUser}
      />

      {/* 6. Edit Holiday Modal */}
      <EditHolidayModal
        isOpen={Boolean(editingHoliday)}
        onClose={() => setEditingHoliday(null)}
        holiday={editingHoliday}
        currentUser={hrCurrentUser}
      />

      {/* 7. Holiday Details Modal */}
      <HolidayDetailsModal
        isOpen={Boolean(activeSelectedHoliday)}
        onClose={() => setSelectedHoliday(null)}
        holiday={activeSelectedHoliday}
        isHR={true}
        onEdit={(h) => setEditingHoliday(h)}
        onDelete={(h) => setDeletingHoliday(h)}
      />

      {/* 8. Delete Confirmation Dialog */}
      <DeleteHolidayDialog
        isOpen={Boolean(deletingHoliday)}
        onClose={() => setDeletingHoliday(null)}
        holiday={deletingHoliday}
        currentUser={hrCurrentUser}
      />
    </div>
  );
}
