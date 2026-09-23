import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCheckCircle, FiClock, FiUsers, FiTrendingUp, FiArrowRight, FiShield, FiBriefcase, FiUserCheck } from "react-icons/fi";
import { useAuth } from "../Context/AuthContext.jsx";
import PunchInOutCard from "../Components/Attendance/PunchInOutCard";
import SmartAttendanceWidget from "../Components/SmartAttendance/SmartAttendanceWidget";

export default function DemoPage({ title, description, badge, stats = [] }) {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isUserPortal = location.pathname === "/" || (!location.pathname.startsWith("/hr") && !location.pathname.startsWith("/super-admin"));
  const isHRPortal = location.pathname.startsWith("/hr");
  const isSuperAdminPortal = location.pathname.startsWith("/super-admin");

  const displayTitle = title?.startsWith("Welcome back") && currentUser?.name 
    ? `Welcome back, ${currentUser.name}!` 
    : title;

  return (
    <div className="space-y-6">
      {/* Page Title Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {displayTitle || title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
            <span>Current Route: <code className="text-indigo-300 bg-white/10 px-2 py-0.5 rounded">{location.pathname}</code></span>
          </div>
        </div>
      </div>

      {/* Smart Attendance Live Status Widget */}
      <SmartAttendanceWidget />

      {/* Punch In / Punch Out Attendance Card */}
      <PunchInOutCard />

      {/* Stat Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm">
                  {stat.icon || <FiTrendingUp />}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>{stat.subtext}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Features Showcase Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-800">
          Header Specifications Verification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Desktop View (≥ lg)</p>
              <p className="text-xs text-slate-500">Logo on Left → Navigation Tabs in Center → Profile on Right</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Mobile View (&lt; lg)</p>
              <p className="text-xs text-slate-500">Logo on Left → Profile + Hamburger on Right (Logo → Profile → ☰)</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Profile Dropdown</p>
              <p className="text-xs text-slate-500">Smooth open animation with outside-click and Escape key detection</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Mobile Drawer Sidebar</p>
              <p className="text-xs text-slate-500">Slide-over drawer with blurred backdrop and auto-close on link click</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
