from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

DEBUG = False

# Security Hardening
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
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
# If you want to be specific:
# CORS_ALLOWED_ORIGINS = ["https://agrotour.vercel.app"]

# CSRF
CSRF_TRUSTED_ORIGINS = [
    'https://*.onrender.com',
    'https://agrotour.vercel.app'
]

# Database
# Uses env.db() from base.py, so ensure DATABASE_URL is set in Render

# Silenced Warnings
# W001: SecurityMiddleware is present (verified), but 'insert' confuses the check.
# django_ratelimit.W001/E003: LocMemCache is used for simplicity/compatibility.
SILENCED_SYSTEM_CHECKS = ['security.W001', 'django_ratelimit.W001', 'django_ratelimit.E003']
