import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import GestionarInventario from '@/components/ProductorPanelOptions/GestionInventario';
import HistorialVentas from '@/components/ProductorPanelOptions/HistorialVentas';
import EnvioDomicilio from '@/components/ProductorPanelOptions/EnvioDomicilio';
import AgendaVisitasGuiadas from '@/components/ProductorPanelOptions/AgendaVisitas';
import NotificacionesYAnuncios from '@/components/ProductorPanelOptions/NotificacionesYAnuncios';
import Estadisticas from '@/components/ProductorPanelOptions/EstadisticasProductor';
import AjustesProd from '@/components/ProductorPanelOptions/AjustesProd';

const menuItems = [
  { id: 'inventario', label: 'Gestionar Inventario', icon: '📦' },
  { id: 'historial', label: 'Historial de Ventas', icon: '📊' },
  { id: 'envio', label: 'Envío a Domicilio', icon: '🚚' },
  { id: 'agenda', label: 'Agenda de Visitas', icon: '📅' },
  { id: 'notificaciones', label: 'Notificaciones', icon: '🔔' },
  { id: 'estadisticas', label: 'Estadísticas', icon: '📈' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
];

const PanelProductor: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>('inventario');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (selectedOption) {
      case 'inventario':
        return <GestionarInventario />;
      case 'historial':
        return <HistorialVentas />;
      case 'envio':
        return <EnvioDomicilio />;
      case 'agenda':
        return <AgendaVisitasGuiadas />;
      case 'notificaciones':
        return <NotificacionesYAnuncios />;
      case 'estadisticas':
        return <Estadisticas />;
      case 'ajustes':
        return <AjustesProd />;
      default:
        return <GestionarInventario />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-green-700 to-green-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-green-600">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">Agrotour Producer</h1>
          ) : (
            <h1 className="text-lg font-bold">AP</h1>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedOption(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                selectedOption === item.id
                  ? 'bg-green-900 text-white shadow-lg'
                  : 'text-green-100 hover:bg-green-600'
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-green-600">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-green-100 hover:text-white text-sm p-2 rounded"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Panel de Productor</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bienvenido, {user?.username || 'Productor'}</p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" />
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PanelProductor;
