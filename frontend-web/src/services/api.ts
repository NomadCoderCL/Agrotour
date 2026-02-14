/**
 * HTTP Client Optimizado para Agrotour
 * Correcciones: Rutas, Bucle Infinito, Singleton, Tipos
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import {
  SyncPushPayload,
  SyncPushResponse,
  SyncPullPayload,
  SyncPullResponse,
  AuthResponse,
  TokenPayload,
  Producto,
} from "@/types/models";

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

class ApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private retryConfig: RetryConfig;
  private isRefreshing: boolean = false; // Semáforo para evitar bucles
  private failedQueue: any[] = []; // Cola de peticiones esperando token nuevo

  constructor(baseURL?: string, retryConfig?: Partial<RetryConfig>) {
    // Vite usa import.meta.env, asegúrate de tener VITE_API_URL en tu .env
    const API_BASE_URL = baseURL || import.meta.env.VITE_API_URL || "http://localhost:8000";

    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000, // Subí un poco el timeout para móviles/3G
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.loadTokens();
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  private loadTokens(): void {
    try {
      const stored = localStorage.getItem("auth_tokens");
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.access;
        this.refreshToken = tokens.refresh;
      }
    } catch (error) {
      console.warn("Error loading tokens", error);
    }
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem(
      "auth_tokens",
      JSON.stringify({ access: accessToken, refresh: refreshToken })
    );
  }

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

  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Manejo de 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Si ya estamos refrescando, poner en cola
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // IMPORTANTE: Usamos una instancia NUEVA de axios para evitar el interceptor
            // y evitar el bucle infinito.
            const response = await axios.post<TokenPayload>(
              `${this.axiosInstance.defaults.baseURL}/auth/token/refresh/`,
              { refresh: this.refreshToken }
            );

            const { access, refresh } = response.data;
            this.saveTokens(access, refresh);

            // Procesar la cola de peticiones fallidas
            this.processQueue(null, access);
            this.isRefreshing = false;

            // Reintentar la original
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return this.axiosInstance(originalRequest);

          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.isRefreshing = false;
            this.logout(); // Limpia todo
            // Redirección segura
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Procesa la cola de peticiones que esperaban el refresh
  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  // --- RETRY LOGIC (Simplificada) ---
  private async retryWithBackoff<T>(fn: () => Promise<T>, retryCount = 0): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      // No reintentar si es 401 (eso lo maneja el interceptor) o 400 (error del usuario)
      if (retryCount < this.retryConfig.maxRetries && this.isRetryableError(error as AxiosError)) {
        const delay = this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
        // console.log(`Retry attempt ${retryCount + 1}/${this.retryConfig.maxRetries} after ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        return this.retryWithBackoff(fn, retryCount + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: AxiosError): boolean {
    const status = error.response?.status;
    // Reintentar errores de red (status undefined) o errores de servidor (5xx)
    return !status || (status >= 500 && status < 600) || status === 429;
  }

  // --- MÉTODOS PÚBLICOS (Rutas Corregidas) ---

  // ==================
  // AUTENTICACIÓN
  // ==================

  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await this.axiosInstance.post<AuthResponse>("/auth/login/", { username, password });
    this.saveTokens(res.data.access, res.data.refresh);
    return res.data;
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
    // Opcional: Llamar al backend para blacklistear el refresh token
  }

  async validateToken(): Promise<{ message: string }> {
    return this.retryWithBackoff(() =>
      this.axiosInstance.post("/auth/validate-token/", {}).then((res) => res.data)
    );
  }

  // ==================
  // PRODUCTOS
  // ==================

  async getProductos(filters?: Record<string, any>) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/productos/", { params: filters }).then(r => r.data)
    );
  }

  async getProducto(id: number) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get(`/api/productos/${id}/`).then((res) => res.data)
    );
  }

  async createProducto(data: Partial<Producto>) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.post("/api/productos/", data).then((res) => res.data)
    );
  }

  async updateProducto(id: number, data: Partial<Producto>) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.put(`/api/productos/${id}/`, data).then((res) => res.data)
    );
  }

  async deleteProducto(id: number) {
    return this.retryWithBackoff(() =>
      this.axiosInstance.delete(`/api/productos/${id}/`).then(() => ({}))
    );
  }

  // ==================
  // SYNC ENGINE
  // ==================

  async syncPush(payload: SyncPushPayload): Promise<SyncPushResponse> {
    return this.retryWithBackoff(() =>
      this.axiosInstance.post("/api/sync/push/", payload).then(r => r.data)
    );
  }

  async syncPull(payload: SyncPullPayload): Promise<SyncPullResponse> {
    return this.retryWithBackoff(() =>
      this.axiosInstance.post("/api/sync/pull/", payload).then(r => r.data)
    );
  }

  async getConflicts() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/sync/conflicts/").then(r => r.data)
    );
  }

  async resolveConflict(
    conflictId: string,
    resolution: "LOCAL" | "REMOTE"
  ): Promise<any> {
    return this.retryWithBackoff(() =>
      this.axiosInstance
        .post(`/api/sync/conflicts/${conflictId}/resolve/`, { resolution })
        .then((res) => res.data)
    );
  }

  // ==================
  // UBICACIONES
  // ==================

  async getUbicaciones() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/ubicaciones/").then((res) => res.data)
    );
  }

  async getUbicacionesProductores() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/ubicaciones_productores/").then((res) => res.data)
    );
  }

  // ==================
  // VENTAS
  // ==================

  async confirmarCompra(carrito: any): Promise<{ venta_id: number; monto_total: number }> {
    return this.retryWithBackoff(() =>
      this.axiosInstance.post("/api/confirmar-compra/", { carrito }).then((res) => res.data)
    );
  }

  async getVentas() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/ventas/").then((res) => res.data)
    );
  }

  // ==================
  // BOLETAS
  // ==================

  async getBoletas() {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get("/api/boletas/").then(r => r.data)
    );
  }

  async descargarBoletaPDF(boletaId: number): Promise<Blob> {
    return this.retryWithBackoff(() =>
      this.axiosInstance.get(`/api/boletas/${boletaId}/pdf/`, { responseType: "blob" }).then(r => r.data)
    );
  }

  // ==================
  // VISITAS
  // ==================

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

  // ==================
  // UTIL
  // ==================

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Getters útiles
  get token() { return this.accessToken; }
}

// Exportamos SOLO la instancia para que sea un verdadero Singleton
export const apiClient = new ApiClient();
