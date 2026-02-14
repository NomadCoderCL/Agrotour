/**
 * Dexie.js IndexedDB Setup
 * Almacenamiento local para sincronización offline
 */

import Dexie, { Table } from "dexie";
import {
  Producto,
  Venta,
  DetalleVenta,
  Usuario,
  Ubicacion,
  Visita,
  SyncOperation,
  SyncConflict,
  PendingPayment,
  Feedback,
  Notificacion,
} from "../types/models";

/**
 * Definir esquema de IndexedDB
 */
export class AgrotourDB extends Dexie {
  // Tablas de datos
  productos!: Table<Producto>;
  usuarios!: Table<Usuario>;
  ventas!: Table<Venta>;
  detalles_venta!: Table<DetalleVenta>;
  ubicaciones!: Table<Ubicacion>;
  visitas!: Table<Visita>;
  feedback!: Table<Feedback>;
  notificaciones!: Table<Notificacion>;
  carrito!: Table<{ id: string | number; nombre: string; precio: number; cantidad: number }>;

  // Tablas de sincronización
  sync_operations!: Table<SyncOperation>;
  sync_conflicts!: Table<SyncConflict>;
  pending_payments!: Table<PendingPayment>;

  // Tabla de estado local
  sync_state!: Table<{
    id: string; // "sync_state" (singleton)
    last_sync: string;
    last_lamport_ts: number;
    device_id: string;
    is_online: boolean;
  }>;

  constructor() {
    super("agrotour");

    this.version(1).stores({
      // Datos principales
      productos:
        "++id, productorid, nombre, [productor_id+nombre]",
      usuarios: "++id, username, email, rol, is_active",
      ventas: "++id, cliente_id, productor_id, fecha_venta",
      detalles_venta: "++id, venta_id, producto_id",
      ubicaciones: "++id, productor_id",
      visitas: "++id, productor_id, cliente_id, fecha_visita, estado",
      feedback: "++id, cliente_id, productor_id",
      notificaciones: "++id, usuario_id, leido, fecha_creacion",
      carrito: "id",

      // Sync engine
      sync_operations:
        "++id, operation_id, entity_type, [entity_type+lamport_ts], device_id",
      sync_conflicts: "++id, operation_id, conflict_id, resolved",
      pending_payments:
        "++id, venta_id, status, [status+created_at]",

      // Estado
      sync_state: "id",
    });
  }
}

/**
 * Instancia global de BD
 */
export const db = new AgrotourDB();

/**
 * ==================
 * OPERACIONES CRUD
 * ==================
 */

export const dbOperations = {
  // ===== PRODUCTOS =====
  async addProducto(producto: Producto): Promise<number> {
    return db.productos.add(producto);
  },

  async updateProducto(id: number, changes: Partial<Producto>): Promise<number> {
    return db.productos.update(id, changes);
  },

  async deleteProducto(id: number): Promise<void> {
    return db.productos.delete(id);
  },

  async getProducto(id: number): Promise<Producto | undefined> {
    return db.productos.get(id);
  },

  async getAllProductos(): Promise<Producto[]> {
    return db.productos.toArray();
  },

  async getProductosByProducer(producerId: number): Promise<Producto[]> {
    return db.productos.where("productor_id").equals(producerId).toArray();
  },

  async searchProductos(query: string): Promise<Producto[]> {
    return db.productos
      .where("nombre")
      .startsWithIgnoreCase(query)
      .toArray();
  },

  // ===== VENTAS =====
  async addVenta(venta: Venta): Promise<number> {
    return db.ventas.add(venta);
  },

  async getVentasCliente(clienteId: number): Promise<Venta[]> {
    return db.ventas.where("cliente_id").equals(clienteId).toArray();
  },

  async getVentasProductor(producerId: number): Promise<Venta[]> {
    return db.ventas.where("productor_id").equals(producerId).toArray();
  },

  // ===== UBICACIONES =====
  async addUbicacion(ubicacion: Ubicacion): Promise<number> {
    return db.ubicaciones.add(ubicacion);
  },

  async updateUbicacion(id: number, changes: Partial<Ubicacion>): Promise<number> {
    return db.ubicaciones.update(id, changes);
  },

  async getAllUbicaciones(): Promise<Ubicacion[]> {
    return db.ubicaciones.toArray();
  },

  async getUbicacionByProducer(producerId: number): Promise<Ubicacion | undefined> {
    return db.ubicaciones
      .where("productor_id")
      .equals(producerId)
      .first();
  },

  // ===== VISITAS =====
  async addVisita(visita: Visita): Promise<number> {
    return db.visitas.add(visita);
  },

  async updateVisita(id: number, changes: Partial<Visita>): Promise<number> {
    return db.visitas.update(id, changes);
  },

  async getVisitasCliente(clienteId: number): Promise<Visita[]> {
    return db.visitas.where("cliente_id").equals(clienteId).toArray();
  },

  async getVisitasProductor(producerId: number): Promise<Visita[]> {
    return db.visitas.where("productor_id").equals(producerId).toArray();
  },

  // ===== CARRITO =====
  async upsertCarritoItem(item: { id: string | number; nombre: string; precio: number; cantidad: number }): Promise<any> {
    return db.carrito.put(item);
  },

  async getAllCarritoItems(): Promise<any[]> {
    return db.carrito.toArray();
  },

  async removeCarritoItem(id: string | number): Promise<void> {
    return db.carrito.delete(id);
  },

  async clearCarritoItems(): Promise<void> {
    return db.carrito.clear();
  },

  // ===== SYNC OPERATIONS =====
  async addSyncOperation(op: SyncOperation): Promise<number | string> {
    return db.sync_operations.add(op as any);
  },

  async addSyncOperations(ops: SyncOperation[]): Promise<(number | string)[]> {
    return db.sync_operations.bulkAdd(ops as any);
  },

  async getPendingSyncOperations(
    since?: number
  ): Promise<SyncOperation[]> {
    if (since !== undefined) {
      return db.sync_operations
        .where("lamport_ts")
        .above(since)
        .toArray();
    }
    return db.sync_operations.toArray();
  },

  async getSyncOperationsByEntity(
    entityType: string,
    entityId: string
  ): Promise<SyncOperation[]> {
    return db.sync_operations
      .where("[entity_type+lamport_ts]")
      .startsWith(entityType as any)
      .and((op) => op.entity_id === entityId)
      .toArray();
  },

  async deleteSyncOperation(operationId: string): Promise<void> {
    const count = await db.sync_operations.where("operation_id").equals(operationId).delete();
    return;
  },

  async clearSyncOperations(): Promise<void> {
    return db.sync_operations.clear();
  },

  // ===== SYNC CONFLICTS =====
  async addSyncConflict(conflict: SyncConflict): Promise<number | string> {
    return db.sync_conflicts.add(conflict as any);
  },

  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    return db.sync_conflicts.where("resolved").equals(0 as any).toArray();
  },

  async resolveSyncConflict(
    conflictId: string,
    resolution: "LOCAL" | "REMOTE" | "MERGED"
  ): Promise<number> {
    return db.sync_conflicts.update(conflictId, {
      resolved: true,
      resolution_choice: resolution,
    });
  },

  // ===== PENDING PAYMENTS =====
  async addPendingPayment(payment: PendingPayment): Promise<number | string> {
    return db.pending_payments.add(payment as any);
  },

  async getPendingPayments(): Promise<PendingPayment[]> {
    return db.pending_payments
      .where("status")
      .equals("PENDING")
      .toArray();
  },

  async markPaymentReconciled(paymentId: string): Promise<number> {
    return db.pending_payments.update(paymentId, {
      status: "RECONCILED",
      reconciled_at: new Date().toISOString(),
    });
  },

  async clearReconciledPayments(): Promise<void> {
    const count = await db.pending_payments
      .where("status")
      .equals("RECONCILED")
      .delete();
    return;
  },

  // ===== SYNC STATE =====
  async initSyncState(deviceId: string): Promise<number | string> {
    return db.sync_state.put({
      id: "sync_state",
      last_sync: new Date().toISOString(),
      last_lamport_ts: 0,
      device_id: deviceId,
      is_online: navigator.onLine,
    });
  },

  async updateSyncState(updates: Partial<{
    last_sync: string;
    last_lamport_ts: number;
    is_online: boolean;
  }>): Promise<number> {
    return db.sync_state.update("sync_state", updates);
  },

  async getSyncState() {
    return db.sync_state.get("sync_state");
  },

  // ===== GENERAL =====
  async clearAllData(): Promise<void> {
    await db.delete();
    await db.open();
  },

  async exportData(): Promise<string> {
    const dump = {
      productos: await db.productos.toArray(),
      usuarios: await db.usuarios.toArray(),
      ventas: await db.ventas.toArray(),
      ubicaciones: await db.ubicaciones.toArray(),
      visitas: await db.visitas.toArray(),
      sync_operations: await db.sync_operations.toArray(),
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(dump, null, 2);
  },

  async importData(jsonData: string): Promise<void> {
    try {
      const dump = JSON.parse(jsonData);

      if (dump.productos) await db.productos.bulkAdd(dump.productos);
      if (dump.usuarios) await db.usuarios.bulkAdd(dump.usuarios);
      if (dump.ventas) await db.ventas.bulkAdd(dump.ventas);
      if (dump.ubicaciones) await db.ubicaciones.bulkAdd(dump.ubicaciones);
      if (dump.visitas) await db.visitas.bulkAdd(dump.visitas);
      if (dump.sync_operations)
        await db.sync_operations.bulkAdd(dump.sync_operations);
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  },
};

/**
 * ==================
 * HELPERS
 * ==================
 */

/**
 * Obtener tamaño estimado de IndexedDB
 */
export async function getDBSize(): Promise<number> {
  if (!navigator.storage?.estimate) return 0;

  const estimate = await navigator.storage.estimate();
  return estimate.usage || 0;
}

/**
 * Monitorear cambios en estado online/offline
 */
export function setupOfflineDetection(
  onOnline: () => void,
  onOffline: () => void
): void {
  window.addEventListener("online", () => {
    dbOperations.updateSyncState({ is_online: true });
    onOnline();
  });

  window.addEventListener("offline", () => {
    dbOperations.updateSyncState({ is_online: false });
    onOffline();
  });
}
