import React, { useState, useEffect } from "react";
import {
  FiX,
  FiEdit2,
  FiClock,
  FiSun,
  FiMoon,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { SHIFT_DEFINITIONS } from "../../Data/shiftData";

export default function EditShiftModal({
  isOpen,
  onClose,
  onUpdate,
  shiftRecord,
  currentUser,
}) {
  const [shiftType, setShiftType] = useState("Day Shift");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [rotationCycle, setRotationCycle] = useState("Bi-Weekly (Afternoon / Morning)");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (shiftRecord) {
      setShiftType(shiftRecord.shiftType || "Day Shift");
      setEffectiveFrom(shiftRecord.effectiveFrom || "");
      setEffectiveTo(shiftRecord.effectiveTo || "");
      setRotationCycle(
        shiftRecord.rotationCycle || "Bi-Weekly (Afternoon / Morning)"
      );
      setNotes(shiftRecord.notes || "");
      setError("");
    }
  }, [shiftRecord]);

  if (!isOpen || !shiftRecord) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!effectiveFrom) {
      setError("Please select an effective start date.");
      return;
    }

    const payload = {
      shiftType,
      effectiveFrom,
      effectiveTo,
      rotationCycle:
        shiftType === "Rotational Shift" ? rotationCycle : "None (Fixed Schedule)",
      notes,
    };

    const res = await onUpdate(shiftRecord.id, payload, currentUser);
    if (res?.success) {
      onClose();
    } else if (res?.error) {
      setError(res.error);
    }
  };

  const selectedDef = SHIFT_DEFINITIONS.find((s) => s.type === shiftType);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <FiEdit2 className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Edit Shift Allocation</h3>
              <p className="text-xs text-amber-100">
                Updating schedule for {shiftRecord.employeeName} ({shiftRecord.employeeId})
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

          {/* Employee Info Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              src={
                shiftRecord.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              }
              alt={shiftRecord.employeeName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {shiftRecord.employeeName}{" "}
                <span className="text-xs font-normal text-slate-500">
                  ({shiftRecord.employeeId})
                </span>
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {shiftRecord.department} • {shiftRecord.role}
              </p>
            </div>
          </div>

          {/* Shift Type 3 Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Shift Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SHIFT_DEFINITIONS.map((s) => {
                const isSelected = shiftType === s.type;
                let icon = <FiSun className="w-4 h-4 text-amber-500" />;
                if (s.type === "Night Shift")
                  icon = <FiMoon className="w-4 h-4 text-purple-500" />;
                if (s.type === "Rotational Shift")
                  icon = <FiRefreshCw className="w-4 h-4 text-teal-500" />;

                return (
                  <div
                    key={s.id}
                    onClick={() => setShiftType(s.type)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {icon}
                        <span className="text-xs font-bold text-slate-900">
                          {s.name}
                        </span>
                      </div>
                      {isSelected && (
                        <FiCheckCircle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 font-semibold">
                      {s.timings}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rotation Cycle */}
          {shiftType === "Rotational Shift" && (
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-900 mb-1.5">
                Rotation Cycle Scheme
              </label>
              <select
                value={rotationCycle}
                onChange={(e) => setRotationCycle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-xs font-semibold text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="Bi-Weekly (Afternoon / Morning)">
                  Bi-Weekly (Afternoon / Morning Rotation)
                </option>
                <option value="Weekly (Alternate Shift)">
                  Weekly (Alternate Shift Cycle)
                </option>
                <option value="Monthly (30-Day Rotation)">
                  Monthly (30-Day Rotation Cycle)
                </option>
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Effective From <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Effective Till
              </label>
              <input
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Schedule updated for quarterly rotation"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs shadow-amber-200 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
