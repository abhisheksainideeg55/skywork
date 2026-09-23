import mongoose from 'mongoose';

const breakPolicySchema = new mongoose.Schema(
  {
    policyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    shiftType: { type: String, default: 'Day Shift' },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    displayTime: { type: String, default: '' },
    durationMinutes: { type: Number, default: 15 },
    isMandatory: { type: Boolean, default: false },
    alarmSound: { type: String, default: 'chime' },
    autoAlertEnabled: { type: Boolean, default: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    allowance: { type: String, default: '' },
    color: {
      bg: { type: String, default: 'bg-indigo-50' },
      border: { type: String, default: 'border-indigo-200' },
      text: { type: String, default: 'text-indigo-800' },
      badge: { type: String, default: 'bg-indigo-100 text-indigo-800' },
      gradient: { type: String, default: 'from-indigo-600 to-purple-600' },
    },
    createdBy: { type: String, default: 'EMP-HR01' },
    createdByName: { type: String, default: 'HR Administrator' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const breakLogSchema = new mongoose.Schema(
  {
    logId: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    policyId: { type: String, default: '' },
    breakType: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, default: '' },
    durationMinutes: { type: Number, default: 0 },
    allowedMinutes: { type: Number, default: 0 },
    exceededMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['On Break', 'Completed', 'Exceeded', 'Cancelled'],
      default: 'On Break',
    },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

breakLogSchema.index({ employeeId: 1, date: 1 });

export const BreakPolicy = mongoose.model('BreakPolicy', breakPolicySchema);
export const BreakLog = mongoose.model('BreakLog', breakLogSchema);
