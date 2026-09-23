import React from "react";
import {
  FiRadio,
  FiAlertCircle,
  FiCheckCircle,
  FiPlus,
  FiBookmark,
  FiShield,
  FiEye,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function AnnouncementSummary({
  onOpenCreate,
  canManage = false,
  roleTitle = "Employee",
}) {
  const { announcements } = useEmployee();

  const totalCount = announcements.length;
  const urgentCount = announcements.filter((a) => a.priority === "Urgent").length;
  const pinnedCount = announcements.filter((a) => a.pinned).length;
  const acknowledgedCount = announcements.filter(
    (a) => a.acknowledgedBy && a.acknowledgedBy.includes("EMP001")
  ).length;

  const stats = [
    {
      label: "Total Announcements",
      value: `${totalCount} Published`,
      subtext: "Company-wide & target teams",
      icon: FiRadio,
      color: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Urgent Bulletins",
      value: `${urgentCount} Urgent`,
      subtext: "Town Hall & critical policies",
      icon: FiAlertCircle,
      color: "from-rose-500 to-rose-600",
      bgLight: "bg-rose-50 text-rose-700 border-rose-100",
    },
    {
      label: "Pinned Key Broadcasts",
      value: `${pinnedCount} Pinned`,
      subtext: "Featured on staff feeds",
      icon: FiBookmark,
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "My Acknowledged Read",
      value: `${acknowledgedCount} / ${totalCount}`,
      subtext: "Compliance reading status",
      icon: FiCheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              {roleTitle} Broadcast Hub
            </span>

            {canManage ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <FiShield className="w-3 h-3" /> Full Publishing Access (Create/Edit/Delete)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <FiEye className="w-3 h-3" /> View & Acknowledge Mode
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold">
            Company Official Announcements & Broadcasts
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {canManage
              ? "Draft, publish, edit, or remove official circulars, leadership town halls, insurance policies, and festive holiday notices."
              : "Read official circulars, town hall schedules, health insurance upgrades, festival dates, and acknowledge policy updates."}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              <span>+ Create Announcement</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${stat.bgLight}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-2">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
