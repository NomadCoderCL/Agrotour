/**
 * Hook: useSync
 * Maneja sincronización automática en background
 */

import { useEffect, useRef, useState } from "react";
import { syncClient, SyncResult } from "../services/sync";
import { dbOperations } from "../services/db";
import { setupConnectivityListener, isOnline } from "../services/serviceWorker";
import { getLogger } from "../lib/logger";

const logger = getLogger("useSync");

export interface UseSyncState {
  isSyncing: boolean;
  isOnline: boolean;
  pendingOperations: number;
  lastSyncTime?: Date;
  error?: string;
  syncNow: () => Promise<void>;
}

const SYNC_INTERVAL_MS = 30000; // Sincronizar cada 30s si hay cambios

export function useSync(): UseSyncState {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnlineState, setIsOnlineState] = useState(isOnline());
  const [pendingOps, setPendingOps] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date>();
  const [error, setError] = useState<string>();

  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const cleanupRef = useRef<(() => void) | null>(null);

  /**
   * Realizar sync
   */
  const performSync = async () => {
    if (!isOnlineState) {
      logger.debug("Offline, skipping sync");
      return;
    }

    setIsSyncing(true);
    setError(undefined);

    try {
      const result: SyncResult = await syncClient.syncPush();

      if (result.success) {
        logger.info("Sync successful", {
          accepted: result.accepted.length,
          rejected: result.rejected.length,
        });
        setLastSyncTime(new Date());
      } else {
        setError(result.message || "Sync failed");
      }

      // Actualizar contador de operaciones pendientes
      const pending = await syncClient.getPendingOperations();
      setPendingOps(pending.length);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      logger.error("Sync error", err as Error);
      setError(errorMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Sincronizar ahora (manual)
   */
  const syncNow = async () => {
    await performSync();
  };

  /**
   * Setup: conectividad + sync automático
   */
  useEffect(() => {
    // Listeners de conectividad
    cleanupRef.current = setupConnectivityListener(
      () => {
        logger.info("Online");
        setIsOnlineState(true);
        // Sincronizar inmediatamente cuando vuelve online
        performSync();
      },
      () => {
        logger.info("Offline");
        setIsOnlineState(false);
      }
    );

    // Sincronizar periódicamente
    syncIntervalRef.current = setInterval(async () => {
      const pending = await syncClient.getPendingOperations();
      setPendingOps(pending.length);

      if (pending.length > 0 && isOnlineState) {
        logger.debug("Auto-syncing pending operations");
        await performSync();
      }
    }, SYNC_INTERVAL_MS);

    // Sincronización inicial
    performSync();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnlineState]);

  return {
    isSyncing,
    isOnline: isOnlineState,
    pendingOperations: pendingOps,
    lastSyncTime,
    error,
    syncNow,
  };
}

/**
 * Hook: useSyncOperation
 * Crear y encolar operación para sync
 */
import { SyncOperation, OperationType, EntityType } from "../types/models";

export function useSyncOperation() {
  const enqueueOperation = async (
    type: OperationType,
    entityType: EntityType,
    entityId: string,
    data: any
  ): Promise<void> => {
    const operation = syncClient.createOperation(type, entityType, entityId, data);
    await syncClient.enqueueOperation(operation);
    logger.info("Operation enqueued", { type, entityType });
  };

  return { enqueueOperation };
}

/**
 * Hook: useSyncConflicts
 * Resolver conflictos
 */
import { SyncConflict } from "../types/models";

export function useSyncConflicts() {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConflicts = async () => {
    setIsLoading(true);
    try {
      const unresolved = await syncClient.getUnresolvedConflicts();
      setConflicts(unresolved);
    } catch (error) {
      logger.error("Failed to load conflicts", error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveConflict = async (conflictId: string, resolution: "LOCAL" | "REMOTE") => {
    try {
      await syncClient.resolveConflict(conflictId, resolution);
      setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
    } catch (error) {
      logger.error("Failed to resolve conflict", error as Error);
      throw error;
    }
  };

  useEffect(() => {
    loadConflicts();
  }, []);

  return { conflicts, isLoading, resolveConflict, reload: loadConflicts };
}
