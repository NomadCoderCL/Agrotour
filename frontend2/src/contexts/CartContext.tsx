import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { SyncOperation } from '@/types/models';
import { syncClient, dbOperations } from '@/services';
import getLogger from '@/lib/logger';

const logger = getLogger('CartContext');

interface Producto {
  id: string | number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartContextType {
  carro: Producto[];
  agregarAlCarro: (producto: Omit<Producto, 'cantidad'> & { cantidad?: number }) => Promise<void>;
  eliminarDelCarro: (id: string | number) => Promise<void>;
  actualizarCantidad: (id: string | number, cantidad: number) => Promise<void>;
  vaciarCarro: () => Promise<void>;
  obtenerCantidadEnCarro: (id: string | number) => number;
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [carro, setCarro] = useState<Producto[]>([]);
  const [open, setOpen] = useState(false);

  // Load cart from IndexedDB on mount
  useEffect(() => {
    const loadCartFromDB = async () => {
      try {
        const items = await dbOperations.getAllCarritoItems();
        if (items && items.length > 0) {
          setCarro(items as Producto[]);
          logger.info(`Loaded ${items.length} items from IndexedDB cart`);
        }
      } catch (err) {
        logger.warn('Failed to load cart from IndexedDB', err);
      }
    };
    loadCartFromDB();
  }, []);

  // Persist cart to IndexedDB whenever it changes
  useEffect(() => {
    const persistCartToDB = async () => {
      try {
        await dbOperations.clearCarritoItems();
        for (const item of carro) {
          await dbOperations.upsertCarritoItem(item as any);
        }
        logger.info(`Persisted ${carro.length} items to IndexedDB cart`);
      } catch (err) {
        logger.warn('Failed to persist cart to IndexedDB', err);
      }
    };
    
    if (carro.length > 0 || carro.length === 0) {
      persistCartToDB();
    }
  }, [carro]);

  const enqueueCreate = async (producto: Producto) => {
    try {
      const op: SyncOperation = syncClient.createOperation('CREATE', 'CarritoItem', String(producto.id), producto as any);
      await syncClient.enqueueOperation(op);
      logger.info('Enqueued CREATE CarritoItem', producto.id);
    } catch (err) {
      logger.warn('enqueueCreate failed', err);
    }
  };

  const enqueueDelete = async (id: string | number) => {
    try {
      const op: SyncOperation = syncClient.createOperation('DELETE', 'CarritoItem', String(id), {} as any);
      await syncClient.enqueueOperation(op);
      logger.info('Enqueued DELETE CarritoItem', id);
    } catch (err) {
      logger.warn('enqueueDelete failed', err);
    }
  };

  const enqueueUpdate = async (id: string | number, cantidad: number) => {
    try {
      const op: SyncOperation = syncClient.createOperation('UPDATE', 'CarritoItem', String(id), { cantidad } as any);
      await syncClient.enqueueOperation(op);
      logger.info('Enqueued UPDATE CarritoItem', id, cantidad);
    } catch (err) {
      logger.warn('enqueueUpdate failed', err);
    }
  };

  const agregarAlCarro = async (producto: Omit<Producto, 'cantidad'> & { cantidad?: number }) => {
    const cantidad = producto.cantidad ?? 1;
    setCarro((prev) => {
      const exists = prev.find((p) => String(p.id) === String(producto.id));
      if (exists) {
        return prev.map((p) => (String(p.id) === String(producto.id) ? { ...p, cantidad: p.cantidad + cantidad } : p));
      }
      return [...prev, { ...producto, cantidad } as Producto];
    });
    await enqueueCreate({ ...producto, cantidad } as Producto);
  };

  const eliminarDelCarro = async (id: string | number) => {
    setCarro((prev) => prev.filter((p) => String(p.id) !== String(id)));
    await enqueueDelete(id);
  };

  const actualizarCantidad = async (id: string | number, cantidad: number) => {
    setCarro((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, cantidad } : p)));
    await enqueueUpdate(id, cantidad);
  };

  const vaciarCarro = async () => {
    setCarro([]);
    // Optionally enqueue clears in batch
  };

  const obtenerCantidadEnCarro = (id: string | number): number => {
    const producto = carro.find((p) => String(p.id) === String(id));
    return producto ? producto.cantidad : 0;
  };

  const value: CartContextType = {
    carro,
    agregarAlCarro,
    eliminarDelCarro,
    actualizarCantidad,
    vaciarCarro,
    obtenerCantidadEnCarro,
    open,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
