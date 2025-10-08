'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { api, setToken, removeToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      // Validate token by fetching user profile
      api.getMyProfile()
        .then(() => {
          // Token is valid, we can assume user exists
          // In a real app, you'd fetch user data here
          setLoading(false);
        })
        .catch(() => {
          // Token is invalid
          removeToken();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await api.login(data);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.register(data);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    api.logout().catch(() => {}); // Fire and forget
    removeToken();
    setUser(null);
  };

  const isAuthenticated = !!user || (typeof window !== 'undefined' && !!localStorage.getItem('token'));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
