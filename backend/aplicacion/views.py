from rest_framework import viewsets, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.http import HttpResponse
from io import BytesIO
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import matplotlib.pyplot as plt
from reportlab.pdfgen import canvas
from datetime import datetime
import logging
from .models import (
    Usuario, Producto, Venta, Visita, Anuncio, Feedback, Envio, Ubicacion, Notificacion,
    CategoriaProducto, Boleta, DetalleVenta, EventoTuristico, Actividad, Promocion,
    Cupon, FactorCarbono, FCMToken
)
from .serializers import (
    UsuarioSerializer, ProductoSerializer, ProductoMobileSerializer, VentaSerializer, VisitaSerializer, AnuncioSerializer,
    FeedbackSerializer, EnvioSerializer, UbicacionSerializer, NotificacionSerializer,
    CategoriaProductoSerializer, BoletaSerializer, DetalleVentaSerializer, ActividadSerializer,
    PromocionSerializer, EventoTuristicoSerializer
)
from .pagination import MobileCursorPagination
from .auth import MobileTokenManager
import jwt
from django.conf import settings
from rest_framework.pagination import PageNumberPagination
from rest_framework import filters
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Configurar logger
logger = logging.getLogger(__name__)

# Paginador global para listas grandes
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# ==========================
# Vistas de Autenticación
# ==========================

@swagger_auto_schema(method='post', operation_description="Registro de usuario.")
@api_view(['POST'])
@permission_classes([AllowAny])
def registro(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    rol = request.data.get('rol', 'cliente')

    if not username or not email or not password:
        return Response({'error': 'Usuario, correo y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

    if Usuario.objects.filter(username=username).exists():
        return Response({'error': 'El nombre de usuario ya existe.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        usuario = Usuario.objects.create(username=username, email=email, rol=rol)
        usuario.set_password(password)
        usuario.save()
        return Response({'mensaje': 'Usuario registrado exitosamente.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'Error al registrar el usuario: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@swagger_auto_schema(method='post', operation_description="Login de usuario optimizado para mobile.")
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    is_mobile = request.query_params.get('mobile') == 'true'

    if not username or not password:
        return Response({'error': 'Usuario y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

    usuario = Usuario.objects.filter(username=username).first()
    if usuario and usuario.check_password(password):
        if is_mobile:
            tokens = MobileTokenManager.create_tokens(usuario)
            return Response({
                **tokens,
                'user': {
                    'id': usuario.id,
                    'username': usuario.username,
                    'rol': usuario.rol
                }
            }, status=status.HTTP_200_OK)
        else:
            refresh = RefreshToken.for_user(usuario)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': usuario.id,
                    'username': usuario.username,
                    'rol': usuario.rol
                }
            }, status=status.HTTP_200_OK)

    return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

@swagger_auto_schema(method='post', operation_description="Logout seguro invalidando el token.")
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_mobile(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('Bearer '):
        return Response({'error': 'Token no encontrado.'}, status=400)
        
    token = auth_header.replace('Bearer ', '')
    try:
        # Decodificar para obtener expiración
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        TokenBlacklist.objects.create(
            token=token,
            expires_at=datetime.fromtimestamp(decoded['exp'])
        )
        return Response({'success': True, 'message': 'Sesión cerrada correctamente.'}, status=200)
    except Exception as e:
        logger.error(f"Error en logout_mobile: {str(e)}")
        # Si falla el decode, igual intentamos cerrarlo pero con un error
        return Response({'error': 'Token inválido o expirado.'}, status=400)

@swagger_auto_schema(method='post', operation_description="Validar token JWT.")
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_token(request):
    logger.info(f"Token válido para usuario: {request.user.username}")
    return Response({'message': 'Token válido'}, status=status.HTTP_200_OK)

@swagger_auto_schema(methods=['get', 'put'], operation_description="Ver y actualizar datos del usuario autenticado.")
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def ajustes_usuario(request):
    usuario = request.user

    if request.method == 'GET':
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        data = request.data
        serializer = UsuarioSerializer(usuario, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Información actualizada exitosamente.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==========================
# Vistas de Operaciones
# ==========================

@swagger_auto_schema(method='post', operation_description="Confirmar compra y registrar venta.")
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_compra(request):
    cliente = request.user
    carrito = request.data.get('carrito', [])
    codigo_cupon = request.data.get('codigo_cupon')
    
    if not carrito or not isinstance(carrito, list):
        return Response({'error': 'El carrito está vacío o tiene un formato incorrecto.'}, status=400)
    
    try:
        with transaction.atomic():
            monto_subtotal = 0
            huella_total = 0
            detalles_venta = []
            
            # 1. Procesar Carrito y Huella de Carbono
            for item in carrito:
                producto = Producto.objects.select_related('factor_carbono').filter(id=item.get('producto_id')).first()
                cantidad = item.get('cantidad')
                
                if not producto or not isinstance(cantidad, (int, float)) or cantidad <= 0:
                    return Response({'error': 'Producto o cantidad inválida.'}, status=400)
                
                if producto.cantidad < cantidad:
                    return Response({'error': f"Stock insuficiente para {producto.nombre}."}, status=400)
                
                subtotal = producto.precio * cantidad
                monto_subtotal += subtotal
                
                # Calcular Huella de Carbono si el producto tiene factor asignado
                if producto.factor_carbono:
                    from decimal import Decimal
                    huella_total += Decimal(cantidad) * producto.factor_carbono.co2_por_unidad
                
                detalles_venta.append(
                    DetalleVenta(producto=producto, cantidad=cantidad, subtotal=subtotal)
                )
            
            # 2. Manejo de Cupón
            descuento_valor = 0
            cupon_obj = None
            if codigo_cupon:
                cupon_obj = Cupon.objects.filter(codigo=codigo_cupon).first()
                if cupon_obj and cupon_obj.es_valido():
                    if cupon_obj.tipo == 'porcentaje':
                        descuento_valor = (monto_subtotal * cupon_obj.valor) / 100
                    else:
                        descuento_valor = cupon_obj.valor
                    
                    # Incrementar uso del cupón
                    cupon_obj.conteo_uso += 1
                    cupon_obj.save()
                else:
                    return Response({'error': 'Cupón inválido o expirado.'}, status=400)

            monto_final = monto_subtotal - descuento_valor
            if monto_final < 0: monto_final = 0

            # 3. Crear Venta
            venta = Venta.objects.create(
                cliente=cliente, 
                productor=detalles_venta[0].producto.productor,
                monto_total=monto_final,
                cupon_aplicado=cupon_obj,
                descuento_cupon=descuento_valor,
                huella_carbono_total=huella_total
            )
            
            for detalle in detalles_venta:
                detalle.venta = venta
                detalle.save()
                detalle.producto.cantidad -= detalle.cantidad
                detalle.producto.save()
                
        return Response({
            'mensaje': 'Compra confirmada', 
            'venta_id': venta.id, 
            'subtotal': monto_subtotal,
            'descuento': descuento_valor,
            'monto_total': monto_final,
            'huella_carbono': huella_total
        }, status=201)
        
    except Exception as e:
        logger.error(f"Error en confirmar_compra: {str(e)}")
        return Response({'error': f'Ocurrió un error inesperado: {str(e)}'}, status=500)

@swagger_auto_schema(method='get', operation_description="Catálogo público de productos disponibles.")
@api_view(['GET'])
@permission_classes([AllowAny])
def catalogo_productos(request):
    productos = Producto.objects.filter(cantidad__gt=0)
    
    # Optimización para Mobile
    if request.query_params.get('mobile') == 'true':
        serializer = ProductoMobileSerializer(productos, many=True)
    else:
        serializer = ProductoSerializer(productos, many=True)
        
    return Response(serializer.data, status=status.HTTP_200_OK)

@swagger_auto_schema(method='post', operation_description="Fetch múltiple de productos por ID.")
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def productos_batch(request):
    """Fetch eficiente de múltiples productos en una sola request"""
    ids = request.data.get('ids', [])
    if not ids or not isinstance(ids, list):
        return Response({'error': 'Se requiere una lista de IDs.'}, status=400)
    
    if len(ids) > 100:
        return Response({'error': 'Máximo 100 IDs permitidos.'}, status=400)
        
    productos = Producto.objects.filter(id__in=ids)
    serializer = ProductoMobileSerializer(productos, many=True)
    return Response({'results': serializer.data}, status=200)

@swagger_auto_schema(method='post', operation_description="Registro de token FCM para push notifications.")
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_fcm_token(request):
    token = request.data.get('token')
    device_type = request.data.get('device_type', 'Android')
    
    if not token:
        return Response({'error': 'Token es requerido.'}, status=400)
        
    fcm_token, created = FCMToken.objects.get_or_create(
        usuario=request.user,
        token=token,
        defaults={'device_type': device_type}
    )
    
    if not created:
        fcm_token.device_type = device_type
        fcm_token.is_active = True
        fcm_token.save()
        
    return Response({'success': True, 'message': 'Token registrado correctamente.'}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_ventas(request):
    productor = request.user
    if productor.rol != 'productor':
        return Response({'error': 'Solo los productores pueden acceder a las estadísticas.'}, status=403)

    ventas = Venta.objects.filter(productor=productor)
    total_ventas = ventas.count()
    total_monto = sum(venta.monto_total for venta in ventas)

    return Response({'total_ventas': total_ventas, 'total_monto': total_monto}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_visitas(request):
    productor = request.user
    if productor.rol != 'productor':
        return Response({'error': 'Solo los productores pueden acceder a las estadísticas.'}, status=403)

    visitas = Visita.objects.filter(productor=productor)
    total_visitas = visitas.count()

    return Response({'total_visitas': total_visitas}, status=200)

@api_view(['GET'])
def ubicaciones_productores(request):
    ubicaciones = Ubicacion.objects.all()
    serializer = UbicacionSerializer(ubicaciones, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
    })

# ==========================
# ViewSets
# ==========================

class ProductoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'categoria__nombre']
    ordering_fields = ['nombre', 'precio', 'cantidad']
    ordering = ['nombre']

    def get_serializer_class(self):
        if self.request.query_params.get('mobile') == 'true':
            return ProductoMobileSerializer
        return ProductoSerializer

    def get_pagination_class(self):
        if self.request.query_params.get('mobile') == 'true':
            return MobileCursorPagination
        return StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        if user.rol == 'productor':
            return Producto.objects.filter(productor=user)
        elif user.rol == 'cliente':
            return Producto.objects.filter(cantidad__gt=0)
        return Producto.objects.none()

class VentaViewSet(viewsets.ModelViewSet):
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha_venta', 'monto_total']
    ordering = ['-fecha_venta']
    def get_queryset(self):
        user = self.request.user
        if user.rol == 'productor':
            return Venta.objects.filter(productor=user)
        elif user.rol == 'cliente':
            return Venta.objects.filter(cliente=user)
        return Venta.objects.none()

class VisitaViewSet(viewsets.ModelViewSet):
    serializer_class = VisitaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha_visita', 'estado']
    ordering = ['-fecha_visita']
    def get_queryset(self):
        user = self.request.user
        if user.rol == 'productor':
            return Visita.objects.filter(productor=user)
        elif user.rol == 'cliente':
            return Visita.objects.filter(cliente=user)
        return Visita.objects.none()

class AnuncioViewSet(viewsets.ModelViewSet):
    serializer_class = AnuncioSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        # Anuncios might be public or internal, assuming 'read' for all auth users, 'write' for admin?
        # For now, let's keep it visible to all auth users, but maybe restrict creation?
        return Anuncio.objects.all()

class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.rol == 'admin':
            return Feedback.objects.all()
        return Feedback.objects.filter(usuario=user)

class EnvioViewSet(viewsets.ModelViewSet):
    serializer_class = EnvioSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.rol == 'productor':
            # Assuming envios are related to ventas/productor logic, 
            # effectively logic usually links Envio -> Venta -> Productor
            # This is complex without direct 'productor' field, but let's check model.
            # If Envio has 'venta', and Venta has 'productor'.
            return Envio.objects.filter(venta__productor=user)
        elif user.rol == 'cliente':
            return Envio.objects.filter(venta__cliente=user)
        return Envio.objects.none()

class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAuthenticated]
    # Ubicaciones might be public for maps?

class NotificacionViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Notificacion.objects.filter(usuario=self.request.user)

class CategoriaProductoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaProducto.objects.all()
    serializer_class = CategoriaProductoSerializer
    permission_classes = [IsAuthenticated]

class BoletaViewSet(viewsets.ModelViewSet):
    serializer_class = BoletaSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.rol == 'productor':
            return Boleta.objects.filter(venta__productor=user)
        elif user.rol == 'cliente':
            return Boleta.objects.filter(venta__cliente=user)
        return Boleta.objects.none()

class PromocionViewSet(viewsets.ModelViewSet):
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer
    permission_classes = [IsAuthenticated]

class EventoTuristicoViewSet(viewsets.ModelViewSet):
    serializer_class = EventoTuristicoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'descripcion']
    ordering_fields = ['fecha_evento', 'precio_entrada']
    ordering = ['fecha_evento']
    def get_queryset(self):
        user = self.request.user
        if user.rol == 'productor':
            return EventoTuristico.objects.filter(productor=user)
        elif user.rol == 'cliente':
            return EventoTuristico.objects.all()
        return EventoTuristico.objects.none()
    
class ProducerViewSet(ModelViewSet):
    queryset = Usuario.objects.filter(rol='productor')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.rol == 'admin':
            return Actividad.objects.all()
        return Actividad.objects.filter(usuario=user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def descargar_estadisticas_pdf(request):
    productor = request.user
    if productor.rol != 'productor':
        return Response({'error': 'Solo los productores pueden acceder a las estadísticas.'}, status=403)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    pdf.setTitle("Estadísticas de Productor")
    pdf.drawString(100, 800, "Estadísticas de Ventas y Visitas Guiadas")
    pdf.drawString(100, 780, f"Generado el: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Ventas
    ventas = Venta.objects.filter(productor=productor)
    total_ventas = ventas.count()
    total_monto = sum(venta.monto_total for venta in ventas)
    pdf.drawString(100, 760, f"Total Ventas: {total_ventas}")
    pdf.drawString(100, 740, f"Monto Total: ${total_monto:.2f}")

    # Visitas
    visitas = Visita.objects.filter(productor=productor)
    total_visitas = visitas.count()
    visitas_por_estado = {
        'Pendiente': visitas.filter(estado='pendiente').count(),
        'Confirmada': visitas.filter(estado='confirmada').count(),
        'Cancelada': visitas.filter(estado='cancelada').count(),
    }
    pdf.drawString(100, 720, f"Total Visitas: {total_visitas}")
    pdf.drawString(100, 700, f"Pendientes: {visitas_por_estado['Pendiente']}")
    pdf.drawString(100, 680, f"Confirmadas: {visitas_por_estado['Confirmada']}")
    pdf.drawString(100, 660, f"Canceladas: {visitas_por_estado['Cancelada']}")

    pdf.save()
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="estadisticas.pdf"'
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_boleta(request, pk):
    try:
        boleta = Boleta.objects.get(pk=pk)
        # Security check: only allow if user is related to venta
        user = request.user
        if user.rol == 'productor' and boleta.venta.productor != user:
             return Response({'error': 'No autorizado'}, status=403)
        if user.rol == 'cliente' and boleta.venta.cliente != user:
             return Response({'error': 'No autorizado'}, status=403)
             
        serializer = BoletaSerializer(boleta)
        return Response(serializer.data, status=200)
    except Boleta.DoesNotExist:
        return Response({'error': 'Boleta no encontrada'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def descargar_boleta_pdf(request, pk):
    try:
        boleta = Boleta.objects.get(pk=pk)
        venta = boleta.venta
        user = request.user

        # Security Check
        if user.rol == 'productor' and venta.productor != user:
             return Response({'error': 'No autorizado'}, status=403)
        if user.rol == 'cliente' and venta.cliente != user:
             return Response({'error': 'No autorizado'}, status=403)

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer)
        pdf.setTitle(f"Boleta-{boleta.numero_boleta}")
        
        # Header
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(100, 800, "AGROTOUR - Comprobante de Venta")
        
        pdf.setFont("Helvetica", 12)
        pdf.drawString(100, 770, f"N° Boleta: {boleta.numero_boleta}")
        pdf.drawString(100, 750, f"Fecha: {boleta.fecha_emision.strftime('%d/%m/%Y %H:%M')}")
        
        pdf.drawString(100, 720, f"Cliente: {venta.cliente.username}")
        pdf.drawString(100, 700, f"Productor: {venta.productor.username}")
        
        # Detalle
        y = 660
        pdf.drawString(100, y, "Detalle de Productos:")
        y -= 20
        detalles = DetalleVenta.objects.filter(venta=venta)
        
        for det in detalles:
            line = f"- {det.producto.nombre} (x{det.cantidad}) : ${det.subtotal:.2f}"
            pdf.drawString(120, y, line)
            y -= 20
            
        # Totales
        y -= 20
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(100, y, f"Total Pagado: ${venta.monto_total:.2f}")
        
        pdf.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="boleta_{boleta.numero_boleta}.pdf"'
        return response

    except Boleta.DoesNotExist:
        return Response({'error': 'Boleta no encontrada'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check_live(request):
    """Liveness check for basic service responsiveness."""
    return Response({'status': 'live', 'timestamp': datetime.now()}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check_ready(request):
    """Readiness check for database and core service availability."""
    from django.db import connections
    from django.db.utils import OperationalError
    db_conn = connections['default']
    try:
        db_conn.cursor()
    except OperationalError:
        return Response({'status': 'unready', 'reason': 'database_unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    return Response({'status': 'ready', 'timestamp': datetime.now()}, status=status.HTTP_200_OK)