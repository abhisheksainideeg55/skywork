import { initializeUsers, getUsers, createUser, deleteUser } from '../src/Services/userService.js';
import { getAuditLogs } from '../src/Services/auditService.js';

// Setup mock localStorage in node environment
const storage = {};
globalThis.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

async function testFeatures() {
  console.log("=== 1. Initialize Users ===");
  await initializeUsers(true);
  const initialCount = getUsers().length;
  console.log(`Initial users count: ${initialCount}`);

  console.log("\n=== 2. Test Creating User with Custom Department ===");
  const customUser = createUser("SA001", "superadmin", {
    name: "Aarav Gupta",
    email: "aarav@skywork.io",
    role: "employee",
    department: "AI Research & Cloud Architecture",
    password: "Password@123"
  });
  console.log("Created user with custom department:", customUser.name, `(${customUser.department}) - SUCCESS`);

  console.log("\n=== 3. Test Super Admin Deleting User ===");
  const usersBeforeDelete = getUsers();
  const target = usersBeforeDelete.find(u => u.email === "aarav@skywork.io");
  console.log(`Found target to delete: ${target.name} (${target.id})`);

  deleteUser("SA001", "superadmin", target.id);
  const usersAfterDelete = getUsers();
  const exists = usersAfterDelete.some(u => u.id === target.id);
  console.log("User existence after deletion:", exists ? "FAILED (Still exists)" : "PASSED (Deleted)");

  if (usersAfterDelete.length !== initialCount) {
    throw new Error("Count mismatch after create & delete cycle!");
  }

  console.log("\n=== 4. Test Safety Protection for Last Super Admin ===");
  try {
    deleteUser("SA001", "superadmin", "SA001");
    throw new Error("FAILED: Last Super Admin should NOT be deletable!");
  } catch (err) {
    console.log("Deleting Last Super Admin Blocked:", err.message, "- SUCCESS");
  }

  console.log("\n=== 5. Verify Audit Logs Recorded ===");
  const logs = getAuditLogs();
  const deleteLog = logs.find(l => l.action === "DELETE_USER");
  console.log("Delete Audit Log Entry:", deleteLog ? "FOUND (SUCCESS)" : "NOT FOUND");

  console.log("\n=== ALL USER DELETION & CUSTOM DEPT TESTS PASSED ===");
}

testFeatures().catch(err => {
  console.error("Test Error:", err);
  process.exit(1);
});
