from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Admin personalizado para la tabla de Usuarios.
    
    Mostrar los usuarios registrados con sus datos principales.
    """
    list_display = ('id', 'name', 'email', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'email')
    readonly_fields = ('created_at', 'id')
    
    fieldsets = (
        ('Información del usuario', {
            'fields': ('id', 'name', 'email')
        }),
        ('Seguridad', {
            'fields': ('password', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
