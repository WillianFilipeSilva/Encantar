import { PrismaClient, Item } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateItemDTO, UpdateItemDTO } from "../models/DTOs";

export class ItemRepository extends BaseRepository<
  Item,
  CreateItemDTO,
  UpdateItemDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "item");
  }

  /**
   * Busca items com relacionamentos
   */
  async findAllWithRelations(
    page: number = 1,
    limit: number = 10,
    where?: any,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    const skip = (page - 1) * limit;
    
    // Define ordenação padrão ou usa a fornecida
    const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : { criadoEm: "desc" as const };

    const [data, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          criadoPor: {
            select: {
              id: true,
              nome: true,
            },
          },
          modificadoPor: {
            select: {
              id: true,
              nome: true,
            },
          },
          _count: {
            select: {
              atendimentoItems: true,
            },
          },
        },
      }),
      this.prisma.item.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Busca item por ID com relacionamentos
   */
  async findByIdWithRelations(id: string) {
    return this.prisma.item.findUnique({
      where: { id },
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
          },
        },
        modificadoPor: {
          select: {
            id: true,
            nome: true,
          },
        },
        atendimentoItems: {
          include: {
            atendimento: {
              include: {
                beneficiario: {
                  select: {
                    id: true,
                    nome: true,
                  },
                },
              },
            },
          },
          orderBy: {
            atendimento: {
              criadoEm: "desc",
            },
          },
        },
        _count: {
          select: {
            atendimentoItems: true,
          },
        },
      },
    });
  }

  /**
   * Busca items por nome (busca parcial)
   */
  async findByNome(nome: string, limit: number = 10) {
    return this.prisma.item.findMany({
      where: {
        nome: {
          contains: nome,
          mode: "insensitive",
        },
      },
      take: limit,
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        unidade: true,
        descricao: true,
      },
    });
  }

  /**
   * Verifica se já existe um item com o mesmo nome
   */
  async existsByNome(nome: string, excludeId?: string) {
    const where: any = {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    };

    if (excludeId) {
      where.id = {
        not: excludeId,
      };
    }

    const count = await this.prisma.item.count({ where });
    return count > 0;
  }

  /**
   * Busca items ativos para seleção
   */
  async findActiveForSelection() {
    return this.prisma.item.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        unidade: true,
        descricao: true,
      },
      orderBy: { nome: "asc" },
    });
  }

  /**
   * Busca items por unidade
   */
  async findByUnidade(unidade: string) {
    return this.prisma.item.findMany({
      where: {
        unidade: unidade as any,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        unidade: true,
        descricao: true,
      },
      orderBy: { nome: "asc" },
    });
  }

  /**
   * Busca items mais utilizados
   */
  async findMostUsed(limit: number = 10) {
    return this.prisma.item.findMany({
      include: {
        _count: {
          select: {
            atendimentoItems: true,
          },
        },
      },
      orderBy: {
        atendimentoItems: {
          _count: "desc",
        },
      },
      take: limit,
    });
  }

  /**
   * Busca unidades disponíveis
   */
  async findDistinctUnidades() {
    const result = await this.prisma.item.findMany({
      select: {
        unidade: true,
      },
      distinct: ["unidade"],
      orderBy: { unidade: "asc" },
    });

    return result.map((item) => item.unidade);
  }

  /**
   * Conta total de items atendidos por item
   */
  async countTotalAtendimentosByItem(itemId: string) {
    const result = await this.prisma.atendimentoItem.aggregate({
      where: { itemId },
      _sum: {
        quantidade: true,
      },
    });

    return result._sum.quantidade || 0;
  }

  /**
   * Busca estatísticas de uso do item
   */
  async getItemStats(itemId: string) {
    const [totalAtendimentos, totalQuantidade, atendimentoItems] = await Promise.all([
      this.prisma.atendimentoItem.count({
        where: { itemId },
      }),
      this.countTotalAtendimentosByItem(itemId),
      this.prisma.atendimentoItem.findMany({
        where: { itemId },
        include: {
          atendimento: {
            include: {
              beneficiario: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
        orderBy: {
          atendimento: {
            criadoEm: "desc",
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalAtendimentos,
      totalQuantidade,
      ultimosAtendimentos: atendimentoItems,
    };
  }
}
