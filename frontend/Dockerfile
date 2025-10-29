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

# Copiar standalone output (Next.js otimizado)
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Copiar arquivos de configuração
COPY --chown=nodejs:nodejs next.config.js ./

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=http://backend:3001/api

# Mudar para usuário não-root
USER nodejs

EXPOSE 3000

# Comando para produção (standalone usa server.js)
CMD ["node", "server.js"]