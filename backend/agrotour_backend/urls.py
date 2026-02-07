from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),              # URL para el panel de administración
    path('api/v1/', include('aplicacion.urls')),  # Versión 1 de la API (Recomendado para Mobile)
    path('', include('aplicacion.urls')),         # Rutas legacy sin prefijo
]
