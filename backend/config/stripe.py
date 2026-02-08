import stripe
import os
import logging
from django.conf import settings
from decimal import Decimal

logger = logging.getLogger(__name__)

# Initialize Stripe with Secret Key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_placeholder')

class StripeManager:
    """Gestiona la lógica de pagos con Stripe para Agrotour"""

    @staticmethod
    def create_payment_intent(amount: Decimal, currency: str = 'clp', metadata: dict = None):
        """
        Crea un PaymentIntent en Stripe.
        El amount debe convertirse a la unidad mínima (centavos o pesos según moneda).
        Para CLP, el monto es directo (sin decimales).
        """
        try:
            # Para CLP (Chilean Peso), Stripe no usa decimales
            amount_clp = int(amount)
            
            intent = stripe.PaymentIntent.create(
                amount=amount_clp,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            return intent
        except Exception as e:
            logger.error(f"Error creating PaymentIntent: {str(e)}")
            return None

    @staticmethod
    def verify_webhook_signature(payload, sig_header):
        """Verifica que el webhook provenga realmente de Stripe"""
        endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
            return event
        except ValueError as e:
            logger.error(f"Invalid payload for Stripe Webhook: {str(e)}")
            return None
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature for Stripe Webhook: {str(e)}")
            return None
