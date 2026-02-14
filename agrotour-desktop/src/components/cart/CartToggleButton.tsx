/**
 * CartToggleButton - botón simple para abrir el carrito y mostrar cantidad
 */

import React from 'react';
import { useCart } from '@/contexts/CartContext';

export const CartToggleButton: React.FC = () => {
  const { carro, openCart } = useCart();
  const totalItems = carro.reduce((s, i) => s + i.cantidad, 0);

  return (
    <button onClick={openCart} className="relative">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{totalItems}</span>
      )}
    </button>
  );
};

export default CartToggleButton;
