import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { Shield, Users, Activity, Settings, LogOut, Menu, X, Key, ChevronRight, Briefcase, User, MapPin, Calendar, Home } from 'lucide-react';
import ProfileMenu from '../Components/Header/ProfileMenu.jsx';

export const SuperAdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/super-admin', icon: Activity },
    { name: 'Smart Attendance', path: '/super-admin/smart-attendance', icon: MapPin },
    { name: 'Leave & Approvals', path: '/super-admin/leaves', icon: Calendar },
    { name: 'Remote & WFH', path: '/super-admin/wfh', icon: Home },
    { name: 'User Management', path: '/super-admin/users', icon: Users },
    { name: 'Roles & Permissions', path: '/super-admin/roles', icon: Key },
    { name: 'Security Audit Logs', path: '/super-admin/audit', icon: Shield },
    { name: 'System Settings', path: '/super-admin/settings', icon: Settings },
  ];

  const adminProfile = {
    name: currentUser?.name || "Super Admin",
    role: "Super Admin",
    email: currentUser?.email || "superadmin@skywork.io",
    portalBadge: "Super Admin",
    brandHome: "/super-admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    id: currentUser?.id || "SA001"
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-950 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col h-full shrink-0 border-r border-indigo-800/80 shadow-2xl md:shadow-none overflow-hidden`}
      >
        {/* Top Header / Logo Section (Fixed height) */}
        <div className="h-16 shrink-0 flex items-center justify-between px-5 bg-indigo-950 border-b border-indigo-800/80">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <img src='/logo.png' alt='logo' className='h-10' />
            </div>
            <div>
              <span className="text-base font-bold tracking-wider text-white">SKYWORK</span>
              <span className="ml-1.5 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-800/80 text-indigo-200 border border-indigo-700">
                ADMIN
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-dark px-3 py-3 space-y-4">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-900/40 border border-indigo-800/40">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-indigo-400/30 shrink-0">
              {currentUser?.name?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Super Admin'}</p>
              <p className="text-[11px] text-indigo-300/80 font-medium truncate">{currentUser?.id || 'SA001'} • Root Master</p>
            </div>
          </div>

          {/* Primary Navigation Menu */}
          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-wider px-3 pb-1">
              Master Control
            </p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/super-admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 ${isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 font-bold'
                    : 'text-indigo-200/90 hover:bg-indigo-900/50 hover:text-white'
                    }`}
                >
                  <item.icon className={`mr-2.5 flex-shrink-0 h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-200'
                    }`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Cross-Portal Switcher */}
          <div className="pt-2">
            <div className="p-2.5 rounded-xl bg-indigo-900/25 border border-indigo-800/30 space-y-1">
              <p className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-wider px-2 py-1">
                Cross-Portal Access
              </p>
              <Link
                to="/hr"
                className="flex items-center px-2.5 py-2 text-xs font-medium text-indigo-200/80 hover:bg-indigo-900/50 hover:text-white rounded-lg transition-colors"
              >
                <Briefcase className="mr-2.5 h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">HR Admin Portal</span>
              </Link>
              <Link
                to="/"
                className="flex items-center px-2.5 py-2 text-xs font-medium text-indigo-200/80 hover:bg-indigo-900/50 hover:text-white rounded-lg transition-colors"
              >
                <User className="mr-2.5 h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">Employee Portal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Sign-out bar (Fixed at bottom) */}
        <div className="p-3 shrink-0 border-t border-indigo-800/80 bg-indigo-950/95">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-bold text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded-xl hover:bg-rose-900/50 hover:text-white transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="mr-2 h-4 w-4 text-rose-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-gray-800 shadow-xs flex items-center justify-between px-4 sm:px-6 z-10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-indigo-700 dark:text-indigo-400">Super Admin Portal</span>
              <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-gray-400" />
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {navItems.find(i => location.pathname === i.path || (i.path !== '/super-admin' && location.pathname.startsWith(i.path)))?.name || 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                to="/hr"
                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold"
              >
                HR View
              </Link>
              <Link
                to="/"
                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold"
              >
                Employee View
              </Link>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-700 tracking-wide">
              Root Authority
            </div>
            <ProfileMenu user={adminProfile} />
          </div>
        </header>

        {/* Main scrollable view */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

