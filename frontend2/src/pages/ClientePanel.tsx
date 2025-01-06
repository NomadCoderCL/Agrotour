import React, { useState, useEffect } from "react";
import AjustesCliente from "../components/ClientePanelOptions/Ajustes";
import CarroDeCompras from "../components/ClientePanelOptions/CarroDeCompras";
import ExploraProducto from "../components/ClientePanelOptions/ExplorarProductos";
import HistorialCompraC from "../components/ClientePanelOptions/HistorialCompras";
import NotificacionesCliente from "../components/ClientePanelOptions/NotificacionesyAvisos";
import SeguimientoPedidosCliente from "../components/ClientePanelOptions/SeguimientoPedidos";
import VisitaGuiadaCliente from "../components/ClientePanelOptions/VisitasGuiadas";
import { useNavigate } from "react-router-dom";

const opciones = [
  { id: "explorar", nombre: "Explorar Productos", componente: <ExploraProducto /> },
  { id: "visitas", nombre: "Visitas Guiadas", componente: <VisitaGuiadaCliente /> },
  { id: "carro", nombre: "Carro de Compras", componente: <CarroDeCompras /> },
  { id: "seguimiento", nombre: "Seguimiento de Pedidos", componente: <SeguimientoPedidosCliente /> },
  { id: "historial", nombre: "Historial de Compras", componente: <HistorialCompraC /> },
  { id: "notificaciones", nombre: "Notificaciones y Avisos", componente: <NotificacionesCliente /> },
  { id: "ajustes", nombre: "Ajustes", componente: <AjustesCliente />, soloClientes: true },
];

const ClientePanel: React.FC = () => {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string>("explorar");
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verificación del rol al cargar
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    setUserRole(role);

    if (!role || (role !== "cliente" && role !== "productorcliente")) {
      navigate("/"); // Redirigir si no es cliente ni productor en modo cliente
    }
  }, [navigate]);

  const renderComponenteSeleccionado = () => {
    const opcion = opciones.find((op) => op.id === opcionSeleccionada);
    if (opcion?.soloClientes && userRole !== "cliente") {
      return <p className="text-red-500">Esta opción solo está disponible para clientes.</p>;
    }
    return opcion ? opcion.componente : null;
  };

  const handleCerrarSesion = () => {
    // Eliminar tokens y rol del localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    navigate("/");
  };

  const handleModoProductor = () => {
    // Regresar al panel productor restableciendo el rol original
    localStorage.setItem("user_role", "productor");
    navigate("/panelproductor");
  };

  const handleOpcionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOpcionSeleccionada(e.target.value);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg max-w-7xl mx-auto shadow-md min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Panel de Cliente</h1>
        <div className="flex gap-4">
          {userRole === "productorcliente" && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleModoProductor}
            >
              Modo Productor
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
        {opciones.map((op) => (
          <button
            key={op.id}
            className={`py-2 px-4 rounded-lg font-bold transition-all ${
              opcionSeleccionada === op.id
                ? "bg-green-700 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setOpcionSeleccionada(op.id)}
          >
            {op.nombre}
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
          value={opcionSeleccionada}
          onChange={handleOpcionChange}
        >
          {opciones.map((op) => (
            <option key={op.id} value={op.id}>
              {op.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">{renderComponenteSeleccionado()}</div>
    </div>
  );
};

export default ClientePanel;
