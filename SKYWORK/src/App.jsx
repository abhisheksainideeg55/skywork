import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./Layouts/UserLayout";
import HRLayout from "./Layouts/HRLayout";
import UserAttendance from "./Pages/User/UserAttendance";
import EmployeeAttendance from "./Pages/HR/EmployeeAttendance/EmployeeAttendance";
import SmartAttendance from "./Pages/HR/Attendance/SmartAttendance";
import UserLeave from "./Pages/User/Leave/UserLeave";
import HRLeaveManagement from "./Pages/HR/Leave/HRLeaveManagement";
import UserWFH from "./Pages/User/WFH/UserWFH";
import HRWFHManagement from "./Pages/HR/WFH/HRWFHManagement";
import HRHolidayManagement from "./Pages/HR/Leave/HRHolidayManagement";
import UserHolidays from "./Pages/User/Leave/UserHolidays";
import DemoPage from "./Pages/DemoPage";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiBarChart2,
  FiAward,
  FiCheckCircle,
  FiUserPlus,
  FiBriefcase,
  FiHome,
  FiLayers,
  FiCheckSquare,
} from "react-icons/fi";
import { AttendanceProvider } from "./Context/AttendanceContext";
import { LeaveProvider } from "./Context/LeaveContext";
import { WFHProvider } from "./Context/WFHContext";
import { HolidayProvider } from "./Context/HolidayContext";
import { ShiftProvider } from "./Context/ShiftContext";
import { BreakProvider } from "./Context/BreakContext";
import { EmployeeProvider } from "./Context/EmployeeContext";
import { SalaryProvider } from "./Context/SalaryContext";
import BreakAlarmAlertModal from "./Components/Break/BreakAlarmAlertModal";
import HRShiftManagement from "./Pages/HR/Shift/HRShiftManagement";
import UserShift from "./Pages/User/Shift/UserShift";
import HRBreakManagement from "./Pages/HR/Break/HRBreakManagement";
import UserBreak from "./Pages/User/Break/UserBreak";
import HRSalaryManagementPage from "./Pages/HR/Salary/HRSalaryManagementPage";
import HRReportManagement from "./Pages/HR/Employee/HRReportManagement";
import HRNotificationManagement from "./Pages/HR/Employee/HRNotificationManagement";
import HRDocumentManagement from "./Pages/HR/Employee/HRDocumentManagement";
import UserSalary from "./Pages/User/Salary/UserSalary";
import UserReports from "./Pages/User/Report/UserReports";
import UserNotifications from "./Pages/User/Notification/UserNotifications";
import UserDocuments from "./Pages/User/Document/UserDocuments";
import UserAnnouncements from "./Pages/User/Announcement/UserAnnouncements";
import HRAnnouncementManagement from "./Pages/HR/Employee/HRAnnouncementManagement";
import HREmployeeDirectory from "./Pages/HR/Employee/HREmployeeDirectory";
import UnauthorizedAccess from "./Components/Auth/UnauthorizedAccess";

// Auth & RBAC imports
import { AuthProvider } from "./Context/AuthContext";
import { ProtectedRoute } from "./Components/Auth/ProtectedRoute";
import { LoginPage } from "./Pages/Auth/LoginPage";
import { SuperAdminLayout } from "./Layouts/SuperAdminLayout";
import { SuperAdminDashboard } from "./Pages/SuperAdmin/SuperAdminDashboard";
import { SuperAdminUserManagement } from "./Pages/SuperAdmin/SuperAdminUserManagement";
import { SuperAdminAuditLogs } from "./Pages/SuperAdmin/SuperAdminAuditLogs";
import { SuperAdminSettings } from "./Pages/SuperAdmin/SuperAdminSettings";
import { SmartAttendanceSettings } from "./Pages/SuperAdmin/SmartAttendanceSettings";
import { SmartAttendanceProvider } from "./Context/SmartAttendanceContext";

export default function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <SmartAttendanceProvider>
          <LeaveProvider>
            <WFHProvider>
              <HolidayProvider>
                <ShiftProvider>
                  <BreakProvider>
                    <EmployeeProvider>
                      <SalaryProvider>
                        <BreakAlarmAlertModal />
                        <Routes>
                          {/* 0. PUBLIC & AUTH ROUTES */}
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/superadmin" element={<Navigate to="/super-admin" replace />} />
                          <Route path="/admin" element={<Navigate to="/super-admin" replace />} />

                          {/* 0. SUPER ADMIN ROUTES (RESTRICTED TO SUPER ADMIN ONLY) */}
                          <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminLayout /></ProtectedRoute>}>
                            <Route index element={<SuperAdminDashboard />} />
                            <Route path="smart-attendance" element={<SmartAttendanceSettings />} />
                            <Route path="leaves" element={<HRLeaveManagement />} />
                            <Route path="leave" element={<HRLeaveManagement />} />
                            <Route path="wfh" element={<HRWFHManagement />} />
                            <Route path="users" element={<SuperAdminUserManagement />} />
                            <Route path="roles" element={<SuperAdminUserManagement />} />
                            <Route path="salary" element={<HRSalaryManagementPage userRole="superadmin" />} />
                            <Route path="audit" element={<SuperAdminAuditLogs />} />
                            <Route path="settings" element={<SuperAdminSettings />} />
                          </Route>

                        {/* 1. USER / EMPLOYEE LAYOUT ROUTES */}
                        <Route element={<ProtectedRoute allowedRoles={['employee', 'hr', 'superadmin']}><UserLayout /></ProtectedRoute>}>
                        <Route
                          path="/"
                          element={
                            <DemoPage
                              badge="Employee Portal"
                              title="Welcome back, Abhishek!"
                              description="Here is your daily activity summary, upcoming holidays, and attendance status."
                              stats={[
                                { label: "Attendance This Month", value: "96.4%", subtext: "+2.1% from last month", icon: <FiCheckCircle /> },
                                { label: "Remaining Leave Days", value: "14 Days", subtext: "Paid annual leave", icon: <FiClock /> },
                                { label: "Logged Work Hours", value: "164 hrs", subtext: "Standard schedule met", icon: <FiCalendar /> },
                                { label: "Performance Score", value: "4.9 / 5.0", subtext: "Top 5% performer", icon: <FiAward /> },
                              ]}
                            />
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <DemoPage
                              badge="User Profile"
                              title="Employee Profile & Bio"
                              description="Manage personal contact details, emergency contacts, documents, and banking information."
                              stats={[
                                { label: "Department", value: "Engineering", subtext: "Frontend Core Team", icon: <FiUsers /> },
                                { label: "Designation", value: "Senior Developer", subtext: "Full-time", icon: <FiAward /> },
                                { label: "Joining Date", value: "12 Jan 2023", subtext: "3+ years at Skywork", icon: <FiCalendar /> },
                                { label: "Lead / Supervisor", value: "Engineering Head", subtext: "Technical Supervisor", icon: <FiCheckCircle /> },
                              ]}
                            />
                          }
                        />

                        {/* USER / EMPLOYEE PERSONAL ATTENDANCE */}
                        <Route path="/attendance" element={<UserAttendance />} />

                        {/* USER / EMPLOYEE LEAVE MANAGEMENT */}
                        <Route path="/leave" element={<UserLeave />} />
                        <Route path="/leave-management" element={<UserLeave />} />
                        <Route path="/leave/holidays" element={<UserHolidays />} />
                        <Route path="/leave-management/holidays" element={<UserHolidays />} />
                        <Route path="/holidays" element={<UserHolidays />} />

                        {/* USER / EMPLOYEE WORK FROM HOME (WFH) */}
                        <Route path="/wfh" element={<UserWFH />} />
                        <Route path="/wfh-management" element={<UserWFH />} />

                        {/* USER / EMPLOYEE SHIFT MANAGEMENT */}
                        <Route path="/shifts" element={<UserShift />} />
                        <Route path="/shift-management" element={<UserShift />} />
                        <Route path="/work/shifts" element={<UserShift />} />
                        <Route path="/work/shift-management" element={<UserShift />} />

                        {/* USER / EMPLOYEE BREAK MANAGEMENT */}
                        <Route path="/breaks" element={<UserBreak />} />
                        <Route path="/break-management" element={<UserBreak />} />
                        <Route path="/work/breaks" element={<UserBreak />} />
                        <Route path="/work/break-management" element={<UserBreak />} />

                        {/* USER / EMPLOYEE SALARY, REPORTS, NOTIFICATIONS, DOCUMENTS & ANNOUNCEMENTS */}
                        <Route path="/salary" element={<UserSalary />} />
                        <Route path="/salary-management" element={<UserSalary />} />
                        <Route path="/reports" element={<UserReports />} />
                        <Route path="/notifications" element={<UserNotifications />} />
                        <Route path="/notification" element={<UserNotifications />} />
                        <Route path="/announcements" element={<UserAnnouncements />} />
                        <Route path="/announcement" element={<UserAnnouncements />} />
                        <Route path="/documents" element={<UserDocuments />} />
                        <Route path="/document" element={<UserDocuments />} />

                        <Route
                          path="/settings"
                          element={
                            <DemoPage
                              badge="Preferences"
                              title="Account & Notification Settings"
                              description="Configure email alerts, push notifications, security credentials, and 2FA authentication."
                              stats={[
                                { label: "2FA Status", value: "Enabled", subtext: "Secured with Authenticator", icon: <FiCheckCircle /> },
                                { label: "Email Alerts", value: "Active", subtext: "Daily digest enabled", icon: <FiClock /> },
                                { label: "Theme", value: "Modern Clean", subtext: "Auto contrast", icon: <FiAward /> },
                                { label: "Language", value: "English (US)", subtext: "UTC+05:30", icon: <FiCalendar /> },
                              ]}
                            />
                          }
                        />
                      </Route>

                      {/* 2. HR MANAGEMENT LAYOUT ROUTES (RESTRICTED HR ACCESS) */}
                      <Route path="/hr" element={<ProtectedRoute allowedRoles={['hr', 'superadmin']}><HRLayout /></ProtectedRoute>}>
                        <Route
                          index
                          element={
                            <DemoPage
                              badge="HR Administration"
                              title="HR Executive Dashboard"
                              description="Company-wide personnel statistics, onboarding pipelines, and department headcounts."
                              stats={[
                                { label: "Total Employees", value: "482 Staff", subtext: "+18 this quarter", icon: <FiUsers /> },
                                { label: "Today's Attendance", value: "94.8%", subtext: "457 present, 25 on leave", icon: <FiCalendar /> },
                                { label: "Pending Onboarding", value: "7 Candidates", subtext: "Offer letters accepted", icon: <FiCheckCircle /> },
                                { label: "Payroll Processing", value: "100% Ready", subtext: "Cycle closes on 30th", icon: <FiBarChart2 /> },
                              ]}
                            />
                          }
                        />

                        {/* HR EXCLUSIVE SALARY MANAGEMENT */}
                        <Route path="salary-management" element={<HRSalaryManagementPage userRole="hr" />} />
                        <Route path="salary" element={<HRSalaryManagementPage userRole="hr" />} />
                        <Route path="employees/salary" element={<HRSalaryManagementPage userRole="hr" />} />
                        <Route path="employees" element={<HREmployeeDirectory />} />
                        <Route path="employees/directory" element={<HREmployeeDirectory />} />

                        {/* HR EMPLOYEE MANAGEMENT (REPORTS, NOTIFICATIONS, DOCUMENTS, ANNOUNCEMENTS) */}
                        <Route path="employees/reports" element={<HRReportManagement />} />
                        <Route path="reports" element={<HRReportManagement />} />
                        <Route path="employee-reports" element={<HRReportManagement />} />
                        <Route path="employees/notifications" element={<HRNotificationManagement />} />
                        <Route path="notifications" element={<HRNotificationManagement />} />
                        <Route path="employees/announcements" element={<HRAnnouncementManagement />} />
                        <Route path="announcements" element={<HRAnnouncementManagement />} />
                        <Route path="employees/documents" element={<HRDocumentManagement />} />
                        <Route path="documents" element={<HRDocumentManagement />} />

                        {/* HR EMPLOYEE ATTENDANCE MANAGEMENT */}
                        <Route path="attendance" element={<EmployeeAttendance />} />
                        <Route path="attendance/smart" element={<Navigate to="/hr/attendance" replace />} />
                        <Route path="smart-attendance" element={<Navigate to="/hr/attendance" replace />} />


                        {/* HR LEAVE MANAGEMENT */}
                        <Route path="leave" element={<HRLeaveManagement />} />
                        <Route path="leaves" element={<HRLeaveManagement />} />
                        <Route path="leave/holidays" element={<HRHolidayManagement />} />
                        <Route path="leave-management/holidays" element={<HRHolidayManagement />} />
                        <Route path="holidays" element={<HRHolidayManagement />} />

                        {/* HR WORK FROM HOME (WFH) MANAGEMENT */}
                        <Route path="wfh" element={<HRWFHManagement />} />

                        <Route
                          path="recruitment"
                          element={
                            <DemoPage
                              badge="Talent Acquisition"
                              title="Recruitment & Pipeline Management"
                              description="Manage candidate interviews, job postings, candidate evaluations, and offer letters."
                              stats={[
                                { label: "Open Job Positions", value: "14 Roles", subtext: "Engineering & Design", icon: <FiUserPlus /> },
                                { label: "Total Candidates", value: "142 Applicants", subtext: "28 interviewed", icon: <FiUsers /> },
                                { label: "Offers Extended", value: "6 Offers", subtext: "4 accepted", icon: <FiCheckCircle /> },
                                { label: "Avg Time to Hire", value: "18 Days", subtext: "Top industry speed", icon: <FiClock /> },
                              ]}
                            />
                          }
                        />
                        <Route
                          path="management"
                          element={
                            <DemoPage
                              badge="Organizational HR"
                              title="HR Operations & Policies"
                              description="Configure HR company policies, appraisal cycles, compensation bands, and compliance rules."
                              stats={[
                                { label: "Departments", value: "8 Active", subtext: "Across 3 offices", icon: <FiBriefcase /> },
                                { label: "Policy Updates", value: "2 Pending", subtext: "Q3 Handbook review", icon: <FiClock /> },
                                { label: "Appraisal Cycle", value: "Q3 Open", subtext: "Self reviews due Friday", icon: <FiCalendar /> },
                                { label: "Compliance", value: "100%", subtext: "Statutory verified", icon: <FiCheckCircle /> },
                              ]}
                            />
                          }
                        />
                        <Route
                          path="projects"
                          element={
                            <DemoPage
                              badge="Resource Allocation"
                              title="Project & Staff Allocation"
                              description="Map staff to cross-functional projects, monitor billable hours, and forecast resource requirements."
                              stats={[
                                { label: "Active Projects", value: "24 Projects", subtext: "18 on schedule", icon: <FiLayers /> },
                                { label: "Staff Allocated", value: "390 Devs", subtext: "81% utilization", icon: <FiUsers /> },
                                { label: "Bench Strength", value: "32 Staff", subtext: "Available for projects", icon: <FiClock /> },
                                { label: "Client Milestones", value: "12 This Month", subtext: "All deliverables met", icon: <FiAward /> },
                              ]}
                            />
                          }
                        />

                        {/* HR WORK, SHIFT & BREAK MANAGEMENT */}
                        <Route path="shifts" element={<HRShiftManagement />} />
                        <Route path="shift-management" element={<HRShiftManagement />} />
                        <Route path="work/shifts" element={<HRShiftManagement />} />
                        <Route path="work/shift-management" element={<HRShiftManagement />} />
                        <Route path="breaks" element={<HRBreakManagement />} />
                        <Route path="break-management" element={<HRBreakManagement />} />
                        <Route path="work/breaks" element={<HRBreakManagement />} />
                        <Route path="work/break-management" element={<HRBreakManagement />} />
                        <Route path="tasks" element={<HRShiftManagement />} />
                        <Route path="work" element={<HRShiftManagement />} />
                        <Route path="tasks/wfh" element={<HRWFHManagement />} />
                        <Route path="work/wfh" element={<HRWFHManagement />} />
                      </Route>
                    </Routes>
                  </SalaryProvider>
                </EmployeeProvider>
              </BreakProvider>
            </ShiftProvider>
          </HolidayProvider>
        </WFHProvider>
      </LeaveProvider>
    </SmartAttendanceProvider>
  </AttendanceProvider>
</AuthProvider>
  );
}
