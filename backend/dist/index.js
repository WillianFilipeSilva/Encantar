"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const beneficiario_1 = __importDefault(require("./routes/beneficiario"));
const item_1 = __importDefault(require("./routes/item"));
const rota_1 = __importDefault(require("./routes/rota"));
const modeloEntrega_1 = __importDefault(require("./routes/modeloEntrega"));
const entrega_1 = __importDefault(require("./routes/entrega"));
const swagger_1 = require("./swagger/swagger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const database_1 = __importDefault(require("./utils/database"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Muitas tentativas. Tente novamente em 15 minutos.",
        code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
(0, swagger_1.setupSwagger)(app);
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
    });
});
app.use("/api/auth", auth_1.default);
app.use("/api/beneficiarios", beneficiario_1.default);
app.use("/api/items", item_1.default);
app.use("/api/rotas", rota_1.default);
app.use("/api/modelos-entrega", modeloEntrega_1.default);
app.use("/api/entregas", entrega_1.default);
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
async function startServer() {
    try {
        await database_1.default.connect();
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Encantar rodando na porta ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
            console.log(`🔐 Rotas de autenticação: http://localhost:${PORT}/api/auth`);
        });
    }
    catch (error) {
        console.error("❌ Erro ao iniciar servidor:", error);
        process.exit(1);
    }
}
process.on("SIGINT", async () => {
    console.log("\n🛑 Recebido SIGINT. Encerrando servidor...");
    await database_1.default.disconnect();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("\n🛑 Recebido SIGTERM. Encerrando servidor...");
    await database_1.default.disconnect();
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map