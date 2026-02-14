import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { syncService } from '../services/SyncService';
import { databaseManager } from '../database/DatabaseManager';

interface SyncContextType {
  isSyncing: boolean;
  pendingCount: number;
  isConnected: boolean | null;
  forceSync: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useNetInfo();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const db = databaseManager.getDatabase();

  const updatePendingCount = useCallback(() => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as count FROM offline_queue WHERE status = 'PENDING' OR status = 'RETRY';`,
        [],
        (_, { rows: { _array } }) => setPendingCount(_array[0].count),
        (_, error) => {
          console.error("Failed to update pending count:", error);
          return true;
        }
      );
    });
  }, [db]);

  // Efecto para procesar la cola cuando vuelve la conexión
  useEffect(() => {
    if (isConnected) {
      console.log('[SyncContext] Connection detected, triggering sync.');
      forceSync();
    }
  }, [isConnected]);

  // Efecto para mantener el contador de pendientes actualizado
  useEffect(() => {
    const interval = setInterval(updatePendingCount, 5000); // Actualiza cada 5 segundos
    updatePendingCount(); // Llamada inicial
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  const forceSync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await syncService.processQueue();
    } catch (error) {
      console.error('[SyncContext] Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
      updatePendingCount(); // Actualizar contador al finalizar
    }
  }, [isSyncing, updatePendingCount]);

  return (
    <SyncContext.Provider value={{
      isSyncing,
      pendingCount,
      isConnected,
      forceSync,
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
