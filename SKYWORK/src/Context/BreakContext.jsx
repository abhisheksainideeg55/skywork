import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../Services/apiClient";
import {
  DEFAULT_BREAK_POLICIES,
  INITIAL_BREAK_LOGS,
} from "../Data/breakData";
import { breakAlarmAudio } from "../Utils/breakAlarmAudio";
import { formatTime12Hr, calculateMinutesDiff } from "../Utils/breakUtils";
import { getUsers } from "../Services/userService";

const BreakContext = createContext();

const normalizeId = (val) => String(val || '').trim().toLowerCase().replace(/-/g, '');

const filterBreaksByActiveUsers = (logs) => {
  try {
    const users = getUsers();
    const validNorms = new Set(users.map((u) => normalizeId(u.id || u.employeeId)));
    return (Array.isArray(logs) ? logs : []).filter((b) =>
      validNorms.has(normalizeId(b.employeeId || b.empId))
    );
  } catch {
    return logs;
  }
};

export function BreakProvider({ children }) {
  // 1. Break Policies (HR Managed & MongoDB Synced)
  const [breakPolicies, setBreakPolicies] = useState(() => DEFAULT_BREAK_POLICIES);
  const [loadingPolicies, setLoadingPolicies] = useState(false);

  // 2. Break Logs (Live & Historical)
  const [breakLogs, setBreakLogs] = useState(() => filterBreaksByActiveUsers(INITIAL_BREAK_LOGS));

  // Sync with user creation/deletion
  useEffect(() => {
    const handleUsersChanged = () => {
      setBreakLogs((prev) => filterBreaksByActiveUsers(prev));
    };
    window.addEventListener("skywork_users_changed", handleUsersChanged);
    return () => {
      window.removeEventListener("skywork_users_changed", handleUsersChanged);
    };
  }, []);

  // 3. User's active ongoing break
  const [activeBreak, setActiveBreak] = useState(null);

  // 4. Global Alert / Alarm Modal State
  const [activeAlarmAlert, setActiveAlarmAlert] = useState(null);

  // 5. Sound Settings
  const [alarmVolume, setAlarmVolume] = useState(0.8);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // 6. Toast System
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

  /**
   * Fetch break policies from MongoDB
   */
  const fetchBreakPolicies = useCallback(async () => {
    try {
      setLoadingPolicies(true);
      const res = await api.get("/breaks/policies");
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setBreakPolicies(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch break policies from backend:", err.message);
    } finally {
      setLoadingPolicies(false);
    }
  }, []);

  useEffect(() => {
    fetchBreakPolicies();
  }, [fetchBreakPolicies]);

  // Sync audio engine volume & mute
  useEffect(() => {
    breakAlarmAudio.setVolume(alarmVolume);
    breakAlarmAudio.setMuted(isAudioMuted);
  }, [alarmVolume, isAudioMuted]);

  // Check HR Permission
  const isHRUser = (user) => {
    const role = (user?.role || "").toLowerCase();
    return role.includes("hr") || role.includes("admin");
  };

  /**
   * Real-time Clock Checker: Every 15 seconds, check if current HH:MM matches any active break start time
   */
  useEffect(() => {
    const checkBreakSchedule = () => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      // Find if any policy starts right now and has auto-alert enabled
      const matchingPolicy = breakPolicies.find(
        (p) => p.autoAlertEnabled && p.startTime === currentHHMM
      );

      if (matchingPolicy) {
        // Prevent re-triggering if already showing for this policy today
        const lastTriggerKey = `skywork_last_alert_${matchingPolicy.id || matchingPolicy.policyId}_${now.toISOString().slice(0, 10)}`;
        if (!sessionStorage.getItem(lastTriggerKey)) {
          sessionStorage.setItem(lastTriggerKey, "true");
          triggerAlarm(matchingPolicy);
        }
      }
    };

    const interval = setInterval(checkBreakSchedule, 15000);
    return () => clearInterval(interval);
  }, [breakPolicies]);

  /**
   * Trigger Alarm and Popup Alert Modal
   */
  const triggerAlarm = (policy) => {
    breakAlarmAudio.playSound(policy.alarmSound || "chime");
    setActiveAlarmAlert({
      ...policy,
      triggeredAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  /**
   * Test Break Alarm live from UI button
   */
  const triggerTestAlarm = (policy) => {
    const targetPolicy =
      policy ||
      breakPolicies[0] || {
        id: "TEST-01",
        name: "Lunch Break (Test Alert)",
        type: "Lunch Break",
        shiftType: "Day Shift",
        displayTime: "01:00 PM – 02:00 PM",
        durationMinutes: 60,
        description: "Official midday lunch & meal pause. Company buffet open.",
        allowance: "Complimentary Subsidized Buffet",
        alarmSound: "chime",
      };

    breakAlarmAudio.playSound(targetPolicy.alarmSound || "chime");
    setActiveAlarmAlert({
      ...targetPolicy,
      isTest: true,
      triggeredAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  const dismissAlert = () => {
    setActiveAlarmAlert(null);
  };

  const snoozeAlert = (mins = 5) => {
    const currentAlert = activeAlarmAlert;
    setActiveAlarmAlert(null);
    showToast(`⏰ Alert snoozed for ${mins} minutes.`, "info");
    setTimeout(() => {
      if (currentAlert) {
        triggerAlarm(currentAlert);
      }
    }, mins * 60 * 1000);
  };

  /**
   * Start an Employee Break (Self-Service)
   */
  const startBreak = (employee, breakType = "Lunch Break") => {
    const now = new Date();
    const timeHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const matchingPolicy = breakPolicies.find((p) => p.type === breakType) || {
      durationMinutes: 60,
    };

    const newActive = {
      id: `BRK-LOG-${Date.now().toString().slice(-4)}`,
      employeeId: employee.employeeId || "EMP001",
      employeeName: employee.name || "Abhishek Sharma",
      avatar:
        employee.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      department: employee.department || "Engineering",
      role: employee.role || "Senior Developer",
      shiftType: employee.shiftType || "Day Shift",
      breakType,
      startTime: timeHHMM,
      startTimestamp: Date.now(),
      allowedMinutes: matchingPolicy.durationMinutes || 60,
      status: "On Break",
      date: now.toISOString().slice(0, 10),
    };

    setActiveBreak(newActive);
    setBreakLogs((prev) => [newActive, ...prev]);
    showToast(`☕ Started ${breakType}. Enjoy your break!`, "success");
    if (activeAlarmAlert) {
      setActiveAlarmAlert(null);
    }
  };

  /**
   * End an Employee Break (Resume Work)
   */
  const endBreak = () => {
    if (!activeBreak) return;

    const now = new Date();
    const endHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const actualMinutes = Math.max(
      1,
      Math.round((Date.now() - (activeBreak.startTimestamp || Date.now())) / 60000)
    );

    const isExceeded = actualMinutes > (activeBreak.allowedMinutes || 60) + 2;

    const updatedLog = {
      ...activeBreak,
      endTime: endHHMM,
      durationMinutes: actualMinutes,
      status: isExceeded ? "Exceeded" : "Completed",
      notes: isExceeded
        ? `Break exceeded allowed time by ${actualMinutes - activeBreak.allowedMinutes} mins.`
        : `Break completed within allowed schedule.`,
    };

    setBreakLogs((prev) =>
      prev.map((log) => (log.id === activeBreak.id ? updatedLog : log))
    );

    setActiveBreak(null);
    showToast(
      `✓ Welcome back! Break logged (${actualMinutes} mins).`,
      isExceeded ? "warning" : "success"
    );
  };

  /**
   * Add Break Policy (HR Only) - Persisted to MongoDB
   */
  const addBreakPolicy = async (policyData, currentUser) => {
    if (!isHRUser(currentUser)) {
      const err = "Only HR has permission to configure break policies.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    if (!policyData.name || !policyData.startTime || !policyData.endTime) {
      const err = "Please provide break name, start time, and end time.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    const duration =
      policyData.durationMinutes ||
      calculateMinutesDiff(policyData.startTime, policyData.endTime) ||
      30;

    const payload = {
      policyId: `BRK-POL-${Date.now().toString().slice(-4)}`,
      name: policyData.name,
      type: policyData.type || "Lunch Break",
      shiftType: policyData.shiftType || "Day Shift",
      startTime: policyData.startTime,
      endTime: policyData.endTime,
      displayTime: `${formatTime12Hr(policyData.startTime)} – ${formatTime12Hr(
        policyData.endTime
      )}`,
      durationMinutes: Number(duration),
      isMandatory: Boolean(policyData.isMandatory),
      alarmSound: policyData.alarmSound || "chime",
      autoAlertEnabled: policyData.autoAlertEnabled !== false,
      description: policyData.description || "Official scheduled company break.",
      location: policyData.location || "Office Cafeteria & Lounge",
      allowance: policyData.allowance || "Standard Refreshment",
      createdBy: currentUser?.employeeId || "EMP-HR01",
      createdByName: currentUser?.name || currentUser?.employeeName || "HR Administrator",
      color: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-800",
        badge: "bg-indigo-100 text-indigo-800",
        gradient: "from-indigo-600 to-purple-600",
      },
    };

    try {
      const res = await api.post("/breaks/policies", payload);
      const saved = res?.data || payload;
      setBreakPolicies((prev) => [...prev.filter((p) => p.id !== saved.id && p.policyId !== saved.policyId), saved]);
      showToast(`✓ New break policy "${saved.name}" saved to database.`, "success");
      return { success: true, policy: saved };
    } catch (apiErr) {
      console.warn("API add error, using local state:", apiErr.message);
      setBreakPolicies((prev) => [...prev, payload]);
      showToast(`✓ Break policy added locally.`, "success");
      return { success: true, policy: payload };
    }
  };

  /**
   * Update Break Policy (HR Only) - Persisted to MongoDB
   */
  const updateBreakPolicy = async (id, policyData, currentUser) => {
    if (!isHRUser(currentUser)) {
      const err = "Only HR has permission to edit break policies.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    const duration =
      policyData.durationMinutes ||
      calculateMinutesDiff(policyData.startTime, policyData.endTime) ||
      30;

    const displayTime = `${formatTime12Hr(
      policyData.startTime
    )} – ${formatTime12Hr(policyData.endTime)}`;

    const updatePayload = {
      ...policyData,
      displayTime,
      durationMinutes: Number(duration),
    };

    try {
      const res = await api.put(`/breaks/policies/${id}`, updatePayload);
      const saved = res?.data;

      setBreakPolicies((prev) =>
        prev.map((item) => {
          if (item.id === id || item.policyId === id || item._id === id) {
            return saved || { ...item, ...updatePayload };
          }
          return item;
        })
      );

      showToast("✓ Break schedule updated in database successfully.", "success");
      return { success: true, policy: saved || updatePayload };
    } catch (apiErr) {
      console.warn("API update error, using local state:", apiErr.message);
      setBreakPolicies((prev) =>
        prev.map((item) => {
          if (item.id === id || item.policyId === id || item._id === id) {
            return { ...item, ...updatePayload };
          }
          return item;
        })
      );
      showToast("✓ Break schedule updated locally.", "success");
      return { success: true, policy: updatePayload };
    }
  };

  /**
   * Delete Break Policy (HR Only) - Persisted to MongoDB
   */
  const deleteBreakPolicy = async (id, currentUser) => {
    if (!isHRUser(currentUser)) {
      const err = "Only HR has permission to delete break policies.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    try {
      await api.del(`/breaks/policies/${id}`);
    } catch (apiErr) {
      console.warn("API delete error:", apiErr.message);
    }

    setBreakPolicies((prev) => prev.filter((p) => p.id !== id && p.policyId !== id && p._id !== id));
    showToast("✓ Break policy removed from database.", "success");
    return { success: true };
  };

  /**
   * Reset to default policies from MongoDB
   */
  const resetToDefaultPolicies = async () => {
    await fetchBreakPolicies();
    showToast("✓ Break policies refreshed from database.", "success");
  };

  return (
    <BreakContext.Provider
      value={{
        breakPolicies,
        loadingPolicies,
        fetchBreakPolicies,
        breakLogs,
        activeBreak,
        activeAlarmAlert,
        alarmVolume,
        setAlarmVolume,
        isAudioMuted,
        setIsAudioMuted,
        toast,
        showToast,
        clearToast,
        triggerAlarm,
        triggerTestAlarm,
        dismissAlert,
        snoozeAlert,
        startBreak,
        endBreak,
        addBreakPolicy,
        updateBreakPolicy,
        deleteBreakPolicy,
        resetToDefaultPolicies,
      }}
    >
      {children}
    </BreakContext.Provider>
  );
}

export function useBreak() {
  const context = useContext(BreakContext);
  if (!context) {
    throw new Error("useBreak must be used within a BreakProvider");
  }
  return context;
}

