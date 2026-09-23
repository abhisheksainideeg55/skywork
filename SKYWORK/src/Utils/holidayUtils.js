/**
 * Holiday Management Utilities
 */

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Automatically calculates the weekday name from a date string (YYYY-MM-DD)
 * @param {string|Date} dateInput
 * @returns {string} e.g. "Monday"
 */
export function getWeekdayName(dateInput) {
  if (!dateInput) return "";
  try {
    let d;
    if (typeof dateInput === "string") {
      // Avoid timezone shift by splitting YYYY-MM-DD
      const parts = dateInput.split("-");
      if (parts.length === 3) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        d = new Date(dateInput);
      }
    } else {
      d = new Date(dateInput);
    }

    if (isNaN(d.getTime())) return "";
    return WEEKDAYS[d.getDay()];
  } catch {
    return "";
  }
}

/**
 * Formats "YYYY-MM-DD" to standard display format "DD-MM-YYYY" or "DD MMM YYYY"
 * @param {string|Date} dateStr
 * @param {boolean} shortMonth
 * @returns {string} e.g. "26-01-2026" or "26 Jan 2026"
 */
export function formatDateDisplay(dateStr, shortMonth = false) {
  if (!dateStr) return "--";
  try {
    if (typeof dateStr === "string" && dateStr.includes("-") && dateStr.length === 10) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parts[2];
        if (shortMonth && MONTH_NAMES[monthIndex]) {
          return `${day} ${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`;
        }
        return `${day}-${parts[1]}-${year}`;
      }
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    if (shortMonth) {
      return `${day} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${year}`;
    }
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats date to full legible string (e.g., "08 November 2026")
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDateFull(dateStr) {
  if (!dateStr) return "--";
  try {
    if (typeof dateStr === "string" && dateStr.includes("-") && dateStr.length === 10) {
      const [year, month, day] = dateStr.split("-");
      const mIdx = parseInt(month, 10) - 1;
      if (MONTH_NAMES[mIdx]) {
        return `${day} ${MONTH_NAMES[mIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    return `${day} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * Generates sorted unique list of years from holiday records
 * @param {Array} holidays
 * @returns {Array<string>} e.g. ["2026", "2027", "2028"]
 */
export function getYearList(holidays = []) {
  const years = new Set();
  // Ensure current year is always represented
  const currentYear = new Date().getFullYear().toString();
  years.add(currentYear);
  years.add("2026");
  years.add("2027");
  years.add("2028");

  holidays.forEach((h) => {
    if (h.date && h.date.length >= 4) {
      years.add(h.date.slice(0, 4));
    }
  });

  return Array.from(years).sort();
}

/**
 * Duplicate holiday date validation
 * Checks if a holiday already exists on the given date
 * @param {Array} holidays
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string|null} excludeId - ID of holiday being edited (if any)
 * @returns {boolean} true if duplicate exists
 */
export function isDuplicateHolidayDate(holidays = [], dateStr, excludeId = null) {
  if (!dateStr) return false;
  return holidays.some(
    (h) => h.date === dateStr && (!excludeId || h.id !== excludeId)
  );
}

/**
 * Computes countdown in days until the specified holiday date
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {number} positive for future, 0 for today, negative for past
 */
export function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Retrieves upcoming active holidays sorted chronologically from today onward
 * @param {Array} holidays
 * @param {number} limit
 * @returns {Array}
 */
export function getUpcomingHolidays(holidays = [], limit = 4) {
  const todayISO = new Date().toISOString().slice(0, 10);
  return holidays
    .filter((h) => h.status === "Active" && h.date >= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

/**
 * Styling helpers for holiday types
 */
export function getHolidayTypeColor(type) {
  switch (type) {
    case "National Holiday":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
        pill: "bg-amber-100 text-amber-800",
      };
    case "Festival Holiday":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        dot: "bg-purple-500",
        pill: "bg-purple-100 text-purple-800",
      };
    case "Company Holiday":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        dot: "bg-indigo-500",
        pill: "bg-indigo-100 text-indigo-800",
      };
    case "Optional Holiday":
      return {
        bg: "bg-teal-50",
        text: "text-teal-700",
        border: "border-teal-200",
        dot: "bg-teal-500",
        pill: "bg-teal-100 text-teal-800",
      };
    case "Other":
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        dot: "bg-slate-500",
        pill: "bg-slate-100 text-slate-800",
      };
  }
}
