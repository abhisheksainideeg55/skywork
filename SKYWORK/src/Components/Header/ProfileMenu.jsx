import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../Context/AuthContext.jsx";

export default function ProfileMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currentUser: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const currentUser = {
    name: authUser?.name || "User",
    role: authUser?.role || "employee",
    email: authUser?.email || "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    id: authUser?.id || "",
    ...user,
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
        className="flex items-center gap-2 sm:gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl hover:bg-slate-100/90 active:bg-slate-200/70 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer border border-transparent hover:border-slate-200/80"
      >
        {/* Avatar with status indicator */}
        <div className="relative shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs"
          />
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
            title="Online"
          />
        </div>

        {/* User Name on larger screens */}
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">
            {currentUser.name}
          </span>
          {currentUser.role && (
            <span className="text-[11px] text-slate-500 font-medium capitalize">
              {currentUser.role}
            </span>
          )}
        </div>

        {/* Dropdown Chevron */}
        <FiChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-600" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 py-2 z-50 transition-all duration-200 origin-top-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
        role="menu"
      >
        {/* User Card Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {currentUser.name} <span className="text-xs font-mono text-gray-500">({currentUser.id})</span>
            </p>
            <p className="text-xs text-slate-500 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* Switch Portal / Role */}
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
            Authorized Portals
          </p>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-center">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-2xs"
            >
              Employee
            </Link>
            {(currentUser.role === 'hr' || currentUser.role === 'superadmin') && (
              <Link
                to="/hr"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-2xs"
              >
                HR Admin
              </Link>
            )}
            {currentUser.role === 'superadmin' && (
              <Link
                to="/super-admin"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-2xs"
              >
                Super Admin
              </Link>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          >
            <FiUser className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            <span>Profile</span>
          </Link>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          >
            <FiSettings className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            <span>Settings</span>
          </Link>
        </div>

        {/* Logout Divider & Action */}
        <div className="border-t border-slate-100 pt-1">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
              navigate('/login');
            }}
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/80 transition-colors text-left font-medium cursor-pointer"
          >
            <FiLogOut className="w-4 h-4 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
