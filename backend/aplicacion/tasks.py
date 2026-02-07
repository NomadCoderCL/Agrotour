from celery import shared_task
from .models import Producto, Notificacion, Venta, Usuario, FCMToken
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from config.firebase import FCMManager
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_stock_levels():
    # ... (contenido anterior se mantiene igual o similar)
    low_stock_products = Producto.objects.filter(cantidad__lt=5)
    channel_layer = get_channel_layer()
    
    for producto in low_stock_products:
        mensaje = f"¡Alerta! El producto '{producto.nombre}' tiene stock bajo ({producto.cantidad})."
        # Notificar vía DB y WebSocket como antes
        Notificacion.objects.create(usuario=producto.productor, tipo="STOCK_ALERTA", mensaje=mensaje)
        
        # Enviar también Push si tiene token
        tokens = list(FCMToken.objects.filter(usuario=producto.productor, is_active=True).values_list('token', flat=True))
        if tokens:
            FCMManager.send_batch_notifications(tokens, "Alerta de Stock", mensaje)

    return f"Checked {len(low_stock_products)} products."

@shared_task
def notify_new_product(product_id):
    """Notifica a todos los clientes sobre un nuevo producto disponible"""
    try:
        producto = Producto.objects.get(id=product_id)
        # En una versión real, esto se filtraría por categorías de interés o suscripciones
        usuarios = Usuario.objects.filter(rol='cliente')
        tokens = list(FCMToken.objects.filter(usuario__in=usuarios, is_active=True).values_list('token', flat=True))
        
        if tokens:
            FCMManager.send_batch_notifications(
                tokens, 
                "🌾 ¡Nuevo producto!", 
                f"{producto.nombre} ya está disponible a ${producto.precio}."
            )
    except Producto.DoesNotExist:
        pass

@shared_task
def notify_sale_confirmation(venta_id):
    """Notifica al cliente que su compra fue confirmada y al productor que tiene una venta"""
    try:
        venta = Venta.objects.get(id=venta_id)
        
        # Notificar al Cliente
        cliente_tokens = list(FCMToken.objects.filter(usuario=venta.cliente, is_active=True).values_list('token', flat=True))
        if cliente_tokens:
            FCMManager.send_batch_notifications(cliente_tokens, "Compra Confirmada", f"Tu pedido #{venta.id} ha sido registrado.")
            
        # Notificar al Productor
        productor_tokens = list(FCMToken.objects.filter(usuario=venta.productor, is_active=True).values_list('token', flat=True))
        if productor_tokens:
            FCMManager.send_batch_notifications(productor_tokens, "Nueva Venta 💰", f"Has recibido un pedido de {venta.cliente.username}.")
            
    except Venta.DoesNotExist:
        pass
