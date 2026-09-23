import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiHome,
  FiChevronRight,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import ProfileMenu from "../Header/ProfileMenu";
import NotificationBellDropdown from "../Employee/Notifications/NotificationBellDropdown";
import { useAuth } from "../../Context/AuthContext.jsx";

export default function AppTopHeader({
  onToggleSidebar,
  role = "user", // "user" | "hr" | "superadmin"
  user = null,
  portalBadge = null,
  brandHome = "/",
}) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const { currentUser } = useAuth();

  const defaultProfiles = {
    user: {
      name: "Abhishek Sharma",
      role: "Senior Developer",
      email: "employee@skywork.io",
      portalBadge: "Employee",
      brandHome: "/",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    hr: {
      name: "HR Administrator",
      role: "HR Lead & Operations",
      email: "hr@skywork.io",
      portalBadge: "HR Admin",
      brandHome: "/hr",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    superadmin: {
      name: "Super Admin",
      role: "System Authority",
      email: "superadmin@skywork.io",
      portalBadge: "Super Admin",
      brandHome: "/super-admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  };

  const activeProfile = {
    ...(defaultProfiles[role] || defaultProfiles.user),
    ...(currentUser ? {
      name: currentUser.name,
      role: currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role === 'hr' ? 'HR Admin' : 'Employee',
      email: currentUser.email,
      portalBadge: currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role === 'hr' ? 'HR Admin' : 'Employee',
      brandHome: currentUser.role === 'superadmin' ? '/super-admin' : currentUser.role === 'hr' ? '/hr' : '/'
    } : {}),
    ...user,
  };

  const currentPortalBadge = portalBadge || activeProfile.portalBadge;
  const currentBrandHome = brandHome || activeProfile.brandHome;

  // Auto-detect page title based on pathname and role
  const getPageTitle = () => {
    const path = location.pathname;

    // Super Admin Paths
    if (path === "/super-admin") return "Super Admin Dashboard";
    if (path.startsWith("/super-admin/users")) return "User & Permission Delegation";
    if (path.startsWith("/super-admin/roles")) return "Roles & Access Control";
    if (path.startsWith("/super-admin/audit")) return "Security Audit Logs";
    if (path.startsWith("/super-admin/settings")) return "System Security Settings";

    // HR Paths
    if (path.includes("/hr/employees/salary") || path === "/hr/salary" || path === "/hr/salary-management") return "Salary & Payroll Management";
    if (path.includes("/hr/employees/reports") || path === "/hr/reports" || path === "/hr/employee-reports") return "HR Analytics & Report Management";
    if (path.includes("/hr/employees/notifications") || path === "/hr/notifications") return "Company Notification Center";
    if (path.includes("/hr/employees/documents") || path === "/hr/documents") return "Employee Document Vault";
    if (path.includes("/hr/employees/announcements") || path === "/hr/announcements") return "Company Announcements";
    if (path.includes("/hr/attendance/smart") || path === "/hr/smart-attendance") return "Smart Attendance Monitoring";
    if (path.includes("/hr/attendance")) return "Employee Attendance Management";
    if (path.includes("/hr/employees")) return "Employees Management";
    if (path.includes("/hr/recruitment")) return "Recruitment & Talent Acquisition";
    if (path.includes("/hr/management")) return "HR Operations & Policies";
    if (path.includes("/hr/leave/holidays") || path.includes("/hr/leave-management/holidays") || path === "/hr/holidays") return "Holiday Management";
    if (path.includes("/hr/leaves") || path.includes("/hr/leave")) return "Leave Management";
    if (path.includes("/hr/wfh")) return "Work From Home Management";
    if (path.includes("/hr/breaks")) return "Break Tracker & Management";
    if (path.includes("/hr/shifts") || path.includes("/hr/shift-management")) return "Shift Schedule Management";
    if (path.includes("/hr/projects")) return "Project & Staff Allocation";
    if (path.includes("/hr/tasks") || path.includes("/hr/work")) return "Work Management";
    if (path === "/hr") return "HR Executive Dashboard";

    // User / Employee Paths
    if (path === "/attendance") return "My Attendance Timesheet";
    if (path === "/leave" || path === "/leave-management") return "My Leave Management";
    if (path.includes("/leave/holidays") || path === "/holidays") return "Company Holiday Calendar";
    if (path === "/wfh" || path === "/wfh-management") return "My WFH Requests";
    if (path === "/shifts" || path === "/shift-management" || path.includes("/work/shifts")) return "My Shift Schedule";
    if (path === "/breaks" || path === "/break-management" || path.includes("/work/breaks")) return "My Break Tracker";
    if (path === "/salary" || path === "/salary-management") return "Salary & Payslips";
    if (path === "/reports") return "My Performance Reports";
    if (path === "/notifications" || path === "/notification") return "My Notifications";
    if (path === "/announcements" || path === "/announcement") return "Company Announcements";
    if (path === "/documents" || path === "/document") return "My KYC & Documents Vault";
    if (path === "/profile") return "My Profile & Bio";
    if (path === "/settings") return "Account & System Settings";
    if (path === "/") return "Employee Dashboard";

    return "Skywork HRMS";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT SECTION: Sidebar Toggle & Breadcrumbs */}
          <div className="flex items-center gap-2.5 sm:gap-4 overflow-hidden">
            {/* Sidebar Hamburger Button (Mobile / Collapsed Desktop) */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link
                to={currentBrandHome}
                className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
              >
                <FiHome className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentPortalBadge}</span>
              </Link>
              <FiChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="text-slate-800 font-semibold truncate max-w-[200px] md:max-w-[320px]">
                {getPageTitle()}
              </span>
            </nav>

            {/* Current Page Title on Mobile */}
            <h1 className="sm:hidden text-sm font-bold text-slate-800 truncate">
              {getPageTitle()}
            </h1>
          </div>

          {/* RIGHT SECTION: Role Badge, Notifications & Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Super Admin Switch Button */}
            {currentUser?.role === 'superadmin' && !location.pathname.startsWith('/super-admin') && (
              <Link
                to="/super-admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 transition-colors shadow-2xs"
              >
                <span>Super Admin Console &rarr;</span>
              </Link>
            )}

            {/* Portal Role Badge */}
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-700/10">
              {currentPortalBadge}
            </span>

            {/* Notifications Dropdown */}
            <NotificationBellDropdown user={activeProfile} />

            {/* User Profile & Role Switch Dropdown */}
            <ProfileMenu user={activeProfile} />
          </div>
        </div>
      </div>
    </header>
  );
}
