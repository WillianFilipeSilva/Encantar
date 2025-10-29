# ==================== BUILD STAGE ====================
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build do Next.js
RUN npm run build

# Remover dependências de desenvolvimento após o build
RUN npm prune --omit=dev

# ==================== PRODUCTION STAGE ====================
FROM node:18-bullseye-slim

WORKDIR /app

# Criar usuário não-root para segurança
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nodejs

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