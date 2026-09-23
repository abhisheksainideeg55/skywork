import React, { useState, useEffect } from "react";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import {
  HOLIDAY_TYPES,
  HOLIDAY_STATUSES,
  HOLIDAY_DURATIONS,
} from "../../../Data/holidayData";
import {
  getWeekdayName,
  isDuplicateHolidayDate,
} from "../../../Utils/holidayUtils";
import { useHoliday } from "../../../Context/HolidayContext";

export default function AddHolidayModal({
  isOpen,
  onClose,
  currentUser,
}) {
  const { holidays, addHoliday } = useHoliday();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("National Holiday");
  const [duration, setDuration] = useState("Full Day");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState("");

  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      // Default to next upcoming month date or today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const defaultDate = `${yyyy}-${mm}-${dd}`;

      setName("");
      setDate(defaultDate);
      setType("National Holiday");
      setDuration("Full Day");
      setDescription("");
      setStatus("Active");
      setErrorMsg("");
      setSuccessMsg("");
      setDuplicateWarning("");
    }
  }, [isOpen]);

  // Real-time automatic Day calculation
  const calculatedDay = date ? getWeekdayName(date) : "";

  // Check duplicate date on date change
  useEffect(() => {
    if (date && isDuplicateHolidayDate(holidays, date)) {
      const existing = holidays.find((h) => h.date === date);
      setDuplicateWarning(
        `A holiday already exists for this date (${existing?.name || "Existing Holiday"}).`
      );
    } else {
      setDuplicateWarning("");
    }
  }, [date, holidays]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Holiday name is required.");
      return;
    }
    if (!date) {
      setErrorMsg("Holiday date is required.");
      return;
    }
    if (!type) {
      setErrorMsg("Holiday type is required.");
      return;
    }

    if (isDuplicateHolidayDate(holidays, date)) {
      setErrorMsg("A holiday already exists for this date. Please pick a different date.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await addHoliday(
        {
          name,
          date,
          type,
          duration,
          description,
          status,
        },
        currentUser
      );

      if (!res?.success) {
        setErrorMsg(res?.error || "Failed to add holiday");
      } else {
        setSuccessMsg("✓ Holiday added successfully.");
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-holiday-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Company Calendar
            </span>
            <h2 id="add-holiday-title" className="text-xl font-bold text-slate-900">
              Add Holiday
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

        {duplicateWarning && !errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{duplicateWarning}</span>
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
          {/* Holiday Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Holiday Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Republic Day, Diwali, Foundation Day..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Date Picker & Automatic Day Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Holiday Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Day of Week (Auto-calculated)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700">
                <FiClock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{calculatedDay || "Select Date"}</span>
              </div>
            </div>
          </div>

          {/* Holiday Type & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Holiday Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                {HOLIDAY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Duration <span className="text-rose-500">*</span>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                {HOLIDAY_DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Holiday Status
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {HOLIDAY_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    status === s
                      ? s === "Active"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s === "Active" ? "bg-emerald-400" : "bg-slate-400"
                    }`}
                  />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Description / Notes{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background, celebration info or regional applicability..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
            />
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
              Add Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
