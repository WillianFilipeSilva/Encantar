import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import inviteRoutes from "./routes/invite";
import beneficiarioRoutes from "./routes/beneficiario";
import itemRoutes from "./routes/item";
import rotaRoutes from "./routes/rota";
import modeloAtendimentoRoutes from "./routes/modeloAtendimento";
import atendimentoRoutes from "./routes/atendimento";
import dashboardRoutes from "./routes/dashboard";
import templatePDFRoutes from "./routes/templatePDF";

import { errorHandler } from "./middleware/errorHandler";
import { formatBrazilDateTime } from "./utils/dateUtils";
import { notFound } from "./middleware/notFound";
import { EnvValidator } from "./utils/envValidator";

import DatabaseClient from "./utils/database";

dotenv.config();

// Validar ambiente na inicialização
EnvValidator.validateRequired();
EnvValidator.validateTypes();
EnvValidator.logConfiguration();

const app = express();
const PORT = process.env.PORT || 3000;

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
    optionsSuccessStatus: 200,
    preflightContinue: false
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Muitas tentativas. Tente novamente em 15 minutos.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: "Muitas tentativas de login. Tente novamente em 1 hora.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Configuração de segurança baseada no ambiente
const isProduction = process.env.NODE_ENV === "production";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Em produção: sem unsafe-inline/unsafe-eval
        // Em desenvolvimento: permitir para hot-reload
        styleSrc: isProduction 
          ? ["'self'"] 
          : ["'self'", "'unsafe-inline'"],
        scriptSrc: isProduction 
          ? ["'self'"] 
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", 
          isProduction 
            ? process.env.FRONTEND_URL || "https://seu-dominio.com"
            : "http://localhost:3000"
        ],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    // Em produção: ativar HSTS (apenas com TLS/HTTPS válido)
    hsts: isProduction 
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  })
);

import logger, { httpLogger } from './utils/logger';
app.use(httpLogger);
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: formatBrazilDateTime(new Date()),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/beneficiarios", beneficiarioRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/rotas", rotaRoutes);
app.use("/api/modelos-atendimento", modeloAtendimentoRoutes);
app.use("/api/atendimentos", atendimentoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/templates", templatePDFRoutes);

app.use(notFound);

app.use(errorHandler);

async function startServer() {
  try {
    await DatabaseClient.connect();

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

startServer();

export default app;
