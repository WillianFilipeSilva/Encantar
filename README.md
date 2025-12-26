<div align="center">
  <img src="frontend/public/logo.jpg" alt="Logo Projeto Encantar" width="200"/>
  
  # Sistema de Gestão de Atendimentos
  ### Projeto Encantar
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

  **Plataforma web full-stack desenvolvida para gestão completa de atendimentos a beneficiários**
</div>

---

## 📋 Sobre o Projeto

Sistema completo de gestão desenvolvido exclusivamente para o **Projeto Encantar**, uma ONG que realiza atendimentos a famílias em situação de vulnerabilidade social. A plataforma centraliza todo o fluxo operacional, desde o cadastro de beneficiários até a geração de relatórios para prestação de contas.

### 🎯 Funcionalidades Principais

- **👥 Gestão de Beneficiários**: Cadastro completo com dados pessoais, endereço e histórico
- **📦 Controle de Itens**: Gestão de doações com diferentes unidades de medida (KG, L, UN, CX, etc.)
- **🗺️ Planejamento de Rotas**: Organização de entregas por região e data
- **✅ Registro de Atendimentos**: Histórico completo de entregas realizadas com status
- **📄 Modelos de Atendimento**: Templates pré-configurados (cestas básicas padrão)
- **🖨️ Geração de PDF**: Relatórios profissionais para documentação e prestação de contas
- **📊 Dashboard Administrativo**: Métricas e estatísticas em tempo real
- **🔐 Sistema de Autenticação**: Login seguro com JWT e refresh tokens
- **👨‍💼 Sistema de Convites**: Cadastro controlado de novos administradores

### 🏗️ Arquitetura

O projeto segue uma arquitetura profissional em camadas com separação clara de responsabilidades:

**Backend (Express + Prisma + PostgreSQL)**
- **Repository Layer**: Acesso aos dados com Prisma ORM
- **Service Layer**: Lógica de negócio e regras
- **Controller Layer**: Endpoints REST e validações
- **Middleware**: Autenticação, validação, logs e tratamento de erros

**Frontend (Next.js 14 + React 18)**
- **App Router**: Roteamento moderno do Next.js
- **React Query**: Gerenciamento de estado e cache
- **React Hook Form + Zod**: Validação de formulários
- **Radix UI + Tailwind**: Componentes acessíveis e estilizados

### ✨ Diferenciais Técnicos

- ✅ **Clean Architecture** com padrões Repository e Service Layer
- ✅ **Auditoria completa** de todas as ações (quem criou/modificou)
- ✅ **Segurança robusta** com JWT, rate limiting e sanitização
- ✅ **Validação dupla** (backend + frontend)
- ✅ **Responsivo** para desktop, tablet e mobile
- ✅ **Docker** para deploy facilitado
- ✅ **TypeScript** em todo o projeto

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Next.js** | 14 | Framework React com App Router |
| **React** | 18 | Biblioteca para interfaces |
| **TypeScript** | 5.0 | Superset JavaScript tipado |
| **Tailwind CSS** | 3.4 | Framework CSS utility-first |
| **React Query** | 5.0 | Gerenciamento de estado e cache |
| **React Hook Form** | 7.49 | Gerenciamento de formulários |
| **Zod** | 3.22 | Validação de schemas |
| **Radix UI** | 1.0 | Componentes acessíveis |
| **Axios** | 1.6 | Cliente HTTP |

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 5.0 | Framework web |
| **Prisma** | 5.9 | ORM TypeScript-first |
| **PostgreSQL** | 17 | Banco de dados relacional |
| **JWT** | 9.0 | Autenticação stateless |
| **bcrypt** | 5.1 | Hash de senhas |
| **Express Validator** | 7.0 | Validação de requests |
| **Puppeteer** | 21.9 | Geração de PDF |
| **Winston** | 3.11 | Sistema de logs |
| **Helmet** | 7.1 | Segurança HTTP |

### DevOps & Infraestrutura
| Tecnologia | Descrição |
|------------|-----------|
| **Docker** | Containerização |
| **Docker Compose** | Orquestração local |
| **Coolify** | Plataforma de deploy |
| **Traefik** | Reverse proxy |
| **GitHub** | Versionamento |

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Git** (versionamento)
- **Node.js 18+** e **npm** (gerenciamento de pacotes)
- **Docker Desktop + Docker Compose** (recomendado para ambiente completo)
- **PostgreSQL local** (apenas se optar por rodar sem Docker)

---

## 🚀 Início Rápido

### Opção 1: Scripts Automatizados (Recomendado)

Os scripts criam arquivos `.env`, validam dependências e sobem o stack completo automaticamente.

#### Windows (PowerShell)
```powershell
# Validar ambiente (Node, Docker, portas)
./scripts/start.ps1 check

# Subir stack completo (backend + frontend + PostgreSQL)
./scripts/start.ps1 up

# Outros comandos disponíveis:
./scripts/start.ps1 logs        # Ver logs dos containers
./scripts/start.ps1 down        # Parar todos os containers
./scripts/start.ps1 build       # Rebuild dos containers
./scripts/start.ps1 restart     # Reiniciar containers
./scripts/start.ps1 status      # Status dos containers
./scripts/start.ps1 prod-up     # Subir em modo produção
```

#### Linux / WSL / macOS (bash)
```bash
# Validar ambiente
./scripts/start.sh check

# Subir stack completo
./scripts/start.sh up

# Outros comandos: logs | down | build | restart | status | prod-up
```

**Após iniciar os scripts:**
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:3001/api
- 📚 Swagger Docs: http://localhost:3001/api/docs
- 🔍 Health Check: http://localhost:3001/api/health

### Opção 2: Setup Manual (sem Docker)

Use quando quiser executar serviços isolados ou desenvolvimento sem containers.

#### 1. Clone o repositório
```bash
git clone https://github.com/WillianFilipeSilva/Encantar.git
cd Encantar
```

#### 2. Configure o Backend
```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (veja seção de Variáveis de Ambiente)
# Garanta um PostgreSQL em postgresql://postgres:postgres@localhost:5432/encantar

# Executar migrations
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# (Opcional) Rodar seeds para dados de exemplo
npm run prisma:seed

# Iniciar servidor de desenvolvimento
npm run dev
```
✅ Backend rodando em: **http://localhost:3001**

#### 3. Configure o Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Iniciar servidor de desenvolvimento
npm run dev
```
✅ Frontend rodando em: **http://localhost:3000**

---

## ⚙️ Variáveis de Ambiente

### Backend (`backend/.env`)
| Nome | Descricao | Exemplo |
| --- | --- | --- |
| DATABASE_URL | URL do PostgreSQL (use a URL privada na Railway) | `postgresql://user:pass@host:5432/db` |
| JWT_SECRET | Chave do access token (>=32 chars) | `e13f...` |
| JWT_REFRESH_SECRET | Chave do refresh token | `a7c4...` |
| JWT_EXPIRES_IN | Tempo de vida do access token | `15m` |
| JWT_REFRESH_EXPIRES_IN | Tempo de vida do refresh token | `7d` |
| FRONTEND_URL | Origem permitida para CORS/cookies | `https://projetoencantarbnu.com.br/` |
| NODE_ENV | Ambiente atual | `development` ou `production` |
| ENABLE_SEED | Controla execucao das seeds | `true` (dev) / `false` (prod) |

### Frontend (`frontend/.env.local`)
| Nome | Descrição | Exemplo |
| --- | --- | --- |
| NEXT_PUBLIC_API_URL | Endpoint do backend com `/api` | `http://localhost:3001/api` (dev) ou `https://projetoencantarbnu.com.br/api` (prod) |

### Exemplo de Arquivo `.env` (Backend)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/encantar"
JWT_SECRET="seu_secret_aqui_com_pelo_menos_32_caracteres"
JWT_REFRESH_SECRET="seu_refresh_secret_aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
ENABLE_SEED="true"
```

---

## 🌱 Seeds e Credenciais de Desenvolvimento

Quando `ENABLE_SEED=true`, o sistema cria automaticamente:

### Usuário Administrador Padrão
- **Login:** `admin`
- **Senha:** `admin123`

### Dados de Exemplo
- ✅ 10 beneficiários fictícios
- ✅ 15 itens de doação
- ✅ 5 rotas de atendimento
- ✅ 20 atendimentos completos

> ⚠️ **IMPORTANTE:** Defina `ENABLE_SEED=false` em produção para evitar dados fictícios!

---

## 🌐 Deploy em Produção

### Deploy com Coolify (Configuração Atual)

O projeto está configurado para deploy no Coolify com Traefik como reverse proxy.

**Requisitos:**
- Servidor Coolify configurado
- Docker instalado no servidor
- Domínio apontado para o servidor (ex: `projetoencantarbnu.com.br`)

**Passos:**

1. **Conectar Repositório**
   - Adicione o repositório GitHub no Coolify
   - Configure dois serviços: `backend` e `frontend`

2. **Configurar Backend**
   - Dockerfile: `backend/Dockerfile`
   - Port: `3001`
   - Health check: `http://localhost:3001/api/health`
   - Adicionar variáveis de ambiente (ver seção acima)

3. **Configurar Frontend**
   - Dockerfile: `frontend/Dockerfile`
   - Port: `3000`
   - Health check: `http://localhost:3000`
   - Variável: `NEXT_PUBLIC_API_URL=https://seu-dominio.com/api`

4. **Configurar Traefik Labels**
   - Backend: Priority 100, PathPrefix(`/api`)
   - Frontend: Priority 10, PathPrefix(`/`)

5. **Validar Deploy**
   - ✅ Backend: `https://seu-dominio.com/api/health`
   - ✅ Frontend: `https://seu-dominio.com`
   - ✅ Swagger: `https://seu-dominio.com/api/docs`

### Deploy Alternativo (Railway, Render, etc.)

O projeto também pode ser deployado em outras plataformas:

**Comandos de Build:**
- Backend: `npm install && npm run build`
- Frontend: `npm install && npm run build`

**Comandos de Start:**
- Backend: `npx prisma migrate deploy && node dist/index.js`
- Frontend: `npm start`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### ❌ Erro Prisma P1001/P1000 (Conexão com banco)
**Solução:** Verifique `DATABASE_URL` e encode senhas com caracteres especiais
```bash
# Exemplo com senha especial
postgresql://user:senha%40123@localhost:5432/db
```

#### ❌ CORS bloqueado
**Solução:** `FRONTEND_URL` deve ser exatamente a URL do frontend (sem `/api`)
```env
# ✅ Correto
FRONTEND_URL="http://localhost:3000"
# ❌ Errado
FRONTEND_URL="http://localhost:3000/api"
```

#### ❌ Cookies não sendo enviados
**Solução:** Use HTTPS em produção e confira `NEXT_PUBLIC_API_URL` com `/api`
```env
NEXT_PUBLIC_API_URL="https://seu-dominio.com/api"
```

#### ❌ PDF falhando fora do Docker
**Solução:** Instale dependências do Chromium ou rode via container
```bash
# Ubuntu/Debian
sudo apt-get install -y chromium-browser
```

#### ❌ Seeds rodando em produção
**Solução:** Confirme `ENABLE_SEED=false` no ambiente de produção

#### ❌ Porta 3001 ou 3000 já em uso
**Solução:** Pare processos usando as portas ou altere em `package.json`
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

---

## 📁 Estrutura do Projeto

```
Encantar/
├── backend/                      # Servidor Express + Prisma
│   ├── src/
│   │   ├── controllers/          # Controllers REST (camada de entrada)
│   │   ├── services/             # Lógica de negócio
│   │   ├── repositories/         # Acesso aos dados (Prisma)
│   │   ├── middleware/           # Auth, validação, erros
│   │   ├── routes/               # Definição de rotas
│   │   ├── models/               # DTOs e tipos
│   │   ├── swagger/              # Documentação OpenAPI
│   │   ├── utils/                # Logger, database, helpers
│   │   └── index.ts              # Entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Schema do banco
│   │   ├── migrations/           # Histórico de migrations
│   │   └── seed.ts               # Seeds de desenvolvimento
│   ├── logs/                     # Logs da aplicação
│   ├── Dockerfile                # Build produção
│   ├── Dockerfile.dev            # Build desenvolvimento
│   └── package.json
│
├── frontend/                     # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                  # Pages e layouts (App Router)
│   │   │   ├── (authenticated)/  # Páginas protegidas
│   │   │   ├── login/            # Página de login
│   │   │   ├── register/         # Página de registro
│   │   │   └── layout.tsx        # Layout raiz
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   ├── ui/               # Componentes base (Radix)
│   │   │   ├── CrudDialog.tsx    # Dialog CRUD genérico
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ...
│   │   ├── hooks/                # Hooks customizados
│   │   │   └── useAuth.ts        # Hook de autenticação
│   │   └── lib/                  # Configurações
│   │       ├── axios.ts          # Cliente HTTP
│   │       └── providers.tsx     # React Query provider
│   ├── public/                   # Assets estáticos
│   │   └── logo.jpg              # Logo do projeto
│   ├── Dockerfile                # Build produção
│   ├── Dockerfile.dev            # Build desenvolvimento
│   └── package.json
│
├── scripts/                      # Scripts de automação
│   ├── start.ps1                 # Script Windows
│   └── start.sh                  # Script Linux/Mac
│
├── docker-compose.yml            # Stack desenvolvimento
├── docker-compose.prod.yml       # Stack produção
└── README.md                     # Este arquivo
```

---

## 📝 Comandos Úteis

### Docker (executar na raiz do projeto)
```bash
# Subir stack completo em desenvolvimento
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar todos os containers
docker-compose down

# Rebuild completo (sem cache)
docker-compose build --no-cache

# Remover volumes (⚠️ apaga dados do banco)
docker-compose down -v

# Subir em modo produção
docker-compose -f docker-compose.prod.yml up -d
```

### Backend (executar em `backend/`)
```bash
# Desenvolvimento
npm run dev                              # Inicia servidor dev (nodemon)
npm run build                            # Compila TypeScript
npm start                                # Inicia servidor produção

# Prisma
npx prisma migrate dev --name <descricao>  # Criar nova migration
npx prisma migrate deploy                  # Aplicar migrations em prod
npx prisma generate                        # Gerar Prisma Client
npx prisma studio                          # Abrir interface visual do banco
npm run prisma:seed                        # Rodar seeds manualmente

# Testes e Qualidade
npm run test                             # Executar testes
npm run lint                             # Verificar code style
```

### Frontend (executar em `frontend/`)
```bash
# Desenvolvimento
npm run dev                              # Inicia servidor dev (hot reload)
npm run build                            # Build de produção
npm start                                # Inicia servidor produção

# Qualidade
npm run lint                             # Verificar erros ESLint
npm run lint:fix                         # Corrigir erros automaticamente
```

### Git
```bash
# Clonar repositório
git clone https://github.com/WillianFilipeSilva/Encantar.git

# Criar branch para feature
git checkout -b feature/nome-da-feature

# Commit com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade"

# Push para o repositório
git push origin feature/nome-da-feature
```

---

## 📊 Métricas do Projeto

- **13.803 linhas de código** (TypeScript/React/Node.js)
- **106 arquivos** de código-fonte
- **9 módulos funcionais** completos
- **40+ endpoints** de API documentados
- **8 páginas** principais no frontend
- **20+ componentes** reutilizáveis
- **440 horas** de desenvolvimento estimadas

---

## 🤝 Contribuindo

Este é um projeto privado desenvolvido para o Projeto Encantar. Contribuições externas não são aceitas no momento.

Para reportar bugs ou sugerir melhorias, entre em contato com o desenvolvedor.

---

## 👨‍💻 Autor

**Willian Filipe Silva**
- GitHub: [@WillianFilipeSilva](https://github.com/WillianFilipeSilva)
- Projeto desenvolvido como trabalho voluntário para o Projeto Encantar

---

## 📄 Licença

© 2025 Willian Filipe Silva. Todos os direitos reservados.

Este projeto foi desenvolvido exclusivamente para o **Projeto Encantar**. O uso, cópia, modificação ou distribuição deste software sem autorização expressa do autor é estritamente proibido.

**Finalidade:** Sistema de gestão para ONG sem fins lucrativos.

---

<div align="center">
  <p>Desenvolvido com ❤️ para o Projeto Encantar</p>
  <p><strong>Sistema de Gestão de Atendimentos</strong></p>
  <p>Janeiro - Novembro 2025</p>
</div>
