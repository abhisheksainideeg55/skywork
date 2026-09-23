import React, { useState } from 'react';
import {
  MapPin,
  Wifi,
  Shield,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  EyeOff,
  Navigation,
  RefreshCw,
  Clock,
  Radio,
  Info
} from 'lucide-react';
import { useSmartAttendance } from '../../Context/SmartAttendanceContext.jsx';
import { getCurrentPosition } from '../../Services/SmartAttendance/locationService.js';
import { LOCATION_STATUSES, WIFI_STATUSES } from '../../Data/smartAttendanceData.js';
import OfficeLocationMapPicker from '../../Components/SmartAttendance/OfficeLocationMapPicker.jsx';


export const SmartAttendanceSettings = () => {
  const {
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
    locationStatus,
    wifiStatus,
    decision,
    nearestOffice,
    runEvaluation,
    isEvaluating,
    simulatedLocation,
    setSimulatedLocation,
    simulatedWifi,
    setSimulatedWifi,
    clearSimulation,
  } = useSmartAttendance();

  // Modals state
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [officeForm, setOfficeForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: 50,
    status: 'active',
  });

  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
  const [editingWifi, setEditingWifi] = useState(null);
  const [wifiForm, setWifiForm] = useState({
    officeId: '',
    name: '',
    ssid: '',
    password: '',
    status: 'active',
  });

  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Office Handlers
  const handleOpenAddOffice = () => {
    setEditingOffice(null);
    setOfficeForm({
      name: '',
      address: '',
      latitude: '26.9124',
      longitude: '75.7873',
      radius: 50,
      status: 'active',
    });
    setIsOfficeModalOpen(true);
  };

  const handleOpenEditOffice = (office) => {
    setEditingOffice(office);
    setOfficeForm({
      name: office.name,
      address: office.address,
      latitude: String(office.latitude),
      longitude: String(office.longitude),
      radius: office.radius || office.radiusMeters || 50,
      status: office.status || 'active',
    });
    setIsOfficeModalOpen(true);
  };

  const handleSaveOffice = async (e) => {
    e.preventDefault();
    if (!officeForm.name || !officeForm.latitude || !officeForm.longitude) {
      alert('Please fill all required office fields.');
      return;
    }
    try {
      if (editingOffice) {
        await updateOffice(editingOffice.id || editingOffice.officeId, officeForm);
        triggerToast(`Office "${officeForm.name}" updated successfully.`);
      } else {
        await addOffice(officeForm);
        triggerToast(`New office "${officeForm.name}" saved to database.`);
      }
      setIsOfficeModalOpen(false);
    } catch (err) {
      alert('Failed to save office location.');
    }
  };

  const handleDeleteOffice = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteOffice(id);
      triggerToast(`Office "${name}" removed from database.`);
    }
  };

  const detectCurrentGps = async () => {
    setGpsDetecting(true);
    try {
      const pos = await getCurrentPosition();
      setOfficeForm((prev) => ({
        ...prev,
        latitude: pos.latitude.toFixed(6),
        longitude: pos.longitude.toFixed(6),
      }));
      triggerToast('Coordinates fetched from your device.');
    } catch (err) {
      alert(err.message || 'Unable to retrieve location.');
    } finally {
      setGpsDetecting(false);
    }
  };

  // WiFi Handlers
  const handleOpenAddWifi = () => {
    setEditingWifi(null);
    setWifiForm({
      officeId: offices[0]?.id || offices[0]?.officeId || '',
      name: '',
      ssid: '',
      password: '',
      status: 'active',
    });
    setIsWifiModalOpen(true);
  };

  const handleOpenEditWifi = (wifi) => {
    setEditingWifi(wifi);
    setWifiForm({
      officeId: wifi.officeId || offices[0]?.id || offices[0]?.officeId || '',
      name: wifi.name,
      ssid: wifi.ssid,
      password: wifi.password || '',
      status: wifi.status || 'active',
    });
    setIsWifiModalOpen(true);
  };

  const handleSaveWifi = async (e) => {
    e.preventDefault();
    if (!wifiForm.ssid) {
      alert('Please enter the Wi-Fi SSID.');
      return;
    }
    const finalForm = {
      ...wifiForm,
      name: wifiForm.name || wifiForm.ssid,
    };
    try {
      if (editingWifi) {
        await updateWifiConfig(editingWifi.id || editingWifi.wifiId, finalForm);
        triggerToast(`Wi-Fi network "${finalForm.ssid}" updated in database.`);
      } else {
        await addWifiConfig(finalForm);
        triggerToast(`Wi-Fi network "${finalForm.ssid}" saved to database.`);
      }
      setIsWifiModalOpen(false);
    } catch (err) {
      alert('Failed to save Wi-Fi configuration.');
    }
  };

  const handleDeleteWifi = async (id, ssid) => {
    if (window.confirm(`Are you sure you want to remove Wi-Fi "${ssid}"?`)) {
      await deleteWifiConfig(id);
      triggerToast(`Wi-Fi "${ssid}" removed from database.`);
    }
  };


  const togglePasswordVisibility = (id) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center space-x-3 border border-indigo-500 animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Radio className="h-7 w-7 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Smart Hybrid Attendance</h1>
              <p className="text-indigo-200 text-sm mt-0.5">
                Two-Layer Automated Punch-In/Out via GPS Geofencing & Office Wi-Fi Verification
              </p>
            </div>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15">
          <span className="text-sm font-semibold tracking-wide">
            {config.enabled ? 'SYSTEM ACTIVE' : 'SYSTEM PAUSED'}
          </span>
          <button
            type="button"
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
              config.enabled ? 'bg-emerald-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Quick Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{offices.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Offices Configured</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Wifi className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{wifiConfigs.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Wi-Fi Networks</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {config.requireBothVerifications ? 'GPS + Wi-Fi (Both)' : 'GPS or Wi-Fi (Either)'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Verification Policy</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              In: {config.entryGracePeriodMins}m | Out: {config.exitGracePeriodMins}m
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Grace Windows</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: OFFICE LOCATIONS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Office Locations & Geofences</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Define office coordinates and geofence perimeter radius (in meters)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenAddOffice}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Office
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3">Office Name</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3">Coordinates (Lat, Lng)</th>
                <th className="px-5 py-3">Geofence Radius</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {offices.map((office) => (
                <tr key={office.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                    {office.name}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {office.address || 'N/A'}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs">
                    {Number(office.latitude).toFixed(4)}, {Number(office.longitude).toFixed(4)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {office.radius} meters
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        office.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {office.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditOffice(office)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 transition"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOffice(office.id, office.name)}
                      className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: OFFICE WI-FI NETWORKS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Wifi className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Office Wi-Fi Configurations</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add authorized office Wi-Fi networks (SSID, Password, Office binding)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenAddWifi}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Wi-Fi
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3">Network Label</th>
                <th className="px-5 py-3">SSID (Network ID)</th>
                <th className="px-5 py-3">Assigned Office</th>
                <th className="px-5 py-3">Password</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {wifiConfigs.map((wifi) => (
                <tr key={wifi.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                    {wifi.name}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {wifi.ssid}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-300">
                    {wifi.officeName || 'All Offices'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs">
                        {showPasswordMap[wifi.id] ? wifi.password || '—' : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(wifi.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Toggle Password Visibility"
                      >
                        {showPasswordMap[wifi.id] ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        wifi.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {wifi.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditWifi(wifi)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 transition"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWifi(wifi.id, wifi.ssid)}
                      className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note on Browser Wi-Fi Behavior */}
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border-t border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Browser Sandboxing Note:</strong> Standard web browsers do not grant direct hardware access to scan local Wi-Fi SSIDs for user privacy. In this demo environment, Wi-Fi verification is simulated using your configured authorized SSIDs when Demo Mode is enabled.
          </span>
        </div>
      </div>

      {/* SECTION 3: AUTOMATION RULES & PARAMETERS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-gray-200 dark:border-gray-700 pb-4">
          <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Attendance Policies & Rules</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure automated check-in/out thresholds, grace periods, and verification requirements
            </p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Geofencing */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">GPS Geofencing Layer</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Verify user is inside office perimeter</div>
            </div>
            <input
              type="checkbox"
              checked={config.geofencingEnabled}
              onChange={(e) => updateConfig({ geofencingEnabled: e.target.checked })}
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>

          {/* Wi-Fi Verification */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Office Wi-Fi Layer</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Verify connection to office Wi-Fi</div>
            </div>
            <input
              type="checkbox"
              checked={config.wifiEnabled}
              onChange={(e) => updateConfig({ wifiEnabled: e.target.checked })}
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>

          {/* Auto Punch-In */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Automated Punch-In</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Automatically mark check-in upon arrival</div>
            </div>
            <input
              type="checkbox"
              checked={config.autoPunchIn}
              onChange={(e) => updateConfig({ autoPunchIn: e.target.checked })}
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>

          {/* Auto Punch-Out */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Automated Punch-Out</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Mark check-out when leaving after grace period</div>
            </div>
            <input
              type="checkbox"
              checked={config.autoPunchOut}
              onChange={(e) => updateConfig({ autoPunchOut: e.target.checked })}
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>

          {/* Require Both Verifications */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Require Dual Verification</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Require BOTH GPS Geofence AND Office Wi-Fi</div>
            </div>
            <input
              type="checkbox"
              checked={config.requireBothVerifications}
              onChange={(e) => updateConfig({ requireBothVerifications: e.target.checked })}
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>

          {/* Demo Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20">
            <div>
              <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Demo / Simulation Mode</div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400">Simulate office Wi-Fi in standard browser</div>
            </div>
            <input
              type="checkbox"
              checked={config.demoModeEnabled}
              onChange={(e) => updateConfig({ demoModeEnabled: e.target.checked })}
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Numeric Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Entry Grace Period (mins)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={config.entryGracePeriodMins}
              onChange={(e) => updateConfig({ entryGracePeriodMins: Number(e.target.value) })}
              className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exit Grace Period (mins)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={config.exitGracePeriodMins}
              onChange={(e) => updateConfig({ exitGracePeriodMins: Number(e.target.value) })}
              className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              GPS Accuracy Threshold (meters)
            </label>
            <input
              type="number"
              min="10"
              max="200"
              value={config.maxGPSAccuracyMeters}
              onChange={(e) => updateConfig({ maxGPSAccuracyMeters: Number(e.target.value) })}
              className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Late Mark Grace Period (mins)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={config.lateGracePeriodMins}
              onChange={(e) => updateConfig({ lateGracePeriodMins: Number(e.target.value) })}
              className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: LIVE SIMULATOR & TESTING SANDBOX */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-5 border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <Radio className="h-5 w-5 text-indigo-400 animate-pulse" />
              <span>Live Decision Engine & Testing Sandbox</span>
            </h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Simulate employee movements and verify multi-factor punch decisions in real time
            </p>
          </div>
          <button
            type="button"
            onClick={runEvaluation}
            disabled={isEvaluating}
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 transition text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            Evaluate Now
          </button>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <div className="text-xs text-indigo-300 font-medium">GPS Geofence Status</div>
            <div className="text-base font-semibold mt-1 flex items-center space-x-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  locationStatus === LOCATION_STATUSES.INSIDE
                    ? 'bg-emerald-400'
                    : locationStatus === LOCATION_STATUSES.OUTSIDE
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span>{locationStatus}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Nearest: {nearestOffice?.name || 'None'}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <div className="text-xs text-indigo-300 font-medium">Office Wi-Fi Status</div>
            <div className="text-base font-semibold mt-1 flex items-center space-x-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  wifiStatus === WIFI_STATUSES.WIFI_VERIFIED ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span>{wifiStatus}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              SSID: {wifiConfigs[0]?.ssid || 'None'}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <div className="text-xs text-indigo-300 font-medium">Decision Engine Output</div>
            <div className="text-base font-semibold mt-1 text-emerald-400">
              {decision.outcome}
            </div>
            <div className="text-xs text-gray-300 mt-1 truncate">
              {decision.reason}
            </div>
          </div>
        </div>

        {/* Quick Simulation Buttons */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
          <span className="text-xs text-indigo-200 font-medium">Quick Simulation Triggers:</span>

          <button
            type="button"
            onClick={() => setSimulatedLocation(LOCATION_STATUSES.INSIDE)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition ${
              simulatedLocation === LOCATION_STATUSES.INSIDE
                ? 'bg-emerald-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Simulate Inside Office (GPS)
          </button>

          <button
            type="button"
            onClick={() => setSimulatedLocation(LOCATION_STATUSES.OUTSIDE)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition ${
              simulatedLocation === LOCATION_STATUSES.OUTSIDE
                ? 'bg-amber-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Simulate Outside Office (GPS)
          </button>

          <button
            type="button"
            onClick={() => setSimulatedWifi(WIFI_STATUSES.WIFI_VERIFIED)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition ${
              simulatedWifi === WIFI_STATUSES.WIFI_VERIFIED
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Simulate Wi-Fi Connected
          </button>

          <button
            type="button"
            onClick={() => setSimulatedWifi(WIFI_STATUSES.WIFI_NOT_VERIFIED)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition ${
              simulatedWifi === WIFI_STATUSES.WIFI_NOT_VERIFIED
                ? 'bg-rose-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Simulate Wi-Fi Disconnected
          </button>

          {(simulatedLocation || simulatedWifi) && (
            <button
              type="button"
              onClick={clearSimulation}
              className="px-3 py-1 text-xs rounded-md font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition ml-auto"
            >
              Clear Overrides
            </button>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT OFFICE */}
      {isOfficeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingOffice ? 'Edit Office Location & Geofence' : 'Add Office Location & Geofence'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Set office GPS coordinates, geofence radius, and location details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOfficeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-semibold p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOffice} className="space-y-4">
              {/* Interactive Map Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Interactive Map Location Picker (Search, Click or Drag Pin)
                  </label>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    Live Geofence Preview
                  </span>
                </div>
                <OfficeLocationMapPicker
                  latitude={Number(officeForm.latitude) || 26.9124}
                  longitude={Number(officeForm.longitude) || 75.7873}
                  radius={Number(officeForm.radius) || 50}
                  officeName={officeForm.name}
                  address={officeForm.address}
                  onChange={({ latitude, longitude, address }) => {
                    setOfficeForm((prev) => ({
                      ...prev,
                      ...(latitude !== undefined ? { latitude: String(latitude) } : {}),
                      ...(longitude !== undefined ? { longitude: String(longitude) } : {}),
                      ...(address ? { address } : {}),
                      ...(!prev.name && address ? { name: `${address.split(',')[0].trim()} Office` } : {}),
                    }));
                  }}

                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Office Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur Head Office / Bangalore Branch"
                    value={officeForm.name}
                    onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                    className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={officeForm.status}
                    onChange={(e) => setOfficeForm({ ...officeForm, status: e.target.value })}
                    className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active (Enforce Geofence)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Physical Address / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Malviya Nagar, Jaipur, Rajasthan - 302017"
                  value={officeForm.address}
                  onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                  className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="26.9124"
                    value={officeForm.latitude}
                    onChange={(e) => setOfficeForm({ ...officeForm, latitude: e.target.value })}
                    className="w-full text-sm font-mono rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="75.7873"
                    value={officeForm.longitude}
                    onChange={(e) => setOfficeForm({ ...officeForm, longitude: e.target.value })}
                    className="w-full text-sm font-mono rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Geofence Radius (meters) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={officeForm.radius}
                    onChange={(e) => setOfficeForm({ ...officeForm, radius: Number(e.target.value) })}
                    className="w-full text-sm font-semibold rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={detectCurrentGps}
                  disabled={gpsDetecting}
                  className="py-2 px-3 text-xs font-medium rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition flex items-center space-x-1.5"
                >
                  <Navigation className={`h-3.5 w-3.5 ${gpsDetecting ? 'animate-spin' : ''}`} />
                  <span>{gpsDetecting ? 'Detecting GPS...' : 'Use Device Coordinates'}</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOfficeModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                  >
                    {editingOffice ? 'Save Changes' : 'Save Office to Database'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL: ADD / EDIT WI-FI */}
      {isWifiModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingWifi ? 'Edit Wi-Fi Configuration' : 'Add Office Wi-Fi Network'}
            </h3>
            <form onSubmit={handleSaveWifi} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Bind to Office Location *
                </label>
                <select
                  required
                  value={wifiForm.officeId}
                  onChange={(e) => setWifiForm({ ...wifiForm, officeId: e.target.value })}
                  className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {offices.map((off) => (
                    <option key={off.id || off.officeId} value={off.id || off.officeId}>
                      {off.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Network Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office WiFi / Staff 5G"
                  value={wifiForm.name}
                  onChange={(e) => setWifiForm({ ...wifiForm, name: e.target.value })}
                  className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  SSID (Wi-Fi Network Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SKYWORK_OFFICE_JAIPUR"
                  value={wifiForm.ssid}
                  onChange={(e) => setWifiForm({ ...wifiForm, ssid: e.target.value })}
                  className="w-full text-sm font-mono rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Wi-Fi Password
                </label>
                <input
                  type="text"
                  placeholder="Network password (saved in database)"
                  value={wifiForm.password}
                  onChange={(e) => setWifiForm({ ...wifiForm, password: e.target.value })}
                  className="w-full text-sm font-mono rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={wifiForm.status}
                  onChange={(e) => setWifiForm({ ...wifiForm, status: e.target.value })}
                  className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsWifiModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                >
                  {editingWifi ? 'Save Changes' : 'Save Wi-Fi to Database'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAttendanceSettings;
