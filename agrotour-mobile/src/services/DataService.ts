import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../shared/api';
import { Producto, Productor } from '../shared/types';

// English type aliases for convenience
export type Product = Producto;
export type Producer = Productor;

// Interface interna para lo que viene de la API (precio string)
interface ApiProduct extends Omit<Producto, 'precio'> {
  precio: string | number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas en ms
const CACHE_KEYS = {
  PRODUCTS_LIST: 'cache_products_list',
  PRODUCERS_LIST: 'cache_producers_list',
  PRODUCT_PREFIX: 'cache_product_',
  PRODUCER_PREFIX: 'cache_producer_',
};

interface CachedData<T> {
  data: T;
  timestamp: number;
}

class DataService {
  /**
   * Helper para guardar en cache con timestamp
   */
  private async setCache<T>(key: string, data: T): Promise<void> {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cached));
  }

  /**
   * Helper para obtener del cache si no está expirado
   */
  private async getCache<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const cached: CachedData<T> = JSON.parse(item);
      const now = Date.now();

      if (now - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      // Cache expirado
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Helper to parse product from API
   */
  private parseProduct(p: ApiProduct): Producto {
    const rawPrice = p.precio;
    const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;
    return {
      ...p,
      precio: isNaN(price) ? 0 : price,
    };
  }

  /**
   * Obtener productos con cache-first strategy
   */
  async getProducts(forceRefresh = false): Promise<Producto[]> {
    try {
      // Intentar cache primero
      if (!forceRefresh) {
        const cached = await this.getCache<Producto[]>(CACHE_KEYS.PRODUCTS_LIST);
        if (cached) {
          return cached;
        }
      }

      // Fetch from API
      const data = await apiClient.get<{ results: ApiProduct[] }>('/api/productos/');
      const rawProducts = data.results || [];
      const products = rawProducts.map(this.parseProduct);

      // Guardar en cache
      await this.setCache(CACHE_KEYS.PRODUCTS_LIST, products);

      return products;
    } catch (err) {
      console.error('[DataService] Failed to get products:', err);

      // Fallback: intentar devolver cache aunque esté expirado
      try {
        const item = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS_LIST);
        if (item) {
          const cached: CachedData<Producto[]> = JSON.parse(item);
          return cached.data;
        }
      } catch { }

      throw err;
    }
  }

  /**
   * Obtener un producto específico
   */
  async getProduct(id: number): Promise<Producto> {
    try {
      const cacheKey = `${CACHE_KEYS.PRODUCT_PREFIX}${id}`;

      // Intentar cache primero
      const cached = await this.getCache<Producto>(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from API
      const rawProduct = await apiClient.get<ApiProduct>(`/productos/${id}/`);
      const product = this.parseProduct(rawProduct);

      // Guardar en cache
      await this.setCache(cacheKey, product);

      return product;
    } catch (err) {
      console.error(`[DataService] Failed to get product ${id}:`, err);

      // Fallback a cache expirado (intento simple)
      try {
        const item = await AsyncStorage.getItem(`${CACHE_KEYS.PRODUCT_PREFIX}${id}`);
        if (item) {
          const cached: CachedData<Producto> = JSON.parse(item);
          return cached.data;
        }
      } catch { }

      throw err;
    }
  }

  /**
   * Buscar productos por término
   */
  async searchProducts(query: string): Promise<Producto[]> {
    try {
      const data = await apiClient.get<{ results: ApiProduct[] }>(
        '/productos/',
        { params: { search: query } }
      );
      return (data.results || []).map(this.parseProduct);
    } catch (err) {
      console.error('[DataService] Product search failed:', err);
      throw err;
    }
  }

  /**
   * Obtener productores con cache-first
   */
  async getProducers(forceRefresh = false): Promise<Productor[]> {
    try {
      // Intentar cache primero
      if (!forceRefresh) {
        const cached = await this.getCache<Productor[]>(CACHE_KEYS.PRODUCERS_LIST);
        if (cached) {
          return cached;
        }
      }

      // Fetch from API
      const data = await apiClient.get<{ results: Productor[] }>('/productores/');
      const producers = data.results || [];

      // Cache
      await this.setCache(CACHE_KEYS.PRODUCERS_LIST, producers);

      return producers;
    } catch (err) {
      console.error('[DataService] Failed to get producers:', err);

      // Fallback cache
      try {
        const item = await AsyncStorage.getItem(CACHE_KEYS.PRODUCERS_LIST);
        if (item) {
          const cached: CachedData<Productor[]> = JSON.parse(item);
          return cached.data;
        }
      } catch { }

      throw err;
    }
  }

  /**
   * Obtener un productor específico
   */
  async getProducer(id: number): Promise<Productor> {
    try {
      const cacheKey = `${CACHE_KEYS.PRODUCER_PREFIX}${id}`;

      const cached = await this.getCache<Productor>(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch
      const producer = await apiClient.get<Productor>(`/productores/${id}/`);
      await this.setCache(cacheKey, producer);

      return producer;
    } catch (err) {
      console.error(`[DataService] Failed to get producer ${id}:`, err);
      throw err;
    }
  }

  /**
   * Obtener productos por productor
   */
  async getProductsByProducer(producerId: number): Promise<Producto[]> {
    try {
      // No cache specific for this query yet, just fetch
      const data = await apiClient.get<{ results: ApiProduct[] }>(
        `/productores/${producerId}/productos/`
      );
      return (data.results || []).map(this.parseProduct);
    } catch (err) {
      console.error(`[DataService] Failed to get products for producer ${producerId}:`, err);
      return [];
    }
  }

  /**
   * Limpiar todo el cache de productos
   */
  async clearProductCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k: string) => k.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('[DataService] Product cache cleared');
    } catch (err) {
      console.error('[DataService] Failed to clear cache:', err);
    }
  }

  /**
   * Precargar datos críticos en background
   */
  async preloadCriticalData(): Promise<void> {
    try {
      console.log('[DataService] Preloading critical data...');

      // Fetch products y producers en paralelo
      await Promise.all([
        this.getProducts(),
        this.getProducers(),
      ]);

      console.log('[DataService] Preloading complete');
    } catch (err) {
      console.error('[DataService] Preloading failed (non-critical):', err);
    }
  }

  /**
   * Obtener estadísticas de cache
   */
  async getCacheStats(): Promise<{
    totalCacheSize: number;
    cacheItems: number;
    lastRefresh: string | null;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k: string) => k.startsWith('cache_'));
      const items = await AsyncStorage.multiGet(cacheKeys);

      let totalSize = 0;
      let oldestTimestamp = 0;

      items.forEach(([key, value]: [string, string | null]) => {
        if (value) {
          totalSize += value.length;
          try {
            // Try to parse to find timestamp
            const parsed = JSON.parse(value);
            if (parsed.timestamp && parsed.timestamp > oldestTimestamp) {
              oldestTimestamp = parsed.timestamp;
            }
          } catch { }
        }
      });

      return {
        totalCacheSize: totalSize,
        cacheItems: cacheKeys.length,
        lastRefresh: oldestTimestamp > 0 ? new Date(oldestTimestamp).toISOString() : null,
      };
    } catch (err) {
      console.error('[DataService] Failed to get cache stats:', err);
      return {
        totalCacheSize: 0,
        cacheItems: 0,
        lastRefresh: null,
      };
    }
  }
}

export const dataService = new DataService();
