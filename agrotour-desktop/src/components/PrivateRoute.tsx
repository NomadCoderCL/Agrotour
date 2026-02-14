/**
 * PrivateRoute - Protege rutas según autenticación y rol del usuario
 * Usa AuthContext para verificar estado de sesión
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui';

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras se verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login guardando la ruta original
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no tiene el rol correcto
  if (user && !allowedRoles.includes(user.rol)) {
    // Redirigir al panel correcto según su rol
    const rolePanelMap: Record<string, string> = {
      cliente: '/panel/cliente',
      productor: '/panel/productor',
      admin: '/panel/admin',
      superuser: '/panel/superuser',
    };
    const correctPanel = rolePanelMap[user.rol] || '/';
    return <Navigate to={correctPanel} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
