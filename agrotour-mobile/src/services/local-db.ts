/**
 * Local Storage Adapter for Mobile
 * Utiliza AsyncStorage como alternativa lightweight a IndexedDB/Dexie
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SyncOperation, SyncConflict, SyncState } from "../types/models";

const KEYS = {
    SYNC_OPERATIONS: "@agrotour/sync_operations",
    SYNC_CONFLICTS: "@agrotour/sync_conflicts",
    SYNC_STATE: "@agrotour/sync_state",
    CACHE_PRODUCTOS: "@agrotour/cache/productos",
    AUTH_TOKENS: "auth_tokens",
};

export const localDb = {
    /**
     * ==================
     * SYNC OPERATIONS
     * ==================
     */

    async getSyncOperations(): Promise<SyncOperation[]> {
        const data = await AsyncStorage.getItem(KEYS.SYNC_OPERATIONS);
        return data ? JSON.parse(data) : [];
    },

    async addSyncOperation(op: SyncOperation): Promise<void> {
        const ops = await this.getSyncOperations();
        ops.push(op);
        await AsyncStorage.setItem(KEYS.SYNC_OPERATIONS, JSON.stringify(ops));
    },

    async removeSyncOperation(operationId: string): Promise<void> {
        const ops = await this.getSyncOperations();
        const filtered = ops.filter(op => op.operation_id !== operationId);
        await AsyncStorage.setItem(KEYS.SYNC_OPERATIONS, JSON.stringify(filtered));
    },

    async clearSyncOperations(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.SYNC_OPERATIONS);
    },

    /**
     * ==================
     * SYNC STATE
     * ==================
     */

    async getSyncState(): Promise<Partial<SyncState> | null> {
        const data = await AsyncStorage.getItem(KEYS.SYNC_STATE);
        return data ? JSON.parse(data) : null;
    },

    async updateSyncState(updates: Partial<SyncState>): Promise<void> {
        const current = (await this.getSyncState()) || {};
        const updated = { ...current, ...updates };
        await AsyncStorage.setItem(KEYS.SYNC_STATE, JSON.stringify(updated));
    },

    /**
     * ==================
     * DATA CACHE
     * ==================
     */

    async cacheProductos(productos: any[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.CACHE_PRODUCTOS, JSON.stringify(productos));
    },

    async getCachedProductos(): Promise<any[]> {
        const data = await AsyncStorage.getItem(KEYS.CACHE_PRODUCTOS);
        return data ? JSON.parse(data) : [];
    },
};

export default localDb;
