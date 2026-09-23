import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      const user = result.user;
      const role = user?.role;
      const from = location.state?.from?.pathname;

      let targetPath = '/';
      if (role === 'superadmin') {
        targetPath = (from && from.startsWith('/super-admin')) ? from : '/super-admin';
      } else if (role === 'hr') {
        targetPath = (from && from.startsWith('/hr')) ? from : '/hr';
      } else {
        // employee / staff
        const isRestrictedPath = from && (from.startsWith('/super-admin') || from.startsWith('/hr') || from === '/login');
        targetPath = (from && !isRestrictedPath) ? from : '/';
      }

      navigate(targetPath, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const setDemo = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div>
          <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-xs">
            <img src='/logo.png' alt='logo' className='' />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Skywork HRMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enterprise RBAC Access Portal
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address or User ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow"
                  placeholder="name@skywork.io or User ID (e.g. SA001)"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Sign in securely
              <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </span>
            </button>
          </div>
        </form>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase font-semibold tracking-wider text-center">3 System Roles Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemo('superadmin@skywork.io', 'Password@123')}
              className="text-xs py-2 px-2 text-center bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 font-semibold transition-colors cursor-pointer"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setDemo('hr@skywork.io', 'Hr@123')}
              className="text-xs py-2 px-2 text-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 font-semibold transition-colors cursor-pointer"
            >
              HR Admin
            </button>
            <button
              type="button"
              onClick={() => setDemo('employee@skywork.io', 'Emp@123')}
              className="text-xs py-2 px-2 text-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 font-semibold transition-colors cursor-pointer"
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
