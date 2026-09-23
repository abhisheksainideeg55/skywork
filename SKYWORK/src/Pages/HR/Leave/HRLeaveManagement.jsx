import React, { useState, useMemo } from "react";
import { FiDownload } from "react-icons/fi";
import { useLeave } from "../../../Context/LeaveContext";
import { useAuth } from "../../../Context/AuthContext";
import LeaveLayoutTabs from "../../../Components/Leave/LeaveLayoutTabs";
import LeaveSummary from "../../../Components/Leave/LeaveSummary";
import LeaveFilters from "../../../Components/Leave/LeaveFilters";
import LeaveTable from "../../../Components/Leave/LeaveTable";
import LeavePagination from "../../../Components/Leave/LeavePagination";
import ApplyLeaveModal from "../../../Components/Leave/ApplyLeaveModal";
import LeaveDetailsModal from "../../../Components/Leave/LeaveDetailsModal";
import LeaveRejectModal from "../../../Components/Leave/LeaveRejectModal";

export default function HRLeaveManagement() {
  const { currentUser } = useAuth();
  const {
    leaveRecords,
    getUserLeaveBalance,
    approveLeave,
    rejectLeave,
    resetToPending,
    cancelLeave,
  } = useLeave();

  const actorRole = currentUser?.role || "hr";

  const hrCurrentUser = useMemo(() => {
    if (currentUser) {
      return {
        employeeId: currentUser.id || "HR001",
        name: currentUser.name || "HR Admin",
        employeeName: `${currentUser.name || "HR Admin"} (${currentUser.role === "superadmin" ? "Super Admin" : "HR"})`,
        department: currentUser.department || "Human Resources",
        role: currentUser.role === "superadmin" ? "Super Admin" : "HR Administrator",
        email: currentUser.email || "hr@skywork.io",
        avatar: currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      };
    }
    return {
      employeeId: "HR001",
      name: "HR Admin",
      employeeName: "HR Admin (HR)",
      department: "Human Resources",
      role: "HR Administrator",
      email: "hr@skywork.io",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
  }, [currentUser]);

  const hrBalances = getUserLeaveBalance(hrCurrentUser.employeeId);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedLeaveType, setSelectedLeaveType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectingRecord, setRejectingRecord] = useState(null);

  // Keep selectedRecord in sync with updated leaveRecords
  const activeSelectedRecord = useMemo(() => {
    if (!selectedRecord) return null;
    return leaveRecords.find((r) => r.id === selectedRecord.id) || selectedRecord;
  }, [leaveRecords, selectedRecord]);

  // Filtered company leave records according to active filters
  const filteredRecords = useMemo(() => {
    return leaveRecords.filter((rec) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept =
        selectedDepartment === "All Departments" || rec.department === selectedDepartment;

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

      return matchSearch && matchDept && matchType && matchStatus && matchDuration && matchDate;
    });
  }, [
    leaveRecords,
    searchTerm,
    selectedDepartment,
    selectedLeaveType,
    selectedStatus,
    selectedDuration,
    selectedDate,
  ]);

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
    setSelectedDepartment("All Departments");
    setSelectedLeaveType("All Types");
    setSelectedStatus("All Status");
    setSelectedDuration("All Durations");
    setSelectedDate("");
    setCurrentPage(1);
  };

  // Actions
  const handleApprove = (rec) => {
    const approverName = actorRole === "superadmin"
      ? `${currentUser?.name || "Super Admin"} (Super Admin)`
      : `${hrCurrentUser.name} (HR Admin)`;

    const promptMsg =
      rec.status === "Rejected"
        ? `Change status to APPROVED for ${rec.employeeName} (${rec.leaveType}, ${rec.totalDays} days)?`
        : rec.status === "Cancelled"
        ? `Re-approve cancelled leave for ${rec.employeeName}?`
        : `Approve ${rec.leaveType} (${rec.totalDays} days) for ${rec.employeeName}?`;

    if (window.confirm(promptMsg)) {
      const res = approveLeave(rec.id, approverName, actorRole);
      if (res && !res.success) {
        alert(res.error);
      }
    }
  };

  const handleConfirmReject = (leaveId, reason) => {
    const rejectorName = actorRole === "superadmin"
      ? `${currentUser?.name || "Super Admin"} (Super Admin)`
      : `${hrCurrentUser.name} (HR Admin)`;
    const res = rejectLeave(leaveId, reason, rejectorName, actorRole);
    if (res && !res.success) {
      alert(res.error);
    }
  };

  const handleResetPending = (rec) => {
    const reviewerName = actorRole === "superadmin"
      ? `${currentUser?.name || "Super Admin"} (Super Admin)`
      : `${hrCurrentUser.name} (HR Admin)`;
    if (window.confirm(`Reset leave request for ${rec.employeeName} back to Pending status?`)) {
      const res = resetToPending(rec.id, reviewerName, actorRole);
      if (res && !res.success) {
        alert(res.error);
      }
    }
  };

  const handleCancelLeave = (rec) => {
    if (window.confirm(`Are you sure you want to cancel your ${rec.leaveType} request for ${rec.fromDate}?`)) {
      cancelLeave(rec.id, hrCurrentUser.employeeId);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Employee",
      "Emp ID",
      "Department",
      "Leave Type",
      "Duration",
      "From Date",
      "To Date",
      "Total Days",
      "Reason",
      "Applied On",
      "Status",
      "Approved By",
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.employeeName}"`,
      r.employeeId,
      r.department,
      `"${r.leaveType}"`,
      r.duration,
      r.fromDate,
      r.toDate,
      r.totalDays,
      `"${r.reason.replace(/"/g, '""')}"`,
      r.appliedOn,
      r.status,
      `"${r.approvedBy || "-"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_employee_leaves_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span>HR Management</span>
            <span>•</span>
            <span className="text-indigo-600">Leave Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Employee Leave Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review employee time-off requests, manage approvals, and apply for your own leave.
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

      {/* 1. Company Overview Summary Cards */}
      <LeaveSummary balances={hrBalances} records={leaveRecords} isHRView={true} />

      {/* 2. Search & Filters Toolbar with + Apply Leave Button */}
      <LeaveFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={(dept) => {
          setSelectedDepartment(dept);
          setCurrentPage(1);
        }}
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
        isHRView={true}
      />

      {/* 3. Company Leave Requests Table */}
      <LeaveTable
        records={paginatedRecords}
        startIndex={startIndex}
        isHRView={true}
        currentUser={hrCurrentUser}
        onViewRecord={(rec) => setSelectedRecord(rec)}
        onApproveRecord={handleApprove}
        onRejectRecord={(rec) => setRejectingRecord(rec)}
        onResetPendingRecord={handleResetPending}
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

      {/* 5. Apply Leave Modal (for HR's own application) */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        currentUser={hrCurrentUser}
      />

      {/* 6. Leave Details Modal */}
      <LeaveDetailsModal
        isOpen={Boolean(activeSelectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={activeSelectedRecord}
        isHRView={true}
        currentUser={currentUser || hrCurrentUser}
        onApprove={handleApprove}
        onReject={(rec) => setRejectingRecord(rec)}
        onResetPending={handleResetPending}
      />

      {/* 7. Leave Reject Reason Modal */}
      <LeaveRejectModal
        isOpen={Boolean(rejectingRecord)}
        onClose={() => setRejectingRecord(null)}
        record={rejectingRecord}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}
