import { api } from '../shared/api';
import { ENDPOINTS } from '../shared/config';

export interface OrderPayload {
  // Aquí se definirían las propiedades de la orden
  // Por ejemplo:
  // cart: CartItem[];
  // total: number;
  [key: string]: any;
}

class OrderService {
  /**
   * POST request - Crear Orden
   */
  async createOrder<T = any>(data: OrderPayload): Promise<T> {
    // El manejo de errores ya está en el interceptor de apiClient,
    // pero aquí se podría agregar lógica específica si fuera necesario.
    return api.post<T>(ENDPOINTS.CART.CREATE_ORDER, data);
  }
}

export const orderService = new OrderService();
