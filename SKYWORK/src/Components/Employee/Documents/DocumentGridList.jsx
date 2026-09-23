import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiEye,
  FiDownload,
  FiTrash2,
  FiGrid,
  FiList,
  FiUser,
  FiEdit2,
  FiPhone,
  FiDroplet,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";
import { DOCUMENT_CATEGORIES } from "../../../Data/employeeData";

export default function DocumentGridList({
  onOpenPreview,
  onOpenUpload,
  onOpenIdCard,
  onOpenEditKyc,
  role = "hr", // "hr" | "superadmin" | "user" | "employee"
  currentUserEmpId = "EMP001",
}) {
  const { documents, employees, deleteDocument } = useEmployee();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Role-Based Filtering
  const roleAllowedDocs = useMemo(() => {
    if (role === "user" || role === "employee") {
      // Employee sees ONLY their own documents
      return documents.filter((d) => d.employeeId === currentUserEmpId);
    }
    // HR and Super Admin see all company documents
    return documents;
  }, [documents, role, currentUserEmpId]);

  const filteredDocs = useMemo(() => {
    return roleAllowedDocs.filter((doc) => {
      const matchSearch =
        searchTerm === "" ||
        doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.docNumber && doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat =
        selectedCategory === "All Categories" || doc.category === selectedCategory;

      const matchStatus =
        statusFilter === "All Statuses" || doc.verificationStatus === statusFilter;

      return matchSearch && matchCat && matchStatus;
    });
  }, [roleAllowedDocs, searchTerm, selectedCategory, statusFilter]);

  const handleDownloadMock = (doc) => {
    const emp = employees.find((e) => e.employeeId === doc.employeeId) || {};
    const content = `SKYWORK HRMS - OFFICIAL DOCUMENT RECORD\n\nDocument: ${doc.documentName}\nDocument Number: ${doc.docNumber || "N/A"}\nEmployee: ${doc.employeeName} (${doc.employeeId})\nDepartment: ${doc.department}\nDesignation: ${emp.role || "N/A"}\nAadhaar Number: ${emp.aadhaarNumber || "N/A"}\nPAN Number: ${emp.panNumber || "N/A"}\nBlood Group: ${emp.bloodGroup || "N/A"}\nEmergency Contact: ${emp.emergencyContact || "N/A"}\nCategory: ${doc.category}\nStatus: ${doc.verificationStatus}\nUpload Date: ${doc.uploadedDate}\nVerified By: ${doc.verifiedBy || "N/A"}\n\n[CONFIDENTIAL EMPLOYEE KYC RECORD]`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${doc.employeeId}_${doc.documentName.replace(/\s+/g, "_")}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Privacy Notice Banner for User/Employee */}
      {role === "user" && (
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <span className="text-base">🔒</span>
            <span className="font-semibold">
              Personal Vault View: You are viewing only your private KYC records & ID badge.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const emp = employees.find((e) => e.employeeId === currentUserEmpId);
              if (emp) onOpenEditKyc(emp);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
          >
            ✏️ Edit My KYC Details
          </button>
        </div>
      )}

      {/* Search, Filter & View Mode Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doc name, employee ID, Aadhaar, PAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Action Required">Action Required</option>
          </select>

          {/* Grid / Table Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid View"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              No documents found matching your filter criteria.
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const emp = employees.find((e) => e.employeeId === doc.employeeId) || {};
              const isVerified = doc.verificationStatus === "Verified";
              const isPending = doc.verificationStatus === "Pending Review";

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <FiFileText className="w-5 h-5" />
                      </div>

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FiCheckCircle className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <FiClock className="w-3 h-3" />
                          <span>Pending Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <FiAlertTriangle className="w-3 h-3" />
                          <span>Action Required</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {doc.documentName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {doc.category}
                    </p>

                    {/* Employee Profile Preview */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                          alt={doc.employeeName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs leading-tight">
                            {doc.employeeName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {doc.employeeId} • {doc.department}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {doc.fileFormat} • {doc.fileSize}
                      </span>
                    </div>

                    {/* KYC Quick Badges */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Aadhaar:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {emp.aadhaarNumber ? `•••• ${emp.aadhaarNumber.slice(-4)}` : "Verified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Blood / Age:</span>
                        <span className="font-bold text-rose-600">
                          {emp.bloodGroup || "O+"} • {emp.age ? `${emp.age}y` : "27y"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      {/* ID Card Button */}
                      <button
                        type="button"
                        onClick={() => onOpenIdCard(emp)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="View / Create Digital Employee ID Card"
                      >
                        <span>🪪</span>
                        <span className="hidden sm:inline">ID Card</span>
                      </button>

                      {/* Edit KYC Button */}
                      <button
                        type="button"
                        onClick={() => onOpenEditKyc(emp)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Update KYC Details & Photo"
                      >
                        <FiEdit2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenPreview(doc)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Preview / Verify Document"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadMock(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Download Document"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>

                      {role === "hr" && (
                        <button
                          type="button"
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">Document Title</th>
                  <th className="px-4 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">KYC Number</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const emp = employees.find((e) => e.employeeId === doc.employeeId) || {};
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <FiFileText className="text-indigo-600 w-4 h-4 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{doc.documentName}</span>
                            <span className="text-[10px] text-slate-400">{doc.fileFormat} • {doc.fileSize}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">{doc.employeeName}</span>
                        <span className="text-[10px] text-slate-400">{doc.employeeId} • {doc.department}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {doc.docNumber || emp.aadhaarNumber || "Verified"}
                      </td>
                      <td className="px-4 py-3.5">{doc.category}</td>
                      <td className="px-4 py-3.5">
                        {doc.verificationStatus === "Verified" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                            <FiCheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                            <FiClock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenIdCard(emp)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 cursor-pointer"
                          >
                            🪪 ID Card
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEditKyc(emp)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadMock(doc)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <FiDownload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
