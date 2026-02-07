/**
 * AppLayout - Layout principal con navbar y footer
 * Usado en todas las páginas públicas
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { registerServiceWorker, setupConnectivityListener } from '@/services';
import { OfflineIndicator, SyncStatus, ErrorBoundary } from '@/components/ui';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import { CartProvider } from '@/contexts/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import CartToggleButton from '@/components/cart/CartToggleButton';
import getLogger from '@/lib/logger';

const logger = getLogger('AppLayout');

interface AppLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  navbarContent?: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showNavbar = true,
  showFooter = true,
  navbarContent,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Registrar Service Worker
        if (process.env.REACT_APP_ENABLE_SERVICE_WORKER !== 'false') {
          await registerServiceWorker();
          logger.info('Service Worker registered');
        }

        // Setup connectivity listener
        setupConnectivityListener();
        logger.info('Connectivity listener setup');

        setIsInitialized(true);
      } catch (error) {
        logger.error('Failed to initialize app', error);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  return (
    <ErrorBoundary>
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        {/* Navbar */}
        {showNavbar && (
          <nav className="bg-blue-600 dark:bg-blue-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-16 flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">🌱 Agrotour</h1>
                </div>
                <div className="flex items-center gap-4">
                  {navbarContent}
                  <DarkModeToggle className="text-white hover:bg-blue-700 dark:hover:bg-blue-800" />
                  <CartToggleButton />
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Agrotour
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Plataforma de agroturismo y venta directa de productos.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Enlaces
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/productos">Productos</a></li>
                    <li><a href="/mapa">Mapa</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Info
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    © 2026 Agrotour. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        )}

        {/* Indicators */}
        <OfflineIndicator />
        <SyncStatus position="top-right" />
        <CartDrawer />
      </div>
      </CartProvider>
    </ErrorBoundary>
  );
};

export default AppLayout;
