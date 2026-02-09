import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { globalErrorStore } from '@/services/GlobalErrorStore';

/**
 * Hook extendido de useAuth con validaciones y refresh automático mejorado
 */
export function useAuthWithValidation() {
  const auth = useAuth();
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  // Validar token localmente
  const validateToken = useCallback(async () => {
    try {
      if (!auth.user || !auth.tokens?.access) {
        setIsTokenValid(false);
        return false;
      }

      // Decodificar JWT (simple check sin validación de firma)
      const parts = auth.tokens.access.split('.');
      if (parts.length !== 3) {
        setIsTokenValid(false);
        return false;
      }

      try {
        const payload = JSON.parse(
          Buffer.from(parts[1], 'base64').toString('utf-8')
        );

        // Verificar expiración
        const expTime = (payload.exp || 0) * 1000;
        const isExpired = expTime < Date.now();

        setIsTokenValid(!isExpired);
        return !isExpired;
      } catch (err) {
        console.error('[useAuthWithValidation] Failed to decode token:', err);
        setIsTokenValid(false);
        return false;
      }
    } catch (err) {
      console.error('[useAuthWithValidation] Validation failed:', err);
      setIsTokenValid(false);
      return false;
    }
  }, [auth.user, auth.tokens?.access]);

  // Auto-refresh token si está por expirar
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const checkAndRefresh = async () => {
      const isValid = await validateToken();

      // Si el token es inválido, intentar refresh
      if (!isValid) {
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTime;

        // Evitar multiple refresh calls en rápida sucesión (> 1s aparte)
        if (timeSinceLastRefresh > 1000) {
          try {
            console.log('[useAuthWithValidation] Token expired, refreshing...');
            await auth.refreshToken();
            setLastRefreshTime(now);
            setIsTokenValid(true);
          } catch (err) {
            console.error('[useAuthWithValidation] Refresh failed:', err);
            globalErrorStore.setError(
              'NETWORK_ERROR',
              'Sesión expirada. Por favor, inicia sesión de nuevo.',
              { error: 'Token refresh failed' }
            );
            await auth.logout();
          }
        }
      }
    };

    // Verificar cada 5 minutos
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    // Verificar inmediatamente al montar
    checkAndRefresh();

    return () => clearInterval(interval);
  }, [auth, validateToken, lastRefreshTime]);

  return {
    ...auth,
    isTokenValid,
    lastRefreshTime,
    validateToken,
  };
}

/**
 * Hook para validar permisos de roles
 */
export function useRolePermission() {
  const { user } = useAuth();

  const hasRole = useCallback(
    (roles: string | string[]) => {
      if (!user?.rol) return false;
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      return rolesArray.some((role) => user.rol === role);
    },
    [user?.rol]
  );

  const isProducer = useCallback(() => hasRole('productor'), [hasRole]);
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isClient = useCallback(
    () => hasRole('cliente'),
    [hasRole]
  );

  const canEditProducts = useCallback(() => isProducer() || isAdmin(), [isProducer, isAdmin]);
  const canManageUsers = useCallback(() => isAdmin(), [isAdmin]);
  const canPlaceOrder = useCallback(() => isClient() || !user, [isClient, user]);

  return {
    hasRole,
    isProducer,
    isAdmin,
    isClient,
    canEditProducts,
    canManageUsers,
    canPlaceOrder,
  };
}

/**
 * Hook para manejar logout con confirmación
 */
export function useLogoutHandler() {
  const auth = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await auth.logout();
      console.log('[useLogoutHandler] Logged out successfully');
    } catch (err) {
      const message = 'Error al cerrar sesión';
      setLogoutError(message);
      globalErrorStore.setError(
        'NETWORK_ERROR',
        message,
        { error: String(err) }
      );
      console.error('[useLogoutHandler] Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  }, [auth]);

  const logoutWithConfirm = useCallback(
    async (onConfirm: () => Promise<void>) => {
      await onConfirm();
      await logout();
    },
    [logout]
  );

  return {
    logout,
    logoutWithConfirm,
    isLoggingOut,
    logoutError,
  };
}

/**
 * Hook para manejar estado de carga de Auth
 */
export function useAuthLoading() {
  const { isAuthenticated, user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Considerar "listo" si:
    // 1. El usuario está autenticado Y tiene datos
    // 2. O si el usuario NO está autenticado (estado definido)
    const ready = isAuthenticated ? !!user : true;
    setIsReady(ready);
  }, [isAuthenticated, user]);

  return {
    isReady,
    isAuthenticated,
    user,
    isLoading: !isReady,
  };
}
