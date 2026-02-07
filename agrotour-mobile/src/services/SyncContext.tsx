import React, { createContext, useContext, useEffect, useState } from 'react';
import { syncClient } from './sync-logic';
import { localDb } from './local-db';
import { SyncOperation, OperationType, EntityType } from '../types/models';

interface SyncContextType {
    isSyncing: boolean;
    pendingOpsCount: number;
    syncPush: () => Promise<void>;
    enqueueOperation: (type: OperationType, entityType: EntityType, entityId: string, data: any) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingOpsCount, setPendingOpsCount] = useState(0);

    // Cargar contador inicial de operaciones pendientes
    useEffect(() => {
        updatePendingCount();
    }, []);

    const updatePendingCount = async () => {
        const ops = await localDb.getSyncOperations();
        setPendingOpsCount(ops.length);
    };

    const syncPush = async () => {
        setIsSyncing(true);
        try {
            await syncClient.syncPush();
            await updatePendingCount();
        } finally {
            setIsSyncing(false);
        }
    };

    const enqueueOperation = async (type: OperationType, entityType: EntityType, entityId: string, data: any) => {
        await syncClient.enqueueOperation(type, entityType, entityId, data);
        await updatePendingCount();
    };

    return (
        <SyncContext.Provider value={{ isSyncing, pendingOpsCount, syncPush, enqueueOperation }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
};
