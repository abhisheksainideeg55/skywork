import React from "react";
import {
  FiCalendar,
  FiActivity,
  FiAward,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";

export default function LeaveSummary({
  balances,
  records = [],
  isHRView = false,
}) {
  // If HR company view, calculate overall company leave statistics
  if (isHRView) {
    const totalRequests = records.length;
    const pending = records.filter((r) => r.status === "Pending").length;
    const approved = records.filter((r) => r.status === "Approved").length;
    const rejected = records.filter((r) => r.status === "Rejected").length;
    const casualBal = balances?.["Casual Leave"] ?? 9;

    const hrCards = [
      {
        label: "Total Requests",
        value: totalRequests,
        subtext: "All employee submissions",
        icon: <FiCalendar className="w-5 h-5 text-indigo-600" />,
        bgIcon: "bg-indigo-50",
      },
      {
        label: "Pending Action",
        value: pending,
        subtext: "Awaiting review",
        icon: <FiClock className="w-5 h-5 text-amber-600" />,
        bgIcon: "bg-amber-50",
      },
      {
        label: "Approved Leaves",
        value: approved,
        subtext: "Processed & active",
        icon: <FiCheckCircle className="w-5 h-5 text-emerald-600" />,
        bgIcon: "bg-emerald-50",
      },
      {
        label: "Rejected / Cancelled",
        value: rejected,
        subtext: "Declined requests",
        icon: <FiAlertCircle className="w-5 h-5 text-rose-600" />,
        bgIcon: "bg-rose-50",
      },
      {
        label: "My Casual Balance",
        value: `${casualBal} Days`,
        subtext: "My available leave balance",
        icon: <FiAward className="w-5 h-5 text-sky-600" />,
        bgIcon: "bg-sky-50",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {hrCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
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

  // Employee & Manager Personal Leave Balances
  const casual = balances?.["Casual Leave"] ?? 8;
  const sick = balances?.["Sick Leave"] ?? 6;
  const earned = balances?.["Earned Leave"] ?? 12;
  const emergency = balances?.["Emergency Leave"] ?? 3;
  const pendingCount = records.filter((r) => r.status === "Pending").length;

  const userCards = [
    {
      label: "Casual Leave",
      value: `${casual} Days`,
      subtext: "Remaining balance",
      icon: <FiCalendar className="w-5 h-5 text-indigo-600" />,
      bgIcon: "bg-indigo-50",
    },
    {
      label: "Sick Leave",
      value: `${sick} Days`,
      subtext: "Medical & health off",
      icon: <FiActivity className="w-5 h-5 text-rose-600" />,
      bgIcon: "bg-rose-50",
    },
    {
      label: "Earned Leave",
      value: `${earned} Days`,
      subtext: "Annual paid vacation",
      icon: <FiAward className="w-5 h-5 text-emerald-600" />,
      bgIcon: "bg-emerald-50",
    },
    {
      label: "Emergency Leave",
      value: `${emergency} Days`,
      subtext: "Urgent situations",
      icon: <FiAlertCircle className="w-5 h-5 text-amber-600" />,
      bgIcon: "bg-amber-50",
    },
    {
      label: "Pending Requests",
      value: pendingCount,
      subtext: pendingCount === 1 ? "1 request under review" : `${pendingCount} requests in review`,
      icon: <FiClock className="w-5 h-5 text-sky-600" />,
      bgIcon: "bg-sky-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {userCards.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
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
