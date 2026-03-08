from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
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
