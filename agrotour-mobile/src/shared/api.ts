/**
 * API Client for Mobile
 * Gestiona HTTP requests, JWT refresh, retry logic, global error handling
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS, REQUEST_TIMEOUT, TOKEN_REFRESH_BUFFER } from './config';
import { APIException, APIError } from './types';
import { globalErrorStore } from '../services/GlobalErrorStore';

class APIClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AgroTourMobile/2.0.0',
      },
    });

    // Request interceptor para agregar token
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor para manejar 401 y refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Global error handling para 400 y 500
        if (error.response?.status === 400) {
          globalErrorStore.setError(
            'CONTRACT_MISMATCH',
            'Por favor actualiza la aplicación',
            { endpoint: originalRequest?.url, status: 400 }
          );
        } else if (error.response?.status === 500) {
          globalErrorStore.setError(
            'SERVER_ERROR',
            'Error en el servidor. Intentando de nuevo...',
            { endpoint: originalRequest?.url, status: 500 }
          );
        }

        // JWT refresh logic para 401
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Si falla refresh, limpiar auth y rethrow
            await this.clearAuth();
            throw refreshError;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Refresh JWT token antes de que expire
   */
  private async refreshToken(): Promise<string> {
    // Evitar múltiples refresh simultáneos
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await this.client.post<{ access: string }>('/auth/refresh/', {
          refresh: refreshToken,
        });

        const newToken = response.data.access;
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
        return newToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * GET request con retry automático
   */
  async get<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request con retry automático
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Batch GET para múltiples productos
   */
  async batch<T = any>(url: string, ids: number[]): Promise<T[]> {
    return this.post(`${url}batch/`, { ids });
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: any): APIException {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data as APIError | undefined;
      const code = data?.code || 'UNKNOWN_ERROR';
      const message = data?.message || error.message || 'Unknown error occurred';

      return new APIException(status, code, message, data?.details);
    }

    return new APIException(500, 'NETWORK_ERROR', error.message || 'Network error occurred');
  }

  /**
   * Limpiar token de autenticación
   */
  private async clearAuth(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
  }

  /**
   * Set authorization token manualmente
   */
  setToken(token: string): void {
    AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  }

  /**
   * POST request - Create Order
   */
  async createOrder<T = any>(data: any): Promise<T> {
    try {
      const response = await this.client.post<T>(
        ENDPOINTS.CART.CREATE_ORDER,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request - Register FCM Token
   */
  async registerFCMToken<T = any>(data: { token: string; platform: string }): Promise<T> {
    try {
      const response = await this.client.post<T>(
        ENDPOINTS.FCM.REGISTER_TOKEN,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request - Unregister FCM Token
   */
  async unregisterFCMToken<T = any>(data: { token: string }): Promise<T> {
    try {
      const response = await this.client.post<T>(
        ENDPOINTS.FCM.UNREGISTER_TOKEN,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request - Generic (for custom endpoints)
   */
  async post<T = any>(url: string, data: any, config?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request - Generic
   */
  async put<T = any>(url: string, data: any, config?: any): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request - Generic
   */
  async delete<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Singleton instance
export const apiClient = new APIClient();

/**
 * Exportar alias más cómodo y helper de retry con backoff exponencial
 */
export const api = apiClient;

export async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 4, initialDelay = 1000): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt >= maxAttempts) throw err;
      // esperar con backoff exponencial
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 2, 60000);
    }
  }
}
