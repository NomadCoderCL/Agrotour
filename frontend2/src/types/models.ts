/**
 * TypeScript Types - Espejo de modelos Django Backend
 * Utilizados para Sync Engine y componentes
 */

// ===========================
// AUTH & USUARIO
// ===========================

export enum UserRole {
  CLIENTE = "cliente",
  PRODUCTOR = "productor",
  ADMIN = "admin",
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: UserRole;
  direccion?: string;
  telefono?: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: Usuario;
}

export interface TokenPayload {
  access: string;
  refresh: string;
}

// ===========================
// PRODUCTOS
// ===========================

export type MetodoVenta = "unidad" | "kilo";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  categoria_id?: number;
  productor_id: number;
  metodo_venta: MetodoVenta;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  productor_id: number;
}

// ===========================
// VENTAS & BOLETAS
// ===========================

export interface DetalleVenta {
  id: number;
  producto_id: number;
  cantidad: number;
  subtotal: number;
  producto?: Producto;
}

export interface Venta {
  id: number;
  cliente_id: number;
  productor_id: number;
  fecha_venta: string;
  monto_total: number;
  detalles?: DetalleVenta[];
}

export interface Boleta {
  id: number;
  venta_id: number;
  numero_boleta: string;
  fecha_emision: string;
  monto_total: number;
  impuestos: number;
}

// ===========================
// UBICACIÓN & GEOLOCALIZACIÓN
// ===========================

export interface Ubicacion {
  id: number;
  productor_id: number;
  latitud: number;
  longitud: number;
  direccion: string;
}

// ===========================
// VISITAS GUIADAS
// ===========================

export type EstadoVisita = "pendiente" | "confirmada" | "cancelada";

export interface Visita {
  id: number;
  productor_id: number;
  cliente_id: number;
  fecha_visita: string;
  estado: EstadoVisita;
}

// ===========================
// SYNC ENGINE
// ===========================

export type OperationType = "CREATE" | "UPDATE" | "DELETE";
export type EntityType = "Producto" | "Venta" | "Stock" | "Visita" | "Ubicacion";

export interface SyncOperation {
  operation_id: string; // UUID
  operation_type: OperationType;
  entity_type: EntityType;
  entity_id: string; // UUID o ID del recurso
  data: Record<string, any>;
  lamport_ts: number;
  version: number;
  device_id: string; // web_1, mobile_2, desktop_1
  timestamp?: string; // ISO 8601
  content_hash?: string; // SHA-256 para idempotencia
}

export interface SyncPushPayload {
  operations: SyncOperation[];
  tenant_id?: string; // Multi-tenancy (si aplica)
}

export interface SyncPushResponse {
  accepted: SyncOperation[];
  rejected: SyncConflictResponse[];
  new_lamport_ts: number;
  conflicts_detected: number;
}

export interface SyncConflictResponse {
  operation_id: string;
  conflict_id: string; // Para resolución manual
  conflicting_operation_id: string;
  conflict_type: "CONCURRENT_MODIFICATION" | "BUSINESS_RULE_VIOLATION";
  resolution_level: "HARDCODED" | "HEURISTIC" | "MANUAL";
  message: string;
}

export interface SyncConflict {
  id: string;
  operation_id: string;
  conflicting_operation_id: string;
  conflict_type: string;
  resolution_level: string;
  resolved: boolean;
  resolution_choice?: "LOCAL" | "REMOTE" | "MERGED";
  created_at: string;
}

export interface SyncPullPayload {
  since_lamport_ts?: number;
  entity_types?: EntityType[];
  limit?: number;
}

export interface SyncPullResponse {
  operations: SyncOperation[];
  max_lamport_ts: number;
  has_more: boolean;
}

// ===========================
// PAGOS OFFLINE
// ===========================

export type PaymentStatus = "PENDING" | "PAID" | "RECONCILED";

export interface PendingPayment {
  id: string; // UUID
  venta_id: number;
  monto: number;
  metodo: "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";
  status: PaymentStatus;
  device_id: string;
  created_at: string;
  reconciled_at?: string;
}

// ===========================
// FEEDBACK & REVIEWS
// ===========================

export interface Feedback {
  id: number;
  cliente_id: number;
  productor_id: number;
  comentario: string;
  calificacion: number; // 1-5
  fecha_creacion: string;
}

// ===========================
// NOTIFICACIONES
// ===========================

export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: string;
  mensaje: string;
  leido: boolean;
  fecha_creacion: string;
}

// ===========================
// CARRITO (Local)
// ===========================

export interface CartItem {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  monto_total: number;
  cantidad_items: number;
}

// ===========================
// SYNC STATE (Local)
// ===========================

export interface SyncState {
  last_sync: string; // ISO 8601
  last_lamport_ts: number;
  device_id: string;
  pending_operations: SyncOperation[];
  conflicts: SyncConflict[];
  is_online: boolean;
  sync_in_progress: boolean;
}
