import os
from django.core.wsgi import get_wsgi_application

# apunta a las configuraciones del proyecto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrotour_backend.settings')

application = get_wsgi_application()
