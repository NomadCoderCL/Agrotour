from django.test import TestCase
from django.urls import reverse

class LandingPageTestCase(TestCase):
    def test_landing_page_status_code(self):
        """Verifica que la landing page carga correctamente (200 OK)"""
        url = reverse('landing')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_landing_page_template_used(self):
        """Verifica que se usa el template correcto"""
        url = reverse('landing')
        response = self.client.get(url)
        self.assertTemplateUsed(response, 'landing.html')
