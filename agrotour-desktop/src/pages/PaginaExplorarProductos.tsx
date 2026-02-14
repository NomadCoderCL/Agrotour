import React, { useState, useEffect } from "react";
import { API_URL, fetchWithAuth, handleApiError } from '../lib/utils';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

const Catalogo: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los productos
  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetchWithAuth(`${API_URL}/api/catalogo/`);
      if (!response.ok) {
        throw new Error("Error al obtener productos");
      }
      const data = await response.json();
      setProductos(data);
    } catch (err: any) {
      handleApiError(err, setError);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Función para filtrar productos
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-green-300 via-[#AFEEEE] to-[#D2B48C] p-4">
      {/* Header */}
      <header className="text-center py-4 mb-4">
        <h1 className="text-3xl font-bold text-green-800">Explora Nuestros Productos</h1>
        <p className="text-gray-700">Conecta con los productores locales y descubre productos frescos</p>
      </header>

      {/* Barra de búsqueda */}
      <div className="flex justify-center mb-4">
        <input
          type="search"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full max-w-md p-3 border border-gray-300 rounded-full shadow-sm focus:ring focus:ring-green-300 focus:outline-none"
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {cargando && (
          <div className="flex justify-center items-center h-full">
            <p className="text-green-800 font-semibold">Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 font-bold">
            Error: {error}
          </div>
        )}

        {!cargando && !error && productosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-bold text-green-800">{producto.nombre}</h2>
                  <p className="text-sm text-gray-700">{producto.descripcion}</p>
                  <p className="text-green-700 font-bold text-lg mt-2">
                    ${producto.precio.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && !error && productosFiltrados.length === 0 && (
          <p className="text-center text-gray-700 mt-6">
            No se encontraron productos.
          </p>
        )}
      </div>

      {/* Mensaje de sesión */}
      <div className="mt-4 bg-yellow-100 text-yellow-600 border border-yellow-300 p-4 rounded-lg text-center text-sm">
        ⚠️ Inicia sesión para realizar compras o interactuar con los productos. Solo puedes explorar productos actualmente.
      </div>
    </div>
  );
};

export default Catalogo;
