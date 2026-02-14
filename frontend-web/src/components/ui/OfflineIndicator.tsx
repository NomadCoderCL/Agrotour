/**
 * OfflineIndicator - Badge que muestra cuando está offline
 * Integrado con useSync para detectar conectividad
 */

import React from 'react';
import { useSync } from '@/hooks';
import getLogger from '@/lib/logger';

const logger = getLogger('OfflineIndicator');

export const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingOperations } = useSync();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">
        Modo Offline
        {pendingOperations > 0 && ` • ${pendingOperations} cambios pendientes`}
      </span>
    </div>
  );
};

export default OfflineIndicator;
