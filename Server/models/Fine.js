import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema(
  {
    fineId: { type: String, required: true, unique: true, index: true },
    fineNumber: { type: String, default: '' },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    category: {
      type: String,
      enum: ['late_arrival', 'absence', 'policy_violation', 'asset_damage', 'disciplinary', 'security_breach', 'other'],
      required: true,
    },
    categoryLabel: { type: String, default: '' },
    amount: { type: Number, required: true },
    incidentDate: { type: String, default: '' },
    effectiveMonth: { type: String, default: '' },
    reason: { type: String, default: '' },
    remarks: { type: String, default: '' },
    imposedBy: { type: String, default: '' },
    imposedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Applied', 'Waived', 'Cancelled'],
      default: 'Pending',
    },
    waiverReason: { type: String, default: '' },
    waivedBy: { type: String, default: '' },
    waivedAt: { type: Date },
    notifyEmployee: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Fine = mongoose.model('Fine', fineSchema);
export default Fine;
