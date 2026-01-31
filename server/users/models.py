from django.db import models
from django.contrib.auth.hashers import make_password
import secrets

class User(models.Model):
    """
    Modelo de Usuario para almacenar datos de registro.
    
    ¿QUÉ ES UN MODELO?
    - Es la estructura de datos que se almacena en la base de datos
    - Cada campo aquí corresponde a una columna en la tabla 'users' de PostgreSQL
    - Django convierte automáticamente este modelo a SQL
    """
    
    # CAMPOS OBLIGATORIOS (vienen del formulario frontend)
    name = models.CharField(
        max_length=150,  # Máximo 150 caracteres
        unique=True,  # No puede haber dos usuarios con el mismo nombre
        help_text="Nombre de usuario único"
    )
    
    email = models.EmailField(
        unique=True,  # No puede haber dos usuarios con el mismo email
        help_text="Correo electrónico único"
    )
    
    password = models.CharField(
        max_length=255,  # Aumentado porque el hash de la contraseña ocupa más
        help_text="Contraseña hasheada (encriptada)"
    )
    
    # CAMPOS OPCIONALES (NO vienen del formulario, los agrega Django automáticamente)
    is_active = models.BooleanField(
        default=True,  # TEMPORAL: True mientras no tengamos email verification
        help_text="""
        ¿PARA QUÉ SIRVE?
        - Cuando el usuario se registra, is_active = False
        - Django enviará un email con un link: "Confirma tu cuenta"
        - Cuando el usuario cliquea el link, Django cambia is_active = True
        - Esto evita que gente se registre con emails de otras personas
        
        NOTA: Ahora está en True porque email verification no está implementado.
        Cuando lo agregues, cambia a default=False
        
        VENTAJAS:
        - Seguridad: validas que el email sea del usuario
        - Verificación: te aseguras que tiene acceso al email
        """
    )
    
    # NUEVO: Token para verificación de email
    verification_token = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        help_text="Token único para verificar el email"
    )
    
    email_verified = models.BooleanField(
        default=False,
        help_text="Si el email ha sido verificado"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,  # Se llena automáticamente con la fecha/hora actual
        help_text="""
        ¿PARA QUÉ SIRVE?
        - Registra CUÁNDO se creó la cuenta (2026-01-31 14:30:45)
        - Es automático: no tienes que hacer nada, Django lo rellena
        - Se usa para:
          * Ver cuándo se registró cada usuario
          * Auditoría (quién se registró y cuándo)
          * Estadísticas (cuántos usuarios nuevos hoy/mes/año)
          * Limpieza: eliminar cuentas que no se activaron en 30 días
        
        EJEMPLO:
        - Usuario se registra pero no confirma email → es_active = False
        - Pasan 30 días sin confirmar
        - Un script automático ve: created_at hace 30+ días → ELIMINA la cuenta
        """
    )
    
    class Meta:
        # Configuración de la tabla en la BD
        db_table = 'users'  # Nombre de la tabla en PostgreSQL
        ordering = ['-created_at']  # Ordenar por más reciente primero
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        """Cómo aparece el usuario en el admin de Django"""
        return f"{self.name} ({self.email})"
    
    def generate_verification_token(self):
        """Generar un token único para verificación de email"""
        self.verification_token = secrets.token_urlsafe(32)
        return self.verification_token
    
    def save(self, *args, **kwargs):
        """
        ¿QUÉ HACE?
        Este método se ejecuta cada vez que haces usuario.save()
        
        OBJETIVO: 
        1. Encriptar la contraseña ANTES de guardarla en la BD
        2. Generar token de verificación si es usuario nuevo
        
        ¿POR QUÉ?
        - Si guardas la contraseña en texto plano: PELIGRO
        - Si alguien accede a la BD, conoce todas las contraseñas
        - Con hash (pbkdf2_sha256): es irreversible
        
        EJEMPLO:
        - Usuario escribe: "1234"
        - Se transforma en: "pbkdf2_sha256$600000$abc123xyz$abc123def456..."
        - No se puede revertir: no se puede saber que es "1234"
        - Para verificar: se hashea la contraseña del login y se compara
        
        ¿CÓMO FUNCIONA?
        1. Si es un usuario NUEVO (not self.pk): hashea la contraseña
        2. Si es un usuario EXISTENTE y cambio contraseña: hashea de nuevo
        3. Si la contraseña ya está hasheada (comienza con 'pbkdf2_sha256$'): 
           NO la vueltas a hashear (el hash de un hash sería incorrecto)
        """
        # Generar token si es usuario nuevo
        if not self.pk and not self.verification_token:
            self.generate_verification_token()
        
        # Revisar si la contraseña necesita hash
        if not self.pk or (self.password and not self.password.startswith('pbkdf2_sha256$')):
            # make_password() convierte "1234" en "pbkdf2_sha256$..."
            self.password = make_password(self.password)
        
        # Llamar al save() original para guardar en BD
        super().save(*args, **kwargs)