/**
 * AuthContext - Maneja autenticación y persistencia de sesión
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/services';
import getLogger from '@/lib/logger';

const logger = getLogger('AuthContext');

export interface User {
  id: number;
  username: string;
  email: string;
  rol: 'cliente' | 'productor' | 'admin' | 'superuser';
  nombre?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string, rol: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // TODO: Implementar endpoint para obtener usuario actual
          // const userData = await apiClient.getMe();
          // setUser(userData);
          logger.info('Session restored from token');
        }
      } catch (err) {
        logger.warn('Failed to restore session', err);
        localStorage.removeItem('access_token');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const resp = await apiClient.login(username, password);
      if (resp && resp.access) {
        localStorage.setItem('access_token', resp.access);
        if (resp.user) {
          setUser(resp.user);
        }
        logger.info('Login successful');
      }
    } catch (err) {
      logger.error('Login failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      logger.info('Logout successful');
    } catch (err) {
      logger.error('Logout failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, rol: string) => {
    try {
      setIsLoading(true);
      await apiClient.register(username, email, password, rol);
      // Registration successful, now auto-login
      await login(username, password);
      logger.info('Registration successful');
    } catch (err) {
      logger.error('Registration failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthProvider;
