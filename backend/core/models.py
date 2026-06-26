from django.db import models
from django.contrib.auth.models import AbstractUser


# ── User ─────────────────────────────────────────────────────────────────────

class User(AbstractUser):
    class Meta:
        db_table = "users"


# ── Especialidade ────────────────────────────────────────────────────────────

class Especialidade(models.Model):
    nome = models.CharField(max_length=120)
    descricao = models.TextField(blank=True, default="")
    area = models.CharField(max_length=120)

    class Meta:
        db_table = "especialidades"
        ordering = ["nome"]

    def __str__(self):
        return self.nome


# ── Profissional ─────────────────────────────────────────────────────────────

class Profissional(models.Model):
    class Turno(models.TextChoices):
        MANHA = "manha", "Manhã"
        TARDE = "tarde", "Tarde"
        NOITE = "noite", "Noite"
        INTEGRAL = "integral", "Integral"

    nome = models.CharField(max_length=200)
    registro = models.CharField(max_length=20, unique=True)
    especialidade = models.ForeignKey(
        Especialidade,
        on_delete=models.PROTECT,
        related_name="profissionais",
    )
    cargo = models.CharField(max_length=100)
    turno = models.CharField(max_length=10, choices=Turno.choices, default=Turno.INTEGRAL)
    telefone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    ativo = models.BooleanField(default=True)

    class Meta:
        db_table = "profissionais"
        ordering = ["nome"]

    def __str__(self):
        return f"{self.nome} ({self.registro})"


# ── Paciente ─────────────────────────────────────────────────────────────────

class Paciente(models.Model):
    class Sexo(models.TextChoices):
        MASCULINO = "M", "Masculino"
        FEMININO = "F", "Feminino"
        OUTRO = "O", "Outro"

    nome_completo = models.CharField(max_length=200)
    cpf = models.CharField(max_length=14, unique=True)
    data_nascimento = models.DateField()
    sexo = models.CharField(max_length=1, choices=Sexo.choices)
    telefone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    endereco = models.TextField(blank=True, default="")
    convenio = models.CharField(max_length=120, blank=True, default="")
    numero_carteirinha = models.CharField(max_length=30, blank=True, default="")

    class Meta:
        db_table = "pacientes"
        ordering = ["nome_completo"]

    def __str__(self):
        return self.nome_completo


# ── Atendimento ──────────────────────────────────────────────────────────────

class Atendimento(models.Model):
    class Tipo(models.TextChoices):
        CONSULTA = "consulta", "Consulta"
        EXAME = "exame", "Exame"
        INTERNACAO = "internacao", "Internação"

    class Status(models.TextChoices):
        AGENDADO = "agendado", "Agendado"
        EM_ANDAMENTO = "em_andamento", "Em andamento"
        CONCLUIDO = "concluido", "Concluído"
        CANCELADO = "cancelado", "Cancelado"

    paciente = models.ForeignKey(
        Paciente,
        on_delete=models.PROTECT,
        related_name="atendimentos",
    )
    profissional = models.ForeignKey(
        Profissional,
        on_delete=models.PROTECT,
        related_name="atendimentos",
    )
    data_hora = models.DateTimeField()
    tipo = models.CharField(max_length=12, choices=Tipo.choices)
    status = models.CharField(max_length=14, choices=Status.choices, default=Status.AGENDADO)
    diagnostico = models.TextField(blank=True, default="")
    observacoes = models.TextField(blank=True, default="")
    valor = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = "atendimentos"
        ordering = ["-data_hora"]

    def __str__(self):
        return f"Atendimento #{self.pk} - {self.paciente}"
