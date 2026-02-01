from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo User.
    
    Este serializer:
    1. Valida que name, email y password no estén vacíos
    2. Valida el formato del email
    3. NO devuelve la contraseña en las respuestas (write_only=True)
    4. Comprueba que el email y name sean únicos
    """
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'is_active', 'created_at']
        extra_kwargs = {
            'password': {
                'write_only': True,  # La contraseña NO se devuelve en GET
                'min_length': 6,
                'required': True
            },
            'email': {
                'required': True
            },
            'name': {
                'required': True,
                'min_length': 3,
            }
        }
    
    def validate_email(self, value):
        """Valida que el email sea único"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value
    
    def validate_name(self, value):
        """Valida que el name sea único"""
        if User.objects.filter(name=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está registrado.")
        return value
    
    def create(self, validated_data):
        """Crea un nuevo usuario (la contraseña se hash en models.py)"""
        user = User.objects.create(**validated_data)
        return user
