import React from 'react';
import {
  MapPin,
  Wifi,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { useSmartAttendance } from '../../Context/SmartAttendanceContext.jsx';
import { useAttendance } from '../../Context/AttendanceContext.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import { LOCATION_STATUSES, WIFI_STATUSES, DECISION_OUTCOMES } from '../../Data/smartAttendanceData.js';

export default function SmartAttendanceWidget({ compact = false }) {
  const { currentUser } = useAuth();
  const { getTodayStatus } = useAttendance();
  const {
    config,
    locationStatus,
    wifiStatus,
    wifiConfigs,
    connectedWifiSSID,
    connectToWifiNetwork,
    disconnectWifi,
    decision,
    nearestOffice,
    locationDetails,
    wifiDetails,
    isEvaluating,
    runEvaluation,
    lastEvaluatedAt,
  } = useSmartAttendance();

  const [isWifiDropdownOpen, setIsWifiDropdownOpen] = React.useState(false);

  const employeeId = currentUser?.id || 'EMP001';
  const todayStatus = getTodayStatus(employeeId);
  const isPunchedIn = todayStatus.status === 'checked_in';
  const isCompleted = todayStatus.status === 'completed';

  const activeOfficeWifiList = (wifiConfigs || []).filter((w) => w.status === 'active');
  const isVerifiedWifi = wifiStatus === WIFI_STATUSES.WIFI_VERIFIED;

  const formatLastSync = (date) => {
    if (!date) return 'Just now';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              Smart Presence Verification
              <span
                className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                  config.enabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {config.enabled ? 'Active' : 'Standby'}
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Strict GPS (50m) & Database Saved Wi-Fi Verification
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runEvaluation}
          disabled={isEvaluating}
          title="Verify presence now"
          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <RefreshCw className={`h-4 w-4 ${isEvaluating ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Verification Status Cards */}
      <div className="grid grid-cols-2 gap-3 my-3.5">
        {/* GPS Status */}
        <div className="bg-gray-50 dark:bg-gray-750/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              GPS Geofence (50m)
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                locationStatus === LOCATION_STATUSES.INSIDE
                  ? 'bg-emerald-500 animate-ping'
                  : locationStatus === LOCATION_STATUSES.OUTSIDE
                  ? 'bg-amber-400'
                  : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="text-xs font-bold text-gray-900 dark:text-white capitalize">
            {locationStatus === LOCATION_STATUSES.INSIDE
              ? 'Inside Office (In Range)'
              : locationStatus === LOCATION_STATUSES.OUTSIDE
              ? 'Outside Perimeter'
              : locationStatus}
          </div>
          <div className="text-[10px] text-gray-400 truncate mt-0.5">
            {nearestOffice ? `${nearestOffice.name} (${locationDetails?.distance != null ? `${locationDetails.distance}m` : 'tracking'})` : 'No Office'}
          </div>
        </div>

        {/* Wi-Fi Status */}
        <div className="bg-gray-50 dark:bg-gray-750/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
              <Wifi className="h-3.5 w-3.5 text-indigo-500" />
              Saved Office Wi-Fi
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                isVerifiedWifi ? 'bg-emerald-500 animate-ping' : 'bg-rose-400'
              }`}
            />
          </div>
          <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {isVerifiedWifi
              ? `Connected: ${wifiDetails?.ssid}`
              : connectedWifiSSID
              ? `Unauthorized: ${connectedWifiSSID}`
              : 'Not Connected'}
          </div>

          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsWifiDropdownOpen(!isWifiDropdownOpen)}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              {connectedWifiSSID ? 'Change Wi-Fi Network' : 'Select Office Wi-Fi'}
            </button>
            {connectedWifiSSID && (
              <button
                type="button"
                onClick={() => {
                  disconnectWifi();
                  runEvaluation();
                }}
                className="text-[10px] text-rose-500 hover:underline font-medium"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Wi-Fi Selection Dropdown */}
          {isWifiDropdownOpen && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs space-y-1">
              <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                Authorized Office Networks:
              </div>
              {activeOfficeWifiList.length > 0 ? (
                activeOfficeWifiList.map((wifi) => (
                  <button
                    key={wifi.id || wifi.wifiId}
                    type="button"
                    onClick={() => {
                      connectToWifiNetwork(wifi.ssid);
                      setIsWifiDropdownOpen(false);
                      runEvaluation();
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition ${
                      connectedWifiSSID === wifi.ssid
                        ? 'bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <span className="truncate">{wifi.ssid}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Office ✓</span>
                  </button>
                ))
              ) : (
                <div className="text-[11px] text-gray-400">No active Wi-Fi configured.</div>
              )}
              <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    const custom = prompt('Enter unauthorized Wi-Fi name for testing (e.g. MyHome_WiFi):', 'Home_WiFi');
                    if (custom) {
                      connectToWifiNetwork(custom);
                      setIsWifiDropdownOpen(false);
                      runEvaluation();
                    }
                  }}
                  className="w-full text-left px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ⚡ Test with other/home Wi-Fi...
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decision Engine Summary Banner */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900/50 flex items-start space-x-2.5">
        <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <span>
              Status:{' '}
              {isPunchedIn
                ? 'Checked In (Active Shift)'
                : isCompleted
                ? 'Completed for Today'
                : 'Not Checked In'}
            </span>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-normal">
              {formatLastSync(lastEvaluatedAt)}
            </span>
          </div>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5 truncate">
            {decision.reason || 'Smart verification standing by.'}
          </p>
        </div>
      </div>
    </div>
  );
}

