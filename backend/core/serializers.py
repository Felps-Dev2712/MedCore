from rest_framework import serializers
from django.contrib.auth import authenticate

from .models import User, Especialidade, Profissional, Paciente, Atendimento


# ── Auth ─────────────────────────────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user or not user.is_active:
            raise serializers.ValidationError("Credenciais inválidas.")
        return {"user": user}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id"]


# ── Especialidade ────────────────────────────────────────────────────────────

class EspecialidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidade
        fields = "__all__"


# ── Profissional ─────────────────────────────────────────────────────────────

class ProfissionalReadSerializer(serializers.ModelSerializer):
    especialidade = EspecialidadeSerializer(read_only=True)

    class Meta:
        model = Profissional
        fields = "__all__"


class ProfissionalWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profissional
        fields = "__all__"


# ── Paciente ─────────────────────────────────────────────────────────────────

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = "__all__"


# ── Atendimento ──────────────────────────────────────────────────────────────

class AtendimentoReadSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer(read_only=True)
    profissional = ProfissionalReadSerializer(read_only=True)

    class Meta:
        model = Atendimento
        fields = "__all__"


class AtendimentoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atendimento
        fields = "__all__"
