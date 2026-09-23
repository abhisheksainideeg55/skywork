/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for Super Admin, HR Admin, and Employee
 */

export const HOLIDAY_PERMISSIONS = {
  superadmin: {
    viewHolidays: true,
    viewHolidayDetails: true,
    searchHolidays: true,
    filterHolidays: true,
    createHoliday: true,
    editHoliday: true,
    deleteHoliday: true,
    manageStatus: true,
    viewUpcomingHolidays: true,
    viewAllCompanyHolidays: true,
    exportHolidays: true,
  },
  hr: {
    viewHolidays: true,
    viewHolidayDetails: true,
    searchHolidays: true,
    filterHolidays: true,
    createHoliday: true,
    editHoliday: true,
    deleteHoliday: true,
    manageStatus: true,
    viewUpcomingHolidays: true,
    viewAllCompanyHolidays: true,
    exportHolidays: true,
  },
  employee: {
    viewHolidays: true,
    viewHolidayDetails: true,
    searchHolidays: true,
    filterHolidays: true,
    createHoliday: false,
    editHoliday: false,
    deleteHoliday: false,
    manageStatus: false,
    viewUpcomingHolidays: true,
    viewAllCompanyHolidays: true,
    exportHolidays: true,
  },
};

export const SALARY_PERMISSIONS = {
  superadmin: {
    viewAllSalaries: true,
    viewSalaryDetails: true,
    createSalary: true,
    editSalary: true,
    incrementSalary: true,
    decrementSalary: true,
    viewSalaryHistory: true,
    managePayroll: true,
    lockPayroll: true,
    viewAuditLogs: true,
    generatePayslip: true,
    addBonus: true,
    addDeduction: true,
    disburseSalary: true,
  },
  hr: {
    viewAllSalaries: true,
    viewSalaryDetails: true,
    createSalary: true,
    editSalary: true,
    incrementSalary: true,
    decrementSalary: true,
    viewSalaryHistory: true,
    managePayroll: true,
    lockPayroll: true,
    viewAuditLogs: true,
    generatePayslip: true,
    addBonus: true,
    addDeduction: true,
    disburseSalary: true,
  },
  employee: {
    viewAllSalaries: false,
    viewSalaryDetails: false,
    createSalary: false,
    editSalary: false,
    incrementSalary: false,
    decrementSalary: false,
    viewSalaryHistory: false,
    managePayroll: false,
    lockPayroll: false,
    viewAuditLogs: false,
    generatePayslip: false, // Employee views their own payslip on /salary
    addBonus: false,
    addDeduction: false,
    disburseSalary: false,
  },
};

/**
 * Normalizes user role string to 'superadmin', 'hr', or 'employee'
 * @param {string} role
 * @returns {"superadmin" | "hr" | "employee"}
 */
export function normalizeRole(role) {
  if (!role) return "employee";
  const r = role.toLowerCase();
  if (r.includes("super") || r.includes("master")) return "superadmin";
  if (r.includes("hr") || r.includes("admin")) return "hr";
  return "employee";
}

/**
 * Checks if a given role possesses a specific holiday permission
 * @param {string} role - The user's role string
 * @param {string} permissionKey - Key defined in HOLIDAY_PERMISSIONS
 * @returns {boolean}
 */
export function hasHolidayPermission(role, permissionKey) {
  const normRole = normalizeRole(role);
  const rolePermissions = HOLIDAY_PERMISSIONS[normRole];
  if (!rolePermissions) return false;
  return Boolean(rolePermissions[permissionKey]);
}

/**
 * Checks if a given role possesses a specific salary permission
 * @param {string} role - The user's role string
 * @param {string} permissionKey - Key defined in SALARY_PERMISSIONS
 * @returns {boolean}
 */
export function hasSalaryPermission(role, permissionKey) {
  const normRole = normalizeRole(role);
  const rolePermissions = SALARY_PERMISSIONS[normRole];
  if (!rolePermissions) return false;
  return Boolean(rolePermissions[permissionKey]);
}

/**
 * Validates if the authenticated role is HR or Super Admin
 * @param {string} role
 * @returns {boolean}
 */
export function isHROnly(role) {
  const norm = normalizeRole(role);
  return norm === "hr" || norm === "superadmin";
}
