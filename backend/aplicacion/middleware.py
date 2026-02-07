from django.utils.timezone import now
from rest_framework.exceptions import AuthenticationFailed
from .models import TokenBlacklist

class TokenBlacklistMiddleware:
    """
    Middleware para verificar si el token de la request ha sido revocado.
    Útil para mobile logouts inmediatos.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
            # Verificar si existe en la blacklist
            if TokenBlacklist.objects.filter(token=token).exists():
                # Nota: En middleware de Django básico no podemos lanzar AuthenticationFailed 
                # fácilmente para que DRF lo capture igual, pero podemos devolver 401.
                from django.http import JsonResponse
                return JsonResponse(
                    {'error': 'Token has been revoked'}, 
                    status=401
                )
        
        response = self.get_response(request)
        return response
