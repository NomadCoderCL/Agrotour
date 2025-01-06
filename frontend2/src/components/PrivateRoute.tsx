// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const accessToken = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole || '')) {
    return <Navigate to="/" />; // Redirige a la página de inicio o a una página de "No autorizado"
  }

  return children;
};

export default PrivateRoute;
