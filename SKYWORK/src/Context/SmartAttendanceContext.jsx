import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  DEFAULT_SMART_CONFIG,
  DEFAULT_OFFICES,
  DEFAULT_WIFI_CONFIGS,
  LOCATION_STATUSES,
  WIFI_STATUSES,
  DECISION_OUTCOMES,
} from '../Data/smartAttendanceData.js';
import { getCurrentPosition, isGeolocationSupported } from '../Services/SmartAttendance/locationService.js';
import { isInsideGeofence, findNearestOffice } from '../Services/SmartAttendance/geofenceService.js';
import { checkOfficeWifi, getConnectedWifiSSID, setConnectedWifiSSID } from '../Services/SmartAttendance/wifiService.js';
import { evaluateAttendanceDecision } from '../Services/SmartAttendance/attendanceDecisionEngine.js';

import { logAction } from '../Services/auditService.js';
import {
  fetchSmartConfig,
  saveSmartConfig,
  createOfficeApi,
  updateOfficeApi,
  deleteOfficeApi,
  createWifiApi,
  updateWifiApi,
  deleteWifiApi,
} from '../Services/smartAttendanceApiService.js';
import { useAttendance } from './AttendanceContext.jsx';
import { useAuth } from './AuthContext.jsx';


const SmartAttendanceContext = createContext();

export const useSmartAttendance = () => {
  const ctx = useContext(SmartAttendanceContext);
  if (!ctx) {
    throw new Error('useSmartAttendance must be used within a SmartAttendanceProvider');
  }
  return ctx;
};

export const SmartAttendanceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { getTodayStatus, markCheckIn, markCheckOut } = useAttendance();

  const employeeId = currentUser?.id || 'EMP001';
  const employeeName = currentUser?.name || 'Abhishek Sharma';
  const department = currentUser?.department || 'Engineering';
  const avatar = currentUser?.avatar || '';

  // 1. Config, Offices, and Wi-Fi
  const [config, setConfig] = useState(DEFAULT_SMART_CONFIG);
  const [offices, setOffices] = useState(DEFAULT_OFFICES);
  const [wifiConfigs, setWifiConfigs] = useState(DEFAULT_WIFI_CONFIGS);
  const [isLoadedFromDb, setIsLoadedFromDb] = useState(false);

  // 2. Real-time Status States
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationStatus, setLocationStatus] = useState(LOCATION_STATUSES.CHECKING);
  const [locationDetails, setLocationDetails] = useState(null);
  const [nearestOffice, setNearestOffice] = useState(null);
  const [wifiStatus, setWifiStatus] = useState(WIFI_STATUSES.CHECKING);
  const [wifiDetails, setWifiDetails] = useState(null);
  const [connectedWifiSSID, setConnectedWifiSSIDState] = useState(() => getConnectedWifiSSID());

  const [decision, setDecision] = useState({
    outcome: DECISION_OUTCOMES.WAIT_FOR_VERIFICATION,
    reason: 'Initializing presence verification...',
  });
  const [lastEvaluatedAt, setLastEvaluatedAt] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Simulation Overrides (For demo & testing)
  const [simulatedLocation, setSimulatedLocation] = useState(null);
  const [simulatedWifi, setSimulatedWifi] = useState(null);

  // Tracking timestamps for grace period calculations
  const outsideSinceRef = useRef(null);
  const insideSinceRef = useRef(null);
  const isExecutingActionRef = useRef(false);


  // Load from MongoDB backend on mount
  const loadBackendConfig = useCallback(async () => {
    try {
      const dbConfig = await fetchSmartConfig();
      if (dbConfig) {
        setConfig((prev) => ({
          ...prev,
          enabled: dbConfig.isEnabled ?? dbConfig.enabled ?? true,
          geofencingEnabled: dbConfig.geofenceEnabled ?? dbConfig.geofencingEnabled ?? true,
          wifiEnabled: dbConfig.wifiEnabled ?? true,
          autoPunchIn: dbConfig.autoPunchIn ?? true,
          autoPunchOut: dbConfig.autoPunchOut ?? true,
          entryGracePeriodMins: dbConfig.entryGracePeriodMins ?? 5,
          exitGracePeriodMins: dbConfig.exitGracePeriodMins ?? 10,
          maxGPSAccuracyMeters: dbConfig.maxGPSAccuracyMeters ?? 50,
          lateGracePeriodMins: dbConfig.lateGracePeriodMins ?? 15,
          requireBothVerifications: dbConfig.requireBothVerifications ?? false,
          demoModeEnabled: dbConfig.demoModeEnabled ?? false,
        }));

        if (Array.isArray(dbConfig.officeLocations) && dbConfig.officeLocations.length > 0) {
          const mappedOffices = dbConfig.officeLocations.map((o) => ({
            id: o.officeId || o._id || o.id,
            officeId: o.officeId || o._id || o.id,
            name: o.name,
            address: o.address || '',
            latitude: Number(o.latitude),
            longitude: Number(o.longitude),
            radius: Number(o.radiusMeters || o.radius || 50),
            radiusMeters: Number(o.radiusMeters || o.radius || 50),
            status: o.status || (o.isActive ? 'active' : 'inactive'),
            createdAt: o.createdAt || new Date().toISOString(),
          }));
          setOffices(mappedOffices);
        }

        if (Array.isArray(dbConfig.wifiNetworks) && dbConfig.wifiNetworks.length > 0) {
          const mappedWifi = dbConfig.wifiNetworks.map((w) => ({
            id: w.wifiId || w._id || w.id,
            wifiId: w.wifiId || w._id || w.id,
            name: w.name || w.ssid,
            ssid: w.ssid,
            password: w.password || '',
            bssid: w.bssid || '',
            officeId: w.officeId || '',
            officeName: w.officeName || '',
            status: w.status || (w.isActive ? 'active' : 'inactive'),
            createdAt: w.createdAt || new Date().toISOString(),
          }));
          setWifiConfigs(mappedWifi);
        }
        setIsLoadedFromDb(true);
      }
    } catch (err) {
      console.error('Error loading smart config from backend:', err);
    }
  }, []);

  useEffect(() => {
    loadBackendConfig();
  }, [loadBackendConfig]);

  // CRUD for Offices (MongoDB Synced)
  const addOffice = useCallback(async (newOffice) => {
    const id = `OFF${Date.now().toString().slice(-4)}`;
    const officeRecord = {
      ...newOffice,
      id,
      officeId: id,
      radius: Number(newOffice.radius) || 50,
      radiusMeters: Number(newOffice.radius) || 50,
      latitude: Number(newOffice.latitude),
      longitude: Number(newOffice.longitude),
      status: newOffice.status || 'active',
      createdAt: new Date().toISOString(),
    };
    setOffices((prev) => [...prev, officeRecord]);

    // Save to MongoDB
    await createOfficeApi(officeRecord);

    logAction(
      currentUser?.id || 'SUPER_ADMIN',
      currentUser?.role || 'SUPER_ADMIN',
      'ADD_OFFICE_LOCATION',
      null,
      null,
      officeRecord,
      `Added office location: ${officeRecord.name}`
    );
    return officeRecord;
  }, [currentUser]);

  const updateOffice = useCallback(async (id, updates) => {
    setOffices((prev) =>
      prev.map((off) => {
        if (off.id === id || off.officeId === id) {
          const updated = {
            ...off,
            ...updates,
            radius: updates.radius != null ? Number(updates.radius) : off.radius,
            radiusMeters: updates.radius != null ? Number(updates.radius) : off.radius,
            latitude: updates.latitude != null ? Number(updates.latitude) : off.latitude,
            longitude: updates.longitude != null ? Number(updates.longitude) : off.longitude,
          };
          logAction(
            currentUser?.id || 'SUPER_ADMIN',
            currentUser?.role || 'SUPER_ADMIN',
            'UPDATE_OFFICE_LOCATION',
            null,
            off,
            updated,
            `Updated office location: ${updated.name}`
          );
          return updated;
        }
        return off;
      })
    );

    // Save to MongoDB
    await updateOfficeApi(id, updates);
  }, [currentUser]);

  const deleteOffice = useCallback(async (id) => {
    setOffices((prev) => {
      const toDelete = prev.find((o) => o.id === id || o.officeId === id);
      if (toDelete) {
        logAction(
          currentUser?.id || 'SUPER_ADMIN',
          currentUser?.role || 'SUPER_ADMIN',
          'DELETE_OFFICE_LOCATION',
          null,
          toDelete,
          null,
          `Deleted office location: ${toDelete.name}`
        );
      }
      return prev.filter((o) => o.id !== id && o.officeId !== id);
    });

    // Delete in MongoDB
    await deleteOfficeApi(id);
  }, [currentUser]);

  // CRUD for Wi-Fi Configs (MongoDB Synced)
  const addWifiConfig = useCallback(async (newWifi) => {
    const id = `WIFI${Date.now().toString().slice(-4)}`;
    const office = offices.find((o) => o.id === newWifi.officeId || o.officeId === newWifi.officeId);
    const wifiRecord = {
      ...newWifi,
      id,
      wifiId: id,
      officeName: office ? office.name : 'General Office',
      status: newWifi.status || 'active',
      createdAt: new Date().toISOString(),
    };
    setWifiConfigs((prev) => [...prev, wifiRecord]);

    // Save to MongoDB
    await createWifiApi(wifiRecord);

    logAction(
      currentUser?.id || 'SUPER_ADMIN',
      currentUser?.role || 'SUPER_ADMIN',
      'ADD_WIFI_CONFIG',
      null,
      null,
      { ...wifiRecord, password: '***' },
      `Added Wi-Fi configuration for ${wifiRecord.ssid}`
    );
    return wifiRecord;
  }, [offices, currentUser]);

  const updateWifiConfig = useCallback(async (id, updates) => {
    setWifiConfigs((prev) =>
      prev.map((wifi) => {
        if (wifi.id === id || wifi.wifiId === id) {
          const office = updates.officeId ? offices.find((o) => o.id === updates.officeId || o.officeId === updates.officeId) : null;
          const updated = {
            ...wifi,
            ...updates,
            officeName: office ? office.name : wifi.officeName,
          };
          logAction(
            currentUser?.id || 'SUPER_ADMIN',
            currentUser?.role || 'SUPER_ADMIN',
            'UPDATE_WIFI_CONFIG',
            null,
            { ...wifi, password: '***' },
            { ...updated, password: '***' },
            `Updated Wi-Fi configuration for ${updated.ssid}`
          );
          return updated;
        }
        return wifi;
      })
    );

    // Save to MongoDB
    await updateWifiApi(id, updates);
  }, [offices, currentUser]);

  const deleteWifiConfig = useCallback(async (id) => {
    setWifiConfigs((prev) => {
      const toDelete = prev.find((w) => w.id === id || w.wifiId === id);
      if (toDelete) {
        logAction(
          currentUser?.id || 'SUPER_ADMIN',
          currentUser?.role || 'SUPER_ADMIN',
          'DELETE_WIFI_CONFIG',
          null,
          { ...toDelete, password: '***' },
          null,
          `Deleted Wi-Fi configuration for ${toDelete.ssid}`
        );
      }
      return prev.filter((w) => w.id !== id && w.wifiId !== id);
    });

    // Delete in MongoDB
    await deleteWifiApi(id);
  }, [currentUser]);

  // Update System Settings (MongoDB Synced)
  const updateConfig = useCallback(async (newConfig) => {
    setConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      logAction(
        currentUser?.id || 'SUPER_ADMIN',
        currentUser?.role || 'SUPER_ADMIN',
        'UPDATE_SMART_ATTENDANCE_CONFIG',
        null,
        prev,
        merged,
        'Smart Attendance configuration modified'
      );
      return merged;
    });

    // Save to MongoDB
    await saveSmartConfig(newConfig);
  }, [currentUser]);


  // Core Evaluation Logic
  const runEvaluation = useCallback(async () => {
    if (isExecutingActionRef.current) return;
    setIsEvaluating(true);

    try {
      // 1. Evaluate Geofence / Location
      let locResult = {
        inside: false,
        reliable: false,
        status: LOCATION_STATUSES.CHECKING,
        distance: null,
        message: 'Checking GPS position...',
      };

      if (simulatedLocation) {
        // Use simulation
        const nearest = offices.find((o) => o.status === 'active') || offices[0];
        setNearestOffice(nearest);
        locResult = {
          inside: simulatedLocation === LOCATION_STATUSES.INSIDE,
          reliable: true,
          status: simulatedLocation,
          distance: simulatedLocation === LOCATION_STATUSES.INSIDE ? 15 : 250,
          message: simulatedLocation === LOCATION_STATUSES.INSIDE
            ? 'Inside office geofence (Simulated)'
            : 'Outside office geofence (Simulated)',
          accuracy: 10,
        };
      } else if (config.geofencingEnabled) {
        try {
          const pos = await getCurrentPosition();
          setCurrentPosition(pos);
          const nearest = findNearestOffice(pos, offices);
          setNearestOffice(nearest);

          if (nearest) {
            locResult = isInsideGeofence(
              pos,
              nearest.latitude,
              nearest.longitude,
              nearest.radius,
              config.maxGPSAccuracyMeters
            );
          } else {
            locResult = {
              inside: false,
              reliable: true,
              status: LOCATION_STATUSES.OUTSIDE,
              distance: null,
              message: 'No active office locations configured.',
            };
          }
        } catch (geoErr) {
          locResult = {
            inside: false,
            reliable: false,
            status: geoErr.code === 'PERMISSION_DENIED'
              ? LOCATION_STATUSES.LOCATION_UNAVAILABLE
              : LOCATION_STATUSES.LOCATION_UNRELIABLE,
            distance: null,
            message: geoErr.message || 'Unable to retrieve location.',
          };
        }
      } else {
        locResult = {
          inside: false,
          reliable: true,
          status: LOCATION_STATUSES.OUTSIDE,
          distance: null,
          message: 'Geofencing verification disabled in settings.',
        };
      }

      setLocationStatus(locResult.status);
      setLocationDetails(locResult);

      // 2. Evaluate Wi-Fi (Strictly checked against database saved Wi-Fi networks)
      let wifiRes;
      if (simulatedWifi) {
        wifiRes = await checkOfficeWifi(wifiConfigs, config.demoModeEnabled, simulatedWifi);
      } else {
        wifiRes = await checkOfficeWifi(wifiConfigs, config.demoModeEnabled, null, connectedWifiSSID);
      }
      setWifiStatus(wifiRes.status);
      setWifiDetails(wifiRes);

      // Track Inside / Outside Timestamps for Grace Periods
      const isInside = locResult.inside || wifiRes.verified;
      if (isInside) {
        if (!insideSinceRef.current) insideSinceRef.current = Date.now();
        outsideSinceRef.current = null;
      } else {
        if (!outsideSinceRef.current) outsideSinceRef.current = Date.now();
        insideSinceRef.current = null;
      }

      // 3. Evaluate Attendance Decision
      const currentAtt = getTodayStatus(employeeId);
      const evalDecision = evaluateAttendanceDecision({
        locationResult: locResult,
        wifiResult: wifiRes,
        currentAttendance: currentAtt?.record || (currentAtt?.status === 'checked_in' ? { checkIn: currentAtt.checkIn } : null),
        config,
        outsideSince: outsideSinceRef.current,
        insideSince: insideSinceRef.current,
      });

      setDecision(evalDecision);
      setLastEvaluatedAt(new Date());

      // 4. Act on Decision if Configured
      if (evalDecision.outcome === DECISION_OUTCOMES.AUTO_PUNCH_IN) {
        isExecutingActionRef.current = true;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        const checkInRes = markCheckIn({
          employeeId,
          employeeName,
          department,
          avatar,
          checkIn: timeStr,
          attendanceType: 'Office',
          notes: `Smart Auto Punch-In (${evalDecision.verificationMethod === 'both' ? 'GPS + Wi-Fi' : evalDecision.verificationMethod.toUpperCase()})`,
        });

        if (checkInRes.success) {
          logAction(
            'SMART_SYSTEM',
            'SYSTEM',
            'AUTO_PUNCH_IN',
            employeeId,
            null,
            { checkIn: timeStr, method: evalDecision.verificationMethod, office: nearestOffice?.name },
            `Smart Attendance auto punched in employee ${employeeName} (${employeeId})`
          );
        } else {
          // If network failed or context errored, queue for sync
          queuePendingEvent({
            type: 'check_in',
            employeeId,
            metadata: { employeeName, department, avatar, checkIn: timeStr },
          });
        }
        isExecutingActionRef.current = false;
      } else if (evalDecision.outcome === DECISION_OUTCOMES.AUTO_PUNCH_OUT) {
        isExecutingActionRef.current = true;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        const checkOutRes = markCheckOut({
          employeeId,
          checkOut: timeStr,
          notes: 'Smart Auto Punch-Out (Disconnected from saved Wi-Fi & outside perimeter)',
        });

        if (checkOutRes.success) {
          logAction(
            'SMART_SYSTEM',
            'SYSTEM',
            'AUTO_PUNCH_OUT',
            employeeId,
            null,
            { checkOut: timeStr, office: nearestOffice?.name },
            `Smart Attendance auto punched out employee ${employeeName} (${employeeId})`
          );
        } else {
          queuePendingEvent({
            type: 'check_out',
            employeeId,
            metadata: { checkOut: timeStr },
          });
        }
        isExecutingActionRef.current = false;
      }
    } catch (err) {
      console.error('Error during smart attendance evaluation:', err);
    } finally {
      setIsEvaluating(false);
    }
  }, [
    config,
    offices,
    wifiConfigs,
    connectedWifiSSID,
    simulatedLocation,
    simulatedWifi,
    employeeId,
    employeeName,
    department,
    avatar,
    getTodayStatus,
    markCheckIn,
    markCheckOut,
    nearestOffice,
  ]);

  // Connect to Wi-Fi method
  const connectToWifiNetwork = useCallback((ssid) => {
    setConnectedWifiSSID(ssid);
    setConnectedWifiSSIDState(ssid);
    setTimeout(() => {
      runEvaluation();
    }, 50);
  }, [runEvaluation]);

  // Disconnect Wi-Fi method
  const disconnectWifi = useCallback(() => {
    setConnectedWifiSSID('');
    setConnectedWifiSSIDState('');
    setTimeout(() => {
      runEvaluation();
    }, 50);
  }, [runEvaluation]);


  // 1. Continuous Live Geolocation Watcher (Auto triggers punch in/out as user walks in/out of 50m zone)
  useEffect(() => {
    if (!config.enabled || !config.geofencingEnabled || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    let watchId = null;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const userPos = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          };
          setCurrentPosition(userPos);
          runEvaluation();
        },
        (err) => {
          console.warn('Live location watch notice:', err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
    } catch (e) {
      console.warn('watchPosition initialization error:', e);
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [config.enabled, config.geofencingEnabled, runEvaluation]);

  // 2. Network Online & Offline Listeners (Auto triggers on Wi-Fi connection/disconnection)
  useEffect(() => {
    const handleNetworkChange = () => {
      runEvaluation();
      if (navigator.onLine) {
        syncPendingEvents(markCheckIn, markCheckOut);
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [runEvaluation, markCheckIn, markCheckOut]);

  // 3. Periodic evaluation fallback interval (runs every 10 seconds)
  useEffect(() => {
    runEvaluation();

    if (!config.enabled) return;

    const intervalId = setInterval(() => {
      runEvaluation();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [config.enabled, runEvaluation]);

  const value = {
    config,
    updateConfig,
    offices,
    addOffice,
    updateOffice,
    deleteOffice,
    wifiConfigs,
    addWifiConfig,
    updateWifiConfig,
    deleteWifiConfig,
    connectedWifiSSID,
    connectToWifiNetwork,
    disconnectWifi,
    currentPosition,
    locationStatus,
    locationDetails,
    nearestOffice,
    wifiStatus,
    wifiDetails,
    decision,
    lastEvaluatedAt,
    isEvaluating,
    runEvaluation,
    // Simulation controls
    simulatedLocation,
    setSimulatedLocation,
    simulatedWifi,
    setSimulatedWifi,
    clearSimulation: () => {
      setSimulatedLocation(null);
      setSimulatedWifi(null);
    },
  };


  return (
    <SmartAttendanceContext.Provider value={value}>
      {children}
    </SmartAttendanceContext.Provider>
  );
};
