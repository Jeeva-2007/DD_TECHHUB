import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  pendingUser: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  setPendingAuth: (userData: User, token: string) => void;
  confirmOtpSuccess: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dd_user');
    return saved ? JSON.parse(saved) : {
      user_id: 'USR-101',
      name: 'Demo Customer',
      email: 'customer@ddtechhub.com',
      mobile: '+91 9876543210'
    };
  });
  
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dd_token'));

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('dd_user', JSON.stringify(userData));
    localStorage.setItem('dd_token', userToken);
  };

  const setPendingAuth = (userData: User, userToken: string) => {
    setPendingUser(userData);
    setToken(userToken);
  };

  const confirmOtpSuccess = () => {
    if (pendingUser) {
      setUser(pendingUser);
      localStorage.setItem('dd_user', JSON.stringify(pendingUser));
      if (token) localStorage.setItem('dd_token', token);
      setPendingUser(null);
    }
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    setToken(null);
    localStorage.removeItem('dd_user');
    localStorage.removeItem('dd_token');
  };

  return (
    <AuthContext.Provider value={{ user, pendingUser, token, login, setPendingAuth, confirmOtpSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
