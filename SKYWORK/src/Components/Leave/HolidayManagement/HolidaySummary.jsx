import React from "react";
import {
  FiCalendar,
  FiAward,
  FiSun,
  FiBriefcase,
  FiCheckCircle,
} from "react-icons/fi";

export default function HolidaySummary({ holidays = [] }) {
  // Compute numbers dynamically
  const total = holidays.length;
  const national = holidays.filter((h) => h.type === "National Holiday").length;
  const festival = holidays.filter((h) => h.type === "Festival Holiday").length;
  const company = holidays.filter((h) => h.type === "Company Holiday").length;
  const optional = holidays.filter(
    (h) => h.type === "Optional Holiday" || h.type === "Other"
  ).length;

  const cards = [
    {
      label: "Total Holidays",
      value: total,
      subtext: "Annual calendar schedule",
      icon: <FiCalendar className="w-5 h-5 text-indigo-600" />,
      bgIcon: "bg-indigo-50",
    },
    {
      label: "National Holidays",
      value: national,
      subtext: "Mandatory official off",
      icon: <FiAward className="w-5 h-5 text-amber-600" />,
      bgIcon: "bg-amber-50",
    },
    {
      label: "Festival Holidays",
      value: festival,
      subtext: "Cultural celebrations",
      icon: <FiSun className="w-5 h-5 text-purple-600" />,
      bgIcon: "bg-purple-50",
    },
    {
      label: "Company Holidays",
      value: company,
      subtext: "Skywork corporate off",
      icon: <FiBriefcase className="w-5 h-5 text-emerald-600" />,
      bgIcon: "bg-emerald-50",
    },
    {
      label: "Optional / Other",
      value: optional,
      subtext: "Floating & other leaves",
      icon: <FiCheckCircle className="w-5 h-5 text-teal-600" />,
      bgIcon: "bg-teal-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {stat.label}
            </span>
            <div className={`p-2.5 rounded-xl ${stat.bgIcon}`}>{stat.icon}</div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {stat.value}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium truncate">
              {stat.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
