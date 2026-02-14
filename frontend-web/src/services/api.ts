/**
 * HTTP Client con Retry Automático
 * Maneja sincronización con /sync/push y otras APIs
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import {
  SyncOperation,
  SyncPushPayload,
  SyncPushResponse,
  SyncPullPayload,
  SyncPullResponse,
  AuthResponse,
  TokenPayload,
} from "../types/models";

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000, // 1s inicial
  backoffMultiplier: 2, // exponential: 1s → 2s → 4s
};

class ApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private retryConfig: RetryConfig;

  constructor(baseURL?: string, retryConfig?: Partial<RetryConfig>) {
    const API_BASE_URL = baseURL || import.meta.env.REACT_APP_API_URL || "http://localhost:8000";

    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

    // Cargar tokens del localStorage
    this.loadTokens();

    // Interceptor para agregar Authorization header
    this.setupRequestInterceptor();

    // Interceptor para manejar 401 (token expirado)
    this.setupResponseInterceptor();
  }

  /**
   * Cargar tokens del localStorage
   */
  private loadTokens(): void {
    try {
      const stored = localStorage.getItem("auth_tokens");
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.access;
        this.refreshToken = tokens.refresh;
      }
    } catch (error) {
      console.warn("Error loading tokens from localStorage", error);
    }
  }

  /**
   * Guardar tokens en localStorage
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem(
      "auth_tokens",
      JSON.stringify({ access: accessToken, refresh: refreshToken })
    );
  }

  /**
   * Interceptor: Agregar Authorization header
   */
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Interceptor: Manejar 401 con refresh token
   */
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Si 401 y tiene refresh token, intentar refrescar
        if (
          error.response?.status === 401 &&
          this.refreshToken &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const response = await this.axiosInstance.post<TokenPayload>(
              "/auth/token/refresh/",
              { refresh: this.refreshToken }
            );

            const { access, refresh } = response.data;
            this.saveTokens(access, refresh);

            // Reintentar request original con nuevo token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh falló, limpiar tokens y redirigir a login
            this.accessToken = null;
            this.refreshToken = null;
            localStorage.removeItem("auth_tokens");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Retry automático con exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (
        retryCount < this.retryConfig.maxRetries &&
        this.isRetryableError(error as AxiosError)
      ) {
        const delay =
          this.retryConfig.delayMs *
          Math.pow(this.retryConfig.backoffMultiplier, retryCount);
        console.log(
          `Retry attempt ${retryCount + 1}/${this.retryConfig.maxRetries} after ${delay}ms`
        );
        await this.sleep(delay);
        return this.retryWithBackoff(fn, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Determinar si un error es reintentable
   */
  private isRetryableError(error: AxiosError): boolean {
    const status = error.response?.status;

    // Reintenta en timeouts, 429 (rate limit), 5xx
    if (!status) return true; // Network error
    return (
      status === 408 || // Request timeout
      status === 429 || // Too Many Requests
      (status >= 500 && status < 600) // Server errors
    );
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * ==================
   * AUTENTICACIÓN
   * ==================
   */

  async login(username: string, password: string): Promise<AuthResponse> {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .post<AuthResponse>("/auth/login/", { username, password })
        .then((res) => {
          this.saveTokens(res.data.access, res.data.refresh);
          return res.data;
        })
    );
  }

  async register(
    username: string,
    email: string,
    password: string,
    rol: string = "cliente"
  ): Promise<{ mensaje: string }> {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .post("/auth/registro/", { username, email, password, rol })
        .then((res) => res.data)
    );
  }

  async logout(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("auth_tokens");
  }

  async validateToken(): Promise<{ message: string }> {
    return this.retryWithBackoff(() =>
      this.axiosInstance.post("/auth/validate-token/", {}).then((res) => res.data)
    );
  }

  /**
   * ==================
   * PRODUCTOS
   * ==================
   */

  async getProductos(filters?: Record<string, any>) {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .get("/api/productos/", { params: filters })
        .then((res) => res.data)
    );
  }

  async getProducto(id: number) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get(`/api/productos/${id}/`).then((res) => res.data)
    );
  }

  async createProducto(data: any) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.post("/api/productos/", data).then((res) => res.data)
    );
  }

  async updateProducto(id: number, data: any) {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .put(`/api/productos/${id}/`, data)
        .then((res) => res.data)
    );
  }

  async deleteProducto(id: number) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.delete(`/api/productos/${id}/`).then(() => ({}))
    );
  }

  /**
   * ==================
   * SYNC ENGINE
   * ==================
   */

  async syncPush(payload: SyncPushPayload): Promise<SyncPushResponse> {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .post("/api/sync/push/", payload)
        .then((res) => res.data)
    );
  }

  async syncPull(payload: SyncPullPayload): Promise<SyncPullResponse> {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .post("/api/sync/pull/", payload)
        .then((res) => res.data)
    );
  }

  async getConflicts() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/sync/conflicts/").then((res) => res.data)
    );
  }

  async resolveConflict(
    conflictId: string,
    resolution: "LOCAL" | "REMOTE"
  ): Promise<any> {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .post(`/sync/conflicts/${conflictId}/resolve/`, { resolution })
        .then((res) => res.data)
    );
  }

  /**
   * ==================
   * UBICACIONES
   * ==================
   */

  async getUbicaciones() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/ubicaciones/").then((res) => res.data)
    );
  }

  async getUbicacionesProductores() {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .get("/api/ubicaciones_productores/")
        .then((res) => res.data)
    );
  }

  /**
   * ==================
   * VENTAS
   * ==================
   */

  async confirmarCompra(carrito: any): Promise<{ venta_id: number; monto_total: number }> {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .post("/api/confirmar-compra/", { carrito })
        .then((res) => res.data)
    );
  }

  async getVentas() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/ventas/").then((res) => res.data)
    );
  }

  /**
   * ==================
   * BOLETAS
   * ==================
   */

  async getBoletas() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/boletas/").then((res) => res.data)
    );
  }

  async descargarBoletaPDF(boletaId: number): Promise<Blob> {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .get(`/boletas/${boletaId}/pdf/`, { responseType: "blob" })
        .then((res) => res.data)
    );
  }

  /**
   * ==================
   * VISITAS
   * ==================
   */

  async getVisitas() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/visitas/").then((res) => res.data)
    );
  }

  async crearVisita(data: any) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.post("/api/visitas/", data).then((res) => res.data)
    );
  }

  async actualizarVisita(id: number, data: any) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.put(`/api/visitas/${id}/`, data).then((res) => res.data)
    );
  }

  /**
   * ==================
   * UTIL
   * ==================
   */

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

export default ApiClient;
