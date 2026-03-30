from rest_framework import serializers
from .models import Box, Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "description", "box", "created_at"]
        
class BoxSerializer(serializers.ModelSerializer):
    itemCount = serializers.IntegerField(source="items.count", read_only=True)
    items = ItemSerializer(many=True, read_only=True)
    class Meta:
        model = Box
        fields = ["id", "name", "created_at", "itemCount", "items"]
