import React, { useState, useEffect } from 'react';
import { X, Edit3, Shield, AlertCircle, Eye, EyeOff, Lock, User, Mail, Building, KeyRound, CheckCircle2 } from 'lucide-react';
import { updateUser, getUsers } from '../../Services/userService.js';
import { useAuth } from '../../Context/AuthContext.jsx';

export const EditUserModal = ({ user, onClose, onSuccess }) => {
  const { currentUser, refreshUser } = useAuth();

  const defaultDepartments = [
    "Administration",
    "Engineering",
    "Human Resources",
    "Product & Design",
    "Sales & BD",
    "Finance & Accounts",
    "Operations",
    "Marketing",
    "Customer Support"
  ];

  const [availableDepartments, setAvailableDepartments] = useState(defaultDepartments);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState('');

  const [formData, setFormData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'employee',
    department: user?.department || 'Engineering',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      const users = getUsers();
      const existingDepts = users.map(u => u.department).filter(Boolean);
      const combined = Array.from(new Set([...defaultDepartments, ...existingDepts]));
      setAvailableDepartments(combined);

      const isCustom = !defaultDepartments.includes(user.department) && !!user.department;
      setIsCustomDept(isCustom);
      if (isCustom) setCustomDeptInput(user.department);

      setFormData({
        id: user.id || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'employee',
        department: user.department || 'Engineering',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'departmentSelect') {
      if (value === '__custom__') {
        setIsCustomDept(true);
        setFormData({ ...formData, department: customDeptInput || '' });
      } else {
        setIsCustomDept(false);
        setFormData({ ...formData, department: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCustomDeptChange = (e) => {
    const val = e.target.value;
    setCustomDeptInput(val);
    setFormData({ ...formData, department: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const finalId = formData.id.trim();
    const finalName = formData.name.trim();
    const finalEmail = formData.email.trim();
    const finalDept = isCustomDept ? customDeptInput.trim() : formData.department;

    if (!finalId) {
      setError("User ID is required.");
      return;
    }
    if (!finalName) {
      setError("Full Name is required.");
      return;
    }
    if (!finalEmail) {
      setError("Email address is required.");
      return;
    }
    if (!finalDept) {
      setError("Department is required.");
      return;
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("New password and confirm password do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      await updateUser(currentUser.id, currentUser.role, user.id || user.employeeId, {
        id: finalId,
        name: finalName,
        email: finalEmail,
        department: finalDept,
        role: formData.role,
        password: formData.password
      });

      if (currentUser.id === user.id || currentUser.id === finalId) {
        refreshUser();
      }

      setSuccessMsg("User profile and credentials updated successfully!");
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit User Credentials & ID</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update User ID, password, details and role assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 p-3.5 rounded-lg flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs sm:text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500 p-3.5 rounded-lg flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* User ID Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              User ID <span className="text-indigo-500 font-normal lowercase">(unique identifier)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Shield className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="id"
                required
                value={formData.id}
                onChange={handleChange}
                placeholder="e.g. SA001, HR001, EMP001"
                className="pl-9 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono font-semibold"
              />
            </div>
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Abhishek Sharma"
                className="pl-9 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Email Address Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="user@skywork.io"
                className="pl-9 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Role & Department Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                System Role
              </label>
              {currentUser?.role === 'hr' ? (
                <div className="px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-750 text-gray-800 dark:text-gray-200 text-sm font-semibold flex items-center justify-between">
                  <span>Employee</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">Staff</span>
                </div>
              ) : (
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="superadmin">Super Admin (Root)</option>
                  <option value="hr">HR Admin (Delegated)</option>
                  <option value="employee">Employee (Standard)</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                name="departmentSelect"
                value={isCustomDept ? '__custom__' : formData.department}
                onChange={handleChange}
                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
                <option value="__custom__">+ Add Custom Department</option>
              </select>
            </div>
          </div>

          {isCustomDept && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Custom Department Name
              </label>
              <input
                type="text"
                required
                value={customDeptInput}
                onChange={handleCustomDeptChange}
                placeholder="Enter new department name"
                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Password Section */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-2">
              <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Update Password
              </label>
              <span className="text-[11px] text-gray-400 font-normal">(Leave blank to keep unchanged)</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password (min 6 chars)"
                    className="pl-9 pr-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {formData.password && (
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="pl-9 pr-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
