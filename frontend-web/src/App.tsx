import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';

// Layouts
import { AppLayout } from './components/layouts/AppLayout';

// Guard
import PrivateRoute from './components/PrivateRoute';

// Pages - Public
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaginaExplorarProductos from './pages/PaginaExplorarProductos';
import PaginaMapa from './pages/PaginaMapa';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';

// Panels
// Panels
import ClientePanel from './pages/ClientePanel';
import PanelProductor from './pages/PanelProductor';
import PanelAdministrador from './pages/PanelAdministrador';
import PanelSuperAdmin from './pages/PanelSuperAdmin';

// Subcomponents for Routes
import AjustesCliente from "@/components/ClientePanelOptions/Ajustes";
import CarroDeCompras from "@/components/ClientePanelOptions/CarroDeCompras";
import ExploraProducto from "@/components/ClientePanelOptions/ExplorarProductos";
import HistorialCompraC from "@/components/ClientePanelOptions/HistorialCompras";
import NotificacionesCliente from "@/components/ClientePanelOptions/NotificacionesyAvisos";
import SeguimientoPedidosCliente from "@/components/ClientePanelOptions/SeguimientoPedidos";
import VisitaGuiadaCliente from "@/components/ClientePanelOptions/VisitasGuiadas";
import Favoritos from "@/components/ClientePanelOptions/Favoritos";

// Subcomponents for Producer Routes
import GestionarInventario from '@/components/ProductorPanelOptions/GestionInventario';
import HistorialVentas from '@/components/ProductorPanelOptions/HistorialVentas';
import EnvioDomicilio from '@/components/ProductorPanelOptions/EnvioDomicilio';
import AgendaVisitasGuiadas from '@/components/ProductorPanelOptions/AgendaVisitas';
import NotificacionesYAnuncios from '@/components/ProductorPanelOptions/NotificacionesYAnuncios';
import Estadisticas from '@/components/ProductorPanelOptions/EstadisticasProductor';
import AjustesProd from '@/components/ProductorPanelOptions/AjustesProd';

// AI Assistant
import AIChat from '@/components/AIChat';

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* --- ZONA PÚBLICA (con AppLayout) --- */}
            <Route path="/" element={
              <AppLayout>
                <HomePage />
              </AppLayout>
            } />

            <Route path="/productos" element={
              <AppLayout>
                <PaginaExplorarProductos />
              </AppLayout>
            } />

            <Route path="/mapa" element={
              <AppLayout>
                <PaginaMapa />
              </AppLayout>
            } />

            <Route path="/checkout" element={
              <AppLayout>
                <CheckoutPage />
              </AppLayout>
            } />

            {/* --- AUTH (sin AppLayout para UI limpia) --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- PANEL CLIENTE --- */}
            <Route path="/panel/cliente" element={
              <PrivateRoute allowedRoles={['cliente']}>
                <ClientePanel />
              </PrivateRoute>
            }>
              <Route index element={<ExploraProducto />} />
              <Route path="explorar" element={<ExploraProducto />} />
              <Route path="favoritos" element={<Favoritos />} />
              <Route path="visitas" element={<VisitaGuiadaCliente />} />
              <Route path="carro" element={<CarroDeCompras />} />
              <Route path="seguimiento" element={<SeguimientoPedidosCliente />} />
              <Route path="historial" element={<HistorialCompraC />} />
              <Route path="notificaciones" element={<NotificacionesCliente />} />
              <Route path="ajustes" element={<AjustesCliente />} />
            </Route>

            {/* --- PANEL PRODUCTOR --- */}
            <Route path="/panel/productor" element={
              <PrivateRoute allowedRoles={['productor']}>
                <PanelProductor />
              </PrivateRoute>
            }>
              <Route index element={<GestionarInventario />} />
              <Route path="inventario" element={<GestionarInventario />} />
              <Route path="historial" element={<HistorialVentas />} />
              <Route path="envio" element={<EnvioDomicilio />} />
              <Route path="agenda" element={<AgendaVisitasGuiadas />} />
              <Route path="notificaciones" element={<NotificacionesYAnuncios />} />
              <Route path="estadisticas" element={<Estadisticas />} />
              <Route path="ajustes" element={<AjustesProd />} />
            </Route>

            {/* --- PANEL ADMINISTRADOR --- */}
            <Route path="/panel/admin/*" element={
              <PrivateRoute allowedRoles={['admin', 'superuser']}>
                <PanelAdministrador />
              </PrivateRoute>
            } />

            {/* --- PANEL SUPER ADMIN (Sala de Máquinas) --- */}
            <Route path="/panel/superuser/*" element={
              <PrivateRoute allowedRoles={['superuser']}>
                <PanelSuperAdmin />
              </PrivateRoute>
            } />

            {/* --- REDIRECT LEGACY /dashboard → panel según rol --- */}
            <Route path="/dashboard/*" element={<Navigate to="/panel/cliente" replace />} />

            {/* --- 404 --- */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <AIChat />
      </AuthProvider>
    </DarkModeProvider>
  );
};

export default App;
