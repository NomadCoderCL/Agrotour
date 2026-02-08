from django.shortcuts import render

def landing_page(request):
    """Muestra la página de bienvenida y registro para el programa piloto."""
    return render(request, 'landing.html')

def privacy_policy(request):
    """Muestra la política de privacidad obligatoria para tiendas de apps."""
    return render(request, 'privacy.html')

def terms_service(request):
    """Muestra los términos de servicio obligatorios para tiendas de apps."""
    return render(request, 'terms.html')
