import { PrismaClient, Atendimento, $Enums } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateAtendimentoDTO, UpdateAtendimentoDTO } from "../models/DTOs";

export class AtendimentoRepository extends BaseRepository<
  Atendimento,
  CreateAtendimentoDTO,
  UpdateAtendimentoDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "atendimento");
  }

  /**
   * Override do delete para fazer hard delete (Atendimento não tem campo ativo)
   */
  async delete(id: string): Promise<Atendimento> {
    await this.prisma.atendimentoItem.deleteMany({
      where: { atendimentoId: id }
    });

    return this.prisma.atendimento.delete({
      where: { id }
    });
  }

  /**
   * Override do update para trabalhar com atendimentoItems
   */
  async update(id: string, data: any): Promise<Atendimento> {
    const { atendimentoItems, ...restData } = data;

    if (atendimentoItems) {
      await this.prisma.atendimentoItem.deleteMany({
        where: { atendimentoId: id }
      });

      restData.atendimentoItems = {
        create: atendimentoItems.create
      };
    }

    return this.prisma.atendimento.update({
      where: { id },
      data: restData
    });
  }

  /**
   * Atualizar status de todas as atendimentos de uma rota
   */
  async updateStatusByRota(rotaId: string, status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO'): Promise<void> {
    await this.prisma.atendimento.updateMany({
      where: { rotaId },
      data: { status }
    });
  }
}
