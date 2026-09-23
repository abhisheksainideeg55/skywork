import React, { useState, useMemo } from "react";
import { FiDownload } from "react-icons/fi";
import { useLeave } from "../../../Context/LeaveContext";
import LeaveLayoutTabs from "../../../Components/Leave/LeaveLayoutTabs";
import LeaveSummary from "../../../Components/Leave/LeaveSummary";
import LeaveFilters from "../../../Components/Leave/LeaveFilters";
import LeaveTable from "../../../Components/Leave/LeaveTable";
import LeavePagination from "../../../Components/Leave/LeavePagination";
import ApplyLeaveModal from "../../../Components/Leave/ApplyLeaveModal";
import LeaveDetailsModal from "../../../Components/Leave/LeaveDetailsModal";

export default function UserLeave() {
  const { leaveRecords, getUserLeaveBalance, cancelLeave } = useLeave();

  const currentUser = {
    employeeId: "EMP001",
    name: "Abhishek Sharma",
    employeeName: "Abhishek Sharma",
    department: "Engineering",
    role: "Senior Developer",
    email: "abhishek@skywork.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  const userBalances = getUserLeaveBalance(currentUser.employeeId);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeaveType, setSelectedLeaveType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filter only current user's records
  const myRecords = useMemo(() => {
    return leaveRecords.filter(
      (r) =>
        r.employeeId === currentUser.employeeId ||
        r.employeeName.includes("Abhishek")
    );
  }, [leaveRecords, currentUser.employeeId]);

  // Filtered records according to active filters
  const filteredRecords = useMemo(() => {
    return myRecords.filter((rec) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        rec.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.fromDate.includes(searchTerm) ||
        rec.toDate.includes(searchTerm);

      const matchType =
        selectedLeaveType === "All Types" || rec.leaveType === selectedLeaveType;

      const matchStatus =
        selectedStatus === "All Status" || rec.status === selectedStatus;

      const matchDuration =
        selectedDuration === "All Durations" || rec.duration === selectedDuration;

      const matchDate =
        !selectedDate ||
        rec.fromDate === selectedDate ||
        rec.toDate === selectedDate;

      return matchSearch && matchType && matchStatus && matchDuration && matchDate;
    });
  }, [myRecords, searchTerm, selectedLeaveType, selectedStatus, selectedDuration, selectedDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + rowsPerPage);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedLeaveType("All Types");
    setSelectedStatus("All Status");
    setSelectedDuration("All Durations");
    setSelectedDate("");
    setCurrentPage(1);
  };

  const handleCancelLeave = (rec) => {
    if (window.confirm(`Are you sure you want to cancel your ${rec.leaveType} request for ${rec.fromDate}?`)) {
      cancelLeave(rec.id, currentUser.employeeId);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Leave Type",
      "Duration",
      "From Date",
      "To Date",
      "Total Days",
      "Reason",
      "Applied On",
      "Status",
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.leaveType}"`,
      r.duration,
      r.fromDate,
      r.toDate,
      r.totalDays,
      `"${r.reason.replace(/"/g, '""')}"`,
      r.appliedOn,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_leaves_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Role Layout Tabs */}
      <LeaveLayoutTabs />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Employee Portal</span>
            <span>•</span>
            <span className="text-indigo-600">My Leaves</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            My Leaves
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your leave requests, check available quotas, and track approval status.
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

      {/* 1. Leave Quota Summary Cards */}
      <LeaveSummary balances={userBalances} records={myRecords} isHRView={false} />

      {/* 2. Search & Filters Toolbar with + Apply Leave Button */}
      <LeaveFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedLeaveType={selectedLeaveType}
        onLeaveTypeChange={(type) => {
          setSelectedLeaveType(type);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => {
          setSelectedStatus(status);
          setCurrentPage(1);
        }}
        selectedDuration={selectedDuration}
        onDurationChange={(dur) => {
          setSelectedDuration(dur);
          setCurrentPage(1);
        }}
        selectedDate={selectedDate}
        onDateChange={(date) => {
          setSelectedDate(date);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        onOpenApplyModal={() => setIsApplyModalOpen(true)}
        totalResults={filteredRecords.length}
        isHRView={false}
      />

      {/* 3. Leave Requests Table */}
      <LeaveTable
        records={paginatedRecords}
        startIndex={startIndex}
        isHRView={false}
        currentUser={currentUser}
        onViewRecord={(rec) => setSelectedRecord(rec)}
        onCancelRecord={handleCancelLeave}
      />

      {/* 4. Pagination */}
      <LeavePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalEntries={filteredRecords.length}
        rowsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
      />

      {/* 5. Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        currentUser={currentUser}
      />

      {/* 6. Leave Details Modal */}
      <LeaveDetailsModal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />
    </div>
  );
}
