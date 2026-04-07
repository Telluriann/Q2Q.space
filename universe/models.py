from django.db import models

class CelestialObject(models.Model):
    name = models.CharField(max_length=200)
    object_type = models.CharField(max_length=100, help_text="e.g., Human, Planet, Star, Galaxy")
    scale_order = models.IntegerField(help_text="Order in zoom sequence (1=Human, 2=Earth, etc.)")
    size_description = models.CharField(max_length=200, help_text="e.g., 1.7 meters or 105,700 light-years")
    distance_from_earth = models.CharField(max_length=200, default="0", help_text="e.g., 0, 93 million miles, etc.")
    description = models.TextField(help_text="Formation facts, interesting details")
    comparison = models.TextField(blank=True, null=True, help_text="e.g. 1 million Earths fit inside the Sun")
    image_url = models.URLField(blank=True, null=True, help_text="URL to an image or texture to use in 3D")
    base_color = models.CharField(max_length=20, default="#FFFFFF", help_text="Hex color or CSS color name for 3D representation")
    size_in_meters = models.FloatField(help_text="Approximate scale in meters for 3D engine positioning")

    class Meta:
        ordering = ['scale_order']

    def __str__(self):
        return self.name
