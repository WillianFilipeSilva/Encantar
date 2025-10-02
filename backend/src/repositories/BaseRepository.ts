import { PrismaClient } from "@prisma/client";

/**
 * Classe base para todos os repositories
 * Fornece operações CRUD básicas e métodos comuns
 */
export abstract class BaseRepository<T, CreateData, UpdateData> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Busca todos os registros com paginação
   */
  async findAll(page: number = 1, limit: number = 10, where?: any) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      (this.prisma as any)[this.modelName].findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
      }),
      (this.prisma as any)[this.modelName].count({ where }),
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
   * Busca um registro por ID
   */
  async findById(id: string): Promise<T | null> {
    return (this.prisma as any)[this.modelName].findUnique({
      where: { id },
    });
  }

  /**
   * Cria um novo registro
   */
  async create(data: CreateData): Promise<T> {
    return (this.prisma as any)[this.modelName].create({
      data,
    });
  }

  /**
   * Atualiza um registro
   */
  async update(id: string, data: UpdateData): Promise<T> {
    return (this.prisma as any)[this.modelName].update({
      where: { id },
      data,
    });
  }

  /**
   * Remove um registro (soft delete se tiver campo ativo)
   */
  async delete(id: string): Promise<T> {
    try {
      return (this.prisma as any)[this.modelName].update({
        where: { id },
        data: { ativo: false },
      });
    } catch (error) {
      return (this.prisma as any)[this.modelName].delete({
        where: { id },
      });
    }
  }

  /**
   * Remove um registro permanentemente
   */
  async hardDelete(id: string): Promise<T> {
    return (this.prisma as any)[this.modelName].delete({
      where: { id },
    });
  }

  /**
   * Busca registros por critérios específicos
   */
  async findMany(where: any, orderBy?: any, include?: any) {
    return (this.prisma as any)[this.modelName].findMany({
      where,
      orderBy,
      include,
    });
  }

  /**
   * Busca o primeiro registro que atende aos critérios
   */
  async findFirst(where: any, include?: any) {
    return (this.prisma as any)[this.modelName].findFirst({
      where,
      include,
    });
  }

  /**
   * Conta registros que atendem aos critérios
   */
  async count(where?: any): Promise<number> {
    return (this.prisma as any)[this.modelName].count({ where });
  }

  /**
   * Verifica se existe um registro com os critérios
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Busca com relacionamentos
   */
  async findByIdWithRelations(id: string, include: any): Promise<T | null> {
    return (this.prisma as any)[this.modelName].findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Busca todos com relacionamentos
   */
  async findAllWithRelations(include: any, where?: any, orderBy?: any) {
    return (this.prisma as any)[this.modelName].findMany({
      where,
      include,
      orderBy,
    });
  }
}
