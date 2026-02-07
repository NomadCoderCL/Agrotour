from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Producto, Venta, FCMToken
from .tasks import notify_new_product, notify_sale_confirmation

@receiver(post_save, sender=Producto)
def product_created_signal(sender, instance, created, **kwargs):
    """Disparar notificación push cuando se crea un producto"""
    if created:
        # Usamos delay para que Celery lo maneje de forma asíncrona
        notify_new_product.delay(instance.id)

@receiver(post_save, sender=Venta)
def sale_confirmed_signal(sender, instance, created, **kwargs):
    """Disparar notificación push cuando se confirma una venta"""
    if created:
        notify_sale_confirmation.delay(instance.id)
