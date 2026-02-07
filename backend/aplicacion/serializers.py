from rest_framework import serializers
from .models import (
    Usuario,
    Producto,
    CategoriaProducto,
    Venta,
    DetalleVenta,
    Boleta,
    Visita,
    Anuncio,
    Feedback,
    Envio,
    Ubicacion,
    Notificacion,
    Promocion,
    EventoTuristico,
    Actividad,
)

# Serializador para Usuario
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'direccion', 'telefono', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = super().create(validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance

# Serializador para Producto
class ProductoSerializer(serializers.ModelSerializer):
    precio = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio', 'cantidad', 'categoria', 'productor', 'metodo_venta']

# Serializador para Producto (Versión Móvil Optimizada)
class ProductoMobileSerializer(serializers.ModelSerializer):
    """Versión ligera de Producto para reducir consumo de datos en móviles"""
    class Meta:
        model = Producto
        fields = [
            'id',
            'nombre',
            'precio',
            'metodo_venta',
            'cantidad',
            'productor',
            # Se omiten campos pesados como descripcion si no son necesarios en el listado
        ]

# Serializador para Categoría de Producto
class CategoriaProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaProducto
        fields = ['id', 'nombre', 'descripcion']

# Serializador para Detalle de Venta
class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = ['id', 'venta', 'producto', 'cantidad', 'subtotal']

# Serializador para Boleta
class BoletaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Boleta
        fields = ['id', 'numero_boleta', 'fecha_emision', 'monto_total', 'impuestos']

# Serializador para Venta
class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    boleta = BoletaSerializer(read_only=True)

    class Meta:
        model = Venta
        fields = ['id', 'cliente', 'productor', 'fecha_venta', 'monto_total', 'boleta', 'detalles']

# Serializador para Visita
class VisitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visita
        fields = ['id', 'productor', 'cliente', 'fecha_visita', 'estado']

# Serializador para Anuncio
class AnuncioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anuncio
        fields = ['id', 'productor', 'titulo', 'descripcion', 'fecha_creacion', 'activo']

# Serializador para Feedback
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'cliente', 'productor', 'comentario', 'calificacion', 'fecha_creacion']

# Serializador para Envío
class EnvioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Envio
        fields = ['id', 'venta', 'direccion_entrega', 'estado', 'fecha_creacion', 'fecha_actualizacion']

# Serializador para Ubicación
class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = ['id', 'productor', 'latitud', 'longitud', 'direccion']

# Serializador para Notificación
class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['id', 'usuario', 'tipo', 'mensaje', 'leido', 'fecha_creacion']

# Serializador para Promoción
class PromocionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocion
        fields = ['id', 'productor', 'titulo', 'descripcion', 'descuento', 'fecha_inicio', 'fecha_fin']

# Serializador para Evento Turístico
class EventoTuristicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoTuristico
        fields = ['id', 'productor', 'titulo', 'descripcion', 'fecha_evento', 'precio_entrada']

# Serializador para Actividad
class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = ['id', 'usuario', 'tipo', 'detalle', 'fecha']
