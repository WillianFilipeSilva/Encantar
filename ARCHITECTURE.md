# 📚 Documentação Técnica do Projeto Encantar

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas que separa claramente as responsabilidades:

### 1. Controllers (Camada de Apresentação)
- Responsável por receber requisições HTTP e retornar respostas
- Validação de dados de entrada usando express-validator
- Conversão de DTOs
- Tratamento inicial de erros
- Não contém lógica de negócio

### 2. Services (Camada de Negócio)
- Contém toda a lógica de negócio
- Validações complexas
- Transformação de dados
- Orquestração de múltiplos repositories
- Não acessa diretamente o banco de dados

### 3. Repositories (Camada de Dados)
- Responsável por todas as operações de banco de dados
- Utiliza Prisma ORM
- Não contém lógica de negócio
- Fornece métodos CRUD básicos e queries específicas

## 🔒 Sistema de Segurança

### Autenticação
- JWT para tokens de acesso (15 minutos)
- Refresh tokens para renovação (7 dias)
- Blacklist de tokens revogados (em memória)
- Sistema de convites para novos usuários

### Headers de Segurança (Helmet)
- Content-Security-Policy
- Cross-Origin-Embedder-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- HSTS
- NoSniff
- XSS Protection

### Rate Limiting
- Global: 100 requests/15min por IP
- Auth: 5 tentativas/hora por IP
- Headers padrão de rate limit

### Validação de Dados
- Express Validator para validação de entrada
- Sanitização de dados
- Validações personalizadas por entidade
- DTOs para tipo-segurança

## 📝 Logs e Monitoramento

### Winston Logger
- Níveis: error, warn, info, http, debug
- Rotação diária de arquivos
- Compressão de logs antigos
- Formato JSON para logs de arquivo
- Formato colorido para console

### Morgan HTTP Logger
- Logs de todas as requisições HTTP
- Integrado com Winston
- Formato "combined" com dados detalhados

## 💾 Cache

### Sistema de Cache em Memória
- Implementado com node-cache
- TTL configurável por rota
- Invalidação automática
- Cache por entidade
- Gerenciamento granular

### Estratégia de Cache
- GET requests apenas
- Chaves baseadas em URL e parâmetros
- TTLs diferentes por tipo de dado
- Invalidação em cascata

## 🔄 Padrões de Código

### Convenções de Nomes
- PascalCase: Classes, Interfaces, Types
- camelCase: Variáveis, Métodos, Funções
- SNAKE_CASE: Constantes
- kebab-case: Arquivos

### Estrutura de Arquivos
```
src/
├── controllers/     # Controladores REST
├── services/       # Lógica de negócio
├── repositories/   # Acesso a dados
├── models/        # Interfaces e tipos
├── middleware/    # Middlewares Express
├── routes/        # Definições de rotas
├── utils/         # Utilitários
└── templates/     # Templates HTML
```

### Padrões de Código
- Princípios SOLID
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Composição sobre herança
- Injeção de dependências

## 🧪 Testes

### Estrutura de Testes
```
__tests__/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
└── fixtures/       # Dados de teste
```

### Padrões de Teste
- Arrange-Act-Assert
- Mocks para dependências externas
- Factories para dados de teste
- Coverage mínimo de 80%

## 🔄 Gestão de Estado

### Camada de Dados
- Prisma para ORM
- Transações para operações atômicas
- Soft delete para exclusões
- Auditoria automática

### Cache
- Cache em memória para leitura
- Invalidação automática na escrita
- TTL configurável por rota
- Cache busting em atualizações

## 🚦 CI/CD (Futuro)

### Pipeline Proposto
1. Lint e formatação
2. Testes unitários
3. Testes de integração
4. Build
5. Deploy staging
6. Testes E2E
7. Deploy produção

### Ambientes
- Development: Local
- Staging: Testes
- Production: Produção

## 📊 Monitoramento (Futuro)

### Métricas
- Tempo de resposta
- Taxa de erro
- Uso de memória
- Uso de CPU
- Queries lentas

### Alertas
- Erros 5xx
- Tempo de resposta alto
- Uso de recursos
- Falhas de autenticação

## 🔧 Manutenção

### Backups
- Banco de dados: diário
- Logs: rotação semanal
- Arquivos: sob demanda

### Updates
- Dependências: mensal
- Sistema: sob demanda
- Segurança: imediato

## 📈 Escalabilidade (Futuro)

### Horizontal
- Load balancer
- Múltiplas instâncias
- Sessões distribuídas

### Vertical
- Otimização de queries
- Indexação estratégica
- Cache distribuído

## 🔍 Observabilidade

### Logs
- Estruturados em JSON
- Rotação diária
- Níveis apropriados
- Contexto rico

### Rastreamento
- Request ID
- User ID
- Timestamp
- Origem