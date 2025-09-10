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
    where?: any
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
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
              entregaItems: true,
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
        entregaItems: {
          include: {
            entrega: {
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
            entrega: {
              criadoEm: "desc",
            },
          },
        },
        _count: {
          select: {
            entregaItems: true,
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
        ativo: true,
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
      where: { ativo: true },
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
        unidade: {
          equals: unidade,
          mode: "insensitive",
        },
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
      where: { ativo: true },
      include: {
        _count: {
          select: {
            entregaItems: true,
          },
        },
      },
      orderBy: {
        entregaItems: {
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
      where: { ativo: true },
      select: {
        unidade: true,
      },
      distinct: ["unidade"],
      orderBy: { unidade: "asc" },
    });

    return result.map((item) => item.unidade);
  }

  /**
   * Conta total de items entregues por item
   */
  async countTotalEntregasByItem(itemId: string) {
    const result = await this.prisma.entregaItem.aggregate({
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
    const [totalEntregas, totalQuantidade, entregaItems] = await Promise.all([
      this.prisma.entregaItem.count({
        where: { itemId },
      }),
      this.countTotalEntregasByItem(itemId),
      this.prisma.entregaItem.findMany({
        where: { itemId },
        include: {
          entrega: {
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
          entrega: {
            criadoEm: "desc",
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalEntregas,
      totalQuantidade,
      ultimasEntregas: entregaItems,
    };
  }
}
