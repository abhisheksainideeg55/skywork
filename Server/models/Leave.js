import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    leaveId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    leaveType: {
      type: String,
      enum: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Emergency Leave', 'Other'],
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalDays: { type: Number, default: 1 },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    appliedOn: { type: String, default: '' },
    approvedBy: { type: String, default: '' },
    approvedOn: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    isHalfDay: { type: Boolean, default: false },
    halfDayType: {
      type: String,
      enum: ['First Half', 'Second Half', ''],
      default: '',
    },
    attachmentUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    balances: {
      type: Map,
      of: Number,
      default: {
        'Casual Leave': 8,
        'Sick Leave': 6,
        'Earned Leave': 12,
        'Emergency Leave': 3,
        'Other': 2,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Leave = mongoose.model('Leave', leaveSchema);
export const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
