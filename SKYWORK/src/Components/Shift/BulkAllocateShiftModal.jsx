import React, { useState } from "react";
import {
  FiX,
  FiUsers,
  FiClock,
  FiCalendar,
  FiSun,
  FiMoon,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import { SHIFT_DEFINITIONS } from "../../Data/shiftData";

export default function BulkAllocateShiftModal({
  isOpen,
  onClose,
  onBulkAllocate,
  employeesDirectory = [],
  currentUser,
}) {
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [shiftType, setShiftType] = useState("Day Shift");
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [effectiveTo, setEffectiveTo] = useState("2026-12-31");
  const [rotationCycle, setRotationCycle] = useState("Bi-Weekly (Afternoon / Morning)");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  if (!isOpen) return null;

  const toggleSelectEmp = (id) => {
    if (selectedEmpIds.includes(id)) {
      setSelectedEmpIds(selectedEmpIds.filter((item) => item !== id));
    } else {
      setSelectedEmpIds([...selectedEmpIds, id]);
    }
  };

  const selectAll = () => {
    const visibleIds = filteredEmployees.map((e) => e.employeeId || e.id);
    setSelectedEmpIds(Array.from(new Set([...selectedEmpIds, ...visibleIds])));
  };

  const deselectAll = () => {
    setSelectedEmpIds([]);
  };

  const departments = [
    "All",
    ...new Set(employeesDirectory.map((e) => e.department)),
  ];

  const filteredEmployees = employeesDirectory.filter((e) => {
    if (deptFilter === "All") return true;
    return e.department === deptFilter;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (selectedEmpIds.length === 0) {
      setError("Please select at least one employee for bulk allocation.");
      return;
    }
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

    const res = await onBulkAllocate(selectedEmpIds, payload, currentUser);
    if (res?.success) {
      onClose();
      setSelectedEmpIds([]);
      setNotes("");
    } else if (res?.error) {
      setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <FiUsers className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Bulk Shift Allocation</h3>
              <p className="text-xs text-purple-100">
                Assign Day, Night, or Rotational shift to multiple team members at once
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

          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              1. Choose Target Shift Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SHIFT_DEFINITIONS.map((s) => {
                const isSelected = shiftType === s.type;
                return (
                  <div
                    key={s.id}
                    onClick={() => setShiftType(s.type)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{s.name}</span>
                      {isSelected && <FiCheckCircle className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div className="text-[11px] font-mono font-medium text-slate-600">
                      {s.timings}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employee Selection Multi-Picker */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                2. Select Employees ({selectedEmpIds.length} selected) <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-2">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "Filter Department: All" : d}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-xs text-slate-500 hover:underline font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 p-2 bg-slate-50/50">
              {filteredEmployees.map((emp) => {
                const isChecked = selectedEmpIds.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleSelectEmp(emp.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isChecked ? "bg-indigo-50/80 border border-indigo-200/80" : "hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-indigo-600">
                        {isChecked ? (
                          <FiCheckSquare className="w-4 h-4" />
                        ) : (
                          <FiSquare className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {emp.id} • {emp.department} • {emp.role}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Bulk Allocation Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Q2 Team shift rotation realignment"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sticky/Pinned Footer Actions */}
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
              Bulk Allocate ({selectedEmpIds.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
