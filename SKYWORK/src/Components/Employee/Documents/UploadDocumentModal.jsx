import React, { useState, useRef } from "react";
import { FiX, FiUploadCloud, FiFileText, FiCheck, FiPaperclip } from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";
import { DOCUMENT_CATEGORIES } from "../../../Data/employeeData";

export default function UploadDocumentModal({ onClose }) {
  const { uploadDocument, employees, salaries } = useEmployee();
  const fileInputRef = useRef(null);

  const employeeList = employees && employees.length > 0 ? employees : salaries;

  const [documentName, setDocumentName] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [category, setCategory] = useState("Identity & KYC");
  const [selectedEmpId, setSelectedEmpId] = useState(employeeList[0]?.employeeId || "EMP001");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileFormat, setFileFormat] = useState("PDF");
  const [fileSize, setFileSize] = useState("1.8 MB");
  const [notes, setNotes] = useState("");

  const selectedEmployee = employeeList.find((e) => e.employeeId === selectedEmpId) || employeeList[0];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }
      const ext = file.name.split(".").pop().toUpperCase();
      setFileFormat(ext || "PDF");
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!documentName.trim() || !selectedEmployee) return;

    uploadDocument({
      documentName,
      category,
      employeeId: selectedEmployee.employeeId,
      employeeName: selectedEmployee.employeeName || selectedEmployee.name,
      department: selectedEmployee.department || "General",
      fileFormat: fileFormat || "PDF",
      fileSize: fileSize || "1.8 MB",
      docNumber: docNumber || "",
      notes,
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
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 to-indigo-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <FiUploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Upload Employee Document</h3>
              <p className="text-xs text-slate-300">
                Securely store KYC proofs, employment contracts, and statutory documents
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* File Picker Zone */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              {selectedFile ? <FiPaperclip className="w-5 h-5" /> : <FiUploadCloud className="w-5 h-5" />}
            </div>
            {selectedFile ? (
              <div>
                <p className="text-xs font-bold text-indigo-900">{selectedFile.name}</p>
                <p className="text-[11px] text-indigo-600">
                  {fileSize} • {fileFormat} • Click to change file
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click to browse or choose document file
                </p>
                <p className="text-[11px] text-slate-500">
                  Supported formats: PDF, JPG, PNG, DOCX (Max size: 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Name / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aadhaar Card Copy"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Number / Ref (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 4589 1234 5678"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Employee
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employeeList.map((e) => (
                  <option key={e.employeeId} value={e.employeeId}>
                    {e.employeeName || e.name} ({e.employeeId} • {e.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DOCUMENT_CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add submission notes or verification instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <FiCheck className="w-4 h-4" />
              <span>Save & Upload Document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
