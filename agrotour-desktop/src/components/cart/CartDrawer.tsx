/**
 * CartDrawer - Drawer lateral para mostrar y editar el carrito
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { carro, open, closeCart, actualizarCantidad, eliminarDelCarro, vaciarCarro } = useCart();

  const total = carro.reduce((s, i) => s + i.precio * i.cantidad, 0);

  const handleCheckout = () => {
    navigate('/checkout');
    closeCart();
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-gray-900 shadow-lg transform transition-transform z-50 ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-bold">Carrito</h2>
        <div className="flex items-center gap-2">
          <button onClick={vaciarCarro} className="text-sm text-red-600">Vaciar</button>
          <button onClick={closeCart} className="px-2 py-1 bg-gray-200 rounded">Cerrar</button>
        </div>
      </div>

      <div className="p-4 overflow-auto h-[calc(100%-160px)]">
        {carro.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <div className="space-y-4">
            {carro.map((item) => (
              <div key={String(item.id || item.nombre)} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{item.nombre}</div>
                  <div className="text-sm text-gray-500">${item.precio.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidad(item.id, Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <button onClick={() => eliminarDelCarro(item.id)} className="text-sm text-red-600">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500">Total</div>
          <div className="font-bold text-lg text-green-600">${total.toFixed(2)}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheckout}
            disabled={carro.length === 0}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Checkout
          </button>
          <button onClick={closeCart} className="px-4 py-2 border rounded hover:bg-gray-100">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
