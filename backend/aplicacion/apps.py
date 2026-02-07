from django.apps import AppConfig

class AplicacionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aplicacion'
    verbose_name = 'Aplicación de Agrotour'

    def ready(self):
        import aplicacion.signals
