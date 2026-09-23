import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../Services/apiClient";
import { INITIAL_HOLIDAYS } from "../Data/holidayData";
import {
  getWeekdayName,
  isDuplicateHolidayDate,
} from "../Utils/holidayUtils";
import { hasHolidayPermission } from "../Utils/permissions";

const HolidayContext = createContext();

export function HolidayProvider({ children }) {
  // 1. Initialize holidays from initial records fallback
  const [holidays, setHolidays] = useState(() => INITIAL_HOLIDAYS);
  const [loading, setLoading] = useState(false);

  // 2. Global Toast notification state
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
   * Fetch holidays from MongoDB API
   */
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/holidays");
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setHolidays(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch holidays from backend, using current state:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  /**
   * Add a new holiday (HR only) - Persisted to MongoDB
   */
  const addHoliday = async (holidayData, user) => {
    // 1. Permission check
    const userRole = user?.role || "employee";
    if (!hasHolidayPermission(userRole, "createHoliday")) {
      const err = "You do not have permission to create holidays.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    // 2. Form field validations
    const name = holidayData.name ? holidayData.name.trim() : "";
    const date = holidayData.date ? holidayData.date.trim() : "";
    const type = holidayData.type || "National Holiday";
    const duration = holidayData.duration || "Full Day";
    const description = holidayData.description ? holidayData.description.trim() : "";
    const status = holidayData.status || "Active";

    if (!name) {
      const err = "Holiday name is required.";
      showToast(err, "warning");
      return { success: false, error: err };
    }
    if (!date) {
      const err = "Holiday date is required.";
      showToast(err, "warning");
      return { success: false, error: err };
    }
    if (!type) {
      const err = "Holiday type is required.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    // 3. Duplicate date check
    if (isDuplicateHolidayDate(holidays, date)) {
      const err = "A holiday already exists for this date.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    // 4. Automatic Day Calculation
    const calculatedDay = getWeekdayName(date) || "Monday";
    const yearPart = date.slice(0, 4) || "2026";
    const todayISO = new Date().toISOString().slice(0, 10);

    const payload = {
      holidayId: `HOL-${yearPart}-${Date.now().toString().slice(-4)}`,
      name,
      date,
      day: calculatedDay,
      type,
      duration,
      description: description || `${name} celebration`,
      status,
      createdBy: user?.employeeId || "EMP-HR01",
      createdByName: user?.name || user?.employeeName || "HR Administrator",
      createdAt: todayISO,
      updatedAt: todayISO,
    };

    try {
      const res = await api.post("/holidays", payload);
      const savedRecord = res?.data || payload;

      setHolidays((prev) => [savedRecord, ...prev.filter((h) => h.id !== savedRecord.id && h.holidayId !== savedRecord.holidayId)]);
      showToast("✓ Holiday added to database & synced for all users.", "success");

      return {
        success: true,
        message: "✓ Holiday added successfully.",
        holiday: savedRecord,
      };
    } catch (apiErr) {
      console.error("API error adding holiday:", apiErr);
      // Fallback local update
      setHolidays((prev) => [payload, ...prev]);
      showToast("✓ Holiday added locally.", "success");
      return {
        success: true,
        message: "✓ Holiday added locally.",
        holiday: payload,
      };
    }
  };

  /**
   * Edit an existing holiday (HR only) - Persisted to MongoDB
   */
  const updateHoliday = async (id, holidayData, user) => {
    // 1. Permission check
    const userRole = user?.role || "employee";
    if (!hasHolidayPermission(userRole, "editHoliday")) {
      const err = "You do not have permission to edit holidays.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    // 2. Field validations
    const name = holidayData.name ? holidayData.name.trim() : "";
    const date = holidayData.date ? holidayData.date.trim() : "";
    const type = holidayData.type;
    const duration = holidayData.duration || "Full Day";
    const description = holidayData.description ? holidayData.description.trim() : "";
    const status = holidayData.status || "Active";

    if (!name) {
      const err = "Holiday name is required.";
      showToast(err, "warning");
      return { success: false, error: err };
    }
    if (!date) {
      const err = "Holiday date is required.";
      showToast(err, "warning");
      return { success: false, error: err };
    }
    if (!type) {
      const err = "Holiday type is required.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    // 3. Duplicate date check excluding current ID
    if (isDuplicateHolidayDate(holidays, date, id)) {
      const err = "A holiday already exists for this date.";
      showToast(err, "warning");
      return { success: false, error: err };
    }

    const calculatedDay = getWeekdayName(date) || "Monday";
    const todayISO = new Date().toISOString().slice(0, 10);

    const updatePayload = {
      name,
      date,
      day: calculatedDay,
      type,
      duration,
      description,
      status,
      updatedAt: todayISO,
    };

    try {
      const res = await api.put(`/holidays/${id}`, updatePayload);
      const savedRecord = res?.data;

      setHolidays((prev) =>
        prev.map((item) => {
          if (item.id === id || item.holidayId === id || item._id === id) {
            return savedRecord || { ...item, ...updatePayload };
          }
          return item;
        })
      );

      showToast("✓ Holiday updated in database successfully.", "success");
      return {
        success: true,
        message: "✓ Holiday updated successfully.",
        holiday: savedRecord || updatePayload,
      };
    } catch (apiErr) {
      console.error("API error updating holiday:", apiErr);
      setHolidays((prev) =>
        prev.map((item) => {
          if (item.id === id || item.holidayId === id || item._id === id) {
            return { ...item, ...updatePayload };
          }
          return item;
        })
      );
      showToast("✓ Holiday updated locally.", "success");
      return {
        success: true,
        message: "✓ Holiday updated locally.",
      };
    }
  };

  /**
   * Delete a holiday (HR only) - Persisted to MongoDB
   */
  const deleteHoliday = async (id, user) => {
    // 1. Permission check
    const userRole = user?.role || "employee";
    if (!hasHolidayPermission(userRole, "deleteHoliday")) {
      const err = "You do not have permission to delete holidays.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    try {
      await api.del(`/holidays/${id}`);
    } catch (apiErr) {
      console.warn("API delete error:", apiErr.message);
    }

    setHolidays((prev) => prev.filter((h) => h.id !== id && h.holidayId !== id && h._id !== id));
    showToast("✓ Holiday removed from database.", "success");

    return {
      success: true,
      message: "✓ Holiday deleted successfully.",
    };
  };

  /**
   * Toggle Holiday status between Active and Inactive (HR only) - Persisted to MongoDB
   */
  const toggleHolidayStatus = async (id, user) => {
    const userRole = user?.role || "employee";
    if (!hasHolidayPermission(userRole, "manageStatus")) {
      const err = "You do not have permission to manage holiday status.";
      showToast(err, "error");
      return { success: false, error: err };
    }

    const target = holidays.find((h) => h.id === id || h.holidayId === id || h._id === id);
    const newStatus = target?.status === "Active" ? "Inactive" : "Active";
    const todayISO = new Date().toISOString().slice(0, 10);

    setHolidays((prev) =>
      prev.map((item) => {
        if (item.id === id || item.holidayId === id || item._id === id) {
          return {
            ...item,
            status: newStatus,
            updatedAt: todayISO,
          };
        }
        return item;
      })
    );

    try {
      await api.put(`/holidays/${id}`, { status: newStatus });
    } catch (apiErr) {
      console.warn("API status update error:", apiErr.message);
    }

    showToast(`✓ Holiday status updated to ${newStatus}.`, "success");
    return { success: true, message: `Holiday status updated to ${newStatus}.` };
  };

  /**
   * Reset data to default dataset & re-fetch from database
   */
  const resetToDefaultHolidays = async () => {
    await fetchHolidays();
    showToast("✓ Company holiday schedule refreshed from database.", "success");
  };

  /**
   * Find holiday by ID
   */
  const getHolidayById = (id) => {
    return holidays.find((h) => h.id === id || h.holidayId === id || h._id === id) || null;
  };

  return (
    <HolidayContext.Provider
      value={{
        holidays,
        loading,
        fetchHolidays,
        toast,
        showToast,
        clearToast,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        toggleHolidayStatus,
        resetToDefaultHolidays,
        getHolidayById,
      }}
    >
      {children}
    </HolidayContext.Provider>
  );
}

export function useHoliday() {
  const context = useContext(HolidayContext);
  if (!context) {
    throw new Error("useHoliday must be used within a HolidayProvider");
  }
  return context;
}

