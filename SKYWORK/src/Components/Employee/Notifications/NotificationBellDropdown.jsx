import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiArrowRight,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiCalendar,
  FiHome,
  FiCoffee,
  FiVolume2,
  FiX,
  FiExternalLink,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function NotificationBellDropdown() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } =
    useEmployee();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  // Filter tabs for the dropdown
  const filterTabs = [
    { id: "All", label: "All" },
    { id: "Salary & Payroll", label: "💵 Salary" },
    { id: "Leave & Attendance", label: "🏖️ Leaves" },
    { id: "WFH & Remote", label: "🏠 WFH" },
    { id: "Breaks & Shifts", label: "☕ Breaks" },
    { id: "Employee ID Card", label: "🪪 ID Cards" },
  ];

  const displayedNotifications = notifications
    .filter((n) => {
      if (activeFilter === "All") return true;
      return n.category === activeFilter;
    })
    .slice(0, 6); // Top 6 most recent in dropdown

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Salary & Payroll":
        return <FiDollarSign className="w-4 h-4 text-emerald-600" />;
      case "Employee ID Card":
        return <FiCreditCard className="w-4 h-4 text-purple-600" />;
      case "KYC & Profile":
      case "Document Vault":
        return <FiFileText className="w-4 h-4 text-blue-600" />;
      case "Leave & Attendance":
        return <FiCalendar className="w-4 h-4 text-amber-600" />;
      case "WFH & Remote":
        return <FiHome className="w-4 h-4 text-teal-600" />;
      case "Breaks & Shifts":
        return <FiCoffee className="w-4 h-4 text-orange-600" />;
      default:
        return <FiVolume2 className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getCategoryBg = (category) => {
    switch (category) {
      case "Salary & Payroll":
        return "bg-emerald-50 border-emerald-200";
      case "Employee ID Card":
        return "bg-purple-50 border-purple-200";
      case "KYC & Profile":
      case "Document Vault":
        return "bg-blue-50 border-blue-200";
      case "Leave & Attendance":
        return "bg-amber-50 border-amber-200";
      case "WFH & Remote":
        return "bg-teal-50 border-teal-200";
      case "Breaks & Shifts":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-indigo-50 border-indigo-200";
    }
  };

  // Determine full notifications page link based on current path context
  const fullNotifLink = location.pathname.startsWith("/hr")
    ? "/hr/employees/notifications"
    : "/notifications";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl transition-all cursor-pointer ${
          isOpen
            ? "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
        title="View Notifications & HRMS Alerts"
      >
        <FiBell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-40" />
          </span>
        )}
      </button>

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Dropdown Header */}
          <div className="px-4 py-3 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                <FiBell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                  Notifications & Alerts
                </h4>
                <p className="text-[10px] text-slate-300">
                  {unreadCount === 0
                    ? "All caught up"
                    : `${unreadCount} unread action items`}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <FiCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FiBell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">No notifications found</p>
                <p className="text-[11px] text-slate-400">
                  Try selecting a different filter category.
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors hover:bg-slate-50 flex items-start gap-3 ${
                    !notif.read ? "bg-indigo-50/20" : ""
                  }`}
                >
                  {/* Category Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${getCategoryBg(
                      notif.category
                    )}`}
                  >
                    {getCategoryIcon(notif.category)}
                  </div>

                  {/* Notification Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                        {notif.category}
                      </span>
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="w-2 h-2 rounded-full bg-indigo-600 hover:scale-125 transition-transform"
                          title="Mark as read"
                        />
                      )}
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                      {notif.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.content}
                    </p>

                    {/* Action Link & Timestamp */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-100">
                      {notif.actionLink && notif.actionLink !== "#" ? (
                        <Link
                          to={notif.actionLink}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <span>{notif.actionLabel || "View Details"}</span>
                          <FiArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span />
                      )}

                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Full Hub Link */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 text-center">
            <Link
              to={fullNotifLink}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
            >
              <span>View All Notifications in Hub</span>
              <FiExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
