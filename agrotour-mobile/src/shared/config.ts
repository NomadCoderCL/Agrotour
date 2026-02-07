/**
 * Shared Configuration - Mobile & Web
 * Variables de entorno, API URLs, constants
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
export const SYNC_INTERVAL = 30000; // 30 segundos
export const RETRY_MAX_ATTEMPTS = 4;
export const RETRY_INITIAL_DELAY = 1000; // 1 segundo

// Token expiration buffer (refresh 18 segundos antes)
export const TOKEN_REFRESH_BUFFER = 18000;

// Timeouts
export const REQUEST_TIMEOUT = 30000; // 30 segundos
export const SYNC_TIMEOUT = 60000; // 1 minuto

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@agrotour/auth_token',
  REFRESH_TOKEN: '@agrotour/refresh_token',
  USER: '@agrotour/user',
  CART: '@agrotour/cart',
  DARK_MODE: '@agrotour/dark_mode',
  SYNC_QUEUE: '@agrotour/sync_queue',
  LAST_SYNC: '@agrotour/last_sync',
} as const;

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/refresh/',
    LOGOUT: '/auth/logout/',
    ME: '/auth/me/',
  },
  PRODUCTS: {
    LIST: '/productos/',
    DETAIL: (id: number) => `/productos/${id}/`,
    BATCH: '/productos/batch/',
  },
  PRODUCERS: {
    LIST: '/productores/',
    DETAIL: (id: number) => `/productores/${id}/`,
  },
  CART: {
    CREATE_ORDER: '/ordenes/',
  },
  SYNC: {
    PUSH: '/sync/push/',
    PULL: '/sync/pull/',
  },
  FCM: {
    REGISTER_TOKEN: '/auth/fcm-token/',
    UNREGISTER_TOKEN: '/auth/fcm-token/unregister/',
  },
} as const;

// App Info
export const APP_INFO = {
  NAME: 'AgroTour',
  VERSION: '2.0.0',
  BUILD_DATE: new Date().toISOString(),
  PLATFORM: 'mobile',
} as const;
