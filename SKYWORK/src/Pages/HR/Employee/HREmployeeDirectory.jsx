import React, { useState, useEffect } from "react";
import { Search, Plus, Shield, User, Filter, UserCheck, AlertCircle, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { getUsers, fetchUsers, toggleUserStatus, deleteUser } from "../../../Services/userService.js";
import { useAuth } from "../../../Context/AuthContext.jsx";
import { PermissionMatrixModal } from "../../../Components/SuperAdmin/PermissionMatrixModal.jsx";
import { CreateUserModal } from "../../../Components/SuperAdmin/CreateUserModal.jsx";
import { EditUserModal } from "../../../Components/SuperAdmin/EditUserModal.jsx";
import EmployeeLayoutTabs from "../../../Components/Employee/EmployeeLayoutTabs.jsx";

export default function HREmployeeDirectory() {
  const { currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadEmployees = async () => {
    // 1. Instant cache load
    const allUsers = getUsers();
    setUsers(allUsers.filter(u => u.role === "employee"));

    // 2. Authoritative backend fetch from MongoDB
    try {
      const fresh = await fetchUsers();
      if (fresh && Array.isArray(fresh)) {
        setUsers(fresh.filter(u => u.role === "employee"));
      }
    } catch (err) {
      console.error("Failed to fetch fresh employees:", err);
    }
  };

  useEffect(() => {
    loadEmployees();

    const handleUsersChanged = (e) => {
      const freshUsers = e?.detail?.users || getUsers();
      setUsers(freshUsers.filter(u => u.role === "employee"));
    };

    window.addEventListener('skywork_users_changed', handleUsersChanged);
    return () => {
      window.removeEventListener('skywork_users_changed', handleUsersChanged);
    };
  }, []);

  const filteredEmployees = users.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === "all" || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleManagePermissions = (emp) => {
    setSelectedUser(emp);
    setShowPermissionModal(true);
  };

  const handleEditEmployee = (emp) => {
    setEmployeeToEdit(emp);
    setShowEditModal(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteUser(
        currentUser?.id,
        currentUser?.role,
        employeeToDelete.id || employeeToDelete.employeeId,
        employeeToDelete.email
      );
      setEmployeeToDelete(null);
      await loadEmployees();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200/80 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full">
            Staff & Permissions Management
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Employee Directory & Permission Delegation
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage staff accounts, credentials, and delegate access permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Employee
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-slate-200/80 dark:border-gray-700 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee by name, ID or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Sales & BD">Sales & BD</option>
            <option value="Administration">Administration</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Assigned Permissions</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-750/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{emp.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{emp.id} • {emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{emp.department}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{emp.permissions?.length || 0}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">active permissions</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      emp.isActive 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditEmployee(emp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition-colors cursor-pointer"
                      title="Edit Employee ID & Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManagePermissions(emp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Permissions</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmployeeToDelete(emp)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                      title="Delete Employee Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            No employees found matching your search.
          </div>
        )}
      </div>

      {/* Delete Employee Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/50 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Employee Account</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to permanently delete employee <strong className="text-gray-900 dark:text-white">{employeeToDelete.name}</strong> (<code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{employeeToDelete.id}</code>)?
            </p>
            <p className="text-xs text-rose-500 mt-2 font-medium">
              This action will remove the employee from the company staff directory and revoke all assigned permissions.
            </p>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEmployee}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {showPermissionModal && selectedUser && (
        <PermissionMatrixModal
          user={selectedUser}
          onClose={() => setShowPermissionModal(false)}
          onSuccess={() => {
            setShowPermissionModal(false);
            loadEmployees();
          }}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadEmployees();
          }}
        />
      )}

      {showEditModal && employeeToEdit && (
        <EditUserModal
          user={employeeToEdit}
          onClose={() => {
            setShowEditModal(false);
            setEmployeeToEdit(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEmployeeToEdit(null);
            loadEmployees();
          }}
        />
      )}
    </div>
  );
}
