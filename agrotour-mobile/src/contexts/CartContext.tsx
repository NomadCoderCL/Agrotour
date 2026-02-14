import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { databaseManager } from '../database/DatabaseManager';
import { Product } from '../shared/types'; // Asumiendo que tienes un tipo Product

// La interfaz del item en el carrito, reflejando la tabla `cart_items`
export interface CartItem {
  id: number; // Corresponde al `id` autoincremental de la tabla
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

interface CartContextData {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  confirmPurchase: () => Promise<any>; // Placeholder para Fase B
  isLoading: boolean;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const db = databaseManager.getDatabase();

  // Cargar el carrito desde SQLite al iniciar
  const loadCart = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cart_items;',
          [],
          (_, { rows: { _array } }) => {
            setCartItems(_array as CartItem[]);
            resolve();
          },
          (_, error) => {
            console.error('Error loading cart from SQLite:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  }, [db]);

  useEffect(() => {
    setIsLoading(true);
    loadCart().finally(() => setIsLoading(false));
  }, [loadCart]);

  // Añadir un producto o actualizar su cantidad si ya existe
  const addToCart = async (product: Product, quantity: number) => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO cart_items (product_id, quantity, name, price, image) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(product_id) DO UPDATE SET quantity = quantity + excluded.quantity;`,
          [product.id, quantity, product.name, product.price, product.image_url],
          () => {
            loadCart().then(resolve);
          },
          (_, error) => {
            console.error('Error adding/updating item in SQLite:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  };

  // Quitar un item del carrito
  const removeFromCart = async (cartItemId: number) => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM cart_items WHERE id = ?;`,
          [cartItemId],
          () => {
            loadCart().then(resolve);
          },
          (_, error) => {
            console.error('Error removing item from SQLite:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  };

  // Actualizar la cantidad de un item
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      return removeFromCart(cartItemId);
    }
    return new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQuantity, cartItemId],
          () => {
            loadCart().then(resolve);
          },
          (_, error) => {
            console.error('Error updating quantity in SQLite:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  };

  // Vaciar el carrito
  const clearCart = async () => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM cart_items;',
          [],
          () => {
            loadCart().then(resolve);
          },
          (_, error) => {
            console.error('Error clearing cart in SQLite:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  };

  // Calcular el total
  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Lógica de confirmación de compra (FASE B)
  const confirmPurchase = async () => {
    console.log("Confirming purchase... This will be handled by the Sync Engine in Phase B.");
    // 1. Crear un payload para la orden.
    // 2. Insertar la operación en la `offline_queue` con estado PENDING.
    // 3. Limpiar el carrito localmente.
    await clearCart(); // El comportamiento esperado es que el carrito se vacíe
    return { success: true, message: 'Orden encolada para sincronización.' };
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateQuantity, getTotal, confirmPurchase, isLoading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
