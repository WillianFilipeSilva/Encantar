import { PrismaClient, Rota } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";

export class RotaRepository extends BaseRepository<
  Rota,
  CreateRotaDTO,
  UpdateRotaDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "rota");
  }

  async delete(id: string): Promise<Rota> {
    return this.prisma.rota.delete({
      where: { id }
    });
  }

  async create(data: CreateRotaDTO & { criadoPorId?: string }): Promise<Rota> {
    const createData: any = {
      nome: data.nome,
      descricao: data.descricao,
      observacoes: data.observacoes
    };

    if (data.criadoPorId) {
      createData.criadoPorId = data.criadoPorId;
    }

    if (data.dataEntrega) {
      if (typeof data.dataEntrega === 'string') {
        createData.dataEntrega = new Date(data.dataEntrega + 'T00:00:00.000Z');
      } else {
        createData.dataEntrega = data.dataEntrega;
      }
    }

    return this.prisma.rota.create({
      data: createData,
      include: {
        entregas: {
          include: {
            beneficiario: true,
            entregaItems: {
              include: {
                item: true,
              },
            },
          },
        },
        criadoPor: true,
        modificadoPor: true,
      },
    });
  }

  async update(id: string, data: UpdateRotaDTO & { modificadoPorId?: string; ativo?: boolean }): Promise<Rota> {
    const updateData: any = {};

    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
    if (data.modificadoPorId !== undefined) updateData.modificadoPorId = data.modificadoPorId;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    if (data.dataEntrega !== undefined) {
      if (typeof data.dataEntrega === 'string') {
        updateData.dataEntrega = new Date(data.dataEntrega + 'T00:00:00.000Z');
      } else {
        updateData.dataEntrega = data.dataEntrega;
      }
    }

    return this.prisma.rota.update({
      where: { id },
      data: updateData,
      include: {
        entregas: {
          include: {
            beneficiario: true,
            entregaItems: {
              include: {
                item: true,
              },
            },
          },
        },
        criadoPor: true,
        modificadoPor: true,
      },
    });
  }

  async findAllWithRelations(options: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  } = {}): Promise<Rota[]> {
    return this.prisma.rota.findMany({
      ...options,
      include: {
        entregas: {
          include: {
            beneficiario: true,
            entregaItems: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });
  }

  async findByIdWithRelations(id: string): Promise<Rota | null> {
    return this.prisma.rota.findUnique({
      where: { id },
      include: {
        entregas: {
          include: {
            beneficiario: true,
            entregaItems: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Rota | null> {
    return this.prisma.rota.findUnique({
      where: { id },
      include: {
        entregas: {
          include: {
            beneficiario: true,
            entregaItems: {
              include: {
                item: true,
              },
            },
          },
        },
        criadoPor: true,
        modificadoPor: true,
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{
    data: Rota[];
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
      this.prisma.rota.findMany({
        where,
        skip,
        take: limit,
        include: {
          entregas: {
            include: {
              beneficiario: true,
            },
          },
          criadoPor: true,
          modificadoPor: true,
        },
        orderBy: { criadoEm: 'desc' }
      }),
      this.prisma.rota.count({ where })
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

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { descricao: { contains: filters.search, mode: 'insensitive' } },
        { observacoes: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters?.ativo !== undefined) {
      where.ativo = filters.ativo === 'true';
    }

    if (filters?.dataInicio && filters?.dataFim) {
      where.dataEntrega = {
        gte: new Date(filters.dataInicio + 'T00:00:00.000Z'),
        lte: new Date(filters.dataFim + 'T23:59:59.999Z')
      };
    } else if (filters?.dataInicio) {
      where.dataEntrega = {
        gte: new Date(filters.dataInicio + 'T00:00:00.000Z')
      };
    } else if (filters?.dataFim) {
      where.dataEntrega = {
        lte: new Date(filters.dataFim + 'T23:59:59.999Z')
      };
    }

    return where;
  }

  async count(options: { where?: any } = {}): Promise<number> {
    return this.prisma.rota.count(options);
  }
}
