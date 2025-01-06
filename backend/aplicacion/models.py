from django.db import models
from django.contrib.auth.models import AbstractUser

# Modelo Usuario personalizado
class Usuario(AbstractUser):
    ROLES = (
        ('cliente', 'Cliente'),
        ('productor', 'Productor'),
        ('admin', 'Administrador'),
    )
    rol = models.CharField(max_length=10, choices=ROLES, default='cliente')
    direccion = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    token_social = models.TextField(blank=True, null=True)  # Para guardar el token de redes sociales

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"

# Modelo Categoría de Producto
class CategoriaProducto(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    productor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'productor'}
    )

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    METODO_VENTA_CHOICES = [
        ('unidad', 'Por Unidad'),
        ('kilo', 'Por Peso'),
    ]
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.PositiveIntegerField()
    categoria = models.ForeignKey(CategoriaProducto, on_delete=models.SET_NULL, null=True, blank=True)
    productor = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol': 'productor'})
    metodo_venta = models.CharField(max_length=10, choices=METODO_VENTA_CHOICES, default='unidad')

    def __str__(self):
        return self.nombre

    @property
    def stock(self):
        # Si es necesario, calcula el stock de una manera personalizada
        return self.cantidad


# Modelo Venta
class Venta(models.Model):
    cliente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='ventas_cliente',
        limit_choices_to={'rol': 'cliente'}
    )
    productor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='ventas_productor',
        limit_choices_to={'rol': 'productor'}
    )
    fecha_venta = models.DateTimeField(auto_now_add=True)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Venta {self.id} - {self.cliente.username} a {self.productor.username}"

# Modelo Detalle de Venta
class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Detalle de Venta {self.venta.id}: {self.producto.nombre} ({self.cantidad})"

# Modelo Boleta
class Boleta(models.Model):
    numero_boleta = models.CharField(max_length=50, unique=True)
    fecha_emision = models.DateTimeField(auto_now_add=True)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)
    impuestos = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Boleta {self.numero_boleta}"

# Modelo Promoción
class Promocion(models.Model):
    productor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'productor'}
    )
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    descuento = models.DecimalField(max_digits=5, decimal_places=2, help_text="Porcentaje de descuento")
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()

    def __str__(self):
        return f"Promoción: {self.titulo} ({self.descuento}%)"

# Modelo Feedback
class Feedback(models.Model):
    cliente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='feedback_cliente'
    )
    productor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='feedback_productor'
    )
    comentario = models.TextField()
    calificacion = models.PositiveIntegerField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback de {self.cliente.username} a {self.productor.username}"

# Modelo Visita Guiada
class Visita(models.Model):
    productor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='visitas_productor')
    cliente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='visitas_cliente')
    fecha_visita = models.DateTimeField()
    estado = models.CharField(
        max_length=50,
        choices=[('pendiente', 'Pendiente'), ('confirmada', 'Confirmada'), ('cancelada', 'Cancelada')]
    )

    def __str__(self):
        return f"Visita de {self.cliente.username} a {self.productor.username}"

# Modelo Evento Turístico
class EventoTuristico(models.Model):
    productor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='eventos_productor',
        limit_choices_to={'rol': 'productor'}
    )
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha_evento = models.DateTimeField()
    precio_entrada = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Evento: {self.titulo} ({self.fecha_evento.date()})"

# Modelo Anuncio
class Anuncio(models.Model):
    productor = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.titulo

# Modelo Envío
class Envio(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE)
    direccion_entrega = models.CharField(max_length=255)
    estado = models.CharField(max_length=50, choices=[('pendiente', 'Pendiente'), ('enviado', 'Enviado'), ('entregado', 'Entregado')])
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Envío de {self.venta.id} - {self.estado}"

# Modelo Notificación
class Notificacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50)
    mensaje = models.TextField()
    leido = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notificación para {self.usuario.username}"
    
    # Modelo Ubicación
class Ubicacion(models.Model):
    productor = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    latitud = models.FloatField()
    longitud = models.FloatField()
    direccion = models.CharField(max_length=255)

    def __str__(self):
        return f"Ubicación de {self.productor.username}"
    
# Modelo Actividad
class Actividad(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50, choices=[('compra', 'Compra'), ('visita', 'Visita'), ('feedback', 'Feedback')])
    detalle = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Actividad {self.tipo} - {self.usuario.username}"

