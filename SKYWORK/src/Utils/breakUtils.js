/**
 * Break Management Utility Functions
 */

/**
 * Format 24-hr "HH:MM" into "hh:mm A"
 * @param {string} timeStr - e.g. "13:00" or "09:30"
 * @returns {string} e.g. "01:00 PM"
 */
export function formatTime12Hr(timeStr) {
  if (!timeStr) return "--:--";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

/**
 * Calculate difference in minutes between two HH:MM strings on the same day
 * @param {string} start - e.g. "13:00"
 * @param {string} end - e.g. "13:45"
 * @returns {number}
 */
export function calculateMinutesDiff(start, end) {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);

  let total1 = h1 * 60 + m1;
  let total2 = h2 * 60 + m2;

  // If spans overnight (e.g. 23:30 to 00:30)
  if (total2 < total1) {
    total2 += 24 * 60;
  }

  return Math.max(0, total2 - total1);
}

/**
 * Format seconds into mm:ss or hh:mm:ss for live timers
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTimerSeconds(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Returns color tokens for break types
 * @param {string} breakType
 * @returns {object}
 */
export function getBreakTypeColor(breakType) {
  switch (breakType) {
    case "Lunch Break":
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        dot: "bg-amber-500",
        pill: "bg-amber-100 text-amber-900",
        icon: "🍽️",
      };
    case "Dinner Break":
      return {
        bg: "bg-purple-50",
        text: "text-purple-800",
        border: "border-purple-200",
        dot: "bg-purple-500",
        pill: "bg-purple-100 text-purple-900",
        icon: "🌙",
      };
    case "Morning Tea Break":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
        pill: "bg-emerald-100 text-emerald-900",
        icon: "☕",
      };
    case "Evening Tea Break":
      return {
        bg: "bg-sky-50",
        text: "text-sky-800",
        border: "border-sky-200",
        dot: "bg-sky-500",
        pill: "bg-sky-100 text-sky-900",
        icon: "🍵",
      };
    case "Midnight Refreshment":
      return {
        bg: "bg-fuchsia-50",
        text: "text-fuchsia-800",
        border: "border-fuchsia-200",
        dot: "bg-fuchsia-500",
        pill: "bg-fuchsia-100 text-fuchsia-900",
        icon: "🥪",
      };
    case "Rotational Evening Break":
      return {
        bg: "bg-teal-50",
        text: "text-teal-800",
        border: "border-teal-200",
        dot: "bg-teal-500",
        pill: "bg-teal-100 text-teal-900",
        icon: "🔄",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-800",
        border: "border-slate-200",
        dot: "bg-slate-500",
        pill: "bg-slate-100 text-slate-900",
        icon: "⚡",
      };
  }
}
