/**
 * Shift Management Utility Functions
 */
import { SHIFT_DEFINITIONS } from "../Data/shiftData";

/**
 * Returns complete definition for a shift type
 * @param {string} shiftType
 * @returns {object}
 */
export function getShiftDefinition(shiftType) {
  return (
    SHIFT_DEFINITIONS.find((s) => s.type === shiftType) ||
    SHIFT_DEFINITIONS[0]
  );
}

/**
 * Returns formatted shift timings
 * @param {string} shiftType
 * @returns {string} e.g. "09:00 AM – 06:00 PM"
 */
export function getShiftTiming(shiftType) {
  const def = getShiftDefinition(shiftType);
  return def.timings;
}

/**
 * Formats YYYY-MM-DD to DD-MM-YYYY or DD MMM YYYY
 * @param {string} dateStr
 * @param {boolean} short
 * @returns {string}
 */
export function formatDateDisplay(dateStr, short = false) {
  if (!dateStr) return "--";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (short) {
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const mIdx = parseInt(month, 10) - 1;
        return `${day} ${monthNames[mIdx] || month} ${year}`;
      }
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Checks whether an allocation is currently active
 * @param {string} fromDate - YYYY-MM-DD
 * @param {string} toDate - YYYY-MM-DD
 * @returns {"Active" | "Upcoming" | "Completed"}
 */
export function calculateShiftStatus(fromDate, toDate) {
  const todayISO = new Date().toISOString().slice(0, 10);
  if (fromDate && fromDate > todayISO) {
    return "Upcoming";
  }
  if (toDate && toDate < todayISO) {
    return "Completed";
  }
  return "Active";
}

/**
 * Returns color classes and icons for shift badges
 * @param {string} shiftType
 * @returns {object}
 */
export function getShiftColorToken(shiftType) {
  switch (shiftType) {
    case "Day Shift":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
        pill: "bg-amber-100/90 text-amber-800",
        iconText: "☀️ Day Shift",
      };
    case "Night Shift":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        dot: "bg-purple-500",
        pill: "bg-purple-100/90 text-purple-800",
        iconText: "🌙 Night Shift",
      };
    case "Rotational Shift":
      return {
        bg: "bg-teal-50",
        text: "text-teal-700",
        border: "border-teal-200",
        dot: "bg-teal-500",
        pill: "bg-teal-100/90 text-teal-800",
        iconText: "🔄 Rotational Shift",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        dot: "bg-slate-500",
        pill: "bg-slate-100 text-slate-800",
        iconText: shiftType,
      };
  }
}
