import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "../Components/Navigation/AppSidebar";
import AppTopHeader from "../Components/Navigation/AppTopHeader";
import { useAuth } from "../Context/AuthContext.jsx";

export default function UserLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { currentUser } = useAuth();

  const userProfile = {
    name: currentUser?.name || "Employee",
    role: currentUser?.role === "hr" ? "HR Administrator" : currentUser?.role === "superadmin" ? "Super Admin" : "Senior Developer",
    email: currentUser?.email || "employee@skywork.io",
    portalBadge: currentUser?.role === "hr" ? "HR Admin" : currentUser?.role === "superadmin" ? "Super Admin" : "Employee",
    brandHome: currentUser?.role === "superadmin" ? "/super-admin" : currentUser?.role === "hr" ? "/hr" : "/",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    id: currentUser?.id || "EMP001"
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsCollapsed((prev) => !prev);
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800">
      {/* 1. Left Collapsible / Fixed Universal Sidebar for User */}
      <AppSidebar
        role={currentUser?.role || "user"}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        user={userProfile}
      />

      {/* 2. Main Content Wrapper */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top Header with Breadcrumbs, Toggle & Actions */}
        <AppTopHeader
          role={currentUser?.role || "user"}
          user={userProfile}
          brandHome={userProfile.brandHome}
          portalBadge={userProfile.portalBadge}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Page Body / Router Outlet */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
