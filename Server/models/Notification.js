import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    notificationId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    type: {
      type: String,
      default: 'info',
    },
    category: { type: String, default: 'General' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    actionUrl: { type: String, default: '' },
    senderName: { type: String, default: 'System' },
    senderId: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ employeeId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
