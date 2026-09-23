// ============================================================
// SKYWORK HRMS - STRICT OFFICE WI-FI VERIFICATION SERVICE
// Matches employee connected network strictly against
// Super Admin authorized Wi-Fi SSIDs saved in MongoDB.
// ============================================================
import { WIFI_STATUSES } from '../../Data/smartAttendanceData.js';

const STORAGE_KEY_CONNECTED_WIFI = 'skywork_connected_wifi_ssid';

export const getConnectedWifiSSID = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_CONNECTED_WIFI) || '';
  } catch {
    return '';
  }
};

export const setConnectedWifiSSID = (ssid) => {
  try {
    if (!ssid) {
      localStorage.removeItem(STORAGE_KEY_CONNECTED_WIFI);
    } else {
      localStorage.setItem(STORAGE_KEY_CONNECTED_WIFI, ssid.trim());
    }
  } catch {
    // ignore
  }
};

export const isBrowserWifiLimited = () => true;

/**
 * Checks if user is connected strictly to one of the authorized office Wi-Fi networks
 * @param {Array} wifiConfigs - Array of saved Wi-Fi configs from MongoDB
 * @param {boolean} demoMode - Demo mode setting
 * @param {string|null} forcedStatus - Simulation override (e.g. from SuperAdmin Sandbox)
 * @param {string|null} currentSSID - Explicitly connected SSID (or from localStorage)
 */
export const checkOfficeWifi = async (
  wifiConfigs = [],
  demoMode = false,
  forcedStatus = null,
  currentSSID = null
) => {
  // 1. Simulation / SuperAdmin Sandbox Override
  if (forcedStatus) {
    const isVerified = forcedStatus === WIFI_STATUSES.WIFI_VERIFIED;
    const activeConfigs = (wifiConfigs || []).filter((w) => w.status === 'active');
    const matched = activeConfigs[0];

    return {
      connected: isVerified,
      verified: isVerified,
      networkId: isVerified ? (matched?.id || matched?.wifiId || 'OFFICE_WIFI') : null,
      ssid: isVerified ? (matched?.ssid || 'OFFICE_WIFI') : 'Unauthorized_WiFi',
      officeId: isVerified ? matched?.officeId || null : null,
      officeName: isVerified ? matched?.officeName || 'Office' : null,
      status: forcedStatus,
      message: isVerified
        ? `Connected & verified on saved office network: ${matched?.ssid || 'OFFICE_WIFI'}`
        : 'Wi-Fi not authorized for auto attendance.',
      checkedAt: new Date().toISOString(),
    };
  }

  // 2. Browser completely offline check
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      connected: false,
      verified: false,
      networkId: null,
      ssid: null,
      officeId: null,
      officeName: null,
      status: WIFI_STATUSES.WIFI_UNAVAILABLE,
      message: 'Network offline. Wi-Fi disconnected.',
      checkedAt: new Date().toISOString(),
    };
  }

  const activeConfigs = (wifiConfigs || []).filter((w) => w.status === 'active');

  if (activeConfigs.length === 0) {
    return {
      connected: true,
      verified: false,
      networkId: null,
      ssid: null,
      officeId: null,
      officeName: null,
      status: WIFI_STATUSES.WIFI_NOT_VERIFIED,
      message: 'No active office Wi-Fi networks saved in database.',
      checkedAt: new Date().toISOString(),
    };
  }

  // Determine current active SSID on user device
  const activeSSID = (currentSSID || getConnectedWifiSSID() || '').trim();

  // 3. Match against Database Saved Wi-Fi SSIDs
  if (activeSSID) {
    const matched = activeConfigs.find(
      (w) => (w.ssid || '').trim().toLowerCase() === activeSSID.toLowerCase()
    );

    if (matched) {
      return {
        connected: true,
        verified: true,
        networkId: matched.id || matched.wifiId,
        ssid: matched.ssid,
        officeId: matched.officeId,
        officeName: matched.officeName,
        status: WIFI_STATUSES.WIFI_VERIFIED,
        message: `Verified on authorized office Wi-Fi: ${matched.ssid} (${matched.officeName || 'Office'})`,
        checkedAt: new Date().toISOString(),
      };
    } else {
      // Connected to some other Wi-Fi (Home / Public / Hotspot)
      return {
        connected: true,
        verified: false,
        networkId: null,
        ssid: activeSSID,
        officeId: null,
        officeName: null,
        status: WIFI_STATUSES.WIFI_NOT_VERIFIED,
        message: `Connected to "${activeSSID}" (Unauthorized Wi-Fi. Auto punch-in only allowed on saved Office Wi-Fi).`,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  // 4. If no specific SSID is set on device, check if running in demo mode
  return {
    connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    verified: false,
    networkId: null,
    ssid: null,
    officeId: null,
    officeName: null,
    status: WIFI_STATUSES.WIFI_NOT_VERIFIED,
    message: 'Please connect to an authorized office Wi-Fi network saved in database.',
    checkedAt: new Date().toISOString(),
  };
};

