import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const CarroDeCompras: React.FC = () => {
  const { carro, eliminarDelCarro, actualizarCantidad, vaciarCarro } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');

  const realizarCompra = async () => {
    if (!accessToken) {
      setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    if (carro.length === 0) {
      setError('El carro de compras está vacío.');
      return;
    }

    setCargando(true);
    setError(null);
    setExito(null);

    const carritoEnviar = carro.map((producto) => ({
      producto_id: producto.id,
      cantidad: producto.cantidad,
    }));

    try {
      const response = await fetch('http://localhost:8000/api/confirmar-compra/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ carrito: carritoEnviar }),
      });

      if (response.ok) {
        const data = await response.json();
        setExito(`Compra realizada exitosamente. ID de la compra: ${data.ventas[0].id}`);
        vaciarCarro();
      } else if (response.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al realizar la compra.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectarse con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const calcularTotal = () =>
    carro.reduce((total, producto) => total + (producto.precio ?? 0) * producto.cantidad, 0);

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4 text-green-700">Carro de Compras</h2>
      {cargando && <p className="text-center text-gray-600">Procesando compra...</p>}
      {error && <p className="text-center text-red-500 mb-4">{error}</p>}
      {exito && <p className="text-center text-green-500 mb-4">{exito}</p>}

      {carro.length > 0 ? (
        <ul className="mb-4">
          {carro.map((producto) => (
            <li key={producto.id} className="flex items-center mb-4 bg-gray-50 p-4 rounded-lg shadow">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {producto.nombre?.charAt(0).toUpperCase() || 'P'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{producto.nombre || 'Producto Desconocido'}</h3>
                <p className="text-sm text-gray-600">
                  Precio: ${Number(producto.precio ?? 0).toFixed(2)} x {producto.cantidad} = $
                  {(Number(producto.precio ?? 0) * producto.cantidad).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={producto.cantidad}
                  min="1"
                  onChange={(e) =>
                    actualizarCantidad(
                      producto.id,
                      Math.max(1, parseInt(e.target.value, 10) || 1)
                    )
                  }
                  className="w-12 h-8 pl-2 text-lg border border-gray-400 rounded"
                  title={`Cantidad para ${producto.nombre || 'Producto'}`}
                  aria-label={`Cantidad para ${producto.nombre || 'Producto'}`}
                />
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  onClick={() => eliminarDelCarro(producto.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-center mb-4">Tu carro de compras está vacío.</p>
      )}
      {carro.length > 0 && (
        <div>
          <p className="text-lg font-bold mb-4">Total: ${calcularTotal().toFixed(2)}</p>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            onClick={realizarCompra}
            disabled={cargando || carro.length === 0}
          >
            {cargando ? 'Procesando...' : 'Realizar Compra'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CarroDeCompras;
