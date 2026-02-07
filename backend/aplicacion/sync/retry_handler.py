import asyncio
from typing import Callable, Any
import logging

logger = logging.getLogger(__name__)

class RetryHandler:
    """Maneja reintentos con exponential backoff"""
    
    MAX_ATTEMPTS = 4
    INITIAL_DELAY = 1  # 1 segundo
    MAX_DELAY = 60     # 60 segundos
    BACKOFF_MULTIPLIER = 2
    
    @staticmethod
    async def execute_with_retry(
        func: Callable[..., Any],
        *args,
        **kwargs
    ) -> Any:
        """
        Ejecuta función con retry automático
        Delays: 1s, 2s, 4s, 8s (max 60s)
        """
        last_error = None
        
        for attempt in range(RetryHandler.MAX_ATTEMPTS):
            try:
                # Si la función es corrutina, usar await
                if asyncio.iscoroutinefunction(func):
                    return await func(*args, **kwargs)
                else:
                    return func(*args, **kwargs)
            except Exception as e:
                last_error = e
                
                if attempt < RetryHandler.MAX_ATTEMPTS - 1:
                    delay = min(
                        RetryHandler.INITIAL_DELAY * (RetryHandler.BACKOFF_MULTIPLIER ** attempt),
                        RetryHandler.MAX_DELAY
                    )
                    logger.warning(
                        f"Intento {attempt + 1} falló. Reintentando en {delay}s: {str(e)}"
                    )
                    await asyncio.sleep(delay)
        
        logger.error(f"Falló después de {RetryHandler.MAX_ATTEMPTS} intentos: {last_error}")
        raise last_error
