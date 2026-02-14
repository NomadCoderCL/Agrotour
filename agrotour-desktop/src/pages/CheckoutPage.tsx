/**
 * CheckoutPage - Flujo de checkout para completar compra
 * Integración con CartContext y SyncClient
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, syncClient } from '@/services';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import getLogger from '@/lib/logger';

const logger = getLogger('CheckoutPage');

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  notes?: string;
}

interface OrderMetadata {
  shippingInfo: ShippingInfo;
  paymentMethod: 'cash' | 'card' | 'transfer';
  total: number;
  items_count: number;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { carro, vaciarCarro } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.username || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');

  // Calculate total
  const total = carro.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const itemsCount = carro.reduce((sum, item) => sum + item.cantidad, 0);

  // Validate checkout
  const isFormValid =
    shippingInfo.fullName &&
    shippingInfo.phone &&
    shippingInfo.address &&
    shippingInfo.city &&
    shippingInfo.zipCode &&
    carro.length > 0;

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    if (!isFormValid) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!user) {
      setError('Debes iniciar sesión para continuar');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order payload
      const orderPayload = {
        cliente_id: user.id,
        shipping_info: shippingInfo,
        payment_method: paymentMethod,
        items: carro.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
        })),
        total,
      };

      logger.info('Submitting order', orderPayload);

      // 2. Try to POST order to backend
      // 2. Try to POST order to backend
      const orderData = await apiClient.confirmarCompra(orderPayload);
      logger.info('Order created successfully', orderData);

      // 3. Enqueue sync operation for local record
      const metadata: OrderMetadata = {
        shippingInfo,
        paymentMethod,
        total,
        items_count: itemsCount,
      };

      const syncOp = syncClient.createOperation(
        'CREATE',
        'Venta',
        String(orderData.venta_id || Date.now()),
        metadata as any
      );
      await syncClient.enqueueOperation(syncOp);

      // 4. Clear cart after successful checkout
      await vaciarCarro();

      // 5. Show success message
      setSuccess(true);
      setTimeout(() => {
        navigate('/cliente-panel/historial-compras', {
          state: { message: 'Compra realizada exitosamente!' }
        });
      }, 2000);
    } catch (err) {
      logger.error('Checkout error', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la compra. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no cart
  if (carro.length === 0 && !success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <button
            onClick={() => navigate('/paginaexploraproducto')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Explorar Productos
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">¡Compra Exitosa!</h2>
          <p className="text-gray-600 mb-4">Tu pedido ha sido registrado. Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Shipping & Payment Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Shipping Section */}
          <section className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">📦 Información de Envío</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={shippingInfo.fullName}
                  onChange={(e) => handleShippingChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => handleShippingChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input
                  type="text"
                  value={shippingInfo.address}
                  onChange={(e) => handleShippingChange('address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => handleShippingChange('city', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
                <textarea
                  value={shippingInfo.notes}
                  onChange={(e) => handleShippingChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">💳 Método de Pago</h2>
            <div className="space-y-3">
              {['cash', 'card', 'transfer'].map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="capitalize">
                    {method === 'cash' && 'Efectivo'}
                    {method === 'card' && 'Tarjeta de Crédito (próximamente)'}
                    {method === 'transfer' && 'Transferencia Bancaria (próximamente)'}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <aside className="md:col-span-1">
          <div className="border rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {carro.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.nombre}</p>
                    <p className="text-gray-500">Cantidad: {item.cantidad}</p>
                  </div>
                  <p className="font-medium">${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({itemsCount} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="text-lg font-bold flex justify-between pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!isFormValid || loading}
              className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Procesando...
                </>
              ) : (
                '✓ Confirmar Compra'
              )}
            </button>

            <button
              onClick={() => navigate('/paginaexploraproducto')}
              className="w-full mt-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Continuar Comprando
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
