/**
 * Shared TypeScript Types - Mobile & Web
 * Mirror de modelos Django Backend
 */

// ===== AUTH & USUARIO =====
export enum UserRole {
  CLIENTE = 'cliente',
  PRODUCTOR = 'productor',
  ADMIN = 'admin',
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

// ===== PRODUCTOS =====
export type MetodoVenta = 'unidad' | 'kilo';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  categoria_id?: number;
  productor_id: number;
  metodo_venta: MetodoVenta;
  imagen_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  productor_id: number;
}

// ===== CARRITO & VENTAS =====
export interface CartItem {
  producto_id: number;
  cantidad: number;
  product?: Producto;
  subtotal?: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  currency: 'CLP';
  lastUpdated?: string;
}

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
  estado?: 'pendiente' | 'confirmada' | 'entregada';
}

// ===== UBICACIÓN & PRODUCTOR =====
export interface Ubicacion {
  id: number;
  productor_id: number;
  latitud: number;
  longitud: number;
  direccion: string;
  nombre?: string;
  horario?: string;
}

export interface Productor {
  id: number;
  usuario_id: number;
  nombre?: string;
  descripcion?: string;
  ubicaciones?: Ubicacion[];
}

// ===== VISITAS GUIADAS =====
export type EstadoVisita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Visita {
  id: number;
  productor_id: number;
  cliente_id: number;
  fecha_visita: string;
  hora?: string;
  estado: EstadoVisita;
  capacidad_maxima?: number;
  participantes?: number;
  descripcion?: string;
}

// ===== SYNC ENGINE =====
export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type EntityType = 'Producto' | 'Venta' | 'Stock' | 'Visita' | 'Ubicacion' | 'Cart';

export interface SyncOperation {
  operation_id: string; // UUID
  operation_type: OperationType;
  entity_type: EntityType;
  entity_id: string;
  data: Record<string, any>;
  lamport_ts: number;
  version: number;
  device_id: string; // web_1, mobile_2
  timestamp?: string; // ISO 8601
  content_hash?: string; // SHA-256
}

export interface SyncPushPayload {
  operations: SyncOperation[];
  device_id: string;
  client_version: string;
  tenant_id?: string;
}

export interface SyncPushResponse {
  accepted: SyncOperation[];
  rejected: Array<{
    operation_id: string;
    reason: string;
    suggested_resolution?: SyncOperation; // Servidor propone resolución
  }>;
  new_lamport_ts: number;
  new_version: number;
  conflicts_detected: number;
}

export interface SyncPullPayload {
  since_lamport_ts: number;
  since_version: number;
  limit?: number;
  tenant_id?: string;
}

export interface SyncPullResponse {
  operations: SyncOperation[];
  new_lamport_ts: number;
  new_version: number;
  more_available: boolean;
  server_timestamp: string;
}

// ===== SYNC CONFLICT RESOLUTION =====
export interface SyncConflict {
  operation_id: string;
  entity_type: EntityType;
  entity_id: string;
  local_version: SyncOperation;
  server_version: SyncOperation;
  resolution_strategy: 'LWW' | 'MANUAL' | 'MERGE';
  resolved_at?: string;
}

// ===== PUSH NOTIFICATIONS =====
export interface FCMToken {
  token: string;
  device_type: 'iOS' | 'Android';
  registered_at: string;
}

export interface PushNotification {
  id: string;
  type: 'order_update' | 'new_product' | 'visit_reminder' | 'promo';
  title: string;
  body: string;
  data?: Record<string, any>;
  sentAt?: string;
}

// ===== PAGINATION =====
export interface PaginatedResponse<T> {
  count: number;
  next?: string; // cursor URL
  previous?: string; // cursor URL
  results: T[];
}

// ===== ERROR HANDLING =====
export interface APIError {
  status: number;
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export class APIException extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIException';
  }
}

// ===== STATE MANAGEMENT =====
export interface AuthState {
  user: Usuario | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CartState extends Cart {
  isLoading: boolean;
  error: string | null;
}

export interface SyncState {
  isOperations: SyncOperation[];
  isLoading: boolean;
  lastSync?: string;
  pendingOps: number;
  conflicts: SyncConflict[];
}
