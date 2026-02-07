import { useState, useCallback, useEffect } from 'react';
import { globalErrorStore } from '@/services/GlobalErrorStore';

export type ErrorType = 'CONTRACT_MISMATCH' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'NONE';

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: number;
}

/**
 * Hook para escuchar y reaccionar a errores globales
 */
export function useGlobalError() {
  const [currentError, setCurrentError] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    // Suscribirse a cambios del error store
    const unsubscribe = globalErrorStore.subscribe((error) => {
      if (error.type !== 'NONE') {
        setCurrentError({
          type: error.type,
          message: error.message,
          details: error.details,
          timestamp: Date.now(),
        });
      } else {
        setCurrentError(null);
      }
    });

    return unsubscribe;
  }, []);

  const clearError = useCallback(() => {
    globalErrorStore.clearError();
  }, []);

  const setError = useCallback(
    (type: ErrorType, message: string, details?: any) => {
      globalErrorStore.setError(type, message, details);
    },
    []
  );

  return {
    error: currentError,
    clearError,
    setError,
    hasError: !!currentError,
  };
}

/**
 * Hook para ejecutar operaciones con reintentos automáticos
 */
export function useRetry(maxRetries = 3, backoffMs = 1000) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<void>) => {
      setIsRetrying(true);
      setError(null);
      let lastError: Error | undefined;

      for (let i = 0; i < maxRetries; i++) {
        try {
          await operation();
          setRetryCount(i);
          setIsRetrying(false);
          return; // Success!
        } catch (err) {
          lastError = err as Error;
          setRetryCount(i + 1);

          if (i < maxRetries - 1) {
            // Esperar antes de reintentar con exponential backoff
            const delay = backoffMs * Math.pow(2, i);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // Si llegamos aquí, todos los intentos fallaron
      setError(lastError || new Error('Max retries exceeded'));
      setIsRetrying(false);
      throw lastError;
    },
    [maxRetries, backoffMs]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    setError(null);
    setIsRetrying(false);
  }, []);

  return {
    execute,
    isRetrying,
    retryCount,
    error,
    reset,
  };
}

/**
 * Hook para manejar timeout en operaciones
 */
export function useTimeout(timeoutMs = 5000) {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeWithTimeout = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout | null = null;
        let completed = false;

        timeoutId = setTimeout(() => {
          if (!completed) {
            completed = true;
            const timeoutError = new Error(`Operation timed out after ${timeoutMs}ms`);
            setIsTimedOut(true);
            setError(timeoutError);
            globalErrorStore.setError('TIMEOUT', timeoutError.message, {
              timeout: timeoutMs,
            });
            reject(timeoutError);
          }
        }, timeoutMs);

        operation()
          .then((result) => {
            completed = true;
            if (timeoutId) clearTimeout(timeoutId);
            setIsTimedOut(false);
            setError(null);
            resolve(result);
          })
          .catch((err) => {
            completed = true;
            if (timeoutId) clearTimeout(timeoutId);
            setError(err);
            reject(err);
          });
      });
    },
    [timeoutMs]
  );

  const reset = useCallback(() => {
    setIsTimedOut(false);
    setError(null);
  }, []);

  return {
    executeWithTimeout,
    isTimedOut,
    error,
    reset,
  };
}

/**
 * Hook para manejar errores con fallback
 */
export function useErrorFallback<T>(
  operation: () => Promise<T>,
  fallback: () => Promise<T>,
  options?: {
    retries?: number;
    backoffMs?: number;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsFallback(false);

    try {
      const result = await operation();
      setData(result);
      setIsFallback(false);
    } catch (err) {
      console.warn('[useErrorFallback] Primary operation failed, trying fallback', err);

      try {
        const fallbackResult = await fallback();
        setData(fallbackResult);
        setIsFallback(true);
      } catch (fallbackErr) {
        const finalError = new Error(
          `Operation failed and fallback also failed: ${String(fallbackErr)}`
        );
        setError(finalError);
        globalErrorStore.setError('NETWORK_ERROR', 'No se pudo cargar los datos', {
          error: String(fallbackErr),
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [operation, fallback]);

  return {
    data,
    error,
    isLoading,
    isFallback,
    execute,
  };
}

/**
 * Hook para tracking de errores en analíticos
 */
export function useErrorTracking() {
  const [errorHistory, setErrorHistory] = useState<ErrorDetails[]>([]);

  useEffect(() => {
    const unsubscribe = globalErrorStore.subscribe((error) => {
      if (error.type !== 'NONE') {
        setErrorHistory((prev) => [
          {
            type: error.type,
            message: error.message,
            details: error.details,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 9), // Mantener últimos 10 errores
        ]);
      }
    });

    return unsubscribe;
  }, []);

  const clearHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  const hasRecentError = useCallback(
    (type: ErrorType, withinMs = 5000) => {
      const now = Date.now();
      return errorHistory.some(
        (err) => err.type === type && now - err.timestamp < withinMs
      );
    },
    [errorHistory]
  );

  return {
    errorHistory,
    clearHistory,
    hasRecentError,
  };
}
