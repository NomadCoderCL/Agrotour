import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GestionarInventario from '../components/ProductorPanelOptions/GestionInventario';
import HistorialVentas from '../components/ProductorPanelOptions/HistorialVentas';
import EnvioDomicilio from '../components/ProductorPanelOptions/EnvioDomicilio';
import AgendaVisitasGuiadas from '../components/ProductorPanelOptions/AgendaVisitas';
import NotificacionesYAnuncios from '../components/ProductorPanelOptions/NotificacionesYAnuncios';
import Estadisticas from '../components/ProductorPanelOptions/EstadisticasProductor';
import AjustesProd from '../components/ProductorPanelOptions/AjustesProd';

const options = [
  { id: 'gestionar-inventario', name: 'Gestionar Inventario' },
  { id: 'historial-de-ventas', name: 'Historial de Ventas' },
  { id: 'envio-a-domicilio', name: 'Envío a Domicilio' },
  { id: 'agenda-de-visitas-guiadas', name: 'Agenda de Visitas Guiadas' },
  { id: 'notificaciones-y-anuncios', name: 'Notificaciones y Anuncios' },
  { id: 'estadisticas', name: 'Estadísticas' },
  { id: 'ajustes', name: 'Ajustes' },
];

const ProducerPanel: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('gestionar-inventario');
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verificar rol al cargar el panel
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'productor') {
      navigate('/'); // Redirigir si el rol no es productor
    }
    setUserRole(role);
  }, [navigate]);

  // Renderizar contenido según la opción seleccionada
  const renderContent = () => {
    switch (selectedOption) {
      case 'gestionar-inventario':
        return <GestionarInventario />;
      case 'historial-de-ventas':
        return <HistorialVentas />;
      case 'envio-a-domicilio':
        return <EnvioDomicilio />;
      case 'agenda-de-visitas-guiadas':
        return <AgendaVisitasGuiadas />;
      case 'notificaciones-y-anuncios':
        return <NotificacionesYAnuncios />;
      case 'estadisticas':
        return <Estadisticas />;
      case 'ajustes':
        return <AjustesProd />;
      default:
        return <GestionarInventario />;
    }
  };

  const handleCerrarSesion = () => {
    // Eliminar tokens y rol del localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    // Redirigir a la página de inicio
    navigate('/');
  };

  const handleModoCliente = () => {
    // Cambiar rol temporalmente a 'productorcliente' y redirigir al panel cliente
    localStorage.setItem('user_role', 'productorcliente');
    navigate('/panelcliente');
  };

  const handleOpcionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg max-w-7xl mx-auto shadow-md min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Panel de Productor</h1>
        <div className="flex gap-4">
          {userRole === 'productor' && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleModoCliente}
            >
              Modo Cliente
            </button>
          )}
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCerrarSesion}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Menú para pantallas grandes */}
      <div className="hidden md:flex justify-center flex-wrap gap-4 mb-8">
        {options.map((option) => (
          <button
            key={option.id}
            className={`py-2 px-4 rounded-lg font-bold transition-all ${
              selectedOption === option.id
                ? 'bg-green-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>

      {/* Menú desplegable para pantallas pequeñas */}
      <div className="md:hidden mb-4">
        <label htmlFor="menu-select" className="sr-only">
          Selecciona una opción
        </label>
        <select
          id="menu-select"
          className="w-full p-2 border rounded"
          value={selectedOption}
          onChange={handleOpcionChange}
        >
          {options.map((op) => (
            <option key={op.id} value={op.id}>
              {op.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">{renderContent()}</div>
    </div>
  );
};

export default ProducerPanel;
