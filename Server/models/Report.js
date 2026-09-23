import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      default: 'Custom',
    },
    employeeId: { type: String, default: 'ALL' },
    employeeName: { type: String, default: 'All Company Workforce' },
    department: { type: String, default: 'All Departments' },
    format: { type: String, default: 'CSV / Excel' },
    fileSize: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    generatedBy: { type: String, default: '' },
    generatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      default: 'Completed',
    },
    description: { type: String, default: '' },
    dateRange: { type: String, default: '' },
    downloadCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
