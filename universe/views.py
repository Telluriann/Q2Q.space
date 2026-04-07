from django.shortcuts import render
from rest_framework import generics
from .models import CelestialObject
from .serializers import CelestialObjectSerializer

def index(request):
    objects = CelestialObject.objects.all().order_by('scale_order')
    return render(request, 'universe/index.html', {'objects': objects})

class CelestialObjectList(generics.ListAPIView):
    queryset = CelestialObject.objects.all().order_by('scale_order')
    serializer_class = CelestialObjectSerializer
