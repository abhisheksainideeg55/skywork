import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AttendanceLayoutTabs from '../../../Components/Attendance/AttendanceLayoutTabs';
import {
  MapPin,
  Wifi,
  Shield,
  Radio,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Smartphone,
  Info,
} from 'lucide-react';
import { useAttendance } from '../../../Context/AttendanceContext';
import { useSmartAttendance } from '../../../Context/SmartAttendanceContext';

export default function SmartAttendance() {
  const { records } = useAttendance();
  const { config, offices, wifiConfigs } = useSmartAttendance();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter records
  const filteredRecords = useMemo(() => {
    return (records || []).filter((rec) => {
      const matchesSearch =
        (rec.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.empId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.department || '').toLowerCase().includes(searchTerm.toLowerCase());

      const isSmart = (rec.notes || '').toLowerCase().includes('smart');
      const matchesMethod =
        methodFilter === 'all' ||
        (methodFilter === 'smart' && isSmart) ||
        (methodFilter === 'manual' && !isSmart);

      const matchesStatus =
        statusFilter === 'all' ||
        (rec.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [records, searchTerm, methodFilter, statusFilter]);

  // Quick stats
  const smartCount = (records || []).filter((r) =>
    (r.notes || '').toLowerCase().includes('smart')
  ).length;
  const manualCount = (records || []).length - smartCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Role Layout Switcher Tabs */}
      <AttendanceLayoutTabs />

      {/* Attendance Module Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Link
          to="/hr/attendance"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Employee Attendance
        </Link>
        <Link
          to="/hr/attendance/smart"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-colors"
        >
          Smart Attendance
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>HR Management</span>
            <span>•</span>
            <span className="text-indigo-600 dark:text-indigo-400">Smart Attendance Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Smart Attendance Records
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor multi-factor GPS geofence & Wi-Fi verified employee attendance
          </p>
        </div>

        {/* Global Status Pill */}
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm self-start sm:self-auto">
          <Radio
            className={`h-4 w-4 ${
              config.enabled ? 'text-emerald-500 animate-pulse' : 'text-gray-400'
            }`}
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            System: {config.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {offices.length} Office(s)
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {records.length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total Attendance Records
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {smartCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Smart Auto Punches
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Radio className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {manualCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manual Punches
              </div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {wifiConfigs.length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active Office Wi-Fi Hubs
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Wifi className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-gray-700 dark:text-white py-1 px-2"
            >
              <option value="all">All Methods</option>
              <option value="smart">Smart Auto-Punch</option>
              <option value="manual">Manual Punch</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-gray-700 dark:text-white py-1 px-2"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Punch Method</th>
                <th className="px-5 py-3">Check-In</th>
                <th className="px-5 py-3">Check-Out</th>
                <th className="px-5 py-3">Worked Hours</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Notes & Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-slate-400 text-xs">
                    No attendance records found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isSmart = (rec.notes || '').toLowerCase().includes('smart');
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={rec.avatar}
                            alt={rec.name}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white text-xs">
                              {rec.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rec.empId} • {rec.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="px-5 py-3.5">
                        {isSmart ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Radio className="h-3 w-3 mr-1 animate-pulse" />
                            Smart Auto
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            <Smartphone className="h-3 w-3 mr-1 text-slate-400" />
                            Manual Punch
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                        {rec.checkIn || '--:--'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {rec.checkOut || '--:--'}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium">
                        {rec.workedHours || rec.workingHours || '--'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            rec.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : rec.status === 'Late'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {rec.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
