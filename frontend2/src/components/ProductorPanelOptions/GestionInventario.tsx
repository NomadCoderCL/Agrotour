import React, { useState, useEffect } from 'react';
import { API_URL, fetchWithAuth, handleApiError } from '../../lib/utils';

interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  categoria: string;
  modoVenta: string;
}

const GestionInventario: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [formulario, setFormulario] = useState<Producto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const accessToken = localStorage.getItem('access_token');

  // Obtener productos desde el backend
  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      try {
        const response = await fetchWithAuth(`${API_URL}/api/productos/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Error al cargar los productos');
        const data = await response.json();
        setProductos(data);
      } catch (err: any) {
        setError(err.message || 'Error al conectarse con el servidor');
      } finally {
        setCargando(false);
      }
    };
    fetchProductos();
  }, [accessToken]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // Crear o actualizar un producto
  const guardarProducto = async () => {
    if (!formulario) return;
    if (!formulario.nombre || !formulario.cantidad || !formulario.precio || !formulario.categoria || !formulario.modoVenta) {
      alert('Por favor completa todos los campos.');
      return;
    }

    setCargando(true);
    try {
      const metodo = formulario.id ? 'PUT' : 'POST';
      const url = formulario.id
        ? `${API_URL}/api/productos/${formulario.id}/`
        : `${API_URL}/api/productos/`;
      const response = await fetchWithAuth(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formulario),
      });

      if (!response.ok) throw new Error('Error al guardar el producto');
      const productoGuardado = await response.json();

      setProductos((prev) =>
        formulario.id
          ? prev.map((producto) => (producto.id === productoGuardado.id ? productoGuardado : producto))
          : [...prev, productoGuardado]
      );

      resetFormulario();
    } catch (err: any) {
      setError(err.message || 'Error al conectarse con el servidor');
    } finally {
      setCargando(false);
    }
  };

  // Eliminar un producto
  const eliminarProducto = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    setCargando(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/api/productos/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Error al eliminar el producto');
      setProductos((prev) => prev.filter((producto) => producto.id !== id));
    } catch (err: any) {
      handleApiError(err, setError);
    } finally {
      setCargando(false);
    }
  };

  // Resetear formulario
  const resetFormulario = () => {
    setFormularioVisible(false);
    setFormulario(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Gestión de Inventario</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {cargando && <p className="text-gray-500">Procesando...</p>}

      <button
        onClick={() => {
          setFormulario({ id: 0, nombre: '', cantidad: 0, precio: 0, categoria: '', modoVenta: '' });
          setFormularioVisible(true);
        }}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Agregar Producto
      </button>

      <table className="w-full table-auto border-collapse mb-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Cantidad</th>
            <th className="border px-4 py-2">Precio</th>
            <th className="border px-4 py-2">Categoría</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td className="border px-4 py-2">{producto.nombre}</td>
              <td className="border px-4 py-2">{producto.cantidad}</td>
              <td className="border px-4 py-2">${producto.precio.toFixed(2)}</td>
              <td className="border px-4 py-2">{producto.categoria}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => {
                    setFormulario({ ...producto });
                    setFormularioVisible(true);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarProducto(producto.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {formularioVisible && formulario && (
        <form className="bg-white p-4 rounded shadow">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre del Producto
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={handleChange}
            placeholder="Nombre del producto"
            className="border p-2 rounded w-full mb-2"
          />

          <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
            Cantidad
          </label>
          <input
            id="cantidad"
            type="number"
            name="cantidad"
            value={formulario.cantidad}
            onChange={handleChange}
            placeholder="Cantidad"
            className="border p-2 rounded w-full mb-2"
          />

          <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
            Precio
          </label>
          <input
            id="precio"
            type="number"
            name="precio"
            value={formulario.precio}
            onChange={handleChange}
            placeholder="Precio"
            className="border p-2 rounded w-full mb-2"
          />

          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
            Categoría
          </label>
          <input
            id="categoria"
            type="text"
            name="categoria"
            value={formulario.categoria}
            onChange={handleChange}
            placeholder="Categoría"
            className="border p-2 rounded w-full mb-2"
          />

          <label htmlFor="modoVenta" className="block text-sm font-medium text-gray-700">
            Modo de Venta
          </label>
          <select
            id="modoVenta"
            name="modoVenta"
            value={formulario.modoVenta}
            onChange={handleChange}
            className="border p-2 rounded w-full mb-4"
          >
            <option value="">Seleccionar modo de venta</option>
            <option value="unidad">Por Unidad</option>
            <option value="peso">Por Peso</option>
          </select>

          <button
            type="button"
            onClick={guardarProducto}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            {formulario.id ? 'Actualizar Producto' : 'Agregar Producto'}
          </button>
          <button
            type="button"
            onClick={resetFormulario}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
};

export default GestionInventario;
