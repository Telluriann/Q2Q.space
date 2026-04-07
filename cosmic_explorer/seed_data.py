import os
import sys
sys.path.append('d:\\projects\\Project-cosmos')
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cosmic_explorer.settings')
django.setup()

from universe.models import CelestialObject

CelestialObject.objects.all().delete()

data = [
    {
        "name": "Human",
        "object_type": "Organism",
        "scale_order": 1,
        "size_description": "1.7 meters",
        "distance_from_earth": "0",
        "description": "The average height of a human being. The ultimate focal point and observer of the cosmos.",
        "comparison": "A human is roughly 1/7,500,000th the width of the Earth.",
        "size_in_meters": 1.7,
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        "name": "The Moon",
        "object_type": "Satellite",
        "scale_order": 2,
        "size_description": "3,474 km diameter",
        "distance_from_earth": "384,400 km",
        "description": "Earth's only natural satellite. It was formed 4.5 billion years ago, likely from a giant collision.",
        "comparison": "The Moon is about 1/4 the physical size of Earth. You could fit exactly 50 Moons inside the volume of the Earth.",
        "size_in_meters": 3.4e6,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
    },
    {
        "name": "Earth",
        "object_type": "Planet",
        "scale_order": 3,
        "size_description": "12,742 km diameter",
        "distance_from_earth": "0 kilometers",
        "description": "Our beautiful blue marble. The only astronomical object definitively known to harbor life in the universe.",
        "comparison": "It takes over 1.3 million Earths to fill the volume of the Sun.",
        "size_in_meters": 1.27e7,
        "image_url": "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        "name": "The Sun",
        "object_type": "Star",
        "scale_order": 4,
        "size_description": "1.39 million km diameter",
        "distance_from_earth": "149.6 million km",
        "description": "The yellow dwarf star at the center of our Solar System. Its gravity holds the entire system together.",
        "comparison": "The Sun accounts for an astounding 99.86% of the entire mass in the Solar System.",
        "size_in_meters": 1.39e9,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg"
    },
    {
        "name": "Betelgeuse",
        "object_type": "Red Supergiant",
        "scale_order": 5,
        "size_description": "1.2 billion km diameter",
        "distance_from_earth": "642.5 light-years",
        "description": "A rapidly-dying, massive red supergiant star in the constellation of Orion. It is expected to explode into a supernova.",
        "comparison": "If placed at the center of our solar system, Betelgeuse is so massive its surface would extend past the orbit of Jupiter.",
        "size_in_meters": 1.2e12,
        "image_url": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
        "name": "Milky Way",
        "object_type": "Spiral Galaxy",
        "scale_order": 6,
        "size_description": "100,000 light-years across",
        "distance_from_earth": "27,000 light-years (to center)",
        "description": "The sprawling barred spiral galaxy that contains our Solar System. The glowing band curving across our night sky is looking directly into its disk.",
        "comparison": "Contains between 100 to 400 billion stars. Despite this, our neighbor the Andromeda Galaxy is roughly 2.5 times larger.",
        "size_in_meters": 9.46e20,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/NGC_4414_%28NASA-med%29.jpg/1200px-NGC_4414_%28NASA-med%29.jpg"
    },
    {
        "name": "Observable Universe",
        "object_type": "The Cosmos",
        "scale_order": 7,
        "size_description": "93 billion light-years diameter",
        "distance_from_earth": "Everywhere",
        "description": "The spherical region of the universe comprising all matter that can be observed from Earth at the present time, limited by the speed of light.",
        "comparison": "Contains an estimated two trillion galaxies. The absolute size of the unobservable universe is likely astronomically larger, or completely infinite.",
        "size_in_meters": 8.8e26,
        "image_url": "https://images.unsplash.com/photo-1464802686167-b939a6910659?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
]

for d in data:
    CelestialObject.objects.create(**d)

print("Seed completed successfully!")
