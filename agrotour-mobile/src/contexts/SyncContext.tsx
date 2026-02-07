import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getSqliteDB } from '@/services/SqliteDB';
import { apiClient } from '@/shared/api';
import { globalErrorStore } from '@/services/GlobalErrorStore';
import { useAuth } from './AuthContextV2';

export interface SyncOperation {
  id: string;
  op_json: string;
  entity_type: string;
  status: 'pending' | 'synced' | 'failed';
  retry_count: number;
  created_at: string;
  updated_at: string;
}

interface SyncContextType {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  addSyncOperation: (entityType: string, operation: any) => Promise<void>;
  syncNow: () => Promise<void>;
  clearSyncQueue: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Cargar estado inicial
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const db = getSqliteDB();
        const stats = await db.getStats();
        setPendingCount(stats.sync_queue_count);
        
        // Cargar último sync time
        const lastSync = localStorage.getItem('lastSyncTime');
        if (lastSync) setLastSyncTime(lastSync);
      } catch (err) {
        console.error('[SyncProvider] Failed to load initial state:', err);
      }
    };
    loadInitialState();
  }, []);

  // Auto-sync cada 30 segundos si hay items pendientes
  useEffect(() => {
    if (!isAuthenticated || !pendingCount) return;

    const syncInterval = setInterval(() => {
      syncNow();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [isAuthenticated, pendingCount]);

  const addSyncOperation = useCallback(
    async (entityType: string, operation: any) => {
      try {
        const db = getSqliteDB();
        await db.addSyncOperation(entityType, operation);
        
        // Actualizar contador
        const stats = await db.getStats();
        setPendingCount(stats.sync_queue_count);
      } catch (err) {
        console.error('[SyncProvider] Failed to add sync operation:', err);
        throw err;
      }
    },
    []
  );

  const syncNow = useCallback(async () => {
    if (!isAuthenticated || isSyncing) return;

    setIsSyncing(true);
    try {
      const db = getSqliteDB();
      const pending = await db.getPendingSyncOperations();

      if (pending.length === 0) {
        setIsSyncing(false);
        return;
      }

      // Procesar en lotes de 5
      for (let i = 0; i < pending.length; i += 5) {
        const batch = pending.slice(i, i + 5);
        
        for (const op of batch) {
          try {
            const operation = JSON.parse(op.op_json);
            
            // Ejecutar operación según tipo
            let response;
            if (op.entity_type === 'cart_item') {
              response = await apiClient.post('/cart/items/', operation);
            } else if (op.entity_type === 'order') {
              response = await apiClient.post('/orders/', operation);
            } else if (op.entity_type === 'review') {
              response = await apiClient.post('/reviews/', operation);
            }

            // Marcar como synced
            await db.updateSyncStatus(op.id, 'synced');
            await db.deleteSyncOperation(op.id);
          } catch (err: any) {
            // Incrementar retry count
            if (op.retry_count < 3) {
              await db.incrementRetryCount(op.id);
            } else {
              // Después de 3 intentos, fallar
              await db.updateSyncStatus(op.id, 'failed');
              globalErrorStore.setError(
                'NETWORK_ERROR',
                'No se pudo sincronizar algunos cambios. Intentaremos más tarde.',
                { entity: op.entity_type, retries: 3 }
              );
            }
          }
        }
      }

      // Actualizar estado final
      const stats = await db.getStats();
      setPendingCount(stats.sync_queue_count);
      setLastSyncTime(new Date().toISOString());
      localStorage.setItem('lastSyncTime', new Date().toISOString());
    } catch (err) {
      console.error('[SyncProvider] Sync failed:', err);
      globalErrorStore.setError(
        'NETWORK_ERROR',
        'Error de sincronización. Reintentar en 30 segundos.',
        { error: String(err) }
      );
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, isSyncing]);

  const clearSyncQueue = useCallback(async () => {
    try {
      const db = getSqliteDB();
      const pending = await db.getPendingSyncOperations();
      
      for (const op of pending) {
        await db.deleteSyncOperation(op.id);
      }
      
      setPendingCount(0);
    } catch (err) {
      console.error('[SyncProvider] Failed to clear sync queue:', err);
      throw err;
    }
  }, []);

  const value: SyncContextType = {
    isSyncing,
    pendingCount,
    lastSyncTime,
    addSyncOperation,
    syncNow,
    clearSyncQueue,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}
