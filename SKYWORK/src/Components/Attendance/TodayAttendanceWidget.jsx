import React from "react";
import {
  FiPlus,
  FiLogIn,
  FiLogOut,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiUserCheck,
} from "react-icons/fi";
import { useAttendance } from "../../Context/AttendanceContext";

export default function TodayAttendanceWidget({
  currentUser,
  onOpenModal,
}) {
  const { getTodayStatus, todayDateStr } = useAttendance();
  const todayStatus = getTodayStatus(currentUser.employeeId);

  const isNotCheckedIn = !todayStatus || todayStatus.status === "not_checked_in";
  const isCheckedIn = todayStatus?.status === "checked_in";
  const isCompleted = todayStatus?.status === "completed";

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Status Info */}
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isCompleted
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
              : isCheckedIn
              ? "bg-amber-50 text-amber-600 border border-amber-200/60"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {isCompleted ? (
            <FiCheckCircle className="w-6 h-6" />
          ) : isCheckedIn ? (
            <FiClock className="w-6 h-6 animate-pulse" />
          ) : (
            <FiUserCheck className="w-6 h-6" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Today's Attendance • {todayDateStr}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-sm font-bold text-slate-900">
              {currentUser.employeeName} ({currentUser.employeeId})
            </span>
            <span className="text-slate-300">•</span>
            {isNotCheckedIn && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Not Checked In
              </span>
            )}
            {isCheckedIn && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Checked In at {todayStatus.checkIn}
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Completed ({todayStatus.checkIn} – {todayStatus.checkOut} • {todayStatus.workedHours})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0 w-full sm:w-auto">
        {isNotCheckedIn && (
          <button
            type="button"
            onClick={onOpenModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>+ Manual Attendance</span>
          </button>
        )}

        {isCheckedIn && (
          <button
            type="button"
            onClick={onOpenModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Check Out ({todayStatus.checkIn})</span>
          </button>
        )}

        {isCompleted && (
          <button
            type="button"
            onClick={onOpenModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200 transition-all cursor-pointer"
          >
            <FiCheckCircle className="w-4 h-4 text-emerald-600" />
            <span>View Summary</span>
          </button>
        )}
      </div>
    </div>
  );
}
