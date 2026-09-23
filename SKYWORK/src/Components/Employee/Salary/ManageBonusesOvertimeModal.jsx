import React, { useState } from "react";
import {
  FiX,
  FiGift,
  FiClock,
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { useAuth } from "../../../Context/AuthContext";

export default function ManageBonusesOvertimeModal({ isOpen, onClose, selectedEmployee = null, onSuccess }) {
  const {
    salaries,
    bonuses,
    overtime,
    addBonus,
    recordOvertime,
    approveOvertime,
    rejectOvertime,
    removeOvertime,
    formatCurrency,
  } = useSalary();

  const { hasPermission } = useAuth();
  const canBonus = hasPermission("salary.bonus");
  const canOvertime = hasPermission("salary.overtime");

  const [activeTab, setActiveTab] = useState("bonuses"); // 'bonuses' | 'overtime'
  const [showAddForm, setShowAddForm] = useState(false);

  // Bonus Form State
  const [targetEmpId, setTargetEmpId] = useState(selectedEmployee?.employeeId || (salaries[0]?.employeeId || ""));
  const [bonusType, setBonusType] = useState("Performance Bonus");
  const [bonusAmount, setBonusAmount] = useState(15000);
  const [bonusMonth, setBonusMonth] = useState("September 2026");
  const [bonusReason, setBonusReason] = useState("");

  // Overtime Form State
  const [otDate, setOtDate] = useState(new Date().toISOString().split("T")[0]);
  const [regularHours, setRegularHours] = useState(8);
  const [overtimeHours, setOvertimeHours] = useState(4);
  const [otRate, setOtRate] = useState(500);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddBonus = async (e) => {
    e.preventDefault();
    setError("");
    if (!bonusReason.trim()) {
      setError("Please provide a reason for the bonus.");
      return;
    }
    setLoading(true);
    try {
      await addBonus(targetEmpId, {
        type: bonusType,
        amount: Number(bonusAmount),
        month: bonusMonth,
        reason: bonusReason.trim(),
      });
      setShowAddForm(false);
      setBonusReason("");
      if (onSuccess) onSuccess("Bonus added and approved!");
    } catch (err) {
      setError(err.message || "Failed to add bonus.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordOvertime = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await recordOvertime(targetEmpId, {
        date: otDate,
        regularHours: Number(regularHours),
        overtimeHours: Number(overtimeHours),
        otRate: Number(otRate),
        status: "Approved",
      });
      setShowAddForm(false);
      if (onSuccess) onSuccess("Overtime record verified & approved!");
    } catch (err) {
      setError(err.message || "Failed to record overtime.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200/80 dark:border-gray-700 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-700 bg-amber-50/60 dark:bg-amber-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <FiGift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Bonuses, Incentives & Overtime Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Grant performance incentives, festive bonuses, and calculate overtime payouts.
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab("bonuses");
                setShowAddForm(false);
              }}
              className={`pb-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === "bonuses"
                  ? "border-amber-600 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-gray-400"
              }`}
            >
              Bonuses & Incentives ({bonuses.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("overtime");
                setShowAddForm(false);
              }}
              className={`pb-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === "overtime"
                  ? "border-amber-600 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-gray-400"
              }`}
            >
              Overtime Calculations ({overtime.length})
            </button>
          </div>

          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer mb-2"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>{activeTab === "bonuses" ? "Award Bonus" : "Add Overtime"}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {showAddForm && (
            <div className="bg-slate-50 dark:bg-gray-750 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-700 pb-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {activeTab === "bonuses" ? "Award New Bonus / Incentive" : "Record Shift Overtime Hours"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-gray-400 font-bold"
                >
                  Cancel
                </button>
              </div>

              {activeTab === "bonuses" ? (
                <form onSubmit={handleAddBonus} className="space-y-3">
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
                        Bonus Category *
                      </label>
                      <select
                        value={bonusType}
                        onChange={(e) => setBonusType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-semibold"
                      >
                        <option value="Performance Bonus">Performance Bonus</option>
                        <option value="Festival Bonus">Festival Bonus</option>
                        <option value="Annual Bonus">Annual Bonus</option>
                        <option value="Joining Bonus">Joining Bonus</option>
                        <option value="Incentive">Incentive</option>
                        <option value="Special Bonus">Special Bonus</option>
                        <option value="Other Bonus">Other Bonus</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="500"
                        required
                        value={bonusAmount}
                        onChange={(e) => setBonusAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-bold font-mono text-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Reason / Appraisal Milestone *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q3 outstanding sprint execution and client satisfaction rating"
                      value={bonusReason}
                      onChange={(e) => setBonusReason(e.target.value)}
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
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                    >
                      {loading ? "Awarding..." : "Award & Approve Bonus"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Overtime Form */
                <form onSubmit={handleRecordOvertime} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={otDate}
                        onChange={(e) => setOtDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        Overtime Hours *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="16"
                        step="0.5"
                        required
                        value={overtimeHours}
                        onChange={(e) => setOvertimeHours(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-gray-300 mb-1">
                        OT Hourly Rate (₹) *
                      </label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={otRate}
                        onChange={(e) => setOtRate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Calculated Overtime Payout (Hours × Rate):</span>
                    <span className="font-mono text-sm">{formatCurrency(overtimeHours * otRate)}</span>
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
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                    >
                      {loading ? "Recording..." : "Verify & Approve OT"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TABLE VIEWS */}
          {activeTab === "bonuses" && (
            <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-750 text-slate-500 dark:text-gray-400 font-bold border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Bonus Category</th>
                    <th className="p-3">Bonus Amount</th>
                    <th className="p-3">Applicable Month</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {bonuses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                      <td className="p-3 font-semibold text-slate-800 dark:text-white">
                        {b.employeeName || b.employeeId} ({b.employeeId})
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-gray-300">{b.type}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">+{formatCurrency(b.amount)}</td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">{b.month}</td>
                      <td className="p-3 text-slate-600 dark:text-gray-300">{b.reason}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 text-[10px] font-bold">
                          {b.status || "Approved"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "overtime" && (
            <div className="border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              {overtime.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-gray-400">
                  No overtime requests or logs found in database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-gray-750 text-slate-500 dark:text-gray-400 font-bold border-b border-slate-200 dark:border-gray-700">
                      <tr>
                        <th className="p-3">Employee</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Project / Reason</th>
                        <th className="p-3">OT Hours</th>
                        <th className="p-3">Rate</th>
                        <th className="p-3">OT Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                      {overtime.map((o) => {
                        const otKey = o.overtimeId || o._id || o.id;
                        const otAmount = o.totalAmount || o.otAmount || (o.overtimeHours * (o.hourlyRate || o.otRate || 500));
                        return (
                          <tr key={otKey} className="hover:bg-slate-50/50 dark:hover:bg-gray-750/30">
                            <td className="p-3">
                              <span className="font-semibold text-slate-800 dark:text-white block">
                                {o.employeeName || o.employeeId}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {o.employeeId}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 dark:text-gray-400">{o.date}</td>
                            <td className="p-3 max-w-[200px]">
                              <span className="font-medium text-slate-700 dark:text-gray-300 block truncate">
                                {o.project || "General"}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {o.reason || "—"}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-800 dark:text-white">
                              {o.overtimeHours} hrs
                            </td>
                            <td className="p-3 font-mono text-slate-500">
                              ₹{o.hourlyRate || o.otRate || 500}/hr
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-600">
                              +{formatCurrency(otAmount)}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.status === "Approved"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    : o.status === "Rejected"
                                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                }`}
                              >
                                {o.status || "Pending"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {o.status !== "Approved" && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await approveOvertime(otKey);
                                        if (onSuccess) onSuccess("Overtime approved and added to salary!");
                                      } catch (err) {
                                        alert(err.message || "Failed to approve");
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                {o.status !== "Rejected" && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await rejectOvertime(otKey);
                                        if (onSuccess) onSuccess("Overtime request rejected.");
                                      } catch (err) {
                                        alert(err.message || "Failed to reject");
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-[10px] cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm("Remove this overtime record?")) {
                                      try {
                                        await removeOvertime(otKey);
                                        if (onSuccess) onSuccess("Overtime record removed.");
                                      } catch (err) {
                                        alert(err.message || "Failed to delete");
                                      }
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-500 text-xs cursor-pointer"
                                  title="Delete record"
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
