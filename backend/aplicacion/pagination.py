from rest_framework.pagination import CursorPagination

class MobileCursorPagination(CursorPagination):
    """
    Paginación basada en cursor optimizada para clientes móviles.
    Evita los problemas de performance de 'offset' en datasets grandes.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    cursor_query_param = 'cursor'
    template = None  # Deshabilitar HTML en la respuesta
    ordering = '-id'  # Orden predeterminado por ID descendente
