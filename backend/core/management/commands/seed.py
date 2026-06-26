from datetime import date, datetime, timedelta
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import User, Especialidade, Profissional, Paciente, Atendimento


class Command(BaseCommand):
    def handle(self, *args, **options):
        if User.objects.filter(username="admin").exists():
            self.stdout.write("Seed já executado.")
            return

        User.objects.create_superuser("admin", "admin@medcore.local", "admin123")

        especialidades_data = [
            ("Clínica Geral", "Atendimentos gerais e triagem", "Clínica"),
            ("Cardiologia", "Doenças do coração e sistema circulatório", "Clínica"),
            ("Ortopedia", "Sistema musculoesquelético", "Cirúrgica"),
            ("Pediatria", "Saúde infantil", "Clínica"),
            ("Dermatologia", "Pele, cabelos e unhas", "Clínica"),
            ("Neurologia", "Sistema nervoso", "Clínica"),
            ("Ginecologia", "Saúde da mulher", "Cirúrgica"),
            ("Oftalmologia", "Saúde ocular", "Cirúrgica"),
        ]

        especialidades = []
        for nome, desc, area in especialidades_data:
            especialidades.append(
                Especialidade.objects.create(nome=nome, descricao=desc, area=area)
            )

        profissionais_data = [
            ("Dr. Carlos Mendes", "CRM-12345", especialidades[0], "Médico", "integral"),
            ("Dra. Ana Souza", "CRM-23456", especialidades[1], "Médica", "manha"),
            ("Dr. Roberto Lima", "CRM-34567", especialidades[2], "Médico", "tarde"),
            ("Dra. Juliana Costa", "CRM-45678", especialidades[3], "Médica", "manha"),
            ("Dr. Fernando Alves", "CRM-56789", especialidades[4], "Médico", "tarde"),
            ("Dra. Mariana Rocha", "CRM-67890", especialidades[5], "Médica", "integral"),
            ("Enf. Patrícia Santos", "COREN-11111", especialidades[0], "Enfermeira", "noite"),
            ("Dr. Lucas Ferreira", "CRM-78901", especialidades[6], "Médico", "manha"),
        ]

        profissionais = []
        for nome, reg, esp, cargo, turno in profissionais_data:
            profissionais.append(
                Profissional.objects.create(
                    nome=nome, registro=reg, especialidade=esp,
                    cargo=cargo, turno=turno, telefone="(11) 99999-0000",
                    email=f"{nome.split()[0].lower()}@medcore.local", ativo=True,
                )
            )

        pacientes_data = [
            ("Maria Silva", "123.456.789-00", "1985-03-15", "F"),
            ("João Santos", "234.567.890-11", "1990-07-22", "M"),
            ("Ana Oliveira", "345.678.901-22", "1978-11-08", "F"),
            ("Pedro Costa", "456.789.012-33", "2000-01-30", "M"),
            ("Lucia Ferreira", "567.890.123-44", "1965-05-12", "F"),
            ("Carlos Pereira", "678.901.234-55", "1995-09-25", "M"),
            ("Fernanda Lima", "789.012.345-66", "1988-12-03", "F"),
            ("Ricardo Alves", "890.123.456-77", "1972-06-18", "M"),
            ("Beatriz Rocha", "901.234.567-88", "2005-04-09", "F"),
            ("Gabriel Mendes", "012.345.678-99", "1999-08-27", "M"),
        ]

        pacientes = []
        for nome, cpf, nasc, sexo in pacientes_data:
            pacientes.append(
                Paciente.objects.create(
                    nome_completo=nome, cpf=cpf,
                    data_nascimento=date.fromisoformat(nasc), sexo=sexo,
                    telefone="(11) 98888-0000", email=f"{nome.split()[0].lower()}@email.com",
                    endereco="São Paulo, SP",
                )
            )

        tipos = ["consulta", "exame", "internacao"]
        statuses = ["agendado", "em_andamento", "concluido", "cancelado"]
        now = timezone.now()

        for i in range(30):
            delta = timedelta(days=random.randint(-15, 15), hours=random.randint(8, 17))
            Atendimento.objects.create(
                paciente=random.choice(pacientes),
                profissional=random.choice(profissionais),
                data_hora=now + delta,
                tipo=random.choice(tipos),
                status=random.choice(statuses),
                diagnostico="Avaliação de rotina" if i % 3 == 0 else "",
                observacoes="",
                valor=Decimal(random.randint(80, 500)),
            )

        self.stdout.write(self.style.SUCCESS("Seed concluído com sucesso!"))
