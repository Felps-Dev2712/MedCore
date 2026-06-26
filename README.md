# MedCore System

Sistema Integrado de Gestão Hospitalar — inspirado em plataformas HIS como o Tasy (Philips).

Aplicação full stack composta por uma API RESTful (Django REST Framework) e uma interface web SPA (Angular), com autenticação JWT, CRUD completo de 4 entidades, dashboard com indicadores e layout responsivo.

## Tecnologias

| Camada   | Stack                                                       |
|----------|-------------------------------------------------------------|
| Backend  | Python 3.12, Django 5.2, Django REST Framework, SimpleJWT   |
| Frontend | Angular 22, TypeScript, SCSS                                |
| Banco    | SQLite (dev) — configurável via variáveis de ambiente       |
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

- Python 3.10+
- Node.js 22+
- npm 10+

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed  # cria usuário admin e dados de exemplo
python manage.py runserver
```

A API ficará disponível em `http://localhost:8000/api/`.

**Credenciais padrão:** `admin` / `admin123`

### Frontend

```bash
cd frontend
npm install
npx ng serve
```

A aplicação ficará disponível em `http://localhost:4200`.

### Docker Compose

```bash
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend: `http://localhost:8000`

## Variáveis de Ambiente

| Variável               | Padrão                                           | Descrição                    |
|------------------------|--------------------------------------------------|------------------------------|
| DJANGO_SECRET_KEY      | (insecure dev key)                               | Chave secreta do Django      |
| DJANGO_DEBUG           | True                                             | Modo debug                   |
| DJANGO_ALLOWED_HOSTS   | localhost,127.0.0.1                               | Hosts permitidos             |
| CORS_ALLOWED_ORIGINS   | http://localhost:4200,http://127.0.0.1:4200       | Origens CORS permitidas      |
| DB_ENGINE              | django.db.backends.sqlite3                        | Engine do banco de dados     |
| DB_NAME                | db.sqlite3                                        | Nome/caminho do banco        |

## API — Endpoints

Base URL: `http://localhost:8000/api/`

### Autenticação

| Método | Rota              | Descrição         |
|--------|-------------------|--------------------|
| POST   | /api/auth/login/  | Login (retorna JWT)|
| POST   | /api/auth/refresh/| Refresh token      |
| GET    | /api/auth/me/     | Dados do usuário   |

### Pacientes

| Método | Rota                 | Descrição       |
|--------|----------------------|-----------------|
| GET    | /api/pacientes/      | Listar todos    |
| GET    | /api/pacientes/:id/  | Buscar por ID   |
| POST   | /api/pacientes/      | Cadastrar       |
| PUT    | /api/pacientes/:id/  | Editar          |
| DELETE | /api/pacientes/:id/  | Excluir         |

### Profissionais

| Método | Rota                     | Descrição       |
|--------|--------------------------|-----------------|
| GET    | /api/profissionais/      | Listar todos    |
| GET    | /api/profissionais/:id/  | Buscar por ID   |
| POST   | /api/profissionais/      | Cadastrar       |
| PUT    | /api/profissionais/:id/  | Editar          |
| DELETE | /api/profissionais/:id/  | Excluir         |

### Especialidades

| Método | Rota                      | Descrição       |
|--------|---------------------------|-----------------|
| GET    | /api/especialidades/      | Listar todos    |
| GET    | /api/especialidades/:id/  | Buscar por ID   |
| POST   | /api/especialidades/      | Cadastrar       |
| PUT    | /api/especialidades/:id/  | Editar          |
| DELETE | /api/especialidades/:id/  | Excluir         |

### Atendimentos

| Método | Rota                             | Descrição          |
|--------|----------------------------------|--------------------|
| GET    | /api/atendimentos/               | Listar todos       |
| GET    | /api/atendimentos/:id/           | Buscar por ID      |
| GET    | /api/atendimentos/?data=YYYY-MM-DD | Filtrar por data |
| POST   | /api/atendimentos/               | Cadastrar          |
| PUT    | /api/atendimentos/:id/           | Editar             |
| DELETE | /api/atendimentos/:id/           | Excluir            |

### Dashboard

| Método | Rota             | Descrição                     |
|--------|------------------|-------------------------------|
| GET    | /api/dashboard/  | Indicadores e totalizadores   |

### Documentação Interativa

Swagger UI disponível em: `http://localhost:8000/api/docs/`

## Exemplos de Requisição

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Listar Pacientes (com token)

```bash
curl http://localhost:8000/api/pacientes/ \
  -H "Authorization: Bearer <access_token>"
```

### Cadastrar Paciente

```bash
curl -X POST http://localhost:8000/api/pacientes/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "José da Silva",
    "cpf": "111.222.333-44",
    "data_nascimento": "1990-05-15",
    "sexo": "M",
    "telefone": "(11) 91234-5678"
  }'
```

## Estrutura do Projeto

```
medcore/
├── backend/
│   ├── core/                  # App principal (models, views, serializers)
│   ├── medcore_api/           # Configuração Django (settings, urls)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/app/
│   │   ├── core/              # Services, interceptors, guards
│   │   ├── shared/            # Componentes reutilizáveis
│   │   └── features/          # Páginas (dashboard, pacientes, etc.)
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```
