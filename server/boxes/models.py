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
    is_protected = models.BooleanField(default=False)
    pin = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return f"{self.name} (Usuario: {self.user})"