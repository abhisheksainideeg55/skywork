import React from "react";
import {
  FiClock,
  FiCoffee,
  FiCalendar,
  FiAlertCircle,
  FiUser,
} from "react-icons/fi";
import BreakStatusBadge from "./BreakStatusBadge";
import { getBreakTypeColor } from "../../Utils/breakUtils";

export default function BreakLogsTable({ logs = [] }) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs mb-6">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FiAlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No break records found</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No employee break logs matched your filter or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Department & Shift</th>
              <th className="py-3.5 px-4">Break Type</th>
              <th className="py-3.5 px-4">Time Window</th>
              <th className="py-3.5 px-4">Duration / Allowed</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4">Notes & Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {logs.map((item) => {
              const colorToken = getBreakTypeColor(item.breakType);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Employee Info */}
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
                          {item.role}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Shift */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{item.department}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold">
                      {item.shiftType || "Day Shift"}
                    </div>
                  </td>

                  {/* Break Type Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colorToken.pill} border ${colorToken.border}`}
                    >
                      <span>{colorToken.icon}</span>
                      <span>{item.breakType}</span>
                    </span>
                  </td>

                  {/* Start / End Time */}
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                      <FiClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {item.startTime} → {item.endTime || "Active"}
                      </span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-baseline gap-1">
                      <strong
                        className={`font-bold ${
                          item.durationMinutes > item.allowedMinutes
                            ? "text-rose-600 font-black"
                            : "text-slate-800"
                        }`}
                      >
                        {item.durationMinutes} mins
                      </strong>
                      <span className="text-xs text-slate-400">
                        / {item.allowedMinutes} max
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <BreakStatusBadge status={item.status} />
                  </td>

                  {/* Remarks */}
                  <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                    {item.notes || "--"}
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
