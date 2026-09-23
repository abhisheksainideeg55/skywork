import React, { useState, useEffect, useCallback } from "react";
import { FiLogIn, FiLogOut, FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight, FiRotateCcw } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAttendance } from "../../Context/AttendanceContext";
import { useAuth } from "../../Context/AuthContext";

export default function PunchInOutCard({ title = "Manual Attendance", showViewTimesheet = true }) {
  const { currentUser } = useAuth();
  const { getTodayStatus, markCheckIn, markCheckOut, resetAttendance } = useAttendance();

  const employeeId = currentUser?.id || "EMP001";
  const employeeName = currentUser?.name || "Abhishek Sharma";
  const department = currentUser?.department || "Engineering";
  const avatar = currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  const todayStatus = getTodayStatus(employeeId);
  const isPunchedIn = todayStatus.status === "checked_in";
  const isCompleted = todayStatus.status === "completed";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showToast, setShowToast] = useState("");

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (ms) => {
    if (!ms || ms < 0) return "0h 00m 00s";
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${hrs}h ${mins < 10 ? "0" : ""}${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const handlePunchIn = useCallback(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const res = markCheckIn({
      employeeId,
      employeeName,
      department,
      avatar,
      checkIn: timeStr,
      punchInIso: now.toISOString(),
      attendanceType: "Office",
      isWFH: "No",
      status: "Present",
      notes: "Manual Punch In",
    });

    if (res.success) {
      setShowToast(`✅ Punched In Successfully at ${timeStr}!`);
    } else {
      setShowToast(`⚠️ ${res.message}`);
    }
    setTimeout(() => setShowToast(""), 4000);
  }, [employeeId, employeeName, department, avatar, markCheckIn]);

  const handlePunchOut = useCallback(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const res = markCheckOut({
      employeeId,
      checkOut: timeStr,
      punchOutIso: now.toISOString(),
      notes: "Manual Punch Out",
    });

    if (res.success) {
      setShowToast(`✅ Punched Out! Total Worked: ${res.record?.workingHours || "Recorded"}`);
    } else {
      setShowToast(`⚠️ ${res.message}`);
    }
    setTimeout(() => setShowToast(""), 4000);
  }, [employeeId, markCheckOut]);

  const handleReset = useCallback(() => {
    resetAttendance(employeeId);
    setShowToast("🔄 Attendance reset for testing!");
    setTimeout(() => setShowToast(""), 3000);
  }, [employeeId, resetAttendance]);

  // Live timer calculation
  let liveWorkingTime = "--:--";
  if (isPunchedIn) {
    if (todayStatus.punchInIso) {
      const diff = currentTime - new Date(todayStatus.punchInIso);
      liveWorkingTime = formatDuration(diff);
    } else {
      liveWorkingTime = "Running...";
    }
  } else if (isCompleted) {
    liveWorkingTime = todayStatus.workedHours || "--";
  }

  const todayStr = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 animate-bounce whitespace-nowrap">
          <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-5 py-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
                <FiClock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">{title}</h3>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                    {employeeName} ({employeeId})
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200">{todayStr}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                  {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                </p>
                <div className="flex items-center gap-1 sm:justify-end mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${isPunchedIn ? "bg-emerald-400 animate-pulse" : isCompleted ? "bg-blue-400" : "bg-slate-400"}`} />
                  <span className="text-[10px] font-semibold text-indigo-200">
                    {isPunchedIn ? "On Duty" : isCompleted ? "Shift Ended" : "Not Punched In"}
                  </span>
                </div>
              </div>

              {/* Reset test button */}
              {(isPunchedIn || isCompleted) && (
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset attendance for testing"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                >
                  <FiRotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[10px]">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Time Info Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Punch In</p>
              <p className="text-xs sm:text-sm font-black text-emerald-800 font-mono">
                {todayStatus.checkIn || "--:--"}
              </p>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 text-center">
              <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mb-1">Punch Out</p>
              <p className="text-xs sm:text-sm font-black text-rose-800 font-mono">
                {todayStatus.checkOut || "--:--"}
              </p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200 text-center">
              <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                {isPunchedIn ? "Live Timer" : "Total Worked"}
              </p>
              <p className="text-xs sm:text-sm font-black text-indigo-800 font-mono">
                {liveWorkingTime}
              </p>
            </div>
          </div>

          {/* Punch Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePunchIn}
              disabled={isPunchedIn || isCompleted}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
                isPunchedIn || isCompleted
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white active:scale-95 shadow-emerald-200"
              }`}
            >
              <FiLogIn className="w-5 h-5" />
              <span>Punch In</span>
            </button>

            <button
              type="button"
              onClick={handlePunchOut}
              disabled={!isPunchedIn}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
                !isPunchedIn
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white active:scale-95 shadow-rose-200"
              }`}
            >
              <FiLogOut className="w-5 h-5" />
              <span>Punch Out</span>
            </button>
          </div>

          {/* Status info message & Timesheet link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
            {isPunchedIn && (
              <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-semibold">
                <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>You are currently on duty since {todayStatus.checkIn}. Live timer running.</span>
              </div>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 text-blue-700 text-[11px] font-semibold">
                <FiCheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Today's shift completed. Total: {todayStatus.workedHours || "Recorded"}. Recorded in timesheet.</span>
              </div>
            )}

            {!isPunchedIn && !isCompleted && (
              <div className="flex items-center gap-2 text-amber-700 text-[11px] font-semibold">
                <FiAlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>You haven't punched in today. Click "Punch In" to start your shift.</span>
              </div>
            )}

            {showViewTimesheet && (
              <Link
                to="/attendance"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline shrink-0"
              >
                <span>View My Timesheet</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
