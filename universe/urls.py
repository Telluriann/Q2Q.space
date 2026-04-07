from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/objects/', views.CelestialObjectList.as_view(), name='api_objects_list'),
    # path
]


