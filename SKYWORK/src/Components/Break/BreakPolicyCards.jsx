import React from "react";
import {
  FiClock,
  FiCoffee,
  FiBell,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiPlay,
} from "react-icons/fi";
import { useBreak } from "../../Context/BreakContext";

export default function BreakPolicyCards({
  policies = [],
  isHR = false,
  onEditPolicy,
  onDeletePolicy,
}) {
  const { triggerTestAlarm } = useBreak();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <span>☕ Official Shift Break Schedules</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {policies.length} Active Policies
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Designated meal & refreshment break timings configured across day, night, and rotational shifts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((policy) => {
          return (
            <div
              key={policy.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {policy.shiftType}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
                      {policy.name}
                    </h4>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {policy.durationMinutes} Mins
                  </span>
                </div>

                {/* Timing strip */}
                <div className="space-y-2 text-xs bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FiClock className="w-3.5 h-3.5 text-indigo-500" /> Timings:
                    </span>
                    <strong className="font-mono text-slate-800 font-bold">
                      {policy.displayTime}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FiCoffee className="w-3.5 h-3.5 text-amber-500" /> Location:
                    </span>
                    <span className="text-slate-700 font-medium truncate max-w-[150px]">
                      {policy.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FiShield className="w-3.5 h-3.5 text-emerald-500" /> Perks:
                    </span>
                    <span className="text-emerald-700 font-semibold text-[11px] truncate max-w-[150px]">
                      {policy.allowance}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                  {policy.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => triggerTestAlarm(policy)}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Test alarm chime for this break"
                >
                  <FiBell className="w-3.5 h-3.5" />
                  <span>Test Alarm</span>
                </button>

                {isHR ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                      By {policy.createdByName || 'HR Admin'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditPolicy(policy)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Break Policy"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePolicy(policy)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Break Policy"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                    By {policy.createdByName || 'HR Admin'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
