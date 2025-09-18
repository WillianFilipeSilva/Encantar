"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
class DatabaseClient {
    static getInstance() {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new client_1.PrismaClient({
                log: process.env.NODE_ENV === "development"
                    ? ["query", "info", "warn", "error"]
                    : ["error"],
                errorFormat: "pretty",
            });
            if (process.env.NODE_ENV === "development") {
                const client = DatabaseClient.instance;
                client.$on('query', (e) => {
                    console.log("🔍 Query:", e.query);
                    console.log("⏱️  Duration:", e.duration + "ms");
                });
                client.$on('error', (e) => {
                    console.error("❌ Database Error:", e);
                });
            }
        }
        return DatabaseClient.instance;
    }
    static async connect() {
        try {
            const prisma = DatabaseClient.getInstance();
            await prisma.$connect();
            console.log("✅ Conectado ao banco de dados PostgreSQL");
        }
        catch (error) {
            console.error("❌ Erro ao conectar ao banco de dados:", error);
            process.exit(1);
        }
    }
    static async disconnect() {
        try {
            const prisma = DatabaseClient.getInstance();
            await prisma.$disconnect();
            console.log("🔌 Desconectado do banco de dados");
        }
        catch (error) {
            console.error("❌ Erro ao desconectar do banco de dados:", error);
        }
    }
    static async transaction(fn) {
        const prisma = DatabaseClient.getInstance();
        return prisma.$transaction(fn);
    }
    static async healthCheck() {
        try {
            const prisma = DatabaseClient.getInstance();
            await prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error("❌ Health check do banco falhou:", error);
            return false;
        }
    }
}
exports.prisma = DatabaseClient.getInstance();
exports.default = DatabaseClient;
//# sourceMappingURL=database.js.map