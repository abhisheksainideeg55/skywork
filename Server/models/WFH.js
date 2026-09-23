import mongoose from 'mongoose';

const wfhSchema = new mongoose.Schema(
  {
    wfhId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    wfhType: { type: String, default: 'Regular Remote Work' },
    duration: { type: String, default: 'Full Day' },
    isHalfDay: { type: Boolean, default: false },
    halfDayType: { type: String, default: '' },
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
    workPlan: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const WFH = mongoose.model('WFH', wfhSchema);
export default WFH;
