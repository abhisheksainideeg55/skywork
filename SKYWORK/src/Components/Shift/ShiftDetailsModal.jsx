import React from "react";
import {
  FiX,
  FiClock,
  FiCalendar,
  FiUser,
  FiSun,
  FiMoon,
  FiRefreshCw,
  FiShield,
  FiTruck,
  FiCoffee,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import ShiftStatusBadge from "./ShiftStatusBadge";
import { getShiftDefinition, formatDateDisplay, getShiftColorToken } from "../../Utils/shiftUtils";

export default function ShiftDetailsModal({ isOpen, onClose, shiftRecord }) {
  if (!isOpen || !shiftRecord) return null;

  const shiftDef = getShiftDefinition(shiftRecord.shiftType);
  const colorToken = getShiftColorToken(shiftRecord.shiftType);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${shiftDef.color.gradient} text-white flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <FiClock className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">{shiftRecord.shiftType}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs font-mono">
                  {shiftDef.code}
                </span>
              </div>
              <p className="text-xs text-white/80">
                Official Roster Allocation Overview
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

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
          {/* Employee Identity Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <img
              src={
                shiftRecord.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              }
              alt={shiftRecord.employeeName}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {shiftRecord.employeeName}
                </h4>
                <ShiftStatusBadge status={shiftRecord.status} />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                ID: <span className="font-mono text-slate-700">{shiftRecord.employeeId}</span> • {shiftRecord.department}
              </p>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                {shiftRecord.role}
              </p>
            </div>
          </div>

          {/* Timings & Break Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <FiClock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Working Hours</span>
              </div>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {shiftRecord.timings}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{shiftDef.duration}</p>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <FiCoffee className="w-3.5 h-3.5 text-amber-500" />
                <span>Designated Break</span>
              </div>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {shiftDef.lunchBreak}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Cafeteria / Pantry Open</p>
            </div>
          </div>

          {/* Shift Perks & Transport Support */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
            <div className="flex items-start gap-2.5">
              <FiShield className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800">Comp & Allowance:</span>
                <p className="text-xs text-slate-600">{shiftDef.allowance}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
              <FiTruck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800">Transport & Safety:</span>
                <p className="text-xs text-slate-600">{shiftDef.transportSupport}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
              <FiRefreshCw className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800">Rotation Cycle:</span>
                <p className="text-xs text-slate-600">{shiftRecord.rotationCycle || "Fixed Schedule"}</p>
              </div>
            </div>
          </div>

          {/* Allocation Audit Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 text-slate-600">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Effective Window
              </span>
              <span className="font-semibold text-slate-800">
                {formatDateDisplay(shiftRecord.effectiveFrom, true)} →{" "}
                {formatDateDisplay(shiftRecord.effectiveTo, true)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Allocated By
              </span>
              <span className="font-semibold text-slate-800">
                {shiftRecord.allocatedBy || "HR Admin"}
              </span>
            </div>
          </div>

          {/* Notes */}
          {shiftRecord.notes && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block mb-1">
                Remarks & Notes
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {shiftRecord.notes}
              </p>
            </div>
          )}

          {/* Pinned Footer Action */}
          <div className="pt-3 border-t border-slate-100 flex justify-end bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
