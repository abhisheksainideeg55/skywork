import React, { useState } from "react";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs";
import ReportSummary from "../../../Components/Employee/Reports/ReportSummary";
import ReportCategoryCards from "../../../Components/Employee/Reports/ReportCategoryCards";
import ReportAnalyticsCards from "../../../Components/Employee/Reports/ReportAnalyticsCards";
import GeneratedReportsTable from "../../../Components/Employee/Reports/GeneratedReportsTable";
import GenerateReportModal from "../../../Components/Employee/Reports/GenerateReportModal";

export default function ManagerReports() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Employee Management Navigation Tabs & Role Switcher */}
      <EmployeeLayoutTabs activeTab="reports" />

      {/* Manager Report Summary KPIs */}
      <ReportSummary
        onOpenGenerate={() => setIsGenerateOpen(true)}
        isUserView={false}
        roleTitle="Engineering Manager"
      />

      {/* Quick 1-Click Report Generation Cards */}
      <ReportCategoryCards isUserView={false} />

      {/* Visual Analytics Breakdown */}
      <ReportAnalyticsCards isUserView={false} />

      {/* Generated Reports Table (Manager can view all team members and company reports) */}
      <GeneratedReportsTable
        onOpenGenerate={() => setIsGenerateOpen(true)}
        isUserView={false}
      />

      {/* Generate Custom Report Modal */}
      {isGenerateOpen && (
        <GenerateReportModal onClose={() => setIsGenerateOpen(false)} />
      )}
    </div>
  );
}
