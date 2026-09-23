import React, { useState } from "react";
import {
  FiX,
  FiCoffee,
  FiClock,
  FiBell,
  FiAlertCircle,
  FiShield,
  FiMapPin,
} from "react-icons/fi";
import { BREAK_TYPES } from "../../Data/breakData";

export default function AddBreakPolicyModal({
  isOpen,
  onClose,
  onAdd,
  currentUser,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Lunch Break");
  const [shiftType, setShiftType] = useState("Day Shift");
  const [startTime, setStartTime] = useState("13:00");
  const [endTime, setEndTime] = useState("14:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [location, setLocation] = useState("Main Cafeteria");
  const [allowance, setAllowance] = useState("Subsidized Meal Buffet");
  const [alarmSound, setAlarmSound] = useState("chime");
  const [isMandatory, setIsMandatory] = useState(true);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a break schedule name.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Please specify both start time and end time.");
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      shiftType,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes) || 30,
      location,
      allowance,
      alarmSound,
      isMandatory,
      description: description.trim() || `${name} scheduled for ${shiftType}.`,
      createdBy: currentUser?.employeeId || "EMP-HR01",
      createdByName: currentUser?.name || currentUser?.employeeName || "HR Administrator",
    };

    try {
      setIsSubmitting(true);
      const res = await onAdd(payload, currentUser);
      if (res?.success) {
        onClose();
        setName("");
        setDescription("");
      } else if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message || "Failed to add break policy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <FiCoffee className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Add Break Policy Schedule</h3>
              <p className="text-xs text-purple-100">
                Configure official company break times & alarm chime (HR Control)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Break Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Break Schedule Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Afternoon Lunch Break, Morning Green Tea..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type & Shift Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Break Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {BREAK_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Applicable Shift
              </label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Day Shift">☀️ Day Shift</option>
                <option value="Night Shift">🌙 Night Shift</option>
                <option value="Rotational Shift">🔄 Rotational Shift</option>
                <option value="All Shifts">🏢 All Shifts</option>
              </select>
            </div>
          </div>

          {/* Timings & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Location & Allowance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Designated Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 2nd Floor Dining Hall"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Perks & Refreshment
              </label>
              <input
                type="text"
                value={allowance}
                onChange={(e) => setAllowance(e.target.value)}
                placeholder="e.g. Free Coffee & Snacks"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Alarm Chime Sound Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Alarm Sound Chime Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "chime", label: "🎵 Gentle Chime" },
                { id: "bell", label: "🔔 Gong Bell" },
                { id: "digital", label: "⚡ Digital Pulse" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setAlarmSound(s.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    alarmSound === s.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Description & Employee Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Mandatory lunch break window for team synchronization..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pinned Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs shadow-indigo-200 cursor-pointer"
            >
              Save Break Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
