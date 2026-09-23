import React, { useState, useEffect } from "react";
import {
  FiX,
  FiDollarSign,
  FiUser,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiBriefcase,
  FiCalendar,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { calculateSalaryStructure } from "../../../Services/salaryService";
import { useEmployee } from "../../../Context/EmployeeContext";
import { getUsers } from "../../../Services/userService";

export default function AddEditSalaryModal({ record, onClose, onSaveSuccess }) {
  const {
    salaries,
    allEmployees = [],
    addSalaryStructure,
    updateSalaryStructure,
    formatCurrency,
  } = useSalary();

  const { employees = [] } = useEmployee ? useEmployee() : {};
  const isEditing = Boolean(record);

  // Available staff to assign salary to
  const availableEmployees = React.useMemo(() => {
    const list = allEmployees.length > 0 ? allEmployees : employees.length > 0 ? employees : getUsers();
    return list.filter((u) => u.role !== "superadmin");
  }, [allEmployees, employees]);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: record?.employeeId || "",
    employeeName: record?.employeeName || "",
    role: record?.role || record?.designation || "Staff Employee",
    department: record?.department || "Engineering",
    bankName: record?.bankName || "HDFC Bank",
    accountNumber: record?.accountNumber || record?.bankAccountNumber || "•••• 4892",
    ifscCode: record?.ifscCode || "HDFC0001234",
    panNumber: record?.panNumber || "ABCDE1234F",
    joiningDate: record?.joiningDate || new Date().toISOString().split("T")[0],
    effectiveFrom: record?.effectiveFrom || new Date().toISOString().split("T")[0],
    salaryType: record?.salaryType || "monthly",
    // Earnings Components
    baseSalary: record?.baseSalary !== undefined ? record.baseSalary : 25000,
    hra: record?.hra !== undefined ? record?.hra : 10000,
    conveyance: record?.conveyance !== undefined ? record?.conveyance : 3000,
    medicalAllowance: record?.medicalAllowance !== undefined ? record?.medicalAllowance : 2000,
    specialAllowance: record?.specialAllowance !== undefined ? record?.specialAllowance : 5000,
    otherAllowance: record?.otherAllowance || 0,
    // Deductions Components
    pfDeduction: record?.pfDeduction !== undefined ? record?.pfDeduction : 3000,
    esiDeduction: record?.esiDeduction || 0,
    professionalTax: record?.professionalTax || 200,
    taxDeduction: record?.taxDeduction !== undefined ? record?.taxDeduction : 1500,
    otherDeduction: record?.otherDeduction || 0,
    // Justification Reason
    reason: isEditing ? "Salary structure configuration update" : "Initial compensation allotment by HR",
    remarks: record?.remarks || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // When assigning new salary and picking an employee from dropdown
  const handleSelectEmployee = (empId) => {
    const found = availableEmployees.find((e) => (e.employeeId || e.id) === empId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        employeeId: found.employeeId || found.id,
        employeeName: found.employeeName || found.name,
        department: found.department || prev.department,
        role: found.designation || (found.role === "hr" ? "HR Operations" : "Staff Employee"),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        employeeId: empId,
      }));
    }
  };

  // Live calculated preview
  const preview = calculateSalaryStructure({
    baseSalary: formData.baseSalary,
    hra: formData.hra,
    conveyance: formData.conveyance,
    medicalAllowance: formData.medicalAllowance,
    specialAllowance: formData.specialAllowance,
    otherAllowance: formData.otherAllowance,
    pfDeduction: formData.pfDeduction,
    esiDeduction: formData.esiDeduction,
    professionalTax: formData.professionalTax,
    taxDeduction: formData.taxDeduction,
    otherDeduction: formData.otherDeduction,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  // Auto-calculate allowances proportionally when Base changes
  const handleAutoFillAllowances = () => {
    const base = Number(formData.baseSalary) || 0;
    setFormData((prev) => ({
      ...prev,
      hra: Math.round(base * 0.4),
      conveyance: 3000,
      medicalAllowance: 2000,
      specialAllowance: Math.round(base * 0.2),
      pfDeduction: Math.round(base * 0.12),
      taxDeduction: Math.round((base * 1.6) * 0.05),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.employeeId) {
      setError("Please select or enter an Employee ID.");
      return;
    }
    if (Number(formData.baseSalary) <= 0) {
      setError("Basic Salary must be greater than zero.");
      return;
    }
    if (isEditing && (!formData.reason || formData.reason.trim() === "")) {
      setError("A reason for revising this salary structure is mandatory.");
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await updateSalaryStructure(record.employeeId, formData);
      } else {
        await addSalaryStructure(formData);
      }
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save salary structure.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200/80 dark:border-gray-700 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-850 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? `Edit Salary Structure — ${record.employeeName}` : "Assign Employee Salary (HR Control)"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Configure basic pay, allowances, and statutory deductions for workforce payroll.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Meta Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Select Employee *
              </label>
              {isEditing ? (
                <div className="px-3 py-2 bg-slate-100 dark:bg-gray-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white">
                  {formData.employeeName} ({formData.employeeId})
                </div>
              ) : (
                <select
                  name="employeeSelect"
                  required
                  value={formData.employeeId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose Employee to Set Salary --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                      {emp.employeeName || emp.name} ({emp.employeeId || emp.id}) - {emp.department || "General"}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                name="effectiveFrom"
                required
                value={formData.effectiveFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                Designation / Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Earnings Components Section */}
          <div className="bg-slate-50 dark:bg-gray-750 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FiDollarSign className="w-4 h-4 text-emerald-600" />
                  Earnings Components (Set by HR)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                  Gross = Basic + HRA + Conveyance + Medical + Special + Other
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoFillAllowances}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Auto-calculate standard % bands
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Basic Salary (₹) *
                </label>
                <input
                  type="number"
                  name="baseSalary"
                  required
                  min="0"
                  value={formData.baseSalary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono font-bold text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  HRA (House Rent Allowance ₹)
                </label>
                <input
                  type="number"
                  name="hra"
                  min="0"
                  value={formData.hra}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Conveyance Allowance (₹)
                </label>
                <input
                  type="number"
                  name="conveyance"
                  min="0"
                  value={formData.conveyance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Medical Allowance (₹)
                </label>
                <input
                  type="number"
                  name="medicalAllowance"
                  min="0"
                  value={formData.medicalAllowance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Special Allowance (₹)
                </label>
                <input
                  type="number"
                  name="specialAllowance"
                  min="0"
                  value={formData.specialAllowance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Other Allowance (₹)
                </label>
                <input
                  type="number"
                  name="otherAllowance"
                  min="0"
                  value={formData.otherAllowance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span>Calculated Monthly Gross Salary:</span>
              <span className="text-base font-mono font-black">{formatCurrency(preview.grossSalary)}</span>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="bg-slate-50 dark:bg-gray-750 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Configured Monthly Deductions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  PF / EPF (12% of Basic) (₹)
                </label>
                <input
                  type="number"
                  name="pfDeduction"
                  min="0"
                  value={formData.pfDeduction}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  Professional Tax (₹)
                </label>
                <input
                  type="number"
                  name="professionalTax"
                  min="0"
                  value={formData.professionalTax}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                  TDS / Income Tax (₹)
                </label>
                <input
                  type="number"
                  name="taxDeduction"
                  min="0"
                  value={formData.taxDeduction}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
              <span>Total Monthly Deductions:</span>
              <span className="text-base font-mono font-black">-{formatCurrency(preview.totalDeductions)}</span>
            </div>
          </div>

          {/* Reason / Justification Required */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
              Reason / Justification for Structure Change *
            </label>
            <input
              type="text"
              name="reason"
              required
              placeholder="e.g. Annual compensation band realignment or initial salary allotment"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Final Net Calculation Card */}
          <div className="p-4 bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Estimated Net Take-Home Salary
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {formatCurrency(preview.netSalary)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Annual CTC</span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {formatCurrency(preview.annualCTC)} / annum
              </span>
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              <span>{loading ? "Saving Structure..." : isEditing ? "Update Salary Structure" : "Save & Assign Salary"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
