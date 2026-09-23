// ============================================================
// SKYWORK HRMS - GEOFENCE SERVICE
// Uses Haversine formula for accurate geographic distance
// ============================================================
import { LOCATION_STATUSES } from '../../Data/smartAttendanceData.js';

const EARTH_RADIUS_METERS = 6371000;

export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

export const isInsideGeofence = (userCoords, officeLat, officeLng, radiusMeters, maxAccuracyMeters = 50) => {
  if (!userCoords || userCoords.latitude == null || userCoords.longitude == null) {
    return {
      inside: false,
      distance: null,
      reliable: false,
      status: LOCATION_STATUSES.LOCATION_UNAVAILABLE,
      message: 'Location data unavailable.',
    };
  }

  const accuracyOk = userCoords.accuracy == null || userCoords.accuracy <= maxAccuracyMeters;

  if (!accuracyOk) {
    return {
      inside: false,
      distance: null,
      reliable: false,
      status: LOCATION_STATUSES.LOCATION_UNRELIABLE,
      message: `GPS accuracy (${userCoords.accuracy}m) exceeds maximum allowed (${maxAccuracyMeters}m). Location unreliable.`,
    };
  }

  const distance = haversineDistance(
    userCoords.latitude,
    userCoords.longitude,
    officeLat,
    officeLng
  );

  const inside = distance <= radiusMeters;

  return {
    inside,
    distance: Math.round(distance),
    reliable: true,
    status: inside ? LOCATION_STATUSES.INSIDE : LOCATION_STATUSES.OUTSIDE,
    message: inside
      ? 'You are inside the office geofence.'
      : 'You are outside the office geofence.',
    accuracy: userCoords.accuracy,
  };
};

export const findNearestOffice = (userCoords, offices) => {
  if (!offices || offices.length === 0 || !userCoords) return null;
  let nearest = null;
  let minDistance = Infinity;
  for (const office of offices.filter((o) => o.status === 'active')) {
    const dist = haversineDistance(
      userCoords.latitude,
      userCoords.longitude,
      office.latitude,
      office.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...office, distance: Math.round(dist) };
    }
  }
  return nearest;
};
