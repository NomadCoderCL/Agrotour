from django.contrib import admin
from .models import (
    Usuario, CategoriaProducto, Producto, Venta, DetalleVenta, Boleta,
    Promocion, Visita, EventoTuristico, Feedback, Envio, Notificacion,
    Cupon, FactorCarbono
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
    list_display = (
        'id', 'cliente', 'productor', 'fecha_venta', 
        'monto_total', 'descuento_cupon', 'huella_carbono_total'
    )
    search_fields = ('cliente__username', 'productor__username')
    list_filter = ('fecha_venta',)

    def changelist_view(self, request, extra_context=None):
        from django.db.models import Sum
        extra_context = extra_context or {}
        # Resumen Rápido para el dashboard
        extra_context['total_ventas_monto'] = Venta.objects.aggregate(Sum('monto_total'))['monto_total__sum'] or 0
        extra_context['total_co2_ahorrado'] = Venta.objects.aggregate(Sum('huella_carbono_total'))['huella_carbono_total__sum'] or 0
        return super().changelist_view(request, extra_context=extra_context)

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

@admin.register(Cupon)
class CuponAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'tipo', 'valor', 'fecha_fin', 'activo', 'conteo_uso', 'limite_uso')
    search_fields = ('codigo',)
    list_filter = ('activo', 'tipo')

@admin.register(FactorCarbono)
class FactorCarbonoAdmin(admin.ModelAdmin):
    list_display = ('categoria', 'co2_por_unidad', 'unidad')
    search_fields = ('categoria',)
