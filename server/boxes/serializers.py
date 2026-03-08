from rest_framework import serializers
from .models import Box


class BoxSerializer(serializers.ModelSerializer):
    itemCount = serializers.IntegerField(source="items.count", read_only=True)
    
    class Meta:
        model = Box
        fields = ["id", "name", "created_at", "itemCount"]
