from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from aplicacion.models import Usuario, Producto, CategoriaProducto, Venta, DetalleVenta
from decimal import Decimal
from unittest.mock import patch

@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class PaymentAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cliente = Usuario.objects.create_user(username='cliente1', password='password123', rol='cliente')
        self.productor = Usuario.objects.create_user(username='productor1', password='password123', rol='productor')
        
        # Login
        response = self.client.post(reverse('login'), {'username': 'cliente1', 'password': 'password123'}, format='json')
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Crear Venta de prueba
        self.cat = CategoriaProducto.objects.create(nombre="Verduras", productor=self.productor)
        self.prod = Producto.objects.create(
            nombre="Tomate",
            precio=Decimal("2000.00"),
            cantidad=10,
            categoria=self.cat,
            productor=self.productor
        )
        self.venta = Venta.objects.create(
            cliente=self.cliente,
            productor=self.productor,
            monto_total=Decimal("2000.00")
        )
        DetalleVenta.objects.create(venta=self.venta, producto=self.prod, cantidad=1, subtotal=Decimal("2000.00"))

    @patch('config.stripe.StripeManager.create_payment_intent')
    def test_create_payment_intent(self, mock_create):
        """Verifica la creación de un PaymentIntent y el cálculo de comisiones"""
        # Mock de Stripe Intent
        class MockIntent:
            id = "pi_test_123"
            client_secret = "secret_123"
        
        mock_create.return_value = MockIntent()

        url = reverse('create_payment_intent')
        data = {'venta_id': self.venta.id}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('client_secret', response.data)
        
        # Verificar base de datos (Splits 85/15)
        self.venta.refresh_from_db()
        self.assertEqual(self.venta.stripe_payment_intent_id, "pi_test_123")
        self.assertEqual(self.venta.monto_comision, Decimal("300.00")) # 15% de 2000
        self.assertEqual(self.venta.monto_neto_productor, Decimal("1700.00")) # 85% de 2000

    @patch('config.stripe.StripeManager.verify_webhook_signature')
    def test_stripe_webhook_success(self, mock_verify):
        """Verifica que el webhook marque la venta como pagada"""
        # Preparar la venta con el ID del intent
        self.venta.stripe_payment_intent_id = "pi_webhook_success"
        self.venta.save()

        # Mock del evento de Stripe
        mock_verify.return_value = {
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'id': 'pi_webhook_success'
                }
            }
        }

        url = reverse('stripe_webhook')
        # Payload y firma dummy
        response = self.client.post(url, data={}, format='json', HTTP_STRIPE_SIGNATURE='dummy_sig')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar cambio de estado
        self.venta.refresh_from_db()
        self.assertEqual(self.venta.estado_pago, 'pagado')
