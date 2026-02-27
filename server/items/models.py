from django.db import models
from django.contrib.postgres.fields import ArrayField
from boxes.models import Box

class Item(models.Model):
    caja = models.ForeignKey(
        Box,
        on_delete=models.CASCADE,
        related_name="items",
    )

    nombre = models.CharField(max_length=150)

    categoria = models.CharField(max_length=100)

    descripcion = models.TextField(blank=True, null=True)

    # Recordad tener Pillow instalado para que funciones
    imagen = models.ImageField(upload_to="items_images/", blank=True, null=True)

    etiquetas = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list,
        help_text="Lista de etiquetas separadas por comas",
    )

    cantidad = models.PositiveIntegerField(default=1)

    ESTADO_CHOICES = [
        ("guardado", "Guardado"),
        ("prestado", "Prestado"),
        ("danado", "Dañado"),
    ]
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="guardado")

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} (en {self.caja.nombre})"
