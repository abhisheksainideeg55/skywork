import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import NotificationSummary from "../../../Components/Employee/Notifications/NotificationSummary";
import NotificationFeed from "../../../Components/Employee/Notifications/NotificationFeed";
import CreateNotificationModal from "../../../Components/Employee/Notifications/CreateNotificationModal";

export default function ManagerNotifications() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Employee Management Navigation Tabs & Role Switcher */}
      <EmployeeLayoutTabs activeTab="notifications" />

      {/* Header Banner for Manager */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          Manager Team Notifications & Alerts
        </span>
        <h2 className="text-lg font-bold">Engineering Team Notification Center</h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Track real-time salary credits, employee digital ID generation, KYC & document verification, leave approvals/rejections, WFH requests, and scheduled break alarms.
        </p>
      </div>

      {/* Notification Summary KPIs */}
      <NotificationSummary onOpenCreate={() => setIsCreateOpen(true)} />

      {/* Unified Notification Feed */}
      <NotificationFeed onOpenCreate={() => setIsCreateOpen(true)} />

      {/* Create Broadcast Modal */}
      {isCreateOpen && (
        <CreateNotificationModal onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
