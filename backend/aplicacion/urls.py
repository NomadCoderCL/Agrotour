from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    registro,
    login,
    validate_token,
    ajustes_usuario,
    confirmar_compra,
    catalogo_productos,
    ProductoViewSet,
    VentaViewSet,
    VisitaViewSet,
    AnuncioViewSet,
    FeedbackViewSet,
    EnvioViewSet,
    UbicacionViewSet,
    NotificacionViewSet,
    CategoriaProductoViewSet,
    BoletaViewSet,
    PromocionViewSet,
    EventoTuristicoViewSet,
    ActividadViewSet,
    estadisticas_ventas,
    estadisticas_visitas,
    descargar_estadisticas_pdf,
    ubicaciones_productores,
    ProducerViewSet,
    user_info,
    health_check_live,
    health_check_ready,
    obtener_boleta,
    descargar_boleta_pdf,
    productos_batch,
    register_fcm_token,
    logout_mobile,
)
from .views_landing import landing_page, privacy_policy, terms_service
from .views_sync import sync_push_view, sync_pull_view
from .views_payments import create_payment_intent_view, stripe_webhook_view
from .views_images import ImageUploadView
from .views_auth import GoogleLogin, FacebookLogin

# Router para los ViewSets
router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'ventas', VentaViewSet, basename='venta')
router.register(r'visitas', VisitaViewSet, basename='visita')
router.register(r'anuncios', AnuncioViewSet, basename='anuncio')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'envios', EnvioViewSet, basename='envio')
router.register(r'ubicaciones', UbicacionViewSet, basename='ubicacion')
router.register(r'notificaciones', NotificacionViewSet, basename='notificacion')
router.register(r'categorias', CategoriaProductoViewSet, basename='categoria')
router.register(r'boletas', BoletaViewSet, basename='boleta')
router.register(r'promociones', PromocionViewSet, basename='promocion')
router.register(r'eventos-turisticos', EventoTuristicoViewSet, basename='evento_turistico')
router.register(r'actividades', ActividadViewSet, basename='actividad')
router.register(r'producers', ProducerViewSet, basename='producer')

# API root para mostrar las rutas principales
@api_view(['GET'])
def api_root(request):
    return Response({
        'auth/registro/': 'Registrar un nuevo usuario',
        'auth/login/': 'Iniciar sesión y obtener tokens',
        'auth/validate-token/': 'Validar el token de autenticación',
        'auth/token/': 'Obtener tokens de acceso y refresco',
        'auth/token/refresh/': 'Refrescar el token de acceso',
        'auth/token/verify/': 'Verificar un token',
        'auth/ajustes-usuario/': 'Ver o actualizar ajustes de usuario',
        'api/confirmar-compra/': 'Procesar carrito de compras y registrar ventas',
        'api/catalogo/': 'Ver catálogo público de productos',
        'api/productos/': 'CRUD de productos',
        'api/categorias/': 'CRUD de categorías',
        'api/ventas/': 'CRUD de ventas',
        'api/visitas/': 'CRUD de visitas guiadas',
        'api/anuncios/': 'CRUD de anuncios',
        'api/feedback/': 'CRUD de feedback',
        'api/envios/': 'CRUD de envíos',
        'api/ubicaciones/': 'CRUD de ubicaciones',
        'api/notificaciones/': 'CRUD de notificaciones',
        'api/boletas/': 'CRUD de boletas',
        'api/promociones/': 'CRUD de promociones',
        'api/eventos-turisticos/': 'CRUD de eventos turísticos',
        'api/actividades/': 'CRUD de actividades',
    })

# URLs principales
urlpatterns = [
    path('', landing_page, name='landing'),
    path('privacy/', privacy_policy, name='privacy_policy'),
    path('terms/', terms_service, name='terms_service'),
    path('api-root/', api_root, name='api_root'),
    path('auth/registro/', registro, name='registro'),
    path('auth/login/', login, name='login'),
    path('auth/validate-token/', validate_token, name='validate_token'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/ajustes-usuario/', ajustes_usuario, name='ajustes_usuario'),
    path('api/confirmar-compra/', confirmar_compra, name='confirmar_compra'),
    path('api/catalogo/', catalogo_productos, name='catalogo_productos'),
    path('estadisticas/ventas/', estadisticas_ventas, name='estadisticas_ventas'),
    path('estadisticas/visitas/', estadisticas_visitas, name='estadisticas_visitas'),
    path('estadisticas/descargar-pdf/', descargar_estadisticas_pdf, name='descargar_estadisticas_pdf'),
    path('api/ubicaciones-productores/', ubicaciones_productores, name='ubicaciones_productores'),
    path('auth/userinfo/', user_info, name='userinfo'),
    path('auth/fcm-token/', register_fcm_token, name='register_fcm_token'),
    path('auth/logout-mobile/', logout_mobile, name='logout_mobile'),
    path('api/productos/batch/', productos_batch, name='productos_batch'),
    
    # Stripe Payments
    path('api/payments/create-intent/', create_payment_intent_view, name='create_payment_intent'),
    path('api/payments/webhook/', stripe_webhook_view, name='stripe_webhook'),
    
    # Mobile Sync Engine
    path('api/sync/push/', sync_push_view, name='sync_push'),
    path('api/sync/pull/', sync_pull_view, name='sync_pull'),

    path('api/', include(router.urls)),
    
    # Auth Endpoints
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('auth/facebook/', FacebookLogin.as_view(), name='facebook_login'),

    # Health checks
    path('boleta/<int:pk>/', obtener_boleta, name='obtener_boleta'),
    path('boleta/<int:pk>/pdf/', descargar_boleta_pdf, name='descargar_boleta_pdf'),
    path('api/upload-image/', ImageUploadView.as_view(), name='image_upload'),
    path('health/live/', health_check_live, name='health_check_live'),
    path('health/ready/', health_check_ready, name='health_check_ready'),
]
