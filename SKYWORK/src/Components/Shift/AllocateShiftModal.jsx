import React, { useState } from "react";
import {
  FiX,
  FiUser,
  FiClock,
  FiCalendar,
  FiSun,
  FiMoon,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { SHIFT_DEFINITIONS } from "../../Data/shiftData";

export default function AllocateShiftModal({
  isOpen,
  onClose,
  onAllocate,
  employeesDirectory = [],
  currentUser,
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [shiftType, setShiftType] = useState("Day Shift");
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [effectiveTo, setEffectiveTo] = useState("2026-12-31");
  const [rotationCycle, setRotationCycle] = useState("Bi-Weekly (Afternoon / Morning)");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!employeeId) {
      setError("Please select an employee to allocate shift.");
      return;
    }
    if (!effectiveFrom) {
      setError("Please select an effective start date.");
      return;
    }

    const selectedEmp = employeesDirectory.find(
      (emp) => emp.id === employeeId || emp.employeeId === employeeId
    );

    const payload = {
      employeeId,
      employeeName: selectedEmp?.name || selectedEmp?.employeeName,
      department: selectedEmp?.department,
      role: selectedEmp?.role,
      avatar: selectedEmp?.avatar,
      email: selectedEmp?.email,
      shiftType,
      effectiveFrom,
      effectiveTo,
      rotationCycle:
        shiftType === "Rotational Shift" ? rotationCycle : "None (Fixed Schedule)",
      notes,
    };

    const res = await onAllocate(payload, currentUser);
    if (res?.success) {
      onClose();
      // Reset form
      setEmployeeId("");
      setShiftType("Day Shift");
      setNotes("");
    } else if (res?.error) {
      setError(res.error);
    }
  };

  const selectedDef = SHIFT_DEFINITIONS.find((s) => s.type === shiftType);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <FiClock className="w-5 h-5 text-white" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Allocate Employee Shift</h3>
                <p className="text-xs text-indigo-100">
                  Assign official work shift schedule (HR Admin Control)
                </p>
              </div>
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
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Employee <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">-- Choose Employee from Directory --</option>
                {employeesDirectory.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) — {emp.department} • {emp.role}
                  </option>
                ))}
              </select>
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
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {icon}
                        <span className="text-xs font-bold text-slate-900">
                          {s.name}
                        </span>
                      </div>
                      {isSelected && (
                        <FiCheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 font-semibold mb-1">
                      {s.timings}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Break: {s.lunchBreak}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shift Details Preview Banner */}
          {selectedDef && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800">Perks & Coverage: </span>
                <span>{selectedDef.allowance}</span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {selectedDef.transportSupport}
              </span>
            </div>
          )}

          {/* Rotation Cycle (if Rotational Shift is selected) */}
          {shiftType === "Rotational Shift" && (
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
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

          {/* Effective Dates */}
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Operational Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Allocation Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Assigned to European operational support hours, project sprint release..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Sticky/Pinned Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs shadow-indigo-200 transition-all hover:shadow-md cursor-pointer"
            >
              Allocate Shift Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
