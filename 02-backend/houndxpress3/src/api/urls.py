from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GuideViewSet,UserViewSet, EstatusViewSet

router = DefaultRouter()

router.register('guides', GuideViewSet, basename='guide')
router.register('users', UserViewSet, basename='user')
router.register('estatus', EstatusViewSet, basename='estatus')

urlpatterns = [
    path('', include(router.urls)),
]