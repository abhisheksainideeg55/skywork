import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema(
  {
    salaryId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, default: '' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    avatar: { type: String, default: '' },

    // Earnings
    baseSalary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    conveyanceAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },

    // Deductions
    pfDeduction: { type: Number, default: 0 },
    taxDeduction: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },

    // Net
    netSalary: { type: Number, default: 0 },
    annualCTC: { type: Number, default: 0 },

    // Payment
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Paid', 'On Hold', 'Failed'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Cheque', 'Cash', 'UPI'],
      default: 'Bank Transfer',
    },
    disbursementDate: { type: String, default: 'Pending (Scheduled)' },
    payslipGenerated: { type: Boolean, default: false },
    payrollMonth: { type: String, default: '' },
    payrollYear: { type: Number, default: new Date().getFullYear() },

    // Bank
    bankName: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },

    // Additional
    bonusAmount: { type: Number, default: 0 },
    fineDeductions: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    advanceDeduction: { type: Number, default: 0 },
    loanDeduction: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Recalculate before save
salarySchema.pre('save', function (next) {
  this.grossSalary = this.baseSalary + this.hra + this.specialAllowance +
    (this.conveyanceAllowance || 0) + (this.medicalAllowance || 0);
  this.totalDeductions = this.pfDeduction + this.taxDeduction + this.professionalTax +
    (this.fineDeductions || 0) + (this.advanceDeduction || 0) + (this.loanDeduction || 0);
  this.netSalary = this.grossSalary - this.totalDeductions + (this.bonusAmount || 0) + (this.overtimePay || 0);
  this.annualCTC = this.grossSalary * 12;
  next();
});

const Salary = mongoose.model('Salary', salarySchema);
export default Salary;
