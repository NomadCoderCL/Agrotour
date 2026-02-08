from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from aplicacion.models import Usuario, Producto
from decimal import Decimal

@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class SyncEngineTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(username='productor_sync', password='password123', rol='productor')
        
        # Login
        response = self.client.post(reverse('login'), {'username': 'productor_sync', 'password': 'password123'}, format='json')
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Producto base
        self.producto = Producto.objects.create(
            nombre="Cereza",
            precio=Decimal("3000.00"),
            cantidad=50,
            productor=self.user
        )

    def test_sync_push_create(self):
        """Verifica que se pueden crear entidades vía sync push"""
        url = reverse('sync_push')
        data = {
            'operations': [{
                'entity_type': 'producto',
                'entity_id': 999,
                'data': {
                    'nombre': 'Manzana Sync',
                    'precio': '1500.00',
                    'cantidad': 100
                },
                'timestamp': '2026-02-07T20:00:00Z',
                'device_id': 'mobile_1'
            }]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Producto.objects.filter(nombre='Manzana Sync').exists())

    def test_sync_push_update_lww(self):
        """Verifica resolución de conflictos LWW (Móvil gana si es más reciente)"""
        url = reverse('sync_push')
        # Mandamos un timestamp futuro (móvil gana)
        data = {
            'operations': [{
                'entity_type': 'producto',
                'entity_id': self.producto.id,
                'data': {
                    'nombre': 'Cereza Premium',
                    'precio': '5000.00'
                },
                'timestamp': '2027-01-01T00:00:00Z',
                'device_id': 'mobile_1'
            }]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.nombre, 'Cereza Premium')

    def test_sync_pull(self):
        """Verifica la descarga de entidades (Pull)"""
        url = reverse('sync_pull')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('entities', response.data)
        self.assertTrue(len(response.data['entities']['productos']) > 0)
