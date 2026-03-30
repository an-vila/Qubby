from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Box, Item
from .serializers import BoxSerializer, ItemSerializer

class BoxViewSet(viewsets.ModelViewSet):
    serializer_class = BoxSerializer
    permission_classes = [IsAuthenticated]

    # Proteccion para que cada usuario vea solo sus cajas
    def get_queryset(self):
        return Box.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        print(f"DEBUG: Intentando crear caja para el usuario: {self.request.user}")
        serializer.save(user=self.request.user)
        
class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo items de cajas que pertenecen al usuario autenticado
        queryset = Item.objects.filter(box__user=self.request.user)

        # Si Angular envía ?box=<id>, filtramos por esa caja concreta
        box_id = self.request.query_params.get("box")
        if box_id:
            queryset = queryset.filter(box_id=box_id)

        return queryset

    def perform_create(self, serializer):
        # 1. Verificar que el frontend envía el campo "box"
        box_id = self.request.data.get("box")

        if not box_id:
            raise serializers.ValidationError(
                {"box": "Este campo es obligatorio."}
            )

        # 2. Verificar que la caja existe Y pertenece al usuario autenticado
        try:
            box = Box.objects.get(id=box_id, user=self.request.user)
        except Box.DoesNotExist:
            raise serializers.ValidationError(
                {"box": "La caja no existe o no te pertenece."}
            )

        # 3. Todo OK → guardar el item vinculado a esa caja
        serializer.save(box=box)