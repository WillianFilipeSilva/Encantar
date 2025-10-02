import { PrismaClient, ModeloEntrega } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateModeloEntregaDTO, UpdateModeloEntregaDTO } from "../models/DTOs";

export class ModeloEntregaRepository extends BaseRepository<
  ModeloEntrega,
  CreateModeloEntregaDTO,
  UpdateModeloEntregaDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "modeloEntrega");
  }

  async delete(id: string): Promise<ModeloEntrega> {
    return this.prisma.modeloEntrega.delete({
      where: { id }
    });
  }

  async create(data: CreateModeloEntregaDTO): Promise<ModeloEntrega> {
    const { modeloItems, ...modeloData } = data;

    return this.prisma.modeloEntrega.create({
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
          include: {
            item: true
          }
        }
      }
    });
  }

  async update(id: string, data: UpdateModeloEntregaDTO): Promise<ModeloEntrega> {
    const { modeloItems, ...modeloData } = data;

    return this.prisma.modeloEntrega.update({
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
          include: {
            item: true
          }
        }
      }
    });
  }

  async findById(id: string): Promise<ModeloEntrega | null> {
    return this.prisma.modeloEntrega.findUnique({
      where: { id },
      include: {
        modeloItems: {
          include: {
            item: true
          }
        }
      }
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{
    data: ModeloEntrega[];
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
      this.prisma.modeloEntrega.findMany({
        where,
        skip,
        take: limit,
        include: {
          modeloItems: {
            include: {
              item: true
            }
          }
        },
        orderBy: { criadoEm: 'desc' }
      }),
      this.prisma.modeloEntrega.count({ where })
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
