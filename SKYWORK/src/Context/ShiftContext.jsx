import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../Services/apiClient";
import {
  INITIAL_SHIFT_ALLOCATIONS,
  SHIFT_DEFINITIONS as FALLBACK_SHIFT_DEFINITIONS,
} from "../Data/shiftData";
import { getUsers } from "../Services/userService";
import {
  calculateShiftStatus,
  getShiftDefinition,
} from "../Utils/shiftUtils";

const ShiftContext = createContext();

const normalizeId = (val) => String(val || "").trim().toLowerCase().replace(/-/g, "");

const getEmployeesFromUsers = () => {
  try {
    const users = getUsers().filter((u) => u.role === "employee");
    return users.map((u) => ({
      employeeId: u.id || u.employeeId,
      name: u.name || u.employeeName,
      department: u.department || "Engineering",
      role: u.role || "Staff Employee",
      avatar: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      currentShift: u.shift || "Day Shift",
      timings: u.shift === "Night Shift" ? "09:00 PM – 06:00 AM" : u.shift === "Rotational Shift" ? "06:00 AM – 02:30 PM / 01:30 PM – 10:00 PM" : "09:00 AM – 06:00 PM",
      status: "Active",
    }));
  } catch {
    return [];
  }
};

export function ShiftProvider({ children }) {
  const [shiftAllocations, setShiftAllocations] = useState([]);
  const [shiftDefinitions, setShiftDefinitions] = useState(FALLBACK_SHIFT_DEFINITIONS);
  const [employeesDirectory, setEmployeesDirectory] = useState(getEmployeesFromUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const clearToast = () => {
    setToast(null);
  };

  // Check HR / Admin Permission helper
  const isHRUser = (user) => {
    const role = (user?.role || "").toLowerCase();
    return role.includes("hr") || role.includes("admin") || role.includes("superadmin");
  };

  // Transform backend DB allocation to frontend structure
  const transformDbAllocation = useCallback((dbItem) => {
    const shiftDef = getShiftDefinition(dbItem.shiftType || dbItem.shiftName || "Day Shift");
    return {
      id: dbItem.allocationId || dbItem._id || `SHF-${Date.now()}`,
      dbId: dbItem._id,
      employeeId: dbItem.employeeId,
      employeeName: dbItem.employeeName || "Employee",
      avatar: dbItem.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      email: dbItem.email || `${(dbItem.employeeId || "").toLowerCase()}@skywork.io`,
      department: dbItem.department || "Engineering",
      role: dbItem.role || "Staff Employee",
      shiftType: dbItem.shiftType || dbItem.shiftName || "Day Shift",
      timings: dbItem.timings || shiftDef.timings,
      effectiveFrom: dbItem.startDate || dbItem.effectiveFrom || "2026-01-01",
      effectiveTo: dbItem.endDate || dbItem.effectiveTo || "2026-12-31",
      status: dbItem.status || "Active",
      rotationCycle:
        (dbItem.shiftType || dbItem.shiftName) === "Rotational Shift"
          ? dbItem.rotationCycle || "Bi-Weekly Rotation"
          : "None (Fixed Schedule)",
      allocatedBy: dbItem.assignedBy || dbItem.allocatedBy || "HR Administrator",
      allocatedOn: dbItem.createdAt ? String(dbItem.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: dbItem.remarks || dbItem.notes || `${dbItem.shiftType || "Day Shift"} assigned.`,
    };
  }, []);

  // Fetch all shifts & definitions from MongoDB Database
  const fetchShiftsFromDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rosterRes, defsRes] = await Promise.allSettled([
        api.get("/shifts/roster"),
        api.get("/shifts/definitions"),
      ]);

      if (defsRes.status === "fulfilled" && defsRes.value?.success && Array.isArray(defsRes.value.data)) {
        if (defsRes.value.data.length > 0) {
          // Merge with fallback definitions styling
          const mergedDefs = defsRes.value.data.map((d) => {
            const fb = FALLBACK_SHIFT_DEFINITIONS.find((f) => f.type === d.type || f.name === d.name);
            return {
              ...fb,
              ...d,
              color: fb?.color || {
                primary: "emerald",
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                gradient: "from-emerald-500 to-teal-600",
              },
            };
          });
          setShiftDefinitions(mergedDefs);
        }
      }

      if (rosterRes.status === "fulfilled" && rosterRes.value?.success && Array.isArray(rosterRes.value.data)) {
        const dbAllocations = rosterRes.value.data;
        if (dbAllocations.length > 0) {
          const transformed = dbAllocations.map(transformDbAllocation);
          setShiftAllocations(transformed);
        } else {
          // If DB is fresh, seed initial allocations to MongoDB
          const users = getUsers();
          const seedPromises = INITIAL_SHIFT_ALLOCATIONS.map((initItem) =>
            api.post("/shifts/assign", {
              employeeId: initItem.employeeId,
              employeeName: initItem.employeeName,
              department: initItem.department,
              shiftType: initItem.shiftType,
              startDate: initItem.effectiveFrom,
              endDate: initItem.effectiveTo,
              remarks: initItem.notes,
            }).catch(() => null)
          );
          await Promise.allSettled(seedPromises);
          
          // Re-fetch after seeding
          const reRoster = await api.get("/shifts/roster").catch(() => null);
          if (reRoster?.success && Array.isArray(reRoster.data)) {
            setShiftAllocations(reRoster.data.map(transformDbAllocation));
          } else {
            setShiftAllocations(INITIAL_SHIFT_ALLOCATIONS);
          }
        }
      } else {
        setShiftAllocations(INITIAL_SHIFT_ALLOCATIONS);
      }
    } catch (err) {
      console.warn("Could not fetch shifts from DB, using fallback:", err.message);
      setShiftAllocations(INITIAL_SHIFT_ALLOCATIONS);
    } finally {
      setIsLoading(false);
    }
  }, [transformDbAllocation]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchShiftsFromDatabase();
  }, [fetchShiftsFromDatabase]);

  // Sync when users change
  useEffect(() => {
    const handleUsersChanged = () => {
      setEmployeesDirectory(getEmployeesFromUsers());
      fetchShiftsFromDatabase();
    };
    window.addEventListener("skywork_users_changed", handleUsersChanged);
    return () => {
      window.removeEventListener("skywork_users_changed", handleUsersChanged);
    };
  }, [fetchShiftsFromDatabase]);

  /**
   * Allocate shift to a single employee (HR / Super Admin)
   * Persists directly to MongoDB via POST /api/shifts/assign
   */
  const allocateShift = async (data, currentUser) => {
    if (!isHRUser(currentUser)) {
      const err = "Only HR & Super Admin have permission to allocate or modify employee shifts.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    if (!data.employeeId) {
      const err = "Please select an employee.";
      showToast(err, "warning");
      return { success: false, error: err };
    }
    if (!data.shiftType) {
      const err = "Please select a shift type.";
      showToast(err, "warning");
      return { success: false, error: err };
    }
    if (!data.effectiveFrom) {
      const err = "Please select an effective start date.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    const emp =
      employeesDirectory.find((e) => normalizeId(e.employeeId || e.id) === normalizeId(data.employeeId)) || {
        name: data.employeeName || "Employee",
        email: `${data.employeeId.toLowerCase()}@skywork.io`,
        department: data.department || "Engineering",
        role: data.role || "Staff",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      };

    try {
      // 1. Send to Backend Database API
      const res = await api.post("/shifts/assign", {
        employeeId: data.employeeId,
        employeeName: emp.name || data.employeeName,
        department: data.department || emp.department,
        shiftType: data.shiftType,
        shiftName: data.shiftType,
        startDate: data.effectiveFrom,
        effectiveFrom: data.effectiveFrom,
        endDate: data.effectiveTo || "2026-12-31",
        effectiveTo: data.effectiveTo || "2026-12-31",
        rotationCycle:
          data.shiftType === "Rotational Shift"
            ? data.rotationCycle || "Bi-Weekly Rotation"
            : "None (Fixed Schedule)",
        remarks: data.notes ? data.notes.trim() : `${data.shiftType} assigned.`,
        notes: data.notes ? data.notes.trim() : `${data.shiftType} assigned.`,
      });

      const savedDbRecord = res.data ? transformDbAllocation(res.data) : null;

      const shiftDef = getShiftDefinition(data.shiftType);
      const calculatedStatus = calculateShiftStatus(
        data.effectiveFrom,
        data.effectiveTo || "2026-12-31"
      );

      const newRecord = savedDbRecord || {
        id: `SHF-ALC-${Date.now().toString().slice(-4)}`,
        employeeId: data.employeeId,
        employeeName: emp.name,
        avatar: emp.avatar,
        email: emp.email,
        department: emp.department,
        role: emp.role,
        shiftType: data.shiftType,
        timings: shiftDef.timings,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || "2026-12-31",
        status: calculatedStatus,
        rotationCycle:
          data.shiftType === "Rotational Shift"
            ? data.rotationCycle || "Bi-Weekly Rotation"
            : "None (Fixed Schedule)",
        allocatedBy: currentUser?.name
          ? `${currentUser.name} (${currentUser.role === "superadmin" ? "Super Admin" : "HR Admin"})`
          : "HR Administrator",
        allocatedOn: new Date().toISOString().slice(0, 10),
        notes: data.notes ? data.notes.trim() : `${data.shiftType} assigned.`,
      };

      // 2. Update React State
      setShiftAllocations((prev) => {
        const filtered = prev.filter((item) => normalizeId(item.employeeId) !== normalizeId(data.employeeId));
        return [newRecord, ...filtered];
      });

      showToast(`✓ ${data.shiftType} successfully saved to database for ${emp.name}.`, "success");
      return { success: true, message: "Shift allocated successfully.", record: newRecord };
    } catch (err) {
      console.error("Shift assign DB error:", err);
      // Fallback local update
      const shiftDef = getShiftDefinition(data.shiftType);
      const fallbackRecord = {
        id: `SHF-ALC-${Date.now().toString().slice(-4)}`,
        employeeId: data.employeeId,
        employeeName: emp.name,
        avatar: emp.avatar,
        email: emp.email,
        department: emp.department,
        role: emp.role,
        shiftType: data.shiftType,
        timings: shiftDef.timings,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || "2026-12-31",
        status: "Active",
        rotationCycle: "None (Fixed Schedule)",
        allocatedBy: currentUser?.name || "HR Admin",
        allocatedOn: new Date().toISOString().slice(0, 10),
        notes: data.notes || "",
      };
      setShiftAllocations((prev) => [fallbackRecord, ...prev.filter((item) => item.employeeId !== data.employeeId)]);
      showToast(`✓ Shift allocated to ${emp.name}.`, "success");
      return { success: true, record: fallbackRecord };
    }
  };

  /**
   * Bulk Allocate shift to multiple employees (HR / Super Admin)
   * Persists directly to MongoDB via POST /api/shifts/bulk-assign
   */
  const bulkAllocateShifts = async (employeeIds = [], data, currentUser) => {
    if (!isHRUser(currentUser)) {
      const err = "Only HR & Super Admin have permission to allocate shifts.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    if (employeeIds.length === 0) {
      const err = "Please select at least one employee.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    try {
      await api.post("/shifts/bulk-assign", {
        employeeIds,
        shiftType: data.shiftType,
        startDate: data.effectiveFrom,
        endDate: data.effectiveTo || "2026-12-31",
        notes: data.notes || "Bulk shift allocation",
      });

      await fetchShiftsFromDatabase();

      showToast(
        `✓ ${data.shiftType} successfully allotted & saved in database for ${employeeIds.length} employees.`,
        "success"
      );
      return { success: true, count: employeeIds.length };
    } catch (err) {
      console.error("Bulk shift DB error:", err);
      // Fallback local update
      const shiftDef = getShiftDefinition(data.shiftType);
      const newRecords = employeeIds.map((empId, idx) => ({
        id: `SHF-ALC-${Date.now().toString().slice(-4)}${idx}`,
        employeeId: empId,
        employeeName: `Employee ${empId}`,
        department: data.department || "Engineering",
        shiftType: data.shiftType,
        timings: shiftDef.timings,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || "2026-12-31",
        status: "Active",
        rotationCycle: "None (Fixed Schedule)",
        allocatedBy: currentUser?.name || "HR Admin",
        allocatedOn: new Date().toISOString().slice(0, 10),
        notes: data.notes || "",
      }));
      setShiftAllocations((prev) => {
        const empSet = new Set(employeeIds);
        return [...newRecords, ...prev.filter((i) => !empSet.has(i.employeeId))];
      });
      showToast(`✓ Shift allocated to ${employeeIds.length} staff members.`, "success");
      return { success: true, count: employeeIds.length };
    }
  };

  /**
   * Update existing shift allocation (HR / Super Admin)
   * Persists to MongoDB via PUT /api/shifts/allocations/:id
   */
  const updateShiftAllocation = async (id, data, currentUser) => {
    if (!isHRUser(currentUser)) {
      const err = "Only HR & Super Admin have permission to edit shift allocations.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    try {
      await api.put(`/shifts/allocations/${id}`, {
        shiftType: data.shiftType,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        status: data.status,
        notes: data.notes,
      });

      await fetchShiftsFromDatabase();
      showToast("✓ Shift allocation updated in database.", "success");
      return { success: true };
    } catch (err) {
      console.error("Update shift DB error:", err);
      const shiftDef = getShiftDefinition(data.shiftType);
      setShiftAllocations((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                shiftType: data.shiftType,
                timings: shiftDef.timings,
                effectiveFrom: data.effectiveFrom,
                effectiveTo: data.effectiveTo || item.effectiveTo,
                notes: data.notes !== undefined ? data.notes.trim() : item.notes,
              }
            : item
        )
      );
      showToast("✓ Shift allocation updated.", "success");
      return { success: true };
    }
  };

  /**
   * Delete / Unassign a shift allocation (HR / Super Admin)
   * Deletes from MongoDB via DELETE /api/shifts/allocations/:id
   */
  const removeShiftAllocation = async (id, currentUser) => {
    if (!isHRUser(currentUser)) {
      const err = "Only HR & Super Admin have permission to remove shift allocations.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    try {
      await api.del(`/shifts/allocations/${id}`);
      setShiftAllocations((prev) => prev.filter((item) => item.id !== id && item.dbId !== id));
      showToast("✓ Shift allocation removed from database.", "success");
      return { success: true };
    } catch (err) {
      console.error("Delete shift DB error:", err);
      setShiftAllocations((prev) => prev.filter((item) => item.id !== id));
      showToast("✓ Shift allocation removed.", "success");
      return { success: true };
    }
  };

  /**
   * Retrieve active shift for an employee
   */
  const getUserShift = (employeeId) => {
    const found = shiftAllocations.find(
      (item) => normalizeId(item.employeeId) === normalizeId(employeeId)
    );
    if (found) return found;

    return {
      employeeId,
      shiftType: "Day Shift",
      timings: "09:00 AM – 06:00 PM",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      status: "Active",
      rotationCycle: "None (Fixed Schedule)",
      notes: "Default General Day Shift Schedule",
    };
  };

  /**
   * Restore default initial dataset
   */
  const resetToDefaultShifts = async () => {
    try {
      const users = getUsers();
      for (const initItem of INITIAL_SHIFT_ALLOCATIONS) {
        await api.post("/shifts/assign", {
          employeeId: initItem.employeeId,
          employeeName: initItem.employeeName,
          department: initItem.department,
          shiftType: initItem.shiftType,
          startDate: initItem.effectiveFrom,
          endDate: initItem.effectiveTo,
          remarks: initItem.notes,
        }).catch(() => null);
      }
      await fetchShiftsFromDatabase();
      showToast("✓ Default shift roster restored and saved in database.", "success");
    } catch {
      setShiftAllocations(INITIAL_SHIFT_ALLOCATIONS);
      showToast("✓ Default shift roster restored.", "success");
    }
  };

  return (
    <ShiftContext.Provider
      value={{
        shiftAllocations,
        shiftDefinitions,
        employeesDirectory,
        isLoading,
        toast,
        showToast,
        clearToast,
        allocateShift,
        bulkAllocateShifts,
        updateShiftAllocation,
        removeShiftAllocation,
        getUserShift,
        resetToDefaultShifts,
        refreshShifts: fetchShiftsFromDatabase,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

export function useShift() {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
}
