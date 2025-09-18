import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma singleton para toda a aplicação
 * Garante que apenas uma instância seja criada
 */
class DatabaseClient {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
        errorFormat: "pretty",
      });

      // Event listeners para logs
      if (process.env.NODE_ENV === "development") {
        const client = DatabaseClient.instance as PrismaClient & {
          $on(event: 'query', listener: (event: { query: string; duration: number }) => void): void;
          $on(event: 'error', listener: (event: { message: string }) => void): void;
        };
        
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

  /**
   * Conecta ao banco de dados
   */
  public static async connect(): Promise<void> {
    try {
      const prisma = DatabaseClient.getInstance();
      await prisma.$connect();
      console.log("✅ Conectado ao banco de dados PostgreSQL");
    } catch (error) {
      console.error("❌ Erro ao conectar ao banco de dados:", error);
      process.exit(1);
    }
  }

  /**
   * Desconecta do banco de dados
   */
  public static async disconnect(): Promise<void> {
    try {
      const prisma = DatabaseClient.getInstance();
      await prisma.$disconnect();
      console.log("🔌 Desconectado do banco de dados");
    } catch (error) {
      console.error("❌ Erro ao desconectar do banco de dados:", error);
    }
  }

  /**
   * Executa uma transação
   */
  public static async transaction<T>(
    fn: (prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => Promise<T>
  ): Promise<T> {
    const prisma = DatabaseClient.getInstance();
    return prisma.$transaction<T>(fn);
  }

  /**
   * Verifica a saúde da conexão
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseClient.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("❌ Health check do banco falhou:", error);
      return false;
    }
  }
}

// Exporta a instância do Prisma
export const prisma = DatabaseClient.getInstance();

// Exporta a classe para métodos utilitários
export default DatabaseClient;
