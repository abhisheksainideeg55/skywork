import mongoose from 'mongoose';

const officeLocationSchema = new mongoose.Schema({
  officeId: { type: String, required: true },
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radiusMeters: { type: Number, default: 50 },
  radius: { type: Number, default: 50 },
  address: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const wifiConfigSchema = new mongoose.Schema({
  wifiId: { type: String, required: true },
  name: { type: String, default: '' },
  ssid: { type: String, required: true },
  password: { type: String, default: '' },
  bssid: { type: String, default: '' },
  officeId: { type: String, default: '' },
  officeName: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const smartAttendanceConfigSchema = new mongoose.Schema(
  {
    isEnabled: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true },
    geofenceEnabled: { type: Boolean, default: true },
    geofencingEnabled: { type: Boolean, default: true },
    wifiEnabled: { type: Boolean, default: true },
    autoPunchIn: { type: Boolean, default: true },
    autoPunchOut: { type: Boolean, default: true },
    autoCheckoutEnabled: { type: Boolean, default: false },
    autoCheckoutAfterMinutes: { type: Number, default: 600 },
    gracePeriodMinutes: { type: Number, default: 15 },
    entryGracePeriodMins: { type: Number, default: 5 },
    exitGracePeriodMins: { type: Number, default: 10 },
    maxGPSAccuracyMeters: { type: Number, default: 50 },
    lateGracePeriodMins: { type: Number, default: 15 },
    requireBothVerifications: { type: Boolean, default: false },
    demoModeEnabled: { type: Boolean, default: false },
    verificationMode: {
      type: String,
      enum: ['geofence_only', 'wifi_only', 'both_required', 'either'],
      default: 'either',
    },
    officeLocations: [officeLocationSchema],
    wifiNetworks: [wifiConfigSchema],
    defaultRadiusMeters: { type: Number, default: 50 },
    refreshIntervalSeconds: { type: Number, default: 30 },
  },
  {
    timestamps: true,
  }
);

const SmartAttendanceConfig = mongoose.model('SmartAttendanceConfig', smartAttendanceConfigSchema);
export default SmartAttendanceConfig;

