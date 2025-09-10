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
// import entregaRoutes from './routes/entrega';
// import rotaRoutes from './routes/rota';

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
// MIDDLEWARE DE SEGURANÇA
// ===========================================

// Rate limiting para prevenir ataques
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    error: "Muitas tentativas. Tente novamente em 15 minutos.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Helmet para headers de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS configurado para produção
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logs de requisições
app.use(morgan("combined"));

// Parser de JSON com limite de tamanho
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===========================================
// ROTAS
// ===========================================

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
// app.use('/api/entregas', entregaRoutes);
// app.use('/api/rotas', rotaRoutes);

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
      console.log(`🚀 Servidor Encantar rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🔐 Rotas de autenticação: http://localhost:${PORT}/api/auth`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Recebido SIGINT. Encerrando servidor...");
  await DatabaseClient.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Recebido SIGTERM. Encerrando servidor...");
  await DatabaseClient.disconnect();
  process.exit(0);
});

// Inicia o servidor
startServer();

export default app;
