/**
 * ConflictModal - Modal para resolver conflictos de sincronización
 * Muestra opciones LOCAL vs REMOTE
 */

import React, { useState } from 'react';
import { SyncConflict } from '@/types/models';
import getLogger from '@/lib/logger';

const logger = getLogger('ConflictModal');

interface ConflictModalProps {
  conflict: SyncConflict;
  onResolve: (resolution: 'LOCAL' | 'REMOTE') => Promise<void>;
  onCancel?: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  conflict,
  onResolve,
  onCancel,
}) => {
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async (resolution: 'LOCAL' | 'REMOTE') => {
    try {
      setResolving(true);
      setError(null);
      await onResolve(resolution);
      logger.info(`Conflict resolved: ${resolution}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al resolver conflicto'
      );
      logger.error('Error resolving conflict:', err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ⚠️ Conflicto de Sincronización
        </h2>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Entidad:</strong> {conflict.entity_type}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Se detectó un conflicto en{' '}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                ID: {conflict.entity_id}
              </code>
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Tipo de conflicto:
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {conflict.conflict_type === 'CONCURRENT_MODIFICATION' &&
                'Modificación simultánea en tu dispositivo y otro lugar'}
              {conflict.conflict_type === 'BUSINESS_RULE_VIOLATION' &&
                'Violación de regla de negocio'}
              {conflict.conflict_type === 'DATA_INCONSISTENCY' &&
                'Inconsistencia de datos'}
            </p>
            {conflict.details && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {JSON.stringify(conflict.details, null, 2)}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Elige una opción:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleResolve('LOCAL')}
                disabled={resolving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ✓ Usar Mi Versión
              </button>
              <button
                onClick={() => handleResolve('REMOTE')}
                disabled={resolving}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ↻ Usar Remota
              </button>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={resolving}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>

        {resolving && (
          <div className="mt-4 text-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Resolviendo...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConflictModal;
