import React, { useState } from "react";
import {
  FiX,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload,
  FiShield,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function DocumentPreviewModal({ document: doc, onClose }) {
  const { verifyDocument } = useEmployee();
  const [reviewerNotes, setReviewerNotes] = useState(doc?.notes || "");

  if (!doc) return null;

  const handleVerify = (status) => {
    verifyDocument(doc.id, status, reviewerNotes);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 to-indigo-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <FiFileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Document Details & Verification</h3>
              <p className="text-xs text-slate-300">
                {doc.documentName} • Ref #{doc.id}
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

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Document Preview Placeholder Graphic */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
              <FiFileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{doc.documentName}</h4>
            <p className="text-xs text-slate-400">
              Format: {doc.fileFormat} • File Size: {doc.fileSize} • Category: {doc.category}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                🔒 Stored in Encrypted Cloud Vault
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Employee</span>
              <span className="font-bold text-slate-800">{doc.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Employee ID</span>
              <span className="font-bold text-slate-800">{doc.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Department</span>
              <span className="font-bold text-slate-800">{doc.department}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Upload Date</span>
              <span className="font-bold text-slate-800">{doc.uploadedDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Status</span>
              <span className="font-bold text-slate-800">{doc.verificationStatus}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Verified By</span>
              <span className="font-bold text-slate-800">{doc.verifiedBy || "Pending"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Verification Date</span>
              <span className="font-bold text-slate-800">{doc.verifiedAt || "N/A"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Document Validity</span>
              <span className="font-bold text-slate-800">{doc.expiryDate || "Lifelong"}</span>
            </div>
          </div>

          {/* Reviewer Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              HR Verification Remarks / Reason
            </label>
            <textarea
              rows={2}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Add verification notes or reason for rejection/re-upload..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Verification Decision Actions (HR Admin) */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                HR Verification Decision:
              </span>
              <p className="text-[11px] text-slate-500">
                Update document audit status for employee records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleVerify("Action Required")}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
              >
                <FiAlertTriangle className="w-3.5 h-3.5" />
                <span>Request Re-upload</span>
              </button>

              <button
                type="button"
                onClick={() => handleVerify("Verified")}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>Approve & Verify</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
