/**
 * Tipos y constantes comunes para Phase 2A
 */

// ===== API ===== 

export const API_TIMEOUTS = {
  SHORT: 3000,      // Operaciones rápidas (login, logout)
  MEDIUM: 10000,    // Operaciones normales
  LONG: 30000,      // Operaciones lentas (checkout, bulk operations)
  VERY_LONG: 60000, // Operaciones muy lentas (upload, sync large batches)
} as const;

export const API_RETRY_LIMITS = {
  NETWORK: 3,      // Reintentos para errores de red
  TIMEOUT: 2,      // Reintentos para timeouts
  SERVER: 1,       // Reintentos para errores de servidor (no retry de 500)
} as const;

export const API_BACKOFF = {
  INITIAL: 1000,   // 1 segundo inicial
  MULTIPLIER: 2,   // exponential backoff x2
  MAX: 30000,      // max 30 segundos entre reintentos
} as const;

// ===== CACHE =====

export const CACHE_SETTINGS = {
  PRODUCTS_TTL: 24 * 60 * 60 * 1000,     // 24 horas para productos
  PRODUCERS_TTL: 24 * 60 * 60 * 1000,    // 24 horas para productores
  SEARCHES_TTL: 1 * 60 * 60 * 1000,      // 1 hora para búsquedas
  CART_PERSISTENCE: true,                 // Persistir carrito en SQLite
  AUTH_PERSISTENCE: true,                 // Persistir auth en SQLite
} as const;

// ===== SYNC =====

export const SYNC_SETTINGS = {
  AUTO_SYNC_INTERVAL: 30000,    // Auto-sync cada 30 segundos si hay pendientes
  MAX_BATCH_SIZE: 5,             // Procesar 5 operaciones a la vez
  MAX_RETRIES: 3,                // 3 intentos max por operación
  RETRY_BACKOFF: 2000,           // 2 segundos entre reintentos
} as const;

// ===== LATENCY =====

export const LATENCY_THRESHOLDS = {
  SHOW_SPINNER: 2000,    // Mostrar spinner si toma mas de 2s
  SHOW_WARNING: 5000,    // Mostrar warning si toma mas de 5s
  CONSIDER_SLOW: 1000,   // Considerar "lento" si > 1s
} as const;

// ===== CART =====

export const CART_LIMITS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999,
  TAX_RATE: 0.19,         // 19% IVA
  SHIPPING_BASE: 5000,    // $5000 base de envío (CLP)
  FREE_SHIPPING_OVER: 50000, // Envío gratis sobre $50000
} as const;

// ===== AUTH =====

export const AUTH_SETTINGS = {
  TOKEN_EXPIRY_BUFFER: 1 * 60 * 60 * 1000,  // Refrescar 1 hora antes de expirar
  REFRESH_CHECK_INTERVAL: 5 * 60 * 1000,     // Verificar cada 5 minutos
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000,  // 7 días de sesión máxima
} as const;

// ===== ROLES =====

export const ROLES = {
  ADMIN: 'admin',
  PRODUCER: 'productor',
  CLIENT: 'cliente',
} as const;

// ===== ERROR TYPES =====

export const ERROR_MESSAGES = {
  CONTRACT_MISMATCH: 'Por favor actualiza la aplicación al último formato',
  SERVER_ERROR: 'Error en el servidor. Estamos trabajando para resolverlo.',
  NETWORK_ERROR: 'Sin conexión. Revisa tu conexión de internet.',
  TIMEOUT: 'La operación tomó demasiado tiempo. Por favor intenta de nuevo.',
  NOT_FOUND: 'El recurso no existe.',
  UNAUTHORIZED: 'No tienes permisos para esta acción.',
  VALIDATION_ERROR: 'Verifica los datos ingresados.',
  UNKNOWN: 'Error desconocido. Por favor intenta de nuevo.',
} as const;

// ===== CART STATES =====

export const CART_STATES = {
  EMPTY: 'empty',
  LOADING: 'loading',
  READY: 'ready',
  SYNCING: 'syncing',
  ERROR: 'error',
} as const;

// ===== ORDER STATES =====

export const ORDER_STATES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

// ===== PRODUCT STATES =====

export const PRODUCT_STATES = {
  AVAILABLE: 'disponible',
  OUT_OF_STOCK: 'agotado',
  COMING_SOON: 'proximo',
  DISCONTINUED: 'descontinuado',
} as const;

// ===== NOTIFICATIONS =====

export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  PRODUCT_AVAILABLE: 'product.available',
  PRODUCT_DISCOUNT: 'product.discount',
  VISIT_REMINDER: 'visit.reminder',
  SYSTEM_UPDATE: 'system.update',
} as const;

// ===== FEATURE FLAGS =====

export const FEATURES = {
  OFFLINE_MODE: true,
  GUIDED_TOURS: true,
  REVIEWS_RATINGS: true,
  WISHLIST: false,       // Para Phase 2B
  LIVE_CHAT: false,      // Para Phase 2B
  AR_CAMERA: false,      // Para futuro
} as const;

// Type helpers for strict typing
export type Role = typeof ROLES[keyof typeof ROLES];
export type ErrorType = 'CONTRACT_MISMATCH' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'NONE';
export type OrderState = typeof ORDER_STATES[keyof typeof ORDER_STATES];
export type ProductState = typeof PRODUCT_STATES[keyof typeof PRODUCT_STATES];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
