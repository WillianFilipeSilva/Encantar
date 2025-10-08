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
      const [totalBeneficiarios, totalAtendimentos, totalRotas] = await Promise.all([
        prisma.beneficiario.count(),
        prisma.atendimento.count(),
        prisma.rota.count(),
      ]);

      const atendimentosRecentes = await prisma.atendimento.findMany({
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

      const dashboardData = {
        totalBeneficiarios,
        totalAtendimentos,
        totalRotas,
        atendimentosPorStatus: [
          { status: 'PENDENTE', total: totalAtendimentos },
          { status: 'CONCLUIDO', total: 0 },
          { status: 'CANCELADO', total: 0 },
        ],
        atendimentosRecentes: atendimentosRecentes.map((atendimento) => ({
          id: atendimento.id,
          beneficiario: {
            nome: atendimento.beneficiario.nome,
          },
          modeloAtendimento: {
            nome: 'Atendimento Padrão',
          },
          status: 'PENDENTE',
          dataAtendimento: atendimento.criadoEm,
        })),
      };

      res.json({
        success: true,
        data: dashboardData,
      });
    }
  );
}