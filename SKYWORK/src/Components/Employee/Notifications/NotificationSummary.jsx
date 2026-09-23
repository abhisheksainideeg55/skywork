import React from "react";
import {
  FiBell,
  FiAlertCircle,
  FiCheckCircle,
  FiPlus,
  FiCheck,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function NotificationSummary({ onOpenCreate, showCreate = true }) {
  const { notifications, markAllNotificationsAsRead } = useEmployee();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.priority === "Urgent").length;
  const pinnedCount = notifications.filter((n) => n.pinned).length;

  const stats = [
    {
      label: "Total Notifications",
      value: `${notifications.length} Alerts`,
      subtext: "Cross-module events & alerts",
      icon: FiBell,
      color: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Unread Items",
      value: `${unreadCount} New`,
      subtext: unreadCount === 0 ? "All caught up" : "Requires attention",
      icon: FiAlertCircle,
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "Urgent Priority",
      value: `${urgentCount} Urgent`,
      subtext: "Salary & leave approvals",
      icon: FiAlertCircle,
      color: "from-rose-500 to-rose-600",
      bgLight: "bg-rose-50 text-rose-700 border-rose-100",
    },
    {
      label: "Pinned Key Alerts",
      value: `${pinnedCount} Pinned`,
      subtext: "Featured smart cards",
      icon: FiCheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Communication & Event Hub
          </span>
          <h2 className="text-base sm:text-lg font-bold">
            Unified Notification & Broadcast Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time HRMS updates for Salary disbursements, Digital ID Cards, KYC validation, Documents, Leaves, WFH, and Scheduled Break alarms.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <FiCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          {showCreate && onOpenCreate && (
            <button
              type="button"
              onClick={onOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              <span>+ Create Broadcast</span>
            </button>
          )}
        </div>
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
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  {stat.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stat.bgLight}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
