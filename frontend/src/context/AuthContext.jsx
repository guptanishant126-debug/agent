import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sahayak_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sahayak_token') || null);
  const [loading, setLoading] = useState(true);
  const { setLanguage } = useLanguage();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sahayak_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('sahayak_user', JSON.stringify(res.data.user));
            if (res.data.user.preferred_language) {
              setLanguage(res.data.user.preferred_language);
            }
          }
        } catch (err) {
          console.warn('Session verification expired:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('sahayak_token', token);
      localStorage.setItem('sahayak_user', JSON.stringify(user));
      if (user.preferred_language) {
        setLanguage(user.preferred_language);
      }
      return user;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data.success) {
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('sahayak_token', token);
      localStorage.setItem('sahayak_user', JSON.stringify(user));
      if (user.preferred_language) {
        setLanguage(user.preferred_language);
      }
      return user;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const updateProfile = async (profileData) => {
    const res = await authAPI.updateProfile(profileData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('sahayak_user', JSON.stringify(res.data.user));
      if (res.data.user.preferred_language) {
        setLanguage(res.data.user.preferred_language);
      }
      return res.data.user;
    }
    throw new Error(res.data.message || 'Profile update failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sahayak_token');
    localStorage.removeItem('sahayak_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

