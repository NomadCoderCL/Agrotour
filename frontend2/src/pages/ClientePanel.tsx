import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import AjustesCliente from "@/components/ClientePanelOptions/Ajustes";
import CarroDeCompras from "@/components/ClientePanelOptions/CarroDeCompras";
import ExploraProducto from "@/components/ClientePanelOptions/ExplorarProductos";
import HistorialCompraC from "@/components/ClientePanelOptions/HistorialCompras";
import NotificacionesCliente from "@/components/ClientePanelOptions/NotificacionesyAvisos";
import SeguimientoPedidosCliente from "@/components/ClientePanelOptions/SeguimientoPedidos";
import VisitaGuiadaCliente from "@/components/ClientePanelOptions/VisitasGuiadas";

const menuItems = [
  { id: "explorar", label: "Explorar Productos", icon: "🛒" },
  { id: "visitas", label: "Visitas Guiadas", icon: "🚜" },
  { id: "carro", label: "Mi Carrito", icon: "🛍️" },
  { id: "seguimiento", label: "Seguimiento", icon: "📦" },
  { id: "historial", label: "Historial", icon: "📜" },
  { id: "notificaciones", label: "Notificaciones", icon: "🔔" },
  { id: "ajustes", label: "Ajustes", icon: "⚙️" },
];

const ClientePanel: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>("explorar");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderContent = () => {
    switch (selectedOption) {
      case "explorar":
        return <ExploraProducto />;
      case "visitas":
        return <VisitaGuiadaCliente />;
      case "carro":
        return <CarroDeCompras />;
      case "seguimiento":
        return <SeguimientoPedidosCliente />;
      case "historial":
        return <HistorialCompraC />;
      case "notificaciones":
        return <NotificacionesCliente />;
      case "ajustes":
        return <AjustesCliente />;
      default:
        return <ExploraProducto />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-600 to-blue-700 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-blue-500">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">Agrotour Client</h1>
          ) : (
            <h1 className="text-lg font-bold">AC</h1>
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
                  ? 'bg-blue-900 text-white shadow-lg'
                  : 'text-blue-100 hover:bg-blue-600'
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-blue-100 hover:text-white text-sm p-2 rounded"
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Panel de Cliente</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bienvenido, {user?.username || 'Cliente'}</p>
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

export default ClientePanel;
