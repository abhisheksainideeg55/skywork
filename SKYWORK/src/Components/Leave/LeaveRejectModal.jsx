import React, { useState } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";

export default function LeaveRejectModal({
  isOpen,
  onClose,
  record,
  onConfirmReject,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !record) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 3) {
      setError("Please provide a valid reason for rejecting this leave request.");
      return;
    }
    setError("");
    onConfirmReject(record.id, reason.trim());
    setReason("");
    onClose();
  };

  const isPreviouslyApproved = record.status === "Approved";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <FiAlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">
              {isPreviouslyApproved ? "Reject Approved Leave" : "Reject Leave Request"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-rose-900">
            <p className="leading-relaxed">
              {isPreviouslyApproved ? (
                <>
                  You are modifying an <strong className="font-semibold text-rose-950">Approved Leave</strong> for{" "}
                  <strong>{record.employeeName}</strong>. Changing status to <strong>Rejected</strong> will restore{" "}
                  <strong>{record.totalDays} day(s)</strong> back to their leave balance quota.
                </>
              ) : (
                <>
                  You are rejecting the <strong>{record.leaveType}</strong> ({record.totalDays} days) requested by{" "}
                  <strong>{record.employeeName}</strong>.
                </>
              )}
            </p>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {error}
            </p>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Reason for Rejection <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Critical product release deadline, team coverage insufficient..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-200 cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
