/**
 * Attendance calculation engine
 * Mirrors frontend AttendanceContext logic server-side
 */

/**
 * Calculate worked hours, pending hours, and overtime between check-in and check-out times
 * @param {string} checkInTimeStr - e.g. "09:30 AM" or "09:30"
 * @param {string} checkOutTimeStr - e.g. "06:30 PM" or "18:30"
 * @returns {{ workedHours: string, pendingHours: string, overtime: string, totalMinutes: number }}
 */
export const calculateAttendanceHours = (checkInTimeStr, checkOutTimeStr) => {
  if (!checkInTimeStr || !checkOutTimeStr || checkOutTimeStr === '--:--') {
    return {
      workedHours: '--',
      pendingHours: '9h 00m',
      overtime: '-',
      totalMinutes: 0,
    };
  }

  try {
    const parseTime = (timeStr) => {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const modifier = match[3] ? match[3].toUpperCase() : null;

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(checkInTimeStr);
    const endMinutes = parseTime(checkOutTimeStr);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return {
        workedHours: '0h 00m',
        pendingHours: '9h 00m',
        overtime: '-',
        totalMinutes: 0,
      };
    }

    const diffMinutes = endMinutes - startMinutes;
    const workedH = Math.floor(diffMinutes / 60);
    const workedM = diffMinutes % 60;
    const workedStr = `${workedH}h ${workedM < 10 ? '0' : ''}${workedM}m`;

    const standardDayMinutes = 9 * 60;
    let pendingStr = '0h 00m';
    let overtimeStr = '-';

    if (diffMinutes < standardDayMinutes) {
      const pendingMinutes = standardDayMinutes - diffMinutes;
      const pendH = Math.floor(pendingMinutes / 60);
      const pendM = pendingMinutes % 60;
      pendingStr = `${pendH}h ${pendM < 10 ? '0' : ''}${pendM}m`;
    } else if (diffMinutes > standardDayMinutes) {
      const otMinutes = diffMinutes - standardDayMinutes;
      const otH = Math.floor(otMinutes / 60);
      const otM = otMinutes % 60;
      overtimeStr = `${otH}h ${otM < 10 ? '0' : ''}${otM}m`;
    }

    return {
      workedHours: workedStr,
      pendingHours: pendingStr,
      overtime: overtimeStr,
      totalMinutes: diffMinutes,
    };
  } catch {
    return {
      workedHours: '--',
      pendingHours: '9h 00m',
      overtime: '-',
      totalMinutes: 0,
    };
  }
};

/**
 * Get current time formatted as "HH:MM AM/PM"
 */
export const getCurrentTimeFormatted = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Get today's date in DD-MM-YYYY format
 */
export const getTodayFormatted = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayRaw = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};
