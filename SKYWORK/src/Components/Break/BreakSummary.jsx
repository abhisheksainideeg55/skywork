import React from "react";
import {
  FiCoffee,
  FiUserCheck,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

export default function BreakSummary({ policies = [], logs = [] }) {
  const totalPolicies = policies.length;
  const currentlyOnBreak = logs.filter((l) => l.status === "On Break").length;
  const completedToday = logs.filter((l) => l.status === "Completed").length;
  const exceededCount = logs.filter((l) => l.status === "Exceeded").length;

  const stats = [
    {
      title: "Active Break Schedules",
      count: totalPolicies,
      subtitle: "Day, Night & Rotational",
      icon: FiCoffee,
      color: "from-indigo-600 to-purple-600",
      iconBg: "bg-indigo-50 text-indigo-600",
      border: "border-indigo-100",
    },
    {
      title: "Currently on Break",
      count: currentlyOnBreak,
      subtitle: currentlyOnBreak > 0 ? "Live active breaks" : "All staff at desk",
      icon: FiUserCheck,
      color: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
    },
    {
      title: "Completed Today",
      count: completedToday,
      subtitle: "Logged within time",
      icon: FiCheckCircle,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      title: "Overstay Alerts",
      count: exceededCount,
      subtitle: exceededCount > 0 ? "Exceeded allowed limit" : "100% On-time compliance",
      icon: FiAlertTriangle,
      color: "from-rose-500 to-red-600",
      iconBg: "bg-rose-50 text-rose-600",
      border: "border-rose-100",
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
                  <span className="text-xs font-medium text-slate-400">records</span>
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

            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} opacity-80`}
            />
          </div>
        );
      })}
    </div>
  );
}
