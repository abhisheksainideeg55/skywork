import React from "react";
import {
  FiTrendingUp,
  FiPieChart,
  FiUsers,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";
import { DEPARTMENT_ANALYTICS } from "../../../Data/employeeData";

export default function ReportAnalyticsCards({ isUserView = false }) {
  if (isUserView) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* 1. Personal Goal & Performance Metrics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiAward className="text-amber-500" />
                <span>My Q3 Goals & Engineering Deliverables</span>
              </h4>
              <p className="text-xs text-slate-500">
                Individual performance assessment and technical milestone velocity
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              Rating: 4.9 / 5.0
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: "Sprint Deliverables & Code Shipping", percent: 98, color: "bg-emerald-500" },
              { label: "Frontend Performance & Core Web Vitals", percent: 95, color: "bg-indigo-500" },
              { label: "Architecture Reviews & Peer Mentoring", percent: 100, color: "bg-purple-500" },
              { label: "Product Sprint Goal Adherence", percent: 92, color: "bg-teal-500" },
            ].map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{metric.label}</span>
                  <span className="text-slate-900 font-bold">{metric.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${metric.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${metric.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Personal Punctuality & Leave Balance Ledger */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FiClock className="text-indigo-600" />
                  <span>My Attendance & Shift Hours Compliance</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Monthly log: 164 logged work hours across September
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                On-Time: 96.4%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <span className="text-xl font-black text-emerald-700">164 hrs</span>
                <p className="text-[11px] font-bold text-emerald-900 mt-0.5">
                  Logged Hours
                </p>
                <span className="text-[10px] text-emerald-600">Standard Met</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                <span className="text-xl font-black text-indigo-700">14 Days</span>
                <p className="text-[11px] font-bold text-indigo-900 mt-0.5">
                  Leave Balance
                </p>
                <span className="text-[10px] text-indigo-600">Paid Annual</span>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                <span className="text-xl font-black text-purple-700">2 Days</span>
                <p className="text-[11px] font-bold text-purple-900 mt-0.5">
                  WFH Availed
                </p>
                <span className="text-[10px] text-purple-600">Sprint Approved</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <FiCalendar className="text-indigo-600" />
              <span>Next Salary Slip & Payslip Release:</span>
            </span>
            <span className="font-bold text-indigo-600">30th September 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // HR & Manager Company-Wide Analytics
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* 1. Department Payroll & Budget Allocation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FiTrendingUp className="text-indigo-600" />
              <span>Department Payroll Budget Distribution</span>
            </h4>
            <p className="text-xs text-slate-500">
              Monthly compensation expenditure by business unit
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
            Total: ₹64.65L / mo
          </span>
        </div>

        <div className="space-y-3">
          {DEPARTMENT_ANALYTICS.map((dept, idx) => {
            const percentage = Math.round((dept.headcount / 482) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {dept.department} ({dept.headcount} staff)
                  </span>
                  <span className="text-slate-900 font-bold">{dept.budgetSpent}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage * 2, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Performance Rating Distribution */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiPieChart className="text-purple-600" />
                <span>Workforce Performance & Rating Matrix</span>
              </h4>
              <p className="text-xs text-slate-500">
                Quarterly appraisal bell-curve distribution across 482 staff
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
              Avg: 4.6 / 5.0
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <span className="text-xl font-black text-emerald-700">62%</span>
              <p className="text-[11px] font-bold text-emerald-900 mt-0.5">
                Top Performers
              </p>
              <span className="text-[10px] text-emerald-600">Rating 4.5 - 5.0</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <span className="text-xl font-black text-indigo-700">32%</span>
              <p className="text-[11px] font-bold text-indigo-900 mt-0.5">
                Solid Contributors
              </p>
              <span className="text-[10px] text-indigo-600">Rating 3.5 - 4.4</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <span className="text-xl font-black text-amber-700">6%</span>
              <p className="text-[11px] font-bold text-amber-900 mt-0.5">
                Needs Coaching
              </p>
              <span className="text-[10px] text-amber-600">Rating &lt; 3.5</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <span className="font-semibold text-slate-700">
            Next Appraisal Audit Cycle:
          </span>
          <span className="font-bold text-indigo-600">26th September 2026</span>
        </div>
      </div>
    </div>
  );
}
