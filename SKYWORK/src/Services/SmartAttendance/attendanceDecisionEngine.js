// ============================================================
// SKYWORK HRMS - ATTENDANCE DECISION ENGINE
// Evaluates multi-factor presence (GPS + Wi-Fi) with grace periods
// ============================================================
import {
  DECISION_OUTCOMES,
  LOCATION_STATUSES,
  WIFI_STATUSES,
} from '../../Data/smartAttendanceData.js';

/**
 * Evaluates whether auto punch-in or punch-out should occur
 * @param {Object} params
 * @param {Object} params.locationResult - Result from geofenceService
 * @param {Object} params.wifiResult - Result from wifiService
 * @param {Object} params.currentAttendance - Today's attendance record (if any)
 * @param {Object} params.config - Smart attendance config
 * @param {number|null} params.outsideSince - Timestamp (ms) when user first left geofence
 * @param {number|null} params.insideSince - Timestamp (ms) when user first entered geofence
 * @returns {Object} { outcome, reason, method, details }
 */
export const evaluateAttendanceDecision = ({
  locationResult = {},
  wifiResult = {},
  currentAttendance = null,
  config = {},
  outsideSince = null,
  insideSince = null,
}) => {
  if (!config.enabled) {
    return {
      outcome: DECISION_OUTCOMES.WAIT_FOR_VERIFICATION,
      reason: 'Smart Attendance is disabled.',
      canPunchManually: true,
    };
  }

  const isCheckedIn = !!(currentAttendance && currentAttendance.checkIn && !currentAttendance.checkOut);
  const isCheckedOut = !!(currentAttendance && currentAttendance.checkOut);

  // 1. If already checked out for today
  if (isCheckedOut) {
    return {
      outcome: DECISION_OUTCOMES.ALREADY_CHECKED_OUT,
      reason: 'Shift completed for today.',
      canPunchManually: false,
    };
  }

  const geofenceVerified = config.geofencingEnabled && locationResult.inside === true;
  const wifiVerified = config.wifiEnabled && wifiResult.verified === true;

  // Verification satisfied check
  const isVerified = config.requireBothVerifications
    ? geofenceVerified && wifiVerified
    : geofenceVerified || wifiVerified;

  const verificationMethod = geofenceVerified && wifiVerified
    ? 'both'
    : geofenceVerified
    ? 'geofence'
    : wifiVerified
    ? 'wifi'
    : 'none';

  // 2. Currently Checked In -> Evaluate Auto Punch-Out
  if (isCheckedIn) {
    if (!config.autoPunchOut) {
      return {
        outcome: DECISION_OUTCOMES.ALREADY_CHECKED_IN,
        reason: 'Currently checked in. Auto punch-out is disabled.',
        canPunchManually: true,
      };
    }

    const isOutsideGeofence = config.geofencingEnabled && locationResult.status === LOCATION_STATUSES.OUTSIDE;
    const isWifiDisconnected = config.wifiEnabled && !wifiResult.verified;

    const shouldTriggerExit = config.requireBothVerifications
      ? isOutsideGeofence || isWifiDisconnected
      : isOutsideGeofence && isWifiDisconnected;

    if (shouldTriggerExit) {
      const exitGraceMins = config.exitGracePeriodMins != null ? Number(config.exitGracePeriodMins) : 0;
      const exitGraceMs = exitGraceMins * 60 * 1000;
      const elapsedOutsideMs = outsideSince ? Date.now() - outsideSince : 0;

      if (exitGraceMs === 0 || (outsideSince && elapsedOutsideMs >= exitGraceMs)) {
        return {
          outcome: DECISION_OUTCOMES.AUTO_PUNCH_OUT,
          reason: exitGraceMs === 0 
            ? 'Outside office perimeter & disconnected from Wi-Fi. Auto punch-out triggered.'
            : `Outside premises for over ${exitGraceMins} minutes. Auto punch-out triggered.`,
          verificationMethod,
          canPunchManually: true,
        };
      } else {
        const remainingSec = Math.max(0, Math.round((exitGraceMs - elapsedOutsideMs) / 1000));
        return {
          outcome: DECISION_OUTCOMES.WAIT_FOR_VERIFICATION,
          reason: `Exit grace period active (${Math.ceil(remainingSec / 60)} min remaining).`,
          gracePeriodActive: true,
          remainingSeconds: remainingSec,
          canPunchManually: true,
        };
      }
    }

    return {
      outcome: DECISION_OUTCOMES.ALREADY_CHECKED_IN,
      reason: 'Active attendance verified within office perimeter / Wi-Fi.',
      canPunchManually: true,
    };
  }

  // 3. Not Checked In -> Evaluate Auto Punch-In
  if (!isCheckedIn && !isCheckedOut) {
    if (!config.autoPunchIn) {
      return {
        outcome: DECISION_OUTCOMES.WAIT_FOR_VERIFICATION,
        reason: 'Auto punch-in is disabled in settings. Please check in manually.',
        canPunchManually: true,
      };
    }

    if (isVerified) {
      // Entry grace period check
      const entryGraceMins = config.entryGracePeriodMins != null ? Number(config.entryGracePeriodMins) : 0;
      const entryGraceMs = entryGraceMins * 60 * 1000;
      const elapsedInsideMs = insideSince ? Date.now() - insideSince : 0;

      if (entryGraceMs > 0 && insideSince && elapsedInsideMs < entryGraceMs) {
        const remainingSec = Math.max(0, Math.round((entryGraceMs - elapsedInsideMs) / 1000));
        return {
          outcome: DECISION_OUTCOMES.WAIT_FOR_VERIFICATION,
          reason: `Entry stabilization in progress (${remainingSec}s remaining).`,
          gracePeriodActive: true,
          remainingSeconds: remainingSec,
          canPunchManually: true,
        };
      }

      return {
        outcome: DECISION_OUTCOMES.AUTO_PUNCH_IN,
        reason: `Presence verified via ${verificationMethod === 'both' ? 'GPS & Wi-Fi' : verificationMethod}. Auto punch-in triggered.`,
        verificationMethod,
        canPunchManually: false,
      };
    }


    // If both location and wifi are completely unavailable
    const locationDead = locationResult.status === LOCATION_STATUSES.LOCATION_UNAVAILABLE;
    const wifiDead = wifiResult.status === WIFI_STATUSES.WIFI_UNAVAILABLE;
    if (locationDead && wifiDead) {
      return {
        outcome: DECISION_OUTCOMES.MANUAL_REQUIRED,
        reason: 'Location and Wi-Fi services unavailable. Manual punch required.',
        canPunchManually: true,
      };
    }

    // Location unreliable
    if (locationResult.status === LOCATION_STATUSES.LOCATION_UNRELIABLE) {
      return {
        outcome: DECISION_OUTCOMES.WAIT_FOR_VERIFICATION,
        reason: locationResult.message || 'GPS accuracy is too low. Waiting for stronger signal.',
        canPunchManually: true,
      };
    }

    return {
      outcome: DECISION_OUTCOMES.WAIT_FOR_VERIFICATION,
      reason: 'Outside office perimeter. Auto punch-in standing by.',
      canPunchManually: true,
    };
  }

  return {
    outcome: DECISION_OUTCOMES.WAIT_FOR_VERIFICATION,
    reason: 'Evaluating presence...',
    canPunchManually: true,
  };
};
