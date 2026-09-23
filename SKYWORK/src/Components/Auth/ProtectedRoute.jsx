import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';
import { ShieldAlert } from 'lucide-react';

const UnauthorizedAccess = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <ShieldAlert className="w-24 h-24 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">403 - Forbidden</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        You do not have the required permissions to access this page. Please contact your Super Admin if you believe this is a mistake.
      </p>
      <button 
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  );
};

export const ProtectedRoute = ({ children, allowedRoles = [], requiredPermission = null }) => {
  const { isAuthenticated, userRole, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole) && userRole !== 'superadmin') {
    return <UnauthorizedAccess />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <UnauthorizedAccess />;
  }

  return children;
};
