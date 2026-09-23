import React, { createContext, useContext, useState, useEffect } from "react";
import { ATTENDANCE_RECORDS } from "../Pages/HR/EmployeeAttendance/attendanceData";
import { getUsers } from "../Services/userService";
import api from "../Services/apiClient";

const AttendanceContext = createContext();

const normalizeId = (val) => String(val || '').trim().toLowerCase().replace(/-/g, '');

const filterRecordsByActiveUsers = (rawRecords) => {
  try {
    const users = getUsers();
    const validNorms = new Set(users.map(u => normalizeId(u.id || u.employeeId)));
    return (Array.isArray(rawRecords) ? rawRecords : []).filter(rec => {
      const recId = normalizeId(rec.empId || rec.employeeId);
      return validNorms.has(recId);
    });
  } catch {
    return rawRecords;
  }
};

// Utility to calculate hours, pending, and overtime between checkIn and checkOut
export function calculateAttendanceHours(checkInTimeStr, checkOutTimeStr) {
  if (!checkInTimeStr || !checkOutTimeStr || checkOutTimeStr === "--:--") {
    return {
      workedHours: "--",
      pendingHours: "9h 00m",
      overtime: "-",
      totalMinutes: 0,
    };
  }

  try {
    const parseTime = (timeStr) => {
      // Handles formats like "09:30 AM", "9:30 AM", "14:30", "09:30", "09:30:45 AM"
      const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const modifier = match[3] ? match[3].toUpperCase() : null;

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(checkInTimeStr);
    const endMinutes = parseTime(checkOutTimeStr);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return {
        workedHours: "0h 00m",
        pendingHours: "9h 00m",
        overtime: "-",
        totalMinutes: 0,
      };
    }

    const diffMinutes = endMinutes - startMinutes;
    const workedH = Math.floor(diffMinutes / 60);
    const workedM = diffMinutes % 60;
    const workedStr = `${workedH}h ${workedM < 10 ? "0" : ""}${workedM}m`;

    const standardDayMinutes = 9 * 60; // 9 hours
    let pendingStr = "0h 00m";
    let overtimeStr = "-";

    if (diffMinutes < standardDayMinutes) {
      const pendingMinutes = standardDayMinutes - diffMinutes;
      const pendH = Math.floor(pendingMinutes / 60);
      const pendM = pendingMinutes % 60;
      pendingStr = `${pendH}h ${pendM < 10 ? "0" : ""}${pendM}m`;
    } else if (diffMinutes > standardDayMinutes) {
      const otMinutes = diffMinutes - standardDayMinutes;
      const otH = Math.floor(otMinutes / 60);
      const otM = otMinutes % 60;
      overtimeStr = `${otH}h ${otM < 10 ? "0" : ""}${otM}m`;
    }

    return {
      workedHours: workedStr,
      pendingHours: pendingStr,
      overtime: overtimeStr,
      totalMinutes: diffMinutes,
    };
  } catch {
    return {
      workedHours: "--",
      pendingHours: "9h 00m",
      overtime: "-",
      totalMinutes: 0,
    };
  }
}

export function AttendanceProvider({ children }) {
  const nowObj = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const TODAY_STR = `${pad(nowObj.getDate())}-${pad(nowObj.getMonth() + 1)}-${nowObj.getFullYear()}`;
  const TODAY_RAW = `${nowObj.getFullYear()}-${pad(nowObj.getMonth() + 1)}-${pad(nowObj.getDate())}`;

  // Only real attendance records from Database
  const [records, setRecords] = useState([]);

  // ==========================================
  // FETCH FROM BACKEND API ON MOUNT
  // ==========================================
  const fetchAttendanceFromDatabase = () => {
    api.get("/attendance").then((json) => {
      if (json.success && Array.isArray(json.data)) {
        const apiRecords = json.data.map((rec) => ({
          id: rec._id || rec.id || Date.now(),
          _id: rec._id,
          empId: rec.employeeId,
          employeeId: rec.employeeId,
          name: rec.employeeName || rec.name || "",
          email: rec.email || `${(rec.employeeId || "").toLowerCase()}@skywork.io`,
          avatar: rec.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          department: rec.department || "General",
          date: rec.date || TODAY_STR,
          rawDate: rec.dateRaw || rec.rawDate || TODAY_RAW,
          checkIn: rec.checkIn || "--:--",
          checkOut: rec.checkOut || "--:--",
          workingHours: rec.workedHours || "--",
          workedHours: rec.workedHours || "--",
          pendingHours: rec.pendingHours || "9h 00m",
          overtime: rec.overtime || "-",
          late: rec.late || "No",
          isWFH: rec.isWFH ? "Yes" : "No",
          attendanceType: rec.isWFH ? "WFH" : "Office",
          status: rec.status || "Present",
          notes: rec.notes || rec.remarks || "Regular shift",
          verificationMethod: rec.verificationMethod || "manual",
        }));
        
        setRecords(apiRecords);

        // Automatically sync today's active punch state into userAttendanceMap
        const todayMap = {};
        apiRecords.forEach((rec) => {
          if ((rec.date === TODAY_STR || rec.rawDate === TODAY_RAW) && rec.empId) {
            if (rec.checkOut && rec.checkOut !== "--:--") {
              todayMap[rec.empId] = {
                status: "completed",
                recordId: rec.id,
                checkIn: rec.checkIn,
                checkOut: rec.checkOut,
                workedHours: rec.workedHours,
                pendingHours: rec.pendingHours,
                overtime: rec.overtime,
                date: rec.date,
                record: rec,
              };
            } else if (rec.checkIn && rec.checkIn !== "--:--") {
              todayMap[rec.empId] = {
                status: "checked_in",
                recordId: rec.id,
                checkIn: rec.checkIn,
                date: rec.date,
                rawDate: rec.rawDate,
                record: rec,
              };
            }
          }
        });
        if (Object.keys(todayMap).length > 0) {
          setUserAttendanceMap((prev) => ({ ...todayMap, ...prev }));
        }
      }
    }).catch(() => {
      // Backend offline
    });
  };

  useEffect(() => {
    fetchAttendanceFromDatabase();
  }, [TODAY_STR, TODAY_RAW]);

  // Keep attendance records in sync with created users
  useEffect(() => {
    const handleUsersChanged = () => {
      setRecords((prev) => filterRecordsByActiveUsers(prev));
    };
    window.addEventListener("skywork_users_changed", handleUsersChanged);
    return () => {
      window.removeEventListener("skywork_users_changed", handleUsersChanged);
    };
  }, []);

  // Track today's manual attendance for specific users
  // Keyed by employeeId (e.g. { "EMP001": { status: "checked_in", checkIn: "09:30 AM", punchInIso: "...", ... } })
  const [userAttendanceMap, setUserAttendanceMap] = useState({});

  // Check today's status for a given employeeId
  const getTodayStatus = React.useCallback((employeeId) => {
    const entry = userAttendanceMap[employeeId];
    if (!entry) return { status: "not_checked_in", record: null };
    return entry;
  }, [userAttendanceMap]);

  // 1. Mark Check-In (with duplicate check-in prevention)
  const markCheckIn = React.useCallback(({
    employeeId,
    employeeName,
    department,
    avatar,
    date = TODAY_STR,
    rawDate = TODAY_RAW,
    checkIn,
    punchInIso,
    attendanceType = "Office",
    isWFH = "No",
    status = "Present",
    notes = "",
  }) => {
    // Validation: Check if already checked in today
    const currentStatus = getTodayStatus(employeeId);
    if (currentStatus.status === "checked_in") {
      return {
        success: false,
        message: "You have already punched in today. Please punch out when your shift ends.",
      };
    }
    if (currentStatus.status === "completed") {
      return {
        success: false,
        message: "You have already completed attendance for today.",
      };
    }

    const calc = calculateAttendanceHours(checkIn, "--:--");
    const newRecordId = Date.now();
    const isoPunchIn = punchInIso || new Date().toISOString();

    const newRecord = {
      id: newRecordId,
      empId: employeeId,
      name: employeeName,
      email: `${employeeName.toLowerCase().replace(/\s+/g, ".")}@skywork.io`,
      avatar:
        avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      department,
      date,
      rawDate,
      checkIn,
      checkOut: "--:--",
      workingHours: "--",
      workedHours: "--",
      pendingHours: calc.pendingHours || "9h 00m",
      overtime: "-",
      late: checkIn > "09:30 AM" ? "Yes" : "No",
      isWFH,
      attendanceType,
      status,
      notes: notes || "Punched in",
      punchInIso: isoPunchIn,
    };

    // Prepend to all records
    setRecords((prev) => [newRecord, ...prev]);

    // Update user attendance map
    setUserAttendanceMap((prev) => ({
      ...prev,
      [employeeId]: {
        status: "checked_in",
        recordId: newRecordId,
        checkIn,
        punchInIso: isoPunchIn,
        date,
        rawDate,
        record: newRecord,
      },
    }));

    // Sync to backend API
    api.post("/attendance/check-in", {
      employeeId,
      employeeName,
      department,
      checkInTime: checkIn,
      isWFH: isWFH === "Yes",
      shiftType: "Day Shift",
      verificationMethod: "manual",
    }).then((res) => {
      if (res?.data?._id) {
        setRecords((prev) =>
          prev.map((r) => (r.id === newRecordId ? { ...r, _id: res.data._id, dbId: res.data._id } : r))
        );
      }
    }).catch((err) => {
      console.warn("Check-in API sync error:", err.message);
    });

    return {
      success: true,
      message: `Punched in successfully at ${checkIn}!`,
      record: newRecord,
    };
  }, [getTodayStatus]);

  // 2. Mark Check-Out (with validation: must be checked in first)
  const markCheckOut = React.useCallback(({
    employeeId,
    checkOut,
    punchOutIso,
    notes = "",
  }) => {
    const currentStatus = getTodayStatus(employeeId);

    // Validation: cannot check out before checking in
    if (!currentStatus || currentStatus.status === "not_checked_in") {
      return {
        success: false,
        message: "Please punch in first. You cannot punch out before punching in.",
      };
    }

    if (currentStatus.status === "completed") {
      return {
        success: false,
        message: "Today's attendance is already completed.",
      };
    }

    const recordId = currentStatus.recordId;
    const checkInTime = currentStatus.checkIn;
    const calc = calculateAttendanceHours(checkInTime, checkOut);
    const isoPunchOut = punchOutIso || new Date().toISOString();

    let updatedRecord = null;
    // Update record in list
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId || (rec.empId === employeeId && rec.date === TODAY_STR)) {
          updatedRecord = {
            ...rec,
            checkOut,
            workingHours: calc.workedHours,
            workedHours: calc.workedHours,
            pendingHours: calc.pendingHours,
            overtime: calc.overtime,
            notes: notes ? `${rec.notes} | ${notes}` : rec.notes,
            punchOutIso: isoPunchOut,
          };
          return updatedRecord;
        }
        return rec;
      })
    );

    // Update user attendance map to completed
    setUserAttendanceMap((prev) => ({
      ...prev,
      [employeeId]: {
        status: "completed",
        recordId,
        checkIn: checkInTime,
        punchInIso: currentStatus.punchInIso,
        punchOutIso: isoPunchOut,
        checkOut,
        workedHours: calc.workedHours,
        pendingHours: calc.pendingHours,
        overtime: calc.overtime,
        date: currentStatus.date,
        record: updatedRecord,
      },
    }));

    // Sync to backend API
    api.post("/attendance/check-out", {
      employeeId,
      checkOutTime: checkOut,
      notes,
    }).catch((err) => {
      console.warn("Check-out API sync error:", err.message);
    });

    return {
      success: true,
      message: `Punched out successfully at ${checkOut}! Total worked: ${calc.workedHours}`,
      record: updatedRecord,
    };
  }, [getTodayStatus]);


  // 3. Reset attendance for a user (for fresh testing)
  const resetAttendance = (employeeId) => {
    setUserAttendanceMap((prev) => {
      const next = { ...prev };
      delete next[employeeId];
      return next;
    });
    return { success: true };
  };

  return (
    <AttendanceContext.Provider
      value={{
        records,
        getTodayStatus,
        markCheckIn,
        markCheckOut,
        resetAttendance,
        todayDateStr: TODAY_STR,
        todayDateRaw: TODAY_RAW,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
}
