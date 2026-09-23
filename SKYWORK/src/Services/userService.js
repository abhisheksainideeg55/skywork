import { BASE_ROLE_PERMISSIONS, DEFAULT_HR_DELEGATABLE, canDelegate } from './rbacService.js';
import api from './apiClient.js';

/**
 * In-memory cache of users fetched from MongoDB backend.
 * getUsers() reads from this cache synchronously (backward compatible).
 * All writes go to backend API first, then refresh the cache.
 */
let _usersCache = [];

const normalizeId = (val) => String(val || '').trim().toLowerCase().replace(/-/g, '');

// ─── Initialization ─────────────────────────────────────────────────────────

/**
 * Initialize users by fetching from MongoDB backend.
 * Called once on app boot from AuthContext.
 */
export const initializeUsers = async () => {
  await fetchUsers();
};

// ─── Fetch / Sync from Backend ───────────────────────────────────────────────

/**
 * Fetch all users from MongoDB backend and update in-memory cache.
 * Dispatches 'skywork_users_changed' event so all contexts re-render.
 */
export const fetchUsers = async () => {
  try {
    const json = await api.get('/users?limit=1000');
    if (json.success && Array.isArray(json.data)) {
      _usersCache = json.data.map((u) => ({
        id: u.employeeId || u.id,
        _id: u._id,
        employeeId: u.employeeId,
        email: u.email,
        name: u.name,
        role: u.role,
        department: u.department || 'General',
        permissions: u.permissions || BASE_ROLE_PERMISSIONS[u.role] || [],
        delegatablePermissions: u.delegatablePermissions || [],
        isActive: u.isActive !== undefined ? u.isActive : true,
        mustChangePassword: u.mustChangePassword || false,
      }));

      _dispatchUsersChanged('sync', _usersCache);
      return _usersCache;
    }
  } catch (err) {
    console.warn('fetchUsers: backend error', err?.message);
  }
  return _usersCache;
};

// ─── Synchronous Getters (read from in-memory cache) ─────────────────────────

export const getUsers = () => {
  return _usersCache;
};

export const getUserById = (id) => {
  if (!id) return null;
  const idx = findUserIndex(_usersCache, id);
  return idx !== -1 ? _usersCache[idx] : null;
};

export const getUserByEmail = (email) => {
  if (!email) return null;
  return _usersCache.find(u => u.email?.toLowerCase() === email.toLowerCase()) || null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const findUserIndex = (users, targetIdentifier, targetEmail = null) => {
  if (!users || !Array.isArray(users)) return -1;
  const targetIdStr = typeof targetIdentifier === 'object' && targetIdentifier !== null
    ? (targetIdentifier.id || targetIdentifier.employeeId || targetIdentifier._id)
    : targetIdentifier;
  const emailStr = typeof targetIdentifier === 'object' && targetIdentifier !== null
    ? targetIdentifier.email
    : targetEmail;

  const targetNorm = normalizeId(targetIdStr);
  const emailNorm = emailStr ? String(emailStr).trim().toLowerCase() : '';

  return users.findIndex(u => {
    if (!u) return false;
    const uIdNorm = normalizeId(u.id);
    const uEmpIdNorm = normalizeId(u.employeeId);
    const uRawId = u._id ? String(u._id).trim().toLowerCase() : '';
    const uEmailNorm = u.email ? String(u.email).trim().toLowerCase() : '';

    if (targetNorm && (uIdNorm === targetNorm || uEmpIdNorm === targetNorm || uRawId === targetNorm)) {
      return true;
    }
    if (emailNorm && uEmailNorm === emailNorm) {
      return true;
    }
    if (targetIdStr && uEmailNorm === String(targetIdStr).trim().toLowerCase()) {
      return true;
    }
    return false;
  });
};

export const generateNextId = (role) => {
  const prefix = role === 'superadmin' ? 'SA' : role === 'hr' ? 'HR' : 'EMP';
  const roleUsers = _usersCache.filter(u => u.id?.startsWith(prefix));

  if (roleUsers.length === 0) return `${prefix}001`;

  const ids = roleUsers.map(u => parseInt(u.id.replace(prefix, ''), 10)).filter(n => !isNaN(n));
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;

  return `${prefix}${(maxId + 1).toString().padStart(3, '0')}`;
};

// ─── CRUD Operations (API-first) ─────────────────────────────────────────────

export const createUser = async (actorUserId, actorRole, userData) => {
  // Enforce system role validation
  const validRoles = ['superadmin', 'hr', 'employee'];
  if (!validRoles.includes(userData.role)) {
    throw new Error(`Invalid role "${userData.role}". Valid system roles are: Super Admin, HR Admin, Employee.`);
  }

  // Security role hierarchy enforcement
  if (actorRole === 'hr') {
    if (userData.role !== 'employee') {
      throw new Error("Privilege Restriction: HR Admin is only permitted to create Employee accounts.");
    }
  } else if (actorRole !== 'superadmin') {
    throw new Error("Privilege Violation: Employees do not have permission to create user accounts.");
  }

  // Handle custom User ID / Employee ID (or auto-generate)
  let newId = userData.id ? userData.id.trim() : '';
  if (!newId) {
    newId = generateNextId(userData.role);
  }

  // Call backend API to create user in MongoDB
  const json = await api.post('/users', {
    employeeId: newId,
    email: userData.email,
    password: userData.password || 'Password@123',
    name: userData.name,
    role: userData.role,
    department: userData.department || 'General',
    permissions: userData.permissions || BASE_ROLE_PERMISSIONS[userData.role] || [],
  });

  // Refresh cache from backend
  await fetchUsers();

  return json.data || { id: newId, ...userData };
};

export const updateUser = async (actorUserId, actorRole, targetUserId, updatedData) => {
  const users = getUsers();
  const targetIndex = findUserIndex(users, targetUserId);

  if (targetIndex === -1) {
    throw new Error("Target user not found.");
  }
  const targetUser = users[targetIndex];

  // Security check
  if (actorRole === 'hr') {
    if (targetUser.role !== 'employee') {
      throw new Error("Access Denied: HR Admin can only modify Employee accounts.");
    }
    if (updatedData.role && updatedData.role !== 'employee') {
      throw new Error("Access Denied: HR Admin cannot change employee role to administrative.");
    }
  } else if (actorRole !== 'superadmin') {
    throw new Error("Access Denied: Employees do not have permission to modify user accounts.");
  }

  const newName = updatedData.name ? updatedData.name.trim() : targetUser.name;
  const newEmail = updatedData.email ? updatedData.email.trim() : targetUser.email;
  const newRole = updatedData.role || targetUser.role;
  const newDepartment = updatedData.department ? updatedData.department.trim() : targetUser.department;

  if (targetUser.role === 'superadmin' && newRole !== 'superadmin') {
    const activeAdmins = users.filter(u => u.role === 'superadmin' && u.isActive);
    if (activeAdmins.length <= 1) {
      throw new Error("Cannot demote the only active Super Admin in the system.");
    }
  }

  // Persist to backend
  await api.put(`/users/${targetUserId}`, {
    name: newName,
    email: newEmail,
    role: newRole,
    department: newDepartment,
    password: updatedData.password,
  });

  // Refresh cache
  await fetchUsers();

  return { ...targetUser, name: newName, email: newEmail, role: newRole, department: newDepartment };
};

export const updateUserPermissions = async (
  actorUserId,
  actorRole,
  targetUserId,
  newPermissions,
  newDelegatablePermissions = null
) => {
  const users = getUsers();
  const actorIdx = findUserIndex(users, actorUserId);
  const actor = actorIdx !== -1 ? users[actorIdx] : null;
  const targetIndex = findUserIndex(users, targetUserId);

  if (targetIndex === -1) throw new Error("Target user not found.");
  const targetUser = users[targetIndex];

  // Hierarchy validation
  if (targetUser.role === 'superadmin' && actorRole !== 'superadmin') {
    throw new Error("Access Denied: Super Admin permissions cannot be modified.");
  }

  if (actorRole === 'hr') {
    if (targetUser.role !== 'employee') {
      throw new Error("Access Denied: HR Admin can only manage Employee permissions.");
    }
    const actorPerms = actor?.permissions || [];
    const actorDelegatable = actor?.delegatablePermissions || [];
    const isAllowed = canDelegate(newPermissions, actorPerms, actorDelegatable, 'hr');
    if (!isAllowed) {
      throw new Error("Privilege Escalation Blocked: HR can only assign permissions that HR possesses and Super Admin has marked as delegatable.");
    }
  }

  // Persist to backend
  await api.put(`/users/${targetUserId}/permissions`, {
    permissions: newPermissions,
    delegatablePermissions: newDelegatablePermissions,
  });

  // Refresh cache
  await fetchUsers();
};

export const toggleUserStatus = async (actorUserId, actorRole, targetUserId, status) => {
  const users = getUsers();
  const targetIndex = findUserIndex(users, targetUserId);
  if (targetIndex === -1) throw new Error("User not found.");

  const targetUser = users[targetIndex];

  if (actorRole !== 'superadmin' && targetUser.role !== 'employee') {
    throw new Error("Access Denied: Only Super Admin can change administrative account status.");
  }

  if (targetUser.role === 'superadmin' && !status) {
    const activeAdmins = users.filter(u => u.role === 'superadmin' && u.isActive);
    if (activeAdmins.length <= 1) {
      throw new Error("Cannot deactivate the last active Super Admin in the system.");
    }
  }

  // Persist to backend
  await api.put(`/users/${targetUserId}/status`, { isActive: status });

  // Refresh cache
  await fetchUsers();
};

export const deleteUser = async (actorUserId, actorRole, targetUserId, targetUserEmail = null) => {
  const users = getUsers();
  const targetIndex = findUserIndex(users, targetUserId, targetUserEmail);
  if (targetIndex === -1) throw new Error("User not found.");

  const targetUser = users[targetIndex];

  // Super Admin cannot be deleted
  if (targetUser.role === 'superadmin') {
    throw new Error("Security Policy: Super Admin accounts cannot be deleted.");
  }

  // Self deletion prevention
  if (actorUserId && normalizeId(targetUser.id) === normalizeId(actorUserId)) {
    throw new Error("Security Policy: You cannot delete your own active account.");
  }

  // Permission hierarchy check
  if (actorRole === 'hr') {
    if (targetUser.role !== 'employee') {
      throw new Error("Access Denied: HR Admin is only permitted to delete Employee accounts.");
    }
  } else if (actorRole !== 'superadmin') {
    throw new Error("Access Denied: You do not have permission to delete user accounts.");
  }

  // Delete from backend
  await api.del(`/users/${targetUser.id}`);

  // Immediately remove from cache and notify UI
  _usersCache = _usersCache.filter(u => normalizeId(u.id) !== normalizeId(targetUser.id));
  _dispatchUsersChanged('delete', _usersCache);

  // Full re-sync for consistency
  await fetchUsers();

  return true;
};

// ─── Internal Helpers ────────────────────────────────────────────────────────

function _dispatchUsersChanged(action, users) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('skywork_users_changed', {
        detail: { action, users },
      })
    );
  }
}
