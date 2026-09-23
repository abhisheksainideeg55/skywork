import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, Shield, Eye, EyeOff, Lock, User, Mail, Building } from 'lucide-react';
import { createUser, getUsers } from '../../Services/userService.js';
import { useAuth } from '../../Context/AuthContext.jsx';
import { BASE_ROLE_PERMISSIONS, DEFAULT_HR_DELEGATABLE } from '../../Services/rbacService.js';

export const CreateUserModal = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const isHR = currentUser?.role === 'hr';
  
  const defaultDepartments = [
    "Engineering",
    "Human Resources",
    "Product & Design",
    "Sales & BD",
    "Administration",
    "Finance & Accounts",
    "Operations",
    "Marketing",
    "Customer Support"
  ];

  const [availableDepartments, setAvailableDepartments] = useState(defaultDepartments);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'employee',
    department: 'Engineering',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Collect all existing departments from current users in database
    const users = getUsers();
    const existingDepts = users.map(u => u.department).filter(Boolean);
    const combined = Array.from(new Set([...defaultDepartments, ...existingDepts]));
    setAvailableDepartments(combined);
  }, []);

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

    const finalDept = isCustomDept ? customDeptInput.trim() : formData.department;
    if (!finalDept) {
      setError("Please specify a valid department name.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Role enforcement
    const assignedRole = isHR ? 'employee' : formData.role;

    if (isHR && assignedRole !== 'employee') {
      setError("Privilege Restriction: HR Admin is only permitted to onboard Employee accounts.");
      return;
    }

    setLoading(true);

    try {
      await createUser(currentUser.id, currentUser.role, {
        id: formData.id ? formData.id.trim() : undefined,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: assignedRole,
        department: finalDept,
        password: formData.password || "Password@123",
        permissions: assignedRole === 'hr' ? BASE_ROLE_PERMISSIONS.hr : BASE_ROLE_PERMISSIONS.employee,
        delegatablePermissions: assignedRole === 'hr' ? DEFAULT_HR_DELEGATABLE : []
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {isHR ? "Create Employee" : "Create New User Account"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isHR 
                  ? "Generate Employee ID and credentials for new staff member." 
                  : "Create HR Admin or Employee account."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID Creation Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {isHR ? "Employee ID" : "User / Employee ID"}
                </label>
                <span className="text-[11px] text-gray-400 font-normal">Optional (auto-generates if blank)</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Shield className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono font-medium" 
                  placeholder={isHR ? "e.g. EMP045 (or leave empty for auto ID)" : "e.g. HR002, EMP045 (or leave empty)"} 
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                  placeholder="e.g. Rahul Verma" 
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                  placeholder="rahul@skywork.io" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role: Super Admin can choose HR Admin or Employee; HR Admin is locked to Employee */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Role</label>
                {isHR ? (
                  <div className="px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-750 text-gray-800 dark:text-gray-200 text-sm font-semibold flex items-center justify-between">
                    <span>Employee</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">Staff</span>
                  </div>
                ) : (
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                  >
                    <option value="hr">HR Admin</option>
                    <option value="employee">Employee</option>
                  </select>
                )}
              </div>

              {/* Department Selection with Custom Typing Support */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Department</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDept(!isCustomDept);
                      if (!isCustomDept) {
                        setFormData({ ...formData, department: customDeptInput || '' });
                      } else {
                        setFormData({ ...formData, department: availableDepartments[0] || 'Engineering' });
                      }
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    {isCustomDept ? "Choose from list" : "+ Type custom"}
                  </button>
                </div>

                {!isCustomDept ? (
                  <select 
                    name="departmentSelect" 
                    value={formData.department} 
                    onChange={handleChange} 
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                  >
                    {availableDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="__custom__">+ Other / Custom Department...</option>
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customDeptInput}
                      onChange={handleCustomDeptChange}
                      placeholder="e.g. AI Research / DevOps"
                      className="w-full px-3.5 py-2.5 border border-indigo-300 dark:border-indigo-500 rounded-xl bg-indigo-50/40 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Initial Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                  placeholder="•••••••• (min 6 characters)" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The employee will use this password to sign in securely.</p>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? "Creating..." : isHR ? "Create Employee" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
