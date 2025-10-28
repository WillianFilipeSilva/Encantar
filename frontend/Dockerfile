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

# ==================== PRODUCTION STAGE ====================
FROM node:18-bullseye-slim

WORKDIR /app

# Criar usuário não-root para segurança
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nodejs

# Copiar apenas production dependencies do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Copiar package.json apenas (para versão e scripts)
COPY --chown=nodejs:nodejs package*.json ./

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=http://backend:3001/api

# Mudar para usuário não-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

# Comando para produção
CMD ["npm", "run", "start"]