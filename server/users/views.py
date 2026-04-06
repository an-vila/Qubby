from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer, UserUpdateSerializer, ChangePasswordSerializer
from .email_utils import send_verification_email


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar las operaciones CRUD de usuarios.

    Endpoints disponibles:
    - POST /api/users/           → Crear nuevo usuario (REGISTRO)
    - POST /api/users/login/     → Iniciar sesión (LOGIN)
    - GET /api/users/            → Listar todos los usuarios
    - GET /api/users/{id}/       → Obtener un usuario
    - PUT /api/users/{id}/       → Actualizar usuario completo
    - PATCH /api/users/{id}/     → Actualizar parcialmente
    - DELETE /api/users/{id}/    → Eliminar usuario
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Permisos especiales para cada endpoint:
        - REGISTRO y LOGIN: sin autenticación (AllowAny)
        - LISTAR usuarios: requiere autenticación (solo admin)
        - RESTO: requiere autenticación
        """
        if self.action in ["create", "login", "check_email", "check_username", "verify_email"]:
            return [AllowAny()]
        # LISTAR usuarios solo si está autenticado
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """
        POST /api/users/

        Crear nuevo usuario (REGISTRO).
        Angular envía: {name, email, password, confirmPassword}
        Django devuelve: {message, user}
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        user = User.objects.get(email=request.data["email"])

        send_verification_email(
            user_email=user.email,
            verification_token=user.verification_token,
            user_name=user.name
        )

        return Response(
            {
                "message": "Usuario creado exitosamente. Por favor, inicia sesión.",
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        """
        POST /api/users/login/

        INICIAR SESIÓN - Devuelve JWT tokens.

        Request body:
        {
            "email": "user@email.com",
            "password": "1234"
        }

        Response (200):
        {
            "message": "Inicio de sesión exitoso",
            "user": {
                "id": 1,
                "name": "usuario123",
                "email": "user@email.com"
            },
            "tokens": {
                "access": "eyJ0eXAi...",  ← Usar en cada solicitud
                "refresh": "eyJ0eXAi..."  ← Usar para renovar token
            }
        }

        ¿CÓMO FUNCIONA?
        1. Angular envía email + contraseña
        2. Django verifica que la contraseña sea correcta
        3. Genera JWT tokens (access + refresh)
        4. Angular guarda el token en localStorage
        5. Cada solicitud futura incluye: Authorization: Bearer <access_token>
        """
        email = request.data.get("email")
        password = request.data.get("password")

        # Validar que ambos campos estén presentes
        if not email or not password:
            return Response(
                {
                    "error": "Email y contraseña son requeridos",
                    "code": "MISSING_CREDENTIALS",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Buscar usuario por email
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "error": "Email o contraseña incorrectos",
                    "code": "INVALID_CREDENTIALS",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Verificar contraseña
        # check_password() compara la contraseña ingresada con el hash guardado
        if not check_password(password, user.password):
            return Response(
                {
                    "error": "Email o contraseña incorrectos",
                    "code": "INVALID_CREDENTIALS",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ¿Es es el usuario está activo?
        if not user.is_active:
            return Response(
                {
                    "error": "Usuario inactivo. Por favor, verifica tu email.",
                    "code": "USER_INACTIVE",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Generar JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Inicio de sesión exitoso",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "created_at": user.created_at,
                },
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get", "put", "patch"],
        permission_classes=[IsAuthenticated],
    )
    def profile(self, request):
        """
        GET /api/users/profile/ -> Obtener datos
        PUT/PATCH /api/users/profile/-> Actualizar datos (ej. nombre)
        """
        user = request.user

        if request.method == "GET":
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            serializer = UserUpdateSerializer(
                user, data=request.data, partial=True, context={"request": request}
            )

            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "message": "Perfil actualizado correctamente",
                        "user": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def verify_email(self, request):
        """
        POST /api/users/verify_email/

        Verificar email usando el token.

        Request body:
        {
            "token": "abc123def456..."
        }

        Response (200):
        {
            "message": "Email verificado exitosamente",
            "user": {...}
        }

        Errors:
        - 400: Token no proporcionado
        - 404: Token inválido o expirado
        """
        token = request.data.get("token")

        if not token:
            return Response(
                {"error": "Token requerido", "code": "MISSING_TOKEN"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(verification_token=token)
        except User.DoesNotExist:
            return Response(
                {"error": "Token inválido o expirado", "code": "INVALID_TOKEN"},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.email_verified = True
        user.is_active = True
        user.verification_token = None  # Eliminar token después de usar
        user.save()

        return Response(
            {
                "message": "Email verificado exitosamente",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def check_email(self, request):
        """
        Endpoint custom para verificar si un email ya existe.

        Uso desde Angular:
        POST /api/users/check_email/ con body: {"email": "test@email.com"}
        """
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email requerido"}, status=status.HTTP_400_BAD_REQUEST
            )

        exists = User.objects.filter(email=email).exists()
        return Response({"email_exists": exists}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def check_username(self, request):
        """
        Endpoint custom para verificar si un username ya existe.

        Uso desde Angular:
        POST /api/users/check_username/ con body: {"name": "usuario123"}
        """
        name = request.data.get("name")
        if not name:
            return Response(
                {"error": "Nombre de usuario requerido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exists = User.objects.filter(name=name).exists()
        return Response({"username_exists": exists}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """
        POST /api/users/change_password/
        """
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            if not user.check_password(old_password):
                return Response(
                    {"error": "La contraseña actual es incorrecta."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(new_password)
            user.save()

            return Response(
                {"message": "Contraseña actualizada correctamente."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
