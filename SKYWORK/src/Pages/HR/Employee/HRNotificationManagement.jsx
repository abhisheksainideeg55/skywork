import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import NotificationSummary from "../../../Components/Employee/Notifications/NotificationSummary";
import NotificationFeed from "../../../Components/Employee/Notifications/NotificationFeed";
import CreateNotificationModal from "../../../Components/Employee/Notifications/CreateNotificationModal";

export default function HRNotificationManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Employee Management Navigation Tabs */}
      <EmployeeLayoutTabs activeTab="notifications" />

      {/* Notification Summary KPIs */}
      <NotificationSummary onOpenCreate={() => setIsCreateOpen(true)} />

      {/* Notification Feed & Action Cards */}
      <NotificationFeed onOpenCreate={() => setIsCreateOpen(true)} />

      {/* Create Broadcast Modal */}
      {isCreateOpen && (
        <CreateNotificationModal onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
