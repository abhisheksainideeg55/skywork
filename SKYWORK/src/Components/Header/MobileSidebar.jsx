import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiX, FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import Logo from "./Logo";

export default function MobileSidebar({
  isOpen,
  onClose,
  navItems = [],
  user,
  brandHome = "/",
  portalBadge,
}) {
  // Lock body scroll when sidebar is open and support Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, onClose]);

  const currentUser = {
    name: "Abhishek",
    role: "HR Admin",
    email: "abhishek@skywork.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    ...user,
  };

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-modal="true"
      role="dialog"
      aria-label="Mobile Navigation Sidebar"
    >
      {/* Dark / Blurred Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Slide-over Panel (Left to Right) */}
      <div
        className={`fixed top-0 left-0 w-72 sm:w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto overflow-x-hidden transform transition-transform duration-300 ease-in-out z-10 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="flex items-center justify-between px-5 py-4.5 border-b border-slate-100">
            <div onClick={onClose}>
              <Logo brandHome={brandHome} portalBadge={portalBadge} />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation sidebar"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <FiX className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* User Quick Info */}
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500 font-medium truncate">
                {currentUser.role || currentUser.email}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label="Mobile navigation links">
            <p className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={
                    item.exact ??
                    (item.path === "/" ||
                      item.path === "/hr" ||
                      item.path === "/super-admin")
                  }
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {Icon && (
                        <Icon
                          className={`w-5 h-5 shrink-0 ${
                            isActive ? "text-white" : "text-slate-400"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <FiUser className="w-4 h-4 text-slate-400" />
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <FiSettings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={() => {
              onClose();
              alert("Logged out successfully");
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer text-left"
          >
            <FiLogOut className="w-4 h-4 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
