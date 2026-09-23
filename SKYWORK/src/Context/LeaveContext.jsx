import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_LEAVE_RECORDS,
  DEFAULT_USER_BALANCES,
  LEAVE_TYPES,
} from "../Data/leaveData";
import { getUsers } from "../Services/userService";
import {
  calculateLeaveDays,
  isDateRangeOverlapping,
  isPastDate,
  formatDateDisplay,
} from "../Utils/leaveUtils";
import api from "../Services/apiClient";

const LeaveContext = createContext();

const normalizeId = (val) => String(val || '').trim().toLowerCase().replace(/-/g, '');

const filterLeavesByActiveUsers = (records) => {
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

export function LeaveProvider({ children }) {
  // 1. Leave Requests state strictly filtered to created users
  const [leaveRecords, setLeaveRecords] = useState(() => filterLeavesByActiveUsers(INITIAL_LEAVE_RECORDS));

  // 2. User Leave Balances state
  const [userBalances, setUserBalances] = useState(() => DEFAULT_USER_BALANCES);

  // ==========================================
  // FETCH FROM BACKEND API ON MOUNT
  // ==========================================
  useEffect(() => {
    api.get("/leaves").then((json) => {
      if (json.success && Array.isArray(json.data)) {
        const apiRecords = json.data.map((r) => ({
          id: r.leaveId || r._id || r.id,
          _id: r._id,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          avatar: r.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          email: r.email || `${(r.employeeId || "").toLowerCase()}@skywork.io`,
          department: r.department || "General",
          role: r.role || "Employee",
          leaveType: r.leaveType,
          duration: r.isHalfDay ? "Half Day" : "Full Day",
          fromDate: r.startDate || r.fromDate,
          toDate: r.endDate || r.toDate,
          totalDays: r.totalDays || 1,
          halfDayType: r.halfDayType || null,
          reason: r.reason || "",
          appliedOn: r.appliedOn || r.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          status: r.status || "Pending",
          approvedBy: r.approvedBy || null,
          approvedOn: r.approvedOn || null,
          rejectionReason: r.rejectionReason || null,
          attachment: r.attachment || null,
        }));
        setLeaveRecords(apiRecords);
      }
    }).catch(() => {
      // Backend offline
    });
  }, []);

  // Keep leave records in sync with created users
  useEffect(() => {
    const handleUsersChanged = () => {
      setLeaveRecords((prev) => filterLeavesByActiveUsers(prev));
    };
    window.addEventListener("skywork_users_changed", handleUsersChanged);
    return () => {
      window.removeEventListener("skywork_users_changed", handleUsersChanged);
    };
  }, []);

  // Helper to get user balances (fallback to defaults if new employee)
  const getUserLeaveBalance = (employeeId) => {
    if (userBalances[employeeId]) {
      return userBalances[employeeId];
    }
    return {
      "Casual Leave": 8,
      "Sick Leave": 6,
      "Earned Leave": 12,
      "Emergency Leave": 3,
      Other: 2,
    };
  };

  /**
   * Apply for a new leave (Full Day or Half Day)
   */
  const applyLeave = async ({
    employeeId,
    employeeName,
    department,
    role = "Employee",
    email,
    avatar,
    leaveType,
    duration = "Full Day",
    fromDate,
    toDate,
    halfDayType = null,
    reason,
    attachment = null,
  }) => {
    // Validations
    if (!leaveType) {
      return { success: false, error: "Please select a leave type." };
    }
    if (!duration) {
      return { success: false, error: "Please select a leave duration." };
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
    const existingUserLeaves = leaveRecords.filter(
      (r) => r.employeeId === employeeId && r.status !== "Cancelled" && r.status !== "Rejected"
    );

    const hasOverlap = existingUserLeaves.some((r) =>
      isDateRangeOverlapping(fromDate, effectiveToDate, r.fromDate, r.toDate)
    );

    if (hasOverlap) {
      return {
        success: false,
        error: "You already have an active leave request covering this date range.",
      };
    }

    // Calculate total days
    const totalDays = calculateLeaveDays(fromDate, effectiveToDate, duration);
    if (totalDays <= 0) {
      return { success: false, error: "Invalid date range specified." };
    }

    // Update user balance locally
    const currentBalanceObj = getUserLeaveBalance(employeeId);
    const availableBalance = currentBalanceObj[leaveType] !== undefined ? currentBalanceObj[leaveType] : 0;
    const updatedBalanceObj = {
      ...currentBalanceObj,
      [leaveType]: Math.max(0, availableBalance - totalDays),
    };

    setUserBalances((prev) => ({
      ...prev,
      [employeeId]: updatedBalanceObj,
    }));

    // Create new record
    const todayISO = new Date().toISOString().slice(0, 10);
    const tempId = `LV-${Date.now().toString().slice(-4)}`;
    let createdRecord = {
      id: tempId,
      employeeId,
      employeeName,
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      email: email || `${employeeId.toLowerCase()}@skywork.io`,
      department,
      role,
      leaveType,
      duration,
      fromDate,
      toDate: effectiveToDate,
      totalDays,
      halfDayType: duration === "Half Day" ? halfDayType : null,
      reason: reason.trim(),
      appliedOn: todayISO,
      status: "Pending",
      approvedBy: null,
      approvedOn: null,
      rejectionReason: null,
      attachment: attachment ? (typeof attachment === "string" ? attachment : attachment.name) : null,
    };

    // Synchronously POST to backend MongoDB API
    try {
      const res = await api.post("/leaves", {
        leaveType,
        startDate: fromDate,
        endDate: effectiveToDate,
        reason: reason.trim(),
        isHalfDay: duration === "Half Day",
        halfDayType: duration === "Half Day" ? halfDayType : "",
      });

      if (res && res.success && res.data) {
        createdRecord = {
          ...createdRecord,
          id: res.data.leaveId || res.data._id || createdRecord.id,
          _id: res.data._id,
        };
      }
    } catch (err) {
      console.warn("Backend leave sync notice:", err.message);
    }

    setLeaveRecords((prev) => [createdRecord, ...prev]);

    return {
      success: true,
      message: "Leave application submitted successfully.",
      record: createdRecord,
    };
  };

  /**
   * Approve a leave request (HR or Super Admin)
   * Only Super Admin can approve HR leave requests
   */
  const approveLeave = async (leaveId, approverName = "HR Administrator", actorRole = "hr") => {
    const existingRec = leaveRecords.find((r) => r.id === leaveId || r._id === leaveId);
    if (!existingRec) {
      return { success: false, error: "Leave request not found." };
    }

    if (isHRUser(existingRec) && actorRole !== "superadmin") {
      return {
        success: false,
        error: "Access Denied: Only Super Admin is authorized to approve, reject, or update HR leave requests.",
      };
    }

    const todayISO = new Date().toISOString().slice(0, 10);
    let targetRec = null;
    let prevStatus = null;

    setLeaveRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === leaveId || rec._id === leaveId) {
          targetRec = rec;
          prevStatus = rec.status;
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

    // Sync to backend API
    const targetId = existingRec.leaveId || existingRec.id || existingRec._id || leaveId;
    try {
      await api.patch(`/leaves/${targetId}/status`, { status: "Approved" });
    } catch (err) {
      console.warn("Backend leave approve error:", err.message);
    }

    if (targetRec) {
      // If it was previously Rejected or Cancelled, re-deduct the balance
      if (prevStatus === "Rejected" || prevStatus === "Cancelled") {
        const currentBalanceObj = getUserLeaveBalance(targetRec.employeeId);
        const prevBal = currentBalanceObj[targetRec.leaveType] || 0;
        const newBal = Math.max(0, prevBal - targetRec.totalDays);

        setUserBalances((prev) => ({
          ...prev,
          [targetRec.employeeId]: {
            ...currentBalanceObj,
            [targetRec.leaveType]: newBal,
          },
        }));
      }

      return { success: true, message: "Leave request approved successfully." };
    }
    return { success: false, error: "Leave request not found." };
  };

  /**
   * Reject a leave request (HR or Super Admin)
   * Only Super Admin can reject HR leave requests
   */
  const rejectLeave = async (leaveId, rejectionReason, rejectorName = "HR Administrator", actorRole = "hr") => {
    if (!rejectionReason || rejectionReason.trim().length < 3) {
      return { success: false, error: "Please provide a reason for rejecting the leave." };
    }

    const existingRec = leaveRecords.find((r) => r.id === leaveId || r._id === leaveId);
    if (!existingRec) {
      return { success: false, error: "Leave request not found." };
    }

    if (isHRUser(existingRec) && actorRole !== "superadmin") {
      return {
        success: false,
        error: "Access Denied: Only Super Admin is authorized to approve, reject, or update HR leave requests.",
      };
    }

    const todayISO = new Date().toISOString().slice(0, 10);
    let targetRec = null;
    let prevStatus = null;

    setLeaveRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === leaveId || rec._id === leaveId) {
          targetRec = rec;
          prevStatus = rec.status;
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

    // Sync to backend API
    const targetId = existingRec.leaveId || existingRec.id || existingRec._id || leaveId;
    try {
      await api.patch(`/leaves/${targetId}/status`, {
        status: "Rejected",
        rejectionReason: rejectionReason.trim(),
      });
    } catch (err) {
      console.warn("Backend leave reject error:", err.message);
    }

    if (targetRec) {
      // If it was previously Approved (or Pending), restore user balance if not already rejected
      if (prevStatus === "Approved" || prevStatus === "Pending") {
        const currentBalanceObj = getUserLeaveBalance(targetRec.employeeId);
        const prevBal = currentBalanceObj[targetRec.leaveType] || 0;
        const restoredBal = prevBal + targetRec.totalDays;

        setUserBalances((prev) => ({
          ...prev,
          [targetRec.employeeId]: {
            ...currentBalanceObj,
            [targetRec.leaveType]: restoredBal,
          },
        }));
      }

      return { success: true, message: "Leave request rejected." };
    }

    return { success: false, error: "Leave request not found." };
  };

  /**
   * Universal status changer (HR / Super Admin)
   * Only Super Admin can change HR leave status
   */
  const updateLeaveStatus = async (leaveId, newStatus, reason = "", reviewerName = "HR Administrator", actorRole = "hr") => {
    const existingRec = leaveRecords.find((r) => r.id === leaveId || r._id === leaveId);
    if (!existingRec) {
      return { success: false, error: "Leave request not found." };
    }

    if (isHRUser(existingRec) && actorRole !== "superadmin") {
      return {
        success: false,
        error: "Access Denied: Only Super Admin is authorized to approve, reject, or update HR leave requests.",
      };
    }

    if (newStatus === "Approved") {
      return approveLeave(leaveId, reviewerName, actorRole);
    }
    if (newStatus === "Rejected") {
      return rejectLeave(leaveId, reason || "Status updated by administrator", reviewerName, actorRole);
    }

    // Reset to Pending or Cancelled
    let targetRec = null;
    let prevStatus = null;

    setLeaveRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === leaveId || rec._id === leaveId) {
          targetRec = rec;
          prevStatus = rec.status;
          return {
            ...rec,
            status: newStatus,
            rejectionReason: newStatus === "Pending" ? null : rec.rejectionReason,
            approvedBy: newStatus === "Pending" ? null : rec.approvedBy,
            approvedOn: newStatus === "Pending" ? null : rec.approvedOn,
          };
        }
        return rec;
      })
    );

    // Sync to backend
    const targetId = existingRec.leaveId || existingRec.id || existingRec._id || leaveId;
    try {
      await api.patch(`/leaves/${targetId}/status`, { status: newStatus, rejectionReason: reason });
    } catch (err) {
      console.warn("Backend leave update status error:", err.message);
    }

    if (targetRec) {
      if (newStatus === "Cancelled" && (prevStatus === "Approved" || prevStatus === "Pending")) {
        const currentBalanceObj = getUserLeaveBalance(targetRec.employeeId);
        const prevBal = currentBalanceObj[targetRec.leaveType] || 0;
        const restoredBal = prevBal + targetRec.totalDays;
        setUserBalances((prev) => ({
          ...prev,
          [targetRec.employeeId]: {
            ...currentBalanceObj,
            [targetRec.leaveType]: restoredBal,
          },
        }));
      }
      return { success: true, message: `Status updated to ${newStatus}.` };
    }

    return { success: false, error: "Leave request not found." };
  };

  /**
   * Reset leave to Pending status (HR / Super Admin action)
   */
  const resetToPending = async (leaveId, reviewerName = "HR Administrator", actorRole = "hr") => {
    const existingRec = leaveRecords.find((r) => r.id === leaveId || r._id === leaveId);
    if (!existingRec) {
      return { success: false, error: "Leave request not found." };
    }

    if (isHRUser(existingRec) && actorRole !== "superadmin") {
      return {
        success: false,
        error: "Access Denied: Only Super Admin is authorized to approve, reject, or update HR leave requests.",
      };
    }

    let targetRec = null;
    let prevStatus = null;

    setLeaveRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === leaveId || rec._id === leaveId) {
          targetRec = rec;
          prevStatus = rec.status;
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
    const targetId = existingRec.leaveId || existingRec.id || existingRec._id || leaveId;
    try {
      await api.patch(`/leaves/${targetId}/status`, { status: "Pending" });
    } catch (err) {
      console.warn("Backend leave reset status error:", err.message);
    }

    if (targetRec) {
      // If it was previously Rejected, deduct days back from user's quota (since Pending holds days)
      if (prevStatus === "Rejected" || prevStatus === "Cancelled") {
        const currentBalanceObj = getUserLeaveBalance(targetRec.employeeId);
        const prevBal = currentBalanceObj[targetRec.leaveType] || 0;
        const newBal = Math.max(0, prevBal - targetRec.totalDays);

        setUserBalances((prev) => ({
          ...prev,
          [targetRec.employeeId]: {
            ...currentBalanceObj,
            [targetRec.leaveType]: newBal,
          },
        }));
      }

      return { success: true, message: "Leave request reset to Pending status." };
    }

    return { success: false, error: "Leave request not found." };
  };

  /**
   * Cancel an eligible leave request (Pending request by user)
   */
  const cancelLeave = async (leaveId, employeeId) => {
    const existingRec = leaveRecords.find((r) => r.id === leaveId || r._id === leaveId);
    let targetRec = null;

    setLeaveRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === leaveId || rec._id === leaveId) {
          if (rec.status !== "Pending") {
            return rec; // Can only cancel pending leaves
          }
          targetRec = rec;
          return {
            ...rec,
            status: "Cancelled",
          };
        }
        return rec;
      })
    );

    // Sync to backend
    const targetId = existingRec?.leaveId || existingRec?.id || existingRec?._id || leaveId;
    try {
      await api.del(`/leaves/${targetId}`);
    } catch (err) {
      console.warn("Backend leave cancel error:", err.message);
    }

    if (targetRec) {
      // Restore deducted balance
      const currentBalanceObj = getUserLeaveBalance(targetRec.employeeId);
      const prevBal = currentBalanceObj[targetRec.leaveType] || 0;
      const restoredBal = prevBal + targetRec.totalDays;

      setUserBalances((prev) => ({
        ...prev,
        [targetRec.employeeId]: {
          ...currentBalanceObj,
          [targetRec.leaveType]: restoredBal,
        },
      }));

      return { success: true, message: "Leave request cancelled successfully." };
    }

    return { success: false, error: "Cannot cancel this leave request." };
  };

  return (
    <LeaveContext.Provider
      value={{
        leaveRecords,
        userBalances,
        getUserLeaveBalance,
        applyLeave,
        approveLeave,
        rejectLeave,
        resetToPending,
        updateLeaveStatus,
        cancelLeave,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error("useLeave must be used within a LeaveProvider");
  }
  return context;
}
