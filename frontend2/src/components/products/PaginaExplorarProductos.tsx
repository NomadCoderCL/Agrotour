/**
 * PaginaExplorarProductos - Página principal para explorar productos
 * Usa `apiClient.getProductos()` y cae a `dbOperations.getAllProductos()` si hay error
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Producto } from '@/types/models';
import { apiClient, dbOperations } from '@/services';
import ProductoCard from './ProductoCard';
import ProductoFilter from './ProductoFilter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import getLogger from '@/lib/logger';

const logger = getLogger('PaginaExplorarProductos');

export const PaginaExplorarProductos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<{ query?: string; category?: string }>({});
  const [categories, setCategories] = useState<string[]>([]);

  const loadProductos = useCallback(async (replace = false) => {
    setLoading(true);
    setError(null);

    try {
      const resp = await apiClient.getProductos({ page, query: filters.query, category: filters.category });
      if (resp && Array.isArray(resp.results)) {
        setProductos((prev) => (replace ? resp.results : [...prev, ...resp.results]));
        setHasMore(!!resp.next);
        // Save to IndexedDB for offline fallback
        try {
          await dbOperations.bulkUpsertProductos(resp.results);
        } catch (dbErr) {
          logger.warn('Failed to persist productos locally', dbErr);
        }
      } else {
        throw new Error('Malformed response');
      }
    } catch (err) {
      logger.warn('API fetch failed, falling back to IndexedDB', err);
      try {
        const local = await dbOperations.searchProductos(filters.query || '');
        setProductos(local);
        setHasMore(false);
      } catch (dbErr) {
        logger.error('IndexedDB fallback failed', dbErr);
        setError('No se pudieron cargar los productos');
      }
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    // On filters change, reset page and reload
    setPage(1);
    loadProductos(true);
  }, [filters, loadProductos]);

  useEffect(() => {
    // initial load
    loadProductos(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (apiClient.getCategorias) {
          const resp = await apiClient.getCategorias();
          if (Array.isArray(resp)) setCategories(resp);
        }
      } catch (err) {
        logger.warn('Failed to load categories', err);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setPage((p) => p + 1);
  };

  useEffect(() => {
    if (page > 1) loadProductos();
  }, [page, loadProductos]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Explorar Productos</h1>

      <ProductoFilter
        categories={categories}
        onChange={(payload) => setFilters(payload)}
      />

      {loading && productos.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {hasMore ? (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        ) : (
          <div className="text-sm text-gray-500">No hay más productos</div>
        )}
      </div>
    </div>
  );
};

export default PaginaExplorarProductos;
