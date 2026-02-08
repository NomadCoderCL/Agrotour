from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django_ratelimit.decorators import ratelimit
from .models import Venta, DetalleVenta, Producto
from config.stripe import StripeManager
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='5/m', block=True)
def create_payment_intent_view(request):
    """
    Crea un PaymentIntent para una Venta existente.
    Calcula la comisión (15%) y el neto para el productor (85%).
    """
    venta_id = request.data.get('venta_id')
    if not venta_id:
        return Response({'error': 'venta_id es requerido.'}, status=400)

    try:
        venta = Venta.objects.get(id=venta_id, cliente=request.user)
        
        # Si ya fue pagada, no crear otro intent
        if venta.estado_pago == 'pagado':
            return Response({'error': 'Esta venta ya ha sido pagada.'}, status=400)

        # Si ya tiene un intent, podríamos reutilizarlo, pero para simplificar creamos uno nuevo
        # o recuperamos el existente si es necesario.
        
        # Calcular Splits (85/15)
        monto_total = venta.monto_total
        comision = monto_total * Decimal('0.15')
        neto_productor = monto_total - comision

        # Metadatos para Stripe
        metadata = {
            'venta_id': venta.id,
            'cliente_id': request.user.id,
            'productor_id': venta.productor.id,
        }

        # Crear Intent
        intent = StripeManager.create_payment_intent(
            amount=monto_total,
            metadata=metadata
        )

        if not intent:
            return Response({'error': 'Error al comunicar con Stripe.'}, status=500)

        # Actualizar Venta con datos de pago
        venta.stripe_payment_intent_id = intent.id
        venta.monto_comision = comision
        venta.monto_neto_productor = neto_productor
        venta.save()

        return Response({
            'client_secret': intent.client_secret,
            'publishable_key': os.getenv('STRIPE_PUBLISHABLE_KEY', 'pk_test_placeholder')
        }, status=200)

    except Venta.DoesNotExist:
        return Response({'error': 'Venta no encontrada.'}, status=404)
    except Exception as e:
        logger.error(f"Error en create_payment_intent_view: {str(e)}")
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook_view(request):
    """
    Webhook para recibir confirmaciones de Stripe de forma asíncrona.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    event = StripeManager.verify_webhook_signature(payload, sig_header)
    if not event:
        return Response({'error': 'Firma inválida.'}, status=400)

    # Manejar el evento
    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        stripe_id = intent['id']
        
        logger.info(f"PaymentIntent exitoso recibido: {stripe_id}")
        
        try:
            with transaction.atomic():
                venta = Venta.objects.select_for_update().get(stripe_payment_intent_id=stripe_id)
                if venta.estado_pago != 'pagado':
                    venta.estado_pago = 'pagado'
                    venta.save()
                    
                    # Acciones post-pago:
                    # 1. Generar boleta automáticamente?
                    # 2. Notificar al productor/cliente vía Push
                    from .tasks import notify_sale_confirmation
                    notify_sale_confirmation.delay(venta.id)
                    
                    logger.info(f"Venta {venta.id} marcada como PAGADA.")
                    
        except Venta.DoesNotExist:
            logger.error(f"Venta no encontrada para stripe_id: {stripe_id}")
            return Response({'error': 'Venta no encontrada.'}, status=404)
        except Exception as e:
            logger.error(f"Error procesando webhook: {str(e)}")
            return Response({'error': str(e)}, status=500)

    elif event['type'] == 'payment_intent.payment_failed':
        intent = event['data']['object']
        stripe_id = intent['id']
        logger.warning(f"Pago fallido: {stripe_id}")
        Venta.objects.filter(stripe_payment_intent_id=stripe_id).update(estado_pago='fallido')

    return Response({'status': 'success'}, status=200)

import os # Required for os.getenv
