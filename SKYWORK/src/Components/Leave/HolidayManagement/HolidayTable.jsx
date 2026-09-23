import React from "react";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
  FiCheck,
  FiX,
} from "react-icons/fi";
import HolidayStatusBadge from "./HolidayStatusBadge";
import {
  formatDateDisplay,
  getHolidayTypeColor,
} from "../../../Utils/holidayUtils";

export default function HolidayTable({
  holidays = [],
  startIndex = 0,
  isHR = false,
  onViewDetails,
  onEditHoliday,
  onDeleteHoliday,
  onToggleStatus,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 text-center w-12">#</th>
              <th className="py-3.5 px-4 min-w-[180px]">Holiday Name</th>
              <th className="py-3.5 px-4 min-w-[110px]">Date</th>
              <th className="py-3.5 px-4 min-w-[110px]">Day</th>
              <th className="py-3.5 px-4 min-w-[140px]">Holiday Type</th>
              <th className="py-3.5 px-4 min-w-[100px]">Duration</th>
              <th className="py-3.5 px-4 min-w-[200px]">Description</th>
              <th className="py-3.5 px-4 min-w-[100px]">Status</th>
              <th className="py-3.5 px-4 text-center min-w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {holidays.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FiAlertCircle className="w-8 h-8 text-slate-400" />
                    <p className="font-semibold text-slate-700">No holidays found</p>
                    <p className="text-xs text-slate-400">
                      {isHR
                        ? "Try changing your filters or add a new holiday to the company calendar."
                        : "No company holidays match your selected filters."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              holidays.map((item, index) => {
                const serialNum = startIndex + index + 1;
                const typeColor = getHolidayTypeColor(item.type);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150 group"
                  >
                    {/* Serial Number */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs">
                      {serialNum}
                    </td>

                    {/* Holiday Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.id || item.holidayId}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            By {item.createdByName || 'HR Admin'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-slate-700">
                      {formatDateDisplay(item.date)}
                    </td>

                    {/* Day of Week */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        {item.day || "Monday"}
                      </span>
                    </td>

                    {/* Holiday Type Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
                        <span>{item.type}</span>
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-700">
                        {item.duration}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <p
                        className="text-xs text-slate-600 truncate"
                        title={item.description}
                      >
                        {item.description || "Official holiday"}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <HolidayStatusBadge status={item.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* 1. View Details (All Roles) */}
                        <button
                          type="button"
                          onClick={() => onViewDetails && onViewDetails(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer"
                          title="View Holiday Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        {/* 2. HR Only: Edit Holiday */}
                        {isHR && onEditHoliday && (
                          <button
                            type="button"
                            onClick={() => onEditHoliday(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-colors cursor-pointer"
                            title="Edit Holiday"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* 3. HR Only: Toggle Status */}
                        {isHR && onToggleStatus && (
                          <button
                            type="button"
                            onClick={() => onToggleStatus(item.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              item.status === "Active"
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-100"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-100"
                            }`}
                            title={
                              item.status === "Active"
                                ? "Deactivate Holiday"
                                : "Activate Holiday"
                            }
                          >
                            {item.status === "Active" ? (
                              <FiX className="w-4 h-4" />
                            ) : (
                              <FiCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* 4. HR Only: Delete Holiday */}
                        {isHR && onDeleteHoliday && (
                          <button
                            type="button"
                            onClick={() => onDeleteHoliday(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                            title="Delete Holiday"
                          >
                            <FiTrash2 className="w-4 h-4" />
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
