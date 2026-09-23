import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiRadio,
  FiBookmark,
  FiTrash2,
  FiEdit3,
  FiCheckCircle,
  FiArrowRight,
  FiUsers,
  FiCalendar,
  FiEye,
  FiShield,
  FiFileText,
  FiAlertCircle,
  FiClock,
  FiCheck,
  FiDownload,
  FiPlus,
  FiVolume2,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";
import {
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_TARGETS,
} from "../../../Data/employeeData";
import AnnouncementDetailsModal from "./AnnouncementDetailsModal";
import CreateAnnouncementModal from "./CreateAnnouncementModal";

export default function AnnouncementFeed({
  canManage = false,
  onOpenCreate,
  userRole = "Employee",
}) {
  const {
    announcements,
    deleteAnnouncement,
    togglePinAnnouncement,
    acknowledgeAnnouncement,
  } = useEmployee();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAudience, setSelectedAudience] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Category chip icons
  const getCategoryTheme = (category) => {
    switch (category) {
      case "Town Hall & Leadership":
        return {
          icon: <FiRadio className="w-4 h-4 text-purple-600" />,
          badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
          cardBorder: "border-purple-200 hover:border-purple-300",
        };
      case "Company Policy & Guidelines":
        return {
          icon: <FiShield className="w-4 h-4 text-blue-600" />,
          badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
          cardBorder: "border-blue-200 hover:border-blue-300",
        };
      case "Rewards & Recognition":
        return {
          icon: <FiCheckCircle className="w-4 h-4 text-emerald-600" />,
          badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          cardBorder: "border-emerald-200 hover:border-emerald-300",
        };
      case "Holiday & Celebration":
        return {
          icon: <FiCalendar className="w-4 h-4 text-amber-600" />,
          badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
          cardBorder: "border-amber-200 hover:border-amber-300",
        };
      case "Office & Infrastructure":
        return {
          icon: <FiFileText className="w-4 h-4 text-cyan-600" />,
          badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
          cardBorder: "border-cyan-200 hover:border-cyan-300",
        };
      default:
        return {
          icon: <FiVolume2 className="w-4 h-4 text-indigo-600" />,
          badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          cardBorder: "border-indigo-200 hover:border-indigo-300",
        };
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((item) => {
        const matchSearch =
          searchTerm === "" ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());

        const matchCat =
          selectedCategory === "All Categories" ||
          item.category === selectedCategory;

        const matchAudience =
          selectedAudience === "All" ||
          item.targetAudience === selectedAudience ||
          item.targetAudience === "All Employees";

        const matchPriority =
          priorityFilter === "All" || item.priority === priorityFilter;

        return matchSearch && matchCat && matchAudience && matchPriority;
      })
      .sort((a, b) => {
        // Pinned first, then by date descending
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [announcements, searchTerm, selectedCategory, selectedAudience, priorityFilter]);

  const handleDelete = (annId, title) => {
    if (window.confirm(`Are you sure you want to delete announcement:\n"${title}"?`)) {
      deleteAnnouncement(annId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ANNOUNCEMENT_CATEGORIES.map((cat) => {
          const count =
            cat === "All Categories"
              ? announcements.length
              : announcements.filter((a) => a.category === cat).length;

          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span>{cat}</span>
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

      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search announcements, town halls, policies, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Audience Filter */}
          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Audiences</option>
            {ANNOUNCEMENT_TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

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

          {canManage && onOpenCreate && (
            <button
              type="button"
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>+ New</span>
            </button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3.5">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <FiRadio className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No announcements found</h4>
            <p className="text-xs text-slate-400 mt-1">
              No circulars match your active search filters.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isUrgent = ann.priority === "Urgent";
            const isImportant = ann.priority === "Important";
            const theme = getCategoryTheme(ann.category);
            const isAcknowledged =
              ann.acknowledgedBy && ann.acknowledgedBy.includes("EMP001");

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md ${
                  ann.pinned
                    ? "border-amber-300/80 ring-1 ring-amber-300/30 shadow-xs"
                    : "border-slate-200/80 shadow-xs"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Category Icon Badge */}
                    <div
                      className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center border shadow-2xs ${theme.badgeBg}`}
                    >
                      {theme.icon}
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Tags & Badges */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {ann.pinned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                            <FiBookmark className="w-3 h-3" /> Pinned
                          </span>
                        )}

                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Urgent Bulletin
                          </span>
                        ) : isImportant ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Important
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                            General
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200/70">
                          {ann.category}
                        </span>

                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <FiUsers className="w-3 h-3" />
                          <span>{ann.targetAudience}</span>
                        </span>

                        <span className="text-slate-400">
                          •{" "}
                          {new Date(ann.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {ann.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {ann.summary}
                      </p>

                      {/* Author & Attachments preview */}
                      <div className="flex items-center gap-3 pt-1 flex-wrap text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              ann.authorAvatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                            }
                            alt={ann.authorName}
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {ann.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({ann.authorRole})
                          </span>
                        </div>

                        {ann.attachments && ann.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                            <FiFileText className="w-3 h-3" />
                            <span>{ann.attachments.length} attachment(s)</span>
                          </span>
                        )}

                        {ann.acknowledgeRequired && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              isAcknowledged
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <FiCheckCircle className="w-3 h-3" />
                            <span>{isAcknowledged ? "Acknowledged" : "Acknowledgment Required"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Read Full Button */}
                    <button
                      type="button"
                      onClick={() => setViewingAnnouncement(ann)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Read Full Circular</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Employee Acknowledge Action */}
                    {!canManage && ann.acknowledgeRequired && !isAcknowledged && (
                      <button
                        type="button"
                        onClick={() => acknowledgeAnnouncement(ann.id, "EMP001")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        <FiCheck className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {/* HR & Manager CRUD Actions (Hidden for Employees) */}
                    {canManage && (
                      <div className="flex items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => togglePinAnnouncement(ann.id)}
                          className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            ann.pinned
                              ? "bg-amber-100 text-amber-800 font-bold"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          }`}
                          title={ann.pinned ? "Unpin Announcement" : "Pin Announcement"}
                        >
                          <FiBookmark className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingAnnouncement(ann)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Announcement"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(ann.id, ann.title)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Announcement"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Full Details Modal */}
      {viewingAnnouncement && (
        <AnnouncementDetailsModal
          announcement={viewingAnnouncement}
          onClose={() => setViewingAnnouncement(null)}
        />
      )}

      {/* Edit Announcement Modal (HR & Manager only) */}
      {editingAnnouncement && (
        <CreateAnnouncementModal
          editingAnnouncement={editingAnnouncement}
          onClose={() => setEditingAnnouncement(null)}
          role={userRole}
        />
      )}
    </div>
  );
}
