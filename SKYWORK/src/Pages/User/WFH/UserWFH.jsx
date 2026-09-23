import React, { useState, useMemo } from "react";
import { FiDownload } from "react-icons/fi";
import { useWFH } from "../../../Context/WFHContext";
import WFHLayoutTabs from "../../../Components/WFH/WFHLayoutTabs";
import WFHSummary from "../../../Components/WFH/WFHSummary";
import WFHFilters from "../../../Components/WFH/WFHFilters";
import WFHTable from "../../../Components/WFH/WFHTable";
import WFHPagination from "../../../Components/WFH/WFHPagination";
import ApplyWFHModal from "../../../Components/WFH/ApplyWFHModal";
import WFHDetailsModal from "../../../Components/WFH/WFHDetailsModal";

export default function UserWFH() {
  const { wfhRecords, cancelWFH } = useWFH();

  const currentUser = {
    employeeId: "EMP001",
    name: "Abhishek Sharma",
    employeeName: "Abhishek Sharma",
    department: "Engineering",
    role: "Senior Developer",
    email: "abhishek@skywork.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWFHType, setSelectedWFHType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filter only current user's records
  const myRecords = useMemo(() => {
    return wfhRecords.filter(
      (r) =>
        r.employeeId === currentUser.employeeId ||
        r.employeeName.includes("Abhishek")
    );
  }, [wfhRecords, currentUser.employeeId]);

  // Keep selected record in sync
  const activeSelectedRecord = useMemo(() => {
    if (!selectedRecord) return null;
    return wfhRecords.find((r) => r.id === selectedRecord.id) || selectedRecord;
  }, [wfhRecords, selectedRecord]);

  // Filtered records according to active filters
  const filteredRecords = useMemo(() => {
    return myRecords.filter((rec) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        rec.wfhType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.deliverables && rec.deliverables.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.fromDate.includes(searchTerm) ||
        rec.toDate.includes(searchTerm);

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

      return matchSearch && matchType && matchStatus && matchDuration && matchDate;
    });
  }, [myRecords, searchTerm, selectedWFHType, selectedStatus, selectedDuration, selectedDate]);

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
    setSelectedWFHType("All Types");
    setSelectedStatus("All Status");
    setSelectedDuration("All Durations");
    setSelectedDate("");
    setCurrentPage(1);
  };

  const handleCancelWFH = (rec) => {
    if (window.confirm(`Are you sure you want to cancel your WFH request for ${rec.fromDate}?`)) {
      cancelWFH(rec.id, currentUser.employeeId);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "WFH Type",
      "Duration",
      "From Date",
      "To Date",
      "Total Days",
      "Reason",
      "Deliverables",
      "Applied On",
      "Status",
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.wfhType}"`,
      r.duration,
      r.fromDate,
      r.toDate,
      r.totalDays,
      `"${r.reason.replace(/"/g, '""')}"`,
      `"${(r.deliverables || "").replace(/"/g, '""')}"`,
      r.appliedOn,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_wfh_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Role Layout Switcher Tabs */}
      <WFHLayoutTabs />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Employee Portal</span>
            <span>•</span>
            <span className="text-indigo-600">Work From Home</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            My WFH Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Apply for remote work days, track approval status, and manage your WFH history.
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

      {/* 1. Summary Cards */}
      <WFHSummary records={myRecords} isHRView={false} />

      {/* 2. Search & Filters Toolbar with + Apply WFH Button */}
      <WFHFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
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
        isHRView={false}
      />

      {/* 3. WFH Requests Table */}
      <WFHTable
        records={paginatedRecords}
        startIndex={startIndex}
        isHRView={false}
        currentUser={currentUser}
        onViewRecord={(rec) => setSelectedRecord(rec)}
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

      {/* 5. Apply WFH Modal */}
      <ApplyWFHModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        currentUser={currentUser}
      />

      {/* 6. Details Modal */}
      <WFHDetailsModal
        isOpen={Boolean(activeSelectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={activeSelectedRecord}
        isHRView={false}
      />
    </div>
  );
}
