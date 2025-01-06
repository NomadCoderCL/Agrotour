import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface ProductoAPI {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  categoria: number | null;
  productor: number;
  stock: number;
  metodo_venta: string;
}

const ExplorarProductos: React.FC = () => {
  const [busqueda, setBusqueda] = useState<string>("");
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoAPI[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { agregarAlCarro, obtenerCantidadEnCarro } = useCart();
  const navigate = useNavigate();

  // Obtener el token de acceso del localStorage
  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    const fetchProductos = async () => {
      setCargando(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:8000/api/productos/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Error al obtener los productos.");
        }

        const data: ProductoAPI[] = await response.json();
        setProductosDisponibles(data);
      } catch (err: any) {
        setError(err.message || "Error al conectarse con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, [accessToken, navigate]);

  const productosFiltrados = productosDisponibles.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const handleAgregarAlCarro = (producto: ProductoAPI) => {
    const cantidadEnCarro = obtenerCantidadEnCarro(producto.id) || 0;

    if (cantidadEnCarro >= producto.cantidad) {
      alert("No puedes agregar más productos de los disponibles en inventario.");
      return;
    }

    agregarAlCarro({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1, // Incrementa en 1 al añadir
    });

    
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-2 text-green-700">Explorar productos</h2>
      <input
        type="search"
        placeholder="Buscar productos"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      {cargando ? (
        <p className="text-gray-600">Cargando productos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          {productosFiltrados.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosFiltrados.map((producto) => {
                const cantidadEnCarro = obtenerCantidadEnCarro(producto.id) || 0;
                const disponibleParaAgregar = producto.cantidad - cantidadEnCarro;

                return (
                  <div key={producto.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-md font-semibold mb-2">{producto.nombre}</h3>
                    <p className="text-sm text-gray-700 mb-2">{producto.descripcion}</p>
                    <p className="text-sm text-gray-700">Precio: ${Number(producto.precio).toFixed(2)}</p>
                    <p className="text-sm text-gray-700">
                      Disponible: {producto.cantidad} ({disponibleParaAgregar} restantes)
                    </p>
                    <button
                      className={`mt-4 w-full ${
                        disponibleParaAgregar > 0
                          ? "bg-blue-500 hover:bg-blue-700"
                          : "bg-gray-400 cursor-not-allowed"
                      } text-white font-bold py-2 px-4 rounded`}
                      onClick={() => handleAgregarAlCarro(producto)}
                      disabled={disponibleParaAgregar === 0}
                    >
                      {disponibleParaAgregar > 0 ? "Agregar al Carrito" : "Agotado"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No hay productos que coincidan con los filtros.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorarProductos;
