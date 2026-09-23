import React, { useState } from "react";
import { FiX, FiSave, FiDollarSign, FiInfo } from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function EditSalaryModal({ record, onClose }) {
  const { updateSalaryStructure } = useEmployee();

  const [baseSalary, setBaseSalary] = useState(record?.baseSalary || 0);
  const [hra, setHra] = useState(record?.hra || 0);
  const [specialAllowance, setSpecialAllowance] = useState(record?.specialAllowance || 0);
  const [pfDeduction, setPfDeduction] = useState(record?.pfDeduction || 0);
  const [taxDeduction, setTaxDeduction] = useState(record?.taxDeduction || 0);
  const [professionalTax, setProfessionalTax] = useState(record?.professionalTax || 200);

  if (!record) return null;

  // Auto-calculated fields
  const grossSalary = Number(baseSalary) + Number(hra) + Number(specialAllowance);
  const totalDeductions = Number(pfDeduction) + Number(taxDeduction) + Number(professionalTax);
  const netSalary = grossSalary - totalDeductions;
  const annualCTC = grossSalary * 12;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSalaryStructure(record.id, {
      baseSalary,
      hra,
      specialAllowance,
      pfDeduction,
      taxDeduction,
      professionalTax,
    });
    onClose();
  };

  // Helper to recalculate standard 50% Basic, 40% HRA, 12% PF automatically
  const handleAutoCompute = () => {
    const gross = grossSalary || 150000;
    const computedBase = Math.round(gross * 0.5);
    const computedHra = Math.round(computedBase * 0.4);
    const computedSpecial = gross - (computedBase + computedHra);
    const computedPf = Math.round(computedBase * 0.12);
    const computedTax = Math.round(gross * 0.08);

    setBaseSalary(computedBase);
    setHra(computedHra);
    setSpecialAllowance(computedSpecial > 0 ? computedSpecial : 0);
    setPfDeduction(computedPf);
    setTaxDeduction(computedTax);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 to-indigo-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <FiDollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Edit Salary & CTC Structure</h3>
              <p className="text-xs text-slate-300">
                {record.employeeName} ({record.employeeId} • {record.department})
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Auto-Compute Utility */}
          <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <FiInfo className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Standard Statutory Split (50% Basic, 40% HRA, 12% PF)</span>
            </div>
            <button
              type="button"
              onClick={handleAutoCompute}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors shrink-0 cursor-pointer"
            >
              Auto-Split Structure
            </button>
          </div>

          {/* Section 1: Earnings */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              1. Monthly Earnings Components (₹)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Base Salary
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  House Rent Allowance (HRA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={hra}
                  onChange={(e) => setHra(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Special Allowance
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={specialAllowance}
                  onChange={(e) => setSpecialAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Deductions */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              2. Monthly Deductions & Taxes (₹)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Provident Fund (PF)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={pfDeduction}
                  onChange={(e) => setPfDeduction(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Income Tax (TDS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={taxDeduction}
                  onChange={(e) => setTaxDeduction(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Professional Tax
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={professionalTax}
                  onChange={(e) => setProfessionalTax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Real-time Summary Card */}
          <div className="grid grid-cols-3 gap-3 bg-slate-900 text-white rounded-2xl p-4 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Gross Monthly</span>
              <span className="text-base font-extrabold text-emerald-400">
                ₹{grossSalary.toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total Deductions</span>
              <span className="text-base font-extrabold text-rose-400">
                ₹{totalDeductions.toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Net Take-Home</span>
              <span className="text-base font-extrabold text-indigo-300">
                ₹{netSalary.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Actions */}
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
              <FiSave className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
