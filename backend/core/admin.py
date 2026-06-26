from django.contrib import admin
from .models import User, Especialidade, Profissional, Paciente, Atendimento

admin.site.register(User)
admin.site.register(Especialidade)
admin.site.register(Profissional)
admin.site.register(Paciente)
admin.site.register(Atendimento)
