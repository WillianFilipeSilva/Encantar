import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Importar rotas
import authRoutes from "./routes/auth";
import beneficiarioRoutes from "./routes/beneficiario";
import itemRoutes from "./routes/item";
import rotaRoutes from "./routes/rota";
import modeloEntregaRoutes from "./routes/modeloEntrega";
import entregaRoutes from "./routes/entrega";
import dashboardRoutes from "./routes/dashboard";

// Importar Swagger
// import { setupSwagger } from "./swagger/swagger";

// Importar middleware
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

// Importar database
import DatabaseClient from "./utils/database";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// CORS - DEVE VIR PRIMEIRO
// ===========================================

// CORS configurado para desenvolvimento
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL || "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Headers"
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200, // Para suportar browsers legados
    preflightContinue: false
  })
);

// ===========================================
// MIDDLEWARE DE SEGURANÇA
// ===========================================

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    error: "Muitas tentativas. Tente novamente em 15 minutos.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais restrito para autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 tentativas por IP por hora
  message: {
    error: "Muitas tentativas de login. Tente novamente em 1 hora.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting global e específico para autenticação
app.use(globalLimiter);
app.use("/api/auth", authLimiter);

// Helmet para headers de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Desabilitado para desenvolvimento
    crossOriginOpenerPolicy: false, // Desabilitado para desenvolvimento
    crossOriginResourcePolicy: false, // Desabilitado para desenvolvimento
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: false, // Desabilitado para desenvolvimento HTTP
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "same-origin" },
    xssFilter: true,
  })
);

// Sistema de logging
import logger, { httpLogger } from './utils/logger';
app.use(httpLogger);
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

// Parser de JSON com limite de tamanho
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===========================================
// ROTAS
// ===========================================

// Configurar Swagger
// setupSwagger(app);

// Rota de health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/beneficiarios", beneficiarioRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/rotas", rotaRoutes);
app.use("/api/modelos-entrega", modeloEntregaRoutes);
app.use("/api/entregas", entregaRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ===========================================
// MIDDLEWARE DE ERRO
// ===========================================

// Rota não encontrada
app.use(notFound);

// Tratamento global de erros
app.use(errorHandler);

// ===========================================
// INICIALIZAÇÃO DO SERVIDOR
// ===========================================

async function startServer() {
  try {
    // Conecta ao banco de dados
    await DatabaseClient.connect();

    // Inicia o servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor Encantar rodando na porta ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🔐 Rotas de autenticação: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    logger.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("🛑 Recebido SIGINT. Encerrando servidor...");
  await DatabaseClient.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("🛑 Recebido SIGTERM. Encerrando servidor...");
  await DatabaseClient.disconnect();
  process.exit(0);
});

// Inicia o servidor
startServer();

export default app;
