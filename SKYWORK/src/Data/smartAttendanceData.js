// ============================================================
// SKYWORK HRMS - SMART ATTENDANCE DEFAULT DATA
// ============================================================

export const DEFAULT_SMART_CONFIG = {
  enabled: true,
  geofencingEnabled: true,
  wifiEnabled: true,
  autoPunchIn: true,
  autoPunchOut: true,
  entryGracePeriodMins: 0,
  exitGracePeriodMins: 0,
  wifiDisconnectGracePeriodMins: 0,
  maxGPSAccuracyMeters: 50,
  requireBothVerifications: false,
  lateGracePeriodMins: 15,
  autoCheckoutAfterHours: 10,
  manualFallbackEnabled: true,
  demoModeEnabled: true,
};


export const DEFAULT_OFFICES = [
  {
    id: 'OFF001',
    name: 'Jaipur Head Office',
    address: 'Malviya Nagar, Jaipur, Rajasthan - 302017',
    latitude: 26.9124,
    longitude: 75.7873,
    radius: 50,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_WIFI_CONFIGS = [
  {
    id: 'WIFI001',
    officeId: 'OFF001',
    officeName: 'Jaipur Head Office',
    name: 'Office WiFi',
    ssid: 'SKYWORK_OFFICE_JAIPUR',
    password: 'skywork@2024',
    networkIdentifier: 'SKYWORK_OFFICE_JAIPUR',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const ATTENDANCE_STATES = {
  NOT_STARTED: 'NOT_STARTED', WORKING: 'WORKING', PRESENT: 'PRESENT',
  LATE: 'LATE', CHECKED_OUT: 'CHECKED_OUT', AUTO_CHECKED_OUT: 'AUTO_CHECKED_OUT',
  MANUAL: 'MANUAL', VERIFICATION_PENDING: 'VERIFICATION_PENDING',
  NEEDS_REVIEW: 'NEEDS_REVIEW', LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  LOCATION_UNRELIABLE: 'LOCATION_UNRELIABLE', WIFI_UNAVAILABLE: 'WIFI_UNAVAILABLE',
  WIFI_NOT_VERIFIED: 'WIFI_NOT_VERIFIED', SYNC_PENDING: 'SYNC_PENDING', SYNCED: 'SYNCED',
};

export const ATTENDANCE_METHODS = { AUTOMATIC: 'automatic', MANUAL: 'manual' };

export const VERIFICATION_METHODS = { GEOFENCE: 'geofence', WIFI: 'wifi', MANUAL: 'manual' };

export const LOCATION_STATUSES = {
  INSIDE: 'INSIDE', OUTSIDE: 'OUTSIDE', LOCATION_UNRELIABLE: 'LOCATION_UNRELIABLE',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE', CHECKING: 'CHECKING',
};

export const WIFI_STATUSES = {
  WIFI_VERIFIED: 'WIFI_VERIFIED', WIFI_NOT_VERIFIED: 'WIFI_NOT_VERIFIED',
  WIFI_UNAVAILABLE: 'WIFI_UNAVAILABLE', WIFI_DISCONNECTED: 'WIFI_DISCONNECTED',
  WIFI_UNKNOWN: 'WIFI_UNKNOWN', CHECKING: 'CHECKING',
};

export const DECISION_OUTCOMES = {
  AUTO_PUNCH_IN: 'AUTO_PUNCH_IN', AUTO_PUNCH_OUT: 'AUTO_PUNCH_OUT',
  WAIT_FOR_VERIFICATION: 'WAIT_FOR_VERIFICATION', MANUAL_REQUIRED: 'MANUAL_REQUIRED',
  NEEDS_REVIEW: 'NEEDS_REVIEW', ALREADY_CHECKED_IN: 'ALREADY_CHECKED_IN',
  ALREADY_CHECKED_OUT: 'ALREADY_CHECKED_OUT',
};
