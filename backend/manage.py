import os
import sys

def main():
    """Punto de entrada principal para el comando de administración de Django."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrotour_backend.settings.local')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "No se pudo importar Django. ¿Está instalado y disponible en el entorno?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
