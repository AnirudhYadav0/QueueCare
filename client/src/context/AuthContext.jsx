import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('queuecare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('queuecare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('queuecare_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('queuecare_token', newToken);
    localStorage.setItem('queuecare_user', JSON.stringify(newUser));
    return newUser;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('queuecare_token', newToken);
    localStorage.setItem('queuecare_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('queuecare_token');
    localStorage.removeItem('queuecare_user');
  };

  const updateUserProfile = async (profileData) => {
    const res = await authService.updateProfile(profileData);
    if (res.data?.user) {
      const updated = { ...user, ...res.data.user };
      setUser(updated);
      localStorage.setItem('queuecare_user', JSON.stringify(updated));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isPatient: user?.role === 'patient',
        isDoctor: user?.role === 'doctor',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
