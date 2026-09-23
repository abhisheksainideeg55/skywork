/**
 * Calculate total working / calendar days between two dates for WFH
 * @param {string} fromDate - 'YYYY-MM-DD'
 * @param {string} toDate - 'YYYY-MM-DD'
 * @param {string} duration - 'Full Day' | 'Half Day'
 * @returns {number} total days
 */
export function calculateWFHDays(fromDate, toDate, duration = "Full Day") {
  if (!fromDate) return 0;
  if (duration === "Half Day") return 0.5;
  if (!toDate) return 1;

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end < start) return 0;

  // Calculate day difference inclusive
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Format 'YYYY-MM-DD' string to readable 'DD MMM YYYY'
 * @param {string} dateString
 * @returns {string}
 */
export function formatDateDisplay(dateString) {
  if (!dateString) return "-";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, monthIndex, day);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }
  return dateString;
}

/**
 * Check if two date ranges overlap
 */
export function isDateRangeOverlapping(start1, end1, start2, end2) {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1 || start1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2 || start2).getTime();

  return s1 <= e2 && s2 <= e1;
}

/**
 * Check if date is in past
 */
export function isPastDate(dateString) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  return target < today;
}
