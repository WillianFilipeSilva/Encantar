# 🎯 Encantar - Sistema de Gestão de Entregas para ONGs

Sistema completo para gerenciar entregas de ONGs, com controle de beneficiários, items, rotas e geração de PDFs.

## 🚀 Tecnologias Utilizadas

### Backend

- **Node.js + TypeScript** - Runtime e tipagem forte
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **Prisma ORM** - Type-safe database access
- **JWT + Refresh Token** - Autenticação segura
- **Puppeteer** - Geração de PDF
- **Handlebars** - Templates HTML

### Frontend (em desenvolvimento)

- **React + TypeScript** - Interface do usuário
- **Tailwind CSS** - Styling
- **React Query** - Gerenciamento de estado

## 📋 Funcionalidades

### ✅ Implementadas

- [x] Sistema de autenticação JWT + Refresh Token
- [x] Sistema de convites para novos administradores
- [x] Classes base para Repository, Service e Controller
- [x] Middleware de segurança e tratamento de erros
- [x] Schema completo do banco de dados
- [x] Estrutura de projeto profissional

### 🔄 Em Desenvolvimento

- [ ] CRUD de Beneficiários
- [ ] CRUD de Items
- [ ] CRUD de Entregas
- [ ] CRUD de Rotas
- [ ] Sistema de templates PDF
- [ ] Dashboard com métricas
- [ ] Frontend React

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd encantar
```

### 2. Configure o banco de dados

```bash
# Instale o PostgreSQL e crie um banco
createdb encantar_db
```

### 3. Configure as variáveis de ambiente

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/encantar_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Instale as dependências

```bash
cd backend
npm install
```

### 5. Configure o banco de dados

```bash
# Gera o cliente Prisma
npm run prisma:generate

# Executa as migrations
npm run prisma:migrate

# (Opcional) Abre o Prisma Studio para visualizar dados
npm run prisma:studio
```

### 6. Execute o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📊 Estrutura do Banco de Dados

### Entidades Principais

- **Administradores** - Usuários do sistema
- **Convites** - Sistema de cadastro via convite
- **Beneficiários** - Quem recebe as entregas
- **Items** - Produtos cadastrados
- **Entregas** - Lista de items + quantidades para um beneficiário
- **EntregaItems** - Tabela de ligação (entrega + item + quantidade)
- **Rotas** - Agrupamento de entregas por localidade
- **TemplatesPDF** - Templates para geração de PDF

### Relacionamentos

- Um Beneficiário pode ter várias Entregas
- Uma Entrega pertence a um Beneficiário
- Uma Entrega pode ter vários Items (via EntregaItem)
- Uma Rota pode ter várias Entregas
- Sistema completo de auditoria (criado/modificado por)

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

1. **Login** - POST `/api/auth/login`
2. **Refresh Token** - POST `/api/auth/refresh`
3. **Logout** - POST `/api/auth/logout`

### Sistema de Convites

1. **Criar Convite** - POST `/api/auth/invite` (requer autenticação)
2. **Validar Convite** - GET `/api/auth/invite/:token`
3. **Registrar** - POST `/api/auth/register`

### Segurança

- Senhas criptografadas com bcrypt
- JWT com expiração de 15 minutos
- Refresh tokens com expiração de 7 dias
- Rate limiting (100 requests/15min)
- Headers de segurança com Helmet
- CORS configurado

## 🚀 API Endpoints

### Autenticação

```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Registro via convite
POST   /api/auth/refresh        # Renovar token
POST   /api/auth/logout         # Logout
GET    /api/auth/me             # Dados do usuário
POST   /api/auth/invite         # Criar convite
GET    /api/auth/invite/:token  # Validar convite
```

### Health Check

```
GET    /health                  # Status do servidor
```

## 📁 Estrutura do Projeto

```
encantar/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Controllers da API
│   │   ├── services/          # Lógica de negócio
│   │   ├── repositories/      # Acesso ao banco
│   │   ├── middleware/        # Middlewares
│   │   ├── models/           # Interfaces e tipos
│   │   ├── routes/           # Definição de rotas
│   │   ├── utils/            # Utilitários
│   │   └── templates/        # Templates HTML
│   ├── prisma/
│   │   └── schema.prisma     # Schema do banco
│   └── package.json
├── frontend/                 # (em desenvolvimento)
└── database/                 # Scripts de banco
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor em modo dev
npm run build           # Compila TypeScript
npm start              # Inicia servidor compilado

# Banco de dados
npm run prisma:generate # Gera cliente Prisma
npm run prisma:migrate  # Executa migrations
npm run prisma:studio   # Abre Prisma Studio
```

## 🎯 Próximos Passos

1. **Implementar CRUDs** - Beneficiários, Items, Entregas, Rotas
2. **Sistema de PDF** - Templates e geração
3. **Dashboard** - Métricas e gráficos
4. **Frontend** - Interface React
5. **Deploy** - Configuração para Hostinger

## 🤝 Contribuição

Este é um projeto em desenvolvimento ativo. Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para ajudar ONGs a gerenciarem suas entregas de forma eficiente.**
