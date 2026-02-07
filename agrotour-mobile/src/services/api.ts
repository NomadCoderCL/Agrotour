/**
 * HTTP Client para Mobile (React Native)
 * Basado en la versión Web pero adaptado para Expo/Mobile
 */

import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
    AuthResponse,
    TokenPayload,
    SyncPushPayload,
    SyncPushResponse,
    SyncPullPayload,
    SyncPullResponse,
} from "../types/models";

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

// Descubrimiento automático de la IP del host para desarrollo con Expo Go
const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || "";
    const localhost = debuggerHost.split(":")[0];

    if (__DEV__ && localhost) {
        return `http://${localhost}:8000/api`;
    }

    // URL de producción (cambiar cuando esté desplegado)
    return "https://api.agrotour.example.com/api";
};

class ApiClient {
    private axiosInstance: AxiosInstance;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private retryConfig: RetryConfig;

    constructor(baseURL?: string, retryConfig?: Partial<RetryConfig>) {
        const API_BASE_URL = baseURL || getBaseUrl();

        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            timeout: 15000, // Un poco más largo para redes móviles
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

        // Inicialización asíncrona de tokens (en mobile no es instantáneo)
        this.init();

        this.setupRequestInterceptor();
        this.setupResponseInterceptor();
    }

    private async init() {
        await this.loadTokens();
    }

    /**
     * Cargar tokens de AsyncStorage
     */
    private async loadTokens(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem("auth_tokens");
            if (stored) {
                const tokens = JSON.parse(stored);
                this.accessToken = tokens.access;
                this.refreshToken = tokens.refresh;
            }
        } catch (error) {
            console.warn("Error loading tokens from AsyncStorage", error);
        }
    }

    /**
     * Guardar tokens en AsyncStorage
     */
    private async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        try {
            await AsyncStorage.setItem(
                "auth_tokens",
                JSON.stringify({ access: accessToken, refresh: refreshToken })
            );
        } catch (error) {
            console.error("Error saving tokens to AsyncStorage", error);
        }
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
                const originalRequest = error.config as InternalAxiosRequestConfig & {
                    _retry?: boolean;
                };

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
                        await this.saveTokens(access, refresh);

                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.accessToken = null;
                        this.refreshToken = null;
                        await AsyncStorage.removeItem("auth_tokens");
                        // Nota: El manejo de la navegación al login debe ser manejado por un listener externo o context
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

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
                console.log(`Mobile: Retry attempt ${retryCount + 1}...`);
                await this.sleep(delay);
                return this.retryWithBackoff(fn, retryCount + 1);
            }
            throw error;
        }
    }

    private isRetryableError(error: AxiosError): boolean {
        const status = error.response?.status;
        if (!status) return true;
        return status === 408 || status === 429 || (status >= 500 && status < 600);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * ==================
     * API METHODS
     * ==================
     */

    async login(username: string, password: string): Promise<AuthResponse> {
        return this.retryWithBackoff(() =>
            this.axiosInstance
                .post<AuthResponse>("/auth/login/", { username, password })
                .then(async (res) => {
                    await this.saveTokens(res.data.access, res.data.refresh);
                    return res.data;
                })
        );
    }

    async logout(): Promise<void> {
        this.accessToken = null;
        this.refreshToken = null;
        await AsyncStorage.removeItem("auth_tokens");
    }

    async getProductos(filters?: Record<string, any>) {
        return this.retryWithBackoff(() =>
            this.axiosInstance
                .get("/productos/", { params: filters })
                .then((res) => res.data)
        );
    }

    async syncPush(payload: SyncPushPayload): Promise<SyncPushResponse> {
        return this.retryWithBackoff(() =>
            this.axiosInstance
                .post("/sync/push/", payload)
                .then((res) => res.data)
        );
    }

    async syncPull(payload: SyncPullPayload): Promise<SyncPullResponse> {
        return this.retryWithBackoff(() =>
            this.axiosInstance
                .post("/sync/pull/", payload)
                .then((res) => res.data)
        );
    }
}

export const apiClient = new ApiClient();
export default ApiClient;
