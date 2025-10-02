import { Entrega } from "@prisma/client";
import { BaseService } from "./BaseService";
import { EntregaRepository } from "../repositories/EntregaRepository";
import { CreateEntregaDTO, UpdateEntregaDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { PrismaClient } from "@prisma/client";

export class EntregaService extends BaseService<
  Entrega,
  CreateEntregaDTO,
  UpdateEntregaDTO
> {
  private prisma: PrismaClient;

  constructor(repository: EntregaRepository, prisma: PrismaClient) {
    super(repository);
    this.prisma = prisma;
  }

  /**
   * Override do método create para transformar items em entregaItems
   */
  async create(data: CreateEntregaDTO, userId?: string): Promise<Entrega> {
    await this.validateCreateData(data);

    const { items, ...restData } = data;
    const createData = {
      ...restData,
      entregaItems: {
        create: items.map(item => ({
          itemId: item.itemId,
          quantidade: item.quantidade
        }))
      }
    };

    const finalData = await this.addAuditData(createData, userId, "create");

    return this.repository.create(finalData);
  }

  protected async validateCreateData(data: CreateEntregaDTO): Promise<void> {
    if (!data.beneficiarioId) {
      throw CommonErrors.BAD_REQUEST("O beneficiário é obrigatório.");
    }
    if (!data.rotaId) {
      throw CommonErrors.BAD_REQUEST("A rota é obrigatória.");
    }
    if (!data.items || data.items.length === 0) {
      throw CommonErrors.BAD_REQUEST("A entrega deve ter pelo menos um item.");
    }

    const itemIds = data.items.map(item => item.itemId);
    const items = await this.prisma.item.findMany({
      where: {
        id: { in: itemIds }
      },
      select: {
        id: true,
        nome: true,
        ativo: true
      }
    });

    if (items.length !== itemIds.length) {
      const foundIds = items.map(item => item.id);
      const missingIds = itemIds.filter(id => !foundIds.includes(id));
      throw CommonErrors.BAD_REQUEST(`Os seguintes itens não foram encontrados: ${missingIds.join(', ')}`);
    }

    const inactiveItems = items.filter(item => !item.ativo);
    if (inactiveItems.length > 0) {
      const inactiveNames = inactiveItems.map(item => item.nome).join(', ');
      throw CommonErrors.BAD_REQUEST(`Os seguintes itens estão inativos e não podem ser usados em entregas: ${inactiveNames}`);
    }
  }

  protected async validateUpdateData(data: UpdateEntregaDTO): Promise<void> {
    if (data.items && data.items.length > 0) {
      const itemIds = data.items.map(item => item.itemId);
      const items = await this.prisma.item.findMany({
        where: {
          id: { in: itemIds }
        },
        select: {
          id: true,
          nome: true,
          ativo: true
        }
      });

      if (items.length !== itemIds.length) {
        const foundIds = items.map(item => item.id);
        const missingIds = itemIds.filter(id => !foundIds.includes(id));
        throw CommonErrors.BAD_REQUEST(`Os seguintes itens não foram encontrados: ${missingIds.join(', ')}`);
      }

      const inactiveItems = items.filter(item => !item.ativo);
      if (inactiveItems.length > 0) {
        const inactiveNames = inactiveItems.map(item => item.nome).join(', ');
        throw CommonErrors.BAD_REQUEST(`Os seguintes itens estão inativos e não podem ser usados em entregas: ${inactiveNames}`);
      }
    }
  }

  /**
   * Override do método update para transformar items em entregaItems
   */
  async update(id: string, data: UpdateEntregaDTO, userId?: string): Promise<Entrega> {
    await this.validateUpdateData(data);

    let updateData: any = { ...data };
    if (data.items) {
      const { items, ...restData } = data;
      updateData = {
        ...restData,
        entregaItems: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantidade: item.quantidade
          }))
        }
      };
    }

    const finalData = await this.addAuditData(updateData, userId, "update");

    return this.repository.update(id, finalData);
  }

  /**
   * Atualizar status de todas as entregas de uma rota
   */
  async updateStatusByRota(rotaId: string, status: string): Promise<void> {
    return (this.repository as EntregaRepository).updateStatusByRota(rotaId, status);
  }
}
