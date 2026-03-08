from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.contrib.auth.hashers import make_password
import secrets


class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("El Email es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        if password:
            user.set_password(password)  # Encripta la contraseña
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):

    name = models.CharField(
        max_length=150, unique=True, help_text="Nombre de usuario único"
    )
    email = models.EmailField(unique=True, help_text="Correo electrónico único")

    # Hemos quitado el campo de contraseña. Nos lo facilita Django mediante el CustomUserManager

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(
        default=False,
        help_text="Necesario para poder entrar al panel de Admin de Django",
    )

    verification_token = models.CharField(
        max_length=255, blank=True, null=True, unique=True
    )
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.name} ({self.email})"

    def generate_verification_token(self):
        self.verification_token = secrets.token_urlsafe(32)
        return self.verification_token

    def save(self, *args, **kwargs):
        if not self.pk and not self.verification_token:
            self.generate_verification_token()

        if self.password and not self.password.startswith("pbkdf2_sha256$"):
            self.password = make_password(self.password)

        super().save(*args, **kwargs)
