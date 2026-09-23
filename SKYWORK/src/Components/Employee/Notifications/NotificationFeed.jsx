import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiBell,
  FiBookmark,
  FiTrash2,
  FiCheck,
  FiCheckCircle,
  FiArrowRight,
  FiAlertCircle,
  FiClock,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiCalendar,
  FiHome,
  FiCoffee,
  FiVolume2,
  FiZap,
  FiChevronDown,
  FiChevronUp,
  FiShield,
  FiXCircle,
  FiInfo,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useEmployee } from "../../../Context/EmployeeContext";
import { NOTIFICATION_CATEGORIES } from "../../../Data/employeeData";

export default function NotificationFeed({ onOpenCreate }) {
  const {
    notifications,
    markNotificationAsRead,
    togglePinNotification,
    deleteNotification,
    notifySalaryCredited,
    notifyIdCardIssued,
    notifyKycUpdated,
    notifyDocumentUploaded,
    notifyLeaveStatus,
    notifyWfhStatus,
    notifyBreakAlert,
  } = useEmployee();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Unread" | "Pinned"
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedFeedback, setSimulatedFeedback] = useState("");

  // Category chip categories
  const categoryChips = [
    { id: "All Categories", label: "All Feeds", icon: FiBell },
    { id: "Salary & Payroll", label: "💵 Salary", icon: FiDollarSign },
    { id: "Employee ID Card", label: "🪪 ID Cards", icon: FiCreditCard },
    { id: "KYC & Profile", label: "🆔 KYC Profile", icon: FiShield },
    { id: "Document Vault", label: "📁 Documents", icon: FiFileText },
    { id: "Leave & Attendance", label: "🏖️ Leaves", icon: FiCalendar },
    { id: "WFH & Remote", label: "🏠 WFH", icon: FiHome },
    { id: "Breaks & Shifts", label: "☕ Breaks", icon: FiCoffee },
    { id: "Company Announcement", label: "📢 Announcements", icon: FiVolume2 },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        const matchSearch =
          searchTerm === "" ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.targetAudience.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sender.toLowerCase().includes(searchTerm.toLowerCase());

        const matchCat =
          selectedCategory === "All Categories" ||
          item.category === selectedCategory;

        const matchPriority =
          priorityFilter === "All" || item.priority === priorityFilter;

        const matchStatus =
          statusFilter === "All"
            ? true
            : statusFilter === "Unread"
            ? !item.read
            : statusFilter === "Pinned"
            ? item.pinned
            : true;

        return matchSearch && matchCat && matchPriority && matchStatus;
      })
      .sort((a, b) => {
        // Pinned first, then by date descending
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [notifications, searchTerm, selectedCategory, priorityFilter, statusFilter]);

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recent";
    }
  };

  const getCategoryTheme = (category) => {
    switch (category) {
      case "Salary & Payroll":
        return {
          icon: <FiDollarSign className="w-4 h-4 text-emerald-600" />,
          badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          cardBorder: "border-emerald-200 hover:border-emerald-300",
          accentBar: "bg-emerald-500",
        };
      case "Employee ID Card":
        return {
          icon: <FiCreditCard className="w-4 h-4 text-purple-600" />,
          badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
          cardBorder: "border-purple-200 hover:border-purple-300",
          accentBar: "bg-purple-500",
        };
      case "KYC & Profile":
        return {
          icon: <FiShield className="w-4 h-4 text-blue-600" />,
          badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
          cardBorder: "border-blue-200 hover:border-blue-300",
          accentBar: "bg-blue-500",
        };
      case "Document Vault":
        return {
          icon: <FiFileText className="w-4 h-4 text-cyan-600" />,
          badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
          cardBorder: "border-cyan-200 hover:border-cyan-300",
          accentBar: "bg-cyan-500",
        };
      case "Leave & Attendance":
        return {
          icon: <FiCalendar className="w-4 h-4 text-amber-600" />,
          badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
          cardBorder: "border-amber-200 hover:border-amber-300",
          accentBar: "bg-amber-500",
        };
      case "WFH & Remote":
        return {
          icon: <FiHome className="w-4 h-4 text-teal-600" />,
          badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
          cardBorder: "border-teal-200 hover:border-teal-300",
          accentBar: "bg-teal-500",
        };
      case "Breaks & Shifts":
        return {
          icon: <FiCoffee className="w-4 h-4 text-orange-600" />,
          badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
          cardBorder: "border-orange-200 hover:border-orange-300",
          accentBar: "bg-orange-500",
        };
      default:
        return {
          icon: <FiVolume2 className="w-4 h-4 text-indigo-600" />,
          badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          cardBorder: "border-indigo-200 hover:border-indigo-300",
          accentBar: "bg-indigo-500",
        };
    }
  };

  const handleSimulate = (fn, label) => {
    fn();
    setSimulatedFeedback(`✅ Triggered "${label}" successfully! Check feed & bell.`);
    setTimeout(() => setSimulatedFeedback(""), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categoryChips.map((chip) => {
          const count =
            chip.id === "All Categories"
              ? notifications.length
              : notifications.filter((n) => n.category === chip.id).length;

          const isSelected = selectedCategory === chip.id;
          const Icon = chip.icon;

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setSelectedCategory(chip.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5 opacity-80" />
              <span>{chip.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Simulator Trigger Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-4 border border-indigo-800/40 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <FiZap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                <span>Real-Time HRMS Notification Simulator</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                  Live Dispatcher
                </span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Trigger real-time notifications for Salary credit, ID card, KYC, Document approval, Leaves, WFH, and Break alarms.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSimulator((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>{showSimulator ? "Hide Simulator" : "Open Event Triggers"}</span>
            {showSimulator ? (
              <FiChevronUp className="w-3.5 h-3.5" />
            ) : (
              <FiChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {simulatedFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <FiCheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{simulatedFeedback}</span>
          </div>
        )}

        {showSimulator && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifySalaryCredited({
                      employeeName: "Abhishek Sharma",
                      amount: "₹1,54,100",
                      bankName: "HDFC Bank",
                    }),
                  "Salary Credited Alert"
                )
              }
              className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-left text-xs font-semibold text-emerald-200 transition-colors cursor-pointer"
            >
              💵 Salary Received (₹1.54L)
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyIdCardIssued({
                      employeeName: "Abhishek Sharma",
                      employeeId: "EMP001",
                    }),
                  "Smart ID Card Issued"
                )
              }
              className="p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-left text-xs font-semibold text-purple-200 transition-colors cursor-pointer"
            >
              🪪 ID Card Created / Issued
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyKycUpdated({
                      employeeName: "Abhishek Sharma",
                      kycType: "Aadhaar & PAN Details",
                    }),
                  "KYC Verification Approved"
                )
              }
              className="p-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-left text-xs font-semibold text-blue-200 transition-colors cursor-pointer"
            >
              🆔 KYC Profile Approved
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyDocumentUploaded({
                      documentName: "B.Tech Degree Certificate",
                      status: "Approved & Verified",
                    }),
                  "Document Upload Approved"
                )
              }
              className="p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-left text-xs font-semibold text-cyan-200 transition-colors cursor-pointer"
            >
              📁 Document Upload Approved
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyLeaveStatus({
                      leaveType: "Casual Leave",
                      date: "24th Sep 2026",
                      status: "Approved",
                    }),
                  "Casual Leave Approved"
                )
              }
              className="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-left text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
            >
              🏖️ Leave Approved (1 Day)
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyLeaveStatus({
                      leaveType: "Earned Leave",
                      date: "12th - 16th Oct 2026",
                      status: "Declined",
                    }),
                  "Leave Request Declined"
                )
              }
              className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-left text-xs font-semibold text-rose-200 transition-colors cursor-pointer"
            >
              ⚠️ Leave Rejected Notice
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyLeaveStatus({
                      leaveType: "Half-Day Leave",
                      date: "22nd Sep 2026",
                      status: "Sanctioned",
                    }),
                  "Half-Day Sanctioned"
                )
              }
              className="p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-left text-xs font-semibold text-indigo-200 transition-colors cursor-pointer"
            >
              ⏱️ Half-Day Sanctioned
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyWfhStatus({
                      date: "21st Sep 2026",
                      status: "Approved",
                    }),
                  "WFH Approved"
                )
              }
              className="p-2.5 rounded-xl bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 text-left text-xs font-semibold text-teal-200 transition-colors cursor-pointer"
            >
              🏠 WFH Request Approved
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyBreakAlert({
                      breakName: "Scheduled Lunch Break",
                      duration: "60 Mins",
                      timeWindow: "01:00 PM – 02:00 PM",
                    }),
                  "Lunch Break Alert Chime"
                )
              }
              className="p-2.5 rounded-xl bg-orange-950/60 hover:bg-orange-900/80 border border-orange-500/40 text-left text-xs font-semibold text-orange-200 transition-colors cursor-pointer"
            >
              🍱 Lunch Break Alert
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  () =>
                    notifyBreakAlert({
                      breakName: "Afternoon Tea Break",
                      duration: "15 Mins",
                      timeWindow: "04:30 PM",
                    }),
                  "Tea Break Chime"
                )
              }
              className="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-left text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
            >
              ☕ Tea & Snack Break Alert
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search salary, ID card, KYC, leaves, WFH, breaks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            {["All", "Unread", "Pinned"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">🔴 Urgent</option>
            <option value="Important">🟡 Important</option>
            <option value="General">🔵 General</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <FiBell className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No notifications found</h4>
            <p className="text-xs text-slate-400 mt-1">
              No alerts match your current filter criteria or search query.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUrgent = notif.priority === "Urgent";
            const isImportant = notif.priority === "Important";
            const theme = getCategoryTheme(notif.category);

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-md ${
                  notif.pinned
                    ? "border-amber-300/80 ring-1 ring-amber-300/30 shadow-xs"
                    : notif.read
                    ? "border-slate-200/80 shadow-xs"
                    : "border-indigo-300/70 bg-indigo-50/10 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Content */}
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Category Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border shadow-2xs ${theme.badgeBg}`}
                    >
                      {theme.icon}
                    </div>

                    <div className="space-y-2 flex-1">
                      {/* Tags & Badges */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {notif.pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                            <FiBookmark className="w-3 h-3" /> Pinned
                          </span>
                        )}

                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Urgent Notice
                          </span>
                        ) : isImportant ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Important
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                            General Info
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200/70">
                          {notif.category}
                        </span>

                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <FiUsers className="w-3 h-3" />
                          <span>{notif.targetAudience}</span>
                        </span>

                        <span className="text-slate-400">
                          • {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h3>

                      {/* Content Text */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {notif.content}
                      </p>

                      {/* Action Link if provided */}
                      {notif.actionLink && notif.actionLink !== "#" && (
                        <div className="pt-1.5">
                          <Link
                            to={notif.actionLink}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors shadow-2xs"
                          >
                            <span>{notif.actionLabel || "View Action Details"}</span>
                            <FiArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => togglePinNotification(notif.id)}
                        className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          notif.pinned
                            ? "bg-amber-100 text-amber-800 font-bold"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title={notif.pinned ? "Unpin Announcement" : "Pin Announcement"}
                      >
                        <FiBookmark className="w-4 h-4" />
                      </button>

                      {!notif.read ? (
                        <button
                          type="button"
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                          title="Mark as Read"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>Mark Read</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium px-2 py-1">
                          Read
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Broadcast"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      By {notif.sender}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
