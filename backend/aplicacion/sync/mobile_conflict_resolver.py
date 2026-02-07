from datetime import datetime
from enum import Enum
from typing import Any

class ConflictResolution(Enum):
    LOCAL_WINS = "local_wins"      # Keep local version
    SERVER_WINS = "server_wins"    # Keep server version  
    MERGED = "merged"              # Merged version

class MobileConflictResolver:
    """Estrategia LWW (Last-Write-Wins) para resolver conflictos en mobile"""
    
    def resolve(self, local_op: Any, server_op: Any) -> ConflictResolution:
        """
        Compara timestamps de operaciones y elige la más reciente
        En caso de tie, web gana sobre mobile (device priority)
        """
        # Nota: Asumimos que local_op y server_op tienen atributo 'timestamp' y 'device_id'
        # Estos pueden ser objetos SyncOperation o diccionarios del payload
        
        local_data = local_op if isinstance(local_op, dict) else local_op.__dict__
        server_data = server_op if isinstance(server_op, dict) else server_op.__dict__
        
        local_ts = datetime.fromisoformat(local_data.get('timestamp').replace('Z', '+00:00'))
        server_ts = datetime.fromisoformat(server_data.get('timestamp').replace('Z', '+00:00'))
        
        if local_ts > server_ts:
            return ConflictResolution.LOCAL_WINS
        elif server_ts > local_ts:
            return ConflictResolution.SERVER_WINS
        else:
            # Tie-breaker: device priority
            local_priority = self._get_device_priority(local_data.get('device_id', ''))
            server_priority = self._get_device_priority(server_data.get('device_id', ''))
            
            return (
                ConflictResolution.LOCAL_WINS 
                if local_priority > server_priority
                else ConflictResolution.SERVER_WINS
            )
    
    def _get_device_priority(self, device_id: str) -> int:
        """web_X > mobile_Y > desktop_Z"""
        if device_id.startswith('web'):
            return 3
        elif device_id.startswith('mobile'):
            return 2
        else:
            return 1
