from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BoxViewSet,
)  

router = DefaultRouter()
router.register(r"boxes", BoxViewSet, basename="box")

urlpatterns = [
    path("", include(router.urls)),
]
