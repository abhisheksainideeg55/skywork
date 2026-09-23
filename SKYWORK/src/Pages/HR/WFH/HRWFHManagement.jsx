import React, { useState, useMemo } from "react";
import { FiDownload } from "react-icons/fi";
import { useWFH } from "../../../Context/WFHContext";
import { useAuth } from "../../../Context/AuthContext";
import WFHLayoutTabs from "../../../Components/WFH/WFHLayoutTabs";
import WFHSummary from "../../../Components/WFH/WFHSummary";
import WFHFilters from "../../../Components/WFH/WFHFilters";
import WFHTable from "../../../Components/WFH/WFHTable";
import WFHPagination from "../../../Components/WFH/WFHPagination";
import ApplyWFHModal from "../../../Components/WFH/ApplyWFHModal";
import WFHDetailsModal from "../../../Components/WFH/WFHDetailsModal";
import WFHRejectModal from "../../../Components/WFH/WFHRejectModal";

export default function HRWFHManagement() {
  const { currentUser } = useAuth();
  const {
    wfhRecords,
    approveWFH,
    rejectWFH,
    resetWFHToPending,
    cancelWFH,
  } = useWFH();

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

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedWFHType, setSelectedWFHType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejectingRecord, setRejectingRecord] = useState(null);

  // Keep selected record in sync with state updates
  const activeSelectedRecord = useMemo(() => {
    if (!selectedRecord) return null;
    return wfhRecords.find((r) => r.id === selectedRecord.id) || selectedRecord;
  }, [wfhRecords, selectedRecord]);

  // Filtered records according to active filters
  const filteredRecords = useMemo(() => {
    return wfhRecords.filter((rec) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.wfhType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.deliverables && rec.deliverables.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept =
        selectedDepartment === "All Departments" || rec.department === selectedDepartment;

      const matchType =
        selectedWFHType === "All Types" || rec.wfhType === selectedWFHType;

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
    wfhRecords,
    searchTerm,
    selectedDepartment,
    selectedWFHType,
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
    setSelectedWFHType("All Types");
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
        ? `Change status to APPROVED for ${rec.employeeName} (${rec.wfhType}, ${rec.totalDays} days)?`
        : rec.status === "Cancelled"
        ? `Re-approve cancelled WFH for ${rec.employeeName}?`
        : `Approve ${rec.wfhType} (${rec.totalDays} days) for ${rec.employeeName}?`;

    if (window.confirm(promptMsg)) {
      const res = approveWFH(rec.id, approverName, actorRole);
      if (res && !res.success) {
        alert(res.error);
      }
    }
  };

  const handleConfirmReject = (wfhId, reason) => {
    const rejectorName = actorRole === "superadmin"
      ? `${currentUser?.name || "Super Admin"} (Super Admin)`
      : `${hrCurrentUser.name} (HR Admin)`;
    const res = rejectWFH(wfhId, reason, rejectorName, actorRole);
    if (res && !res.success) {
      alert(res.error);
    }
  };

  const handleResetPending = (rec) => {
    if (window.confirm(`Reset WFH request for ${rec.employeeName} back to Pending status?`)) {
      const res = resetWFHToPending(rec.id, actorRole);
      if (res && !res.success) {
        alert(res.error);
      }
    }
  };

  const handleCancelWFH = (rec) => {
    if (window.confirm(`Are you sure you want to cancel your ${rec.wfhType} request for ${rec.fromDate}?`)) {
      cancelWFH(rec.id, hrCurrentUser.employeeId);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Employee",
      "Emp ID",
      "Department",
      "WFH Type",
      "Duration",
      "From Date",
      "To Date",
      "Total Days",
      "Reason",
      "Deliverables",
      "Applied On",
      "Status",
      "Approved By",
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.employeeName}"`,
      r.employeeId,
      r.department,
      `"${r.wfhType}"`,
      r.duration,
      r.fromDate,
      r.toDate,
      r.totalDays,
      `"${r.reason.replace(/"/g, '""')}"`,
      `"${(r.deliverables || "").replace(/"/g, '""')}"`,
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
    link.setAttribute("download", `all_employee_wfh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Role Layout Tabs */}
      <WFHLayoutTabs />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>HR Management</span>
            <span>•</span>
            <span className="text-indigo-600">WFH Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Work From Home Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review company remote work applications, manage approvals, and apply for your own WFH.
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

      {/* 1. Overview KPI Summary Cards */}
      <WFHSummary records={wfhRecords} isHRView={true} />

      {/* 2. Search & Filters Toolbar with + Apply WFH Button */}
      <WFHFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={(dept) => {
          setSelectedDepartment(dept);
          setCurrentPage(1);
        }}
        selectedWFHType={selectedWFHType}
        onWFHTypeChange={(type) => {
          setSelectedWFHType(type);
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

      {/* 3. WFH Requests Table */}
      <WFHTable
        records={paginatedRecords}
        startIndex={startIndex}
        isHRView={true}
        currentUser={hrCurrentUser}
        onViewRecord={(rec) => setSelectedRecord(rec)}
        onApproveRecord={handleApprove}
        onRejectRecord={(rec) => setRejectingRecord(rec)}
        onResetPendingRecord={handleResetPending}
        onCancelRecord={handleCancelWFH}
      />

      {/* 4. Pagination */}
      <WFHPagination
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

      {/* 5. Apply WFH Modal (for HR's own application) */}
      <ApplyWFHModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        currentUser={hrCurrentUser}
      />

      {/* 6. WFH Details Modal */}
      <WFHDetailsModal
        isOpen={Boolean(activeSelectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={activeSelectedRecord}
        isHRView={true}
        currentUser={currentUser || hrCurrentUser}
        onApprove={handleApprove}
        onReject={(rec) => setRejectingRecord(rec)}
        onResetPending={handleResetPending}
      />

      {/* 7. WFH Reject Reason Modal */}
      <WFHRejectModal
        isOpen={Boolean(rejectingRecord)}
        onClose={() => setRejectingRecord(null)}
        record={rejectingRecord}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}
