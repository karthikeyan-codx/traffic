import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Officer } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  officer: Officer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('traffic_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('traffic_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setOfficer(res.officer);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('traffic_token');
          setToken(null);
          setOfficer(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password);
    localStorage.setItem('traffic_token', res.token);
    setToken(res.token);
    setOfficer(res.officer);
  };

  const logout = () => {
    localStorage.removeItem('traffic_token');
    setToken(null);
    setOfficer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        officer,
        token,
        isAuthenticated: !!token && !!officer,
        isLoading,
        login,
        logout,
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
