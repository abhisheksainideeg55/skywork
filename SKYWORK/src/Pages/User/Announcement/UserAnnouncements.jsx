import React from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import AnnouncementSummary from "../../../Components/Employee/Announcements/AnnouncementSummary";
import AnnouncementFeed from "../../../Components/Employee/Announcements/AnnouncementFeed";

export default function UserAnnouncements() {
  return (
    <div className="space-y-6">
      {/* Role Layout Switcher & Sub-tabs */}
      <EmployeeLayoutTabs activeTab="announcements" />

      {/* Announcement KPIs (View Only for Employee) */}
      <AnnouncementSummary canManage={false} roleTitle="Employee" />

      {/* Announcement Feed (View Only - No Create/Edit/Delete access, only Read & Acknowledge) */}
      <AnnouncementFeed canManage={false} userRole="Employee" />
    </div>
  );
}
