from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Box, Item


class BoxSerializer(serializers.ModelSerializer):
    itemCount = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = Box
        fields = ["id", "name", "created_at", "is_protected", "pin", "itemCount"]
        extra_kwargs = {
            'pin': {'write_only': True}
        }

    def create(self, validated_data):
        if validated_data.get("pin"):
            validated_data["pin"] = make_password(validated_data["pin"])
        return super().create(validated_data)

class ItemSerializer(serializers.ModelSerializer):
    registrationDate = serializers.DateField(source="registration_date", read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Item
        fields = '__all__' 

        read_only_fields = ['registration_date']
