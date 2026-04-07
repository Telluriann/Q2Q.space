from django.contrib import admin
from .models import CelestialObject

@admin.register(CelestialObject)
class CelestialObjectAdmin(admin.ModelAdmin):
    list_display = ('scale_order', 'name', 'object_type', 'size_description')
    ordering = ('scale_order',)
