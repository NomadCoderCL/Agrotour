import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../shared/api';
import { globalErrorStore } from '../services/GlobalErrorStore';
import { useAuth } from './AuthContext';

export interface SyncOperation {
  id: string;
  type: 'cart_item' | 'order' | 'review';
  data: any;
  status: 'pending' | 'failed';
  retry_count: number;
  created_at: string;
}

interface SyncContextType {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  addSyncOperation: (type: SyncOperation['type'], data: any) => Promise<void>;
  syncNow: () => Promise<void>;
  clearSyncQueue: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const SYNC_QUEUE_KEY = 'sync_queue_operations';
const LAST_SYNC_KEY = 'last_sync_time';

export function SyncProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [queue, setQueue] = useState<SyncOperation[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedQueue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
        if (storedQueue) {
          setQueue(JSON.parse(storedQueue));
        }

        const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
        if (lastSync) setLastSyncTime(lastSync);
      } catch (err) {
        console.error('[SyncProvider] Failed to load state:', err);
      }
    };
    loadState();
  }, []);

  // Persist queue whenever it changes
  useEffect(() => {
    const saveQueue = async () => {
      try {
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      } catch (err) {
        console.error('[SyncProvider] Failed to save queue:', err);
      }
    };
    saveQueue();
  }, [queue]);

  // Auto-sync
  useEffect(() => {
    if (!isAuthenticated || queue.length === 0) return;

    const interval = setInterval(() => {
      if (!isSyncing) syncNow();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, queue.length, isSyncing]);

  const addSyncOperation = useCallback(async (type: SyncOperation['type'], data: any) => {
    const newOp: SyncOperation = {
      id: Date.now().toString(),
      type,
      data,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString(),
    };

    setQueue(prev => [...prev, newOp]);
  }, []);

  const syncNow = useCallback(async () => {
    if (!isAuthenticated || isSyncing || queue.length === 0) return;

    setIsSyncing(true);
    let updatedQueue = [...queue];
    let hasChanges = false;

    try {
      // Process pending items
      const pending = updatedQueue.filter(op => op.status === 'pending');

      for (const op of pending) {
        try {
          if (op.type === 'cart_item') {
            await apiClient.post('/cart/items/', op.data);
          } else if (op.type === 'order') {
            await apiClient.post('/orders/', op.data);
          } else if (op.type === 'review') {
            await apiClient.post('/reviews/', op.data);
          }

          // Success: remove from queue
          updatedQueue = updatedQueue.filter(item => item.id !== op.id);
          hasChanges = true;

        } catch (err) {
          console.error(`[SyncProvider] Op ${op.id} failed:`, err);
          // Increment retry
          const index = updatedQueue.findIndex(item => item.id === op.id);
          if (index !== -1) {
            updatedQueue[index].retry_count += 1;
            if (updatedQueue[index].retry_count >= 3) {
              updatedQueue[index].status = 'failed';
              globalErrorStore.setError(
                'NETWORK_ERROR',
                'No se pudo sincronizar algunos cambios.',
                { entity: op.type }
              );
            }
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        setQueue(updatedQueue);
      }

      const now = new Date().toISOString();
      setLastSyncTime(now);
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);

    } catch (err) {
      console.error('[SyncProvider] Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, isSyncing, queue]);

  const clearSyncQueue = useCallback(async () => {
    setQueue([]);
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  }, []);

  return (
    <SyncContext.Provider value={{
      isSyncing,
      pendingCount: queue.length,
      lastSyncTime,
      addSyncOperation,
      syncNow,
      clearSyncQueue,
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}
