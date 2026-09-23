import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../Services/auditService.js';
import { Search, Shield, History, Clock } from 'lucide-react';

export const SuperAdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLogs();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (e) {
        console.error("Failed to load audit logs:", e);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const searchString = `${log.actorUserId} ${log.targetUserId} ${log.reason} ${log.action}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Shield className="h-6 w-6 text-indigo-500 mr-2" />
          Security Audit Logs
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Immutable record of all critical system actions, permission changes, and authentications.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, action, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason/Context</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                       <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                       {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{log.actorUserId}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs capitalize">{log.actorRole}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                    {log.targetUserId || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">{log.reason || '-'}</span>
                    {log.action === 'UPDATE_PERMISSIONS' && (
                        <details className="mt-1">
                            <summary className="text-xs text-indigo-600 cursor-pointer">View Diff</summary>
                            <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-950 p-2 rounded overflow-x-auto">
                                <pre>Old: {JSON.stringify(log.previousValue, null, 2)}</pre>
                                <pre className="mt-1">New: {JSON.stringify(log.newValue, null, 2)}</pre>
                            </div>
                        </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center text-gray-500 dark:text-gray-400">
              <History className="h-10 w-10 text-gray-400 mb-3" />
              <p>No audit logs found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
