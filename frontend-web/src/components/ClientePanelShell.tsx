/**
 * ClientePanelShell - Estructura base para el panel de cliente
 * Ready para Fase 1 - Web Offline
 * 
 * Funcionalidades:
 * - Explorar productos
 * - Ver carrito (offline-ready)
 * - Historial de compras
 * - Seguimiento de pedidos
 * - Visitas guiadas
 * - Ajustes de cuenta
 */

import React, { useState, useEffect } from 'react';
import { PanelLayout, PanelMenuItem } from '@/components/layouts';
import { ConflictModal } from '@/components/common';
import { useSync, useSyncConflicts } from '@/hooks';
import { apiClient } from '@/services';
import getLogger from '@/lib/logger';

const logger = getLogger('ClientePanelShell');

type PanelView =
  | 'dashboard'
  | 'explorar'
  | 'carrito'
  | 'historial'
  | 'seguimiento'
  | 'visitas'
  | 'ajustes';

export const ClientePanelShell: React.FC = () => {
  const [activeView, setActiveView] = useState<PanelView>('dashboard');
  const [userName, setUserName] = useState('Cliente');
  const { pendingOperations } = useSync();
  const { conflicts, resolveConflict } = useSyncConflicts();

  useEffect(() => {
    // Cargar info del usuario
    const loadUserInfo = async () => {
      try {
        // TODO: Implementar endpoint /api/users/me
        setUserName('Juan Pérez');
      } catch (error) {
        logger.error('Error loading user info:', error);
      }
    };

    loadUserInfo();
  }, []);

  const menuItems: PanelMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      onClick: () => setActiveView('dashboard'),
    },
    {
      id: 'explorar',
      label: 'Explorar Productos',
      icon: '🌾',
      onClick: () => setActiveView('explorar'),
    },
    {
      id: 'carrito',
      label: 'Carrito',
      icon: '🛒',
      badge: pendingOperations,
      onClick: () => setActiveView('carrito'),
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: '📜',
      onClick: () => setActiveView('historial'),
    },
    {
      id: 'seguimiento',
      label: 'Seguimiento',
      icon: '📍',
      onClick: () => setActiveView('seguimiento'),
    },
    {
      id: 'visitas',
      label: 'Visitas Guiadas',
      icon: '🚜',
      onClick: () => setActiveView('visitas'),
    },
    {
      id: 'ajustes',
      label: 'Ajustes',
      icon: '⚙️',
      onClick: () => setActiveView('ajustes'),
    },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Compras Totales
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  15
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Gastos
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  $450
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Pedidos Activos
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  2
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="font-bold mb-4">Últimas Compras</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No hay compras recientes. Explora nuestros productos.
              </p>
            </div>
          </div>
        );

      case 'explorar':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Explorar Productos</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Esta sección mostrará productos disponibles de todos los productores.
            </p>
            {/* TODO: Integrar con PaginaExplorarProductos */}
          </div>
        );

      case 'carrito':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Carrito de Compras</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tu carrito está vacío. Comienza a explorar productos.
            </p>
            {/* TODO: Integrar con CarroDeCompras */}
          </div>
        );

      case 'historial':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Historial de Compras</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No hay compras en el historial.
            </p>
            {/* TODO: Integrar con HistorialCompras */}
          </div>
        );

      case 'seguimiento':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Seguimiento de Pedidos</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No tienes pedidos activos.
            </p>
            {/* TODO: Integrar con SeguimientoPedidos */}
          </div>
        );

      case 'visitas':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Visitas Guiadas</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Explora visitas guiadas disponibles en tu zona.
            </p>
            {/* TODO: Integrar con VisitasGuiadas */}
          </div>
        );

      case 'ajustes':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Ajustes de Cuenta</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aquí podrás modificar tu perfil, contraseña y preferencias.
            </p>
            {/* TODO: Integrar con Ajustes */}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PanelLayout
      title={
        activeView === 'dashboard'
          ? 'Mi Panel'
          : menuItems.find((m) => m.id === activeView)?.label || 'Panel'
      }
      menuItems={menuItems}
      activeMenuItem={activeView}
      userRole="Cliente"
      userName={userName}
      onLogout={() => {
        // TODO: Implementar logout
        logger.info('Logout');
      }}
    >
      {renderView()}

      {/* Conflictos - Modals */}
      {conflicts.map((conflict) => (
        <ConflictModal
          key={conflict.id}
          conflict={conflict}
          onResolve={(resolution) =>
            resolveConflict(conflict.id, resolution)
          }
        />
      ))}
    </PanelLayout>
  );
};

export default ClientePanelShell;
