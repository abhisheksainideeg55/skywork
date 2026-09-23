import React from "react";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiSun,
  FiMoon,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import ShiftStatusBadge from "./ShiftStatusBadge";
import { formatDateDisplay, getShiftColorToken } from "../../Utils/shiftUtils";

export default function ShiftTable({
  allocations = [],
  isHR = false,
  onViewDetails,
  onEditShift,
  onDeleteShift,
}) {
  if (allocations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs mb-6">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FiAlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No shift records found</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No employee shift allocations matched your filter criteria or search query.
        </p>
      </div>
    );
  }

  const getShiftIcon = (type) => {
    switch (type) {
      case "Day Shift":
        return <FiSun className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case "Night Shift":
        return <FiMoon className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case "Rotational Shift":
        return <FiRefreshCw className="w-3.5 h-3.5 text-teal-500 shrink-0" />;
      default:
        return <FiClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Department & Role</th>
              <th className="py-3.5 px-4">Shift Type</th>
              <th className="py-3.5 px-4">Shift Timings</th>
              <th className="py-3.5 px-4">Effective Dates</th>
              <th className="py-3.5 px-4">Rotation Policy</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {allocations.map((item) => {
              const colorToken = getShiftColorToken(item.shiftType);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Employee */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.avatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                        }
                        alt={item.employeeName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.employeeName}</span>
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.employeeId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Role */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{item.department}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{item.role}</div>
                  </td>

                  {/* Shift Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colorToken.pill} border ${colorToken.border}`}
                    >
                      {getShiftIcon(item.shiftType)}
                      <span>{item.shiftType}</span>
                    </span>
                  </td>

                  {/* Timings */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.timings}</span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {formatDateDisplay(item.effectiveFrom, true)} →{" "}
                        {formatDateDisplay(item.effectiveTo, true)}
                      </span>
                    </div>
                  </td>

                  {/* Rotation Policy */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200">
                      {item.rotationCycle || "Fixed Schedule"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <ShiftStatusBadge status={item.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details (Available for ALL roles) */}
                      <button
                        onClick={() => onViewDetails(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Shift Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* HR ONLY Actions */}
                      {isHR ? (
                        <>
                          <button
                            onClick={() => onEditShift(item)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Shift Allocation (HR Only)"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteShift(item)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Unassign / Remove Shift (HR Only)"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
