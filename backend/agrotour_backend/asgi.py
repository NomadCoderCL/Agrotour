import os
from django.core.asgi import get_asgi_application

# apunta a las configuraciones del proyecto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrotour_backend.settings')

application = get_asgi_application()
