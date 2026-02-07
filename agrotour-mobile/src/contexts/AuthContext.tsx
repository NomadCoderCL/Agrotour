/**
 * Auth Context - State management para autenticación mobile
 * Usa AsyncStorage para persistencia
 */

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../shared/api';
import { Usuario, AuthResponse, UserRole, AuthState } from '../shared/types';
import { STORAGE_KEYS } from '../shared/config';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Restore auth from storage on mount
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const [token, refreshToken, userStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
        ]);

        if (token && refreshToken && userStr) {
          setState({
            user: JSON.parse(userStr),
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to restore auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    restoreAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', {
        username,
        password,
      });

      // Persist tokens
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user)),
      ]);

      setState({
        user: response.user,
        token: response.access,
        refreshToken: response.refresh,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiClient.post<AuthResponse>('/auth/register/', {
          username,
          email,
          password,
        });

        // Auto-login after register
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh),
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user)),
        ]);

        setState({
          user: response.user,
          token: response.access,
          refreshToken: response.refresh,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Registration failed',
        }));
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await apiClient.post('/auth/logout/', {});
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear storage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);

      setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isInitialized,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
