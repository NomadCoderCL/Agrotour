import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { productService } from '../services/ProductService';
import { Product } from '../shared/types';
// En el futuro, podríamos inyectar un servicio de network status aquí.

interface ProductContextData {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  forceSync: () => Promise<void>;
}

const ProductContext = createContext<ProductContextData>({} as ProductContextData);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSyncProducts = useCallback(async (isForced = false) => {
    if (!isForced) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // 1. Cargar datos locales inmediatamente para una UI rápida y responsiva.
      const localProducts = await productService.getLocalProducts();
      if (localProducts.length > 0) {
        setProducts(localProducts);
      }
    } catch (e) {
      console.error("Failed to load local products", e);
      setError("No se pudieron cargar los productos locales.");
    }

    // 2. Sincronizar con el backend en segundo plano.
    try {
      await productService.syncProducts();
      const freshProducts = await productService.getLocalProducts();
      setProducts(freshProducts);
    } catch (e) {
      console.warn("Failed to sync products, running with local data.", e);
      // No se considera un error fatal, la app sigue funcionando.
      // La UI ya muestra los datos locales si los había.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial al montar el provider.
    fetchAndSyncProducts();
  }, [fetchAndSyncProducts]);

  return (
    <ProductContext.Provider value={{ products, isLoading, error, forceSync: () => fetchAndSyncProducts(true) }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
