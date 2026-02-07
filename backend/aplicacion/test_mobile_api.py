from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from aplicacion.models import Usuario, Producto, CategoriaProducto, FactorCarbono, FCMToken
from decimal import Decimal

class MobileAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(username='testmobile', password='password123', rol='cliente')
        self.productor = Usuario.objects.create_user(username='productor1', password='password123', rol='productor')
        
        # Obtener tokens
        response = self.client.post(reverse('login'), {'username': 'testmobile', 'password': 'password123'}, format='json')
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Datos de prueba
        self.cat = CategoriaProducto.objects.create(nombre="Frutas", productor=self.productor)
        self.prod = Producto.objects.create(
            nombre="Manzana Mobile",
            descripcion="Descripción larga que debería ser recortada en móvil",
            precio=Decimal("10.50"),
            cantidad=100,
            categoria=self.cat,
            productor=self.productor
        )

    def test_optimized_mobile_payload(self):
        """Verifica que el catálogo mobile devuelve menos campos"""
        url = reverse('catalogo_productos') + "?mobile=true"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Debería tener los campos esenciales
        self.assertIn('nombre', response.data[0])
        self.assertIn('precio', response.data[0])
        # NO debería tener descripción larga si se optimizó (según mi ProductoMobileSerializer)
        self.assertNotIn('descripcion', response.data[0])

    def test_productos_batch_endpoint(self):
        """Verifica el fetch múltiple por IDs"""
        url = reverse('productos_batch')
        response = self.client.post(url, {'ids': [self.prod.id]}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['nombre'], "Manzana Mobile")

    def test_fcm_token_registration(self):
        """Verifica el registro de tokens para notificaciones"""
        url = reverse('register_fcm_token')
        data = {'token': 'fcm_test_token_123', 'device_type': 'Android'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(FCMToken.objects.filter(token='fcm_test_token_123').exists())

    def test_mobile_login_metadata(self):
        """Verifica que el login con ?mobile=true devuelve metadata de refresh"""
        url = reverse('login') + "?mobile=true"
        response = self.client.post(url, {'username': 'testmobile', 'password': 'password123'}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('expires_in', response.data)
        self.assertIn('should_refresh_in', response.data)
