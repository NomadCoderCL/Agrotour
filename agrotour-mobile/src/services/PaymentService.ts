import { api } from '../shared/api';

interface PaymentIntentPayload {
  venta_id: number;
}

interface PaymentIntentResponse {
  client_secret: string;
}

class PaymentService {
  /**
   * POST request - Crea una intención de pago para Stripe
   */
  async createPaymentIntent(payload: PaymentIntentPayload): Promise<PaymentIntentResponse> {
    return api.post<PaymentIntentResponse>('/api/payments/create-intent/', payload);
  }
}

export const paymentService = new PaymentService();
