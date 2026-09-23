/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role requirements and granular permission checks
 */

// Base permissions for each role (mirrors frontend rbacService.js)
export const BASE_ROLE_PERMISSIONS = {
  superadmin: [], // Implicitly has ALL permissions
  hr: [
    'view_employees', 'edit_employees', 'add_employees', 'delete_employees',
    'view_attendance', 'edit_attendance', 'manage_attendance',
    'view_leaves', 'approve_leaves', 'manage_leaves',
    'view_holidays', 'manage_holidays',
    'view_wfh', 'approve_wfh', 'manage_wfh',
    'view_shifts', 'manage_shifts', 'assign_shifts',
    'view_breaks', 'manage_breaks',
    'view_salary', 'edit_salary', 'manage_payroll', 'disburse_salary',
    'view_fines', 'manage_fines', 'impose_fines',
    'view_documents', 'manage_documents', 'verify_documents',
    'view_announcements', 'create_announcements', 'manage_announcements',
    'view_notifications', 'send_notifications',
    'view_reports', 'generate_reports',
    'view_audit_logs',
  ],
  employee: [
    'view_own_profile', 'edit_own_profile',
    'view_own_attendance', 'punch_attendance',
    'view_own_leaves', 'apply_leave',
    'view_holidays',
    'view_own_wfh', 'apply_wfh',
    'view_own_shifts',
    'view_own_breaks', 'take_break',
    'view_own_salary', 'view_own_payslips',
    'view_own_documents', 'upload_own_documents',
    'view_announcements',
    'view_own_notifications',
    'view_own_reports',
  ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role, permissions, requiredPermission) => {
  if (role === 'superadmin') return true;
  if (permissions && permissions.includes(requiredPermission)) return true;
  const basePerms = BASE_ROLE_PERMISSIONS[role] || [];
  return basePerms.includes(requiredPermission);
};

/**
 * Middleware: Restrict access to specified roles
 * Usage: authorizeRoles('superadmin', 'hr')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

/**
 * Middleware: Check for specific permission
 * Usage: requirePermission('manage_leaves')
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!hasPermission(req.user.role, req.user.permissions, permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing permission: ${permission}.`,
      });
    }

    next();
  };
};
