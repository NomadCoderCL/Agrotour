/**
 * ProductoCard - Muestra la tarjeta de un producto y permite agregar al carrito
 */

import React from 'react';
import { Producto } from '@/types/models';
import { useSyncOperation } from '@/hooks';
import { useCart } from '@/contexts/CartContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Props {
  producto: Producto;
}

export const ProductoCard: React.FC<Props> = ({ producto }) => {
  const { enqueueOperation } = useSyncOperation();
  const { agregarAlCarro, openCart } = useCart();
  const [adding, setAdding] = React.useState(false);

  const handleAdd = async () => {
    try {
      setAdding(true);
      await agregarAlCarro({ producto_id: producto.id, nombre: producto.nombre || producto.titulo || 'Producto', precio: producto.precio || 0, cantidad: 1 } as any);
      // Abrir drawer para feedback
      openCart();
    } catch (err) {
      console.error('Error adding to cart', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
      <div className="h-40 w-full mb-3 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
        {producto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.imagen_url} alt={producto.nombre} className="object-cover h-full w-full" />
        ) : (
          <div className="text-gray-400">Sin imagen</div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{producto.nombre}</h3>
        {producto.productor_nombre && (
          <p className="text-xs text-gray-500">{producto.productor_nombre}</p>
        )}
        <p className="mt-2 font-bold text-green-600 dark:text-green-400">${producto.precio?.toFixed(2) ?? '0.00'}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleAdd}
          disabled={adding}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
        >
          {adding ? <LoadingSpinner size="sm" /> : 'Agregar'}
        </button>
      </div>
    </div>
  );
};

export default ProductoCard;
