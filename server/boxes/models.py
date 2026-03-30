from django.db import models
from django.conf import settings

class Box(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='box'
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (Usuario: {self.user})"

class Item(models.Model):
    box = models.ForeignKey(
        Box,
        on_delete=models.CASCADE,
        related_name='items'  # lo que busca serializer
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (Caja: {self.box.name})"