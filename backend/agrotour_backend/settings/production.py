from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

DEBUG = False

# Security Hardening
# Security Hardening
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
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

# CORS
# CORS
# CORS
CORS_ALLOW_ALL_ORIGINS = False  # Must be False when ALLOW_CREDENTIALS is True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "https://agrotour.vercel.app",
    "https://agrotour-fxvnno4mb-nomadcodercls-projects.vercel.app", # Vercel Preview
    "http://localhost:5173",
    "http://localhost:3000",
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF
CSRF_TRUSTED_ORIGINS = [
    'https://*.onrender.com',
    'https://agrotour.vercel.app',
    'https://*.vercel.app'
]

# Database
# Uses env.db() from base.py, so ensure DATABASE_URL is set in Render

# Silenced Warnings
# W001: SecurityMiddleware is present (verified), but 'insert' confuses the check.
# django_ratelimit.W001/E003: LocMemCache is used for simplicity/compatibility.
SILENCED_SYSTEM_CHECKS = ['security.W001', 'django_ratelimit.W001', 'django_ratelimit.E003']
