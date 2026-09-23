import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    announcementId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    summary: { type: String, default: '' },
    category: {
      type: String,
      default: 'Company Policy & Guidelines',
    },
    priority: {
      type: String,
      default: 'General',
    },
    targetAudience: {
      type: String,
      default: 'All Employees',
    },
    targetDepartments: { type: [String], default: [] },
    createdBy: { type: String, default: '' },
    createdByName: { type: String, default: 'HR Admin' },
    authorRole: { type: String, default: 'HR Operations' },
    authorAvatar: { type: String, default: '' },
    publishDate: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: { type: String, default: 'Published' },
    acknowledgeRequired: { type: Boolean, default: false },
    acknowledgedBy: { type: [String], default: [] },
    attachments: { type: [mongoose.Schema.Types.Mixed], default: [] },
    viewsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
