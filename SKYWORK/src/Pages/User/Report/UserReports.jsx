import React from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import ReportSummary from "../../../Components/Employee/Reports/ReportSummary";
import ReportCategoryCards from "../../../Components/Employee/Reports/ReportCategoryCards";
import ReportAnalyticsCards from "../../../Components/Employee/Reports/ReportAnalyticsCards";
import GeneratedReportsTable from "../../../Components/Employee/Reports/GeneratedReportsTable";

export default function UserReports() {
  const currentEmployeeId = "EMP001"; // Logged-in user Abhishek Sharma

  return (
    <div className="space-y-6">
      {/* Role Layout Switcher & Sub-tabs */}
      <EmployeeLayoutTabs activeTab="reports" />

      {/* User Personal Report KPIs (Only individual metrics) */}
      <ReportSummary
        isUserView={true}
        employeeId={currentEmployeeId}
        roleTitle="Employee"
      />

      {/* User 1-Click Statement Downloads (Form 16, Appraisal Scorecard, Shift Log, Leave Ledger) */}
      <ReportCategoryCards isUserView={true} employeeId={currentEmployeeId} />

      {/* Personal Goal Velocity & Attendance Performance Breakdown */}
      <ReportAnalyticsCards isUserView={true} />

      {/* Personal Generated Reports Table (Only EMP001 reports visible) */}
      <GeneratedReportsTable isUserView={true} employeeId={currentEmployeeId} />
    </div>
  );
}
