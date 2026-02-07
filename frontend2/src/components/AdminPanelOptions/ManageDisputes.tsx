/**
 * ManageDisputes - Resolución de disputas
 */

import React, { useState } from 'react';

interface Dispute {
  id: string;
  ordenId: string;
  comprador: string;
  vendedor: string;
  razon: string;
  descripcion: string;
  estado: 'abierto' | 'en_revision' | 'resuelto' | 'cerrado';
  fechaApertura: string;
  monto: number;
  evidencia: string[];
}

export const ManageDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: 'DISP-001',
      ordenId: 'ORD-015',
      comprador: 'Juan Pérez',
      vendedor: 'Productor García',
      razon: 'Producto en mal estado',
      descripcion: 'Los tomates llegaron con golpes y muy blandos, no aptos para consumo',
      estado: 'abierto',
      fechaApertura: '2025-02-04',
      monto: 45.0,
      evidencia: ['foto1.jpg', 'foto2.jpg'],
    },
    {
      id: 'DISP-002',
      ordenId: 'ORD-018',
      comprador: 'María López',
      vendedor: 'Productor Rodríguez',
      razon: 'No recibió producto',
      descripcion: 'Orden no llegó según lo establecido. Rastreo no llegó a destino.',
      estado: 'en_revision',
      fechaApertura: '2025-02-02',
      monto: 32.5,
      evidencia: [],
    },
    {
      id: 'DISP-003',
      ordenId: 'ORD-012',
      comprador: 'Carlos González',
      vendedor: 'Productor Martínez',
      razon: 'Cantidad incorrecta',
      descripcion: 'Pedí 10kg pero recibí solamente 7kg',
      estado: 'resuelto',
      fechaApertura: '2025-01-28',
      monto: 24.0,
      evidencia: ['pesaje.jpg'],
    },
  ]);

  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('abierto');

  const estadoColors: Record<string, string> = {
    abierto: 'bg-red-100 text-red-800',
    en_revision: 'bg-yellow-100 text-yellow-800',
    resuelto: 'bg-blue-100 text-blue-800',
    cerrado: 'bg-gray-100 text-gray-800',
  };

  const updateDisputeStatus = (disputeId: string, newStatus: string) => {
    setDisputes(
      disputes.map((dispute) =>
        dispute.id === disputeId
          ? { ...dispute, estado: newStatus as any }
          : dispute
      )
    );
  };

  const resolveDispute = (disputeId: string) => {
    if (resolution.trim()) {
      updateDisputeStatus(disputeId, 'resuelto');
      alert(`Disputa ${disputeId} resuelta.\nResolución: ${resolution}`);
      setResolution('');
      setSelectedDispute(null);
    }
  };

  const filteredDisputes = disputes.filter(
    (d) => filterEstado === 'todos' || d.estado === filterEstado
  );

  const openCount = disputes.filter((d) => d.estado === 'abierto').length;
  const inReviewCount = disputes.filter((d) => d.estado === 'en_revision').length;
  const totalAmount = disputes
    .filter((d) => d.estado !== 'cerrado')
    .reduce((sum, d) => sum + d.monto, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resolución de Disputas</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <p className="text-sm opacity-80">Disputas Abiertas</p>
          <p className="text-3xl font-bold">{openCount}</p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
          <p className="text-sm opacity-80">En Revisión</p>
          <p className="text-3xl font-bold">{inReviewCount}</p>
        </div>
        <div className="bg-orange-100 text-orange-800 p-4 rounded-lg">
          <p className="text-sm opacity-80">Monto Total en Disputa</p>
          <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['abierto', 'en_revision', 'resuelto', 'cerrado', 'todos'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterEstado(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filterEstado === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'en_revision' ? 'En Revisión' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Disputes Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">ID Disputa</th>
              <th className="px-4 py-3 text-left font-semibold">Orden</th>
              <th className="px-4 py-3 text-left font-semibold">Comprador</th>
              <th className="px-4 py-3 text-left font-semibold">Razón</th>
              <th className="px-4 py-3 text-right font-semibold">Monto</th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisputes.map((dispute) => (
              <tr key={dispute.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{dispute.id}</td>
                <td className="px-4 py-3 text-sm">{dispute.ordenId}</td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{dispute.comprador}</p>
                    <p className="text-xs text-gray-500">vs {dispute.vendedor}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{dispute.razon}</td>
                <td className="px-4 py-3 text-right font-medium">${dispute.monto.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColors[dispute.estado]}`}>
                    {dispute.estado === 'en_revision' ? 'En Revisión' : dispute.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedDispute(dispute)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Revisar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedDispute.id}</h3>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Dispute Info */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Orden Relacionada</p>
                  <p className="font-semibold">{selectedDispute.ordenId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto en Disputa</p>
                  <p className="font-semibold">${selectedDispute.monto.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Comprador</p>
                <p className="font-semibold">{selectedDispute.comprador}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Vendedor</p>
                <p className="font-semibold">{selectedDispute.vendedor}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Razón</p>
                <p className="bg-gray-50 p-2 rounded">{selectedDispute.razon}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Descripción</p>
                <p className="bg-gray-50 p-2 rounded">{selectedDispute.descripcion}</p>
              </div>

              {selectedDispute.evidencia.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Evidencia</p>
                  <div className="flex gap-2">
                    {selectedDispute.evidencia.map((file, idx) => (
                      <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resolution Section */}
            {selectedDispute.estado !== 'cerrado' && (
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium">Resolución</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Ingresa cómo se resolverá esta disputa..."
                  className="w-full border rounded px-3 py-2 h-20"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {selectedDispute.estado !== 'cerrado' && (
                <>
                  <button
                    onClick={() => resolveDispute(selectedDispute.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded"
                  >
                    Resolver Disputa
                  </button>
                  <button
                    onClick={() => {
                      updateDisputeStatus(selectedDispute.id, 'en_revision');
                      setSelectedDispute(null);
                    }}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 rounded"
                  >
                    En Revisión
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedDispute(null)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDisputes;
