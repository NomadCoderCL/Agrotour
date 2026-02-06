from celery import shared_task
from .models import Producto, Notificacion
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@shared_task
def check_stock_levels():
    """
    Task to check products with low stock and notify producers.
    """
    low_stock_products = Producto.objects.filter(cantidad__lt=5)
    channel_layer = get_channel_layer()
    
    for producto in low_stock_products:
        mensaje = f"¡Alerta! El producto '{producto.nombre}' tiene stock bajo ({producto.cantidad})."
        
        # 1. Create DB Notification
        Notificacion.objects.create(
            usuario=producto.productor,
            tipo="STOCK_ALERTA",
            mensaje=mensaje
        )
        
        # 2. Send Real-time WebSocket notification (if group notifications_global exists)
        async_to_sync(channel_layer.group_send)(
            "notifications_global",
            {
                "type": "send_notification",
                "message": {
                    "title": "Stock Bajo",
                    "text": mensaje,
                    "product_id": producto.id
                }
            }
        )
    
    return f"Checked {len(low_stock_products)} low stock products."
