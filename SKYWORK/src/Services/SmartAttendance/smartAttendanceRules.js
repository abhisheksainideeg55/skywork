// ============================================================
// SKYWORK HRMS - SMART ATTENDANCE RULES & HELPERS
// ============================================================

/**
 * Calculates whether a check-in is late based on shift start and grace period
 * @param {string} checkInTimeStr - e.g. "09:45 AM" or ISO string
 * @param {string} shiftStartTimeStr - e.g. "09:00 AM" or "09:30"
 * @param {number} lateGracePeriodMins - e.g. 15
 */
export const isCheckInLate = (checkInTimeStr, shiftStartTimeStr = '09:30 AM', lateGracePeriodMins = 15) => {
  if (!checkInTimeStr) return false;

  const parseTimeMinutes = (tStr) => {
    if (!tStr) return 9 * 60 + 30; // default 09:30
    // Try ISO first
    if (tStr.includes('T')) {
      const d = new Date(tStr);
      return d.getHours() * 60 + d.getMinutes();
    }
    // Try "09:30 AM" or "14:30"
    const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 9 * 60 + 30;
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const meridiem = match[3] ? match[3].toUpperCase() : null;

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return hours * 60 + mins;
  };

  const checkInMins = parseTimeMinutes(checkInTimeStr);
  const shiftMins = parseTimeMinutes(shiftStartTimeStr);

  return checkInMins > shiftMins + lateGracePeriodMins;
};

/**
 * Calculates working hours between checkIn and checkOut
 */
export const calculateWorkingHours = (checkInIso, checkOutIso) => {
  if (!checkInIso) return '0h 0m';
  const start = new Date(checkInIso).getTime();
  const end = checkOutIso ? new Date(checkOutIso).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hrs}h ${mins}m`;
};

/**
 * Checks if working hours exceed auto checkout limit
 */
export const shouldAutoCheckoutOvertime = (checkInIso, maxHours = 12) => {
  if (!checkInIso) return false;
  const start = new Date(checkInIso).getTime();
  const diffHours = (Date.now() - start) / (1000 * 60 * 60);
  return diffHours >= maxHours;
};
