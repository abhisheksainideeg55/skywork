import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_WFH_RECORDS, DEFAULT_USER_WFH_ALLOWANCE } from "../Data/wfhData";
import { getUsers } from "../Services/userService";
import {
  calculateWFHDays,
  isDateRangeOverlapping,
  formatDateDisplay,
} from "../Utils/wfhUtils";
import api from "../Services/apiClient";

const WFHContext = createContext();

const normalizeId = (val) => String(val || '').trim().toLowerCase().replace(/-/g, '');

const filterWFHByActiveUsers = (records) => {
  try {
    const users = getUsers();
    const validNorms = new Set(users.map((u) => normalizeId(u.id || u.employeeId)));
    return (Array.isArray(records) ? records : []).filter((r) =>
      validNorms.has(normalizeId(r.employeeId || r.empId))
    );
  } catch {
    return records;
  }
};

export const isHRUser = (rec) => {
  if (!rec) return false;
  const role = (rec.role || "").toLowerCase();
  const dept = (rec.department || "").toLowerCase();
  const empId = (rec.employeeId || "").toUpperCase();
  const email = (rec.email || "").toLowerCase();

  return (
    role.includes("hr") ||
    role.includes("human resources") ||
    empId.startsWith("HR") ||
    dept === "human resources" ||
    dept === "hr" ||
    email.includes("hr@") ||
    email.includes("juli@")
  );
};

export function WFHProvider({ children }) {
  // 1. WFH Requests state strictly filtered to created users
  const [wfhRecords, setWfhRecords] = useState(() => filterWFHByActiveUsers(INITIAL_WFH_RECORDS));

  // ==========================================
  // FETCH FROM BACKEND API ON MOUNT
  // ==========================================
  useEffect(() => {
    api.get("/wfh").then((json) => {
      if (json.success && Array.isArray(json.data)) {
        const apiRecords = json.data.map((r) => ({
          id: r.wfhId || r._id || r.id,
          _id: r._id,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          avatar: r.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          email: r.email || `${(r.employeeId || "").toLowerCase()}@skywork.io`,
          department: r.department || "General",
          role: r.role || "Employee",
          wfhType: r.wfhType || "Regular Remote Work",
          duration: r.duration || "Full Day",
          fromDate: r.startDate || r.fromDate,
          toDate: r.endDate || r.toDate,
          totalDays: r.totalDays || 1,
          halfDayType: r.halfDayType || null,
          reason: r.reason || "",
          deliverables: r.workPlan || r.deliverables || "",
          contactNumber: r.contactNumber || "",
          appliedOn: r.appliedOn || r.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          status: r.status || "Pending",
          approvedBy: r.approvedBy || null,
          approvedOn: r.approvedOn || null,
          rejectionReason: r.rejectionReason || null,
        }));
        setWfhRecords(apiRecords);
      }
    }).catch(() => {
      // Backend offline
    });
  }, []);

  // Keep WFH records in sync with created users
  useEffect(() => {
    const handleUsersChanged = () => {
      setWfhRecords((prev) => filterWFHByActiveUsers(prev));
    };
    window.addEventListener("skywork_users_changed", handleUsersChanged);
    return () => {
      window.removeEventListener("skywork_users_changed", handleUsersChanged);
    };
  }, []);

  /**
   * Apply for Work From Home (Employee / Manager / HR)
   */
  const applyWFH = async ({
    employeeId,
    employeeName,
    department,
    role = "Employee",
    email,
    avatar,
    wfhType = "Regular Remote Work",
    duration = "Full Day",
    fromDate,
    toDate,
    halfDayType = null,
    reason,
    deliverables = "",
    contactNumber = "",
  }) => {
    // Validations
    if (!wfhType) {
      return { success: false, error: "Please select a WFH type / category." };
    }
    if (!duration) {
      return { success: false, error: "Please select a duration." };
    }
    if (!fromDate) {
      return { success: false, error: "Please select a start date." };
    }
    if (duration === "Full Day" && !toDate) {
      return { success: false, error: "Please select an end date." };
    }
    if (duration === "Half Day" && !halfDayType) {
      return { success: false, error: "Please specify First Half or Second Half." };
    }
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: "Please provide a valid reason (minimum 5 characters)." };
    }

    const effectiveToDate = duration === "Half Day" ? fromDate : toDate;

    // Date range validation
    if (new Date(effectiveToDate) < new Date(fromDate)) {
      return { success: false, error: "End date cannot be before start date." };
    }

    // Overlapping date validation for the same user
    const existingUserWFH = wfhRecords.filter(
      (r) => r.employeeId === employeeId && r.status !== "Cancelled" && r.status !== "Rejected"
    );

    const hasOverlap = existingUserWFH.some((r) =>
      isDateRangeOverlapping(fromDate, effectiveToDate, r.fromDate, r.toDate)
    );

    if (hasOverlap) {
      return {
        success: false,
        error: "You already have an active WFH request covering this date range.",
      };
    }

    // Calculate total days
    const totalDays = calculateWFHDays(fromDate, effectiveToDate, duration);
    if (totalDays <= 0) {
      return { success: false, error: "Invalid date range specified." };
    }

    // Create new record
    const todayISO = new Date().toISOString().slice(0, 10);
    const tempId = `WFH-${Date.now().toString().slice(-4)}`;
    let createdRecord = {
      id: tempId,
      employeeId,
      employeeName,
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      email: email || `${employeeId.toLowerCase()}@skywork.io`,
      department,
      role,
      wfhType,
      duration,
      fromDate,
      toDate: effectiveToDate,
      totalDays,
      halfDayType: duration === "Half Day" ? halfDayType : null,
      reason: reason.trim(),
      deliverables: deliverables ? deliverables.trim() : "",
      contactNumber: contactNumber ? contactNumber.trim() : "",
      appliedOn: todayISO,
      status: "Pending",
      approvedBy: null,
      approvedOn: null,
      rejectionReason: null,
    };

    // Synchronously POST to backend MongoDB API
    try {
      const res = await api.post("/wfh", {
        startDate: fromDate,
        endDate: effectiveToDate,
        reason: reason.trim(),
        workPlan: deliverables ? deliverables.trim() : "",
        contactNumber: contactNumber ? contactNumber.trim() : "",
        wfhType,
        duration,
        isHalfDay: duration === "Half Day",
        halfDayType: duration === "Half Day" ? halfDayType : "",
      });

      if (res && res.success && res.data) {
        createdRecord = {
          ...createdRecord,
          id: res.data.wfhId || res.data._id || createdRecord.id,
          _id: res.data._id,
        };
      }
    } catch (err) {
      console.warn("Backend WFH sync notice:", err.message);
    }

    setWfhRecords((prev) => [createdRecord, ...prev]);

    return {
      success: true,
      message: "Work From Home request submitted successfully.",
      record: createdRecord,
    };
  };

  /**
   * Approve a WFH request (HR or Super Admin)
   * Only Super Admin can approve HR WFH requests
   */
  const approveWFH = async (wfhId, approverName = "HR Administrator", actorRole = "hr") => {
    const existingRec = wfhRecords.find((r) => r.id === wfhId || r._id === wfhId);
    if (!existingRec) {
      return { success: false, error: "WFH request not found." };
    }

    if (isHRUser(existingRec) && actorRole !== "superadmin") {
      return {
        success: false,
        error: "Access Denied: Only Super Admin is authorized to approve, reject, or update HR WFH requests.",
      };
    }

    const todayISO = new Date().toISOString().slice(0, 10);
    let found = false;

    setWfhRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === wfhId || rec._id === wfhId) {
          found = true;
          return {
            ...rec,
            status: "Approved",
            approvedBy: approverName,
            approvedOn: todayISO,
            rejectionReason: null,
          };
        }
        return rec;
      })
    );

    // Sync to backend
    const targetId = existingRec.wfhId || existingRec.id || existingRec._id || wfhId;
    try {
      await api.patch(`/wfh/${targetId}/status`, { status: "Approved" });
    } catch (err) {
      console.warn("Backend WFH approve error:", err.message);
    }

    if (found) {
      return { success: true, message: "WFH request approved successfully." };
    }
    return { success: false, error: "WFH request not found." };
  };

  /**
   * Reject a WFH request (HR or Super Admin)
   * Only Super Admin can reject HR WFH requests
   */
  const rejectWFH = async (wfhId, rejectionReason, rejectorName = "HR Administrator", actorRole = "hr") => {
    if (!rejectionReason || rejectionReason.trim().length < 3) {
      return { success: false, error: "Please provide a reason for rejecting the WFH request." };
    }

    const existingRec = wfhRecords.find((r) => r.id === wfhId || r._id === wfhId);
    if (!existingRec) {
      return { success: false, error: "WFH request not found." };
    }

    if (isHRUser(existingRec) && actorRole !== "superadmin") {
      return {
        success: false,
        error: "Access Denied: Only Super Admin is authorized to approve, reject, or update HR WFH requests.",
      };
    }

    const todayISO = new Date().toISOString().slice(0, 10);
    let found = false;

    setWfhRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === wfhId || rec._id === wfhId) {
          found = true;
          return {
            ...rec,
            status: "Rejected",
            rejectionReason: rejectionReason.trim(),
            approvedBy: rejectorName,
            approvedOn: todayISO,
          };
        }
        return rec;
      })
    );

    // Sync to backend
    const targetId = existingRec.wfhId || existingRec.id || existingRec._id || wfhId;
    try {
      await api.patch(`/wfh/${targetId}/status`, {
        status: "Rejected",
        rejectionReason: rejectionReason.trim(),
      });
    } catch (err) {
      console.warn("Backend WFH reject error:", err.message);
    }

    if (found) {
      return { success: true, message: "WFH request rejected." };
    }
    return { success: false, error: "WFH request not found." };
  };

  /**
   * Reset WFH to Pending status (HR / Super Admin action)
   */
  const resetWFHToPending = async (wfhId, actorRole = "hr") => {
    const existingRec = wfhRecords.find((r) => r.id === wfhId || r._id === wfhId);
    if (!existingRec) {
      return { success: false, error: "WFH request not found." };
    }

    if (isHRUser(existingRec) && actorRole !== "superadmin") {
      return {
        success: false,
        error: "Access Denied: Only Super Admin is authorized to approve, reject, or update HR WFH requests.",
      };
    }

    let found = false;

    setWfhRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === wfhId || rec._id === wfhId) {
          found = true;
          return {
            ...rec,
            status: "Pending",
            approvedBy: null,
            approvedOn: null,
            rejectionReason: null,
          };
        }
        return rec;
      })
    );

    // Sync to backend
    const targetId = existingRec.wfhId || existingRec.id || existingRec._id || wfhId;
    try {
      await api.patch(`/wfh/${targetId}/status`, { status: "Pending" });
    } catch (err) {
      console.warn("Backend WFH reset status error:", err.message);
    }

    if (found) {
      return { success: true, message: "WFH request reset to Pending status." };
    }
    return { success: false, error: "WFH request not found." };
  };

  /**
   * Universal status changer (HR / Super Admin)
   */
  const updateWFHStatus = async (wfhId, newStatus, reason = "", reviewerName = "HR Administrator", actorRole = "hr") => {
    const existingRec = wfhRecords.find((r) => r.id === wfhId || r._id === wfhId);
    if (!existingRec) {
      return { success: false, error: "WFH request not found." };
    }

    if (isHRUser(existingRec) && actorRole !== "superadmin") {
      return {
        success: false,
        error: "Access Denied: Only Super Admin is authorized to approve, reject, or update HR WFH requests.",
      };
    }

    if (newStatus === "Approved") {
      return approveWFH(wfhId, reviewerName, actorRole);
    }
    if (newStatus === "Rejected") {
      return rejectWFH(wfhId, reason || "Status updated by administrator", reviewerName, actorRole);
    }
    if (newStatus === "Pending") {
      return resetWFHToPending(wfhId, actorRole);
    }

    let found = false;
    setWfhRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === wfhId || rec._id === wfhId) {
          found = true;
          return {
            ...rec,
            status: newStatus,
          };
        }
        return rec;
      })
    );

    // Sync to backend
    const targetId = existingRec.wfhId || existingRec.id || existingRec._id || wfhId;
    try {
      await api.patch(`/wfh/${targetId}/status`, { status: newStatus, rejectionReason: reason });
    } catch (err) {
      console.warn("Backend WFH status update error:", err.message);
    }

    if (found) {
      return { success: true, message: `Status updated to ${newStatus}.` };
    }
    return { success: false, error: "WFH request not found." };
  };

  /**
   * Cancel an eligible WFH request (Pending request by user)
   */
  const cancelWFH = async (wfhId, employeeId) => {
    const existingRec = wfhRecords.find((r) => r.id === wfhId || r._id === wfhId);
    let found = false;

    setWfhRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === wfhId || rec._id === wfhId) {
          if (rec.status !== "Pending") {
            return rec;
          }
          found = true;
          return {
            ...rec,
            status: "Cancelled",
          };
        }
        return rec;
      })
    );

    // Sync to backend
    const targetId = existingRec?.wfhId || existingRec?.id || existingRec?._id || wfhId;
    try {
      await api.del(`/wfh/${targetId}`);
    } catch (err) {
      console.warn("Backend WFH cancel error:", err.message);
    }

    if (found) {
      return { success: true, message: "WFH request cancelled successfully." };
    }
    return { success: false, error: "Cannot cancel this WFH request." };
  };

  return (
    <WFHContext.Provider
      value={{
        wfhRecords,
        applyWFH,
        approveWFH,
        rejectWFH,
        resetWFHToPending,
        updateWFHStatus,
        cancelWFH,
      }}
    >
      {children}
    </WFHContext.Provider>
  );
}

export function useWFH() {
  const context = useContext(WFHContext);
  if (!context) {
    throw new Error("useWFH must be used within a WFHProvider");
  }
  return context;
}
