/**
 * Sync Client
 * Orquesta sincronización entre frontend offline y backend sync engine
 */

import { apiClient } from "./api";
import { dbOperations } from "./db";
import { getLogger } from "../lib/logger";
import {
  SyncOperation,
  SyncPushPayload,
  SyncConflict,
  OperationType,
  EntityType,
} from "@/types/models";
import { config } from "@/config/env";

const logger = getLogger("SyncClient");

export interface SyncResult {
  success: boolean;
  accepted: SyncOperation[];
  rejected: SyncOperation[];
  conflicts: SyncConflict[];
  message?: string;
}

export class SyncClient {
  private deviceId: string;
  private _isSyncing = false;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }

  /**
   * Crear operación de sincronización
   */
  createOperation(
    type: OperationType,
    entityType: EntityType,
    entityId: string,
    data: any
  ): SyncOperation {
    return {
      operation_id: generateUUID(),
      operation_type: type,
      entity_type: entityType,
      entity_id: entityId,
      data,
      lamport_ts: 0, // Será asignado por servidor
      version: 1,
      device_id: this.deviceId,
      timestamp: new Date().toISOString(),
      content_hash: createHash(JSON.stringify(data)),
    };
  }

  /**
   * Encolar operación para sync
   */
  async enqueueOperation(operation: SyncOperation): Promise<void> {
    logger.debug("Enqueuing operation", {
      type: operation.operation_type,
      entity: operation.entity_type,
    });

    await dbOperations.addSyncOperation(operation);
  }

  /**
   * Obtener operaciones pendientes
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    return dbOperations.getPendingSyncOperations();
  }

  /**
   * Sincronizar operaciones pendientes
   */
  async syncPush(): Promise<SyncResult> {
    if (this._isSyncing) {
      logger.warn("Sync already in progress");
      return {
        success: false,
        accepted: [],
        rejected: [],
        conflicts: [],
        message: "Sync already in progress",
      };
    }

    this._isSyncing = true;
    logger.info("Starting sync push");

    try {
      const pendingOps = await this.getPendingOperations();

      if (pendingOps.length === 0) {
        logger.info("No pending operations");
        return {
          success: true,
          accepted: [],
          rejected: [],
          conflicts: [],
          message: "No operations to sync",
        };
      }

      logger.info(`Syncing ${pendingOps.length} operations`);

      const payload: SyncPushPayload = {
        operations: pendingOps,
        device_id: this.deviceId,
        client_version: "1.0.0",
      };

      const response = await apiClient.syncPush(payload);

      logger.info("Sync push completed", {
        accepted: response.accepted.length,
        rejected: response.rejected.length,
        conflicts: response.conflicts_detected,
      });

      // Procesar respuesta
      await this.processSyncResponse(response);

      const result: SyncResult = {
        success: response.conflicts_detected === 0,
        accepted: response.accepted,
        rejected: response.accepted,
        conflicts: [],
      };

      return result;
    } catch (error) {
      logger.error("Sync push failed", error as Error);
      return {
        success: false,
        accepted: [],
        rejected: [],
        conflicts: [],
        message: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      this._isSyncing = false;
    }
  }

  /**
   * Procesar respuesta de /sync/push
   */
  private async processSyncResponse(response: any): Promise<void> {
    // Eliminar operaciones aceptadas
    for (const op of response.accepted) {
      await dbOperations.deleteSyncOperation(op.operation_id);
    }

    // Procesar conflictos
    if (response.conflicts_detected > 0) {
      logger.warn(`${response.conflicts_detected} conflicts detected`);

      for (const conflict of response.rejected) {
        await dbOperations.addSyncConflict({
          id: conflict.conflict_id,
          operation_id: conflict.operation_id,
          conflicting_operation_id: conflict.conflicting_operation_id,
          conflict_type: conflict.conflict_type,
          resolution_level: conflict.resolution_level,
          resolved: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Actualizar sync state
    const syncState = await dbOperations.getSyncState();
    if (syncState) {
      await dbOperations.updateSyncState({
        last_sync: new Date().toISOString(),
        last_lamport_ts: response.new_lamport_ts,
      });
    }
  }

  /**
   * Sincronizar pull (descargar cambios desde servidor)
   */
  async syncPull(since?: number): Promise<SyncOperation[]> {
    try {
      logger.info("Starting sync pull", { since });

      const response = await apiClient.syncPull({
        since_lamport_ts: since || 0,
        since_version: 0,
        limit: 100,
      });

      logger.info(`Downloaded ${response.operations.length} operations`);

      // Guardar en local
      if (response.operations.length > 0) {
        await dbOperations.addSyncOperations(response.operations);
      }

      return response.operations;
    } catch (error) {
      logger.error("Sync pull failed", error as Error);
      throw error;
    }
  }

  /**
   * Resolver conflicto manualmente
   */
  async resolveConflict(
    conflictId: string,
    resolution: "LOCAL" | "REMOTE" | "MERGED"
  ): Promise<void> {
    logger.info("Resolving conflict", { conflictId, resolution });

    try {
      await apiClient.resolveConflict(conflictId, resolution as any);
      await dbOperations.resolveSyncConflict(conflictId, resolution);
    } catch (error) {
      logger.error("Conflict resolution failed", error as Error);
      throw error;
    }
  }

  /**
   * Obtener conflictos no resueltos
   */
  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    return dbOperations.getUnresolvedConflicts();
  }

  /**
   * Forzar sync ahora
   */
  async forceSyncNow(): Promise<SyncResult> {
    logger.info("Force syncing now");
    return this.syncPush();
  }

  /**
   * Obtener estado
   */
  get isSyncing(): boolean {
    return this._isSyncing;
  }

  /**
   * Iniciar sincronización automática
   */
  startAutoSync(): void {
    if (config.syncInterval > 0) {
      logger.info(`Starting auto-sync every ${config.syncInterval}ms`);
      setInterval(() => {
        if (!this._isSyncing) {
          this.syncPush().catch(err => logger.error("Auto-sync failed", err));
        }
      }, config.syncInterval);
    }
  }
}

/**
 * ==================
 * HELPERS
 * ==================
 */

/**
 * Generar UUID v4
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Crear hash simple (no seguro, solo para idempotencia)
 */
export function createHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Singleton
export const syncClient = new SyncClient(
  config.deviceId
);

// Iniciar auto-sync si está configurado
syncClient.startAutoSync();

export default SyncClient;
