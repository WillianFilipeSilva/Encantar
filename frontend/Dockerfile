# ==================== BUILD STAGE ====================
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies necessárias para build)
# Não definir NODE_ENV=production aqui para garantir instalação de devDependencies
RUN npm ci

# Copiar código fonte
COPY . .

# Definir NODE_ENV para production apenas para o build
ENV NODE_ENV=production

# Build do Next.js com configurações otimizadas
RUN npm run build

# Remover dependências de desenvolvimento após o build
RUN npm prune --omit=dev

# ==================== PRODUCTION STAGE ====================
FROM node:18-bullseye-slim

WORKDIR /app

# Criar usuário não-root para segurança
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nodejs

# Instalar utilitários necessários para healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copiar artefatos de build e dependências
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/package-lock.json ./package-lock.json

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=http://backend:3001/api

# Mudar para usuário não-root
USER nodejs

EXPOSE 3000

# Comando para produção
CMD ["npm", "run", "start"]