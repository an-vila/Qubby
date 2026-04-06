from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField

class Box(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='box'
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_protected = models.BooleanField(default=False)
    pin = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return f"{self.name} (Usuario: {self.user})"

class Item(models.Model):
    box = models.ForeignKey(Box, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    code = models.CharField(max_length=50, blank=True, null=True)
    image = models.ImageField(upload_to="items_images/", blank=True, null=True)
    tags = ArrayField(
        models.CharField(max_length=50, blank=True), blank=True, default=list
    )
    registration_date = models.DateField(auto_now_add=True)
    quantity = models.IntegerField(default=1)
    status = models.CharField(max_length=50, default="Guardado")

    def __str__(self):
        return self.name
