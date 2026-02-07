from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario

class MobileTokenManager:
    """
    Gestiona tokens JWT específicamente para clientes móviles.
    Maneja umbrales de refresco para evitar expiraciones durante el uso.
    """
    TOKEN_EXPIRY = timedelta(hours=1)
    REFRESH_THRESHOLD = timedelta(minutes=5)  # Sugerir refresco 5 min antes de expirar
    
    @staticmethod
    def create_tokens(user: Usuario) -> dict:
        """Crea access + refresh tokens con metadata de expiración"""
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'expires_in': int(MobileTokenManager.TOKEN_EXPIRY.total_seconds()),
            'should_refresh_in': int((MobileTokenManager.TOKEN_EXPIRY - MobileTokenManager.REFRESH_THRESHOLD).total_seconds())
        }
