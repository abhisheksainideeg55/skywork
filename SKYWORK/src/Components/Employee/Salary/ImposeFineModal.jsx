import React, { useState, useEffect } from "react";
import {
  FiX,
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiShield,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiLayers,
} from "react-icons/fi";
import { useSalary } from "../../../Context/SalaryContext";
import { FINE_CATEGORIES } from "../../../Services/salaryService";

export default function ImposeFineModal({
  isOpen,
  onClose,
  selectedEmployee = null,
  onSuccess,
}) {
  const {
    salaries,
    imposeFine,
    formatCurrency,
    currentMonth,
    currentYear,
  } = useSalary();

  // Selected Employee ID
  const [employeeId, setEmployeeId] = useState("");
  const [category, setCategory] = useState("late_arrival");
  const [amount, setAmount] = useState(500);
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [effectiveMonth, setEffectiveMonth] = useState(
    `${currentMonth} ${currentYear}`
  );
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [notifyEmployee, setNotifyEmployee] = useState(true);

  // Stepper: 1 = Form Input, 2 = Confirmation Preview
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync selected employee when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedEmployee) {
        setEmployeeId(selectedEmployee.employeeId);
      } else if (salaries.length > 0 && !employeeId) {
        setEmployeeId(salaries[0].employeeId);
      }
      setCategory("late_arrival");
      setAmount(500);
      setIncidentDate(new Date().toISOString().split("T")[0]);
      setEffectiveMonth(`${currentMonth} ${currentYear}`);
      setReason("");
      setRemarks("");
      setNotifyEmployee(true);
      setStep(1);
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen, selectedEmployee, salaries, currentMonth, currentYear]);

  if (!isOpen) return null;

  // Active target employee object
  const targetEmp = salaries.find((s) => s.employeeId === employeeId) || selectedEmployee || salaries[0];

  const selectedCategoryObj =
    FINE_CATEGORIES.find((c) => c.id === category) || FINE_CATEGORIES[0];

  // Quick preset amounts
  const presetAmounts = [500, 1000, 1500, 2000, 3000, 5000];

  // Category change handler to auto-set sensible default
  const handleCategorySelect = (catId) => {
    setCategory(catId);
    const cat = FINE_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      setAmount(cat.defaultAmount);
    }
  };

  // Statutory check: if fine exceeds 10% of monthly gross
  const isHighFine =
    targetEmp?.grossSalary && Number(amount) > targetEmp.grossSalary * 0.1;

  // Validation
  const handleProceedToReview = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!employeeId) {
      setErrorMsg("Please select an employee.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setErrorMsg("Fine amount must be greater than ₹0.");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("A detailed violation reason/justification is mandatory.");
      return;
    }

    setStep(2);
  };

  // Submission handler
  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const fineData = {
        category,
        amount: Number(amount),
        incidentDate,
        effectiveMonth,
        reason: reason.trim(),
        remarks: remarks.trim(),
        notifyEmployee,
      };

      await imposeFine(employeeId, fineData);

      if (onSuccess) {
        onSuccess(
          `Fine of ${formatCurrency(amount)} successfully imposed on ${targetEmp?.employeeName || "employee"}.`
        );
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to impose fine.");
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case "late_arrival":
        return <FiClock className="text-amber-500" />;
      case "policy_violation":
        return <FiFileText className="text-rose-500" />;
      case "asset_damage":
        return <FiLayers className="text-orange-500" />;
      case "attendance_discrepancy":
        return <FiCalendar className="text-red-500" />;
      case "disciplinary":
        return <FiAlertTriangle className="text-purple-500" />;
      case "security_breach":
        return <FiShield className="text-indigo-500" />;
      default:
        return <FiAlertCircle className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-6 transition-all transform animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-50 to-amber-50/40 dark:from-rose-950/20 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg border border-rose-200 dark:border-rose-900/50">
              <FiAlertTriangle />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Impose Disciplinary Fine / Penalty
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-medium">
                  HR Authority
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Impose policy violation, attendance, or statutory penalty with payroll deduction.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {step === 1 ? (
            <form onSubmit={handleProceedToReview} className="space-y-5">
              
              {/* 1. Target Employee Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Target Employee <span className="text-rose-500">*</span>
                </label>
                {selectedEmployee ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 overflow-hidden text-sm">
                        {targetEmp?.avatar ? (
                          <img
                            src={targetEmp.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          targetEmp?.employeeName?.charAt(0) || "E"
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {targetEmp?.employeeName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {targetEmp?.employeeId} • {targetEmp?.department} • {targetEmp?.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Monthly Gross</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(targetEmp?.grossSalary || 0)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                  >
                    {salaries.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.employeeName} ({emp.employeeId}) — {emp.department} • Gross: ₹{Number(emp.grossSalary).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 2. Penalty Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Violation / Fine Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FINE_CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 ring-1 ring-rose-500"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50"
                        }`}
                      >
                        <div className="text-lg mt-0.5 shrink-0">
                          {getCategoryIcon(cat.id)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {cat.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {cat.description}
                          </div>
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                            Standard: ₹{cat.defaultAmount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Fine Amount (₹) & Quick Presets */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FiDollarSign className="text-rose-500" />
                    Penalty Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  {isHighFine && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <FiAlertTriangle /> Exceeds 10% of monthly gross
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                    placeholder="e.g. 1000"
                    required
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        Number(amount) === preset
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      ₹{preset.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Dates & Payroll Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Incident Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Deduction Payroll Cycle <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={effectiveMonth}
                    onChange={(e) => setEffectiveMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="e.g. September 2026"
                    required
                  />
                </div>
              </div>

              {/* 5. Detailed Reason & Justification (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Violation Reason & Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                  placeholder="Provide explicit facts, timestamps, or policy clause reference justifying this penalty..."
                  required
                />
              </div>

              {/* 6. Remarks / Reference ID (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Internal Remarks / Evidence Reference <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="e.g. CCTV Audit Log #4092, Warning Notice #2"
                />
              </div>

              {/* 7. Notification Checkbox */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  id="notifyEmployee"
                  checked={notifyEmployee}
                  onChange={(e) => setNotifyEmployee(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                />
                <label
                  htmlFor="notifyEmployee"
                  className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  Send official violation notification to employee via In-App Portal & Registered Email
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-semibold shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <span>Review Fine Confirmation</span>
                  <FiCheck />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: CONFIRMATION PREVIEW */
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
                <FiAlertTriangle className="text-base shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <div className="font-bold">Confirmation Required</div>
                  <div>
                    This statutory fine will be registered under the official audit trail and scheduled for direct deduction in the <strong>{effectiveMonth}</strong> payroll disbursement.
                  </div>
                </div>
              </div>

              {/* Review Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                
                {/* Employee Row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Target Employee</div>
                  <div className="text-right font-semibold text-sm text-slate-900 dark:text-white">
                    {targetEmp?.employeeName} ({targetEmp?.employeeId})
                  </div>
                </div>

                {/* Category Row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Violation Category</div>
                  <div className="text-right font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {getCategoryIcon(category)}
                    <span>{selectedCategoryObj.label}</span>
                  </div>
                </div>

                {/* Amount Row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Penalty Amount</div>
                  <div className="text-right font-black text-base text-rose-600 dark:text-rose-400">
                    - {formatCurrency(amount)}
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Incident Date / Cycle</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {incidentDate} • {effectiveMonth}
                  </span>
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Justification / Reason</div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 italic">
                    "{reason}"
                  </p>
                </div>

                {/* Remarks if any */}
                {remarks && (
                  <div className="space-y-1 pt-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Remarks / Evidence</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      {remarks}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  ← Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Penalty...</span>
                  ) : (
                    <>
                      <FiCheckCircle className="text-base" />
                      <span>Confirm & Apply Fine</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
