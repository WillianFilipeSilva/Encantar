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

    // Validar se todos os itens estão ativos
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

    // Verificar se todos os itens foram encontrados
    if (items.length !== itemIds.length) {
      const foundIds = items.map(item => item.id);
      const missingIds = itemIds.filter(id => !foundIds.includes(id));
      throw CommonErrors.BAD_REQUEST(`Os seguintes itens não foram encontrados: ${missingIds.join(', ')}`);
    }

    // Verificar se todos os itens estão ativos
    const inactiveItems = items.filter(item => !item.ativo);
    if (inactiveItems.length > 0) {
      const inactiveNames = inactiveItems.map(item => item.nome).join(', ');
      throw CommonErrors.BAD_REQUEST(`Os seguintes itens estão inativos e não podem ser usados em entregas: ${inactiveNames}`);
    }
  }

  protected async validateUpdateData(data: UpdateEntregaDTO): Promise<void> {
    // Se está atualizando itens, validar se estão ativos
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

      // Verificar se todos os itens foram encontrados
      if (items.length !== itemIds.length) {
        const foundIds = items.map(item => item.id);
        const missingIds = itemIds.filter(id => !foundIds.includes(id));
        throw CommonErrors.BAD_REQUEST(`Os seguintes itens não foram encontrados: ${missingIds.join(', ')}`);
      }

      // Verificar se todos os itens estão ativos
      const inactiveItems = items.filter(item => !item.ativo);
      if (inactiveItems.length > 0) {
        const inactiveNames = inactiveItems.map(item => item.nome).join(', ');
        throw CommonErrors.BAD_REQUEST(`Os seguintes itens estão inativos e não podem ser usados em entregas: ${inactiveNames}`);
      }
    }
  }
}
