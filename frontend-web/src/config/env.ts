/**
 * Configuración de Environment Variables
 */

// Validar variables requeridas
const REQUIRED_VARS = [
  "VITE_API_URL",
  "VITE_APP_NAME",
  "VITE_ENVIRONMENT",
];

REQUIRED_VARS.forEach((varName) => {
  if (!import.meta.env[varName]) {
    console.warn(`Missing required environment variable: ${varName}`);
  }
});

export const CONFIG = {
  // API
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  SYNC_URL: import.meta.env.VITE_SYNC_URL || "http://localhost:8001/sync",
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10),

  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || "Agrotour",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "development",
  IS_PRODUCTION: import.meta.env.VITE_ENVIRONMENT === "production",
  IS_DEVELOPMENT: import.meta.env.VITE_ENVIRONMENT === "development",

  // Features
  ENABLE_OFFLINE: import.meta.env.VITE_ENABLE_OFFLINE !== "false",
  ENABLE_SERVICE_WORKER: import.meta.env.VITE_ENABLE_SERVICE_WORKER !== "false",
  ENABLE_SYNC_ENGINE: import.meta.env.VITE_ENABLE_SYNC_ENGINE !== "false",
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === "true",

  // Maps
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || "",
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  DEFAULT_MAP_CENTER: parseMapCenter(import.meta.env.VITE_DEFAULT_MAP_CENTER),
  DEFAULT_MAP_ZOOM: parseInt(import.meta.env.VITE_DEFAULT_MAP_ZOOM || "13", 10),

  // Stripe
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || "",

  // Sentry
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || "",

  // Device ID
  DEVICE_ID: import.meta.env.VITE_DEVICE_ID || "web_" + Math.random().toString(36).substr(2, 9),

  // Logging
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || "info",
};

/**
 * Parse map center from string
 */
function parseMapCenter(str?: string): [number, number] {
  if (!str) return [-33.8688, -51.2093]; // Default: Centro de Chile

  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed) && parsed.length === 2) {
      return [parsed[0], parsed[1]];
    }
  } catch (e) {
    console.warn("Invalid DEFAULT_MAP_CENTER format");
  }

  return [-33.8688, -51.2093];
}

export default CONFIG;
