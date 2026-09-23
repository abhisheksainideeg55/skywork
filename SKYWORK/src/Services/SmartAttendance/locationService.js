// ============================================================
// SKYWORK HRMS - LOCATION SERVICE
// Wraps navigator.geolocation with error handling
// ============================================================

let watchId = null;

export const LOCATION_ERRORS = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
};

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: LOCATION_ERRORS.NOT_SUPPORTED, message: 'Geolocation is not supported by this browser.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: new Date(pos.timestamp).toISOString(),
        });
      },
      (err) => {
        const codeMap = {
          1: LOCATION_ERRORS.PERMISSION_DENIED,
          2: LOCATION_ERRORS.POSITION_UNAVAILABLE,
          3: LOCATION_ERRORS.TIMEOUT,
        };
        reject({ code: codeMap[err.code] || LOCATION_ERRORS.POSITION_UNAVAILABLE, message: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
};

export const startWatchingPosition = (onSuccess, onError) => {
  if (!navigator.geolocation) {
    onError({ code: LOCATION_ERRORS.NOT_SUPPORTED, message: 'Geolocation not supported.' });
    return null;
  }
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onSuccess({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: new Date(pos.timestamp).toISOString(),
      });
    },
    (err) => {
      const codeMap = { 1: LOCATION_ERRORS.PERMISSION_DENIED, 2: LOCATION_ERRORS.POSITION_UNAVAILABLE, 3: LOCATION_ERRORS.TIMEOUT };
      onError({ code: codeMap[err.code] || LOCATION_ERRORS.POSITION_UNAVAILABLE, message: err.message });
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
  return watchId;
};

export const stopWatchingPosition = () => {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
};

export const isGeolocationSupported = () => !!navigator.geolocation;
