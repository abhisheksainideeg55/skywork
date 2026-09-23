import React from "react";
import {
  FiEye,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiSlash,
  FiRotateCcw,
  FiLock,
} from "react-icons/fi";
import WFHStatusBadge from "./WFHStatusBadge";
import { formatDateDisplay } from "../../Utils/wfhUtils";
import { isHRUser } from "../../Context/WFHContext";

export default function WFHTable({
  records = [],
  startIndex = 0,
  isHRView = false,
  currentUser,
  onViewRecord,
  onApproveRecord,
  onRejectRecord,
  onResetPendingRecord,
  onCancelRecord,
}) {
  const isSuperAdmin = currentUser?.role === "superadmin";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 text-center w-12">#</th>
              {isHRView && (
                <>
                  <th className="py-3.5 px-4 min-w-[180px]">Employee</th>
                  <th className="py-3.5 px-4 min-w-[95px]">Emp ID</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Department</th>
                </>
              )}
              <th className="py-3.5 px-4 min-w-[140px]">WFH Type</th>
              <th className="py-3.5 px-4 min-w-[110px]">Duration</th>
              <th className="py-3.5 px-4 min-w-[100px]">From Date</th>
              <th className="py-3.5 px-4 min-w-[100px]">To Date</th>
              <th className="py-3.5 px-4 min-w-[70px] text-center">Days</th>
              <th className="py-3.5 px-4 min-w-[180px]">Reason / Tasks</th>
              <th className="py-3.5 px-4 min-w-[100px]">Applied On</th>
              <th className="py-3.5 px-4 min-w-[100px]">Status</th>
              <th className="py-3.5 px-4 text-center min-w-[130px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={isHRView ? 13 : 10}
                  className="py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FiAlertCircle className="w-8 h-8 text-slate-400" />
                    <p className="font-semibold text-slate-700">No WFH requests found</p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search criteria or apply for a new request.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((item, index) => {
                const serialNum = startIndex + index + 1;
                const isPending = item.status === "Pending";
                const isApproved = item.status === "Approved";
                const isRejected = item.status === "Rejected";
                const isOwner = (currentUser?.employeeId === item.employeeId) || (currentUser?.id === item.employeeId);
                const targetIsHR = isHRUser(item);
                const isHR = currentUser?.role === "hr" || (currentUser?.role || "").toLowerCase().includes("hr") || (currentUser?.department || "").toLowerCase().includes("human resources") || (currentUser?.employeeId || "").toUpperCase().startsWith("HR");
                const canActOnRecord = isSuperAdmin || (isHR && !targetIsHR && !isOwner);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150 group"
                  >
                    {/* Serial # */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs">
                      {serialNum}
                    </td>

                    {/* Employee Profile (HR / Manager view only) */}
                    {isHRView && (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.avatar}
                              alt={item.employeeName}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div className="overflow-hidden">
                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                {item.employeeName}
                              </p>
                              <p className="text-xs text-slate-400 truncate">{item.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {item.employeeId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                          {item.department}
                        </td>
                      </>
                    )}

                    {/* WFH Type */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 text-xs">
                        {item.wfhType}
                      </span>
                    </td>

                    {/* Duration & Half Day Indicator */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-700">
                          {item.duration}
                        </span>
                        {item.halfDayType && (
                          <span className="text-[11px] text-indigo-600 font-semibold">
                            {item.halfDayType}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* From Date */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {formatDateDisplay(item.fromDate)}
                    </td>

                    {/* To Date */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {formatDateDisplay(item.toDate)}
                    </td>

                    {/* Total Days */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {item.totalDays} {item.totalDays === 1 ? "day" : "days"}
                      </span>
                    </td>

                    {/* Reason / Deliverables */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="text-xs text-slate-800 font-medium truncate" title={item.reason}>
                        {item.reason}
                      </p>
                      {item.deliverables && (
                        <p className="text-[11px] text-slate-400 italic truncate" title={`Tasks: ${item.deliverables}`}>
                          Tasks: {item.deliverables}
                        </p>
                      )}
                    </td>

                    {/* Applied On */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {formatDateDisplay(item.appliedOn)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <WFHStatusBadge status={item.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. View Details */}
                        <button
                          type="button"
                          onClick={() => onViewRecord && onViewRecord(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer"
                          title="View WFH Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        {/* 2. HR Actions - Check if target is HR and viewer is not Super Admin */}
                        {isHRView && !canActOnRecord && (
                          <span 
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md whitespace-nowrap cursor-not-allowed" 
                            title="HR WFH applications can only be Approved, Rejected, or Updated by Super Admin."
                          >
                            <FiLock className="w-3 h-3 text-purple-600 shrink-0" />
                            Super Admin Approval
                          </span>
                        )}

                        {/* 3. HR / Super Admin Controls for Pending WFH */}
                        {isHRView && canActOnRecord && isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApproveRecord && onApproveRecord(item)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                              title={isSuperAdmin ? "Super Admin Approve WFH" : "Approve WFH Request"}
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectRecord && onRejectRecord(item)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              title={isSuperAdmin ? "Super Admin Reject WFH" : "Reject WFH Request"}
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* 4. HR / Super Admin Controls for Approved WFH (Can Reject or Reset) */}
                        {isHRView && canActOnRecord && isApproved && (
                          <>
                            <button
                              type="button"
                              onClick={() => onRejectRecord && onRejectRecord(item)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              title="Change Status: Reject this Approved WFH"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                            {onResetPendingRecord && (
                              <button
                                type="button"
                                onClick={() => onResetPendingRecord(item)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors cursor-pointer"
                                title="Change Status: Reset to Pending"
                              >
                                <FiRotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}

                        {/* 5. HR / Super Admin Controls for Rejected WFH (Can Approve or Reset) */}
                        {isHRView && canActOnRecord && isRejected && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApproveRecord && onApproveRecord(item)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                              title="Change Status: Approve this Rejected WFH"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            {onResetPendingRecord && (
                              <button
                                type="button"
                                onClick={() => onResetPendingRecord(item)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors cursor-pointer"
                                title="Change Status: Reset to Pending"
                              >
                                <FiRotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}

                        {/* 6. HR / Super Admin Controls for Cancelled WFH (Can Approve) */}
                        {isHRView && canActOnRecord && item.status === "Cancelled" && (
                          <button
                            type="button"
                            onClick={() => onApproveRecord && onApproveRecord(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                            title="Change Status: Approve this Cancelled WFH"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* 7. Employee Cancel Request (Pending only) */}
                        {!isHRView && isPending && isOwner && (
                          <button
                            type="button"
                            onClick={() => onCancelRecord && onCancelRecord(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                            title="Cancel WFH Request"
                          >
                            <FiSlash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
