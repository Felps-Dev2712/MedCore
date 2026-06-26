# MedCore System

Sistema Integrado de Gestão Hospitalar — inspirado em plataformas HIS como o Tasy (Philips).

Aplicação full stack composta por uma API RESTful (Django REST Framework) e uma interface web SPA (Angular), com autenticação JWT, CRUD completo de 4 entidades, dashboard com indicadores e layout responsivo.

## Tecnologias

| Camada   | Stack                                                       |
|----------|-------------------------------------------------------------|
| Backend  | Python 3.12, Django 5.2, Django REST Framework, SimpleJWT   |
| Frontend | Angular 22, TypeScript, SCSS                                |
| Banco    | SQLite (persistido via Docker volume)                       |
| Infra    | Docker, Docker Compose, Nginx, Gunicorn                     |
| Docs API | Swagger/OpenAPI via drf-spectacular                         |

## Funcionalidades

- **Dashboard** com KPIs: total de pacientes, profissionais ativos, atendimentos do dia e receita
- **Pacientes** — CRUD completo com busca por nome/CPF
- **Profissionais** — CRUD com vínculo a especialidades e filtros por turno/status
- **Especialidades** — CRUD simples com busca
- **Atendimentos** — CRUD com filtros por data, status e tipo; vínculo paciente + profissional
- **Autenticação JWT** — login, refresh token, proteção de rotas
- **Paginação** em todas as listagens
- **Layout responsivo** — sidebar colapsável em mobile
- **Feedback visual** — toasts de sucesso/erro, diálogos de confirmação, loading spinners

## Instalação e Execução

### Pré-requisitos

- Docker 24+
- Docker Compose V2 (incluído no Docker Desktop e no `docker-cli-plugin`)

### Subir o sistema

```bash
docker compose up --build
```

Na primeira execução o entrypoint do backend roda automaticamente:
1. `migrate` — cria as tabelas no SQLite
2. `seed` — popula o banco com dados de exemplo (8 especialidades, 8 profissionais, 10 pacientes, 30 atendimentos)

Após o build, o sistema fica disponível em:

| Serviço           | URL                              |
|-------------------|----------------------------------|
| Aplicação (SPA)   | `http://<IP>`                    |
| Swagger UI        | `http://<IP>/api/docs/`          |
| Django Admin      | `http://<IP>/admin/`             |
| API direta        | `http://<IP>/api/`               |

**Credenciais padrão:** `admin` / `admin123`

> Substitua `<IP>` pelo IP da máquina host. Para descobrir: `hostname -I | awk '{print $1}'`

### Parar o sistema

```bash
docker compose down
```

### Resetar tudo (incluindo o banco)

```bash
docker compose down -v
```

Na próxima subida o seed será executado novamente, recriando os dados de exemplo.

## Variáveis de Ambiente

Configuráveis diretamente no `docker-compose.yml` ou via arquivo `.env` na raiz:

| Variável               | Padrão (compose)                 | Descrição                         |
|------------------------|----------------------------------|-----------------------------------|
| DJANGO_SECRET_KEY      | super-secret-change-me           | Chave secreta do Django           |
| DJANGO_DEBUG           | False                            | Modo debug                        |
| DJANGO_ALLOWED_HOSTS   | *                                | Hosts permitidos                  |
| CORS_ALLOWED_ORIGINS   | *                                | Origens CORS (`*` = todas)        |

## API — Endpoints

Todos os endpoints exigem autenticação JWT (header `Authorization: Bearer <token>`), exceto o login.

### Autenticação

| Método | Rota              | Descrição          |
|--------|-------------------|--------------------|
| POST   | /api/auth/login/  | Login (retorna JWT)|
| POST   | /api/auth/refresh/| Refresh token      |
| GET    | /api/auth/me/     | Dados do usuário   |

### Pacientes

| Método | Rota                          | Descrição                  |
|--------|-------------------------------|----------------------------|
| GET    | /api/pacientes/               | Listar (paginado)          |
| GET    | /api/pacientes/?search=Maria  | Buscar por nome ou CPF     |
| GET    | /api/pacientes/:id/           | Buscar por ID              |
| POST   | /api/pacientes/               | Cadastrar                  |
| PUT    | /api/pacientes/:id/           | Editar                     |
| DELETE | /api/pacientes/:id/           | Excluir                    |

### Profissionais

| Método | Rota                              | Descrição                    |
|--------|-----------------------------------|------------------------------|
| GET    | /api/profissionais/               | Listar (com especialidade)   |
| GET    | /api/profissionais/?ativo=true    | Filtrar por status           |
| GET    | /api/profissionais/:id/           | Buscar por ID                |
| POST   | /api/profissionais/               | Cadastrar                    |
| PUT    | /api/profissionais/:id/           | Editar                       |
| DELETE | /api/profissionais/:id/           | Excluir                      |

### Especialidades

| Método | Rota                      | Descrição       |
|--------|---------------------------|-----------------|
| GET    | /api/especialidades/      | Listar todos    |
| GET    | /api/especialidades/:id/  | Buscar por ID   |
| POST   | /api/especialidades/      | Cadastrar       |
| PUT    | /api/especialidades/:id/  | Editar          |
| DELETE | /api/especialidades/:id/  | Excluir         |

### Atendimentos

| Método | Rota                                    | Descrição            |
|--------|-----------------------------------------|----------------------|
| GET    | /api/atendimentos/                      | Listar (paginado)    |
| GET    | /api/atendimentos/?data=2026-06-26      | Filtrar por data     |
| GET    | /api/atendimentos/?status=agendado      | Filtrar por status   |
| GET    | /api/atendimentos/:id/                  | Buscar por ID        |
| POST   | /api/atendimentos/                      | Cadastrar            |
| PUT    | /api/atendimentos/:id/                  | Editar               |
| DELETE | /api/atendimentos/:id/                  | Excluir              |

### Dashboard

| Método | Rota             | Descrição                     |
|--------|------------------|-------------------------------|
| GET    | /api/dashboard/  | Indicadores e totalizadores   |

### Documentação Interativa

Swagger UI disponível em `http://<IP>/api/docs/`. Para autenticar:

1. Execute `POST /api/auth/login/` com as credenciais
2. Copie o campo `access` da resposta
3. Clique em **Authorize**, cole `Bearer <token>` e confirme

## Exemplos de Requisição

Os exemplos abaixo usam `curl` + `jq`. Substitua `<IP>` pelo IP da máquina host.

### Login e obter token

```bash
TOKEN=$(curl -s -X POST http://<IP>/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.access')
```

### Dashboard

```bash
curl -s http://<IP>/api/dashboard/ \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Listar Pacientes

```bash
curl -s http://<IP>/api/pacientes/ \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Buscar por nome

```bash
curl -s "http://<IP>/api/pacientes/?search=Maria" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Cadastrar Paciente

```bash
curl -s -X POST http://<IP>/api/pacientes/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "José da Silva",
    "cpf": "111.222.333-44",
    "data_nascimento": "1990-05-15",
    "sexo": "M",
    "telefone": "(11) 91234-5678"
  }' | jq .
```

### Editar Paciente

```bash
curl -s -X PUT http://<IP>/api/pacientes/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Maria Silva Santos",
    "cpf": "123.456.789-00",
    "data_nascimento": "1985-03-15",
    "sexo": "F",
    "telefone": "(11) 98888-0000"
  }' | jq .
```

### Excluir Paciente

```bash
curl -s -o /dev/null -w "HTTP %{http_code}" \
  -X DELETE http://<IP>/api/pacientes/11/ \
  -H "Authorization: Bearer $TOKEN"
```

### Cadastrar Atendimento

```bash
curl -s -X POST http://<IP>/api/atendimentos/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paciente": 1,
    "profissional": 1,
    "data_hora": "2026-06-27T10:00:00",
    "tipo": "consulta",
    "status": "agendado",
    "valor": "150.00"
  }' | jq .
```

### Filtrar Atendimentos por data

```bash
curl -s "http://<IP>/api/atendimentos/?data=2026-06-26" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

## Estrutura do Projeto

```
medcore/
├── backend/
│   ├── core/                  # App principal (models, views, serializers)
│   ├── medcore_api/           # Configuração Django (settings, urls)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── entrypoint.sh          # Migrations + seed automáticos
│   └── .env.example
├── frontend/
│   ├── src/app/
│   │   ├── core/              # Services, interceptors, guards
│   │   ├── shared/            # Componentes reutilizáveis
│   │   └── features/          # Páginas (dashboard, pacientes, etc.)
│   ├── Dockerfile             # Multi-stage build (Node → Nginx)
│   └── nginx.conf             # Proxy reverso /api/ → backend
├── docker-compose.yml
└── README.md
```
