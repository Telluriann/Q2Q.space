from rest_framework import serializers
from .models import CelestialObject

class CelestialObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = CelestialObject
        fields = '__all__'
