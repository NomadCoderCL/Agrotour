// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { AppLayout } from '@/components/layouts';

// Importación de páginas principales
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaginaExploraProducto from './pages/PaginaExplorarProductos';
import PaginaMapa from './pages/PaginaMapa';
import CheckoutPage from './pages/CheckoutPage';

// Importación de paneles según roles
import ClientePanel from './pages/ClientePanel';
import PanelProductor from './pages/PanelProductor';
import PanelAdministrador from './pages/PanelAdministrador';

// Importación de componentes dentro de los paneles
import AjustesCliente from './components/ClientePanelOptions/Ajustes';
import CarroCompras from './components/ClientePanelOptions/CarroDeCompras';
import ExplorarProducto from './components/ClientePanelOptions/ExplorarProductos';
import HistorialCompraC from './components/ClientePanelOptions/HistorialCompras';
import NotificacionesCliente from './components/ClientePanelOptions/NotificacionesyAvisos';
import SeguimientoPedidosCliente from './components/ClientePanelOptions/SeguimientoPedidos';
import VisitaGuiadaCliente from './components/ClientePanelOptions/VisitasGuiadas';

// Importación de componentes del panel de productor
import GestionarInventario from './components/ProductorPanelOptions/GestionInventario';
import HistorialVentas from './components/ProductorPanelOptions/HistorialVentas';
import EnvioDomicilio from './components/ProductorPanelOptions/EnvioDomicilio';
import AgendaVisitas from './components/ProductorPanelOptions/AgendaVisitas';
import NotificacionesAnuncios from './components/ProductorPanelOptions/NotificacionesYAnuncios';
import Estadisticas from './components/ProductorPanelOptions/EstadisticasProductor';
import AjustesProd from './components/ProductorPanelOptions/AjustesProd';

// Componentes de protección de rutas
import PrivateRoute from './components/PrivateRoute';

// Importación de una página 404 (opcional pero recomendable)
import NotFoundPage from "./pages/NotFoundPage";

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Rutas Públicas con AppLayout */}
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/login" element={<AppLayout showNavbar={false}><LoginPage /></AppLayout>} />
          <Route path="/register" element={<AppLayout showNavbar={false}><RegisterPage /></AppLayout>} />
          <Route path="/mapa" element={<AppLayout><PaginaMapa /></AppLayout>} />
          <Route path="/paginaexploraproducto" element={<AppLayout><PaginaExploraProducto /></AppLayout>} />
          <Route path="/checkout" element={<AppLayout><CheckoutPage /></AppLayout>} />

          {/* Rutas Protegidas para Clientes */}
          <Route
            path="/panelcliente"
            element={
              <PrivateRoute allowedRoles={['cliente', 'productorcliente']}>
                <ClientePanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/ajustescliente"
            element={
              <PrivateRoute allowedRoles={['cliente']}>
                <AjustesCliente />
              </PrivateRoute>
            }
          />
          <Route
            path="/carritodecompras"
            element={
              <PrivateRoute allowedRoles={['cliente', 'productorcliente']}>
                <CarroCompras />
              </PrivateRoute>
            }
          />
          <Route
            path="/exploraproducto"
            element={
              <PrivateRoute allowedRoles={['cliente', 'productorcliente']}>
                <ExplorarProducto />
              </PrivateRoute>
            }
          />
          <Route
            path="/historialcomprac"
            element={
              <PrivateRoute allowedRoles={['cliente', 'productorcliente']}>
                <HistorialCompraC />
              </PrivateRoute>
            }
          />
          <Route
            path="/notificacionescliente"
            element={
              <PrivateRoute allowedRoles={['cliente', 'productorcliente']}>
                <NotificacionesCliente />
              </PrivateRoute>
            }
          />
          <Route
            path="/seguimientopedidosc"
            element={
              <PrivateRoute allowedRoles={['cliente', 'productorcliente']}>
                <SeguimientoPedidosCliente />
              </PrivateRoute>
            }
          />
          <Route
            path="/visitaguiadac"
            element={
              <PrivateRoute allowedRoles={['cliente', 'productorcliente']}>
                <VisitaGuiadaCliente />
              </PrivateRoute>
            }
          />

          {/* Rutas Protegidas para Productores */}
          <Route
            path="/panelproductor"
            element={
              <PrivateRoute allowedRoles={['productor']}>
                <PanelProductor />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestionar-inventario"
            element={
              <PrivateRoute allowedRoles={['productor']}>
                <GestionarInventario />
              </PrivateRoute>
            }
          />
          <Route
            path="/historial-ventas"
            element={
              <PrivateRoute allowedRoles={['productor']}>
                <HistorialVentas />
              </PrivateRoute>
            }
          />
          <Route
            path="/envio-domicilio"
            element={
              <PrivateRoute allowedRoles={['productor']}>
                <EnvioDomicilio />
              </PrivateRoute>
            }
          />
          <Route
            path="/agenda-visitas"
            element={
              <PrivateRoute allowedRoles={['productor']}>
                <AgendaVisitas />
              </PrivateRoute>
            }
          />
          <Route
            path="/notificaciones-anuncios"
            element={
              <PrivateRoute allowedRoles={['productor']}>
                <NotificacionesAnuncios />
              </PrivateRoute>
            }
          />
          <Route
            path="/estadisticas"
            element={
              <PrivateRoute allowedRoles={['productor']}>
                <Estadisticas />
              </PrivateRoute>
            }
          />
          <Route
            path="/ajustesprod"
            element={
              <PrivateRoute allowedRoles={['productor']}>
                <AjustesProd />
              </PrivateRoute>
            }
          />

          {/* Rutas Protegidas para Administradores */}
          <Route
            path="/paneladministrador"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <PanelAdministrador />
              </PrivateRoute>
            }
          />
          {/* Si tienes sub-rutas para el panel de administrador, agrégalas aquí de manera similar */}

          {/* Ruta No Encontrada */}
          <Route path="*" element={<AppLayout><NotFoundPage /></AppLayout>} />
        </Routes>
      </Router>
      </AuthProvider>
    </DarkModeProvider>
  );
};

export default App;
