import React, { useState } from "react";
import { FiX, FiBell, FiSend, FiUsers, FiTag } from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";
import { NOTIFICATION_CATEGORIES } from "../../../Data/employeeData";

export default function CreateNotificationModal({ onClose }) {
  const { createNotification } = useEmployee();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Company Announcement");
  const [priority, setPriority] = useState("Important");
  const [targetAudience, setTargetAudience] = useState("All Employees");
  const [content, setContent] = useState("");
  const [actionLink, setActionLink] = useState("");
  const [actionLabel, setActionLabel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createNotification({
      title,
      category,
      priority,
      targetAudience,
      content,
      actionLink,
      actionLabel,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 to-amber-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <FiBell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Publish Company Broadcast / Alert
              </h3>
              <p className="text-xs text-slate-300">
                Send real-time bulletin to employees & department channels
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Broadcast Title / Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 📢 Q3 Appraisal Cycle Submissions Live"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {NOTIFICATION_CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Urgent">🔴 Urgent Priority</option>
                <option value="Important">🟡 Important Alert</option>
                <option value="General">🔵 General Info</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All Employees">All Employees</option>
                <option value="Engineering">Engineering Only</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Sales & BD">Sales & BD</option>
                <option value="Managers Only">Managers Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Broadcast Message Body *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write the detailed announcement message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Call-to-Action Link (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. /hr/employees/salary or /leave"
                value={actionLink}
                onChange={(e) => setActionLink(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action Button Text (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Complete Review Now →"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <FiSend className="w-4 h-4" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
