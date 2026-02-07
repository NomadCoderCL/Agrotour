/**
 * PanelLayout - Layout para paneles de usuario (Cliente, Productor, Admin)
 * Incluye sidebar de navegación y header
 */

import React, { ReactNode, useState } from 'react';
import { ErrorBoundary, OfflineIndicator, SyncStatus } from '@/components/ui';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import { useSync } from '@/hooks';
import getLogger from '@/lib/logger';

const logger = getLogger('PanelLayout');

export interface PanelMenuItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
  onClick?: () => void;
}

interface PanelLayoutProps {
  children: ReactNode;
  title: string;
  menuItems: PanelMenuItem[];
  activeMenuItem?: string;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  children,
  title,
  menuItems,
  activeMenuItem,
  userRole = 'Usuario',
  userName = 'Usuario',
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isOnline, pendingOperations } = useSync();

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-gray-900 text-white transition-all duration-300 shadow-xl flex flex-col`}
        >
          {/* Logo */}
          <div className="border-b border-gray-800 p-4 flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-xl">🌱 Agrotour</h2>
                <p className="text-xs text-gray-400">{userRole}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-800 rounded"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  activeMenuItem === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
                title={item.label}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-800 p-4 space-y-2">
            {sidebarOpen && (
              <div className="text-sm">
                <p className="text-gray-400 text-xs">Conectado como</p>
                <p className="font-medium truncate">{userName}</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              {sidebarOpen ? 'Cerrar sesión' : 'Salir'}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>

            {/* Header Right - Status */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <DarkModeToggle className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" />

              {/* Connectivity Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Pending Operations */}
              {pendingOperations > 0 && (
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  {pendingOperations} cambios
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>

        {/* Indicators */}
        <OfflineIndicator />
        <SyncStatus position="top-right" />
      </div>
    </ErrorBoundary>
  );
};

export default PanelLayout;
