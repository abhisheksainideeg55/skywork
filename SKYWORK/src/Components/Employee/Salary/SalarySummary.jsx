import React from "react";
import {
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiSend,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function SalarySummary({ onDisburseAll }) {
  const { salaries } = useEmployee();

  const totalPayroll = salaries.reduce((acc, curr) => acc + curr.grossSalary, 0);
  const paidCount = salaries.filter((s) => s.paymentStatus === "Paid").length;
  const pendingCount = salaries.filter((s) => s.paymentStatus !== "Paid").length;
  const avgCTC = Math.round(
    salaries.reduce((acc, curr) => acc + curr.annualCTC, 0) / (salaries.length || 1)
  );

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const stats = [
    {
      label: "Total Monthly Payroll",
      value: formatCurrency(totalPayroll),
      subtext: `Across ${salaries.length} active staff profiles`,
      icon: FiDollarSign,
      color: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Disbursed / Paid",
      value: `${paidCount} / ${salaries.length}`,
      subtext: `${Math.round((paidCount / (salaries.length || 1)) * 100)}% cycle completed`,
      icon: FiCheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "Pending Disbursements",
      value: `${pendingCount} Employees`,
      subtext: pendingCount === 0 ? "All salaries cleared" : "Requires bank release",
      icon: FiClock,
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "Average Annual CTC",
      value: formatCurrency(avgCTC),
      subtext: "Competitive industry benchmark",
      icon: FiTrendingUp,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50 text-purple-700 border-purple-100",
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner with Quick Batch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Payroll Cycle: September 2026
          </span>
          <h2 className="text-base sm:text-lg font-bold">
            Salary & Compensation Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Configure CTC structures, generate payslips, verify tax TDS deductions, and execute batch bank payouts.
          </p>
        </div>

        {pendingCount > 0 && (
          <button
            type="button"
            onClick={onDisburseAll}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            <FiSend className="w-4 h-4" />
            <span>Disburse All Pending ({pendingCount})</span>
          </button>
        )}
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
