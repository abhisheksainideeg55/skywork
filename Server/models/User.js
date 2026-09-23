import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    employeeName: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      default: 'employee',
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    delegatablePermissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String,
      default: 'General',
    },
    designation: {
      type: String,
      default: 'Staff Employee',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Active',
    },
    lastLogin: {
      type: Date,
    },

    // Personal Details
    dateOfBirth: { type: String, default: '' },
    dob: { type: String, default: '' },
    age: { type: Number, default: 26 },
    gender: { type: String, default: '' },
    maritalStatus: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    nationality: { type: String, default: 'Indian' },

    // Contact & Address
    address: { type: String, default: '' },
    currentAddress: { type: String, default: '' },
    permanentAddress: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    emergencyContactName: { type: String, default: '' },
    emergencyContactPhone: { type: String, default: '' },
    emergencyContactRelation: { type: String, default: '' },

    // Employment Details
    joiningDate: { type: String, default: '' },
    employmentType: {
      type: String,
      default: 'Full-Time',
    },
    reportingManager: { type: String, default: '' },
    workLocation: { type: String, default: 'HQ Office' },
    shift: { type: String, default: 'Day Shift' },

    // KYC & Documents
    aadhaarNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    passportNumber: { type: String, default: '' },
    uan: { type: String, default: '' },
    esicNumber: { type: String, default: '' },
    kycStatus: { type: String, default: 'Verified' },

    // Bank Details
    bankName: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankBranch: { type: String, default: '' },

    // ID Card
    idCardIssued: { type: Boolean, default: true },
    idCardIssueDate: { type: String, default: '' },
    idCardExpiry: { type: String, default: '' },
    idCardTheme: { type: String, default: 'indigo' },
    accessLevel: { type: String, default: 'Standard' },
    parkingAllotment: { type: String, default: 'None' },
    cardType: { type: String, default: 'Standard Employee' },
    securityClearance: { type: String, default: 'Level 1 – General' },

    // Education
    education: [
      {
        degree: String,
        institution: String,
        year: String,
        grade: String,
      },
    ],

    // Skills & Certifications
    skills: [String],
    certifications: [String],
  },
  {
    timestamps: true,
  }
);

// Synchronize name and employeeName before saving
userSchema.pre('save', async function (next) {
  if (this.employeeName && !this.name) {
    this.name = this.employeeName;
  } else if (this.name && !this.employeeName) {
    this.employeeName = this.name;
  }

  if (!this.isModified('passwordHash') || (this.passwordHash && this.passwordHash.startsWith('$2'))) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.salt = salt;
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.salt;
  if (!obj.name) obj.name = obj.employeeName;
  if (!obj.employeeName) obj.employeeName = obj.name;
  return obj;
};

// Text index for search
userSchema.index({ name: 'text', employeeName: 'text', email: 'text', department: 'text' });

const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
export default User;
