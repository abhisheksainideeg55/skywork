import React from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import NotificationSummary from "../../../Components/Employee/Notifications/NotificationSummary";
import NotificationFeed from "../../../Components/Employee/Notifications/NotificationFeed";

export default function UserNotifications() {
  return (
    <div className="space-y-6">
      {/* Role Layout Switcher & Sub-tabs */}
      <EmployeeLayoutTabs activeTab="notifications" />

      {/* Notification Summary KPIs */}
      <NotificationSummary showCreate={false} />

      {/* Unified Notification Feed */}
      <NotificationFeed onOpenCreate={() => {}} />
    </div>
  );
}
