from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import (
    EventViewSet,
    ParticipantViewSet,
    RegistrationViewSet,
    RegisterUserView,
    CurrentUserView,
)

router = DefaultRouter()
router.register(r"events", EventViewSet)
router.register(r"participants", ParticipantViewSet)
router.register(r"registrations", RegistrationViewSet)

def home(request):
    return HttpResponse("EventHub backend is running")

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/register/", RegisterUserView.as_view()),
    path("api/me/", CurrentUserView.as_view()),
    path("api/token/", TokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
]