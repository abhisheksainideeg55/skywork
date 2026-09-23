import React, { useState, useEffect } from "react";
import {
  FiX,
  FiRadio,
  FiSend,
  FiUsers,
  FiBookmark,
  FiCheckSquare,
  FiTag,
  FiFileText,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";
import {
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_TARGETS,
  ANNOUNCEMENT_PRIORITIES,
} from "../../../Data/employeeData";

export default function CreateAnnouncementModal({
  onClose,
  editingAnnouncement = null,
  role = "HR Admin",
}) {
  const { createAnnouncement, updateAnnouncement } = useEmployee();

  const isEditing = !!editingAnnouncement;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Company Policy & Guidelines");
  const [priority, setPriority] = useState("Important");
  const [targetAudience, setTargetAudience] = useState("All Employees");
  const [authorName, setAuthorName] = useState("Abhishek Sharma");
  const [authorRole, setAuthorRole] = useState(role || "HR Admin");
  const [summary, setSummary] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [acknowledgeRequired, setAcknowledgeRequired] = useState(true);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentSize, setAttachmentSize] = useState("1.8 MB");
  const [attachmentsList, setAttachmentsList] = useState([]);

  useEffect(() => {
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title || "");
      setCategory(editingAnnouncement.category || "Company Policy & Guidelines");
      setPriority(editingAnnouncement.priority || "Important");
      setTargetAudience(editingAnnouncement.targetAudience || "All Employees");
      setAuthorName(editingAnnouncement.authorName || "Abhishek Sharma");
      setAuthorRole(editingAnnouncement.authorRole || "HR Admin");
      setSummary(editingAnnouncement.summary || "");
      setFullContent(editingAnnouncement.fullContent || "");
      setPinned(!!editingAnnouncement.pinned);
      setAcknowledgeRequired(!!editingAnnouncement.acknowledgeRequired);
      setAttachmentsList(editingAnnouncement.attachments || []);
    } else {
      // Defaults for new announcement
      setAuthorName("Abhishek Sharma");
      setAuthorRole(role || "HR Admin");
      setAttachmentsList([
        { name: "Official_Announcement_Circular.pdf", size: "1.8 MB" },
      ]);
    }
  }, [editingAnnouncement, role]);

  const handleAddAttachment = () => {
    if (!attachmentName.trim()) return;
    setAttachmentsList((prev) => [
      ...prev,
      { name: attachmentName.trim(), size: attachmentSize || "1.5 MB" },
    ]);
    setAttachmentName("");
  };

  const handleRemoveAttachment = (idx) => {
    setAttachmentsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    if (isEditing) {
      updateAnnouncement(editingAnnouncement.id, {
        title,
        category,
        priority,
        targetAudience,
        authorName,
        authorRole,
        summary,
        fullContent: fullContent || summary,
        pinned,
        acknowledgeRequired,
        attachments: attachmentsList,
      });
    } else {
      createAnnouncement({
        title,
        category,
        priority,
        targetAudience,
        authorName,
        authorRole,
        summary,
        fullContent: fullContent || summary,
        pinned,
        acknowledgeRequired,
        attachments: attachmentsList,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <FiRadio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                {isEditing
                  ? "Edit Official Announcement"
                  : "Publish Official Announcement"}
              </h3>
              <p className="text-xs text-slate-300">
                Broadcast circulars to staff with reading acknowledgment tracking
              </p>
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Announcement Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Announcement Title / Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 🚀 Q3 All-Hands Town Hall: Annual Strategy & Product Roadmap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category, Priority & Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ANNOUNCEMENT_CATEGORIES.filter((c) => c !== "All Categories").map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ANNOUNCEMENT_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ANNOUNCEMENT_TARGETS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Author Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author / Issuer Name
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author Designation / Role
              </label>
              <input
                type="text"
                required
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Summary / Lead Paragraph */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brief Summary (Displayed on preview cards) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Provide a concise 2-sentence summary of the circular or announcement..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Full Announcement Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Circular Details & Markdown Agenda
            </label>
            <textarea
              rows={5}
              placeholder="Include complete detailed message, bullet points, schedules, policy links, contact details..."
              value={fullContent}
              onChange={(e) => setFullContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {/* Pinned & Acknowledge Required Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <FiBookmark className="w-3.5 h-3.5 text-amber-600" />
                <span>Pin to top of employee feed</span>
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgeRequired}
                onChange={(e) => setAcknowledgeRequired(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <FiCheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Require employee read confirmation</span>
              </span>
            </label>
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Attach Circular PDF / Documentation (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Town_Hall_Schedule.pdf"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer border border-indigo-200"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Added attachments pill list */}
            {attachmentsList.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachmentsList.map((att, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold"
                  >
                    <FiFileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{att.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-indigo-400 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer CTA */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <FiSend className="w-4 h-4" />
              <span>{isEditing ? "Save & Update Broadcast" : "Publish Announcement"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
