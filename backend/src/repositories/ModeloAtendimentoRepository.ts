import { PrismaClient, ModeloAtendimento } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateModeloAtendimentoDTO, UpdateModeloAtendimentoDTO } from "../models/DTOs";

export class ModeloAtendimentoRepository extends BaseRepository<
  ModeloAtendimento,
  CreateModeloAtendimentoDTO,
  UpdateModeloAtendimentoDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "modeloAtendimento");
  }

  async delete(id: string): Promise<ModeloAtendimento> {
    return this.prisma.modeloAtendimento.delete({
      where: { id }
    });
  }

  async create(data: CreateModeloAtendimentoDTO): Promise<ModeloAtendimento> {
    const { modeloItems, ...modeloData } = data;

    return this.prisma.modeloAtendimento.create({
      data: {
        nome: modeloData.nome,
        descricao: modeloData.descricao,
        modeloItems: modeloItems ? {
          create: modeloItems.map((item: { itemId: string; quantidade: number }) => ({
            itemId: item.itemId,
            quantidade: item.quantidade
          }))
        } : undefined
      },
      include: {
        modeloItems: {
          select: {
            id: true,
            quantidade: true,
            item: {
              select: {
                id: true,
                nome: true,
                unidade: true,
              },
            },
          },
          orderBy: {
            item: {
              nome: "asc",
            },
          },
        },
        _count: {
          select: {
            modeloItems: true,
          },
        },
      }
    });
  }

  async update(id: string, data: UpdateModeloAtendimentoDTO): Promise<ModeloAtendimento> {
    const { modeloItems, ...modeloData } = data;

    return this.prisma.modeloAtendimento.update({
      where: { id },
      data: {
        nome: modeloData.nome,
        descricao: modeloData.descricao,
        ativo: modeloData.ativo,
        modeloItems: modeloItems ? {
          deleteMany: {},
          create: modeloItems.map((item: { itemId: string; quantidade: number }) => ({
            itemId: item.itemId,
            quantidade: item.quantidade
          }))
        } : undefined
      },
      include: {
        modeloItems: {
          select: {
            id: true,
            quantidade: true,
            item: {
              select: {
                id: true,
                nome: true,
                unidade: true,
              },
            },
          },
          orderBy: {
            item: {
              nome: "asc",
            },
          },
        },
        _count: {
          select: {
            modeloItems: true,
          },
        },
      }
    });
  }

  async findById(id: string): Promise<ModeloAtendimento | null> {
    return this.prisma.modeloAtendimento.findUnique({
      where: { id },
      include: {
        modeloItems: {
          select: {
            id: true,
            quantidade: true,
            item: {
              select: {
                id: true,
                nome: true,
                unidade: true,
              },
            },
          },
          orderBy: {
            item: {
              nome: "asc",
            },
          },
        },
        _count: {
          select: {
            modeloItems: true,
          },
        },
      }
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{
    data: ModeloAtendimento[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      this.prisma.modeloAtendimento.findMany({
        where,
        skip,
        take: limit,
        include: {
          modeloItems: {
            select: {
              id: true,
              quantidade: true,
              item: {
                select: {
                  id: true,
                  nome: true,
                  unidade: true,
                },
              },
            },
            orderBy: {
              item: {
                nome: "asc",
              },
            },
          },
          _count: {
            select: {
              modeloItems: true,
            },
          },
        },
        orderBy: { criadoEm: 'desc' }
      }),
      this.prisma.modeloAtendimento.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  private buildWhereClause(filters?: any) {
    const where: any = {};

    if (filters?.OR) {
      where.OR = filters.OR;
    }

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { descricao: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters?.ativo !== undefined) {
      where.ativo = filters.ativo === 'true';
    }

    return where;
  }
}
