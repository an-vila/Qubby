from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BoxViewSet, ItemViewSet
)  

router = DefaultRouter()
router.register(r"boxes", BoxViewSet, basename="box")
router.register(r"items", ItemViewSet, basename="item")

urlpatterns = [
    path("", include(router.urls)),
]
