/**
 * ManageOrders - Gestión de órdenes para admin
 */

import React, { useState } from 'react';

interface OrderItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Order {
  id: string;
  clienteNombre: string;
  clienteEmail: string;
  items: OrderItem[];
  total: number;
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  fecha: string;
  metodo_pago: string;
}

export const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      clienteNombre: 'Juan Pérez',
      clienteEmail: 'juan@example.com',
      items: [
        { id: '1', nombre: 'Tomates', cantidad: 5, precio: 8.5 },
        { id: '2', nombre: 'Lechuga', cantidad: 3, precio: 5.0 },
      ],
      total: 57.5,
      estado: 'confirmado',
      fecha: '2025-02-05',
      metodo_pago: 'Tarjeta',
    },
    {
      id: 'ORD-002',
      clienteNombre: 'María López',
      clienteEmail: 'maria@example.com',
      items: [{ id: '3', nombre: 'Zanahorias', cantidad: 2, precio: 6.0 }],
      total: 12.0,
      estado: 'pendiente',
      fecha: '2025-02-05',
      metodo_pago: 'Efectivo',
    },
    {
      id: 'ORD-003',
      clienteNombre: 'Carlos González',
      clienteEmail: 'carlos@example.com',
      items: [
        { id: '4', nombre: 'Papas', cantidad: 10, precio: 3.5 },
        { id: '5', nombre: 'Cebolla', cantidad: 4, precio: 4.0 },
      ],
      total: 51.0,
      estado: 'entregado',
      fecha: '2025-02-03',
      metodo_pago: 'Transferencia',
    },
  ]);

  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmado: 'bg-blue-100 text-blue-800',
    enviado: 'bg-purple-100 text-purple-800',
    entregado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, estado: newStatus as any }
          : order
      )
    );
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(
    (order) => filterEstado === 'todos' || order.estado === filterEstado
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestión de Órdenes</h2>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['todos', 'pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterEstado(status)}
              className={`px-4 py-2 rounded-lg transition ${
                filterEstado === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">ID Orden</th>
              <th className="px-4 py-3 text-left font-semibold">Cliente</th>
              <th className="px-4 py-3 text-left font-semibold">Fecha</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{order.id}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{order.clienteNombre}</p>
                    <p className="text-sm text-gray-500">{order.clienteEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{order.fecha}</td>
                <td className="px-4 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColors[order.estado]}`}>
                    {order.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Client Info */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Información del Cliente</h4>
              <p>
                <strong>Nombre:</strong> {selectedOrder.clienteNombre}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.clienteEmail}
              </p>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Artículos</h4>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1 text-sm">
                  <span>
                    {item.nombre} x {item.cantidad}
                  </span>
                  <span>${(item.cantidad * item.precio).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Cambiar Estado</h4>
              <select
                value={selectedOrder.estado}
                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
