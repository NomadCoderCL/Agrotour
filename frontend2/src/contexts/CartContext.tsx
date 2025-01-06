import React, { createContext, useState, ReactNode, useContext } from 'react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartContextType {
  carro: Producto[];
  agregarAlCarro: (producto: Producto) => void;
  eliminarDelCarro: (id: number) => void;
  actualizarCantidad: (id: number, cantidad: number) => void;
  vaciarCarro: () => void;
  obtenerCantidadEnCarro: (id: number) => number; // Nueva función
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [carro, setCarro] = useState<Producto[]>([]);

  const agregarAlCarro = (producto: Producto) => {
    setCarro(prevCarro => {
      const existente = prevCarro.find(item => item.id === producto.id);
      if (existente) {
        return prevCarro.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + producto.cantidad }
            : item
        );
      } else {
        return [...prevCarro, producto];
      }
    });
  };

  const eliminarDelCarro = (id: number) => {
    setCarro(prevCarro => prevCarro.filter(producto => producto.id !== id));
  };

  const actualizarCantidad = (id: number, cantidad: number) => {
    setCarro(prevCarro =>
      prevCarro.map(producto =>
        producto.id === id ? { ...producto, cantidad } : producto
      )
    );
  };

  const vaciarCarro = () => {
    setCarro([]);
  };

  // Nueva función: obtener la cantidad de un producto específico en el carrito
  const obtenerCantidadEnCarro = (id: number): number => {
    const producto = carro.find(producto => producto.id === id);
    return producto ? producto.cantidad : 0;
  };

  return (
    <CartContext.Provider
      value={{
        carro,
        agregarAlCarro,
        eliminarDelCarro,
        actualizarCantidad,
        vaciarCarro,
        obtenerCantidadEnCarro, // Incluyendo la nueva función
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
