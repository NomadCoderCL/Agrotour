from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from aplicacion.models import Usuario

class OnboardingTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            username='productor_test', 
            password='password123', 
            rol='productor'
        )
        # Login
        response = self.client.post(reverse('login'), {'username': 'productor_test', 'password': 'password123'}, format='json')
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_update_producer_profile(self):
        """Verifica que un productor puede actualizar sus nuevos campos de perfil"""
        url = reverse('ajustes_usuario')
        data = {
            'direccion': 'Calle Falsa 123',
            'telefono': '+56912345678',
            'bio': 'Productor de tomates orgánicos en el valle del Elqui.',
            'whatsapp': '+56987654321',
            'sitio_web': 'https://tomateselqui.cl'
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar en base de datos
        self.user.refresh_from_db()
        self.assertEqual(self.user.bio, data['bio'])
        self.assertEqual(self.user.whatsapp, data['whatsapp'])
        self.assertEqual(self.user.sitio_web, data['sitio_web'])

    def test_serializer_contains_new_fields(self):
        """Verifica que el GET de ajustes-usuario incluye los nuevos campos"""
        url = reverse('ajustes_usuario')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('bio', response.data)
        self.assertIn('whatsapp', response.data)
        self.assertIn('sitio_web', response.data)
