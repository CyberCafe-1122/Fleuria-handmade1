import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fleuria_admin_token') || null);
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('fleuria_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync token changes to localStorage
  const handleAuthSuccess = (newToken, newAdmin) => {
    setToken(newToken);
    setAdmin(newAdmin);
    localStorage.setItem('fleuria_admin_token', newToken);
    localStorage.setItem('fleuria_admin_user', JSON.stringify(newAdmin));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('fleuria_admin_token');
    localStorage.removeItem('fleuria_admin_user');
    api.post('/auth/logout').catch(() => {});
  };

  // Verify session on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.get('/auth/me');
        setAdmin(data.admin);
        localStorage.setItem('fleuria_admin_user', JSON.stringify(data.admin));
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    }

    verify();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    handleAuthSuccess(data.token, data.admin);
    return data;
  };

  const updateProfile = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    localStorage.setItem('fleuria_admin_user', JSON.stringify(updatedAdmin));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        admin,
        isAuthenticated: Boolean(token && admin),
        loading,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
