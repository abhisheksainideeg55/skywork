import React, { useState } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUserPlus,
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiClock,
  FiHome,
  FiLayers,
  FiCheckSquare,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiX,
  FiDollarSign,
  FiBarChart2,
  FiBell,
  FiFileText,
  FiRadio,
  FiShield,
} from "react-icons/fi";
import Logo from "../Header/Logo";
import { useAuth } from "../../Context/AuthContext.jsx";

export default function AppSidebar({
  role = "user", // "user" | "hr" | "superadmin"
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile = () => {},
  customMenuItems = null,
  user = null,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, hasPermission } = useAuth();
  const [menuSearch, setMenuSearch] = useState("");
  const [expandedMenus, setExpandedMenus] = useState({
    "Employee Management": true,
    "Attendance Management": true,
    "Leave Management": true,
    "Work Management": true,
    "Employee Vault": true,
  });

  const toggleDropdown = (menuLabel) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuLabel]: !prev[menuLabel],
    }));
  };

  // User Profile defaults per role
  const roleProfiles = {
    user: {
      name: "Abhishek Sharma",
      role: "Senior Developer",
      email: "employee@skywork.io",
      portalBadge: "Employee",
      brandHome: "/",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    employee: {
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
    }
  };

  const currentProfile = {
    ...(roleProfiles[role] || roleProfiles.user),
    ...(currentUser ? {
      name: currentUser.name,
      role: currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role === 'hr' ? 'HR Admin' : 'Employee',
      email: currentUser.email,
      portalBadge: currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role === 'hr' ? 'HR Admin' : 'Employee',
      brandHome: currentUser.role === 'superadmin' ? '/super-admin' : currentUser.role === 'hr' ? '/hr' : '/'
    } : {}),
    ...user,
  };

  // Pre-configured menus for each role
  const userMenuItems = [
    { label: "Dashboard", path: "/", icon: FiHome, exact: true },
    { label: "My Attendance", path: "/attendance", icon: FiCalendar },
    {
      label: "Leave Management",
      icon: FiClock,
      isDropdown: true,
      children: [
        { label: "My Leaves", path: "/leave" },
        { label: "Holiday Calendar", path: "/leave/holidays" },
      ],
    },
    {
      label: "Work Management",
      icon: FiCheckSquare,
      isDropdown: true,
      children: [
        { label: "WFH Requests", path: "/wfh" },
        { label: "My Shifts", path: "/shifts" },
        { label: "Break Tracker", path: "/breaks" },
      ],
    },
    {
      label: "Employee Vault",
      icon: FiUsers,
      isDropdown: true,
      children: [
        { label: "Salary & Payslips", path: "/salary" },
        { label: "Performance Reports", path: "/reports" },
        { label: "Notification Center", path: "/notifications" },
        { label: "Announcements", path: "/announcements" },
        { label: "My Documents", path: "/documents" },
      ],
    },
    { label: "My Profile", path: "/profile", icon: FiUser },
    { label: "Settings", path: "/settings", icon: FiSettings },
  ];

  const hrMenuItems = [
    { label: "HR Dashboard", path: "/hr", icon: FiHome, exact: true },
    { label: "Recruitment", path: "/hr/recruitment", icon: FiUserPlus },
    { label: "HR Management", path: "/hr/management", icon: FiBriefcase },
    {
      label: "Employee Management",
      icon: FiUsers,
      isDropdown: true,
      children: [
        { label: "Staff & Permissions", path: "/hr/employees" },
        { label: "Salary Management", path: "/hr/salary-management" },
        { label: "Report Management", path: "/hr/employees/reports" },
        { label: "Notification", path: "/hr/employees/notifications" },
        { label: "Document", path: "/hr/employees/documents" },
        { label: "Announcement", path: "/hr/employees/announcements" },
      ],
    },
    {
      label: "Employee Attendance",
      path: "/hr/attendance",
      icon: FiCalendar,
    },

    {
      label: "Leave Management",
      icon: FiClock,
      isDropdown: true,
      children: [
        { label: "Leave Management", path: "/hr/leave" },
        { label: "Holiday Management", path: "/hr/leave/holidays" },
      ],
    },
    { label: "Project Management", path: "/hr/projects", icon: FiLayers },
    {
      label: "Work Management",
      icon: FiCheckSquare,
      isDropdown: true,
      children: [
        { label: "Shift Management", path: "/hr/shifts" },
        { label: "WFH Management", path: "/hr/wfh" },
        { label: "Break Management", path: "/hr/breaks" },
      ],
    },
    { label: "My Profile", path: "/profile", icon: FiUser },
    { label: "Settings", path: "/settings", icon: FiSettings },
  ];

  const selectedMenuItems =
    customMenuItems ||
    (role === "hr"
      ? hrMenuItems
      : userMenuItems);

  // Filter items by search input
  const filteredMenu = selectedMenuItems.filter((item) => {
    if (!menuSearch) return true;
    const matchParent = item.label.toLowerCase().includes(menuSearch.toLowerCase());
    const matchChild =
      item.children &&
      item.children.some((c) => c.label.toLowerCase().includes(menuSearch.toLowerCase()));
    return matchParent || matchChild;
  });

  // Helper to check if a link or child is active
  const isPathActive = (targetPath, exact = false) => {
    const current = location.pathname;
    if (exact || targetPath === "/" || targetPath === "/hr" || targetPath === "/super-admin") {
      return current === targetPath;
    }

    // HR Alias matches
    if (targetPath === "/hr/salary-management" || targetPath === "/hr/employees/salary") {
      return current === "/hr/salary-management" || current === "/hr/employees/salary" || current === "/hr/salary";
    }
    if (targetPath === "/hr/employees/reports") {
      return current === "/hr/employees/reports" || current === "/hr/reports" || current === "/hr/employee-reports";
    }
    if (targetPath === "/hr/employees/notifications") {
      return current === "/hr/employees/notifications" || current === "/hr/notifications";
    }
    if (targetPath === "/hr/employees/documents") {
      return current === "/hr/employees/documents" || current === "/hr/documents";
    }
    if (targetPath === "/hr/employees/announcements") {
      return current === "/hr/employees/announcements" || current === "/hr/announcements";
    }
    if (targetPath === "/hr/attendance/smart") {
      return current === "/hr/attendance/smart" || current === "/hr/smart-attendance";
    }
    if (targetPath === "/hr/leave") {
      return current === "/hr/leave" || current === "/hr/leaves";
    }
    if (targetPath === "/hr/leave/holidays") {
      return current === "/hr/leave/holidays" || current === "/hr/leave-management/holidays" || current === "/hr/holidays";
    }
    if (targetPath === "/hr/shifts") {
      return current === "/hr/shifts" || current === "/hr/shift-management" || current === "/hr/tasks" || current === "/hr/work";
    }
    if (targetPath === "/hr/wfh") {
      return current === "/hr/wfh" || current === "/hr/wfh-management" || current === "/hr/tasks/wfh" || current === "/hr/work/wfh";
    }
    if (targetPath === "/hr/breaks") {
      return current === "/hr/breaks" || current === "/hr/break-management" || current === "/hr/work/breaks";
    }

    // User Alias matches
    if (targetPath === "/leave") {
      return current === "/leave" || current === "/leave-management";
    }
    if (targetPath === "/leave/holidays") {
      return current === "/leave/holidays" || current === "/leave-management/holidays" || current === "/holidays";
    }
    if (targetPath === "/wfh") {
      return current === "/wfh" || current === "/wfh-management";
    }
    if (targetPath === "/shifts") {
      return current === "/shifts" || current === "/shift-management" || current === "/work/shifts";
    }
    if (targetPath === "/breaks") {
      return current === "/breaks" || current === "/break-management" || current === "/work/breaks";
    }
    if (targetPath === "/salary") {
      return current === "/salary" || current === "/salary-management";
    }
    if (targetPath === "/notifications") {
      return current === "/notifications" || current === "/notification";
    }
    if (targetPath === "/announcements") {
      return current === "/announcements" || current === "/announcement";
    }
    if (targetPath === "/documents") {
      return current === "/documents" || current === "/document";
    }

    return current === targetPath || (targetPath !== "/" && current.startsWith(targetPath));
  };

  const portalOptions = [
    { label: "Employee", path: "/", badge: "Employee", active: role === "user" || role === "employee" },
    { label: "HR Admin", path: "/hr", badge: "HR Admin", active: role === "hr" },
  ];

  if (currentUser?.role === 'superadmin') {
    portalOptions.push({ label: "Super Admin", path: "/super-admin", badge: "Super Admin", active: role === "superadmin" });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isMobileOpen
            ? "translate-x-0 w-64 sm:w-72 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
        aria-label={`${currentProfile.portalBadge} Navigation Sidebar`}
      >
        {/* Top Header / Logo Section */}
        <div className="flex flex-col">
          <div
            className={`flex items-center h-16 border-b border-slate-100 transition-all duration-300 ${
              isCollapsed ? "lg:justify-center px-2" : "justify-between px-4"
            }`}
          >
            <div className="flex items-center justify-center">
              <Logo
                brandHome={currentProfile.brandHome}
                portalBadge={currentProfile.portalBadge}
                isCollapsed={isCollapsed}
              />
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Search Menu Input (Hidden when collapsed on desktop) */}
          {!isCollapsed && (
            <div className="px-3.5 pt-2 pb-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Quick Super Admin Navigation Item if Super Admin */}
          {currentUser?.role === 'superadmin' && (
            <div className="px-2.5 pb-1">
              <NavLink
                to="/super-admin"
                onClick={onCloseMobile}
                title="Super Admin Portal"
                className={`flex items-center py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  location.pathname.startsWith('/super-admin')
                    ? 'bg-purple-700 text-white border-purple-800 shadow-sm'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                } ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <FiShield className="w-4 h-4 shrink-0 text-purple-600" />
                  {!isCollapsed && <span>Super Admin Console</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 uppercase tracking-wider">
                    Root
                  </span>
                )}
              </NavLink>
            </div>
          )}

          {/* Navigation Menu Links */}
          <div className="px-2.5 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {filteredMenu.map((item, idx) => {
              const Icon = item.icon;

              // Expandable Item with Submenu Dropdown
              if (item.isDropdown) {
                const isChildActive = item.children?.some((c) =>
                  isPathActive(c.path, c.exact)
                );
                const isExpanded = Boolean(expandedMenus[item.label]);

                return (
                  <div key={idx} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.label)}
                      title={item.label}
                      className={`w-full flex items-center py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isCollapsed ? "justify-center px-2" : "justify-between px-3"
                      } ${
                        isChildActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div
                        className={`flex items-center ${
                          isCollapsed ? "justify-center" : "gap-3"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isChildActive ? "text-indigo-600" : "text-slate-400"
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <FiChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-indigo-600" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* Submenu Children */}
                    {isExpanded && !isCollapsed && (
                      <div className="pl-7 pr-2 py-1 space-y-1 border-l-2 border-indigo-100 ml-4">
                        {item.children?.map((child, cIdx) => {
                          const active = isPathActive(child.path, child.exact);
                          return (
                            <NavLink
                              key={cIdx}
                              to={child.path}
                              onClick={onCloseMobile}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                active
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  active ? "bg-white" : "bg-slate-400"
                                }`}
                              />
                              <span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Standard Navigation Link
              const active = isPathActive(item.path, item.exact);

              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={`flex items-center py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                    isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                  } ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom / Profile and Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* User Quick Info */}
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="overflow-hidden leading-tight">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentProfile.name}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {currentProfile.role}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center px-2" : "gap-3 px-3"
            }`}
          >
            <FiLogOut className="w-4 h-4 text-rose-500 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
