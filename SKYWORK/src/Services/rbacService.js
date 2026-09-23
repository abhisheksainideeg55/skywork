// Granular permissions by category across all modules
export const PERMISSION_CATEGORIES = {
  user: ["user.view", "user.create", "user.edit", "user.activate", "user.deactivate"],
  employee: ["employee.view", "employee.create", "employee.edit", "employee.delete"],
  attendance: ["attendance.view", "attendance.manual", "attendance.create", "attendance.edit", "attendance.approve"],
  leave: ["leave.view", "leave.create", "leave.approve", "leave.reject", "leave.manage"],
  shift: ["shift.view", "shift.create", "shift.edit", "shift.assign", "shift.delete"],
  holiday: ["holiday.view", "holiday.create", "holiday.edit", "holiday.delete"],
  salary: [
    "salary.view",
    "salary.create",
    "salary.edit",
    "salary.increment",
    "salary.decrement",
    "salary.fine",
    "salary.deduction",
    "salary.bonus",
    "salary.overtime",
    "salary.advance",
    "salary.loan",
    "salary.history",
    "salary.adjustment",
    "salary.report",
    "salary.export"
  ],
  payroll: [
    "payroll.view",
    "payroll.process",
    "payroll.approve",
    "payroll.lock",
    "salary-slip.generate"
  ],
  notification: ["notification.view", "notification.create", "notification.manage"],
  report: ["report.view", "report.export"],
  settings: ["settings.view", "settings.edit"],
  audit: ["audit.view"],
  permission: ["permission.view", "permission.assign", "permission.revoke"],
  smart_attendance: ["smart_attendance.view", "smart_attendance.configure", "smart_attendance.simulate"]
};

// Flatten all valid permissions
export const ALL_PERMISSIONS = Object.values(PERMISSION_CATEGORIES).flat();

// Pre-defined baseline permissions for active system roles (Super Admin has everything implicitly)
export const BASE_ROLE_PERMISSIONS = {
  hr: [
    ...PERMISSION_CATEGORIES.employee,
    ...PERMISSION_CATEGORIES.attendance,
    ...PERMISSION_CATEGORIES.leave,
    ...PERMISSION_CATEGORIES.shift,
    ...PERMISSION_CATEGORIES.holiday,
    ...PERMISSION_CATEGORIES.salary,
    ...PERMISSION_CATEGORIES.payroll,
    ...PERMISSION_CATEGORIES.notification,
    ...PERMISSION_CATEGORIES.report,
    "smart_attendance.view",
    "user.view", "user.create", "user.edit", "user.activate",
    "permission.view", "permission.assign"
  ],
  employee: [
    "attendance.view",
    "attendance.manual",
    "leave.view",
    "leave.create",
    "shift.view",
    "holiday.view",
    "notification.view",
    "salary.view" // Self-only view
  ]
};

// Default delegatable permissions that Super Admin permits HR to grant to Employees
export const DEFAULT_HR_DELEGATABLE = [
  "attendance.view",
  "attendance.manual",
  "leave.view",
  "leave.create",
  "shift.view",
  "holiday.view",
  "notification.view",
  "salary.view",
  "report.view"
];

/**
 * Validates if the requested permissions are within the delegator's delegatable scope.
 * Prevents privilege escalation.
 * 
 * @param {Array<string>} requestedPermissions - Permissions to be assigned to target user
 * @param {Array<string>} delegatorPermissions - Active permissions of the actor
 * @param {Array<string>} delegatorDelegatable - Subset of permissions actor is authorized to delegate
 * @param {string} delegatorRole - Role of the actor ('superadmin', 'hr', 'employee')
 * @returns {boolean}
 */
export const canDelegate = (
  requestedPermissions = [],
  delegatorPermissions = [],
  delegatorDelegatable = [],
  delegatorRole = 'employee'
) => {
  if (delegatorRole === 'superadmin') return true;
  if (delegatorRole === 'employee') return false; // Employees cannot delegate permissions

  // HR can only delegate permissions that:
  // 1. HR itself possesses
  // 2. Are marked as delegatable by Super Admin
  const allowedPool = delegatorDelegatable.length > 0 
    ? delegatorDelegatable.filter(p => delegatorPermissions.includes(p))
    : delegatorPermissions;

  return requestedPermissions.every(p => allowedPool.includes(p));
};

/**
 * Checks whether a user holds a specific permission.
 * Super Admin implicitly has all permissions.
 */
export const hasPermission = (userPermissions = [], requiredPermission, userRole) => {
  if (userRole === 'superadmin') return true;
  if (!requiredPermission) return true;
  if (Array.isArray(userPermissions) && userPermissions.includes(requiredPermission)) return true;
  const roleBase = BASE_ROLE_PERMISSIONS[userRole] || [];
  return roleBase.includes(requiredPermission);
};
