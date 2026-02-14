import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DarkModeToggle from '@/components/ui/DarkModeToggle';

const menuItems = [
  { id: 'inventario', label: 'Gestionar Inventario', icon: '📦', path: 'inventario' },
  { id: 'historial', label: 'Historial de Ventas', icon: '📊', path: 'historial' },
  { id: 'envio', label: 'Envío a Domicilio', icon: '🚚', path: 'envio' },
  { id: 'agenda', label: 'Agenda de Visitas', icon: '📅', path: 'agenda' },
  { id: 'notificaciones', label: 'Notificaciones', icon: '🔔', path: 'notificaciones' },
  { id: 'estadisticas', label: 'Estadísticas', icon: '📈', path: 'estadisticas' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️', path: 'ajustes' },
];

const PanelProductor: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-green-700 to-green-800 text-white transition-all duration-300 flex flex-col
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
      `}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-green-600 flex justify-between items-center">
          {sidebarOpen || mobileMenuOpen ? (
            <h1 className="text-xl font-bold">Agrotour Producer</h1>
          ) : (
            <h1 className="text-lg font-bold">AP</h1>
          )}
          {/* Close button mobile */}
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-white">
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${isActive || (item.path === 'inventario' && location.pathname === '/panel/productor')
                ? 'bg-green-900 text-white shadow-lg'
                : 'text-green-100 hover:bg-green-600'
                }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {(sidebarOpen || mobileMenuOpen) && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Toggle Sidebar (Desktop only) */}
        <div className="p-4 border-t border-green-600 hidden md:block">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-green-100 hover:text-white text-sm p-2 rounded"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ☰
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">Panel Productor</h2>
              <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400">Bienvenido, {user?.username || 'Productor'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <DarkModeToggle className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" />
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm whitespace-nowrap"
            >
              <span className="hidden md:inline">Cerrar Sesión</span>
              <span className="md:hidden">Salir</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PanelProductor;
