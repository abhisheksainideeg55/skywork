import React, { useState } from "react";
import { FiAlertTriangle, FiX, FiTrash2, FiCalendar } from "react-icons/fi";
import { formatDateFull } from "../../../Utils/holidayUtils";
import { useHoliday } from "../../../Context/HolidayContext";

export default function DeleteHolidayDialog({
  isOpen,
  onClose,
  holiday,
  currentUser,
}) {
  const { deleteHoliday } = useHoliday();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !holiday) return null;

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteHoliday(holiday.id || holiday.holidayId, currentUser);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-holiday-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header with Danger Icon */}
        <div className="flex items-start justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                Confirm Deletion
              </span>
              <h2 id="delete-holiday-title" className="text-lg font-bold text-slate-900">
                Delete Holiday?
              </h2>
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

        {/* Message & Holiday Details Card */}
        <div className="py-2 space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            Are you sure you want to permanently remove this holiday from the
            official company calendar?
          </p>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">{holiday.name}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <FiCalendar className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-mono font-semibold">
                {formatDateFull(holiday.date)} ({holiday.day || "Holiday"})
              </span>
            </div>
            <span className="inline-block text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
              {holiday.type} • {holiday.duration}
            </span>
          </div>

          <p className="text-xs text-rose-600 font-semibold">
            ⚠ This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs shadow-rose-200 transition-all cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete Holiday</span>
          </button>
        </div>
      </div>
    </div>
  );
}
