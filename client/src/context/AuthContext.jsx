/**
 * AuthContext
 * Global authentication state management using React Context API
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Initial auth check

  // ── Initialize from localStorage on mount ──────
  useEffect(() => {
    const storedToken = localStorage.getItem('taskflow_token');
    const storedUser = localStorage.getItem('taskflow_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // Verify token is still valid
        verifyToken(storedToken);
      } catch {
        clearAuth();
      }
    } else {
      setLoading(false);
    }
  }, []);

  // ── Verify token with backend ──────────────────
  const verifyToken = async (tok) => {
    try {
      const { data } = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      setUser(data.user);
      localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('taskflow_token', data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    toast.success('Account created! Welcome to TaskFlow 🎉');
    return data;
  }, []);

  // ── Login ──────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('taskflow_token', data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if server call fails, clear client state
    } finally {
      clearAuth();
      toast.success('Logged out successfully.');
    }
  }, []);

  // ── Update Profile ─────────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    setUser(data.user);
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
    toast.success('Profile updated!');
    return data;
  }, []);

  // ── Clear Auth State ───────────────────────────
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
