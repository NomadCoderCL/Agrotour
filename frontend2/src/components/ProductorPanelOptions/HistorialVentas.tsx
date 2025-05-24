import React, { useState, useEffect } from 'react';
import { API_URL, fetchWithAuth, handleApiError } from '../../lib/utils';

interface Venta {
  id: number;
  fecha: string;
  tipo: string;
  total: number;
  detalles: Detalle[];
}

interface Detalle {
  id: number;
  producto: string;
  cantidad: number;
  precio: number;
}

const HistorialVentas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filtro, setFiltro] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  useEffect(() => {
    const obtenerVentas = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/ventas/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Error al obtener las ventas');
        }
        const data = await response.json();

        // Sanitizar los datos recibidos
        const ventasValidas = data.map((venta: any) => ({
          ...venta,
          tipo: venta.tipo || 'Desconocido', // Asegurarse de que tipo siempre tenga un valor
          total: Number(venta.total) || 0,
          detalles: venta.detalles?.map((detalle: any) => ({
            ...detalle,
            precio: Number(detalle.precio) || 0,
          })) || [],
        }));

        setVentas(ventasValidas);
      } catch (error: any) {
        console.error(error.message || 'Error desconocido');
      }
    };

    obtenerVentas();
  }, []);

  const filtrarVentas = (filtro: string) => {
    return ventas.filter((venta) =>
      venta.tipo?.toString().toLowerCase().includes(filtro.toLowerCase())
    );
  };

  const descargarComprobante = async (id: number) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/boletas/${id}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al descargar el comprobante');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `boleta_${id}.pdf`;
      link.click();
    } catch (error: any) {
      console.error(error.message || 'Error desconocido');
      alert('Error al descargar el comprobante.');
    }
  };

  const verDetalle = (venta: Venta) => {
    setVentaSeleccionada(venta);
  };

  const cerrarDetalle = () => {
    setVentaSeleccionada(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Historial de Ventas</h1>
      <div className="flex justify-between gap-4 mb-6">
        <input
          type="search"
          className="w-full md:w-1/2 lg:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
          placeholder="Buscar por tipo de venta"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left border-collapse">
          <thead className="bg-green-100">
            <tr>
              <th className="px-4 py-2 text-green-700">ID</th>
              <th className="px-4 py-2 text-green-700">Fecha</th>
              <th className="px-4 py-2 text-green-700">Tipo</th>
              <th className="px-4 py-2 text-green-700">Total</th>
              <th className="px-4 py-2 text-green-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrarVentas(filtro).length > 0 ? (
              filtrarVentas(filtro).map((venta) => (
                <tr key={venta.id} className="hover:bg-green-50">
                  <td className="border px-4 py-2">{venta.id}</td>
                  <td className="border px-4 py-2">
                    {new Date(venta.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="border px-4 py-2">{venta.tipo}</td>
                  <td className="border px-4 py-2">
                    ${!isNaN(Number(venta.total)) ? venta.total.toFixed(2) : '0.00'}
                  </td>
                  <td className="border px-4 py-2 flex gap-2 justify-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-lg"
                      onClick={() => descargarComprobante(venta.id)}
                    >
                      Descargar
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-lg"
                      onClick={() => verDetalle(venta)}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No se encontraron ventas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ventaSeleccionada && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Detalle de Venta</h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-4 py-2 text-green-700">ID</th>
                  <th className="px-4 py-2 text-green-700">Producto</th>
                  <th className="px-4 py-2 text-green-700">Cantidad</th>
                  <th className="px-4 py-2 text-green-700">Precio</th>
                </tr>
              </thead>
              <tbody>
                {ventaSeleccionada.detalles.map((detalle) => (
                  <tr key={detalle.id} className="hover:bg-green-50">
                    <td className="border px-4 py-2">{detalle.id}</td>
                    <td className="border px-4 py-2">{detalle.producto}</td>
                    <td className="border px-4 py-2">{detalle.cantidad}</td>
                    <td className="border px-4 py-2">
                      ${!isNaN(Number(detalle.precio)) ? detalle.precio.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            onClick={cerrarDetalle}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialVentas;
