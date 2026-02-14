/**
 * AppLayout - Layout principal con navbar y footer
 * Usado en todas las páginas públicas
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { registerServiceWorker, setupConnectivityListener } from '@/services';
import { OfflineIndicator, SyncStatus, ErrorBoundary } from '@/components/ui';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import NotificationCenter from '@/components/ui/NotificationCenter';
import { CartProvider } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import CartDrawer from '@/components/cart/CartDrawer';
import CartToggleButton from '@/components/cart/CartToggleButton';
import getLogger from '@/lib/logger';
import { MapPin, ShoppingBag, Home, LogIn, LogOut, User, Menu, X } from 'lucide-react';

const logger = getLogger('AppLayout');

interface AppLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

const NavContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/productos', label: 'Productos', icon: ShoppingBag },
    { to: '/mapa', label: 'Mapa', icon: MapPin },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getPanelPath = () => {
    if (!user) return '/panel/cliente';
    const roleMap: Record<string, string> = {
      cliente: '/panel/cliente',
      productor: '/panel/productor',
      admin: '/panel/admin',
    };
    return roleMap[user.rol] || '/panel/cliente';
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(to)
              ? 'bg-white/20 text-white'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <DarkModeToggle className="text-white hover:bg-white/10 rounded-lg" />
        <NotificationCenter className="text-white" />
        <CartToggleButton />

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to={getPanelPath()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                <User className="w-4 h-4" />
                {user?.username || 'Mi Panel'}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-red-500/20 hover:text-red-200 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-bold text-white transition-all backdrop-blur-sm border border-white/20"
              >
                <LogIn className="w-4 h-4" />
                Ingresar
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-bold text-white transition-all shadow-md border border-transparent"
              >
                <User className="w-4 h-4" />
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-blue-700 dark:bg-blue-950 shadow-xl md:hidden z-50 border-t border-white/10">
          <div className="p-4 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(to)
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <hr className="border-white/10 my-2" />
            {isAuthenticated ? (
              <>
                <Link
                  to={getPanelPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <User className="w-4 h-4" />
                  Mi Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-200 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <User className="w-4 h-4" />
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showNavbar = true,
  showFooter = true,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Registrar Service Worker
        if (import.meta.env.REACT_APP_ENABLE_SERVICE_WORKER !== 'false') {
          await registerServiceWorker();
          logger.info('Service Worker registered');
        }

        // Setup connectivity listener
        setupConnectivityListener(
          () => logger.info('App is online'),
          () => logger.warn('App is offline')
        );
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
            <nav className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950 text-white shadow-lg sticky top-0 z-40 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-2xl">🌱</span>
                    <h1 className="text-xl font-bold group-hover:text-white/90 transition-colors">Agrotour</h1>
                  </Link>
                  <NavContent />
                </div>
              </div>
            </nav>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          {showFooter && (
            <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      🌱 Agrotour
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Plataforma de agroturismo y venta directa de productos locales. Conectando productores con consumidores.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      Explorar
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li><Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Inicio</Link></li>
                      <li><Link to="/productos" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Productos</Link></li>
                      <li><Link to="/mapa" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Mapa de Productores</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      Legal
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      © 2026 Agrotour. Todos los derechos reservados.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Plataforma de turismo rural inteligente.
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
