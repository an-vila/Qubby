from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

# Chicos, a ultima hora he visto que en un merge se han perdido las views para restablecer contraseñas 
# y he tenido que arreglarlo a ultima hora
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

from django.conf import settings

from .models import User
from .serializers import UserSerializer, UserUpdateSerializer, ChangePasswordSerializer
from .email_utils import send_verification_email, send_password_reset_email


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar las operaciones CRUD de usuarios.
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
        if self.action in ["create", "login", "check_email", "check_username", "verify_email", "request_password_reset", "reset_password"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """
        POST /api/users/
        Endpoint para crear nuevo usuario.
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
        Endpoint para realizar el login
        """
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {
                    "error": "Email y contraseña son requeridos",
                    "code": "MISSING_CREDENTIALS",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "error": "Email o contraseña incorrectos",
                    "code": "INVALID_CREDENTIALS",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # check_password() compara la contraseña ingresada con el hash guardado
        if not check_password(password, user.password):
            return Response(
                {
                    "error": "Email o contraseña incorrectos",
                    "code": "INVALID_CREDENTIALS",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {
                    "error": "Usuario inactivo. Por favor, verifica tu email.",
                    "code": "USER_INACTIVE",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

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
        PUT/PATCH /api/users/profile/-> Actualizar datos
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
        Endpoint para verificar email usando el token.
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
        user.verification_token = None
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
        """
        name = request.data.get("name")
        if not name:
            return Response(
                {"error": "Nombre de usuario requerido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exists = User.objects.filter(name=name).exists()
        return Response({"username_exists": exists}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def request_password_reset(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "El email es requerido"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()

        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            base_url = settings.FRONTEND_URL.rstrip('/')
            reset_url = f"{base_url}/auth/reset/{uid}/{token}"

            send_password_reset_email(
                user_email=user.email, user_name=user.name, reset_link=reset_url
            )

            return Response({"message": "Si el email existe, recibirás instrucciones en breve."})

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def reset_password(self, request):
        """
        POST /api/users/reset_password/
        Endpoint para guardar la nueva contraseña usando el link del correo.
        """
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not uidb64 or not token or not new_password:
            return Response(
                {"error": "Faltan datos para restablecer la contraseña."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "Contraseña restablecida correctamente."},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "El enlace no es válido o ya ha sido utilizado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """
        POST /api/users/change_password/
        Endpoint para cambiar la contraseña
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
