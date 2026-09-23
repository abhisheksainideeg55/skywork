import React, { useState } from 'react';
import { Settings, Shield, Lock, Bell, Save } from 'lucide-react';
import { logAction } from '../../Services/auditService.js';
import { useAuth } from '../../Context/AuthContext.jsx';

export const SuperAdminSettings = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    sessionTimeout: '8', // hours
    passwordMinLength: '8',
    requireSpecialChar: true,
    allowDelegation: true,
    mfaEnabled: false,
    auditRetention: '90', // days
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    logAction(currentUser.id, currentUser.role, "UPDATE_SETTINGS", null, null, settings, "Updated system security settings");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Settings className="h-6 w-6 text-indigo-500 mr-2" />
          System Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure global security policies, session rules, and system behavior.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center">
             <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
             <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security & Authentication</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Global Session Timeout (Hours)</label>
                <select 
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="1">1 Hour</option>
                  <option value="4">4 Hours</option>
                  <option value="8">8 Hours</option>
                  <option value="24">24 Hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Password Length</label>
                <input 
                  type="number" 
                  min="8" max="32"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({...settings, passwordMinLength: e.target.value})}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    checked={settings.requireSpecialChar}
                    onChange={(e) => setSettings({...settings, requireSpecialChar: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700 dark:text-gray-300">Require Special Characters</label>
                  <p className="text-gray-500 dark:text-gray-400">Passwords must contain at least one special character (!@#$%^&*).</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    checked={settings.mfaEnabled}
                    onChange={(e) => setSettings({...settings, mfaEnabled: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700 dark:text-gray-300">Enforce Multi-Factor Authentication (MFA)</label>
                  <p className="text-gray-500 dark:text-gray-400">Require administrative users to use authenticator apps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RBAC Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center">
             <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
             <h3 className="text-lg font-medium text-gray-900 dark:text-white">Role-Based Access Control</h3>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowDelegation}
                    onChange={(e) => setSettings({...settings, allowDelegation: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700 dark:text-gray-300">Allow HR Sub-Delegation to Employees</label>
                  <p className="text-gray-500 dark:text-gray-400">If enabled, HR Admin can delegate permitted and delegatable permissions to Employees.</p>
                </div>
              </div>
          </div>
        </div>
        
        {/* Audit Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center">
             <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
             <h3 className="text-lg font-medium text-gray-900 dark:text-white">Audit & Compliance</h3>
          </div>
          <div className="p-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audit Log Retention Policy (Days)</label>
                <select 
                  value={settings.auditRetention}
                  onChange={(e) => setSettings({...settings, auditRetention: e.target.value})}
                  className="block w-full max-w-xs rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">6 Months</option>
                  <option value="365">1 Year</option>
                  <option value="infinite">Retain Indefinitely</option>
                </select>
              </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
           <button 
             type="submit"
             className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
           >
             <Save className="h-5 w-5 mr-2" />
             Save Configurations
           </button>
           {saved && <span className="ml-4 flex items-center text-green-600 text-sm font-medium">Saved successfully!</span>}
        </div>

      </form>
    </div>
  );
};
