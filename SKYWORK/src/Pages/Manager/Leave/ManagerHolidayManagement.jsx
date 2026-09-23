import React, { useState, useMemo } from "react";
import { FiDownload } from "react-icons/fi";
import { useHoliday } from "../../../Context/HolidayContext";
import HolidayLayoutTabs from "../../../Components/Leave/HolidayManagement/HolidayLayoutTabs";
import HolidaySummary from "../../../Components/Leave/HolidayManagement/HolidaySummary";
import HolidayFilters from "../../../Components/Leave/HolidayManagement/HolidayFilters";
import HolidayTable from "../../../Components/Leave/HolidayManagement/HolidayTable";
import HolidayCalendarView from "../../../Components/Leave/HolidayManagement/HolidayCalendarView";
import UpcomingHolidays from "../../../Components/Leave/HolidayManagement/UpcomingHolidays";
import HolidayDetailsModal from "../../../Components/Leave/HolidayManagement/HolidayDetailsModal";
import HolidayPagination from "../../../Components/Leave/HolidayManagement/HolidayPagination";
import HolidayToast from "../../../Components/Leave/HolidayManagement/HolidayToast";
import { getYearList } from "../../../Utils/holidayUtils";

export default function ManagerHolidayManagement() {
  const { holidays } = useHoliday();

  const managerUser = {
    employeeId: "EMP-MGR01",
    name: "Abhishek Sharma",
    employeeName: "Abhishek Sharma (Manager)",
    department: "Engineering Management",
    role: "Engineering Lead / Manager",
    email: "abhishek.mgr@skywork.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [viewMode, setViewMode] = useState("list");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  // Dynamic Year List
  const yearList = useMemo(() => getYearList(holidays), [holidays]);

  // Keep selected record in sync
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
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `manager_holiday_schedule_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <HolidayToast />

      {/* Role Layout Tabs */}
      <HolidayLayoutTabs />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Manager Portal</span>
            <span>•</span>
            <span className="text-indigo-600">Company Holiday Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Company Holiday Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View scheduled company off-days and plan team sprint deadlines accordingly.
          </p>
        </div>

        {/* Header Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FiDownload className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Dynamic Summary Cards */}
      <HolidaySummary holidays={holidays} />

      {/* 2. Upcoming Holidays Highlight */}
      <UpcomingHolidays
        holidays={holidays}
        limit={4}
        onSelectHoliday={(h) => setSelectedHoliday(h)}
      />

      {/* 3. Search & Filter Toolbar (View-Only, No Add Button) */}
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
        totalResults={filteredHolidays.length}
        isHR={false}
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
            isHR={false}
            onViewDetails={(h) => setSelectedHoliday(h)}
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

      {/* 5. Holiday Details Modal (View Only) */}
      <HolidayDetailsModal
        isOpen={Boolean(activeSelectedHoliday)}
        onClose={() => setSelectedHoliday(null)}
        holiday={activeSelectedHoliday}
        isHR={false}
      />
    </div>
  );
}
