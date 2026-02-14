// src/config/env.ts
const env = import.meta.env;

// Detectar modo de producción
const isProduction = env.MODE === 'production';
const isDevelopment = env.MODE === 'development';

// URL del API con fallback inteligente
const API_URL = env.VITE_API_URL?.replace(/\/$/, '') ||  // quita trailing slash
  (isProduction
    ? 'https://agrotour.onrender.com'
    : 'http://localhost:8000');

// Configuración exportada
export const config = {
  // API Configuration
  apiUrl: API_URL,
  apiBaseUrl: API_URL,  // Misma que apiUrl (evita duplicación)
  apiTimeout: parseInt(env.VITE_API_TIMEOUT || '30000', 10),

  // App Configuration
  appName: env.VITE_APP_NAME || 'Agrotour',
  environment: env.VITE_ENVIRONMENT || (isProduction ? 'production' : 'development'),
  deviceId: env.VITE_DEVICE_ID || 'web_1',

  // Features
  enableServiceWorker: isProduction || env.VITE_ENABLE_SERVICE_WORKER === 'true',
  enableOfflineMode: env.VITE_ENABLE_OFFLINE_MODE !== 'false', // true por defecto

  // Sync Configuration
  syncInterval: parseInt(env.VITE_SYNC_INTERVAL || '60000', 10),
  retryAttempts: parseInt(env.VITE_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(env.VITE_RETRY_DELAY || '1000', 10),

  // Debug
  debugMode: isDevelopment || env.VITE_DEBUG_MODE === 'true',
};

// Logging solo en desarrollo o si debug está habilitado
if (config.debugMode) {
  console.group('🔧 Environment Configuration');
  console.log('API URL:', config.apiUrl);
  console.log('Environment:', config.environment);
  console.log('Mode:', env.MODE);
  console.log('Service Worker:', config.enableServiceWorker);
  console.log('Offline Mode:', config.enableOfflineMode);
  console.groupEnd();
} else {
  // En producción, solo un log simple
  console.log('🔧 Config loaded:', {
    apiUrl: config.apiUrl,
    environment: config.environment,
    mode: env.MODE,
  });
}

// Validación en producción (sin warnings molestos en dev)
if (isProduction) {
  const requiredVars = {
    VITE_API_URL: env.VITE_API_URL,
    VITE_APP_NAME: env.VITE_APP_NAME,
    VITE_ENVIRONMENT: env.VITE_ENVIRONMENT,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
    console.warn('   Using fallback values. Set these in Vercel for production.');

    // Uncomment para fallar el build si faltan variables críticas
    // throw new Error(`Missing required env variables: ${missingVars.join(', ')}`);
  }
}

// Export default para compatibilidad
export default config;
