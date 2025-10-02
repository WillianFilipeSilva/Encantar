import { PrismaClient, Entrega } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateEntregaDTO, UpdateEntregaDTO } from "../models/DTOs";

export class EntregaRepository extends BaseRepository<
  Entrega,
  CreateEntregaDTO,
  UpdateEntregaDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "entrega");
  }

  /**
   * Override do delete para fazer hard delete (Entrega não tem campo ativo)
   */
  async delete(id: string): Promise<Entrega> {
    await this.prisma.entregaItem.deleteMany({
      where: { entregaId: id }
    });

    return this.prisma.entrega.delete({
      where: { id }
    });
  }

  /**
   * Override do update para trabalhar com entregaItems
   */
  async update(id: string, data: any): Promise<Entrega> {
    const { entregaItems, ...restData } = data;

    if (entregaItems) {
      await this.prisma.entregaItem.deleteMany({
        where: { entregaId: id }
      });

      restData.entregaItems = {
        create: entregaItems.create
      };
    }

    return this.prisma.entrega.update({
      where: { id },
      data: restData
    });
  }

  /**
   * Atualizar status de todas as entregas de uma rota
   */
  async updateStatusByRota(rotaId: string, status: string): Promise<void> {
    await this.prisma.entrega.updateMany({
      where: { rotaId },
      data: { status }
    });
  }
}
