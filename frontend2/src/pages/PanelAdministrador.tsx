import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PanelLayout from '@/components/layouts/PanelLayout';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import ManageUsers from '@/components/AdminPanelOptions/ManageUsers';
import ManageOrders from '@/components/AdminPanelOptions/ManageOrders';
import ManageDisputes from '@/components/AdminPanelOptions/ManageDisputes';
import Analytics from '@/components/AdminPanelOptions/Analytics';
import AdminSettings from '@/components/AdminPanelOptions/AdminSettings';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: '📊' },
    { id: 'users', label: 'Gestionar Usuarios', icon: '👥' },
    { id: 'orders', label: 'Órdenes', icon: '📦' },
    { id: 'disputes', label: 'Disputas', icon: '⚠️' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Analytics />;
      case 'users':
        return <ManageUsers />;
      case 'orders':
        return <ManageOrders />;
      case 'disputes':
        return <ManageDisputes />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-700">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">Agrotour Admin</h1>
          ) : (
            <h1 className="text-lg font-bold">AA</h1>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                currentSection === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-gray-300 hover:text-white text-sm p-2 rounded"
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Panel de Administrador</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bienvenido, {user?.username || 'Administrador'}</p>
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
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;