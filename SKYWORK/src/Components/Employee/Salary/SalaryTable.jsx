import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiFileText,
  FiEdit2,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function SalaryTable({ onOpenPayslip, onOpenEdit }) {
  const { salaries, toggleDisbursementStatus } = useEmployee();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const departments = useMemo(() => {
    const set = new Set(salaries.map((s) => s.department));
    return ["All Departments", ...Array.from(set)];
  }, [salaries]);

  const filteredSalaries = useMemo(() => {
    return salaries.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        selectedDept === "All Departments" || item.department === selectedDept;

      const matchesStatus =
        selectedStatus === "All Statuses" || item.paymentStatus === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [salaries, searchTerm, selectedDept, selectedStatus]);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee by name, ID, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
            <tr>
              <th className="px-4 py-3.5">Employee</th>
              <th className="px-4 py-3.5">Gross Earnings</th>
              <th className="px-4 py-3.5">Total Deductions</th>
              <th className="px-4 py-3.5">Net Take-Home</th>
              <th className="px-4 py-3.5">Annual CTC</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSalaries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No salary records match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredSalaries.map((s) => {
                const totalDeductions =
                  (s.pfDeduction || 0) +
                  (s.taxDeduction || 0) +
                  (s.professionalTax || 0);

                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Employee Profile */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar}
                          alt={s.employeeName}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{s.employeeName}</span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {s.employeeId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {s.role} • <span className="text-slate-400">{s.department}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Gross Earnings */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">
                        {formatCurrency(s.grossSalary)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Base: {formatCurrency(s.baseSalary)}
                      </span>
                    </td>

                    {/* Total Deductions */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-rose-600 block">
                        -{formatCurrency(totalDeductions)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PF: {formatCurrency(s.pfDeduction)} • Tax: {formatCurrency(s.taxDeduction)}
                      </span>
                    </td>

                    {/* Net Take-Home */}
                    <td className="px-4 py-3.5">
                      <span className="font-black text-emerald-700 text-sm block">
                        {formatCurrency(s.netSalary)}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.bankName}</span>
                    </td>

                    {/* Annual CTC */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800 block">
                        {formatCurrency(s.annualCTC)}
                      </span>
                      <span className="text-[10px] text-slate-400">CTC per annum</span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      {s.paymentStatus === "Paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FiCheckCircle className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      ) : s.paymentStatus === "Processing" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <FiClock className="w-3 h-3 animate-spin" />
                          <span>Processing</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <FiClock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenPayslip(s)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                          title="View Official Payslip"
                        >
                          <FiFileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Payslip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Salary Structure"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>

                        {s.paymentStatus !== "Paid" && (
                          <button
                            type="button"
                            onClick={() => toggleDisbursementStatus(s.id, "Paid")}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                            title="Disburse / Mark as Paid"
                          >
                            <FiDollarSign className="w-3.5 h-3.5" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
