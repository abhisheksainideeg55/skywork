import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    logId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    userRole: { type: String, default: '' },
    userName: { type: String, default: '' },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetId: { type: String, default: '' },
    targetType: { type: String, default: '' },
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    description: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    module: {
      type: String,
      enum: ['auth', 'users', 'employees', 'attendance', 'leaves', 'wfh', 'shifts', 'breaks', 'salary', 'fines', 'documents', 'announcements', 'notifications', 'reports', 'settings', 'system'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
