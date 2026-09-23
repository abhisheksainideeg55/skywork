import React, { useState } from "react";
import {
  FiX,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiPhone,
  FiHome,
} from "react-icons/fi";
import { WFH_TYPES, WFH_DURATIONS, HALF_DAY_PERIODS } from "../../Data/wfhData";
import { calculateWFHDays, formatDateDisplay } from "../../Utils/wfhUtils";
import { useWFH } from "../../Context/WFHContext";

export default function ApplyWFHModal({ isOpen, onClose, currentUser }) {
  const { applyWFH } = useWFH();

  const todayISO = new Date().toISOString().slice(0, 10);

  const [wfhType, setWfhType] = useState("Regular Remote Work");
  const [duration, setDuration] = useState("Full Day");
  const [halfDayType, setHalfDayType] = useState("First Half (Morning)");
  const [fromDate, setFromDate] = useState(todayISO);
  const [toDate, setToDate] = useState(todayISO);
  const [reason, setReason] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [contactNumber, setContactNumber] = useState("+91 98765 43210");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalCalculatedDays = calculateWFHDays(
    fromDate,
    duration === "Half Day" ? fromDate : toDate,
    duration
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!currentUser) {
      setError("No logged in user detected.");
      return;
    }

    if (!reason || reason.trim().length < 5) {
      setError("Please provide a valid reason for Work From Home (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);

    const res = await applyWFH({
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name || currentUser.employeeName,
      department: currentUser.department,
      role: currentUser.role || "Employee",
      email: currentUser.email,
      avatar: currentUser.avatar,
      wfhType,
      duration,
      fromDate,
      toDate: duration === "Half Day" ? fromDate : toDate,
      halfDayType: duration === "Half Day" ? halfDayType : null,
      reason: reason.trim(),
      deliverables: deliverables.trim(),
      contactNumber: contactNumber.trim(),
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error);
    } else {
      setSuccessMsg("Work From Home application submitted successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setReason("");
        setDeliverables("");
        onClose();
      }, 900);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FiHome className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Apply for Work From Home
              </h2>
              <p className="text-xs text-slate-500">
                Submit remote work request for HR / Manager approval
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Preview */}
        <div className="py-3 px-3.5 mt-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
          />
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                {currentUser?.name || currentUser?.employeeName}
              </h4>
              <span className="font-mono text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                {currentUser?.employeeId}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {currentUser?.department} • {currentUser?.role || "Employee"}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* WFH Type & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                WFH Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={wfhType}
                onChange={(e) => setWfhType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                {WFH_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Duration <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WFH_DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      duration === dur
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Half Day Selection (If applicable) */}
          {duration === "Half Day" && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Half Day Period <span className="text-rose-500">*</span>
              </label>
              <select
                value={halfDayType}
                onChange={(e) => setHalfDayType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                {HALF_DAY_PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                From Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (duration === "Half Day" || new Date(toDate) < new Date(e.target.value)) {
                    setToDate(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {duration === "Full Day" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  To Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={fromDate}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            )}
          </div>

          {/* Days Summary Banner */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Calculated WFH Period:</span>
            <span className="font-bold font-mono text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
              {totalCalculatedDays} {totalCalculatedDays === 1 ? "Working Day" : "Working Days"}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reason for Remote Work <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Deep focus day on feature sprint, home maintenance, doctor consultation..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Deliverables / Planned Tasks */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Planned Tasks & Deliverables <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="e.g. Complete sprint PR #412, attend 3pm sync, available on Slack"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Contact / Phone */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reachable Contact Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit WFH Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
