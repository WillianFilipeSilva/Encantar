import { PrismaClient, Rota } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
import { createDateFromString, createBrazilTimestamp } from "../utils/dateUtils";

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

    if (data.dataAtendimento) {
      if (typeof data.dataAtendimento === 'string') {
        createData.dataAtendimento = createDateFromString(data.dataAtendimento);
      } else {
        createData.dataAtendimento = data.dataAtendimento;
      }
    }

    return this.prisma.rota.create({
      data: createData,
      include: {
        atendimentos: {
          include: {
            beneficiario: true,
            atendimentoItems: {
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

    if (data.dataAtendimento !== undefined) {
      if (typeof data.dataAtendimento === 'string') {
        updateData.dataAtendimento = createDateFromString(data.dataAtendimento);
      } else {
        updateData.dataAtendimento = data.dataAtendimento;
      }
    }

    return this.prisma.rota.update({
      where: { id },
      data: updateData,
      include: {
        atendimentos: {
          include: {
            beneficiario: true,
            atendimentoItems: {
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
        atendimentos: {
          include: {
            beneficiario: true,
            atendimentoItems: {
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
        atendimentos: {
          include: {
            beneficiario: true,
            atendimentoItems: {
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

  async findById(id: string): Promise<Rota | null> {
    return this.prisma.rota.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        descricao: true,
        dataAtendimento: true,
        criadoEm: true,
        atualizadoEm: true,
        criadoPorId: true,
        modificadoPorId: true,
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
    
    // Extrai parâmetros de ordenação dos filtros
    const sortBy = filters?.sortBy;
    const sortOrder = filters?.sortOrder || 'desc';
    
    // Define ordenação padrão ou usa a fornecida
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { criadoEm: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.rota.findMany({
        where,
        skip,
        take: limit,
        include: {
          atendimentos: {
            include: {
              beneficiario: true,
            },
          },
          criadoPor: true,
          modificadoPor: true,
        },
        orderBy
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
      where.dataAtendimento = {
        gte: createDateFromString(filters.dataInicio),
        lte: createDateFromString(filters.dataFim)
      };
    } else if (filters?.dataInicio) {
      where.dataAtendimento = {
        gte: createDateFromString(filters.dataInicio)
      };
    } else if (filters?.dataFim) {
      where.dataAtendimento = {
        lte: createDateFromString(filters.dataFim)
      };
    }

    return where;
  }

  async count(options: { where?: any } = {}): Promise<number> {
    return this.prisma.rota.count(options);
  }
}
