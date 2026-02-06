import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import aplicacion.routing

# apunta a las configuraciones del proyecto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrotour_backend.settings.local')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            aplicacion.routing.websocket_urlpatterns
        )
    ),
})
