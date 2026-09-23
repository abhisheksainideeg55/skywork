import React, { useState } from "react";
import {
  FiX,
  FiSave,
  FiUser,
  FiCreditCard,
  FiPhone,
  FiMail,
  FiHome,
  FiDroplet,
  FiCalendar,
  FiShield,
  FiCamera,
} from "react-icons/fi";
import { useEmployee } from "../../../Context/EmployeeContext";

export default function UpdateKycDetailsModal({ employee, onClose, onSaved }) {
  const { updateEmployeeProfile } = useEmployee();

  const [avatar, setAvatar] = useState(employee?.avatar || "");
  const [employeeName, setEmployeeName] = useState(employee?.employeeName || "");
  const [role, setRole] = useState(employee?.role || "");
  const [department, setDepartment] = useState(employee?.department || "Engineering");
  const [aadhaarNumber, setAadhaarNumber] = useState(employee?.aadhaarNumber || "");
  const [panNumber, setPanNumber] = useState(employee?.panNumber || "");
  const [mobileNumber, setMobileNumber] = useState(employee?.mobileNumber || "");
  const [emergencyContact, setEmergencyContact] = useState(employee?.emergencyContact || "");
  const [email, setEmail] = useState(employee?.email || "");
  const [bankName, setBankName] = useState(employee?.bankName || "HDFC Bank");
  const [accountNumber, setAccountNumber] = useState(employee?.accountNumber || "");
  const [ifscCode, setIfscCode] = useState(employee?.ifscCode || "");
  const [age, setAge] = useState(employee?.age || 27);
  const [dob, setDob] = useState(employee?.dob || "14 Aug 1999");
  const [bloodGroup, setBloodGroup] = useState(employee?.bloodGroup || "O+");
  const [address, setAddress] = useState(employee?.address || "");

  if (!employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      avatar,
      employeeName,
      role,
      department,
      aadhaarNumber,
      panNumber,
      mobileNumber,
      emergencyContact,
      email,
      bankName,
      accountNumber,
      ifscCode,
      age: Number(age),
      dob,
      bloodGroup,
      address,
    };

    updateEmployeeProfile(employee.employeeId, updatedData);
    if (onSaved) onSaved(updatedData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <FiUser className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Update Employee KYC & Identity Details
              </h3>
              <p className="text-xs text-slate-300">
                {employee.employeeName} • {employee.employeeId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Profile Photo & Basic Identity */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiCamera className="text-indigo-600" />
              <span>1. Profile Photo & Core Information</span>
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-3">
              <img
                src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt="Preview"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-xs"
              />
              <div className="flex-1 w-full space-y-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  placeholder="Paste image URL or use default avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Aadhaar & PAN Card KYC */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiShield className="text-indigo-600" />
              <span>2. Statutory Identity Proofs (Aadhaar & PAN)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Aadhaar Card Number (12 Digits) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4589 1234 5678"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  PAN Card Number (10 Characters) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABCPS1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Emergency Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiPhone className="text-indigo-600" />
              <span>3. Contact & Emergency Helpline</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Primary Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Official Email ID *
                </label>
                <input
                  type="email"
                  required
                  placeholder="abhishek@skywork.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Emergency Contact (Phone & Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 91234 56789 (Father)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiCreditCard className="text-indigo-600" />
              <span>4. Bank Account & Payroll Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Age, Blood Group & Address */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiHome className="text-indigo-600" />
              <span>5. Demographics & Residential Address</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="18"
                  max="70"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Date of Birth
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Aug 1999"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Blood Group *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Permanent / Residential Address *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Full residential address including city, state and PIN code..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <FiSave className="w-4 h-4" />
              <span>Save & Update ID Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
