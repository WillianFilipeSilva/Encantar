# ==================== BUILD STAGE ====================
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copiar arquivos essenciais
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Salvar cliente Prisma gerado antes do prune
RUN cp -r node_modules/.prisma /tmp/.prisma-backup

# Remover dependências de desenvolvimento antes de exportar
RUN npm prune --omit=dev

# Restaurar cliente Prisma após prune
RUN cp -r /tmp/.prisma-backup node_modules/.prisma

# ==================== PRODUCTION STAGE ====================
FROM node:18-bullseye-slim

WORKDIR /app

# Criar usuário não-root para segurança
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nodejs

# Dependências necessárias para execução do Chromium/Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    curl \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Copiar apenas production dependencies do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copiar cliente Prisma gerado do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copiar package.json apenas (para versão)
COPY --chown=nodejs:nodejs package*.json ./

# Instalar Chrome para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer
RUN mkdir -p /app/.cache/puppeteer
RUN npx puppeteer browsers install chrome

# Copiar script de entrypoint para garantir migrations
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Garantir diretório de logs e cache com permissões corretas
RUN mkdir -p logs && chown -R nodejs:nodejs /app

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3001
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Mudar para usuário não-root
USER nodejs

EXPOSE 3001

# Comando para produção
ENTRYPOINT ["./docker-entrypoint.sh"]