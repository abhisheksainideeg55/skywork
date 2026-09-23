import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  salaryService,
  INITIAL_SALARY_HISTORY,
  INITIAL_PAYROLL_PERIODS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FINES,
  FINE_CATEGORIES,
  calculateSalaryStructure,
} from "../Services/salaryService";
import api from "../Services/apiClient.js";
import { getUsers } from "../Services/userService";
import { useAttendance } from "./AttendanceContext";
import { useLeave } from "./LeaveContext";
import { useAuth } from "./AuthContext";

const SalaryContext = createContext();

const normalizeId = (val) => String(val || '').trim().toLowerCase().replace(/-/g, '');

// Number to Words converter for Indian Rupee Payslips
export function numberToWords(num) {
  if (!num || isNaN(num) || num === 0) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertGroup(n) {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  const crores = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakhs = Math.floor(rem / 100000);
  rem %= 100000;
  const thousands = Math.floor(rem / 1000);
  rem %= 1000;
  const remaining = rem;

  let result = "";
  if (crores > 0) result += convertGroup(crores) + " Crore ";
  if (lakhs > 0) result += convertGroup(lakhs) + " Lakh ";
  if (thousands > 0) result += convertGroup(thousands) + " Thousand ";
  if (remaining > 0) result += convertGroup(remaining) + " ";

  return (result.trim() + " Rupees Only").replace(/\s+/g, " ");
}

export function SalaryProvider({ children }) {
  const { currentUser } = useAuth();
  const actorId = currentUser?.id || "HR001";
  const actorRole = currentUser?.role || "hr";
  const actorName = currentUser?.name || (actorRole === "superadmin" ? "Super Admin" : "HR Admin");

  // Attendance & Leave integrations
  let attendanceRecords = [];
  try {
    const attContext = useAttendance();
    attendanceRecords = attContext?.records || [];
  } catch {}

  let leaveRequests = [];
  try {
    const leaveCtx = useLeave();
    leaveRequests = leaveCtx?.leaveRequests || [];
  } catch {}

  // 1. Master Salaries State strictly from MongoDB
  const [salaries, setSalaries] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  // Fetch salaries from MongoDB on load
  const loadSalaries = async () => {
    try {
      const [salRes, empRes] = await Promise.all([
        api.get("/salaries").catch(() => ({ success: false, data: [] })),
        api.get("/employees").catch(() => ({ success: false, data: [] })),
      ]);

      const backendSalaries = salRes.success && Array.isArray(salRes.data) ? salRes.data : [];
      const backendEmployees = empRes.success && Array.isArray(empRes.data) ? empRes.data : [];
      setAllEmployees(backendEmployees);

      const empMap = new Map();
      backendEmployees.forEach((emp) => {
        const key = normalizeId(emp.employeeId || emp.id);
        empMap.set(key, emp);
      });

      // ONLY populate salaries that are actually saved in MongoDB
      const formatted = backendSalaries.map((s) => {
        const emp = empMap.get(normalizeId(s.employeeId)) || {};
        return {
          id: s.salaryId || s._id || s.id,
          _id: s._id,
          salaryId: s.salaryId || s.id,
          employeeId: s.employeeId,
          employeeName: s.employeeName || emp.name || emp.employeeName || "Employee",
          avatar: emp.avatar || s.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
          role: s.designation || s.role || emp.designation || emp.role || "Staff Employee",
          department: s.department || emp.department || "Engineering",
          bankName: s.bankName || emp.bankName || "HDFC Bank",
          accountNumber: s.bankAccountNumber || s.accountNumber || emp.accountNumber || "•••• 4892",
          ifscCode: s.ifscCode || emp.ifscCode || "HDFC0001234",
          panNumber: s.panNumber || emp.panNumber || "ABCDE1234F",
          joiningDate: s.joiningDate || emp.joiningDate || "2026-09-22",
          effectiveFrom: s.effectiveFrom || s.createdAt?.split("T")[0] || "2026-09-01",
          lastRevision: s.lastRevision || s.updatedAt?.split("T")[0] || "2026-09-22",
          lastRevisedBy: s.lastRevisedBy || "HR Admin",
          status: s.status || "active",
          isConfigured: true,
          paymentStatus: s.paymentStatus || "Pending",
          disbursementDate: s.disbursementDate || "Pending (Scheduled)",
          payCycle: s.payCycle || "Monthly (1st of month)",
          payslipGenerated: !!s.payslipGenerated,
          remarks: s.remarks || "",
          baseSalary: s.baseSalary || 0,
          hra: s.hra || 0,
          specialAllowance: s.specialAllowance || 0,
          conveyance: s.conveyanceAllowance || s.conveyance || 0,
          medicalAllowance: s.medicalAllowance || 0,
          otherAllowance: s.otherAllowance || 0,
          grossSalary: s.grossSalary || 0,
          pfDeduction: s.pfDeduction || 0,
          taxDeduction: s.taxDeduction || 0,
          professionalTax: s.professionalTax || 0,
          totalDeductions: s.totalDeductions || 0,
          netSalary: s.netSalary || 0,
          annualCTC: s.annualCTC || (s.grossSalary ? s.grossSalary * 12 : 0),
        };
      });

      setSalaries(formatted);
    } catch (err) {
      console.warn("Failed to load salaries from backend:", err.message);
    }
  };

  // Fetch Overtime requests from MongoDB
  const loadOvertimes = async () => {
    try {
      const res = await api.get("/overtimes");
      if (res.success && Array.isArray(res.data)) {
        setOvertime(res.data);
      }
    } catch (err) {
      console.warn("Failed to load overtimes from backend:", err.message);
    }
  };

  useEffect(() => {
    loadSalaries();
    loadOvertimes();
  }, []);

  // 2. Immutable Salary History
  const [salaryHistory, setSalaryHistory] = useState(() => INITIAL_SALARY_HISTORY);

  // 3. Payroll Periods
  const [payrollPeriods, setPayrollPeriods] = useState(() => INITIAL_PAYROLL_PERIODS);

  // 4. Bonuses & Incentives
  const [bonuses, setBonuses] = useState([]);

  // 5. Custom Deductions
  const [deductions, setDeductions] = useState([]);

  // 6. Fines & Penalties (HR / Super Admin)
  const [fines, setFines] = useState([]);

  // 7. Overtime Records
  const [overtime, setOvertime] = useState([]);

  // 8. Advances
  const [advances, setAdvances] = useState([]);

  // 9. Loans
  const [loans, setLoans] = useState([]);

  // 10. Adjustments
  const [adjustments, setAdjustments] = useState([]);

  // 11. Audit Logs
  const [auditLogs, setAuditLogs] = useState(() => INITIAL_AUDIT_LOGS);

  // Month & Year Selector for Payroll
  const [currentMonth, setCurrentMonth] = useState("September");
  const [currentYear, setCurrentYear] = useState(2026);

  // Currency Formatter
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // ============================================================
  // MUTATION ACTIONS (HR EXPLICIT SALARY MANAGEMENT)
  // ============================================================

  // 1. Add New Salary Structure (HR explicitly creates salary for employee)
  const addSalaryStructure = async (data) => {
    const calc = calculateSalaryStructure({
      baseSalary: data.baseSalary,
      hra: data.hra,
      conveyance: data.conveyance,
      medicalAllowance: data.medicalAllowance,
      specialAllowance: data.specialAllowance,
      otherAllowance: data.otherAllowance,
      pfDeduction: data.pfDeduction,
      esiDeduction: data.esiDeduction,
      professionalTax: data.professionalTax,
      taxDeduction: data.taxDeduction,
    });

    const payload = {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      department: data.department || "Engineering",
      designation: data.role || "Staff Employee",
      baseSalary: Number(data.baseSalary) || 0,
      hra: calc.hra,
      specialAllowance: calc.specialAllowance,
      conveyanceAllowance: calc.conveyance,
      medicalAllowance: calc.medicalAllowance,
      grossSalary: calc.grossSalary,
      pfDeduction: calc.pfDeduction,
      taxDeduction: calc.taxDeduction,
      professionalTax: calc.professionalTax,
      totalDeductions: calc.totalDeductions,
      netSalary: calc.netSalary,
      annualCTC: calc.annualCTC,
      bankName: data.bankName || "HDFC Bank",
      bankAccountNumber: data.accountNumber || "•••• 2345",
      ifscCode: data.ifscCode || "HDFC0001234",
      paymentStatus: "Pending",
      payrollMonth: currentMonth,
      payrollYear: currentYear,
    };

    try {
      const res = await api.post("/salaries", payload);
      if (res.success && res.data) {
        const saved = res.data;
        const newRecord = {
          ...data,
          ...calc,
          id: saved.salaryId || saved._id,
          _id: saved._id,
          salaryId: saved.salaryId,
          baseSalary: Number(data.baseSalary) || 0,
          grossSalary: calc.grossSalary,
          netSalary: calc.netSalary,
          totalDeductions: calc.totalDeductions,
          lastRevision: new Date().toISOString().split("T")[0],
          lastRevisedBy: actorName,
          status: "active",
          isConfigured: true,
          paymentStatus: "Pending",
        };
        setSalaries((prev) => {
          const filtered = prev.filter((s) => s.employeeId !== data.employeeId);
          return [newRecord, ...filtered];
        });
        await loadSalaries();
        return newRecord;
      }
    } catch (err) {
      console.error("Error creating salary on backend:", err.message);
      throw err;
    }
  };

  // 2. Update Salary Structure (HR edits salary)
  const updateSalaryStructure = async (employeeId, updatedFields) => {
    const calc = calculateSalaryStructure({
      baseSalary: updatedFields.baseSalary,
      hra: updatedFields.hra,
      conveyance: updatedFields.conveyance,
      medicalAllowance: updatedFields.medicalAllowance,
      specialAllowance: updatedFields.specialAllowance,
      otherAllowance: updatedFields.otherAllowance,
      pfDeduction: updatedFields.pfDeduction,
      esiDeduction: updatedFields.esiDeduction,
      professionalTax: updatedFields.professionalTax,
      taxDeduction: updatedFields.taxDeduction,
    });

    const targetSalary = salaries.find((s) => s.employeeId === employeeId);
    const targetId = targetSalary?._id || targetSalary?.salaryId || employeeId;

    const payload = {
      baseSalary: Number(updatedFields.baseSalary) || 0,
      hra: calc.hra,
      specialAllowance: calc.specialAllowance,
      conveyanceAllowance: calc.conveyance,
      medicalAllowance: calc.medicalAllowance,
      grossSalary: calc.grossSalary,
      pfDeduction: calc.pfDeduction,
      taxDeduction: calc.taxDeduction,
      professionalTax: calc.professionalTax,
      totalDeductions: calc.totalDeductions,
      netSalary: calc.netSalary,
      annualCTC: calc.annualCTC,
      bankName: updatedFields.bankName,
      bankAccountNumber: updatedFields.accountNumber,
      ifscCode: updatedFields.ifscCode,
    };

    try {
      await api.put(`/salaries/${targetId}`, payload);
      setSalaries((prev) =>
        prev.map((s) =>
          s.employeeId === employeeId
            ? {
                ...s,
                ...updatedFields,
                ...calc,
                isConfigured: true,
                baseSalary: Number(updatedFields.baseSalary) || s.baseSalary,
                grossSalary: calc.grossSalary,
                netSalary: calc.netSalary,
                totalDeductions: calc.totalDeductions,
                lastRevision: new Date().toISOString().split("T")[0],
                lastRevisedBy: actorName,
              }
            : s
        )
      );
      await loadSalaries();
    } catch (err) {
      console.error("Error updating salary on backend:", err.message);
      throw err;
    }
  };

  // 3. Increment Salary
  const incrementSalary = async (employeeId, { adjustmentType = "percentage", value, effectiveFrom, reason, remarks = "" }) => {
    const existing = salaries.find((s) => s.employeeId === employeeId);
    if (!existing) throw new Error("Employee salary record not found");

    const oldBase = existing.baseSalary || 0;
    const incrementVal = adjustmentType === "percentage" ? Math.round(oldBase * (Number(value) / 100)) : Number(value);
    const newBase = oldBase + incrementVal;

    await updateSalaryStructure(employeeId, {
      ...existing,
      baseSalary: newBase,
      effectiveFrom: effectiveFrom || new Date().toISOString().split("T")[0],
      reason: reason || "Annual increment revision",
      remarks,
    });
  };

  // 4. Decrement Salary
  const decrementSalary = async (employeeId, { adjustmentType = "percentage", value, targetSalary, effectiveFrom, reason, remarks = "" }) => {
    const existing = salaries.find((s) => s.employeeId === employeeId);
    if (!existing) throw new Error("Employee salary record not found");

    const oldBase = existing.baseSalary || 0;
    let newBase = oldBase;
    if (targetSalary) {
      newBase = Number(targetSalary);
    } else {
      const decrementVal = adjustmentType === "percentage" ? Math.round(oldBase * (Number(value) / 100)) : Number(value);
      newBase = Math.max(0, oldBase - decrementVal);
    }

    await updateSalaryStructure(employeeId, {
      ...existing,
      baseSalary: newBase,
      effectiveFrom: effectiveFrom || new Date().toISOString().split("T")[0],
      reason: reason || "Salary band adjustment",
      remarks,
    });
  };

  // 5. Impose Fine
  const imposeFine = async (employeeId, fineData) => {
    const result = await salaryService.imposeFine(actorId, actorRole, employeeId, {
      ...fineData,
      imposedBy: actorName,
    });
    setFines((prev) => [result.newFine, ...prev]);
    return result.newFine;
  };

  // 6. Waive Fine
  const waiveFine = async (fineId, waiverReason) => {
    setFines((prev) =>
      prev.map((f) =>
        f.id === fineId
          ? { ...f, status: "Waived", waiverReason, waivedBy: actorName, waivedAt: new Date().toISOString() }
          : f
      )
    );
  };

  // 7. Delete Fine
  const deleteFine = async (fineId) => {
    setFines((prev) => prev.filter((f) => f.id !== fineId));
  };

  // 8. Add Bonus
  const addBonus = async (employeeId, bonusData) => {
    const newBonus = {
      id: `BONUS-${Date.now()}`,
      employeeId,
      ...bonusData,
      addedBy: actorName,
      createdAt: new Date().toISOString(),
      status: "Approved",
    };
    setBonuses((prev) => [newBonus, ...prev]);
    return newBonus;
  };

  // 9. Add Deduction
  const addDeduction = async (employeeId, deductionData) => {
    const newDed = {
      id: `DED-${Date.now()}`,
      employeeId,
      ...deductionData,
      createdBy: actorName,
      createdAt: new Date().toISOString(),
      status: "Active",
    };
    setDeductions((prev) => [newDed, ...prev]);
    return newDed;
  };

  // 10. Record / Request Overtime (Synced with MongoDB)
  const recordOvertime = async (employeeId, otData) => {
    try {
      const emp = salaries.find((s) => s.employeeId === employeeId);
      const payload = {
        employeeId,
        employeeName: emp?.employeeName || otData.employeeName || currentUser?.name || "Employee",
        department: emp?.department || "Engineering",
        date: otData.date || new Date().toISOString().split("T")[0],
        regularHours: Number(otData.regularHours) || 8,
        overtimeHours: Number(otData.overtimeHours) || 1,
        hourlyRate: Number(otData.hourlyRate || otData.otRate) || 500,
        project: otData.project || "General Project",
        reason: otData.reason || "Overtime shift extension",
        status: otData.status || (actorRole === "hr" || actorRole === "superadmin" ? "Approved" : "Pending"),
        month: currentMonth,
        year: currentYear,
      };

      const res = await api.post("/overtimes", payload);
      if (res.success && res.data) {
        await loadOvertimes();
        await loadSalaries();
        return res.data;
      }
      throw new Error(res.message || "Failed to record overtime");
    } catch (err) {
      console.error("recordOvertime error:", err);
      throw err;
    }
  };

  // Employee requests overtime (saved as Pending in MongoDB)
  const requestOvertime = async (otData) => {
    return recordOvertime(currentUser?.employeeId || currentUser?.id || "EMP001", {
      ...otData,
      status: "Pending",
    });
  };

  // HR approves overtime
  const approveOvertime = async (overtimeId, remarks = "") => {
    try {
      const res = await api.put(`/overtimes/${overtimeId}/status`, {
        status: "Approved",
        remarks,
      });
      if (res.success) {
        await loadOvertimes();
        await loadSalaries();
        return res.data;
      }
      throw new Error(res.message || "Failed to approve overtime");
    } catch (err) {
      console.error("approveOvertime error:", err);
      throw err;
    }
  };

  // HR rejects overtime
  const rejectOvertime = async (overtimeId, remarks = "") => {
    try {
      const res = await api.put(`/overtimes/${overtimeId}/status`, {
        status: "Rejected",
        remarks,
      });
      if (res.success) {
        await loadOvertimes();
        return res.data;
      }
      throw new Error(res.message || "Failed to reject overtime");
    } catch (err) {
      console.error("rejectOvertime error:", err);
      throw err;
    }
  };

  // Delete overtime
  const removeOvertime = async (overtimeId) => {
    try {
      const res = await api.delete(`/overtimes/${overtimeId}`);
      if (res.success) {
        await loadOvertimes();
        return true;
      }
      throw new Error(res.message || "Failed to delete overtime");
    } catch (err) {
      console.error("removeOvertime error:", err);
      throw err;
    }
  };

  // 11. Create Advance
  const createAdvance = async (employeeId, advanceData) => {
    const newAdv = {
      id: `ADV-${Date.now()}`,
      employeeId,
      ...advanceData,
      approvedBy: actorName,
      createdAt: new Date().toISOString(),
      status: "Active",
    };
    setAdvances((prev) => [newAdv, ...prev]);
    return newAdv;
  };

  // 12. Create Loan
  const createLoan = async (employeeId, loanData) => {
    const newLoan = {
      id: `LOAN-${Date.now()}`,
      employeeId,
      ...loanData,
      approvedBy: actorName,
      createdAt: new Date().toISOString(),
      status: "Active",
    };
    setLoans((prev) => [newLoan, ...prev]);
    return newLoan;
  };

  // 13. Add Adjustment
  const addAdjustment = async (employeeId, adjData) => {
    const newAdj = {
      id: `ADJ-${Date.now()}`,
      employeeId,
      ...adjData,
      createdBy: actorName,
      createdAt: new Date().toISOString(),
      status: "Applied",
    };
    setAdjustments((prev) => [newAdj, ...prev]);
    return newAdj;
  };

  // 14. Approve Payroll
  const approvePayroll = async (month, year) => {
    setPayrollPeriods((prev) =>
      prev.map((p) =>
        p.month === month && p.year === Number(year)
          ? { ...p, status: "Approved", approvedAt: new Date().toISOString(), approvedBy: actorName }
          : p
      )
    );
  };

  // 15. Lock Payroll Period
  const lockPayroll = async (month, year) => {
    setPayrollPeriods((prev) =>
      prev.map((p) =>
        p.month === month && p.year === Number(year)
          ? { ...p, status: "Locked", isLocked: true, lockedAt: new Date().toISOString(), lockedBy: actorName }
          : p
      )
    );
  };

  // 16. Disburse All Salaries
  const disburseAll = (month = "September", year = 2026) => {
    const today = new Date().toISOString().split("T")[0];
    const salaryIds = salaries.map((s) => s.salaryId || s.id).filter(Boolean);

    api.post("/salaries/process-payout", {
      salaryIds,
      paymentStatus: "Paid",
      disbursementDate: today,
    }).catch((err) => console.warn("Payout sync error:", err.message));

    setSalaries((prev) =>
      prev.map((s) => ({
        ...s,
        paymentStatus: "Paid",
        disbursementDate: today,
        payslipGenerated: true,
      }))
    );
  };

  // 17. Toggle Single Disbursement Status
  const toggleDisbursementStatus = (salaryId, newStatus = "Paid") => {
    const today = new Date().toISOString().split("T")[0];
    setSalaries((prev) =>
      prev.map((s) =>
        s.id === salaryId || s.salaryId === salaryId
          ? {
              ...s,
              paymentStatus: newStatus,
              disbursementDate: newStatus === "Paid" ? today : "Pending (Scheduled)",
              payslipGenerated: newStatus === "Paid",
            }
          : s
      )
    );
  };

  // ============================================================
  // SUMMARY CALCULATIONS
  // ============================================================

  const summaryMetrics = useMemo(() => {
    const totalEmployees = salaries.length;
    const totalGross = salaries.reduce((acc, s) => acc + (s.grossSalary || s.currentSalary || 0), 0);
    const totalDeductions = salaries.reduce((acc, s) => acc + (s.totalDeductions || 0), 0);
    const totalNet = salaries.reduce((acc, s) => acc + (s.netSalary || 0), 0);
    const totalBonuses = bonuses.filter((b) => b.status === "Approved").reduce((acc, b) => acc + (b.amount || 0), 0);
    const totalFines = fines.filter((f) => f.status === "Approved" || f.status === "Applied").reduce((acc, f) => acc + (f.amount || 0), 0);
    const pendingPayroll = salaries.filter((s) => s.paymentStatus !== "Paid").length;
    const processedPayroll = salaries.filter((s) => s.paymentStatus === "Paid").length;
    const updatedCount = salaries.filter((s) => s.status === "revised" || s.status === "scheduled").length;

    return {
      totalEmployees,
      totalMonthlyPayroll: totalNet + totalBonuses - totalFines,
      totalGross,
      totalNet,
      totalDeductions,
      totalBonuses,
      totalFines,
      pendingPayroll,
      processedPayroll,
      updatedCount,
    };
  }, [salaries, bonuses, fines]);

  // Integrated Payroll Summary
  const getCalculatedPayrollSummary = (month = "September", year = 2026) => {
    const daysInMonth = 30;
    const standardWorkDays = 22;

    const employeeBreakdowns = salaries.map((s) => {
      const empAtt = attendanceRecords.filter((a) => a.empId === s.employeeId);
      const presentDays = empAtt.filter((a) => a.status === "Present" || a.status === "Late").length || standardWorkDays;
      const lateDays = empAtt.filter((a) => a.late === "Yes").length;

      const empLeaves = leaveRequests.filter((l) => l.employeeId === s.employeeId && l.status === "Approved");
      const unpaidLeaves = empLeaves
        .filter((l) => l.type === "Loss of Pay" || l.type === "Unpaid Leave")
        .reduce((acc, l) => acc + (l.days || 1), 0);

      const perDaySalary = Math.round(s.grossSalary / daysInMonth);
      const lwpDeduction = unpaidLeaves * perDaySalary;

      const empOT = overtime
        .filter((o) => o.employeeId === s.employeeId && o.status === "Approved")
        .reduce((acc, o) => acc + (o.otAmount || 0), 0);

      const empBonus = bonuses
        .filter((b) => b.employeeId === s.employeeId && b.status === "Approved")
        .reduce((acc, b) => acc + (b.amount || 0), 0);

      const empFines = fines.filter(
        (f) => f.employeeId === s.employeeId && (f.status === "Approved" || f.status === "Applied")
      );
      const fineDeduction = empFines.reduce((acc, f) => acc + (f.amount || 0), 0);

      const empAdvance = advances
        .filter((a) => a.employeeId === s.employeeId && a.status === "Active")
        .reduce((acc, a) => acc + Math.min(a.remainingBalance, a.monthlyRecoveryAmount), 0);

      const empLoan = loans
        .filter((l) => l.employeeId === s.employeeId && l.emiStatus === "Active")
        .reduce((acc, l) => acc + Math.min(l.remainingBalance, l.emiAmount), 0);

      const empCustomDed = deductions
        .filter((d) => d.employeeId === s.employeeId && d.status === "Active")
        .reduce((acc, d) => acc + (d.amount || 0), 0);

      const empAdjustments = adjustments
        .filter((a) => a.employeeId === s.employeeId && a.status === "Applied")
        .reduce((acc, a) => acc + (a.adjustmentType === "Addition" ? a.amount : -a.amount), 0);

      const totalEarnings = s.grossSalary + empBonus + empOT + (empAdjustments > 0 ? empAdjustments : 0);
      const totalDeductions =
        s.totalDeductions +
        lwpDeduction +
        fineDeduction +
        empAdvance +
        empLoan +
        empCustomDed +
        (empAdjustments < 0 ? Math.abs(empAdjustments) : 0);

      const netSalary = Math.max(0, totalEarnings - totalDeductions);

      return {
        ...s,
        presentDays,
        lateDays,
        unpaidLeaves,
        perDaySalary,
        lwpDeduction,
        overtimeAmount: empOT,
        bonusAmount: empBonus,
        fineDeductions: fineDeduction,
        finesList: empFines,
        advanceRecovery: empAdvance,
        loanEmi: empLoan,
        customDeductions: empCustomDed,
        adjustments: empAdjustments,
        calculatedGross: totalEarnings,
        calculatedTotalDeductions: totalDeductions,
        finalNet: netSalary,
      };
    });

    const totalGross = employeeBreakdowns.reduce((acc, e) => acc + e.calculatedGross, 0);
    const totalDeductions = employeeBreakdowns.reduce((acc, e) => acc + e.calculatedTotalDeductions, 0);
    const totalNet = employeeBreakdowns.reduce((acc, e) => acc + e.finalNet, 0);
    const totalBonuses = employeeBreakdowns.reduce((acc, e) => acc + e.bonusAmount, 0);
    const totalFines = employeeBreakdowns.reduce((acc, e) => acc + e.fineDeductions, 0);
    const totalOvertime = employeeBreakdowns.reduce((acc, e) => acc + e.overtimeAmount, 0);
    const totalLWP = employeeBreakdowns.reduce((acc, e) => acc + e.lwpDeduction, 0);

    return {
      month,
      year,
      totalEmployees: salaries.length,
      totalGross,
      totalDeductions,
      totalNet,
      totalBonuses,
      totalFines,
      totalOvertime,
      totalLWP,
      employeeBreakdowns,
    };
  };

  return (
    <SalaryContext.Provider
      value={{
        salaries,
        allEmployees,
        salaryHistory,
        payrollPeriods,
        bonuses,
        deductions,
        fines,
        overtime,
        advances,
        loans,
        adjustments,
        auditLogs,
        summaryMetrics,
        currentMonth,
        currentYear,
        setCurrentMonth,
        setCurrentYear,
        formatCurrency,
        numberToWords,
        FINE_CATEGORIES,
        // Actions
        incrementSalary,
        decrementSalary,
        updateSalaryStructure,
        addSalaryStructure,
        imposeFine,
        waiveFine,
        deleteFine,
        addBonus,
        addDeduction,
        recordOvertime,
        requestOvertime,
        approveOvertime,
        rejectOvertime,
        removeOvertime,
        refreshOvertimes: loadOvertimes,
        createAdvance,
        createLoan,
        addAdjustment,
        approvePayroll,
        lockPayroll,
        disburseAll,
        toggleDisbursementStatus,
        getCalculatedPayrollSummary,
        refreshSalaries: loadSalaries,
      }}
    >
      {children}
    </SalaryContext.Provider>
  );
}

export function useSalary() {
  const context = useContext(SalaryContext);
  if (!context) {
    throw new Error("useSalary must be used within a SalaryProvider");
  }
  return context;
}
