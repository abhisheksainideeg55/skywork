import mongoose from 'mongoose';

const shiftDefinitionSchema = new mongoose.Schema(
  {
    shiftId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Day Shift', 'Night Shift', 'Rotational Shift'],
      required: true,
    },
    code: { type: String, default: '' },
    timings: { type: String, default: '' },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    duration: { type: String, default: '' },
    lunchBreak: { type: String, default: '' },
    description: { type: String, default: '' },
    allowance: { type: String, default: '' },
    transportSupport: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const shiftAllocationSchema = new mongoose.Schema(
  {
    allocationId: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    shiftId: { type: String, required: true },
    shiftName: { type: String, default: '' },
    shiftType: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Upcoming', 'Completed', 'Swapped'],
      default: 'Active',
    },
    assignedBy: { type: String, default: '' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ShiftDefinition = mongoose.model('ShiftDefinition', shiftDefinitionSchema);
export const ShiftAllocation = mongoose.model('ShiftAllocation', shiftAllocationSchema);
