'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile, LoginRequest, RegisterRequest } from '@/types';
import { api, setToken, removeToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const storedProfile = typeof window !== 'undefined' ? localStorage.getItem('profile') : null;

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
        setLoading(false);
      } catch {
        removeToken();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await api.login(data);
    setToken(response.token);
    setUser(response.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    // Fetch profile after login
    try {
      const profileData = await api.getMyProfile();
      setProfile(profileData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('profile', JSON.stringify(profileData));
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.register(data);
    setToken(response.token);
    setUser(response.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    // Fetch profile after registration
    try {
      const profileData = await api.getMyProfile();
      setProfile(profileData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('profile', JSON.stringify(profileData));
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const logout = () => {
    api.logout().catch(() => {}); // Fire and forget
    removeToken();
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, isAuthenticated }}>
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
