import React from "react";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiArrowDownRight,
  FiGift,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiLayers,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";

export default function SalarySummaryCards() {
  const { summaryMetrics = {}, formatCurrency } = useSalary();

  const totalEmployees = summaryMetrics?.totalEmployees ?? 0;
  const totalMonthlyPayroll = summaryMetrics?.totalMonthlyPayroll ?? 0;
  const totalGross = summaryMetrics?.totalGross ?? 0;
  const totalNet = summaryMetrics?.totalNet ?? 0;
  const totalDeductions = summaryMetrics?.totalDeductions ?? 0;
  const totalBonuses = summaryMetrics?.totalBonuses ?? 0;
  const totalFines = summaryMetrics?.totalFines ?? 0;
  const pendingPayroll = summaryMetrics?.pendingPayroll ?? 0;
  const processedPayroll = summaryMetrics?.processedPayroll ?? 0;

  const cards = [
    {
      title: "Total Employees",
      value: `${totalEmployees} Staff`,
      subtext: "Mapped compensation profiles",
      icon: FiUsers,
      color: "indigo",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      text: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Total Monthly Payroll",
      value: formatCurrency(totalMonthlyPayroll),
      subtext: "Net company commitment",
      icon: FiLayers,
      color: "emerald",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
      highlight: true,
    },
    {
      title: "Total Gross Salary",
      value: formatCurrency(totalGross),
      subtext: "Base + HRA + Allowances",
      icon: FiTrendingUp,
      color: "sky",
      bg: "bg-sky-50 dark:bg-sky-950/40",
      text: "text-sky-600 dark:text-sky-400",
    },
    {
      title: "Total Net Salary",
      value: formatCurrency(totalNet),
      subtext: "Post-statutory take-home",
      icon: FiDollarSign,
      color: "emerald",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Deductions",
      value: `-${formatCurrency(totalDeductions)}`,
      subtext: "PF, ESI, TDS & Tax",
      icon: FiArrowDownRight,
      color: "rose",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Total Bonuses",
      value: `+${formatCurrency(totalBonuses)}`,
      subtext: "Approved incentives",
      icon: FiGift,
      color: "amber",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Total Fines",
      value: `-${formatCurrency(totalFines)}`,
      subtext: "Penalties applied",
      icon: FiAlertTriangle,
      color: "purple",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Pending Payroll",
      value: `${pendingPayroll} Staff`,
      subtext: pendingPayroll > 0 ? "Awaiting processing" : "All cleared",
      icon: FiClock,
      color: "amber",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Processed Payroll",
      value: `${processedPayroll} Staff`,
      subtext: "Disbursed & verified",
      icon: FiCheckCircle,
      color: "emerald",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-9 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border transition-all duration-200 hover:shadow-xs flex flex-col justify-between ${
              card.highlight
                ? "border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/10 shadow-xs"
                : "border-slate-200/80 dark:border-gray-700 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 truncate">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.text} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </p>
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-400 mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
