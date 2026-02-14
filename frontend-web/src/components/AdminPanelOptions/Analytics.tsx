/**
 * Analytics - Dashboard de análisis para admin
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AnalyticsData {
  totalUsers: number;
  totalProductos: number;
  totalVentas: number;
  ingresoTotal: number;
  usuariosActivos: number;
  ventasHoy: number;
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 150,
    totalProductos: 480,
    totalVentas: 2340,
    ingresoTotal: 125000,
    usuariosActivos: 82,
    ventasHoy: 34,
  });
  const [loading, setLoading] = useState(false);

  const cards = [
    {
      title: 'Usuarios Totales',
      value: data.totalUsers,
      change: '+12%',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Productos',
      value: data.totalProductos,
      change: '+5%',
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Ventas Totales',
      value: data.totalVentas,
      change: '+23%',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Ingreso Total',
      value: `$${(data.ingresoTotal / 1000).toFixed(1)}K`,
      change: '+18%',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      title: 'Usuarios Activos HOY',
      value: data.usuariosActivos,
      change: '+8%',
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'Ventas HOY',
      value: data.ventasHoy,
      change: '+15%',
      color: 'bg-pink-100 text-pink-800',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Análisis y Estadísticas</h2>

      {loading && <LoadingSpinner size="lg" />}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-lg shadow ${card.color}`}
          >
            <h3 className="text-sm font-medium opacity-80">{card.title}</h3>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
            <p className="text-xs mt-1 opacity-75">{card.change} vs. últimas 30 días</p>
          </div>
        ))}
      </div>

      {/* Charts Section (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold mb-4">Ventas por Semana</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {[45, 62, 38, 75, 52, 68, 80].map((height, idx) => (
              <div
                key={idx}
                className="bg-blue-500 rounded-t"
                style={{ height: `${height}px`, width: '30px' }}
              />
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold mb-4">Distribución de Usuarios</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="w-20">Clientes</span>
              <div className="flex-1 h-6 bg-gray-200 rounded">
                <div className="h-full bg-blue-500 rounded" style={{ width: '60%' }} />
              </div>
              <span className="w-12 text-right">60%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20">Productores</span>
              <div className="flex-1 h-6 bg-gray-200 rounded">
                <div className="h-full bg-green-500 rounded" style={{ width: '35%' }} />
              </div>
              <span className="w-12 text-right">35%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20">Admins</span>
              <div className="flex-1 h-6 bg-gray-200 rounded">
                <div className="h-full bg-red-500 rounded" style={{ width: '5%' }} />
              </div>
              <span className="w-12 text-right">5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-bold mb-4">Actividad Reciente</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span>Nuevo usuario: juan_perez</span>
            <span className="text-gray-500">Hace 2 horas</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Nueva venta de $450.00</span>
            <span className="text-gray-500">Hace 4 horas</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Productor agregó 15 productos</span>
            <span className="text-gray-500">Hace 6 horas</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Usuario desactivado: old_user</span>
            <span className="text-gray-500">Hace 1 día</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
