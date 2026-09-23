import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "../Components/Navigation/AppSidebar";
import AppTopHeader from "../Components/Navigation/AppTopHeader";

export default function ManagerLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const managerProfile = {
    name: "Abhishek Sharma",
    role: "Engineering Manager",
    email: "abhishek.mgr@skywork.io",
    portalBadge: "Manager",
    brandHome: "/manager",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
      {/* 1. Left Collapsible / Fixed Universal Sidebar for Manager */}
      <AppSidebar
        role="manager"
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        user={managerProfile}
      />

      {/* 2. Main Content Wrapper */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top Header with Breadcrumbs, Toggle & Actions */}
        <AppTopHeader
          role="manager"
          user={managerProfile}
          brandHome="/manager"
          portalBadge="Manager"
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
