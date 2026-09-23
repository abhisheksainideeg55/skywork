import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    documentName: { type: String, required: true },
    category: { type: String, default: 'Identity & KYC' },
    documentType: {
      type: String,
      default: 'Other',
    },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    fileFormat: { type: String, default: 'PDF' },
    docNumber: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    uploadedBy: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      default: 'Pending Review',
    },
    verifiedBy: { type: String, default: '' },
    verifiedAt: { type: Date },
    expiryDate: { type: String, default: 'Permanent' },
    remarks: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;
