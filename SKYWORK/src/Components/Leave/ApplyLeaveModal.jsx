import React, { useState, useEffect } from "react";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiPaperclip,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { LEAVE_TYPES } from "../../Data/leaveData";
import { calculateLeaveDays } from "../../Utils/leaveUtils";
import { useLeave } from "../../Context/LeaveContext";

export default function ApplyLeaveModal({
  isOpen,
  onClose,
  currentUser,
}) {
  const { applyLeave, getUserLeaveBalance } = useLeave();

  const userBalances = getUserLeaveBalance(currentUser?.employeeId || "EMP001");

  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [duration, setDuration] = useState("Full Day"); // "Full Day" | "Half Day"
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [halfDayType, setHalfDayType] = useState("First Half");
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Default dates to tomorrow or today
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const dd = String(tomorrow.getDate()).padStart(2, "0");
      const defDate = `${yyyy}-${mm}-${dd}`;

      setFromDate(defDate);
      setToDate(defDate);
      setLeaveType("Casual Leave");
      setDuration("Full Day");
      setHalfDayType("First Half");
      setReason("");
      setAttachment(null);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-calculated days
  const calculatedDays =
    duration === "Half Day"
      ? 0.5
      : calculateLeaveDays(fromDate, toDate, duration);

  const availableBalance = userBalances[leaveType] !== undefined ? userBalances[leaveType] : 0;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const res = await applyLeave({
      employeeId: currentUser?.employeeId || "EMP001",
      employeeName: currentUser?.name || currentUser?.employeeName || "Employee",
      department: currentUser?.department || "Engineering",
      role: currentUser?.role || "Staff",
      email: currentUser?.email || "employee@skywork.io",
      avatar: currentUser?.avatar,
      leaveType,
      duration,
      fromDate,
      toDate: duration === "Half Day" ? fromDate : toDate,
      halfDayType: duration === "Half Day" ? halfDayType : null,
      reason,
      attachment,
    });

    if (!res.success) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("✓ Leave application submitted successfully.");
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-leave-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              New Request
            </span>
            <h2 id="apply-leave-title" className="text-xl font-bold text-slate-900">
              Apply for Leave
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Read-Only Auto-Populated User Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div>
                <p className="font-bold text-slate-900">{currentUser?.name || currentUser?.employeeName || "Abhishek Sharma"}</p>
                <p className="text-slate-500 font-medium">{currentUser?.department || "Engineering"}</p>
              </div>
            </div>
            <span className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {currentUser?.employeeId || "EMP001"}
            </span>
          </div>

          {/* Leave Type & Available Balance */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Leave Type</label>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Available: {availableBalance} {availableBalance === 1 ? "day" : "days"}
              </span>
            </div>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t} ({userBalances[t] ?? 0} days remaining)
                </option>
              ))}
            </select>
          </div>

          {/* Duration Toggle (Full Day / Half Day) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Leave Duration</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDuration("Full Day")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  duration === "Full Day"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <FiCalendar className="w-3.5 h-3.5" />
                <span>Full Day</span>
              </button>
              <button
                type="button"
                onClick={() => setDuration("Half Day")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  duration === "Half Day"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <FiClock className="w-3.5 h-3.5" />
                <span>Half Day</span>
              </button>
            </div>
          </div>

          {/* Date Range Inputs */}
          {duration === "Full Day" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">From Date</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    if (toDate && new Date(e.target.value) > new Date(toDate)) {
                      setToDate(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">To Date</label>
                <input
                  type="date"
                  required
                  min={fromDate}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Leave Date</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Half Day Type</label>
                <select
                  value={halfDayType}
                  onChange={(e) => setHalfDayType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="First Half">First Half (09:00 AM – 01:30 PM)</option>
                  <option value="Second Half">Second Half (01:30 PM – 06:00 PM)</option>
                </select>
              </div>
            </div>
          )}

          {/* Auto Calculated Days Banner */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <FiInfo className="w-4 h-4 text-indigo-600" />
              Calculated Total Days:
            </span>
            <span className="font-bold font-mono text-sm text-indigo-700">
              {calculatedDays} {calculatedDays === 1 ? "Day" : "Days"}
            </span>
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Reason for Leave <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context or explanation for taking time off..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Attachment (Optional) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Supporting Document <span className="text-slate-400 font-normal">(Optional - PDF, JPG, PNG)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(successMsg)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-200 transition-all cursor-pointer"
            >
              Submit Leave Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
