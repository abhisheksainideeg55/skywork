import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    holidayId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    day: { type: String, default: '' },
    type: {
      type: String,
      default: 'Company Holiday',
    },
    duration: { type: String, default: 'Full Day' },
    description: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    isOptional: { type: Boolean, default: false },
    applicableDepartments: { type: [String], default: ['All Departments'] },
    year: { type: Number, default: () => new Date().getFullYear() },
    createdBy: { type: String, default: 'HR Administrator' },
    createdByName: { type: String, default: 'HR Administrator' },
  },
  {
    timestamps: true,
  }
);

holidaySchema.index({ date: 1 });
holidaySchema.index({ year: 1 });

const Holiday = mongoose.model('Holiday', holidaySchema);
export default Holiday;

