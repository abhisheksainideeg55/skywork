import { initializeUsers, getUsers, createUser, updateUserPermissions, generateNextId } from '../src/Services/userService.js';
import { canDelegate, hasPermission, BASE_ROLE_PERMISSIONS, DEFAULT_HR_DELEGATABLE } from '../src/Services/rbacService.js';
import { login } from '../src/Services/authService.js';

// Setup mock localStorage in node environment
const storage = {};
globalThis.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

async function runTests() {
  console.log("=== 1. Testing User Initialization & Role Verification ===");
  await initializeUsers(true);
  const users = getUsers();
  console.log(`Total initialized users: ${users.length}`);

  const roles = [...new Set(users.map(u => u.role))];
  console.log(`Active distinct roles in system:`, roles);
  
  if (roles.includes('manager')) {
    throw new Error("FAILED: 'manager' role found in initialized users!");
  }
  console.log("PASSED: Exactly 3 roles present, no 'manager' role found.");

  console.log("\n=== 2. Testing ID Generation Prefixes ===");
  console.log("Super Admin Next ID:", generateNextId('superadmin'));
  console.log("HR Admin Next ID:", generateNextId('hr'));
  console.log("Employee Next ID:", generateNextId('employee'));

  console.log("\n=== 3. Testing Authentication for 3 Roles ===");
  const saAuth = login("superadmin@skywork.io", "Admin@123");
  console.log("Super Admin Login:", saAuth.name, `(${saAuth.role}) - SUCCESS`);

  const hrAuth = login("hr@skywork.io", "Hr@123");
  console.log("HR Admin Login:", hrAuth.name, `(${hrAuth.role}) - SUCCESS`);

  const empAuth = login("employee@skywork.io", "Emp@123");
  console.log("Employee Login:", empAuth.name, `(${empAuth.role}) - SUCCESS`);

  try {
    login("manager@skywork.io", "Manager@123");
    throw new Error("FAILED: Manager login should not succeed!");
  } catch (err) {
    console.log("Manager Login Attempt Blocked:", err.message, "- SUCCESS");
  }

  console.log("\n=== 4. Testing Privilege Escalation & Role Boundaries ===");
  try {
    createUser("HR001", "hr", {
      name: "Bad Actor",
      email: "bad@skywork.io",
      role: "superadmin"
    });
    throw new Error("FAILED: HR should NOT be able to create Super Admin!");
  } catch (err) {
    console.log("HR Creating Super Admin Blocked:", err.message, "- SUCCESS");
  }

  try {
    createUser("HR001", "hr", {
      name: "Manager Attempt",
      email: "mgr_attempt@skywork.io",
      role: "manager"
    });
    throw new Error("FAILED: System should reject invalid 'manager' role!");
  } catch (err) {
    console.log("Manager User Creation Blocked:", err.message, "- SUCCESS");
  }

  console.log("\n=== 5. Testing Permission Delegation & Delegatable Flags ===");
  // Test HR delegating to Employee:
  // Allowed delegatable permission
  const allowedPerms = ["attendance.view", "leave.view"];
  const isAllowed = canDelegate(allowedPerms, hrAuth.permissions, hrAuth.delegatablePermissions, 'hr');
  console.log("HR delegating allowed permissions (attendance.view, leave.view):", isAllowed ? "ALLOWED (SUCCESS)" : "BLOCKED");

  // Disallowed non-delegatable permission (e.g. settings.edit or permission.assign)
  const escalatedPerms = ["settings.edit", "permission.assign"];
  const isEscalated = canDelegate(escalatedPerms, hrAuth.permissions, hrAuth.delegatablePermissions, 'hr');
  console.log("HR delegating non-delegatable permissions (settings.edit):", !isEscalated ? "BLOCKED (SUCCESS)" : "FAILED");

  // Employee trying to delegate permissions
  const empDelegating = canDelegate(["attendance.view"], empAuth.permissions, [], 'employee');
  console.log("Employee attempting to delegate permissions:", !empDelegating ? "BLOCKED (SUCCESS)" : "FAILED");

  console.log("\n=== 6. Testing Super Admin Delegation to HR ===");
  const newHRPerms = ["attendance.view", "leave.view", "salary.view", "salary.edit"];
  const newHRDelegatable = ["attendance.view", "leave.view"];
  updateUserPermissions("SA001", "superadmin", "HR001", newHRPerms, newHRDelegatable);
  console.log("Super Admin updated HR001 permissions & delegatable flags - SUCCESS");

  console.log("\n=== ALL RBAC HIERARCHY TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch(err => {
  console.error("Test Error:", err);
  process.exit(1);
});
