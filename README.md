# 🚀 Sistema Encantar - Gestão de ONGs# 🌟 Encantar - Sistema de Gestão de Atendimentos para ONGs# 🌟 Encantar - Sistema de Gestão de Atendimentos para ONGs# � Encantar - Sistema de Gestão de Atendimentos para ONGs



Sistema completo de gestão para ONGs com cadastro de beneficiários, controle de atendimentos, geração de PDFs e dashboard administrativo.



---Sistema completo para gerenciar atendimentos de ONGs com controle de beneficiários, itens, rotas e dashboard.



## ⚡ Setup Rápido (5 minutos)



### Windows---Sistema completo para gerenciar atendimentos de ONGs com controle de beneficiários, itens, rotas e dashboard.Sistema completo para gerenciar atendimentos de ONGs, com controle de beneficiários, itens, rotas e dashboard administrativo.

```powershell

# Setup COMPLETO automatizado

.\setup-windows.ps1

## 🚀 Quick Start

# Iniciar

.\scripts\start.ps1 up

```

### Pré-requisitos---## 🚀 Tecnologias Utilizadas

### Ubuntu/Linux

```bash- Docker + Docker Compose

# Dar permissão

chmod +x setup-ubuntu.sh



# Setup COMPLETO automatizado### Iniciar

./setup-ubuntu.sh

```bash## 🚀 Quick Start (5 minutos)### Backend

# Iniciar

./scripts/start.sh up# Windows (PowerShell)

```

.\scripts\start.ps1 up- **Node.js + TypeScript** - Runtime e tipagem forte

**Pronto!** Acesse: http://localhost:3000  

**Login:** `admin` | **Senha:** `admin123`



---# Linux/Mac### Pré-requisitos- **Express.js** - Framework web



## 📖 Documentaçãodocker-compose up -d



| Arquivo | Para quê? |```- Docker + Docker Compose- **PostgreSQL** - Banco de dados

|---------|-----------|

| `RAILWAY_DEPLOY.md` | Deploy na nuvem (Railway) |

| `setup-windows.ps1` | Setup automático Windows |

| `setup-ubuntu.sh` | Setup automático Ubuntu |Acesse:- **Prisma ORM** - Type-safe database access



---- **Frontend**: http://localhost:3000



## 🏗️ Arquitetura- **Backend**: http://localhost:3001### Iniciar- **JWT + Refresh Token** - Autenticação segura



```- **Usuário**: admin | **Senha**: admin123

┌─────────────┐      ┌──────────────┐      ┌─────────────┐

│   Next.js   │ ───> │  Express.js  │ ───> │ PostgreSQL  │```bash- **Helmet** - Middleware de segurança

│  Frontend   │      │   Backend    │      │  (na VPS)   │

│  (Docker)   │      │  (Docker)    │      │             │---

└─────────────┘      └──────────────┘      └─────────────┘

```docker-compose up- **Rate Limiting** - Proteção contra abuse



**Importante:** PostgreSQL roda **na máquina host**, não em Docker!## 🏗️ Stack Tecnológico



---```



## 🔧 Tecnologias- **Backend**: Node.js + TypeScript + Express + PostgreSQL + Prisma



### Backend- **Frontend**: Next.js 14 + React + Tailwind CSS + React Query### Frontend

- Node.js 18 + TypeScript

- Express.js + Prisma ORM- **DevOps**: Docker + Docker Compose

- PostgreSQL 15

- JWT + Refresh TokensAcesse:- **Next.js 14** - Framework React com App Router

- Puppeteer (geração de PDFs)

- Helmet + CORS + Rate Limiting---



### Frontend- **Frontend**: http://localhost:3000- **TypeScript** - Tipagem forte

- Next.js 14 (App Router)

- React 18 + TypeScript## 📋 Funcionalidades

- TailwindCSS + Radix UI

- React Query + Axios- **Backend**: http://localhost:3001- **Tailwind CSS** - Framework CSS utilitário

- React Hook Form + Zod

- [x] Autenticação JWT + Refresh Token

### DevOps

- Docker + Docker Compose- [x] CRUD Beneficiários, Itens, Rotas (com paginação)- **Usuário**: admin | **Senha**: admin123- **React Query** - Gerenciamento de estado e cache

- Railway (deploy)

- [x] Dashboard administrativo responsivo

---

- [x] Atendimentos vinculadas a rotas- **Axios** - Cliente HTTP

## 📁 Estrutura

- [x] Sistema de auditoria (criado/modificado por)

```

Encantar/- [x] Seed dados para desenvolvimento---

├── backend/           # API Node.js

│   ├── src/- [x] Segurança: JWT, Helmet, Rate Limiting, CORS

│   │   ├── controllers/

│   │   ├── services/### DevOps

│   │   ├── repositories/

│   │   └── routes/---

│   ├── prisma/

│   └── Dockerfile## 🏗️ Stack Tecnológico- **Docker + Docker Compose** - Containerização

│

├── frontend/          # App Next.js## 📁 Estrutura

│   ├── src/

│   │   ├── app/- **PostgreSQL 15 Alpine** - Banco em container

│   │   ├── components/

│   │   └── hooks/```

│   └── Dockerfile

│backend/          # Node.js + Express + Prisma**Backend**: Node.js + TypeScript + Express + PostgreSQL + Prisma  - **Volume Persistence** - Dados persistentes

├── scripts/           # Automação

├── setup-windows.ps1  # Setup Windows  ├── src/

├── setup-ubuntu.sh    # Setup Ubuntu

└── docker-compose.yml # Dev/Prod  │   ├── controllers/**Frontend**: Next.js 14 + React + Tailwind CSS + React Query  

```

  │   ├── services/

---

  │   ├── repositories/**DevOps**: Docker + Docker Compose## 📋 Funcionalidades

## 🎯 Comandos

  │   ├── middleware/

### Scripts Automatizados

  │   ├── routes/

```powershell

# Windows  │   └── utils/

.\scripts\start.ps1 check      # Verificar requisitos

.\scripts\start.ps1 up         # Iniciar desenvolvimento  └── prisma/---### ✅ Implementadas

.\scripts\start.ps1 prod-up    # Iniciar produção

.\scripts\start.ps1 logs       # Ver logs

.\scripts\start.ps1 down       # Parar

```frontend/         # Next.js 14 App Router



```bash  ├── src/

# Linux

./scripts/start.sh check  │   ├── app/## 📋 Funcionalidades- [x] Sistema de autenticação JWT + Refresh Token completo

./scripts/start.sh up

./scripts/start.sh prod-up  │   ├── components/

./scripts/start.sh logs

./scripts/start.sh down  │   ├── hooks/- [x] Interface de login com logo personalizado

```

  │   └── lib/

### Docker Manual

- [x] Autenticação JWT + Refresh Token- [x] Dashboard administrativo responsivo

```bash

# Desenvolvimento.env              # Variáveis de ambiente (seu arquivo pessoal)

docker-compose up -d

docker-compose logs -fdocker-compose.yml- [x] CRUD Beneficiários, Itens, Rotas (com paginação)- [x] CRUD completo de Beneficiários com paginação

docker-compose down

docker-compose.prod.yml

# Produção

docker-compose -f docker-compose.prod.yml up -dscripts/- [x] Dashboard administrativo responsivo- [x] CRUD completo de Itens com paginação

docker-compose -f docker-compose.prod.yml logs -f

docker-compose -f docker-compose.prod.yml down  └── start.ps1   # Script simplificado para Windows

```

```- [x] Atendimentos vinculadas a rotas- [x] CRUD completo de Rotas com paginação

### Backend



```bash

cd backend---- [x] Sistema de auditoria (criado/modificado por)- [x] Sistema de atendimentos vinculadas a rotas

npm run dev              # Desenvolvimento

npm run build            # Build produção

npm start                # Rodar produção

npx prisma migrate dev   # Nova migration## 🔧 Comandos- [x] Seed dados para desenvolvimento- [x] Seed de dados para desenvolvimento

npx prisma studio        # Interface visual do banco

```



### Frontend### Docker Compose (Recomendado)- [x] Segurança: JWT, Helmet, Rate Limiting, CORS- [x] Middleware de segurança e tratamento de erros



```bash

cd frontend

npm run dev              # Desenvolvimento**Windows (PowerShell)**- [x] Schema completo do banco de dados

npm run build            # Build produção

npm start                # Rodar produção```powershell

npm run lint             # Linting

```.\scripts\start.ps1 up        # Iniciar tudo---- [x] Containerização com Docker



---.\scripts\start.ps1 down      # Parar tudo



## 🗄️ Banco de Dados.\scripts\start.ps1 logs      # Ver logs- [x] Scripts de automação PowerShell



### PostgreSQL na Máquina (Recomendado).\scripts\start.ps1 dev       # Dev: postgres + npm run dev (2 terminais)



**Windows:**.\scripts\start.ps1 status    # Status containers## 📁 Estrutura

```powershell

# Instalar via Chocolatey.\scripts\start.ps1 restart   # Reiniciar

choco install postgresql

.\scripts\start.ps1 build     # Rebuild imagens### 🔄 Em Desenvolvimento

# Ou baixar: https://www.postgresql.org/download/windows/

``````



**Ubuntu:**```

```bash

sudo apt update**Linux/Mac**

sudo apt install postgresql postgresql-contrib

sudo systemctl start postgresql```bashbackend/- [ ] Sistema de templates PDF

```

docker-compose up -d          # Iniciar tudo

**Configurar:**

```sqldocker-compose down           # Parar tudo  ├── src/- [ ] Métricas avançadas no dashboard

# Conectar

psql -U postgresdocker-compose logs -f        # Ver logs



# Criar databasedocker-compose restart        # Reiniciar  │   ├── controllers/- [ ] Sistema de relatórios

CREATE DATABASE encantar;

```

# Alterar senha (opcional)

ALTER USER postgres PASSWORD 'sua_senha';  │   ├── services/- [ ] Notificações push

```

### NPM Scripts (Desenvolvimento local)

**Conectar:**

- Desenvolvimento: `postgresql://postgres:postgres@localhost:5432/encantar`  │   ├── repositories/- [ ] Sistema de backup automático

- Produção: `postgresql://postgres:senha@IP_DA_VPS:5432/encantar`

```bash

---

npm run dev                   # Backend + Frontend simultâneo (2 terminais)  │   ├── middleware/

## 🌐 Deploy

npm run build                 # Compila backend + frontend

### Opção 1: Railway (Recomendado) ☁️

npm run lint                  # Lint em ambos projetos  │   ├── routes/## � **Execução com Docker (Recomendado)**

**Vantagens:**

- Deploy automático via Gitnpm run test                  # Testa ambos projetos

- PostgreSQL gerenciado

- SSL/HTTPS grátis```  │   └── utils/

- $5 créditos/mês grátis



**Guia completo:** 👉 `RAILWAY_DEPLOY.md`

### Sem Docker (Desenvolvimento)  └── prisma/### **Pré-requisitos**

### Opção 2: VPS Manual 🖥️



1. **Instalar requisitos:**

```bash**Terminal 1 - Backend**- Docker

# Docker

curl -fsSL https://get.docker.com -o get-docker.sh```bash

sudo sh get-docker.sh

cd backendfrontend/- Docker Compose

# PostgreSQL

sudo apt install postgresql postgresql-contribnpm install

```

npx prisma migrate dev  ├── src/

2. **Clonar projeto:**

```bashnpm run dev

git clone https://github.com/WillianFilipeSilva/Encantar.git

cd Encantar```  │   ├── app/### **🚀 Comandos Principais**

```



3. **Configurar `.env`:**

```bash**Terminal 2 - Frontend**  │   ├── components/

nano .env

# Ajustar DATABASE_URL, FRONTEND_URL, NEXT_PUBLIC_API_URL```bash

```

cd frontend  │   ├── hooks/```powershell

4. **Deploy:**

```bashnpm install

docker-compose -f docker-compose.prod.yml up -d

```npm run dev  │   └── lib/# Iniciar o projeto completo



---```



## 🔐 Segurançadocker-compose up -d



- ✅ JWT com refresh tokens---

- ✅ Bcrypt para senhas

- ✅ Helmet (headers seguros)docker-compose.yml

- ✅ CORS configurado

- ✅ Rate limiting## 🌐 API Endpoints Principais

- ✅ HTML sanitization (XSS)

- ✅ SQL injection protection (Prisma)```# Parar o projeto

- ✅ Input validation (express-validator + zod)

```

---

POST   /api/auth/login              # Logindocker-compose down

## 🛠️ Troubleshooting

GET    /api/beneficiarios           # Listar beneficiários

### "Erro ao conectar no banco"

```bashPOST   /api/beneficiarios           # Criar beneficiário---

# Verificar se PostgreSQL está rodando

# WindowsPUT    /api/beneficiarios/:id       # Atualizar

Get-Service postgresql*

DELETE /api/beneficiarios/:id       # Deletar# Ver status dos containers

# Linux

sudo systemctl status postgresql



# Testar conexãoGET    /api/items                   # Listar itens## 🔧 Comandosdocker ps

psql -U postgres -h localhost

```GET    /api/rotas                   # Listar rotas



### "Docker não inicia"GET    /api/dashboard               # Dashboard

```bash

# Verificar requisitosGET    /health                      # Health check

.\scripts\start.ps1 check  # Windows

./scripts/start.sh check   # Linux```### Docker# Ver logs



# Verificar se Docker está rodando

docker info

```---```bashdocker logs encantar-frontend



### "CORS error"

- Verifique `FRONTEND_URL` no backend (`.env`)

- Deve ser exatamente a URL do frontend## 🔐 Segurança Implementadadocker-compose up              # Iniciardocker logs encantar-backend

- Sem `/api` no final



### "Build falhou"

```bash- JWT + Refresh Token (15m access, 7d refresh)docker-compose down            # Parardocker logs encantar-db

# Limpar e reinstalar

rm -rf node_modules- Rate Limiting (100 req/15min geral, 5/hora auth)

npm install

- Helmet (headers de segurança)docker-compose logs -f         # Ver logs```

# Rebuild Docker

docker-compose build --no-cache- CORS configurado

```

- Senhas com bcryptdocker ps                      # Status containers

---

- Proteção XSS + CSRF

## 📊 Features

- Sanitização de inputs (templates)```### **🤖 Script PowerShell Automatizado**

- ✅ Cadastro de beneficiários com foto

- ✅ Controle de atendimentos (entregas)

- ✅ Gestão de itens e modelos

- ✅ Rotas de entrega---

- ✅ Dashboard com estatísticas

- ✅ Geração de PDFs (relatórios)

- ✅ Autenticação JWT

- ✅ Multi-usuários (administradores)## 🐳 Produção### Backend (sem Docker)Criamos um script `docker.ps1` para facilitar o gerenciamento:

- ✅ Logs de auditoria

- ✅ Responsivo (mobile-friendly)



---```bash```bash



## 🧪 Dados de Teste# Configurar .env



Após o primeiro setup, o sistema cria automaticamente:DATABASE_URL="postgresql://user:pass@host:5432/db"cd backend```powershell

- **Admin:** `admin` / `admin123`

- 10 beneficiários de testeJWT_SECRET="chave-forte-min-32-chars"

- 5 itens de teste

- 3 rotas de testeJWT_REFRESH_SECRET="chave-forte-min-32-chars"npm install# Iniciar projeto

- 20 atendimentos de teste

NODE_ENV="production"

**Desabilitar em produção:** `ENABLE_SEED=false` no `.env`

npx prisma migrate dev.\docker.ps1 start

---

# Deploy

## 🚦 Status do Projeto

docker-compose -f docker-compose.prod.yml up -dnpm run dev

- ✅ Backend completo e funcional

- ✅ Frontend completo e funcional```

- ✅ Docker configurado

- ✅ Railway pronto```# Parar projeto

- ✅ Scripts de automação

- ✅ Documentação completa---



**Pronto para produção!** 🚀.\docker.ps1 stop



---## 🆘 Troubleshooting



## 📝 Configuração `.env`### Frontend (sem Docker)



```env**Porta em uso?**

# Banco de dados (PostgreSQL na máquina)

DATABASE_URL="postgresql://postgres:senha@localhost:5432/encantar"```powershell```bash# Reiniciar projeto



# JWT (gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")# Windows - parar por porta

JWT_SECRET="sua_chave_64_caracteres_aqui"

JWT_REFRESH_SECRET="outra_chave_64_caracteres_aqui"netstat -ano | findstr :3000cd frontend.\docker.ps1 restart



# URLstaskkill /PID <PID> /F

FRONTEND_URL="http://localhost:3000"  # Ou IP/DNS em produção

NEXT_PUBLIC_API_URL="http://localhost:3001/api"npm install



# Configurações# Linux/Mac

NODE_ENV="development"  # ou "production"

ENABLE_SEED="true"      # false em produçãolsof -i :3000 | awk 'NR==2 {print $2}' | xargs kill -9npm run dev# Reset completo (limpa dados)

```

```

---

```.\docker.ps1 reset

## 📞 Contato

**Erro conexão banco?**

**Desenvolvedor:** Willian Filipe Silva  

**Repositório:** https://github.com/WillianFilipeSilva/Encantar  ```bash

**Branch:** develop-troca-entrega-atendimento

docker-compose restart postgres

---

```---# Ver status

## 📄 Licença



Projeto privado para uso interno.

**Limpar tudo (reseta dados)**.\docker.ps1 status

---

```bash

## 🎉 Começar Agora

docker-compose down -v## 🌐 API Endpoints

**Desenvolvimento local:**

```powershelldocker-compose up -d

# Windows

.\setup-windows.ps1```# Ver logs

.\scripts\start.ps1 up



# Linux

./setup-ubuntu.sh**Reconstruir imagens**```.\docker.ps1 logs

./scripts/start.sh up

``````bash



**Deploy na nuvem:**docker-compose build --no-cachePOST   /api/auth/login              # Login```

```bash

# Leia o guia completo```

cat RAILWAY_DEPLOY.md

```GET    /api/beneficiarios           # Listar beneficiários



**Boa sorte!** 💚---


POST   /api/beneficiarios           # Criar beneficiário## 🌐 **Acessos**

## 🔄 Fluxo de Desenvolvimento

PUT    /api/beneficiarios/:id       # Atualizar

1. **Setup inicial**: `docker-compose up -d`

2. **Desenvolver**: `npm run dev` (backend + frontend em 2 terminais)DELETE /api/beneficiarios/:id       # DeletarApós executar `docker-compose up -d`:

3. **Build**: `npm run build`

4. **Testar**: `npm run test`

5. **Produção**: `docker-compose -f docker-compose.prod.yml up -d`

GET    /api/items                   # Listar itens- **Frontend**: http://localhost:3000

---

POST   /api/items                   # Criar item- **Backend API**: http://localhost:3001

## 📦 Dados Iniciais (Seed)

PUT    /api/items/:id               # Atualizar- **Health Check**: http://localhost:3001/health

Ao iniciar com `ENABLE_SEED=true` no `.env`:

DELETE /api/items/:id               # Deletar- **Database**: localhost:5432

**Admin**

- Usuário: `admin`

- Senha: `admin123`

GET    /api/rotas                   # Listar rotas### **🔐 Credenciais Padrão**

**Itens**: Arroz, Feijão, Óleo, Açúcar, Macarrão

POST   /api/rotas                   # Criar rota- **Login**: `admin`

**Beneficiários**: Maria da Silva, João Santos, Ana Costa

PUT    /api/rotas/:id               # Atualizar- **Senha**: `admin123`

**Rotas**: Rota Centro, Rota Jardim

DELETE /api/rotas/:id               # Deletar

---

## 📊 Estrutura do Banco de Dados

## 📝 Notas

GET    /health                      # Health check

- `.env` é seu arquivo pessoal (não versionado em git)

- Scripts em `scripts/start.ps1` são apenas atalhos para docker-compose```### Entidades Principais

- Use `docker-compose` diretamente para máximo controle

- Logs estão em `backend/logs/` (Winston rotating)

- Migrações Prisma em `backend/prisma/migrations/`

---- **Administradores** - Usuários do sistema

---

- **Convites** - Sistema de cadastro via convite

**Desenvolvido para ONGs organizarem atendimentos de forma eficiente.** ❤️

## 🔐 Dados Iniciais- **Beneficiários** - Quem recebe as atendimentos

- **Itens** - Produtos cadastrados

**Admin**- **Atendimentos** - Lista de itens + quantidades para um beneficiário

- Usuário: `admin`- **AtendimentoItens** - Tabela de ligação (atendimento + item + quantidade)

- Senha: `admin123`- **Rotas** - Agrupamento de atendimentos por localidade

- **ModelosAtendimento** - Templates de atendimentos padrão

**Itens**: Arroz, Feijão, Óleo, Açúcar, Macarrão  

**Beneficiários**: Maria da Silva, João Santos, Ana Costa  ### Relacionamentos

**Rotas**: Rota Centro, Rota Jardim

- Um Beneficiário pode ter várias Atendimentos

---- Uma Atendimento pertence a um Beneficiário e uma Rota

- Uma Atendimento pode ter vários Itens (via AtendimentoItem)

## 🔒 Segurança- Uma Rota pode ter várias Atendimentos

- Sistema completo de auditoria (criado/modificado por)

- JWT + Refresh Token (15m access, 7d refresh)

- Rate Limiting (100 req/15min geral, 5/hora auth)## � API Endpoints

- Helmet (headers de segurança)

- CORS configurado### Autenticação

- Senhas com bcrypt```

- Proteção contra CSRF, XSSPOST   /api/auth/login          # Login

- SanitizeService (XSS prevention em templates)POST   /api/auth/register       # Registro via convite

POST   /api/auth/refresh        # Renovar token

---POST   /api/auth/logout         # Logout

GET    /api/auth/me             # Dados do usuário

## 🐳 ProduçãoPOST   /api/auth/invite         # Criar convite

GET    /api/auth/invite/:token  # Validar convite

```bash```

# Configurar .env

DATABASE_URL="postgresql://user:pass@host:5432/db"### Beneficiários

JWT_SECRET="chave-forte-min-32-chars"```

JWT_REFRESH_SECRET="chave-forte-min-32-chars"GET    /api/beneficiarios       # Listar com paginação

NODE_ENV="production"GET    /api/beneficiarios/:id   # Buscar por ID

PORT=3001POST   /api/beneficiarios       # Criar novo

FRONTEND_URL="https://seu-dominio.com"PUT    /api/beneficiarios/:id   # Atualizar

DELETE /api/beneficiarios/:id   # Remover

# Deploy```

docker-compose -f docker-compose.prod.yml up -d

```### Itens

```

---GET    /api/items              # Listar com paginação

GET    /api/items/:id          # Buscar por ID

## 🆘 TroubleshootingPOST   /api/items              # Criar novo

PUT    /api/items/:id          # Atualizar

**Porta em uso?**DELETE /api/items/:id          # Remover

```bash```

# Linux/Mac

lsof -i :3000### Rotas

kill -9 <PID>```

GET    /api/rotas              # Listar com paginação

# WindowsGET    /api/rotas/:id          # Buscar por ID

Get-Process | Where-Object {$_.Ports -eq 3000} | Stop-ProcessPOST   /api/rotas              # Criar nova

```PUT    /api/rotas/:id          # Atualizar

DELETE /api/rotas/:id          # Remover

**Erro conexão banco?**```

```bash

docker-compose restart postgres### Health Check

``````

GET    /health                 # Status do servidor

**Rebuild containers**```

```bash

docker-compose build --no-cache## 📁 Estrutura do Projeto

```

```

**Reset completo (limpa dados)**encantar/

```bash├── backend/

docker-compose down -v│   ├── src/

docker-compose up│   │   ├── controllers/        # Controllers da API

```│   │   ├── services/          # Lógica de negócio

│   │   ├── repositories/      # Acesso ao banco

---│   │   ├── middleware/        # Middlewares

│   │   ├── models/           # Interfaces e tipos

## 📦 Database Schema│   │   ├── routes/           # Definição de rotas

│   │   ├── utils/            # Utilitários

**Administradores** - Usuários  │   │   └── templates/        # Templates HTML

**Beneficiários** - Quem recebe atendimentos  │   ├── prisma/

**Itens** - Produtos cadastrados  │   │   ├── schema.prisma     # Schema do banco

**Atendimentos** - Lista itens para um beneficiário  │   │   ├── seed.ts          # Dados iniciais

**AtendimentoItens** - Tabela de ligação  │   │   └── migrations/      # Migrations do banco

**Rotas** - Agrupamento de atendimentos  │   ├── Dockerfile.dev       # Container de desenvolvimento

**ModelosAtendimento** - Templates de atendimentos│   └── package.json

├── frontend/

---│   ├── src/

│   │   ├── app/             # App Router do Next.js

## 🤝 Contribuição│   │   ├── components/      # Componentes React

│   │   ├── hooks/          # Custom hooks

1. Fork o repositório│   │   └── lib/            # Utilitários e configurações

2. Crie branch: `git checkout -b feature/xyz`│   ├── public/

3. Commit: `git commit -m 'Add xyz'`│   │   └── logo.jpg        # Logo da aplicação

4. Push: `git push origin feature/xyz`│   ├── Dockerfile.dev      # Container de desenvolvimento

5. Pull Request│   └── package.json

├── docker-compose.yml       # Orquestração dos containers

---├── docker.ps1             # Script PowerShell de automação

└── README.md

## 📄 Licença```



MIT License - veja LICENSE para detalhes## 🔧 Desenvolvimento Manual (Sem Docker)



---### Backend

```bash

**Desenvolvido com ❤️ para ajudar ONGs a gerenciarem atendimentos de forma eficiente.**cd backend

npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
Certifique-se de ter PostgreSQL rodando na porta 5432 com:
- Database: `encantar`
- User: `postgres`
- Password: `postgres`

## 🔧 Scripts de Manutenção

### Rebuild Containers
```powershell
# Rebuild específico
docker-compose build frontend
docker-compose build backend

# Rebuild completo
docker-compose build --no-cache
```

### Reset do Banco de Dados
```powershell
# Usando nosso script
.\docker.ps1 reset

# Ou manualmente
docker-compose down
docker volume rm encantar_postgres_data
docker-compose up -d
```

### Logs Detalhados
```powershell
# Ver logs em tempo real
docker-compose logs -f

# Logs específicos
docker logs encantar-frontend --tail 50
docker logs encantar-backend --tail 50
```

## 🎯 Dados de Exemplo

O sistema vem com dados pré-populados para facilitar o desenvolvimento:

### Administrador
- **Login**: `admin`
- **Senha**: `admin123`

### Itens de Exemplo
- Arroz (kg)
- Feijão (kg)
- Óleo (litro)
- Açúcar (kg)
- Macarrão (pacote)

### Beneficiários de Exemplo
- Maria da Silva
- João Santos
- Ana Costa

### Rotas de Exemplo
- Rota Centro
- Rota Jardim

## 🔐 Segurança Implementada

- **Autenticação JWT** com refresh tokens
- **Rate Limiting** (100 requests/15min geral, 5/hora para login)
- **Helmet** para headers de segurança
- **CORS** configurado
- **Senhas criptografadas** com bcrypt
- **Proteção contra CSRF, XSS e outros ataques**
- **Middleware de autenticação** em todas as rotas protegidas

## 🚀 Deploy e Produção

### Variáveis de Ambiente para Produção

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT
JWT_SECRET="strong-secret-for-production"
JWT_REFRESH_SECRET="strong-refresh-secret-for-production"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://yourdomain.com"
```

### Docker para Produção
```bash
# Build para produção
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## � Comandos de Desenvolvimento

```bash
# Backend
npm run dev              # Servidor de desenvolvimento
npm run build           # Build para produção
npm run prisma:studio   # Interface visual do banco
npm run prisma:seed     # Popular banco com dados

# Frontend
npm run dev             # Servidor de desenvolvimento
npm run build          # Build para produção
npm run lint           # Verificar código
```

## 🆘 Solução de Problemas

### Container não inicia
```powershell
# Verificar logs
docker logs encantar-backend
docker logs encantar-frontend

# Rebuild forçado
docker-compose build --no-cache
```

### Erro de conexão com banco
```powershell
# Verificar se banco está rodando
docker logs encantar-db

# Restart do banco
docker-compose restart postgres
```

### Frontend não carrega
```powershell
# Rebuild do frontend
docker-compose build frontend
docker-compose up -d frontend
```

## �📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**🎁 Desenvolvido com ❤️ para ajudar ONGs a gerenciarem suas atendimentos de forma eficiente e organizada.**
