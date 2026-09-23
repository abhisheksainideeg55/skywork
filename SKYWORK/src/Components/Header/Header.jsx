import React, { useState } from "react";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import ProfileMenu from "./ProfileMenu";
import HamburgerButton from "./HamburgerButton";
import MobileSidebar from "./MobileSidebar";
import NotificationBellDropdown from "../Employee/Notifications/NotificationBellDropdown";

export default function Header({
  navItems = [],
  user,
  brandHome = "/",
  portalBadge,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* LEFT: Logo Section */}
            <div className="flex items-center shrink-0">
              <Logo brandHome={brandHome} portalBadge={portalBadge} />
            </div>

            {/* CENTER: Desktop Navigation Tabs (Hidden on mobile/tablet) */}
            <DesktopNav navItems={navItems} />

            {/* RIGHT: Actions Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Bell & Dropdown */}
              <NotificationBellDropdown />

              {/* Profile Menu (Visible on both Desktop & Mobile) */}
              <ProfileMenu user={user} />

              {/* Hamburger Button (Visible only on <lg mobile/tablet, placed immediately to the RIGHT of Profile) */}
              <HamburgerButton
                isOpen={isSidebarOpen}
                onClick={() => setIsSidebarOpen((prev) => !prev)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sidebar */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navItems={navItems}
        user={user}
        brandHome={brandHome}
        portalBadge={portalBadge}
      />
    </>
  );
}
