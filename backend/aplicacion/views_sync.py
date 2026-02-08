from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Producto, Usuario
from .sync.mobile_conflict_resolver import MobileConflictResolver, ConflictResolution
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_push_view(request):
    """
    Endpoint para recibir operaciones desde el móvil (Push).
    Aplica resolución de conflictos LWW (Last-Write-Wins).
    """
    operations = request.data.get('operations', [])
    resolver = MobileConflictResolver()
    results = []

    try:
        with transaction.atomic():
            for op in operations:
                entity_type = op.get('entity_type')
                entity_id = op.get('entity_id')
                op_data = op.get('data')
                
                # Ejemplo con Producto
                if entity_type == 'producto':
                    try:
                        server_instance = Producto.objects.get(id=entity_id)
                        # Mock de server_op para comparación (simplificado para este MVP)
                        # En un caso real, guardaríamos el timestamp del servidor por cada campo o registro
                        server_op = {
                            'timestamp': server_instance.fecha_actualizacion.isoformat() if hasattr(server_instance, 'fecha_actualizacion') else '2000-01-01T00:00:00Z',
                            'device_id': 'web'
                        }
                        
                        res = resolver.resolve(op, server_op)
                        
                        if res == ConflictResolution.LOCAL_WINS:
                            # Actualizar servidor con datos del móvil
                            for key, value in op_data.items():
                                setattr(server_instance, key, value)
                            server_instance.save()
                            results.append({'id': entity_id, 'status': 'updated'})
                        else:
                            results.append({'id': entity_id, 'status': 'server_wins', 'server_data': op_data}) # Debería ser server_data real
                            
                    except Producto.DoesNotExist:
                        # Si no existe, lo creamos
                        Producto.objects.create(id=entity_id, **op_data, productor=request.user)
                        results.append({'id': entity_id, 'status': 'created'})

        return Response({'success': True, 'results': results}, status=200)

    except Exception as e:
        logger.error(f"Error en sync_push_view: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sync_pull_view(request):
    """
    Endpoint para descargar cambios desde el servidor (Pull).
    Basado en cursor (timestamp de última sincronización).
    """
    last_sync = request.query_params.get('last_sync')
    # Simplificado: Devolver todos los productos si no hay timestamp
    query = Producto.objects.filter(productor=request.user)
    if last_sync:
        # Ejemplo: query = query.filter(fecha_actualizacion__gt=last_sync)
        pass
        
    return Response({
        'entities': {
            'productos': list(query.values())
        },
        'server_time': '2026-02-07T19:30:00Z' # Dummy
    }, status=200)
