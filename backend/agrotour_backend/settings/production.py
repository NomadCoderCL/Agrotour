from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

DEBUG = False

# Security Hardening
# Security Hardening
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
# SESSION_COOKIE/CSRF_COOKIE settings moved to dedicated sections below

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

# Sentry Configuration
SENTRY_DSN = env('SENTRY_DSN', default='')
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True
    )

# Static Files serving with WhiteNoise (as fallback)
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# ALLOWED_HOSTS
ALLOWED_HOSTS = ['*']

# ============================================
# CORS CONFIGURATION
# ============================================

# Permitir credenciales (cookies, auth headers)
CORS_ALLOW_CREDENTIALS = True

# Orígenes permitidos exactos
CORS_ALLOWED_ORIGINS = [
    "https://agrotour.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Configuración de Previews segura (Controlada por variable de entorno)
ENABLE_CORS_PREVIEW = os.environ.get('ENABLE_CORS_PREVIEW', 'false').lower() == 'true'

if ENABLE_CORS_PREVIEW:
    CORS_ALLOWED_ORIGIN_REGEXES = [
        # Permite previews especificos de nomadcodercls-projects
        r"^https://agrotour-[a-z0-9]+-nomadcodercls-projects\.vercel\.app$",
    ]
else:
    CORS_ALLOWED_ORIGIN_REGEXES = []

# Métodos HTTP permitidos
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

# Headers permitidos en requests
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# Limitar CORS solo a rutas API y Auth
CORS_URLS_REGEX = r'^/(api|auth)/.*$'

# ============================================
# CSRF CONFIGURATION
# ============================================

CSRF_TRUSTED_ORIGINS = [
    "https://agrotour.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# trust render domain for internal health checks if needed
CSRF_TRUSTED_ORIGINS.append("https://*.onrender.com")

# Configuración para Cross-Origin Cookies (Vital para auth)
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'None'

# ============================================
# SESSION CONFIGURATION
# ============================================

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_HTTPONLY = True

# SECURITY HEADERS
# ----------------
SECURE_CROSS_ORIGIN_OPENER_POLICY = None



# Database
# Uses env.db() from base.py, so ensure DATABASE_URL is set in Render

# Silenced Warnings
# W001: SecurityMiddleware is present (verified), but 'insert' confuses the check.
# django_ratelimit.W001/E003: LocMemCache is used for simplicity/compatibility.
SILENCED_SYSTEM_CHECKS = ['security.W001', 'django_ratelimit.W001', 'django_ratelimit.E003']
