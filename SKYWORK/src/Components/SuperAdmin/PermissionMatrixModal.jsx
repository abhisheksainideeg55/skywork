import React, { useState } from 'react';
import { X, Shield, Check, AlertCircle, Share2 } from 'lucide-react';
import { PERMISSION_CATEGORIES, ALL_PERMISSIONS } from '../../Services/rbacService.js';
import { updateUserPermissions } from '../../Services/userService.js';
import { useAuth } from '../../Context/AuthContext.jsx';

export const PermissionMatrixModal = ({ user, onClose, onSuccess }) => {
  const { currentUser, canDelegate } = useAuth();
  const [selectedPermissions, setSelectedPermissions] = useState(user.permissions || []);
  const [delegatablePermissions, setDelegatablePermissions] = useState(user.delegatablePermissions || []);
  const [error, setError] = useState('');

  const isActorSuperAdmin = currentUser.role === 'superadmin';
  const isTargetHR = user.role === 'hr';
  const isTargetSuperAdmin = user.role === 'superadmin';

  const handleTogglePermission = (permission) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        // If removing permission, also remove from delegatable
        setDelegatablePermissions(d => d.filter(p => p !== permission));
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleToggleDelegatable = (permission) => {
    setDelegatablePermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        // Must also ensure permission is granted
        if (!selectedPermissions.includes(permission)) {
          setSelectedPermissions(s => [...s, permission]);
        }
        return [...prev, permission];
      }
    });
  };

  const handleToggleCategory = (category, permissions) => {
    const allSelected = permissions.every(p => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !permissions.includes(p)));
      setDelegatablePermissions(prev => prev.filter(p => !permissions.includes(p)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...permissions])));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!isActorSuperAdmin && !canDelegate(selectedPermissions)) {
        throw new Error("Privilege Escalation Detected: You can only assign permissions that have been authorized and made delegatable by Super Admin.");
      }

      await updateUserPermissions(
        currentUser.id,
        currentUser.role,
        user.id || user.employeeId,
        selectedPermissions,
        isTargetHR ? delegatablePermissions : []
      );
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-xs">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Role Permission Matrix & Delegation</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Configuring access for <span className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</span> ({user.id} • <span className="uppercase">{user.role}</span>)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {isTargetSuperAdmin && (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-md flex items-start gap-3">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                Super Admins implicitly possess unrestricted system permissions across all modules and settings.
              </p>
            </div>
          )}

          {isActorSuperAdmin && isTargetHR && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
                <Share2 className="h-4 w-4 shrink-0 text-amber-600" />
                <span><strong>Delegation Flags:</strong> Check the "Allow Delegation" box to let HR grant that specific permission to Employees.</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => {
              const allSelected = permissions.every(p => selectedPermissions.includes(p));
              const someSelected = permissions.some(p => selectedPermissions.includes(p)) && !allSelected;

              return (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-850 shadow-xs">
                  <div 
                    className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                    onClick={() => !isTargetSuperAdmin && isActorSuperAdmin && handleToggleCategory(category, permissions)}
                  >
                    <span className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">{category}</span>
                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${allSelected ? 'bg-indigo-600 border-indigo-600' : someSelected ? 'bg-indigo-100 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                      {allSelected && <Check className="h-3 w-3 text-white" />}
                      {someSelected && <div className="h-1 w-1 rounded-full bg-indigo-600"></div>}
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {permissions.map(permission => {
                      const isSelected = selectedPermissions.includes(permission);
                      const isDelegatable = delegatablePermissions.includes(permission);

                      // For HR managing Employee: check if HR possesses this permission and if it is delegatable
                      const isDelegationRestricted = !isActorSuperAdmin && (
                        !currentUser.permissions?.includes(permission) ||
                        !currentUser.delegatablePermissions?.includes(permission)
                      );

                      return (
                        <div key={permission} className={`flex items-center justify-between p-1.5 rounded-lg text-xs ${isDelegationRestricted ? 'opacity-40 bg-gray-50 dark:bg-gray-800/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                          <label className={`flex items-center space-x-2.5 flex-1 ${isTargetSuperAdmin || isDelegationRestricted ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className={`font-mono ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                              {permission}
                            </span>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={isSelected}
                              disabled={isTargetSuperAdmin || isDelegationRestricted}
                              onChange={() => handleTogglePermission(permission)}
                            />
                          </label>

                          {/* Super Admin setting delegatable flag for HR */}
                          {isActorSuperAdmin && isTargetHR && (
                            <button
                              type="button"
                              onClick={() => handleToggleDelegatable(permission)}
                              title={isDelegatable ? "Allowed to delegate to staff" : "Cannot delegate to staff"}
                              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                                isDelegatable
                                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-600'
                              }`}
                            >
                              {isDelegatable ? 'Delegatable' : 'Locked'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isTargetSuperAdmin}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm flex items-center cursor-pointer"
          >
            <Shield className="h-4 w-4 mr-2" />
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};
