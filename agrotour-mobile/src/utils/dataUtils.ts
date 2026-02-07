import { dataService, Product, Producer } from '@/services/DataService';
import { globalErrorStore } from '@/services/GlobalErrorStore';

/**
 * Hook para cargar productos con manejo automático de error
 * Returns { products, isLoading, error, refetch }
 */
export async function fetchProducts(forceRefresh = false) {
  try {
    return await dataService.getProducts(forceRefresh);
  } catch (err) {
    globalErrorStore.setError(
      'NETWORK_ERROR',
      'No se pudieron cargar los productos. Usa el cache.',
      { error: String(err) }
    );
    throw err;
  }
}

/**
 * Hook para cargar productores con manejo automático de error
 */
export async function fetchProducers(forceRefresh = false) {
  try {
    return await dataService.getProducers(forceRefresh);
  } catch (err) {
    globalErrorStore.setError(
      'NETWORK_ERROR',
      'No se pudieron cargar los productores. Usa el cache.',
      { error: String(err) }
    );
    throw err;
  }
}

/**
 * Hook para buscar productos
 */
export async function searchProducts(query: string) {
  try {
    return await dataService.searchProducts(query);
  } catch (err) {
    globalErrorStore.setError(
      'NETWORK_ERROR',
      `Error al buscar "${query}". Por favor intenta de nuevo.`,
      { query, error: String(err) }
    );
    return [];
  }
}

/**
 * Obtener producto específico con fallback a cache
 */
export async function getProductById(id: number): Promise<Product | null> {
  try {
    return await dataService.getProduct(id);
  } catch (err) {
    globalErrorStore.setError(
      'NETWORK_ERROR',
      'No se pudo cargar el producto. Intenta de nuevo.',
      { product_id: id, error: String(err) }
    );
    return null;
  }
}

/**
 * Obtener productor específico
 */
export async function getProducerById(id: number): Promise<Producer | null> {
  try {
    return await dataService.getProducer(id);
  } catch (err) {
    globalErrorStore.setError(
      'NETWORK_ERROR',
      'No se pudo cargar el productor. Intenta de nuevo.',
      { producer_id: id, error: String(err) }
    );
    return null;
  }
}

/**
 * Obtener productos de un productor específico
 */
export async function getProductsByProducerId(producerId: number) {
  try {
    return await dataService.getProductsByProducer(producerId);
  } catch (err) {
    globalErrorStore.setError(
      'NETWORK_ERROR',
      'No se pudieron cargar los productos del productor.',
      { producer_id: producerId, error: String(err) }
    );
    return [];
  }
}

/**
 * Validador de respuesta API - asegurar estructura correcta
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    total: number;
    page: number;
    page_size: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export function validateApiResponse<T>(response: any): ApiResponse<T> {
  if (!response) {
    throw new Error('Empty API response');
  }

  // Validar estructura básica
  if (typeof response !== 'object') {
    throw new Error('Invalid API response format');
  }

  return {
    success: response.success !== false,
    data: response.data,
    meta: response.meta,
    error: response.error,
  };
}

/**
 * Verificar que los datos cumplan contrato esperado
 */
export function validateDataContract(
  data: any,
  requiredFields: string[]
): boolean {
  if (!data) return false;
  return requiredFields.every((field) => field in data);
}

/**
 * Preload datos críticos en background
 * Ejecutar al iniciar la app
 */
export async function preloadCriticalData() {
  try {
    console.log('[DataUtils] Preloading critical data...');
    await dataService.preloadCriticalData();
    console.log('[DataUtils] Preload complete');
  } catch (err) {
    console.error('[DataUtils] Preload failed (non-blocking):', err);
  }
}

/**
 * Limpiar datos obsoletos periodicamente
 */
export async function cleanupObsoleteData() {
  try {
    console.log('[DataUtils] Cleaning up obsolete data...');
    await dataService.clearProductCache();
    console.log('[DataUtils] Cleanup complete');
  } catch (err) {
    console.error('[DataUtils] Cleanup failed:', err);
  }
}

/**
 * Obtener estadísticas de performance del cache
 */
export async function getCacheStats() {
  try {
    return await dataService.getCacheStats();
  } catch (err) {
    console.error('[DataUtils] Failed to get cache stats:', err);
    return { totalCacheSize: 0, cacheItems: 0, lastRefresh: null };
  }
}
