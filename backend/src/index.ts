import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import csrf from "csurf";

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
import { setupSwagger } from "./swagger/swagger";

import DatabaseClient from "./utils/database";

const defaultEnvResult = dotenv.config();

if (defaultEnvResult.error) {
  const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
  const parentResult = dotenv.config({ path: rootEnvPath });

  if (parentResult.error) {
    console.warn("Warning: nenhum arquivo .env encontrado nas pastas backend ou raiz do projeto.");
  }
}

EnvValidator.validateRequired();
EnvValidator.validateTypes();
EnvValidator.logConfiguration();

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: [process.env.FRONTEND_URL!],
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
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "Muitas tentativas. Tente novamente em 15 minutos.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Muitas tentativas. Tente novamente em 15 minutos.",
      code: "RATE_LIMIT_EXCEEDED",
    });
  },
  skip: (req) => req.path === '/api/auth/refresh',
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Muitas tentativas de login. Tente novamente em 1 hora.",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
    });
  },
});

// Rate limiter separado para refresh token (mais permissivo)
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Muitas tentativas de refresh. Tente novamente em 15 minutos.",
      code: "REFRESH_RATE_LIMIT_EXCEEDED",
    });
  },
});

const healthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/refresh", refreshLimiter);

// Configuração de segurança baseada no ambiente
const isProduction = process.env.NODE_ENV === "production";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: isProduction
          ? ["'self'"]
          : ["'self'", "'unsafe-inline'"],
        scriptSrc: isProduction
          ? ["'self'"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL!],
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
    write: (message: string) => logger.http(message.trim()),
  },
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

const csrfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/csrf-token", csrfLimiter, csrfProtection, (req: any, res: any) => {
  res.json({ csrfToken: req.csrfToken() });
});

const buildHealthPayload = () => ({
  status: "OK",
  timestamp: formatBrazilDateTime(new Date()),
  environment: process.env.NODE_ENV || "development",
  version: "1.0.0",
});

app.get("/api/health", healthLimiter, (_req, res) => {
  res.json(buildHealthPayload());
});

// Rotas com prefixo /api
app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/beneficiarios", beneficiarioRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/rotas", rotaRoutes);
app.use("/api/modelos-atendimento", modeloAtendimentoRoutes);
app.use("/api/atendimentos", atendimentoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/templates", templatePDFRoutes);

// Configurar Swagger para documentação da API
setupSwagger(app);

app.use(notFound);

app.use(errorHandler);

async function startServer() {
  try {
    await DatabaseClient.connect();

    app.listen(PORT, () => {
      logger.info(`🚀 Servidor Encantar rodando na porta ${PORT}`);
      logger.info(`📊 Health check: ${process.env.NEXT_PUBLIC_API_URL}/health`);  
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
      logger.info(`🔐 Rotas de autenticação: ${process.env.NEXT_PUBLIC_API_URL}/auth`);
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
