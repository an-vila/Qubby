import qrcode
import base64
from io import BytesIO
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, permission_classes
from .models import Box
from .serializers import BoxSerializer

class BoxViewSet(viewsets.ModelViewSet):
    serializer_class = BoxSerializer
    permission_classes = [IsAuthenticated]

    # Proteccion para que cada usuario vea solo sus cajas
    def get_queryset(self):
        return Box.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        print(f"DEBUG: Intentando crear caja para el usuario: {self.request.user}")
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get"])
    def qrcode(self, request, pk=None):
        box = self.get_object()

        qr_data = f"http://192.168.86.102:4200/box/{box.id}/scan"

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(qr_data)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buffer = BytesIO()
        img.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return Response({"qr_image": f"data:image/png;base64,{img_base64}"})

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def verify_pin(self, request, pk=None):
        """
        POST /api/boxes/{id}/verify_pin/
        Recibe {"pin": "1234"} y devuelve si es correcto o no.
        """
        box = get_object_or_404(Box, pk=pk)
        pin = str(request.data.get("pin")).strip()

        if not getattr(
            box, "is_protected", False
        ):
            return Response({"success": True, "message": "Sin protección"})

        if check_password(pin, box.pin):
            return Response({"success": True, "message": "PIN correcto"})
        else:
            return Response({"success": False, "error": "PIN incorrecto"}, status=400)
