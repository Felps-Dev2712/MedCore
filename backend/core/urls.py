from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("especialidades", views.EspecialidadeViewSet)
router.register("profissionais", views.ProfissionalViewSet)
router.register("pacientes", views.PacienteViewSet)
router.register("atendimentos", views.AtendimentoViewSet)

urlpatterns = [
    path("auth/login/", views.login_view),
    path("auth/refresh/", views.refresh_view),
    path("auth/me/", views.me_view),
    path("dashboard/", views.dashboard_view),
    path("", include(router.urls)),
]
