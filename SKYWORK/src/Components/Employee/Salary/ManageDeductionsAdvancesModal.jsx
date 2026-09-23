import React, { useState } from "react";
import {
  FiX,
  FiMinusCircle,
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiCreditCard,
  FiAlertCircle,
  FiCheckCircle,
  FiLayers,
  FiPercent,
  FiClock,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";

export default function ManageDeductionsAdvancesModal({ isOpen, onClose, selectedEmployee = null, onSuccess }) {
  const {
    salaries,
    deductions,
    advances,
    loans,
    addDeduction,
    createAdvance,
    createLoan,
    formatCurrency,
  } = useSalary();

  const { hasPermission } = useAuth();
  const canDeduction = hasPermission("salary.deduction");
  const canAdvance = hasPermission("salary.advance");
  const canLoan = hasPermission("salary.loan");

  // Tab: 'deductions' | 'advances' | 'loans'
  const [activeTab, setActiveTab] = useState("deductions");

  // Sub-Form for Add New
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [targetEmpId, setTargetEmpId] = useState(selectedEmployee?.employeeId || (salaries[0]?.employeeId || ""));
  const [dedType, setDedType] = useState("Professional Tax");
  const [dedAmount, setDedAmount] = useState(1000);
  const [dedMonth, setDedMonth] = useState("September 2026");
  const [dedReason, setDedReason] = useState("");

  // Advance Form State
  const [advAmount, setAdvAmount] = useState(15000);
  const [advRecoveryMonth, setAdvRecoveryMonth] = useState("October 2026");
  const [advMonthlyRecovery, setAdvMonthlyRecovery] = useState(5000);
  const [advReason, setAdvReason] = useState("");

  // Loan Form State
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanEmi, setLoanEmi] = useState(5000);
  const [loanTenure, setLoanTenure] = useState(10);
  const [loanReason, setLoanReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddDeduction = async (e) => {
    e.preventDefault();
    setError("");
    if (!dedReason.trim()) {
      setError("Please provide a reason for the deduction.");
      return;
    }
    setLoading(true);
    try {
      await addDeduction(targetEmpId, {
        type: dedType,
        amount: Number(dedAmount),
        month: dedMonth,
        reason: dedReason.trim(),
      });
      setShowAddForm(false);
      setDedReason("");
      if (onSuccess) onSuccess("Deduction added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add deduction.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdvance = async (e) => {
    e.preventDefault();
    setError("");
    if (!advReason.trim()) {
      setError("Please provide a justification for this salary advance.");
      return;
    }
    setLoading(true);
    try {
      await createAdvance(targetEmpId, {
        advanceAmount: Number(advAmount),
        recoveryStartMonth: advRecoveryMonth,
        monthlyRecoveryAmount: Number(advMonthlyRecovery),
        reason: advReason.trim(),
      });
      setShowAddForm(false);
      setAdvReason("");
      if (onSuccess) onSuccess("Salary advance schedule created!");
    } catch (err) {
      setError(err.message || "Failed to create advance.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setError("");
    if (!loanReason.trim()) {
      setError("Please provide a reason for the loan approval.");
      return;
    }
    setLoading(true);
    try {
      await createLoan(targetEmpId, {
        loanAmount: Number(loanAmount),
        emiAmount: Number(loanEmi),
        totalTenureMonths: Number(loanTenure),
        reason: loanReason.trim(),
      });
      setShowAddForm(false);
      setLoanReason("");
      if (onSuccess) onSuccess("Employee loan schedule authorized!");
    } catch (err) {
      setError(err.message || "Failed to create loan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200/80 dark:border-gray-700 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-850 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
              <FiMinusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Deductions, Advances & Loan Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Manage statutory taxes, monthly advance amortization, and loan EMI schedules.
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

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("deductions");
                setShowAddForm(false);
              }}
              className={`pb-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === "deductions"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-gray-400"
              }`}
            >
              Custom Deductions ({deductions.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("advances");
                setShowAddForm(false);
              }}
              className={`pb-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === "advances"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-gray-400"
              }`}
            >
              Salary Advances ({advances.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("loans");
                setShowAddForm(false);
              }}
              className={`pb-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === "loans"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-gray-400"
              }`}
            >
              Employee Loans & EMI ({loans.length})
            </button>
          </div>

          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer mb-2"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>
                {activeTab === "deductions" ? "Add Deduction" : activeTab === "advances" ? "Create Advance" : "Create Loan"}
              </span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ADD NEW FORM (Conditionally Shown) */}
          {showAddForm && (
            <div className="bg-slate-50 dark:bg-gray-750 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-700 pb-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {activeTab === "deductions" && "Add New Salary Deduction"}
                  {activeTab === "advances" && "Grant New Salary Advance"}
                  {activeTab === "loans" && "Approve New Employee Loan"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-gray-400 font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* DEDUCTIONS FORM */}
              {activeTab === "deductions" && (
                <form onSubmit={handleAddDeduction} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Select Employee *
                      </label>
                      <select
                        value={targetEmpId}
                        onChange={(e) => setTargetEmpId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-semibold"
                      >
                        {salaries.map((s) => (
                          <option key={s.employeeId} value={s.employeeId}>
                            {s.employeeName} ({s.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Deduction Type *
                      </label>
                      <select
                        value={dedType}
                        onChange={(e) => setDedType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-semibold"
                      >
                        <option value="Professional Tax">Professional Tax</option>
                        <option value="TDS / Tax Adjustment">TDS / Tax Adjustment</option>
                        <option value="Advance Recovery">Advance Recovery</option>
                        <option value="Loan EMI">Loan EMI</option>
                        <option value="Health Insurance Premium">Health Insurance Premium</option>
                        <option value="Other Statutory Deduction">Other Statutory Deduction</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={dedAmount}
                        onChange={(e) => setDedAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Reason / Justification *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Statutory state professional tax adjustment"
                      value={dedReason}
                      onChange={(e) => setDedReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                    >
                      {loading ? "Adding..." : "Confirm Deduction"}
                    </button>
                  </div>
                </form>
              )}

              {/* ADVANCES FORM */}
              {activeTab === "advances" && (
                <form onSubmit={handleCreateAdvance} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Select Employee *
                      </label>
                      <select
                        value={targetEmpId}
                        onChange={(e) => setTargetEmpId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-semibold"
                      >
                        {salaries.map((s) => (
                          <option key={s.employeeId} value={s.employeeId}>
                            {s.employeeName} ({s.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Advance Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="1000"
                        required
                        value={advAmount}
                        onChange={(e) => setAdvAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Monthly Recovery (₹) *
                      </label>
                      <input
                        type="number"
                        min="500"
                        required
                        value={advMonthlyRecovery}
                        onChange={(e) => setAdvMonthlyRecovery(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Reason for Advance *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Festival advance, emergency relocation allowance"
                      value={advReason}
                      onChange={(e) => setAdvReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                    >
                      {loading ? "Authorizing..." : "Authorize Advance"}
                    </button>
                  </div>
                </form>
              )}

              {/* LOANS FORM */}
              {activeTab === "loans" && (
                <form onSubmit={handleCreateLoan} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Select Employee *
                      </label>
                      <select
                        value={targetEmpId}
                        onChange={(e) => setTargetEmpId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-semibold"
                      >
                        {salaries.map((s) => (
                          <option key={s.employeeId} value={s.employeeId}>
                            {s.employeeName} ({s.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Loan Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="5000"
                        required
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Monthly EMI (₹) *
                      </label>
                      <input
                        type="number"
                        min="500"
                        required
                        value={loanEmi}
                        onChange={(e) => setLoanEmi(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Loan Purpose / Reason *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Employee hardware setup loan, higher education assistance"
                      value={loanReason}
                      onChange={(e) => setLoanReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                    >
                      {loading ? "Authorizing..." : "Approve Loan"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* LIST VIEWS */}
          {activeTab === "deductions" && (
            <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-750 text-slate-500 dark:text-gray-400 font-bold border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Deduction Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Applicable Month</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {deductions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-semibold text-slate-800 dark:text-white">
                        {d.employeeName || d.employeeId} ({d.employeeId})
                      </td>
                      <td className="p-3">{d.type}</td>
                      <td className="p-3 font-mono font-bold text-rose-600">
                        -{formatCurrency(d.amount)}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">{d.month}</td>
                      <td className="p-3 text-slate-600 dark:text-gray-300">{d.reason}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 text-[10px] font-bold">
                          {d.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "advances" && (
            <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-750 text-slate-500 dark:text-gray-400 font-bold border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Total Advance</th>
                    <th className="p-3">Monthly Recovery</th>
                    <th className="p-3">Remaining Balance</th>
                    <th className="p-3">Recovery Month</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {advances.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-semibold text-slate-800 dark:text-white">{a.employeeId}</td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-white">{formatCurrency(a.advanceAmount)}</td>
                      <td className="p-3 font-mono font-bold text-rose-600">-{formatCurrency(a.monthlyRecoveryAmount)}/mo</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">{formatCurrency(a.remainingBalance)}</td>
                      <td className="p-3 text-slate-500">{a.recoveryStartMonth}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 text-[10px] font-bold">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "loans" && (
            <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-750 text-slate-500 dark:text-gray-400 font-bold border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Total Principal Loan</th>
                    <th className="p-3">Monthly EMI</th>
                    <th className="p-3">Remaining Balance</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">EMI Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {loans.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-semibold text-slate-800 dark:text-white">{l.employeeId}</td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-white">{formatCurrency(l.loanAmount)}</td>
                      <td className="p-3 font-mono font-bold text-rose-600">-{formatCurrency(l.emiAmount)}/mo</td>
                      <td className="p-3 font-mono font-bold text-purple-600">{formatCurrency(l.remainingBalance)}</td>
                      <td className="p-3 text-slate-600 dark:text-gray-300">{l.reason}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 text-[10px] font-bold">
                          {l.emiStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-gray-850 border-t border-slate-100 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 dark:text-gray-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
