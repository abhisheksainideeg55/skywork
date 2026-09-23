import React from "react";
import { Link } from "react-router-dom";
import { FiShield, FiLock, FiArrowLeft, FiAlertTriangle, FiHome } from "react-icons/fi";

export default function UnauthorizedAccess({
  requiredRole = "HR Administrator",
  currentRole = "Employee",
  moduleName = "Salary Management",
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 shadow-inner">
          <FiLock className="w-10 h-10" />
          <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-rose-600 text-white shadow-xs">
            <FiAlertTriangle className="w-4 h-4" />
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700">
            HTTP 403 • Access Denied
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Restricted Access
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            The <strong className="text-slate-900">{moduleName}</strong> contains confidential corporate financial and payroll data. This section is strictly restricted to{" "}
            <span className="font-semibold text-rose-600">{requiredRole}</span> only.
          </p>
        </div>

        {/* Role Diagnostic Info */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Your Current Detected Role:</span>
            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {currentRole}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Required Authorization:</span>
            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {requiredRole} Role
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Security Policy:</span>
            <span className="font-medium text-slate-600">
              Zero Trust RBAC Enforcement
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
          >
            <FiHome className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </Link>
          <Link
            to="/salary"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all"
          >
            <FiShield className="w-4 h-4" />
            <span>View My Personal Payslips</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
