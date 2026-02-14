import React, { useState, useEffect, useRef } from 'react';
import { LineChart, XAxis, YAxis, Line, BarChart, Bar } from 'recharts';
import { API_URL, fetchWithAuth, handleApiError } from '../../lib/utils';

interface ProductoMasVendido {
  name: string;
  cantidad: number;
}

interface EstadisticasMensuales {
  mes: string;
  ganancias: number;
  gastos: number;
}

interface VisitasEstado {
  estado: string;
  cantidad: number;
}

const EstadisticasProductor = () => {
  const [ventasMensuales, setVentasMensuales] = useState<EstadisticasMensuales[]>([]);
  const [estadoVisitas, setEstadoVisitas] = useState<VisitasEstado[]>([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoMasVendido[]>([]); // Tipo explícito
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarGraficos, setMostrarGraficos] = useState(true);

  const chartRef = useRef<HTMLDivElement | null>(null);

  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchEstadisticas = async () => {
      setCargando(true);
      try {
        const ventasResponse = await fetchWithAuth(`${API_URL}/estadisticas/ventas/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!ventasResponse.ok) {
          throw new Error('Error al cargar las estadísticas de ventas.');
        }

        const ventasData = await ventasResponse.json();
        setVentasMensuales(ventasData.mensuales || []);

        const visitasResponse = await fetchWithAuth(`${API_URL}/estadisticas/visitas/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!visitasResponse.ok) {
          throw new Error('Error al cargar las estadísticas de visitas.');
        }

        const visitasData = await visitasResponse.json();
        setEstadoVisitas(visitasData.estado || []);

        setProductosMasVendidos([
          { name: 'Producto A', cantidad: 150 },
          { name: 'Producto B', cantidad: 100 },
          { name: 'Producto C', cantidad: 80 },
        ]);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al conectarse con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    fetchEstadisticas();
  }, [accessToken]);

  const generarPdf = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/estadisticas/descargar-pdf/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'estadisticas_productor.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al descargar el PDF.');
    }
  };

  if (cargando) return <p className="text-center text-gray-600">Cargando estadísticas...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Estadísticas de Productor</h1>

      <div className="flex justify-between mb-4">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setMostrarGraficos(!mostrarGraficos)}
        >
          {mostrarGraficos ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={generarPdf}
        >
          Generar PDF
        </button>
      </div>

      {mostrarGraficos && (
        <div ref={chartRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-green-700">Ganancias Mensuales</h2>
            <LineChart width={400} height={300} data={ventasMensuales}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Line type="monotone" dataKey="ganancias" stroke="#4CAF50" />
              <Line type="monotone" dataKey="gastos" stroke="#F44336" />
            </LineChart>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 text-green-700">Estado de Visitas</h2>
            <BarChart width={400} height={300} data={estadoVisitas}>
              <XAxis dataKey="estado" />
              <YAxis />
              <Bar dataKey="cantidad" fill="#2196F3" />
            </BarChart>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-2 text-green-700">Productos Más Vendidos</h2>
            <BarChart width={800} height={300} data={productosMasVendidos}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="cantidad" fill="#FF9800" />
            </BarChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadisticasProductor;
