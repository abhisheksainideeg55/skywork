import React from "react";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiFileText,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiCheckCircle,
} from "react-icons/fi";
import HolidayStatusBadge from "./HolidayStatusBadge";
import {
  formatDateFull,
  getHolidayTypeColor,
} from "../../../Utils/holidayUtils";

export default function HolidayDetailsModal({
  isOpen,
  onClose,
  holiday,
  isHR = false,
  onEdit,
  onDelete,
}) {
  if (!isOpen || !holiday) return null;

  const typeColor = getHolidayTypeColor(holiday.type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="holiday-details-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Company Calendar • {holiday.id}
            </span>
            <h2 id="holiday-details-title" className="text-xl font-bold text-slate-900">
              Holiday Details
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

        {/* Content Body */}
        <div className="py-4 space-y-4">
          {/* Main Title & Type Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${typeColor.dot}`} />
                <span>{holiday.type}</span>
              </span>

              <HolidayStatusBadge status={holiday.status} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">{holiday.name}</h3>

            <p className="text-xs text-slate-600 leading-relaxed italic">
              {holiday.description || "Official company holiday observance."}
            </p>
          </div>

          {/* Key Parameters Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                Date
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {formatDateFull(holiday.date)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-slate-400" />
                Day of Week
              </span>
              <span className="font-bold text-slate-800 text-sm">
                {holiday.day || "Monday"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
                <FiTag className="w-3.5 h-3.5 text-slate-400" />
                Duration
              </span>
              <span className="font-bold text-slate-800">{holiday.duration}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5 text-slate-400" />
                Holiday ID
              </span>
              <span className="font-mono font-bold text-indigo-600">
                {holiday.id}
              </span>
            </div>
          </div>

          {/* Audit / Metadata (For HR & authorized personnel) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5 text-slate-400" />
                Created By:
              </span>
              <span className="font-semibold text-slate-800">
                {holiday.createdByName || holiday.createdBy || "HR Administrator"}
              </span>
            </div>

            {holiday.createdAt && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Created Date:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {holiday.createdAt}
                </span>
              </div>
            )}

            {holiday.updatedAt && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Last Updated:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {holiday.updatedAt}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* HR Management Actions */}
          {isHR ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onEdit && onEdit(holiday);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs transition-colors cursor-pointer border border-amber-200"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete && onDelete(holiday);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer border border-rose-200"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
