# � Encantar - Sistema de Gestão de Entregas para ONGs

Sistema completo para gerenciar entregas de ONGs, com controle de beneficiários, itens, rotas e dashboard administrativo.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js + TypeScript** - Runtime e tipagem forte
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **Prisma ORM** - Type-safe database access
- **JWT + Refresh Token** - Autenticação segura
- **Helmet** - Middleware de segurança
- **Rate Limiting** - Proteção contra abuse

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem forte
- **Tailwind CSS** - Framework CSS utilitário
- **React Query** - Gerenciamento de estado e cache
- **Axios** - Cliente HTTP

### DevOps
- **Docker + Docker Compose** - Containerização
- **PostgreSQL 15 Alpine** - Banco em container
- **Volume Persistence** - Dados persistentes

## 📋 Funcionalidades

### ✅ Implementadas

- [x] Sistema de autenticação JWT + Refresh Token completo
- [x] Interface de login com logo personalizado
- [x] Dashboard administrativo responsivo
- [x] CRUD completo de Beneficiários com paginação
- [x] CRUD completo de Itens com paginação
- [x] CRUD completo de Rotas com paginação
- [x] Sistema de entregas vinculadas a rotas
- [x] Seed de dados para desenvolvimento
- [x] Middleware de segurança e tratamento de erros
- [x] Schema completo do banco de dados
- [x] Containerização com Docker
- [x] Scripts de automação PowerShell

### 🔄 Em Desenvolvimento

- [ ] Sistema de templates PDF
- [ ] Métricas avançadas no dashboard
- [ ] Sistema de relatórios
- [ ] Notificações push
- [ ] Sistema de backup automático

## � **Execução com Docker (Recomendado)**

### **Pré-requisitos**
- Docker
- Docker Compose

### **🚀 Comandos Principais**

```powershell
# Iniciar o projeto completo
docker-compose up -d

# Parar o projeto
docker-compose down

# Ver status dos containers
docker ps

# Ver logs
docker logs encantar-frontend
docker logs encantar-backend
docker logs encantar-db
```

### **🤖 Script PowerShell Automatizado**

Criamos um script `docker.ps1` para facilitar o gerenciamento:

```powershell
# Iniciar projeto
.\docker.ps1 start

# Parar projeto
.\docker.ps1 stop

# Reiniciar projeto
.\docker.ps1 restart

# Reset completo (limpa dados)
.\docker.ps1 reset

# Ver status
.\docker.ps1 status

# Ver logs
.\docker.ps1 logs
```

## 🌐 **Acessos**

Após executar `docker-compose up -d`:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:5432

### **🔐 Credenciais Padrão**
- **Login**: `admin`
- **Senha**: `admin123`

## 📊 Estrutura do Banco de Dados

### Entidades Principais

- **Administradores** - Usuários do sistema
- **Convites** - Sistema de cadastro via convite
- **Beneficiários** - Quem recebe as entregas
- **Itens** - Produtos cadastrados
- **Entregas** - Lista de itens + quantidades para um beneficiário
- **EntregaItens** - Tabela de ligação (entrega + item + quantidade)
- **Rotas** - Agrupamento de entregas por localidade
- **ModelosEntrega** - Templates de entregas padrão

### Relacionamentos

- Um Beneficiário pode ter várias Entregas
- Uma Entrega pertence a um Beneficiário e uma Rota
- Uma Entrega pode ter vários Itens (via EntregaItem)
- Uma Rota pode ter várias Entregas
- Sistema completo de auditoria (criado/modificado por)

## � API Endpoints

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

### Beneficiários
```
GET    /api/beneficiarios       # Listar com paginação
GET    /api/beneficiarios/:id   # Buscar por ID
POST   /api/beneficiarios       # Criar novo
PUT    /api/beneficiarios/:id   # Atualizar
DELETE /api/beneficiarios/:id   # Remover
```

### Itens
```
GET    /api/items              # Listar com paginação
GET    /api/items/:id          # Buscar por ID
POST   /api/items              # Criar novo
PUT    /api/items/:id          # Atualizar
DELETE /api/items/:id          # Remover
```

### Rotas
```
GET    /api/rotas              # Listar com paginação
GET    /api/rotas/:id          # Buscar por ID
POST   /api/rotas              # Criar nova
PUT    /api/rotas/:id          # Atualizar
DELETE /api/rotas/:id          # Remover
```

### Health Check
```
GET    /health                 # Status do servidor
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
│   │   ├── schema.prisma     # Schema do banco
│   │   ├── seed.ts          # Dados iniciais
│   │   └── migrations/      # Migrations do banco
│   ├── Dockerfile.dev       # Container de desenvolvimento
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router do Next.js
│   │   ├── components/      # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilitários e configurações
│   ├── public/
│   │   └── logo.png        # Logo da aplicação
│   ├── Dockerfile.dev      # Container de desenvolvimento
│   └── package.json
├── docker-compose.yml       # Orquestração dos containers
├── docker.ps1             # Script PowerShell de automação
└── README.md
```

## 🔧 Desenvolvimento Manual (Sem Docker)

### Backend
```bash
cd backend
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

**🎁 Desenvolvido com ❤️ para ajudar ONGs a gerenciarem suas entregas de forma eficiente e organizada.**
