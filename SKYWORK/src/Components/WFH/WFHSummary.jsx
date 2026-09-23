import React from "react";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiHome,
  FiAward,
} from "react-icons/fi";

export default function WFHSummary({ records = [], isHRView = false }) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const totalRequests = records.length;
  const pendingCount = records.filter((r) => r.status === "Pending").length;
  const approvedCount = records.filter((r) => r.status === "Approved").length;
  const rejectedCount = records.filter(
    (r) => r.status === "Rejected" || r.status === "Cancelled"
  ).length;

  // Active remote employees today
  const activeTodayCount = records.filter((r) => {
    if (r.status !== "Approved") return false;
    return r.fromDate <= todayISO && todayISO <= r.toDate;
  }).length;

  // Total approved days for user
  const totalApprovedDays = records
    .filter((r) => r.status === "Approved")
    .reduce((acc, curr) => acc + (curr.totalDays || 1), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Requests */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Requests
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FiCalendar className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">{totalRequests}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isHRView ? "All employee submissions" : "Your submitted requests"}
          </p>
        </div>
      </div>

      {/* 2. Pending Action */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pending Action
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FiClock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-amber-700">{pendingCount}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isHRView ? "Awaiting your review" : "In review by HR / Manager"}
          </p>
        </div>
      </div>

      {/* 3. Approved */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Approved WFH
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FiCheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-emerald-700">
            {isHRView ? approvedCount : `${totalApprovedDays} Days`}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isHRView ? "Processed & active" : "Total approved remote days"}
          </p>
        </div>
      </div>

      {/* 4. Rejected / Cancelled */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Rejected / Cancelled
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <FiXCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-700">{rejectedCount}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Declined or withdrawn</p>
        </div>
      </div>

      {/* 5. Remote Today / Monthly Quota */}
      <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isHRView ? "Remote Today" : "Monthly Allowance"}
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            {isHRView ? <FiHome className="w-4 h-4" /> : <FiAward className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-purple-700">
            {isHRView ? activeTodayCount : "10 Days"}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isHRView ? "Staff working remotely" : "Standard monthly quota"}
          </p>
        </div>
      </div>
    </div>
  );
}
