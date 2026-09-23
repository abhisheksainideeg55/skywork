import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    category: {
      type: String,
      enum: ['general', 'attendance', 'leave', 'payroll', 'notifications', 'security', 'branding', 'system'],
      default: 'general',
    },
    label: { type: String, default: '' },
    description: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
