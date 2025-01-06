from django.contrib import admin
from .models import (
    Usuario, CategoriaProducto, Producto, Venta, DetalleVenta, Boleta,
    Promocion, Visita, EventoTuristico, Feedback, Envio, Notificacion
)

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'rol', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'rol')
    list_filter = ('rol', 'is_active', 'is_staff')

@admin.register(CategoriaProducto)
class CategoriaProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'productor')
    search_fields = ('nombre', 'productor__username')

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'cantidad', 'categoria', 'productor', 'stock', 'metodo_venta')  # 'stock' es ahora un @property
    search_fields = ('nombre', 'productor__username', 'categoria__nombre')
    list_filter = ('metodo_venta', 'categoria')


@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'productor', 'fecha_venta', 'monto_total')
    search_fields = ('cliente__username', 'productor__username')
    list_filter = ('fecha_venta',)

@admin.register(DetalleVenta)
class DetalleVentaAdmin(admin.ModelAdmin):
    list_display = ('venta', 'producto', 'cantidad', 'subtotal')
    search_fields = ('venta__id', 'producto__nombre')

@admin.register(Boleta)
class BoletaAdmin(admin.ModelAdmin):
    list_display = ('numero_boleta', 'fecha_emision', 'monto_total', 'impuestos')
    search_fields = ('numero_boleta',)

@admin.register(Promocion)
class PromocionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'productor', 'descuento', 'fecha_inicio', 'fecha_fin')
    search_fields = ('titulo', 'productor__username')
    list_filter = ('fecha_inicio', 'fecha_fin')

@admin.register(Visita)
class VisitaAdmin(admin.ModelAdmin):
    list_display = ('productor', 'cliente', 'fecha_visita', 'estado')
    search_fields = ('productor__username', 'cliente__username')
    list_filter = ('estado',)

@admin.register(EventoTuristico)
class EventoTuristicoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'productor', 'fecha_evento', 'precio_entrada')
    search_fields = ('titulo', 'productor__username')
    list_filter = ('fecha_evento',)

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'productor', 'calificacion', 'fecha_creacion')
    search_fields = ('cliente__username', 'productor__username')
    list_filter = ('calificacion', 'fecha_creacion')

@admin.register(Envio)
class EnvioAdmin(admin.ModelAdmin):
    list_display = ('venta', 'direccion_entrega', 'estado', 'fecha_creacion', 'fecha_actualizacion')
    search_fields = ('venta__id', 'direccion_entrega')
    list_filter = ('estado',)

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo', 'mensaje', 'leido', 'fecha_creacion')
    search_fields = ('usuario__username', 'tipo', 'mensaje')
    list_filter = ('leido', 'fecha_creacion')
