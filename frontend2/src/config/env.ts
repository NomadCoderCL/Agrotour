/**
 * Configuración de Environment Variables
 */

// Validar variables requeridas
const REQUIRED_VARS = [
  "REACT_APP_API_URL",
  "REACT_APP_APP_NAME",
  "REACT_APP_ENVIRONMENT",
];

REQUIRED_VARS.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(`Missing required environment variable: ${varName}`);
  }
});

export const CONFIG = {
  // API
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  SYNC_URL: process.env.REACT_APP_SYNC_URL || "http://localhost:8001/sync",
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || "10000", 10),

  // App
  APP_NAME: process.env.REACT_APP_APP_NAME || "Agrotour",
  APP_VERSION: process.env.REACT_APP_APP_VERSION || "1.0.0",
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || "development",
  IS_PRODUCTION: process.env.REACT_APP_ENVIRONMENT === "production",
  IS_DEVELOPMENT: process.env.REACT_APP_ENVIRONMENT === "development",

  // Features
  ENABLE_OFFLINE: process.env.REACT_APP_ENABLE_OFFLINE !== "false",
  ENABLE_SERVICE_WORKER: process.env.REACT_APP_ENABLE_SERVICE_WORKER !== "false",
  ENABLE_SYNC_ENGINE: process.env.REACT_APP_ENABLE_SYNC_ENGINE !== "false",
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === "true",

  // Maps
  MAPBOX_TOKEN: process.env.REACT_APP_MAPBOX_TOKEN || "",
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  DEFAULT_MAP_CENTER: parseMapCenter(process.env.REACT_APP_DEFAULT_MAP_CENTER),
  DEFAULT_MAP_ZOOM: parseInt(process.env.REACT_APP_DEFAULT_MAP_ZOOM || "13", 10),

  // Stripe
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY || "",

  // Sentry
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || "",

  // Device ID
  DEVICE_ID: process.env.REACT_APP_DEVICE_ID || "web_" + Math.random().toString(36).substr(2, 9),

  // Logging
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || "info",
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
