import React from "react";
import {
  FiX,
  FiRadio,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiEye,
  FiBookmark,
  FiAlertCircle,
  FiTag,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function AnnouncementDetailsModal({ announcement, onClose }) {
  const { acknowledgeAnnouncement } = useEmployee();

  if (!announcement) return null;

  const isAcknowledged =
    announcement.acknowledgedBy &&
    announcement.acknowledgedBy.includes("EMP001");

  const isUrgent = announcement.priority === "Urgent";
  const isImportant = announcement.priority === "Important";

  const handleAcknowledge = () => {
    acknowledgeAnnouncement(announcement.id, "EMP001");
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <FiRadio className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                {announcement.category}
              </span>
              <h3 className="text-sm sm:text-base font-bold truncate max-w-sm sm:max-w-md">
                Official Company Announcement
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Tags & Metadata Bar */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {announcement.pinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                <FiBookmark className="w-3 h-3" /> Pinned
              </span>
            )}

            {isUrgent ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Urgent Priority
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

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
              <FiUsers className="w-3 h-3 text-slate-400" />
              <span>Audience: {announcement.targetAudience}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
              <FiCalendar className="w-3 h-3" />
              <span>
                {new Date(announcement.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </span>

            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] ml-auto">
              <FiEye className="w-3 h-3" />
              <span>{announcement.viewsCount || 1} Views</span>
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {announcement.title}
          </h2>

          {/* Author Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={
                announcement.authorAvatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              }
              alt={announcement.authorName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {announcement.authorName}
              </h4>
              <p className="text-[11px] text-slate-500">
                {announcement.authorRole} • Skywork Corporate Communications
              </p>
            </div>
            {announcement.acknowledgeRequired && (
              <span
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                  isAcknowledged
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800 animate-pulse"
                }`}
              >
                {isAcknowledged ? "Acknowledged" : "Action Required"}
              </span>
            )}
          </div>

          {/* Full Markdown/Text Body */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line font-normal">
            {announcement.fullContent || announcement.summary}
          </div>

          {/* Attachments Section */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FiFileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Official Attachments & Circular Documents ({announcement.attachments.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {announcement.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <FiFileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {file.size || "1.5 MB"} • PDF
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Downloading "${file.name}"...`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                      title="Download document"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500">
            {announcement.acknowledgeRequired
              ? isAcknowledged
                ? "✅ You have acknowledged and confirmed receipt of this announcement."
                : "⚠️ Please acknowledge receipt of this policy / town hall broadcast."
              : "Information broadcast. No formal signature required."}
          </p>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {announcement.acknowledgeRequired && !isAcknowledged && (
              <button
                type="button"
                onClick={handleAcknowledge}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>Confirm & Acknowledge</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
