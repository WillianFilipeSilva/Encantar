# Encantar - Plataforma do Projeto Encantar

Aplicacao web full-stack criada sob medida para o Projeto Encantar. A solucao centraliza o cadastro de beneficiarios, itens, rotas e atendimentos, gera relatorios em PDF e oferece dashboards operacionais para a equipe da ONG.

O ecossistema e composto por um backend em Express/Prisma com PostgreSQL e um frontend em Next.js 14. A autenticacao utiliza cookies HttpOnly com refresh tokens, auditoria completa de acoes e sanitizacao de conteudo dinamico.

## Stack Principal
- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI, React Query, React Hook Form, Zod
- **Backend:** Node.js 18, Express 5, Prisma ORM, PostgreSQL 15, JWT + refresh tokens, express-validator
- **Infra & DevOps:** Docker, Docker Compose, Railway, Puppeteer (PDF), Winston + Morgan

## Pre-requisitos
- Git
- Node.js 18+
- Docker Desktop + Docker Compose (recomendado)
- PostgreSQL local apenas se optar por rodar sem Docker

## Setup Rapido (scripts automatizados)
Os scripts criam arquivos `.env`, validam dependencias e sobem o stack completo.

### Windows (PowerShell)
```powershell
./scripts/start.ps1 check   # valida Node, Docker e portas
./scripts/start.ps1 up      # sobe backend, frontend e Postgres em dev
# extras: logs | down | build | restart | status | prod-up
```

### Linux / WSL / macOS (bash)
```bash
./scripts/start.sh check
./scripts/start.sh up
# extras: logs | down | build | restart | status | prod-up
```

## Setup Manual (sem scripts)
Use quando quiser executar servicos isolados ou sem Docker.

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev            # http://localhost:3001
```
> Garanta um PostgreSQL disponivel em `postgresql://postgres:postgres@localhost:5432/encantar` ou ajuste `DATABASE_URL`.

### Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

## Variaveis de Ambiente
### `backend/.env`
| Nome | Descricao | Exemplo |
| --- | --- | --- |
| DATABASE_URL | URL do PostgreSQL (use a URL privada na Railway) | `postgresql://user:pass@host:5432/db` |
| JWT_SECRET | Chave do access token (>=32 chars) | `e13f...` |
| JWT_REFRESH_SECRET | Chave do refresh token | `a7c4...` |
| JWT_EXPIRES_IN | Tempo de vida do access token | `15m` |
| JWT_REFRESH_EXPIRES_IN | Tempo de vida do refresh token | `7d` |
| FRONTEND_URL | Origem permitida para CORS/cookies | `https://projeto-encantar.up.railway.app` |
| NODE_ENV | Ambiente atual | `development` ou `production` |
| ENABLE_SEED | Controla execucao das seeds | `true` (dev) / `false` (prod) |

### `frontend/.env.local`
| Nome | Descricao | Exemplo |
| --- | --- | --- |
| NEXT_PUBLIC_API_URL | Endpoint do backend com `/api` | `https://projeto-encantarback.up.railway.app/api` |

## Seeds e Credenciais (desenvolvimento)
- Credencial padrao: usuario `admin`, senha `admin123`.
- Beneficiarios, itens, rotas e atendimentos de exemplo sao criados quando `ENABLE_SEED=true`.
- Defina `ENABLE_SEED=false` antes de publicar em producao para evitar dados ficticios.

## Deploy na Railway
1. Conecte o repositorio aos servicos **backend** e **frontend**.
2. Configure os comandos:
   - Backend Build: `npm install && npm run build`
   - Backend Start: deixar vazio (entrypoint executa `npx prisma migrate deploy` e `node dist/index.js`)
   - Frontend Build: `npm install && npm run build`
   - Frontend Start: `npm start`
3. Cadastre as variaveis listadas acima (backend e frontend).
4. Valide `/api/health` e a tela de login nos dominios gerados pela Railway.

## Troubleshooting rapido
- **Erro Prisma P1001/P1000:** verifique `DATABASE_URL` e encode senhas com caracteres especiais.
- **CORS bloqueado:** `FRONTEND_URL` deve ser exatamente a URL do frontend (sem `/api`).
- **Cookies ausentes:** use HTTPS e confira `NEXT_PUBLIC_API_URL` com `/api`.
- **PDF falhando fora do Docker:** instale dependencias do Chromium ou rode via container.
- **Seeds em producao:** confirme `ENABLE_SEED=false`.

## Estrutura do Projeto
```
Encantar/
 backend/
    src/
       controllers/       # Controllers Express
       services/          # Regras de negocio
       repositories/      # Acesso Prisma
       middleware/        # Auth, validacao, erros
       routes/            # Registro de rotas
       utils/             # Logger, database, helpers
    prisma/                # schema.prisma, migrations, seed
    Dockerfile(.dev)
    package.json
 frontend/
    src/app/               # App Router
    src/components/        # Componentes reutilizaveis
    src/hooks/             # Hooks customizados
    src/lib/               # Axios, providers, utils
    Dockerfile(.dev)
 scripts/                   # start.ps1 / start.sh
 docker-compose.yml         # Ambiente desenvolvimento
 docker-compose.prod.yml    # Composicao producao
 README.md
```

## Comandos Uteis
```bash
# Docker (na raiz)
docker-compose up -d              # sobe stack em desenvolvimento
docker-compose down               # encerra containers
docker-compose build --no-cache   # rebuild completo

# Backend
npm run build
npm run prisma:generate
npx prisma migrate dev --name <descricao>
npx prisma studio
npm run dev

# Frontend
npm run build
npm run lint
npm start
```

## Licenca
Projeto desenvolvido exclusivamente para o Projeto Encantar. Uso ou distribuicao externa requer autorizacao expressa do autor.
