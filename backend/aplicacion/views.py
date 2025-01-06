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
    CategoriaProducto, Boleta, DetalleVenta, EventoTuristico, Actividad, Promocion
)
from .serializers import (
    UsuarioSerializer, ProductoSerializer, VentaSerializer, VisitaSerializer, AnuncioSerializer,
    FeedbackSerializer, EnvioSerializer, UbicacionSerializer, NotificacionSerializer,
    CategoriaProductoSerializer, BoletaSerializer, DetalleVentaSerializer, ActividadSerializer,
    PromocionSerializer, EventoTuristicoSerializer
)

# Configurar logger
logger = logging.getLogger(__name__)

# ==========================
# Vistas de Autenticación
# ==========================

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

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Usuario y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

    usuario = Usuario.objects.filter(username=username).first()
    if usuario and usuario.check_password(password):
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_token(request):
    logger.info(f"Token válido para usuario: {request.user.username}")
    return Response({'message': 'Token válido'}, status=status.HTTP_200_OK)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_compra(request):
    cliente = request.user
    carrito = request.data.get('carrito', [])

    if not carrito or not isinstance(carrito, list):
        return Response({'error': 'El carrito está vacío o tiene un formato incorrecto.'}, status=400)

    try:
        with transaction.atomic():
            monto_total = 0
            detalles_venta = []

            for item in carrito:
                producto = Producto.objects.get(id=item['producto_id'])
                cantidad = item['cantidad']

                #if producto.cantidad < cantidad:
                #    return Response({'error': f"Stock insuficiente para {producto.nombre}."}, status=400)

                subtotal = producto.precio * cantidad
                monto_total += subtotal

                detalles_venta.append(
                    DetalleVenta(producto=producto, cantidad=cantidad, subtotal=subtotal)
                )

            venta = Venta.objects.create(cliente=cliente, monto_total=monto_total, productor=detalles_venta[0].producto.productor)

            for detalle in detalles_venta:
                detalle.venta = venta
                detalle.save()
                detalle.producto.cantidad -= detalle.cantidad
                detalle.producto.save()

        return Response({'mensaje': 'Compra confirmada', 'venta_id': venta.id, 'monto_total': monto_total}, status=201)

    except Exception as e:
        return Response({'error': f'Ocurrió un error inesperado: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def catalogo_productos(request):
    productos = Producto.objects.filter(cantidad__gt=0)
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

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
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]

class VisitaViewSet(viewsets.ModelViewSet):
    queryset = Visita.objects.all()
    serializer_class = VisitaSerializer
    permission_classes = [IsAuthenticated]

class AnuncioViewSet(viewsets.ModelViewSet):
    queryset = Anuncio.objects.all()
    serializer_class = AnuncioSerializer
    permission_classes = [IsAuthenticated]

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

class EnvioViewSet(viewsets.ModelViewSet):
    queryset = Envio.objects.all()
    serializer_class = EnvioSerializer
    permission_classes = [IsAuthenticated]

class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAuthenticated]

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

class CategoriaProductoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaProducto.objects.all()
    serializer_class = CategoriaProductoSerializer
    permission_classes = [IsAuthenticated]

class BoletaViewSet(viewsets.ModelViewSet):
    queryset = Boleta.objects.all()
    serializer_class = BoletaSerializer
    permission_classes = [IsAuthenticated]

class PromocionViewSet(viewsets.ModelViewSet):
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer
    permission_classes = [IsAuthenticated]

class EventoTuristicoViewSet(viewsets.ModelViewSet):
    queryset = EventoTuristico.objects.all()
    serializer_class = EventoTuristicoSerializer
    permission_classes = [IsAuthenticated]

class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer
    permission_classes = [IsAuthenticated]
    
class ProducerViewSet(ModelViewSet):
    queryset = Usuario.objects.filter(rol='productor')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

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
        serializer = BoletaSerializer(boleta)
        return Response(serializer.data, status=200)
    except Boleta.DoesNotExist:
        return Response({'error': 'Boleta no encontrada'}, status=404)