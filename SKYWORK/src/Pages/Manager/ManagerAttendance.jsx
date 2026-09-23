import React, { useState, useMemo } from "react";
import { FiDownload, FiX } from "react-icons/fi";
import { useAttendance } from "../../Context/AttendanceContext";
import AttendanceSummary from "../HR/EmployeeAttendance/AttendanceSummary";
import AttendanceFilters from "../HR/EmployeeAttendance/AttendanceFilters";
import AttendanceTable from "../HR/EmployeeAttendance/AttendanceTable";
import AttendancePagination from "../HR/EmployeeAttendance/AttendancePagination";
import AttendanceLayoutTabs from "../../Components/Attendance/AttendanceLayoutTabs";
import ManualAttendanceModal from "../../Components/Attendance/ManualAttendanceModal";

export default function ManagerAttendance() {
  const { records, getTodayStatus } = useAttendance();

  const managerCurrentUser = {
    employeeId: "EMP-MGR01",
    employeeName: "Abhishek Sharma",
    department: "Engineering Management",
    role: "Engineering Lead / Manager",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Filter records based on active criteria
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.empId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All Departments" || rec.department === selectedDepartment;

      const matchesStatus =
        selectedStatus === "All Status" || rec.status === selectedStatus;

      const matchesDate =
        !selectedDate ||
        rec.rawDate === selectedDate ||
        rec.date === selectedDate;

      return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
    });
  }, [records, searchTerm, selectedDepartment, selectedStatus, selectedDate]);

  // Recalculate pagination slices
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + rowsPerPage);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("All Departments");
    setSelectedStatus("All Status");
    setSelectedDate("");
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  // Export records as CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Employee",
      "EmpID",
      "Department",
      "Date",
      "CheckIn",
      "CheckOut",
      "Worked",
      "Pending",
      "Overtime",
      "IsWFH",
      "Status",
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.name}"`,
      r.empId,
      r.department,
      r.date,
      r.checkIn,
      r.checkOut,
      `"${r.workedHours || r.workingHours || "--"}"`,
      `"${r.pendingHours || "0h 00m"}"`,
      r.overtime || "-",
      r.isWFH || "No",
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `manager_attendance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Role Layout Tabs */}
      <AttendanceLayoutTabs />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Manager Portal</span>
            <span>•</span>
            <span className="text-indigo-600">Attendance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Team & Employee Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time clock-in/out logs, working hours, leaves, and overtime for your staff.
          </p>
        </div>

        {/* Action Buttons */}
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
      <AttendanceSummary records={records} />

      {/* 2. Search & Filter Bar with Single Manual Attendance Button */}
      <AttendanceFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={handleDepartmentChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onResetFilters={handleResetFilters}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        userTodayStatus={getTodayStatus(managerCurrentUser.employeeId)}
        totalResults={filteredRecords.length}
      />

      {/* 3. Attendance Table */}
      <AttendanceTable
        records={paginatedRecords}
        startIndex={startIndex}
        onViewRecord={(rec) => setSelectedRecord(rec)}
      />

      {/* 4. Pagination */}
      <AttendancePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalEntries={filteredRecords.length}
        rowsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* 5. Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        currentUser={managerCurrentUser}
      />

      {/* View Record Details Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Attendance Details</h3>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img
                  src={selectedRecord.avatar}
                  alt={selectedRecord.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{selectedRecord.name}</h4>
                  <p className="text-xs text-slate-500">{selectedRecord.email}</p>
                  <span className="inline-block mt-1 font-mono text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    {selectedRecord.empId}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Department</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.department}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Attendance Date</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.date}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Check In Time</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedRecord.checkIn}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Check Out Time</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedRecord.checkOut}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Total Worked</span>
                  <span className="font-semibold text-emerald-600">{selectedRecord.workedHours || selectedRecord.workingHours || "--"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Pending Time</span>
                  <span className="font-semibold text-amber-600">{selectedRecord.pendingHours || "0h 00m"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Overtime</span>
                  <span className="font-semibold text-indigo-600">{selectedRecord.overtime || "-"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Is WFH</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.isWFH || "No"}</span>
                </div>
              </div>

              {selectedRecord.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-400 block mb-1">Notes / Remarks</span>
                  <p className="text-slate-700 italic">{selectedRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
