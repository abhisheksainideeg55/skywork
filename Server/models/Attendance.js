import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    date: { type: String, required: true, index: true }, // DD-MM-YYYY
    dateRaw: { type: String, default: '' }, // YYYY-MM-DD for sorting
    checkIn: { type: String, default: '--:--' },
    checkOut: { type: String, default: '--:--' },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave', 'WFH', 'Holiday', 'Weekend'],
      default: 'Absent',
    },
    workedHours: { type: String, default: '--' },
    pendingHours: { type: String, default: '9h 00m' },
    overtime: { type: String, default: '-' },
    totalMinutes: { type: Number, default: 0 },
    isWFH: { type: Boolean, default: false },
    shiftType: { type: String, default: 'Day Shift' },
    // Smart attendance fields
    verificationMethod: {
      type: String,
      enum: ['manual', 'geofence', 'wifi', 'smart', 'biometric'],
      default: 'manual',
    },
    locationVerified: { type: Boolean, default: false },
    wifiVerified: { type: Boolean, default: false },
    officeId: { type: String, default: '' },
    remarks: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ dateRaw: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
