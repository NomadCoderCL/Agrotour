import { useState, useEffect, useCallback, useRef } from 'react';
import { dataService, Product, Producer } from '@/services/DataService';
import { globalErrorStore } from '@/services/GlobalErrorStore';

export interface UseDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isCached: boolean;
}

/**
 * Hook genérico para cargar datos con cache automático
 * Retorna { data, isLoading, error, refetch, isCached }
 */
export function useData<T>(
  fetcher: () => Promise<T>,
  {
    autoLoad = true,
    showErrorToast = true,
    errorMessage = 'Error al cargar datos',
  } = {}
): UseDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setIsCached(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setError(message);

      if (showErrorToast) {
        globalErrorStore.setError('NETWORK_ERROR', message, { error: String(err) });
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, showErrorToast, errorMessage]);

  const refetch = useCallback(() => fetch(), [fetch]);

  useEffect(() => {
    if (autoLoad) {
      fetch();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetch, autoLoad]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isCached,
  };
}

/**
 * Hook específico para cargar lista de productos
 */
export function useProducts(forceRefresh = false): UseDataState<Product[]> {
  return useData(
    () => dataService.getProducts(forceRefresh),
    {
      autoLoad: true,
      errorMessage: 'No se pudieron cargar los productos',
    }
  );
}

/**
 * Hook específico para cargar lista de productores
 */
export function useProducers(forceRefresh = false): UseDataState<Producer[]> {
  return useData(
    () => dataService.getProducers(forceRefresh),
    {
      autoLoad: true,
      errorMessage: 'No se pudieron cargar los productores',
    }
  );
}

/**
 * Hook para cargar un producto específico
 */
export function useProduct(productId: number | null): UseDataState<Product> {
  return useData(
    () => {
      if (!productId) {
        return Promise.reject(new Error('Product ID is required'));
      }
      return dataService.getProduct(productId);
    },
    {
      autoLoad: !!productId,
      errorMessage: `No se pudo cargar el producto ${productId}`,
    }
  );
}

/**
 * Hook para cargar un productor específico
 */
export function useProducer(producerId: number | null): UseDataState<Producer> {
  return useData(
    () => {
      if (!producerId) {
        return Promise.reject(new Error('Producer ID is required'));
      }
      return dataService.getProducer(producerId);
    },
    {
      autoLoad: !!producerId,
      errorMessage: `No se pudo cargar el productor ${producerId}`,
    }
  );
}

/**
 * Hook para cargar productos de un productor
 */
export function useProducerProducts(
  producerId: number | null
): UseDataState<Product[]> {
  return useData(
    () => {
      if (!producerId) {
        return Promise.reject(new Error('Producer ID is required'));
      }
      return dataService.getProductsByProducer(producerId);
    },
    {
      autoLoad: !!producerId,
      errorMessage: 'No se pudieron cargar los productos del productor',
    }
  );
}

/**
 * Hook para buscar productos
 */
export function useSearchProducts(query: string): UseDataState<Product[]> {
  return useData(
    () => {
      if (!query.trim()) {
        return Promise.resolve([]);
      }
      return dataService.searchProducts(query);
    },
    {
      autoLoad: !!query.trim(),
      errorMessage: `Error al buscar "${query}"`,
    }
  );
}

/**
 * Hook para precargar datos críticos
 */
export function usePreloadData() {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  const preload = useCallback(async () => {
    setIsPreloading(true);
    setPreloadError(null);

    try {
      await dataService.preloadCriticalData();
    } catch (err) {
      const message = 'Error al precargar datos';
      setPreloadError(message);
      console.error('[usePreloadData]', message, err);
    } finally {
      setIsPreloading(false);
    }
  }, []);

  return {
    preload,
    isPreloading,
    preloadError,
  };
}

/**
 * Hook para obtener estadísticas del cache
 */
export function useCacheStats() {
  const [stats, setStats] = useState({
    totalCacheSize: 0,
    cacheItems: 0,
    lastRefresh: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getCacheStats();
      setStats(data);
    } catch (err) {
      console.error('[useCacheStats] Failed to get stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    isLoading,
    refresh,
  };
}

/**
 * Hook para limpiar cache con confirmación
 */
export function useClearCache() {
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(async () => {
    setIsClearing(true);
    setError(null);

    try {
      await dataService.clearProductCache();
    } catch (err) {
      const message = 'Error al limpiar el cache';
      setError(message);
      globalErrorStore.setError('NETWORK_ERROR', message, { error: String(err) });
    } finally {
      setIsClearing(false);
    }
  }, []);

  return {
    clear,
    isClearing,
    error,
  };
}
