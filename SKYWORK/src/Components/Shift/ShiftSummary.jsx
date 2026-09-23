import React from "react";
import { FiUsers, FiSun, FiMoon, FiRefreshCw, FiClock } from "react-icons/fi";

export default function ShiftSummary({ allocations = [], totalEmployeesCount = 12 }) {
  const totalAllocated = allocations.length;
  const dayShiftCount = allocations.filter((a) => a.shiftType === "Day Shift").length;
  const nightShiftCount = allocations.filter((a) => a.shiftType === "Night Shift").length;
  const rotationalShiftCount = allocations.filter(
    (a) => a.shiftType === "Rotational Shift"
  ).length;
  const activeCount = allocations.filter((a) => a.status === "Active").length;

  const stats = [
    {
      title: "Total Staff Roster",
      count: totalAllocated,
      subtitle: `${activeCount} currently active`,
      icon: FiUsers,
      color: "from-blue-600 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      title: "☀️ Day Shift",
      count: dayShiftCount,
      subtitle: "09:00 AM – 06:00 PM",
      icon: FiSun,
      color: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
    },
    {
      title: "🌙 Night Shift",
      count: nightShiftCount,
      subtitle: "09:00 PM – 06:00 AM (+20%)",
      icon: FiMoon,
      color: "from-purple-600 to-indigo-700",
      iconBg: "bg-purple-50 text-purple-600",
      border: "border-purple-100",
    },
    {
      title: "🔄 Rotational Shift",
      count: rotationalShiftCount,
      subtitle: "02:00 PM – 11:00 PM",
      icon: FiRefreshCw,
      color: "from-teal-500 to-emerald-600",
      iconBg: "bg-teal-50 text-teal-600",
      border: "border-teal-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-4 sm:p-5 border ${item.border} shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.title}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {item.count}
                  </span>
                  <span className="text-xs font-medium text-slate-400">members</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {item.subtitle}
                </p>
              </div>

              <div
                className={`p-3 rounded-2xl ${item.iconBg} group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Bottom accent bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} opacity-80`}
            />
          </div>
        );
      })}
    </div>
  );
}
