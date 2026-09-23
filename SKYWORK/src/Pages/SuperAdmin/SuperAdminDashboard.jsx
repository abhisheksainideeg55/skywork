import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, Shield, Activity, 
  Calendar, Clock, DollarSign, CheckCircle2, 
  AlertTriangle, FileText, ArrowUpRight, TrendingUp, Layers
} from 'lucide-react';
import { getUsers } from '../../Services/userService.js';
import { getAuditLogs } from '../../Services/auditService.js';
import { Link } from 'react-router-dom';
import PunchInOutCard from '../../Components/Attendance/PunchInOutCard';
import SmartAttendanceWidget from '../../Components/SmartAttendance/SmartAttendanceWidget';

export const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    hr: 0,
    employee: 0,
    superadmin: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const users = getUsers() || [];
      setStats({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
        hr: users.filter(u => u.role === 'hr').length,
        employee: users.filter(u => u.role === 'employee').length,
        superadmin: users.filter(u => u.role === 'superadmin').length
      });

      try {
        const logs = await getAuditLogs();
        if (Array.isArray(logs)) {
          setRecentLogs(logs.slice(0, 8));
        }
      } catch (e) {
        console.error("Failed to load audit logs:", e);
      }
    };

    loadData();
  }, []);

  const systemOverviewCards = [
    { name: 'Total System Users', value: stats.total, icon: Users, color: 'bg-blue-500', detail: `${stats.active} Active accounts` },
    { name: 'HR Administrators', value: stats.hr, icon: Shield, color: 'bg-indigo-500', detail: 'Authorized delegates' },
    { name: 'Total Employees', value: stats.employee, icon: UserCheck, color: 'bg-emerald-500', detail: 'Personnel registered' },
    { name: 'Inactive / Suspended', value: stats.inactive, icon: UserX, color: 'bg-rose-500', detail: 'Requires review' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-850 to-purple-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" /> Full Root Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Super Admin Executive Dashboard</h1>
          <p className="mt-1 text-sm text-indigo-200 max-w-2xl">
            Central command center for User Management, Role-Based Access Control, Attendance & Team oversight, Payroll, and Security Audit trails.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link 
            to="/super-admin/users"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-900 bg-white hover:bg-indigo-50 shadow-md transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Link>
          <Link 
            to="/super-admin/audit"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-500/30 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 mr-2" />
            Security Logs
          </Link>
        </div>
      </div>

      {/* Smart Attendance Live Status Widget */}
      <SmartAttendanceWidget />

      {/* Punch In / Punch Out Card */}
      <PunchInOutCard />

      {/* 1. System Overview KPIs */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          1. System & User Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {systemOverviewCards.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {stat.detail}
                </span>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</p>
              <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Migrated Operations & Team Oversight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance & Shift Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Attendance & Shifts
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Live Today
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-300">Present (On-Time)</span>
              <span className="font-bold text-gray-900 dark:text-white">94.8% (457)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94.8%' }}></div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750">
                <p className="text-gray-400 font-medium">Late In</p>
                <p className="text-base font-bold text-amber-600">8 Staff</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750">
                <p className="text-gray-400 font-medium">On Leave</p>
                <p className="text-base font-bold text-rose-500">25 Staff</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750">
                <p className="text-gray-400 font-medium">WFH Active</p>
                <p className="text-base font-bold text-indigo-600">42 Staff</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Approvals & Pipeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Leave & WFH Requests
            </h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm p-2 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/40">
              <span className="text-amber-800 dark:text-amber-300 font-medium text-xs">Pending Approvals</span>
              <span className="font-bold text-amber-900 dark:text-amber-200">6 Requests</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/40">
              <span className="text-emerald-800 dark:text-emerald-300 font-medium text-xs">Approved This Month</span>
              <span className="font-bold text-emerald-900 dark:text-emerald-200">58 Leaves</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 rounded-xl bg-rose-50/60 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/40">
              <span className="text-rose-800 dark:text-rose-300 font-medium text-xs">Rejected Requests</span>
              <span className="font-bold text-rose-900 dark:text-rose-200">3 Requests</span>
            </div>
          </div>
        </div>

        {/* Salary & Payroll Highlights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Salary & Payroll
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
              September 2026
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">Estimated Monthly Payroll</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">$384,500.00</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-750">
                <p className="text-gray-400">Salary Changes</p>
                <p className="font-bold text-gray-800 dark:text-gray-200">+12 Increments</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-750">
                <p className="text-gray-400">Payroll Status</p>
                <p className="font-bold text-emerald-600">100% Prepared</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Role Hierarchy & Live Audit Trails */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Final 3-Role Architecture</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Enforced system role boundaries & distribution.</p>
          
          <div className="space-y-4">
             <div>
               <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">1. Super Admins (Root)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.superadmin} ({((stats.superadmin/stats.total)*100 || 0).toFixed(0)}%)</span>
               </div>
               <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                 <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(stats.superadmin/stats.total)*100}%` }}></div>
               </div>
             </div>
             
             <div>
               <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">2. HR Admins (Delegates)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.hr} ({((stats.hr/stats.total)*100 || 0).toFixed(0)}%)</span>
               </div>
               <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                 <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(stats.hr/stats.total)*100}%` }}></div>
               </div>
             </div>

             <div>
               <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">3. Employees (Staff)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.employee} ({((stats.employee/stats.total)*100 || 0).toFixed(0)}%)</span>
               </div>
               <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                 <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.employee/stats.total)*100}%` }}></div>
               </div>
             </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-[11px] leading-relaxed">
              <span className="font-bold text-indigo-900 dark:text-indigo-200">Hierarchical Flow:</span> Super Admin delegates to HR Admin with explicit <code className="font-bold">delegatable</code> flags; HR assigns to Employees from authorized subset.
            </div>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                Live Security & Operations Audit Logs
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Unalterable system log of permissions, salary, logins and role changes.</p>
            </div>
            <Link to="/super-admin/audit" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
              View all &rarr;
            </Link>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-gray-100 dark:divide-gray-750">
              {recentLogs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {log.action}
                        </span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold truncate">
                          {log.actorRole?.toUpperCase()} ({log.actorUserId})
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {log.reason || `Target: ${log.targetUserId}`}
                      </p>
                    </div>
                    <div className="text-[11px] text-gray-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </li>
              ))}
              {recentLogs.length === 0 && (
                <li className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No security audit records logged yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
