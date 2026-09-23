import React, { useState, useEffect } from "react";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { useAttendance, calculateAttendanceHours } from "../../Context/AttendanceContext";

export default function ManualAttendanceModal({
  isOpen,
  onClose,
  currentUser = {
    employeeId: "EMP001",
    employeeName: "Abhishek Sharma",
    department: "Engineering",
    role: "Employee",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
}) {
  const { getTodayStatus, markCheckIn, markCheckOut, todayDateStr, todayDateRaw } = useAttendance();

  // Get current user's today attendance status
  const todayStatus = getTodayStatus(currentUser.employeeId);
  const isCheckedIn = todayStatus.status === "checked_in";
  const isCompleted = todayStatus.status === "completed";

  // Form State
  const [date, setDate] = useState(todayDateStr);
  const [checkInTime, setCheckInTime] = useState("09:30 AM");
  const [checkOutTime, setCheckOutTime] = useState("06:30 PM");
  const [attendanceType, setAttendanceType] = useState("Office");
  const [isWFH, setIsWFH] = useState("No");
  const [status, setStatus] = useState("Present");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSuccessMessage("");
      setDate(todayDateStr);

      const now = new Date();
      const currentFormattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (!isCheckedIn && !isCompleted) {
        setCheckInTime(currentFormattedTime || "09:30 AM");
        setCheckOutTime("--:--");
      } else if (isCheckedIn) {
        setCheckOutTime(currentFormattedTime || "06:30 PM");
      }
    }
  }, [isOpen, isCheckedIn, isCompleted, todayDateStr]);

  if (!isOpen) return null;

  // Live calculation preview during Check-Out
  const liveHoursPreview = isCheckedIn
    ? calculateAttendanceHours(todayStatus.checkIn, checkOutTime)
    : calculateAttendanceHours(checkInTime, checkOutTime !== "--:--" ? checkOutTime : null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isCheckedIn && !isCompleted) {
      // 1. Check-In Action
      if (!checkInTime || checkInTime === "--:--") {
        setErrorMessage("Please enter a valid Check-In time.");
        return;
      }

      const res = markCheckIn({
        employeeId: currentUser?.employeeId || currentUser?.id || "EMP001",
        employeeName: currentUser?.employeeName || currentUser?.name || "Employee",
        department: currentUser?.department || "Engineering",
        avatar: currentUser?.avatar,
        date,
        rawDate: todayDateRaw,
        checkIn: checkInTime,
        attendanceType,
        isWFH,
        status,
        notes,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } else if (isCheckedIn) {
      // 2. Check-Out Action
      if (!checkOutTime || checkOutTime === "--:--") {
        setErrorMessage("Please enter a valid Check-Out time.");
        return;
      }

      const res = markCheckOut({
        employeeId: currentUser?.employeeId || currentUser?.id || "EMP001",
        checkOut: checkOutTime,
        notes,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-attendance-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="manual-attendance-title" className="text-lg font-bold text-slate-900">
              {isCompleted
                ? "Today's Attendance Completed"
                : isCheckedIn
                ? "Manual Check-Out"
                : "Manual Attendance"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isCompleted
                ? "You have already marked check-in and check-out for today."
                : isCheckedIn
                ? "Mark your check-out time and log working hours for today."
                : "Enter check-in time and attendance parameters for today."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Logged-in User Information Card */}
        <div className="my-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.employeeName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs shrink-0"
          />
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm truncate">
                {currentUser.employeeName}
              </h3>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
                {currentUser.employeeId}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">
              {currentUser.department} • {currentUser.role || "Staff"}
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* If already completed today */}
        {isCompleted ? (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-2">
              <div className="inline-flex p-2.5 rounded-full bg-emerald-100 text-emerald-700">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-emerald-900 text-sm">Attendance Already Marked</h4>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                You checked in at <span className="font-bold">{todayStatus.checkIn}</span> and checked out at <span className="font-bold">{todayStatus.checkOut}</span>. Total hours worked: <span className="font-bold">{todayStatus.workedHours}</span>.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Check-In or Check-Out Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Date & Check-In */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={date}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-not-allowed"
                  />
                  <FiCalendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Check-In Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={isCheckedIn ? todayStatus.checkIn : checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    readOnly={isCheckedIn}
                    placeholder="e.g. 09:30 AM"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isCheckedIn
                        ? "bg-slate-100 border border-slate-200 text-slate-700 cursor-not-allowed"
                        : "bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    }`}
                  />
                  <FiClock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* 2. Check-Out Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Check-Out Time {isCheckedIn && <span className="text-indigo-600 font-bold">*</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={isCheckedIn ? checkOutTime : "--:--"}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  disabled={!isCheckedIn}
                  placeholder="e.g. 06:30 PM"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    !isCheckedIn
                      ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  }`}
                />
                <FiClock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {!isCheckedIn && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Check-out time will be enabled after initial check-in.
                </p>
              )}
            </div>

            {/* If Checked In: Show Hours Preview Calculation */}
            {isCheckedIn && (
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Worked</span>
                  <span className="font-bold text-slate-800">{liveHoursPreview.workedHours}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending</span>
                  <span className="font-bold text-slate-800">{liveHoursPreview.pendingHours}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Overtime</span>
                  <span className="font-bold text-emerald-600">{liveHoursPreview.overtime}</span>
                </div>
              </div>
            )}

            {/* 3. Attendance Type & Is WFH */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance Type
                </label>
                <select
                  value={attendanceType}
                  onChange={(e) => setAttendanceType(e.target.value)}
                  disabled={isCheckedIn}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="Office">Office</option>
                  <option value="Remote">Remote</option>
                  <option value="Client Site">Client Site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Is WFH
                </label>
                <select
                  value={isWFH}
                  onChange={(e) => setIsWFH(e.target.value)}
                  disabled={isCheckedIn}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isCheckedIn}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
            </div>

            {/* 4. Notes Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes / Remarks
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or reasons (e.g. Traffic delay, WFH project deliverable)..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer ${
                  isCheckedIn
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                }`}
              >
                {isCheckedIn ? "Save Check-Out" : "Save Attendance"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
