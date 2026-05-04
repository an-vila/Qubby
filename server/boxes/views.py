import os
import qrcode
import base64
from io import BytesIO
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import check_password
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import (
    action,
)
from rest_framework.response import Response
from django.conf import settings

from .models import Box, Item
from .serializers import BoxSerializer, ItemSerializer

ip = os.getenv("IP", "localhost")


class BoxViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar las operaciones CRUD de las cajas.
    """
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
        """
        Crea un código QR único para una caja específica.
        """
        box = self.get_object()

        print(f"\n--- DEBUG QR URL: {settings.FRONTEND_URL} ---\n")

        qr_data = f"{settings.FRONTEND_URL}/box/{box.id}/scan"

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
        Endpoint para verificar el PIN de la caja.
        """
        box = get_object_or_404(Box, pk=pk)
        pin = str(request.data.get("pin")).strip()

        if not getattr(box, "is_protected", False):
            return Response({"success": True, "message": "Sin protección"})

        if check_password(pin, box.pin):
            return Response({"success": True, "message": "PIN correcto"})
        else:
            return Response({"success": False, "error": "PIN incorrecto"}, status=400)

    @action(detail=True, methods=["post"])
    def add_item(self, request, pk=None):
        """
        POST /api/boxes/{id}/add_item/
        Endpoint para añadir un item.
        """
        box = self.get_object()
        serializer = ItemSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(box=box)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar las operaciones CRUD de items.
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def get_queryset(self):
        """
        Define la consulta base para obtener los objetos del modelo.
        """
        box_id = self.request.query_params.get("box_id")
        if box_id:
            return self.queryset.filter(box_id=box_id)
        return self.queryset
