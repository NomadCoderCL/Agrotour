import { getSqliteDB } from './SqliteDB';
import { apiClient } from '@/shared/api';
import { config } from '@/shared/config';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string; // String para evitar float precision
  stock: number;
  imagen: string;
  productor_id: number;
  metodo_venta: string;
  categoria: string;
  creado_en: string;
}

export interface Producer {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  latitud: string;
  longitud: string;
  telefono: string;
  email: string;
  certificado: boolean;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas en ms

class DataService {
  private db = getSqliteDB();

  /**
   * Obtener productos con cache-first strategy
   * Si el cache es fresco (< 24h), devuelve del cache
   * Si no, hace fetch y actualiza cache
   */
  async getProducts(forceRefresh = false): Promise<Product[]> {
    try {
      const now = Date.now();
      const cached = await this.db.getCachedProduct('products_list');

      // Si cache es fresco y no forceRefresh, devolver cache
      if (!forceRefresh && cached) {
        const cacheTime = new Date(cached.updated_at).getTime();
        if (now - cacheTime < CACHE_TTL) {
          console.log('[DataService] Returning cached products');
          return JSON.parse(cached.data_json) as Product[];
        }
      }

      // Fetch from API
      console.log('[DataService] Fetching products from API');
      const response = await apiClient.get<{ results: Product[] }>('/productos/');
      const products = response.data.results || [];

      // Guardar en cache
      await this.db.cacheProduct('products_list', { results: products });

      return products;
    } catch (err) {
      console.error('[DataService] Failed to get products:', err);
      
      // Fallback: intentar devolver cache aunque esté expirado
      try {
        const cached = await this.db.getCachedProduct('products_list');
        if (cached) {
          console.log('[DataService] Using stale cache due to error');
          return JSON.parse(cached.data_json) as Product[];
        }
      } catch (fallbackErr) {
        console.error('[DataService] Fallback cache also failed:', fallbackErr);
      }
      
      throw err;
    }
  }

  /**
   * Obtener un producto específico
   */
  async getProduct(id: number): Promise<Product> {
    try {
      const cacheKey = `product_${id}`;
      const now = Date.now();
      const cached = await this.db.getCachedProduct(cacheKey);

      if (cached) {
        const cacheTime = new Date(cached.updated_at).getTime();
        if (now - cacheTime < CACHE_TTL) {
          return JSON.parse(cached.data_json) as Product;
        }
      }

      // Fetch from API
      const response = await apiClient.get<Product>(`/productos/${id}/`);
      await this.db.cacheProduct(cacheKey, response.data);

      return response.data;
    } catch (err) {
      console.error(`[DataService] Failed to get product ${id}:`, err);
      
      // Fallback a cache expirado
      try {
        const cacheKey = `product_${id}`;
        const cached = await this.db.getCachedProduct(cacheKey);
        if (cached) return JSON.parse(cached.data_json) as Product;
      } catch {}
      
      throw err;
    }
  }

  /**
   * Buscar productos por término
   */
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await apiClient.get<{ results: Product[] }>(
        '/productos/',
        { params: { search: query } }
      );
      return response.data.results || [];
    } catch (err) {
      console.error('[DataService] Product search failed:', err);
      throw err;
    }
  }

  /**
   * Obtener productores con cache-first
   */
  async getProducers(forceRefresh = false): Promise<Producer[]> {
    try {
      const now = Date.now();
      const cached = await this.db.getCachedProduct('producers_list');

      if (!forceRefresh && cached) {
        const cacheTime = new Date(cached.updated_at).getTime();
        if (now - cacheTime < CACHE_TTL) {
          console.log('[DataService] Returning cached producers');
          return JSON.parse(cached.data_json) as Producer[];
        }
      }

      // Fetch from API
      console.log('[DataService] Fetching producers from API');
      const response = await apiClient.get<{ results: Producer[] }>('/productores/');
      const producers = response.data.results || [];

      // Cache
      await this.db.cacheProduct('producers_list', { results: producers });

      return producers;
    } catch (err) {
      console.error('[DataService] Failed to get producers:', err);
      
      // Fallback cache
      try {
        const cached = await this.db.getCachedProduct('producers_list');
        if (cached) {
          console.log('[DataService] Using stale cache for producers');
          return JSON.parse(cached.data_json) as Producer[];
        }
      } catch {}
      
      throw err;
    }
  }

  /**
   * Obtener un productor específico
   */
  async getProducer(id: number): Promise<Producer> {
    try {
      const cacheKey = `producer_${id}`;
      const now = Date.now();
      const cached = await this.db.getCachedProduct(cacheKey);

      if (cached) {
        const cacheTime = new Date(cached.updated_at).getTime();
        if (now - cacheTime < CACHE_TTL) {
          return JSON.parse(cached.data_json) as Producer;
        }
      }

      // Fetch
      const response = await apiClient.get<Producer>(`/productores/${id}/`);
      await this.db.cacheProduct(cacheKey, response.data);

      return response.data;
    } catch (err) {
      console.error(`[DataService] Failed to get producer ${id}:`, err);
      
      // Fallback
      try {
        const cacheKey = `producer_${id}`;
        const cached = await this.db.getCachedProduct(cacheKey);
        if (cached) return JSON.parse(cached.data_json) as Producer;
      } catch {}
      
      throw err;
    }
  }

  /**
   * Obtener productos por productor
   */
  async getProductsByProducer(producerId: number): Promise<Product[]> {
    try {
      const cacheKey = `producer_${producerId}_products`;
      const now = Date.now();
      const cached = await this.db.getCachedProduct(cacheKey);

      if (cached) {
        const cacheTime = new Date(cached.updated_at).getTime();
        if (now - cacheTime < CACHE_TTL) {
          return JSON.parse(cached.data_json) as Product[];
        }
      }

      // Fetch
      const response = await apiClient.get<{ results: Product[] }>(
        `/productores/${producerId}/productos/`
      );
      const products = response.data.results || [];
      await this.db.cacheProduct(cacheKey, { results: products });

      return products;
    } catch (err) {
      console.error(`[DataService] Failed to get products for producer ${producerId}:`, err);
      
      // Fallback
      try {
        const cacheKey = `producer_${producerId}_products`;
        const cached = await this.db.getCachedProduct(cacheKey);
        if (cached) return JSON.parse(cached.data_json) as Product[];
      } catch {}
      
      return [];
    }
  }

  /**
   * Limpiar todo el cache de productos
   */
  async clearProductCache(): Promise<void> {
    try {
      await this.db.clearProductCache();
      console.log('[DataService] Product cache cleared');
    } catch (err) {
      console.error('[DataService] Failed to clear cache:', err);
    }
  }

  /**
   * Precargar datos críticos en background
   * Útil al iniciar la app
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
      // No throw - es background
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
      const all = await this.db.getAllCachedProducts();
      const totalSize = all.reduce((sum, item) => sum + item.data_json.length, 0);
      
      return {
        totalCacheSize: totalSize,
        cacheItems: all.length,
        lastRefresh: all[0]?.updated_at || null,
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
