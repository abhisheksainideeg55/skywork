import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, logout as authLogout, getCurrentSession } from '../Services/authService.js';
import { getUserById, initializeUsers } from '../Services/userService.js';
import { hasPermission as rbacHasPermission, canDelegate as rbacCanDelegate } from '../Services/rbacService.js';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const userId = getCurrentSession();
    if (userId) {
      const user = getUserById(userId);
      if (user) {
        const { passwordHash, salt, ...safeUser } = user;
        setCurrentUser(safeUser);
      }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    // Fetch users from MongoDB backend, then restore session
    initializeUsers().then(() => {
      refreshUser();
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    try {
      const user = await authLogin(email, password);
      // Refresh user cache after login to ensure cache has the logged-in user
      await initializeUsers();
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (currentUser) {
      authLogout(currentUser.id, currentUser.role);
    } else {
      authLogout(null, null);
    }
    setCurrentUser(null);
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    return rbacHasPermission(currentUser.permissions || [], permission, currentUser.role);
  };

  const canDelegate = (requestedPermissions) => {
    if (!currentUser) return false;
    return rbacCanDelegate(
      requestedPermissions,
      currentUser.permissions || [],
      currentUser.delegatablePermissions || [],
      currentUser.role
    );
  };

  const value = {
    currentUser,
    userRole: currentUser?.role,
    permissions: currentUser?.permissions || [],
    delegatablePermissions: currentUser?.delegatablePermissions || [],
    isAuthenticated: !!currentUser,
    login,
    logout,
    hasPermission,
    canDelegate,
    refreshUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
