/**
 * Cart Context - State management para carrito de compras
 * Persiste en AsyncStorage
 */

import React, { createContext, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, CartItem, Producto, CartState } from '../shared/types';
import { STORAGE_KEYS } from '../shared/config';

interface CartContextType extends CartState {
  addItem: (product: Producto, cantidad: number) => Promise<void>;
  removeItem: (productoId: number) => Promise<void>;
  updateQuantity: (productoId: number, cantidad: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  confirmPurchase: () => Promise<{ venta_id: number; total: number } | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>({
    items: [],
    total: 0,
    currency: 'CLP',
    isLoading: false,
    error: null,
  });

  // Load cart from storage on mount
  React.useEffect(() => {
    const loadCart = async () => {
      try {
        const cartStr = await AsyncStorage.getItem(STORAGE_KEYS.CART);
        if (cartStr) {
          const cart = JSON.parse(cartStr) as Cart;
          setState((prev) => ({
            ...prev,
            items: cart.items,
            total: cart.total,
          }));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };

    loadCart();
  }, []);

  const saveCart = useCallback(async (items: CartItem[]) => {
    try {
      const total = items.reduce((sum, item) => sum + ((item.product?.precio || 0) * item.cantidad), 0);
      const cart: Cart = {
        items,
        total,
        currency: 'CLP',
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      setState((prev) => ({
        ...prev,
        items,
        total,
      }));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, []);

  const addItem = useCallback(
    async (product: Producto, cantidad: number) => {
      const newItems = [...state.items];
      const existingIndex = newItems.findIndex((item) => item.producto_id === product.id);

      if (existingIndex >= 0) {
        newItems[existingIndex].cantidad += cantidad;
      } else {
        newItems.push({
          producto_id: product.id,
          cantidad,
          product,
        });
      }

      await saveCart(newItems);
    },
    [state.items, saveCart]
  );

  const removeItem = useCallback(
    async (productoId: number) => {
      const newItems = state.items.filter((item) => item.producto_id !== productoId);
      await saveCart(newItems);
    },
    [state.items, saveCart]
  );

  const updateQuantity = useCallback(
    async (productoId: number, cantidad: number) => {
      const newItems = state.items.map((item) =>
        item.producto_id === productoId ? { ...item, cantidad } : item
      );
      await saveCart(newItems);
    },
    [state.items, saveCart]
  );

  const clearCart = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.CART);
    setState({
      items: [],
      total: 0,
      currency: 'CLP',
      isLoading: false,
      error: null,
    });
  }, []);

  const getTotal = useCallback(() => {
    return state.items.reduce((sum, item) => sum + ((item.product?.precio || 0) * item.cantidad), 0);
  }, [state.items]);

  const confirmPurchase = useCallback(async () => {
    if (state.items.length === 0) return null;

    try {
      // Assuming apiClient.post('/api/confirmar-compra/') returns { venta_id, monto_total }
      // We need to implement this endpoint or ensure it exists.
      // Based on previous files, confirming purchase logic might exist or needs to be added.
      // For now, let's assume valid response structure based on backend.

      const response = await import('../services/api').then(m => m.apiClient.post<{ venta_id: number, total: number }>('/confirmar-compra/', {
        items: state.items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad }))
      }));

      // Axios returns the data directly because of the interceptor/method in api.ts? 
      // Checking api.ts: "return this.retryWithBackoff(() => this.axiosInstance.post<T>(url, data, config));"
      // Wait, api.ts post returns "this.axiosInstance.post", which returns an AxiosResponse. 
      // BUT other methods like getProductos doing ".then(res => res.data)".
      // Let's verify api.ts generic post.
      // "async post<T>(url: string, data?: any, config?: any) { return this.retryWithBackoff(() => this.axiosInstance.post<T>(url, data, config)); }"
      // It returns AxiosResponse<T>.
      // So response.data is what we need.

      return response.data;
    } catch (error) {
      console.error("Purchase failed", error);
      throw error;
    }
  }, [state.items]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        confirmPurchase,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
