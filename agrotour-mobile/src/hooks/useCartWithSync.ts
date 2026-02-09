import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useSync } from '@/contexts/SyncContext';
import { globalErrorStore } from '@/services/GlobalErrorStore';

export interface CartOperation {
  type: 'add' | 'update' | 'remove' | 'clear';
  productId?: number;
  quantity?: number;
  timestamp: number;
}

/**
 * Hook para manejar el carrito con sincronización offline
 * Mantiene un registro de operaciones para sincronizar después
 */
export function useCartWithSync() {
  const { addItem, updateQuantity, removeItem, clearCart, items, itemCount, totalPrice } = useCart();
  const { addSyncOperation, isSyncing, pendingCount } = useSync();
  const [operationHistory, setOperationHistory] = useState<CartOperation[]>([]);

  // Registrar operación en historial para sincronización posterior
  const trackOperation = (op: CartOperation) => {
    setOperationHistory((prev) => [...prev, op]);
  };

  // Agregar item al carrito y registrar para sync
  const addItemWithSync = async (product: any, quantity: number) => {
    try {
      await addItem(product, quantity);

      const operation: CartOperation = {
        type: 'add',
        productId: product.id,
        quantity,
        timestamp: Date.now(),
      };

      trackOperation(operation);

      // Registrar en queue de sincronización
      await addSyncOperation('cart_item', {
        action: 'add',
        product_id: product.id,
        quantity,
        price: product.precio, // String from API
      });
    } catch (err) {
      globalErrorStore.setError('NETWORK_ERROR', 'No se pudo agregar el producto', { error: String(err) });
      throw err;
    }
  };

  // Actualizar cantidad y sincronizar
  const updateQuantityWithSync = async (productId: number, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);

      const operation: CartOperation = {
        type: 'update',
        productId,
        quantity: newQuantity,
        timestamp: Date.now(),
      };

      trackOperation(operation);

      // Registrar en sync queue
      await addSyncOperation('cart_item', {
        action: 'update',
        product_id: productId,
        quantity: newQuantity,
      });
    } catch (err) {
      globalErrorStore.setError('NETWORK_ERROR', 'No se pudo actualizar la cantidad', { error: String(err) });
      throw err;
    }
  };

  // Remover item y sincronizar
  const removeItemWithSync = async (productId: number) => {
    try {
      await removeItem(productId);

      const operation: CartOperation = {
        type: 'remove',
        productId,
        timestamp: Date.now(),
      };

      trackOperation(operation);

      // Registrar en sync queue
      await addSyncOperation('cart_item', {
        action: 'remove',
        product_id: productId,
      });
    } catch (err) {
      globalErrorStore.setError('NETWORK_ERROR', 'No se pudo remover el producto', { error: String(err) });
      throw err;
    }
  };

  // Limpiar carrito y sincronizar
  const clearCartWithSync = async () => {
    try {
      await clearCart();

      const operation: CartOperation = {
        type: 'clear',
        timestamp: Date.now(),
      };

      trackOperation(operation);

      // Registrar en sync queue
      await addSyncOperation('cart_item', {
        action: 'clear_all',
      });
    } catch (err) {
      globalErrorStore.setError('NETWORK_ERROR', 'No se pudo limpiar el carrito', { error: String(err) });
      throw err;
    }
  };

  return {
    // Datos del carrito
    items,
    itemCount,
    totalPrice,
    operationHistory,

    // Operaciones con sync
    addItem: addItemWithSync,
    updateQuantity: updateQuantityWithSync,
    removeItem: removeItemWithSync,
    clearCart: clearCartWithSync,

    // Estado de sincronización
    isSyncing,
    pendingCount,
    hasPendingOperations: pendingCount > 0,
  };
}

/**
 * Hook para validar estado del carrito antes de checkout
 */
export function useCartValidation() {
  const { items, totalPrice } = useCart();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errors: string[] = [];

    if (!items || items.length === 0) {
      errors.push('El carrito está vacío');
    }

    // Validar que todos los items tengan cantidad > 0
    const invalidItems = items.filter((item: any) => !item.quantity || item.quantity < 1);
    if (invalidItems.length > 0) {
      errors.push(`${invalidItems.length} producto(s) con cantidad inválida`);
    }

    // Validar precios
    const invalidPrices = items.filter((item: any) => {
      const price = parseFloat(String(item.price || item.precio || 0));
      return isNaN(price) || price < 0;
    });
    if (invalidPrices.length > 0) {
      errors.push(`${invalidPrices.length} producto(s) con precio inválido`);
    }

    // Validar total
    if (!totalPrice || parseFloat(String(totalPrice)) <= 0) {
      errors.push('Total del carrito inválido');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    validate,
  };
}

/**
 * Calcular totales con precisión decimal
 */
export function useCartTotals() {
  const { items } = useCart();

  const calculations = {
    subtotal: items.reduce((sum, item: any) => {
      const price = parseFloat(String(item.price || item.precio || 0));
      const quantity = item.quantity || 0;
      return sum + price * quantity;
    }, 0),

    itemCount: items.reduce((count, item: any) => count + (item.quantity || 0), 0),

    getTaxAmount: (taxRate: number = 0.19) => {
      const subtotal = items.reduce((sum, item: any) => {
        const price = parseFloat(String(item.price || item.precio || 0));
        const quantity = item.quantity || 0;
        return sum + price * quantity;
      }, 0);
      return subtotal * taxRate;
    },

    getTotal: (taxRate: number = 0.19) => {
      const subtotal = items.reduce((sum, item: any) => {
        const price = parseFloat(String(item.price || item.precio || 0));
        const quantity = item.quantity || 0;
        return sum + price * quantity;
      }, 0);
      const tax = subtotal * taxRate;
      return subtotal + tax;
    },
  };

  return calculations;
}
