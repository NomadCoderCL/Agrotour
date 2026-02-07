from django.test import TestCase
from aplicacion.sync.mobile_conflict_resolver import MobileConflictResolver, ConflictResolution
from datetime import datetime, timedelta

class MobileConflictResolverTest(TestCase):
    def setUp(self):
        self.resolver = MobileConflictResolver()

    def test_lww_server_wins(self):
        """El servidor gana si tiene un timestamp posterior"""
        now = datetime.now()
        local_op = {
            'timestamp': (now - timedelta(seconds=10)).isoformat(),
            'device_id': 'mobile_1'
        }
        server_op = {
            'timestamp': now.isoformat(),
            'device_id': 'web_1'
        }
        
        result = self.resolver.resolve(local_op, server_op)
        self.assertEqual(result, ConflictResolution.SERVER_WINS)

    def test_lww_local_wins(self):
        """El cliente gana si tiene un timestamp posterior"""
        now = datetime.now()
        local_op = {
            'timestamp': now.isoformat(),
            'device_id': 'mobile_1'
        }
        server_op = {
            'timestamp': (now - timedelta(seconds=10)).isoformat(),
            'device_id': 'web_1'
        }
        
        result = self.resolver.resolve(local_op, server_op)
        self.assertEqual(result, ConflictResolution.LOCAL_WINS)

    def test_tie_breaker_device_priority(self):
        """En caso de empate en timestamp, la prioridad de dispositivo decide"""
        ts = datetime.now().isoformat()
        
        # Web (3) vs Mobile (2) -> Web wins
        local_op = {'timestamp': ts, 'device_id': 'mobile_1'}
        server_op = {'timestamp': ts, 'device_id': 'web_1'}
        result = self.resolver.resolve(local_op, server_op)
        self.assertEqual(result, ConflictResolution.SERVER_WINS)
        
        # Mobile (2) vs Desktop (1) -> Mobile wins
        local_op = {'timestamp': ts, 'device_id': 'mobile_1'}
        server_op = {'timestamp': ts, 'device_id': 'desktop_1'}
        result = self.resolver.resolve(local_op, server_op)
        self.assertEqual(result, ConflictResolution.LOCAL_WINS)
