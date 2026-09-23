/**
 * Leave Management Utility Functions
 */

/**
 * Calculates total leave days between fromDate and toDate.
 * If duration is Half Day, returns 0.5.
 * @param {string} fromDate - Format "YYYY-MM-DD"
 * @param {string} toDate - Format "YYYY-MM-DD"
 * @param {string} duration - "Full Day" | "Half Day"
 * @returns {number} totalDays
 */
export function calculateLeaveDays(fromDate, toDate, duration = "Full Day") {
  if (duration === "Half Day") {
    return 0.5;
  }

  if (!fromDate || !toDate) return 0;

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return 0;
  }

  // Calculate difference in days (inclusive)
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}

/**
 * Formats a Date object or "YYYY-MM-DD" string to "DD-MM-YYYY"
 * @param {string|Date} dateStr
 * @returns {string} "DD-MM-YYYY"
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) return "--";
  try {
    if (typeof dateStr === "string" && dateStr.includes("-") && dateStr.length === 10) {
      // If already DD-MM-YYYY
      if (dateStr.indexOf("-") === 2) return dateStr;
      const [y, m, d] = dateStr.split("-");
      return `${d}-${m}-${y}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Checks if two date ranges overlap
 * @param {string} start1 - YYYY-MM-DD
 * @param {string} end1 - YYYY-MM-DD
 * @param {string} start2 - YYYY-MM-DD
 * @param {string} end2 - YYYY-MM-DD
 * @returns {boolean}
 */
export function isDateRangeOverlapping(start1, end1, start2, end2) {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  return s1 <= e2 && s2 <= e1;
}

/**
 * Checks if a date is in the past (before today 00:00:00)
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {boolean}
 */
export function isPastDate(dateStr) {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return target < today;
}
