from datetime import date

from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q, Sum

from .models import Especialidade, Profissional, Paciente, Atendimento
from .serializers import (
    LoginSerializer,
    UserSerializer,
    EspecialidadeSerializer,
    ProfissionalReadSerializer,
    ProfissionalWriteSerializer,
    PacienteSerializer,
    AtendimentoReadSerializer,
    AtendimentoWriteSerializer,
)


# ── Auth ─────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]
    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    })


@api_view(["POST"])
def refresh_view(request):
    token = request.data.get("refresh")
    if not token:
        return Response({"detail": "Refresh token obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        refresh = RefreshToken(token)
        return Response({"access": str(refresh.access_token)})
    except Exception:
        return Response({"detail": "Token inválido."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


# ── Dashboard ────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    hoje = date.today()
    return Response({
        "total_pacientes": Paciente.objects.count(),
        "total_profissionais": Profissional.objects.filter(ativo=True).count(),
        "atendimentos_hoje": Atendimento.objects.filter(data_hora__date=hoje).count(),
        "atendimentos_por_tipo": list(
            Atendimento.objects.values("tipo").annotate(total=Count("id"))
        ),
        "atendimentos_por_status": list(
            Atendimento.objects.values("status").annotate(total=Count("id"))
        ),
        "receita_total": Atendimento.objects.filter(
            status="concluido"
        ).aggregate(total=Sum("valor"))["total"] or 0,
    })


# ── Especialidade ────────────────────────────────────────────────────────────

class EspecialidadeViewSet(viewsets.ModelViewSet):
    queryset = Especialidade.objects.all()
    serializer_class = EspecialidadeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "area"]
    ordering_fields = ["nome", "area"]


# ── Profissional ─────────────────────────────────────────────────────────────

class ProfissionalViewSet(viewsets.ModelViewSet):
    queryset = Profissional.objects.select_related("especialidade").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["especialidade", "ativo", "turno"]
    search_fields = ["nome", "registro"]
    ordering_fields = ["nome"]

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return ProfissionalReadSerializer
        return ProfissionalWriteSerializer


# ── Paciente ─────────────────────────────────────────────────────────────────

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["sexo", "convenio"]
    search_fields = ["nome_completo", "cpf"]
    ordering_fields = ["nome_completo", "data_nascimento"]


# ── Atendimento ──────────────────────────────────────────────────────────────

class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.select_related("paciente", "profissional__especialidade").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["tipo", "status", "paciente", "profissional"]
    search_fields = ["paciente__nome_completo", "profissional__nome", "diagnostico"]
    ordering_fields = ["data_hora", "valor"]

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return AtendimentoReadSerializer
        return AtendimentoWriteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        data = self.request.query_params.get("data")
        if data:
            qs = qs.filter(data_hora__date=data)
        return qs
