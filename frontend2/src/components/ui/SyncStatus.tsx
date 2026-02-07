/**
 * SyncStatus - Indicador de estado de sincronización
 * Muestra spinner cuando está sincronizando
 */

import React, { useEffect, useState } from 'react';
import { useSync } from '@/hooks';
import getLogger from '@/lib/logger';

const logger = getLogger('SyncStatus');

export const SyncStatus: React.FC<{
  showLabel?: boolean;
  position?: 'top-right' | 'top-center' | 'bottom-right';
}> = ({ showLabel = true, position = 'top-right' }) => {
  const { isSyncing, lastSyncTime } = useSync();
  const [showSynced, setShowSynced] = useState(false);

  useEffect(() => {
    if (!isSyncing && lastSyncTime) {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing, lastSyncTime]);

  const positionClass = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  }[position];

  if (!isSyncing && !showSynced) return null;

  return (
    <div className={`fixed ${positionClass} z-50 flex items-center gap-2`}>
      {isSyncing && (
        <>
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          {showLabel && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Sincronizando...
            </span>
          )}
        </>
      )}
      {showSynced && !isSyncing && (
        <>
          <div className="w-4 h-4 text-green-500">✓</div>
          {showLabel && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Sincronizado
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default SyncStatus;
