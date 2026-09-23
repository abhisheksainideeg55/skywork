import React from "react";
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiUploadCloud,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function DocumentSummary({ onOpenUpload, onOpenIdCard }) {
  const { documents, employees } = useEmployee();

  const verifiedCount = documents.filter((d) => d.verificationStatus === "Verified").length;
  const pendingCount = documents.filter((d) => d.verificationStatus === "Pending Review").length;
  const actionRequiredCount = documents.filter((d) => d.verificationStatus === "Action Required").length;

  const stats = [
    {
      label: "Total Stored Documents",
      value: `${documents.length} Files`,
      subtext: "KYC, contracts, NDAs & certificates",
      icon: FiFileText,
      color: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "HR Verified & Active",
      value: `${verifiedCount} / ${documents.length}`,
      subtext: `${Math.round((verifiedCount / (documents.length || 1)) * 100)}% compliance verified`,
      icon: FiCheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "Pending Verification",
      value: `${pendingCount} Files`,
      subtext: pendingCount === 0 ? "Inbox cleared" : "Requires HR audit",
      icon: FiClock,
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "Active Employee ID Cards",
      value: `${employees.length} Issued`,
      subtext: "Digital NFC/QR Badges active",
      icon: FiCheckCircle,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50 text-purple-700 border-purple-100",
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            KYC Vault & Employee ID System
          </span>
          <h2 className="text-base sm:text-lg font-bold">
            Document Repository & Digital ID Card Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Aadhaar, PAN, Blood Group, Bank & Emergency contacts with printable Front & Back Digital ID Cards.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onOpenIdCard}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <span>🪪</span>
            <span>Create / View Employee ID</span>
          </button>

          <button
            type="button"
            onClick={onOpenUpload}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <FiUploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  {stat.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stat.bgLight}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
