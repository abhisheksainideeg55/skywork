import React from "react";
import { FiUsers, FiUserCheck, FiUserX, FiClock, FiCalendar } from "react-icons/fi";

export default function AttendanceSummary({ records = [] }) {
  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late" || r.late === "Yes").length;
  const onLeave = records.filter((r) => r.status === "Leave" || r.status === "Half Day").length;

  const stats = [
    {
      label: "Total Employees",
      value: total,
      subtext: "Tracked today",
      icon: <FiUsers className="w-5 h-5 text-indigo-600" />,
      bgIcon: "bg-indigo-50",
      borderColor: "border-indigo-100",
    },
    {
      label: "Present",
      value: present,
      subtext: `${total ? Math.round((present / total) * 100) : 0}% on-time & active`,
      icon: <FiUserCheck className="w-5 h-5 text-emerald-600" />,
      bgIcon: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      label: "Absent",
      value: absent,
      subtext: "Unplanned absences",
      icon: <FiUserX className="w-5 h-5 text-rose-600" />,
      bgIcon: "bg-rose-50",
      borderColor: "border-rose-100",
    },
    {
      label: "Late Arrival",
      value: late,
      subtext: "Grace period tracked",
      icon: <FiClock className="w-5 h-5 text-amber-600" />,
      bgIcon: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      label: "On Leave / Half Day",
      value: onLeave,
      subtext: "Approved time off",
      icon: <FiCalendar className="w-5 h-5 text-sky-600" />,
      bgIcon: "bg-sky-50",
      borderColor: "border-sky-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {stat.label}
            </span>
            <div className={`p-2.5 rounded-xl ${stat.bgIcon}`}>
              {stat.icon}
            </div>
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
