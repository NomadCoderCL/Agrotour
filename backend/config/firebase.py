import firebase_admin
from firebase_admin import credentials, messaging
import os
import logging
from typing import List

logger = logging.getLogger(__name__)

# Inicializar Firebase (solo si no se ha inicializado)
try:
    if not firebase_admin._apps:
        creds_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
        if os.path.exists(creds_path):
            firebase_admin.initialize_app(credentials.Certificate(creds_path))
        else:
            logger.warning(f"Firebase credentials not found at {creds_path}. FCM will not work.")
except Exception as e:
    logger.error(f"Error initializing Firebase: {str(e)}")

class FCMManager:
    """Gestiona notificaciones push via Firebase Cloud Messaging"""
    
    @staticmethod
    def send_notification(
        user_token: str,
        title: str,
        body: str,
        data: dict = None
    ) -> bool:
        """Envía notificación a un token específico"""
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=user_token,
            )
            response = messaging.send(message)
            return bool(response)
        except Exception as e:
            logger.error(f"FCM single send failed: {str(e)}")
            return False
    
    @staticmethod
    def send_batch_notifications(tokens: List[str], title: str, body: str, data: dict = None):
        """Envía notificación a múltiples tokens (Multicast)"""
        if not tokens:
            return
            
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            tokens=tokens,
        )
        try:
            response = messaging.send_multicast(message)
            logger.info(f"FCM Batch success: {response.success_count}, failure: {response.failure_count}")
            return response
        except Exception as e:
            logger.error(f"FCM batch send failed: {str(e)}")
            return None
