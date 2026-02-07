from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

SILENCED_SYSTEM_CHECKS = [
    'security.W001',
    'django_ratelimit.W001',
    'django_ratelimit.E003'
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
