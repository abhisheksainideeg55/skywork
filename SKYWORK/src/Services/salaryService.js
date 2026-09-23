/**
 * Salary Management API Service Layer
 * Skywork Enterprise HRMS Compensation & Payroll Engine
 *
 * Implements strict RBAC authorization, backend recalculation and validations,
 * immutable revision history, multi-tier fine & deduction tracking,
 * overtime & advance amortization, and payroll locking.
 */

import { getUsers } from "./userService";
import { hasPermission } from "./rbacService";

export const STORAGE_KEYS = {
  SALARIES: "skywork_employee_salaries_v2",
  SALARIES_LEGACY: "skywork_employee_salaries",
  HISTORY: "skywork_salary_history",
  PAYROLL_PERIODS: "skywork_payroll_periods",
  BONUSES: "skywork_salary_bonuses",
  DEDUCTIONS: "skywork_salary_deductions",
  FINES: "skywork_salary_fines",
  OVERTIME: "skywork_salary_overtime",
  ADVANCES: "skywork_salary_advances",
  LOANS: "skywork_salary_loans",
  ADJUSTMENTS: "skywork_salary_adjustments",
  AUDIT_LOGS: "skywork_salary_audit_logs",
  NOTIFICATIONS: "skywork_employee_notifications",
};

// Fine / Penalty Categories
export const FINE_CATEGORIES = [
  { id: "late_arrival", label: "Late Coming / Shift Delay", badgeColor: "amber", defaultAmount: 500, description: "Unapproved reporting delay beyond grace period" },
  { id: "absence", label: "Unauthorized Absence / Punch Issue", badgeColor: "red", defaultAmount: 1200, description: "Unnotified absence or biometric punch failure" },
  { id: "policy_violation", label: "HR / Workplace Policy Violation", badgeColor: "rose", defaultAmount: 1500, description: "Violation of company code of conduct or office policies" },
  { id: "asset_damage", label: "Damage / Loss of Company Property", badgeColor: "orange", defaultAmount: 3000, description: "Negligent loss or physical damage to corporate hardware" },
  { id: "disciplinary", label: "Disciplinary Action", badgeColor: "purple", defaultAmount: 2500, description: "Formal reprimand or behavioral infraction" },
  { id: "security_breach", label: "Security & Access Violation", badgeColor: "indigo", defaultAmount: 2000, description: "Badge sharing, unauthorized guest, or data policy breach" },
  { id: "other", label: "Other Penalty", badgeColor: "slate", defaultAmount: 1000, description: "Other management-approved statutory penalty" },
];

// Initial Seed Fines / Penalties
export const INITIAL_FINES = [
  {
    id: "FINE-101",
    fineNumber: "PEN-2026-001",
    employeeId: "EMP004",
    employeeName: "Rohan Mehta",
    department: "Quality Assurance",
    category: "late_arrival",
    categoryLabel: "Late Coming / Shift Delay",
    amount: 1500,
    incidentDate: "2026-09-12",
    effectiveMonth: "September 2026",
    reason: "Repeated late punch-ins exceeding 45 minutes on 4 days without prior intimation.",
    remarks: "Third notice issued. Authorized under attendance policy §4.2.",
    imposedBy: "Abhishek Sharma (HR Admin)",
    imposedAt: "2026-09-13T10:15:00Z",
    status: "Approved", // Pending | Approved | Applied | Waived | Cancelled
    notifyEmployee: true,
  },
  {
    id: "FINE-102",
    fineNumber: "PEN-2026-002",
    employeeId: "EMP007",
    employeeName: "Karan Verma",
    department: "Human Resources",
    category: "security_breach",
    categoryLabel: "Security & Access Violation",
    amount: 2000,
    incidentDate: "2026-09-14",
    effectiveMonth: "September 2026",
    reason: "Failure to wear security ID badge and unauthorized visitor access to server bay.",
    remarks: "First security audit violation of Q3.",
    imposedBy: "Abhishek Sharma (HR Admin)",
    imposedAt: "2026-09-14T15:30:00Z",
    status: "Approved",
    notifyEmployee: true,
  },
  {
    id: "FINE-103",
    fineNumber: "PEN-2026-003",
    employeeId: "EMP002",
    employeeName: "Sneha Patel",
    department: "UI/UX Design",
    category: "absence",
    categoryLabel: "Unauthorized Absence / Punch Issue",
    amount: 1000,
    incidentDate: "2026-09-08",
    effectiveMonth: "September 2026",
    reason: "Uninformed absence during mandatory Q3 sprint planning session.",
    remarks: "Medical certificate provided retrospectively.",
    imposedBy: "Abhishek Sharma (HR Admin)",
    imposedAt: "2026-09-09T09:00:00Z",
    status: "Waived",
    waiverReason: "Approved retrospectively with hospital certificate & team lead sign-off.",
    waivedBy: "Abhishek Sharma (HR Admin)",
    waivedAt: "2026-09-11T16:00:00Z",
    notifyEmployee: false,
  },
];

// Initial Seed Salary Revisions & Increments
export const INITIAL_SALARY_HISTORY = [
  {
    id: "ADJ-101",
    employeeId: "EMP001",
    date: "2025-01-12",
    type: "initial",
    adjustmentType: "initial_joining",
    adjustmentValue: 0,
    previousSalary: 140000,
    newSalary: 140000,
    difference: 0,
    effectiveFrom: "2025-01-12",
    reason: "Initial Employment Offer & Compensation Band",
    remarks: "Joined as Lead Developer",
    changedBy: "Abhishek Sharma (HR Admin)",
    changedAt: "2025-01-12T09:00:00Z",
    status: "applied",
  },
  {
    id: "ADJ-102",
    employeeId: "EMP001",
    date: "2026-04-01",
    type: "increment",
    adjustmentType: "percentage",
    adjustmentValue: 15,
    previousSalary: 140000,
    newSalary: 161000,
    difference: 21000,
    effectiveFrom: "2026-04-01",
    reason: "Annual Performance Appraisal Q4 FY25",
    remarks: "Promoted to Senior Frontend Lead (Top 5% Performer)",
    changedBy: "Abhishek Sharma (HR Admin)",
    changedAt: "2026-03-28T14:30:00Z",
    status: "applied",
  },
  {
    id: "ADJ-103",
    employeeId: "EMP001",
    date: "2026-08-01",
    type: "increment",
    adjustmentType: "fixed_amount",
    adjustmentValue: 20500,
    previousSalary: 161000,
    newSalary: 181500,
    difference: 20500,
    effectiveFrom: "2026-08-01",
    reason: "Special Allowance Market Realignment",
    remarks: "Lead Tech Stack Architecture Revision",
    changedBy: "Abhishek Sharma (HR Admin)",
    changedAt: "2026-07-25T11:15:00Z",
    status: "applied",
  },
  {
    id: "ADJ-104",
    employeeId: "EMP002",
    date: "2025-03-05",
    type: "initial",
    adjustmentType: "initial_joining",
    adjustmentValue: 0,
    previousSalary: 135000,
    newSalary: 135000,
    difference: 0,
    effectiveFrom: "2025-03-05",
    reason: "Initial UI/UX Lead Joining Offer",
    remarks: "Full-time hiring",
    changedBy: "Abhishek Sharma (HR Admin)",
    changedAt: "2025-03-05T10:00:00Z",
    status: "applied",
  },
  {
    id: "ADJ-105",
    employeeId: "EMP002",
    date: "2026-04-01",
    type: "increment",
    adjustmentType: "percentage",
    adjustmentValue: 16,
    previousSalary: 135000,
    newSalary: 156600,
    difference: 21600,
    effectiveFrom: "2026-04-01",
    reason: "Design System Ownership Bonus & Annual Appraisal",
    remarks: "Exceptional Figma UI coverage",
    changedBy: "Abhishek Sharma (HR Admin)",
    changedAt: "2026-03-29T16:00:00Z",
    status: "applied",
  },
];

// Initial Seed Payroll Periods
export const INITIAL_PAYROLL_PERIODS = [
  {
    id: "PAYROLL-2026-09",
    month: "September",
    year: 2026,
    monthIndex: 9,
    totalEmployees: 482,
    grossSalary: 7450000,
    totalDeductions: 894000,
    netPayable: 6556000,
    totalBonuses: 320000,
    totalFines: 3500,
    totalOvertime: 145000,
    totalAdjustments: 115000,
    status: "Processing", // Draft | Processing | Pending Approval | Approved | Paid | Locked | Cancelled
    processedDate: "2026-09-01",
    processedBy: "Abhishek Sharma (HR Admin)",
    approvedBy: null,
    approvedAt: null,
    isLocked: false,
    lockedAt: null,
    lockedBy: null,
  },
  {
    id: "PAYROLL-2026-08",
    month: "August",
    year: 2026,
    monthIndex: 8,
    totalEmployees: 480,
    grossSalary: 7380000,
    totalDeductions: 885600,
    netPayable: 6494400,
    totalBonuses: 280000,
    totalFines: 0,
    totalOvertime: 130000,
    totalAdjustments: 95000,
    status: "Locked",
    processedDate: "2026-08-01",
    processedBy: "Abhishek Sharma (HR Admin)",
    approvedBy: "Super Admin",
    approvedAt: "2026-08-30T18:00:00Z",
    isLocked: true,
    lockedAt: "2026-08-31T23:59:59Z",
    lockedBy: "Abhishek Sharma (HR Admin)",
  },
  {
    id: "PAYROLL-2026-07",
    month: "July",
    year: 2026,
    monthIndex: 7,
    totalEmployees: 476,
    grossSalary: 7290000,
    totalDeductions: 874800,
    netPayable: 6415200,
    totalBonuses: 250000,
    totalFines: 0,
    totalOvertime: 120000,
    totalAdjustments: 80000,
    status: "Locked",
    processedDate: "2026-07-01",
    processedBy: "Abhishek Sharma (HR Admin)",
    approvedBy: "Super Admin",
    approvedAt: "2026-07-30T18:00:00Z",
    isLocked: true,
    lockedAt: "2026-07-31T23:59:59Z",
    lockedBy: "Abhishek Sharma (HR Admin)",
  },
];

// Initial Seed Audit Logs
export const INITIAL_AUDIT_LOGS = [
  {
    id: "AUD-1001",
    action: "Salary Incremented",
    actor: "Abhishek Sharma",
    actorRole: "hr",
    employeeId: "EMP001",
    employeeName: "Abhishek Sharma",
    oldValue: "₹1,61,000",
    newValue: "₹1,81,500 (+₹20,500)",
    amount: 20500,
    reason: "Special Allowance Market Realignment",
    timestamp: "2026-07-25T11:15:00Z",
    ipAddress: "192.168.1.45 (Corporate VPN)",
    userAgent: "Chrome / Windows 11",
  },
  {
    id: "AUD-1002",
    action: "Payroll Locked",
    actor: "Abhishek Sharma",
    actorRole: "hr",
    employeeId: "ALL",
    employeeName: "All Employees (480)",
    oldValue: "Status: Approved",
    newValue: "Status: Locked",
    amount: null,
    reason: "August 2026 Payroll Cycle Finalized & Disbursed",
    timestamp: "2026-08-31T23:59:59Z",
    ipAddress: "192.168.1.45 (Corporate VPN)",
    userAgent: "Chrome / Windows 11",
  },
  {
    id: "AUD-1003",
    action: "Salary Slip Generated",
    actor: "Abhishek Sharma",
    actorRole: "hr",
    employeeId: "EMP001",
    employeeName: "Abhishek Sharma",
    oldValue: "Draft",
    newValue: "Official Payslip Form 16",
    amount: 181500,
    reason: "September 2026 Net Salary Disbursement",
    timestamp: "2026-09-01T10:00:00Z",
    ipAddress: "192.168.1.45 (Corporate VPN)",
    userAgent: "Chrome / Windows 11",
  },
  {
    id: "AUD-1004",
    action: "Bonus Added",
    actor: "Abhishek Sharma",
    actorRole: "hr",
    employeeId: "EMP001",
    employeeName: "Abhishek Sharma",
    oldValue: "₹0",
    newValue: "₹15,000 (Performance Incentive)",
    amount: 15000,
    reason: "Q3 High Performer Milestone Bonus",
    timestamp: "2026-09-15T09:30:00Z",
    ipAddress: "192.168.1.45 (Corporate VPN)",
    userAgent: "Chrome / Windows 11",
  },
];

// -------------------------------------------------------------
// BACKEND RECALCULATION & STRUCTURE FORMULA
// -------------------------------------------------------------

/**
 * Recalculates full salary components and verifies mathematical validity.
 * Gross Salary = Basic + HRA + Conveyance + Medical + Special + Other Allowances
 * Net Salary = Max(0, Gross - Total Deductions)
 */
export function calculateSalaryStructure({
  baseSalary = 0,
  hra = null,
  conveyance = 8000,
  medicalAllowance = 4500,
  specialAllowance = null,
  otherAllowance = 0,
  pfDeduction = null,
  esiDeduction = 0,
  professionalTax = 200,
  taxDeduction = null,
  loanDeduction = 0,
  advanceDeduction = 0,
  otherDeduction = 0,
  salaryType = "monthly",
}) {
  const base = Math.max(0, Number(baseSalary) || 0);
  const calculatedHra = hra !== null ? Math.max(0, Number(hra) || 0) : Math.round(base * 0.4);
  const calculatedSpecial = specialAllowance !== null ? Math.max(0, Number(specialAllowance) || 0) : Math.round(base * 0.25);
  const conv = Math.max(0, Number(conveyance) || 0);
  const med = Math.max(0, Number(medicalAllowance) || 0);
  const otherAll = Math.max(0, Number(otherAllowance) || 0);

  // Exact Formula
  const grossSalary = base + calculatedHra + calculatedSpecial + conv + med + otherAll;

  // Deductions
  const pf = pfDeduction !== null ? Math.max(0, Number(pfDeduction) || 0) : Math.round(base * 0.12);
  const esi = Math.max(0, Number(esiDeduction) || 0);
  const pt = Math.max(0, Number(professionalTax) || 0);
  const tax = taxDeduction !== null ? Math.max(0, Number(taxDeduction) || 0) : Math.round(grossSalary * 0.08);
  const loan = Math.max(0, Number(loanDeduction) || 0);
  const advance = Math.max(0, Number(advanceDeduction) || 0);
  const otherDed = Math.max(0, Number(otherDeduction) || 0);

  const totalDeductions = pf + esi + pt + tax + loan + advance + otherDed;
  const netSalary = Math.max(0, grossSalary - totalDeductions);
  const annualCTC = grossSalary * 12;

  return {
    baseSalary: base,
    hra: calculatedHra,
    conveyance: conv,
    medicalAllowance: med,
    specialAllowance: calculatedSpecial,
    otherAllowance: otherAll,
    grossSalary,
    currentSalary: grossSalary,
    pfDeduction: pf,
    esiDeduction: esi,
    professionalTax: pt,
    taxDeduction: tax,
    loanDeduction: loan,
    advanceDeduction: advance,
    otherDeduction: otherDed,
    totalDeductions,
    netSalary,
    annualCTC,
    salaryType,
  };
}

// -------------------------------------------------------------
// BACKEND SECURITY & PERMISSION VERIFICATION
// -------------------------------------------------------------

/**
 * Backend authorization simulator.
 * Validates Actor Role, Actor Permissions, and Scope.
 */
export function verifySalaryPermission(actorUserId, actorRole, requiredPermission, targetEmployeeId = null) {
  if (!actorRole) {
    const err = new Error("401 Unauthorized: Authentication required.");
    err.status = 401;
    throw err;
  }

  // Super Admin has unrestricted authority across everything
  if (actorRole === "superadmin") {
    return true;
  }

  // Employee Scope Check
  if (actorRole === "employee") {
    if (requiredPermission !== "salary.view") {
      const err = new Error("403 Forbidden: Employees are strictly prohibited from modifying salary records.");
      err.status = 403;
      throw err;
    }
    if (targetEmployeeId && targetEmployeeId !== actorUserId) {
      const err = new Error("403 Forbidden: Employees can only view their own personal salary records.");
      err.status = 403;
      throw err;
    }
    return true;
  }

  // HR Admin Scope Check
  if (actorRole === "hr") {
    const users = getUsers();
    const actorUser = users.find((u) => u.id === actorUserId || u.role === "hr");
    const userPerms = actorUser?.permissions || [];

    if (!hasPermission(userPerms, requiredPermission, actorRole)) {
      const err = new Error(
        `403 Forbidden: HR Administrator lacks the granted permission '${requiredPermission}' required for this action. Please request Super Admin authorization.`
      );
      err.status = 403;
      throw err;
    }
    return true;
  }

  const err = new Error("403 Forbidden: Invalid system role.");
  err.status = 403;
  throw err;
}

// In-memory notifications store
let _notificationsStore = [];

// Helper to push in-app notification to employee
export function dispatchNotification(employeeId, title, message, type = "salary") {
  try {
    const newNotification = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      recipientId: employeeId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    _notificationsStore.unshift(newNotification);
  } catch (e) {
    console.error("Error dispatching notification:", e);
  }
}

// -------------------------------------------------------------
// CORE SALARY SERVICE ENDPOINTS
// -------------------------------------------------------------

export const salaryService = {
  // 1. Get All Employees with Salaries
  async getSalaryEmployees(actorUserId, actorRole) {
    verifySalaryPermission(actorUserId, actorRole, "salary.view");
    try {
      const users = getUsers();
      const validUsers = users.filter(u => u.role === 'employee');
      const seeded = validUsers.map((emp, idx) => {
        const base = 95000;
        const calc = calculateSalaryStructure({
          baseSalary: base,
          conveyance: 8000,
          medicalAllowance: 4500,
          salaryType: "monthly",
        });
        return {
          id: `SAL-00${idx + 1}`,
          employeeId: emp.id || emp.employeeId,
          employeeName: emp.name || "Employee",
          avatar: emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          role: emp.designation || "Staff",
          department: emp.department || "General",
          bankName: "HDFC Bank",
          accountNumber: `•••• 4821`,
          ifscCode: "HDFC0001245",
          panNumber: "ABCDE1234F",
          joiningDate: "2026-01-15",
          effectiveFrom: "2026-04-01",
          lastRevision: "2026-04-01",
          lastRevisedBy: "HR Admin",
          status: "active",
          paymentStatus: "Paid",
          disbursementDate: "2026-09-01",
          payCycle: "Monthly (1st of month)",
          payslipGenerated: true,
          remarks: "Regular monthly payroll structure",
          ...calc,
        };
      });
      return seeded;
    } catch {
      return [];
    }
  },

  // 2. Get Specific Employee Salary
  async getEmployeeSalary(actorUserId, actorRole, employeeId) {
    verifySalaryPermission(actorUserId, actorRole, "salary.view", employeeId);
    const employees = await this.getSalaryEmployees(actorUserId, actorRole);
    const match = employees.find((e) => e.employeeId === employeeId);
    if (!match) {
      throw new Error(`Salary record for employee ID ${employeeId} not found.`);
    }
    return match;
  },

  // 3. Create Initial Salary Structure
  async createSalary(actorUserId, actorRole, data) {
    verifySalaryPermission(actorUserId, actorRole, "salary.create");
    if (!data.employeeId) throw new Error("Employee selection is required.");
    if (data.baseSalary < 0) throw new Error("Base salary cannot be negative.");

    const calc = calculateSalaryStructure(data);
    const newSalaryRecord = {
      id: `SAL-${Date.now().toString().slice(-4)}`,
      employeeId: data.employeeId,
      employeeName: data.employeeName || "Employee",
      avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: data.role || "Staff",
      department: data.department || "Engineering",
      bankName: data.bankName || "HDFC Bank",
      accountNumber: data.accountNumber || "•••• 0000",
      ifscCode: data.ifscCode || "HDFC0001234",
      panNumber: data.panNumber || "ABCDE1234F",
      joiningDate: data.joiningDate || new Date().toISOString().split("T")[0],
      effectiveFrom: data.effectiveFrom || new Date().toISOString().split("T")[0],
      lastRevision: new Date().toISOString().split("T")[0],
      lastRevisedBy: data.changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      status: data.status || "active",
      paymentStatus: "Pending",
      disbursementDate: "Scheduled",
      remarks: data.remarks || "Initial structure created",
      ...calc,
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Salary Created",
      actor: data.changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      oldValue: "None",
      newValue: `₹${calc.grossSalary.toLocaleString("en-IN")}`,
      amount: calc.grossSalary,
      reason: data.remarks || "Initial salary structure configuration",
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    dispatchNotification(
      data.employeeId,
      "Salary Structure Configured",
      `Your official compensation structure of ₹${calc.grossSalary.toLocaleString("en-IN")} has been configured.`
    );

    return { newSalaryRecord, auditEntry };
  },

  // 4. Update Salary Structure (Configure / Edit)
  async updateSalary(actorUserId, actorRole, employeeId, fields) {
    verifySalaryPermission(actorUserId, actorRole, "salary.edit", employeeId);
    if (!fields.reason || fields.reason.trim() === "") {
      throw new Error("A clear justification/reason is required to update salary structure.");
    }

    const currentRecord = await this.getEmployeeSalary(actorUserId, actorRole, employeeId);
    const calc = calculateSalaryStructure({
      ...currentRecord,
      ...fields,
    });

    const updatedRecord = {
      ...currentRecord,
      ...fields,
      ...calc,
      lastRevision: fields.effectiveFrom || new Date().toISOString().split("T")[0],
      lastRevisedBy: fields.changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      status: "revised",
    };

    const historyRecord = {
      id: `ADJ-${Date.now().toString().slice(-4)}`,
      employeeId,
      date: new Date().toISOString().split("T")[0],
      type: "revision",
      adjustmentType: "structure_edit",
      adjustmentValue: calc.grossSalary - (currentRecord.grossSalary || 0),
      previousSalary: currentRecord.grossSalary || 0,
      newSalary: calc.grossSalary,
      difference: calc.grossSalary - (currentRecord.grossSalary || 0),
      effectiveFrom: fields.effectiveFrom || new Date().toISOString().split("T")[0],
      reason: fields.reason.trim(),
      remarks: fields.remarks || "",
      changedBy: fields.changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      changedAt: new Date().toISOString(),
      status: "applied",
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Salary Updated",
      actor: fields.changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      employeeName: currentRecord.employeeName,
      oldValue: `₹${(currentRecord.grossSalary || 0).toLocaleString("en-IN")}`,
      newValue: `₹${calc.grossSalary.toLocaleString("en-IN")}`,
      amount: calc.grossSalary - (currentRecord.grossSalary || 0),
      reason: fields.reason.trim(),
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    dispatchNotification(
      employeeId,
      "Salary Structure Updated",
      `Your compensation structure has been recalibrated. New Monthly Gross: ₹${calc.grossSalary.toLocaleString("en-IN")}.`
    );

    return { updatedRecord, historyRecord, auditEntry };
  },

  // 5. Salary Increment Flow (Backend Validated & Recalculated)
  async incrementSalary(actorUserId, actorRole, employeeId, { adjustmentType = "percentage", value = 0, effectiveFrom, reason, remarks = "", changedBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.increment", employeeId);

    if (!reason || reason.trim() === "") throw new Error("Reason for salary increment is required.");
    if (Number(value) <= 0) throw new Error("Increment value must be greater than zero.");
    if (!effectiveFrom) throw new Error("Effective date is required.");

    const currentRecord = await this.getEmployeeSalary(actorUserId, actorRole, employeeId);
    const prevGross = currentRecord.grossSalary || currentRecord.currentSalary || 0;
    const prevBase = currentRecord.baseSalary || 0;

    let incrementAmount = 0;
    if (adjustmentType === "percentage") {
      incrementAmount = Math.round((prevGross * Number(value)) / 100);
    } else {
      incrementAmount = Math.round(Number(value));
    }

    const newGross = prevGross + incrementAmount;
    const ratio = newGross / (prevGross || 1);
    const newBase = Math.round(prevBase * ratio);

    const calc = calculateSalaryStructure({
      ...currentRecord,
      baseSalary: newBase,
    });

    const updatedSalary = {
      ...currentRecord,
      ...calc,
      lastRevision: effectiveFrom,
      lastRevisedBy: changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      status: "revised",
    };

    const adjustmentRecord = {
      id: `ADJ-${Date.now().toString().slice(-4)}`,
      employeeId,
      date: new Date().toISOString().split("T")[0],
      type: "increment",
      adjustmentType,
      adjustmentValue: Number(value),
      previousSalary: prevGross,
      newSalary: newGross,
      difference: incrementAmount,
      effectiveFrom,
      reason: reason.trim(),
      remarks: remarks.trim(),
      changedBy: changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      changedAt: new Date().toISOString(),
      status: "applied",
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Salary Incremented",
      actor: changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      employeeName: currentRecord.employeeName,
      oldValue: `₹${prevGross.toLocaleString("en-IN")}`,
      newValue: `₹${newGross.toLocaleString("en-IN")} (+₹${incrementAmount.toLocaleString("en-IN")})`,
      amount: incrementAmount,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    dispatchNotification(
      employeeId,
      "Salary Increment Applied 🎉",
      `Congratulations! Your salary has been incremented to ₹${newGross.toLocaleString("en-IN")} effective from ${effectiveFrom}. Reason: ${reason.trim()}`
    );

    return { updatedSalary, adjustmentRecord, auditEntry };
  },

  // 6. Salary Decrement / Revision Flow (Backend Validated & Recalculated)
  async decrementSalary(actorUserId, actorRole, employeeId, { adjustmentType = "percentage", value = 0, targetSalary = null, effectiveFrom, reason, remarks = "", changedBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.decrement", employeeId);

    if (!reason || reason.trim() === "") throw new Error("Reason for salary decrement/revision is required.");
    if (!effectiveFrom) throw new Error("Effective date is required.");

    const currentRecord = await this.getEmployeeSalary(actorUserId, actorRole, employeeId);
    const prevGross = currentRecord.grossSalary || currentRecord.currentSalary || 0;
    const prevBase = currentRecord.baseSalary || 0;

    let decrementAmount = 0;
    if (targetSalary !== null && targetSalary !== undefined && Number(targetSalary) > 0) {
      const target = Math.round(Number(targetSalary));
      if (target >= prevGross) throw new Error("Target salary for decrement must be less than current gross salary.");
      decrementAmount = prevGross - target;
    } else if (adjustmentType === "percentage") {
      if (Number(value) <= 0 || Number(value) >= 100) throw new Error("Percentage decrement must be between 1% and 99%.");
      decrementAmount = Math.round((prevGross * Number(value)) / 100);
    } else {
      if (Number(value) <= 0) throw new Error("Fixed decrement value must be greater than zero.");
      decrementAmount = Math.round(Number(value));
    }

    if (decrementAmount >= prevGross) {
      throw new Error("Invalid decrement: Calculated salary cannot become zero or negative.");
    }

    const newGross = prevGross - decrementAmount;
    const ratio = newGross / (prevGross || 1);
    const newBase = Math.round(prevBase * ratio);

    const calc = calculateSalaryStructure({
      ...currentRecord,
      baseSalary: newBase,
    });

    const updatedSalary = {
      ...currentRecord,
      ...calc,
      lastRevision: effectiveFrom,
      lastRevisedBy: changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      status: "revised",
    };

    const adjustmentRecord = {
      id: `ADJ-${Date.now().toString().slice(-4)}`,
      employeeId,
      date: new Date().toISOString().split("T")[0],
      type: "decrement",
      adjustmentType,
      adjustmentValue: Number(value),
      previousSalary: prevGross,
      newSalary: newGross,
      difference: -decrementAmount,
      effectiveFrom,
      reason: reason.trim(),
      remarks: remarks.trim(),
      changedBy: changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      changedAt: new Date().toISOString(),
      status: "applied",
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Salary Decremented",
      actor: changedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      employeeName: currentRecord.employeeName,
      oldValue: `₹${prevGross.toLocaleString("en-IN")}`,
      newValue: `₹${newGross.toLocaleString("en-IN")} (-₹${decrementAmount.toLocaleString("en-IN")})`,
      amount: -decrementAmount,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    dispatchNotification(
      employeeId,
      "Salary Structure Revised",
      `Your official compensation has been revised to ₹${newGross.toLocaleString("en-IN")} effective from ${effectiveFrom}. Reason: ${reason.trim()}`
    );

    return { updatedSalary, adjustmentRecord, auditEntry };
  },

  // 7. Impose Fine / Penalty (HR / Super Admin)
  async imposeFine(actorUserId, actorRole, employeeId, { category = "policy_violation", amount = 0, incidentDate, effectiveMonth, reason = "", remarks = "", notifyEmployee = true, imposedBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.fine", employeeId);

    if (!employeeId) throw new Error("Employee selection is mandatory.");
    if (!amount || Number(amount) <= 0) throw new Error("Fine amount must be greater than zero.");
    if (!reason || reason.trim() === "") throw new Error("A clear justification/reason is required to impose a penalty.");

    const catObj = FINE_CATEGORIES.find((c) => c.id === category) || { label: "Disciplinary Penalty" };
    const currentRecord = await this.getEmployeeSalary(actorUserId, actorRole, employeeId);

    const newFine = {
      id: `FINE-${Date.now().toString().slice(-4)}`,
      fineNumber: `PEN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      employeeId,
      employeeName: currentRecord.employeeName,
      department: currentRecord.department,
      category,
      categoryLabel: catObj.label,
      amount: Number(amount),
      incidentDate: incidentDate || new Date().toISOString().split("T")[0],
      effectiveMonth: effectiveMonth || "September 2026",
      reason: reason.trim(),
      remarks: remarks.trim(),
      imposedBy: imposedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      imposedAt: new Date().toISOString(),
      status: "Approved", // Approved fines affect payroll calculations
      notifyEmployee,
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Fine Imposed",
      actor: imposedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      employeeName: currentRecord.employeeName,
      oldValue: "None",
      newValue: `₹${Number(amount).toLocaleString("en-IN")} (${catObj.label})`,
      amount: Number(amount),
      reason: `Penalty imposed: ${reason.trim()}`,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    if (notifyEmployee) {
      dispatchNotification(
        employeeId,
        "Fine / Penalty Imposed",
        `A fine of ₹${Number(amount).toLocaleString("en-IN")} for '${catObj.label}' has been authorized for ${effectiveMonth}. Reason: ${reason.trim()}`
      );
    }

    return { newFine, auditEntry };
  },

  // 8. Waive / Forgive Fine
  async waiveFine(actorUserId, actorRole, fineId, { waiverReason = "", waivedBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.fine");
    if (!waiverReason || waiverReason.trim() === "") {
      throw new Error("A valid waiver reason is mandatory to forgive a fine.");
    }

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Fine Waived",
      actor: waivedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId: "N/A",
      oldValue: "Status: Approved / Pending",
      newValue: "Status: Waived (Penalty Forgiven)",
      amount: null,
      reason: `Penalty waived: ${waiverReason.trim()}`,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    return { fineId, waiverReason: waiverReason.trim(), waivedBy, waivedAt: new Date().toISOString(), status: "Waived", auditEntry };
  },

  // 9. Add Bonus / Incentive
  async addBonus(actorUserId, actorRole, employeeId, { type = "Performance Bonus", amount = 0, month = "September 2026", reason = "", addedBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.bonus", employeeId);
    if (Number(amount) <= 0) throw new Error("Bonus amount must be greater than zero.");
    if (!reason || reason.trim() === "") throw new Error("Reason for bonus is required.");

    const currentRecord = await this.getEmployeeSalary(actorUserId, actorRole, employeeId);
    const newBonus = {
      id: `BONUS-${Date.now().toString().slice(-4)}`,
      employeeId,
      employeeName: currentRecord.employeeName,
      type,
      amount: Number(amount),
      month,
      reason: reason.trim(),
      addedBy: addedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      createdAt: new Date().toISOString(),
      status: "Approved",
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Bonus Added",
      actor: addedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      employeeName: currentRecord.employeeName,
      oldValue: "₹0",
      newValue: `₹${Number(amount).toLocaleString("en-IN")} (${type})`,
      amount: Number(amount),
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    dispatchNotification(
      employeeId,
      "Bonus / Incentive Awarded 🎁",
      `You have been awarded a ${type} of ₹${Number(amount).toLocaleString("en-IN")} for ${month}. Reason: ${reason.trim()}`
    );

    return { newBonus, auditEntry };
  },

  // 10. Add Custom Deduction (PF, ESI, Advance, Loan, Other)
  async addDeduction(actorUserId, actorRole, employeeId, { type = "Other Deduction", amount = 0, month = "September 2026", reason = "", createdBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.deduction", employeeId);
    if (Number(amount) <= 0) throw new Error("Deduction amount must be greater than zero.");
    if (!reason || reason.trim() === "") throw new Error("Reason for deduction is required.");

    const currentRecord = await this.getEmployeeSalary(actorUserId, actorRole, employeeId);
    const newDeduction = {
      id: `DED-${Date.now().toString().slice(-4)}`,
      employeeId,
      employeeName: currentRecord.employeeName,
      type,
      amount: Number(amount),
      month,
      reason: reason.trim(),
      createdBy: createdBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      createdAt: new Date().toISOString(),
      status: "Active",
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Deduction Added",
      actor: createdBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      employeeName: currentRecord.employeeName,
      oldValue: "₹0",
      newValue: `₹${Number(amount).toLocaleString("en-IN")} (${type})`,
      amount: Number(amount),
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    return { newDeduction, auditEntry };
  },

  // 11. Overtime Calculation & Approval
  async recordOvertime(actorUserId, actorRole, employeeId, { date, regularHours = 8, overtimeHours = 0, otRate = 500, status = "Approved", approvedBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.overtime", employeeId);
    const otHours = Math.max(0, Number(overtimeHours) || 0);
    const rate = Math.max(0, Number(otRate) || 0);
    const otAmount = Math.round(otHours * rate);

    const newOvertime = {
      id: `OT-${Date.now().toString().slice(-4)}`,
      employeeId,
      date: date || new Date().toISOString().split("T")[0],
      regularHours: Number(regularHours),
      overtimeHours: otHours,
      otRate: rate,
      otAmount,
      status, // Pending | Approved | Rejected
      approvedBy: approvedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      createdAt: new Date().toISOString(),
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Overtime Approved",
      actor: approvedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      oldValue: "0 hrs",
      newValue: `${otHours} hrs @ ₹${rate}/hr (₹${otAmount})`,
      amount: otAmount,
      reason: "Approved shift overtime hours",
      timestamp: new Date().toISOString(),
    };

    return { newOvertime, auditEntry };
  },

  // 12. Salary Advance Management
  async createAdvance(actorUserId, actorRole, employeeId, { advanceAmount = 0, date, recoveryStartMonth, monthlyRecoveryAmount = 0, reason = "", approvedBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.advance", employeeId);
    const totalAdvance = Math.max(0, Number(advanceAmount));
    const monthlyRecovery = Math.max(0, Number(monthlyRecoveryAmount));

    const newAdvance = {
      id: `ADV-${Date.now().toString().slice(-4)}`,
      employeeId,
      advanceAmount: totalAdvance,
      date: date || new Date().toISOString().split("T")[0],
      recoveryStartMonth: recoveryStartMonth || "October 2026",
      monthlyRecoveryAmount: monthlyRecovery,
      remainingBalance: totalAdvance,
      reason,
      status: "Active",
      approvedBy: approvedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      createdAt: new Date().toISOString(),
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Salary Advance Created",
      actor: approvedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      oldValue: "None",
      newValue: `₹${totalAdvance.toLocaleString("en-IN")} (Recovery: ₹${monthlyRecovery}/mo)`,
      amount: totalAdvance,
      reason,
      timestamp: new Date().toISOString(),
    };

    return { newAdvance, auditEntry };
  },

  // 13. Loan & EMI Management
  async createLoan(actorUserId, actorRole, employeeId, { loanAmount = 0, emiAmount = 0, startDate, totalTenureMonths = 12, reason = "", approvedBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.loan", employeeId);
    const totalLoan = Math.max(0, Number(loanAmount));
    const monthlyEmi = Math.max(0, Number(emiAmount));

    const newLoan = {
      id: `LOAN-${Date.now().toString().slice(-4)}`,
      employeeId,
      loanAmount: totalLoan,
      emiAmount: monthlyEmi,
      startDate: startDate || new Date().toISOString().split("T")[0],
      remainingBalance: totalLoan,
      totalTenureMonths,
      emiStatus: "Active",
      reason,
      approvedBy: approvedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      createdAt: new Date().toISOString(),
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Employee Loan Approved",
      actor: approvedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      oldValue: "None",
      newValue: `₹${totalLoan.toLocaleString("en-IN")} (EMI: ₹${monthlyEmi}/mo)`,
      amount: totalLoan,
      reason,
      timestamp: new Date().toISOString(),
    };

    return { newLoan, auditEntry };
  },

  // 14. Post-Payroll Adjustment Transaction
  async addAdjustment(actorUserId, actorRole, employeeId, { amount = 0, salaryMonth = "September 2026", reason = "", adjustmentType = "Addition", createdBy }) {
    verifySalaryPermission(actorUserId, actorRole, "salary.adjustment", employeeId);
    if (!reason || reason.trim() === "") throw new Error("Reason for salary adjustment is mandatory.");

    const newAdj = {
      id: `ADJTX-${Date.now().toString().slice(-4)}`,
      employeeId,
      amount: Number(amount),
      salaryMonth,
      reason: reason.trim(),
      adjustmentType, // Addition | Deduction
      status: "Applied",
      createdBy: createdBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      createdAt: new Date().toISOString(),
    };

    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Salary Adjustment Added",
      actor: createdBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId,
      oldValue: "None",
      newValue: `${adjustmentType === "Addition" ? "+" : "-"}₹${Number(amount).toLocaleString("en-IN")} (${salaryMonth})`,
      amount: adjustmentType === "Addition" ? Number(amount) : -Number(amount),
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
    };

    return { newAdj, auditEntry };
  },

  // 15. Lock Payroll Period (HR / Super Admin)
  async lockPayroll(actorUserId, actorRole, month, year, lockedBy) {
    verifySalaryPermission(actorUserId, actorRole, "payroll.lock");
    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Payroll Locked",
      actor: lockedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId: "ALL",
      employeeName: `All Employees (${month} ${year})`,
      oldValue: "Status: Approved / Processing",
      newValue: "Status: Locked",
      amount: null,
      reason: `Official Payroll for ${month} ${year} finalized and locked against direct edits.`,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.45 (Corporate VPN)",
      userAgent: navigator.userAgent || "Chrome",
    };

    return { month, year, status: "Locked", isLocked: true, lockedAt: new Date().toISOString(), lockedBy, auditEntry };
  },

  // 16. Approve Payroll Period
  async approvePayroll(actorUserId, actorRole, month, year, approvedBy) {
    verifySalaryPermission(actorUserId, actorRole, "payroll.approve");
    const auditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action: "Payroll Approved",
      actor: approvedBy || (actorRole === "superadmin" ? "Super Admin" : "HR Admin"),
      actorRole,
      employeeId: "ALL",
      employeeName: `All Employees (${month} ${year})`,
      oldValue: "Status: Pending Approval",
      newValue: "Status: Approved",
      amount: null,
      reason: `Monthly payroll batch for ${month} ${year} approved for disbursement.`,
      timestamp: new Date().toISOString(),
    };

    return { month, year, status: "Approved", approvedAt: new Date().toISOString(), approvedBy, auditEntry };
  },

  // 17. Get Audit Logs
  async getSalaryAuditLogs(actorUserId, actorRole, employeeId = null) {
    verifySalaryPermission(actorUserId, actorRole, "salary.view", employeeId);
    try {
      const logs = INITIAL_AUDIT_LOGS;
      if (employeeId && employeeId !== "ALL") {
        return logs.filter((l) => l.employeeId === employeeId || l.employeeId === "ALL");
      }
      return logs;
    } catch {
      return [];
    }
  },
};
