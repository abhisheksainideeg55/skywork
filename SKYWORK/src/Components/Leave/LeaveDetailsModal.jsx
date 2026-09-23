import React from "react";
import {
  FiX,
  FiFileText,
  FiPaperclip,
  FiCheck,
  FiRotateCcw,
  FiSliders,
  FiLock,
} from "react-icons/fi";
import LeaveStatusBadge from "./LeaveStatusBadge";
import { formatDateDisplay } from "../../Utils/leaveUtils";
import { isHRUser } from "../../Context/LeaveContext";

export default function LeaveDetailsModal({
  isOpen,
  onClose,
  record,
  isHRView = false,
  currentUser,
  onApprove,
  onReject,
  onResetPending,
}) {
  if (!isOpen || !record) return null;

  const isPending = record.status === "Pending";
  const isApproved = record.status === "Approved";
  const isRejected = record.status === "Rejected";
  const targetIsHR = isHRUser(record);
  const isSuperAdmin = currentUser?.role === "superadmin";
  const isHR = currentUser?.role === "hr" || (currentUser?.role || "").toLowerCase().includes("hr") || (currentUser?.department || "").toLowerCase().includes("human resources") || (currentUser?.employeeId || "").toUpperCase().startsWith("HR");
  const isOwner = (currentUser?.employeeId === record.employeeId) || (currentUser?.id === record.employeeId);
  const canActOnRecord = isSuperAdmin || (isHR && !targetIsHR && !isOwner);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-details-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Leave Record • {record.id}
            </span>
            <h2 id="leave-details-title" className="text-xl font-bold text-slate-900">
              Leave Request Details
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

        {/* Employee Info */}
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <img
              src={
                record.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              }
              alt={record.employeeName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
            />
            <div className="overflow-hidden">
              <h4 className="font-bold text-slate-900 truncate">{record.employeeName}</h4>
              <p className="text-xs text-slate-500 truncate">{record.department} • {record.role || "Staff"}</p>
              <span className="inline-block mt-1 font-mono text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                {record.employeeId}
              </span>
            </div>
          </div>

          {/* Key Leave Parameters Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Leave Type</span>
              <span className="font-bold text-slate-800">{record.leaveType}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Duration</span>
              <span className="font-bold text-slate-800">
                {record.duration}
                {record.halfDayType ? ` (${record.halfDayType})` : ""}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">From Date</span>
              <span className="font-mono font-semibold text-slate-800">{formatDateDisplay(record.fromDate)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">To Date</span>
              <span className="font-mono font-semibold text-slate-800">{formatDateDisplay(record.toDate)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Total Days</span>
              <span className="font-mono font-bold text-indigo-700">
                {record.totalDays} {record.totalDays === 1 ? "Day" : "Days"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Applied Date</span>
              <span className="font-mono font-semibold text-slate-800">{formatDateDisplay(record.appliedOn)}</span>
            </div>
          </div>

          {/* Reason Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
              <FiFileText className="w-3.5 h-3.5" />
              Reason for Leave
            </span>
            <p className="text-slate-700 leading-relaxed italic">{record.reason || "No reason provided."}</p>
          </div>

          {/* Attachment Preview (if any) */}
          {record.attachment && (
            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-medium">
                <FiPaperclip className="w-4 h-4 text-indigo-600" />
                <span className="truncate max-w-[200px]">{record.attachment}</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600">Attached</span>
            </div>
          )}

          {/* Status & Review Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Current Status</span>
              <LeaveStatusBadge status={record.status} />
            </div>

            {record.approvedBy && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-600">
                <span>Reviewed By:</span>
                <span className="font-semibold text-slate-800">{record.approvedBy}</span>
              </div>
            )}

            {record.approvedOn && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Review Date:</span>
                <span className="font-mono font-semibold text-slate-800">{formatDateDisplay(record.approvedOn)}</span>
              </div>
            )}

            {record.rejectionReason && (
              <div className="pt-2 border-t border-rose-100 text-rose-700">
                <span className="font-bold block mb-0.5">Rejection Reason:</span>
                <p className="italic">{record.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* HR / Super Admin Status Change Controls */}
          {isHRView && (
            <>
              {!canActOnRecord ? (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center gap-2.5 text-xs text-purple-900 font-medium">
                  <FiLock className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>HR leave & half-day applications can only be approved, rejected, or updated by Super Admin.</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                      <FiSliders className="w-3.5 h-3.5 text-indigo-600" />
                      Change Leave Status
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {isSuperAdmin ? "Super Admin Authority" : "HR Action"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {/* 1. Approve Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onApprove && onApprove(record);
                        onClose();
                      }}
                      disabled={isApproved}
                      className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                        isApproved
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-200 cursor-pointer"
                      }`}
                      title={isApproved ? "Already Approved" : "Approve Leave Request"}
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>{isApproved ? "Approved" : "Approve"}</span>
                    </button>

                    {/* 2. Reject Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onReject && onReject(record);
                        onClose();
                      }}
                      disabled={isRejected}
                      className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                        isRejected
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-200 cursor-pointer"
                      }`}
                      title={isRejected ? "Already Rejected" : "Reject Leave Request"}
                    >
                      <FiX className="w-3.5 h-3.5" />
                      <span>{isRejected ? "Rejected" : "Reject"}</span>
                    </button>

                    {/* 3. Reset to Pending Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onResetPending && onResetPending(record);
                        onClose();
                      }}
                      disabled={isPending}
                      className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                        isPending
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs shadow-amber-200 cursor-pointer"
                      }`}
                      title={isPending ? "Already Pending" : "Reset to Pending"}
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" />
                      <span>{isPending ? "Pending" : "Reset"}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Close */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
