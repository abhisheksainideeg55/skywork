import React, { useState, useEffect } from 'react';
import { getUsers, fetchUsers, toggleUserStatus, deleteUser } from '../../Services/userService.js';
import { Search, Plus, Filter, MoreVertical, Edit3, Shield, Power, PowerOff, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext.jsx';
import { CreateUserModal } from '../../Components/SuperAdmin/CreateUserModal.jsx';
import { EditUserModal } from '../../Components/SuperAdmin/EditUserModal.jsx';
import { PermissionMatrixModal } from '../../Components/SuperAdmin/PermissionMatrixModal.jsx';

export const SuperAdminUserManagement = () => {
  const { currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const loadUsers = async () => {
    // 1. Instant cache load
    setUsers(getUsers());
    // 2. Authoritative backend fetch from MongoDB
    try {
      const fresh = await fetchUsers();
      if (fresh && Array.isArray(fresh)) {
        setUsers(fresh);
      }
    } catch (err) {
      console.error("Failed to fetch fresh users:", err);
    }
  };

  useEffect(() => {
    loadUsers();

    const handleUsersChanged = (e) => {
      if (e?.detail?.users) {
        setUsers(e.detail.users);
      } else {
        setUsers(getUsers());
      }
    };

    window.addEventListener('skywork_users_changed', handleUsersChanged);
    return () => {
      window.removeEventListener('skywork_users_changed', handleUsersChanged);
    };
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatus(currentUser.id, currentUser.role, user.id || user.employeeId, !user.isActive);
      await loadUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleManagePermissions = (user) => {
    setSelectedUser(user);
    setShowPermissionModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(
        currentUser?.id,
        currentUser?.role,
        userToDelete.id || userToDelete.employeeId,
        userToDelete.email
      );
      setUserToDelete(null);
      await loadUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && user.isActive) || 
                          (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User & Permission Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create, edit, manage and delete user accounts across the system.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors cursor-pointer"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles (3 Roles)</option>
              <option value="superadmin">Super Admin</option>
              <option value="hr">HR Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col space-y-3">
             <div className="flex justify-between items-start">
               <div>
                 <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">{user.id} • {user.email}</p>
               </div>
               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
               </span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300 capitalize font-medium">{user.role === 'superadmin' ? 'Super Admin' : user.role === 'hr' ? 'HR Admin' : 'Employee'}</span>
                <span className="text-gray-500 dark:text-gray-400">{user.department}</span>
             </div>
             <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => handleEditUser(user)} 
                  className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 p-2 rounded cursor-pointer"
                  title="Edit Credentials & ID"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleManagePermissions(user)} 
                  className="text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30 p-2 rounded cursor-pointer"
                  title="Manage Permissions"
                >
                  <Shield className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleToggleStatus(user)} 
                  className={`${user.isActive ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400' : 'text-green-600 hover:bg-green-50 dark:text-green-400'} p-2 rounded cursor-pointer`}
                  title={user.isActive ? "Deactivate User" : "Activate User"}
                >
                  {user.isActive ? <PowerOff className="h-5 w-5" /> : <Power className="h-5 w-5" />}
                </button>
                {user.role === 'superadmin' ? (
                  <span 
                    className="p-2 text-gray-300 dark:text-gray-600 inline-flex items-center cursor-not-allowed" 
                    title="Super Admin is protected (Cannot delete)"
                  >
                    <Lock className="h-5 w-5 text-purple-400 dark:text-purple-500" />
                  </span>
                ) : (
                  <button
                    onClick={() => setUserToDelete(user)}
                    className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 p-2 rounded cursor-pointer"
                    title="Delete User"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
             </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[220px]">User</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">Role & Dept</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">Permissions</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">Status</th>
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.id} • {user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white capitalize font-semibold">
                    {user.role === 'superadmin' ? 'Super Admin' : user.role === 'hr' ? 'HR Admin' : 'Employee'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'superadmin' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Full Root Authority
                    </span>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{user.permissions?.length || 0}</span> granted
                      {user.role === 'hr' && (
                        <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
                          ({user.delegatablePermissions?.length || 0} delegatable)
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1.5">
                  <button 
                    onClick={() => handleEditUser(user)} 
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center" 
                    title="Edit Credentials & ID"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleManagePermissions(user)} 
                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center" 
                    title={user.role === 'superadmin' ? 'View Root Authority' : 'Manage Permissions'}
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                  {user.role !== 'superadmin' && (
                    <button 
                      onClick={() => handleToggleStatus(user)} 
                      className={`${user.isActive ? 'text-amber-600 hover:text-amber-800 dark:text-amber-400' : 'text-green-600 hover:text-green-800 dark:text-green-400'} p-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer inline-flex items-center`} 
                      title={user.isActive ? "Deactivate User" : "Activate User"}
                    >
                      {user.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </button>
                  )}
                  {user.role === 'superadmin' ? (
                    <span 
                      className="p-1.5 text-purple-600 dark:text-purple-400 inline-flex items-center cursor-not-allowed text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 rounded-lg px-2 py-1" 
                      title="Super Admin is Root Protected (Cannot be deleted, only edited)"
                    >
                      <Lock className="h-3.5 w-3.5 mr-1 text-purple-600 dark:text-purple-400" />
                      Protected
                    </span>
                  ) : (
                    <button 
                      onClick={() => setUserToDelete(user)} 
                      className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center" 
                      title="Delete User Permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No users found matching the current filters.
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/50 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User Account</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">{userToDelete.name}</strong> (<code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{userToDelete.id}</code>)?
            </p>
            <p className="text-xs text-rose-500 mt-2 font-medium">
              This action will remove the user profile from the database and record a deletion audit entry.
            </p>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); loadUsers(); }}
        />
      )}

      {showEditModal && userToEdit && (
        <EditUserModal
          user={userToEdit}
          onClose={() => { setShowEditModal(false); setUserToEdit(null); }}
          onSuccess={() => { setShowEditModal(false); setUserToEdit(null); loadUsers(); }}
        />
      )}
      
      {showPermissionModal && selectedUser && (
        <PermissionMatrixModal
          user={selectedUser}
          onClose={() => setShowPermissionModal(false)}
          onSuccess={() => { setShowPermissionModal(false); loadUsers(); }}
        />
      )}
    </div>
  );
};
