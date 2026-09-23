import React from "react";
import { FiSun, FiMoon, FiRefreshCw, FiClock, FiCoffee, FiShield, FiTruck } from "react-icons/fi";
import { SHIFT_DEFINITIONS } from "../../Data/shiftData";

export default function ShiftTypeCards({ allocations = [], onFilterShift }) {
  const getCount = (type) =>
    allocations.filter((a) => a.shiftType === type).length;

  const iconMap = {
    "Day Shift": <FiSun className="w-5 h-5 text-amber-500" />,
    "Night Shift": <FiMoon className="w-5 h-5 text-purple-500" />,
    "Rotational Shift": <FiRefreshCw className="w-5 h-5 text-teal-500" />,
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <span>🏢 Active Office Shift Policy</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              3 Active Shifts
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Official operational work hours configured across engineering, operations, and support divisions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SHIFT_DEFINITIONS.map((shift) => {
          const count = getCount(shift.type);
          const icon = iconMap[shift.type];

          return (
            <div
              key={shift.id}
              onClick={() => onFilterShift && onFilterShift(shift.type)}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 relative flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${shift.color.bg} border ${shift.color.border}`}>
                      {icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {shift.name}
                      </h4>
                      <span className="text-[11px] font-mono font-medium text-slate-400">
                        Code: {shift.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${shift.color.badge}`}
                  >
                    {count} Assigned
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50/70 rounded-xl p-3 border border-slate-100 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FiClock className="w-3.5 h-3.5 text-slate-400" /> Timings:
                    </span>
                    <strong className="text-slate-800 font-semibold">{shift.timings}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FiCoffee className="w-3.5 h-3.5 text-slate-400" /> Break:
                    </span>
                    <span className="text-slate-700 font-medium">{shift.lunchBreak}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <FiShield className="w-3.5 h-3.5 text-slate-400" /> Allowance:
                    </span>
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      {shift.allowance}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                  {shift.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <FiTruck className="w-3.5 h-3.5 text-slate-400" />
                  {shift.transportSupport}
                </span>
                <span className="text-indigo-600 font-semibold group-hover:underline">
                  Filter Roster →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
