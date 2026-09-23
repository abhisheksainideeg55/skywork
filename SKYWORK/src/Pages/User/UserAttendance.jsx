import React, { useState, useEffect, useMemo } from "react";
import {
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAward,
  FiSearch,
  FiDownload,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiLogIn,
  FiLogOut,
  FiPlus,
} from "react-icons/fi";
import { useAttendance } from "../../Context/AttendanceContext";
import { useAuth } from "../../Context/AuthContext";
import AttendanceLayoutTabs from "../../Components/Attendance/AttendanceLayoutTabs";
import ManualAttendanceModal from "../../Components/Attendance/ManualAttendanceModal";
import PunchInOutCard from "../../Components/Attendance/PunchInOutCard";
import SmartAttendanceWidget from "../../Components/SmartAttendance/SmartAttendanceWidget";

export default function UserAttendance() {
  const { records, getTodayStatus } = useAttendance();
  const { currentUser: authUser } = useAuth();

  const userCurrentUser = useMemo(() => ({
    employeeId: authUser?.id || "EMP001",
    employeeName: authUser?.name || "Abhishek Sharma",
    department: authUser?.department || "Engineering",
    role: authUser?.role || "Senior Developer",
    avatar: authUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  }), [authUser]);

  const userTodayStatus = getTodayStatus(userCurrentUser.employeeId);
  const isCheckedIn = userTodayStatus?.status === "checked_in";
  const isCompleted = userTodayStatus?.status === "completed";

  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const rowsPerPage = 10;

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter logs for this employee
  const myRecords = useMemo(() => {
    const empId = userCurrentUser.employeeId;
    const name = userCurrentUser.employeeName.toLowerCase();
    return records.filter(
      (r) =>
        r.empId === empId ||
        (empId === "EMP001" && (r.empId === "EMP001" || r.name?.toLowerCase().includes("abhishek") || r.name?.toLowerCase().includes("rahul"))) ||
        r.name?.toLowerCase().includes(name)
    );
  }, [records, userCurrentUser]);

  const filteredLogs = useMemo(() => {
    return myRecords.filter((log) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        log.date.includes(searchTerm) ||
        (log.day && log.day.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        selectedStatus === "All Status" || log.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [myRecords, searchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + rowsPerPage);

  const renderBadge = (status) => {
    switch (status) {
      case "Present":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Present
          </span>
        );
      case "Late":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Late
          </span>
        );
      case "Half Day":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Half Day
          </span>
        );
      case "Leave":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Role Layout Tabs */}
      <AttendanceLayoutTabs />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Employee Portal</span>
            <span>•</span>
            <span className="text-indigo-600">My Attendance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            My Attendance Timesheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track your daily punch-in times, shift hours, overtime, and monthly attendance history.
          </p>
        </div>
      </div>

      {/* Smart Attendance Live Status Widget */}
      <SmartAttendanceWidget />

      {/* Interactive Punch In / Punch Out Card */}
      <PunchInOutCard title="My Daily Punch Attendance" showViewTimesheet={false} />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Present Days</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><FiCheckCircle className="w-5 h-5" /></div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">22 / 24 Days</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">91.6% monthly attendance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Hours</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><FiClock className="w-5 h-5" /></div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">178h 45m</div>
          <p className="text-xs text-indigo-600 font-medium mt-1">Avg 9.1h / working day</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Overtime Logged</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><FiAward className="w-5 h-5" /></div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">6h 30m</div>
          <p className="text-xs text-slate-500 font-medium mt-1">Approved for payroll bonus</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Leave Balance</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600"><FiCalendar className="w-5 h-5" /></div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">14 Days Left</div>
          <p className="text-xs text-sky-600 font-medium mt-1">6 Casual • 8 Sick leaves</p>
        </div>
      </div>

      {/* Toolbar with Search, Filter & ONLY 1 Single Manual Attendance Button */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search records by date..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {["All Status", "Present", "Late", "Half Day", "Leave"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* The ONLY Manual Attendance Button on this page */}
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0 ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                : isCheckedIn
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200"
            }`}
          >
            {isCompleted ? (
              <>
                <FiCheckCircle className="w-4 h-4" />
                <span>Completed ✓</span>
              </>
            ) : isCheckedIn ? (
              <>
                <FiLogOut className="w-4 h-4" />
                <span>Check Out ({userTodayStatus.checkIn})</span>
              </>
            ) : (
              <>
                <FiPlus className="w-4 h-4" />
                <span>Manual Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Personal Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4 min-w-[110px]">Attendance Date</th>
                <th className="py-3.5 px-4 min-w-[95px]">Check In</th>
                <th className="py-3.5 px-4 min-w-[95px]">Check Out</th>
                <th className="py-3.5 px-4 min-w-[85px]">Worked</th>
                <th className="py-3.5 px-4 min-w-[85px]">Pending</th>
                <th className="py-3.5 px-4 min-w-[80px]">Overtime</th>
                <th className="py-3.5 px-4 min-w-[75px] text-center">Is WFH</th>
                <th className="py-3.5 px-4 min-w-[95px]">Status</th>
                <th className="py-3.5 px-4 min-w-[140px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedLogs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-400">
                    {startIndex + idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs sm:text-sm">
                    {log.date}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700 font-semibold">{log.checkIn}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700">{log.checkOut}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">{log.workedHours || log.workingHours || "--"}</td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-500">{log.pendingHours || "0h 00m"}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{log.overtime || "-"}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${log.isWFH === "Yes" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "text-slate-400"}`}>
                      {log.isWFH || "No"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{renderBadge(log.status)}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 truncate max-w-[180px]">{log.notes || "Regular shift"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between text-xs sm:text-sm text-slate-600">
        <div>
          Showing <span className="font-semibold text-slate-800">{Math.min(startIndex + 1, filteredLogs.length)}–{Math.min(startIndex + rowsPerPage, filteredLogs.length)}</span> of{" "}
          <span className="font-semibold text-slate-800">{filteredLogs.length}</span> records
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-2 font-semibold text-slate-700 text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        currentUser={userCurrentUser}
      />
    </div>
  );
}
