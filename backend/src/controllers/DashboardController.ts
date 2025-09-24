import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/database";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../models/Auth";

export class DashboardController {
  /**
   * GET /dashboard - Retorna estatísticas do dashboard
   */
  getStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      // Buscar estatísticas gerais
      const [totalBeneficiarios, totalEntregas, totalRotas] = await Promise.all([
        prisma.beneficiario.count(),
        prisma.entrega.count(),
        prisma.rota.count(),
      ]);

      // Buscar entregas recentes
      const entregasRecentes = await prisma.entrega.findMany({
        take: 5,
        orderBy: {
          criadoEm: 'desc',
        },
        include: {
          beneficiario: {
            select: {
              nome: true,
            },
          },
        },
      });

      // Formatar dados
      const dashboardData = {
        totalBeneficiarios,
        totalEntregas,
        totalRotas,
        entregasPorStatus: [
          { status: 'PENDENTE', total: totalEntregas },
          { status: 'EM_ANDAMENTO', total: 0 },
          { status: 'CONCLUIDA', total: 0 },
          { status: 'CANCELADA', total: 0 },
        ],
        entregasRecentes: entregasRecentes.map((entrega) => ({
          id: entrega.id,
          beneficiario: {
            nome: entrega.beneficiario.nome,
          },
          modeloEntrega: {
            nome: 'Entrega Padrão',
          },
          status: 'PENDENTE', // Status padrão por enquanto
          dataEntrega: entrega.criadoEm,
        })),
      };

      res.json({
        success: true,
        data: dashboardData,
      });
    }
  );
}