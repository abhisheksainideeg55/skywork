import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import AnnouncementSummary from "../../../Components/Employee/Announcements/AnnouncementSummary";
import AnnouncementFeed from "../../../Components/Employee/Announcements/AnnouncementFeed";
import CreateAnnouncementModal from "../../../Components/Employee/Announcements/CreateAnnouncementModal";

export default function ManagerAnnouncements() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Employee Management Navigation Tabs & Role Switcher */}
      <EmployeeLayoutTabs activeTab="announcements" />

      {/* Announcement KPIs & Header */}
      <AnnouncementSummary
        onOpenCreate={() => setIsCreateOpen(true)}
        canManage={true}
        roleTitle="Engineering Manager"
      />

      {/* Announcement Feed with CRUD Management */}
      <AnnouncementFeed
        canManage={true}
        onOpenCreate={() => setIsCreateOpen(true)}
        userRole="Engineering Lead"
      />

      {/* Create Announcement Modal */}
      {isCreateOpen && (
        <CreateAnnouncementModal
          onClose={() => setIsCreateOpen(false)}
          role="Engineering Lead"
        />
      )}
    </div>
  );
}
