/**
 * Sync Logic for Mobile
 * Maneja la cola de operaciones y sincronización con el backend
 */

import { apiClient } from "../shared/api";
import { localDb } from "./local-db";
import {
    SyncOperation,
    SyncPushPayload,
    SyncPushResponse,
    OperationType,
    EntityType,
} from "../shared/types";

export class MobileSyncClient {
    private deviceId: string;
    private isSyncing = false;

    constructor(deviceId: string) {
        this.deviceId = deviceId;
    }

    /**
     * Crear y encolar una operación
     */
    async enqueueOperation(
        type: OperationType,
        entityType: EntityType,
        entityId: string,
        data: any
    ): Promise<void> {
        const operation: SyncOperation = {
            operation_id: this.generateUUID(),
            operation_type: type,
            entity_type: entityType,
            entity_id: entityId,
            data,
            lamport_ts: 0,
            version: 1,
            device_id: this.deviceId,
            timestamp: new Date().toISOString(),
            content_hash: this.createHash(JSON.stringify(data)),
        };

        await localDb.addSyncOperation(operation);
    }

    /**
     * Sincronizar hacia el servidor (Push)
     */
    async syncPush(): Promise<{ success: boolean; message?: string }> {
        if (this.isSyncing) return { success: false, message: "Sync in progress" };

        this.isSyncing = true;
        try {
            const pendingOps = await localDb.getSyncOperations();
            if (pendingOps.length === 0) return { success: true, message: "No pending ops" };

            const payload: SyncPushPayload = {
                operations: pendingOps,
                device_id: this.deviceId,
                client_version: '2.0.0',
            };
            const response = await apiClient.post<SyncPushResponse>('/sync/push/', payload);

            // Limpiar operaciones aceptadas
            for (const op of response.accepted) {
                await localDb.removeSyncOperation(op.operation_id);
            }

            // Actualizar estado de sync
            await localDb.updateSyncState({
                lastSync: new Date().toISOString(),
            });

            return { success: response.conflicts_detected === 0 };
        } catch (error) {
            console.error("Mobile Sync Push Error:", error);
            return { success: false, message: "Network error" };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Helpers
     */
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    private createHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(16);
    }
}

export const syncClient = new MobileSyncClient("mobile_1");
export default MobileSyncClient;
