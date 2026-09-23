import mongoose from 'mongoose';

const overtimeSchema = new mongoose.Schema(
  {
    overtimeId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    date: { type: String, required: true },
    regularHours: { type: Number, default: 8 },
    overtimeHours: { type: Number, required: true, min: 0.5 },
    hourlyRate: { type: Number, default: 500 },
    totalAmount: { type: Number, default: 0 },
    project: { type: String, default: 'General Tasks' },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: { type: String, default: '' },
    approvedAt: { type: Date },
    remarks: { type: String, default: '' },
    month: { type: String, default: '' },
    year: { type: Number, default: new Date().getFullYear() },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate total amount before save
overtimeSchema.pre('save', function (next) {
  this.totalAmount = this.overtimeHours * (this.hourlyRate || 500);
  if (!this.month) {
    const d = new Date(this.date || Date.now());
    this.month = d.toLocaleString('default', { month: 'long' });
    this.year = d.getFullYear();
  }
  next();
});

const Overtime = mongoose.model('Overtime', overtimeSchema);
export default Overtime;
