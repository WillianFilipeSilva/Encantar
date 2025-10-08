import { PrismaClient, Beneficiario } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO } from "../models/DTOs";

export class BeneficiarioRepository extends BaseRepository<
  Beneficiario,
  CreateBeneficiarioDTO,
  UpdateBeneficiarioDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "beneficiario");
  }

  /**
   * Busca beneficiários com relacionamentos
   */
  async findAllWithRelations(
    page: number = 1,
    limit: number = 10,
    where?: any
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.beneficiario.findMany({
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
              atendimentos: true,
            },
          },
        },
      }),
      this.prisma.beneficiario.count({ where }),
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
   * Busca beneficiário por ID com relacionamentos limitados
   */
  async findByIdWithRelations(id: string) {
    return this.prisma.beneficiario.findUnique({
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
        atendimentos: {
          select: {
            id: true,
            status: true,
            criadoEm: true,
            rota: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
          orderBy: {
            criadoEm: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            atendimentos: true,
          },
        },
      },
    });
  }

  /**
   * Busca beneficiários por nome (busca parcial)
   */
  async findByNome(nome: string, limit: number = 10) {
    return this.prisma.beneficiario.findMany({
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
        endereco: true,
        telefone: true,
      },
    });
  }

  /**
   * Verifica se já existe um beneficiário com o mesmo nome e endereço
   */
  async existsByNomeAndEndereco(
    nome: string,
    endereco: string,
    excludeId?: string
  ) {
    const where: any = {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
      endereco: {
        equals: endereco,
        mode: "insensitive",
      },
    };

    if (excludeId) {
      where.id = {
        not: excludeId,
      };
    }

    const count = await this.prisma.beneficiario.count({ where });
    return count > 0;
  }

  /**
   * Busca beneficiários ativos para seleção
   */
  async findActiveForSelection() {
    return this.prisma.beneficiario.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
      },
      orderBy: { nome: "asc" },
    });
  }

  /**
   * Conta atendimentos por beneficiário
   */
  async countAtendimentosByBeneficiario(beneficiarioId: string) {
    return this.prisma.atendimento.count({
      where: { beneficiarioId },
    });
  }

  /**
   * Busca beneficiários com mais atendimentos
   */
  async findTopBeneficiarios(limit: number = 10) {
    return this.prisma.beneficiario.findMany({
      where: { ativo: true },
      include: {
        _count: {
          select: {
            atendimentos: true,
          },
        },
      },
      orderBy: {
        atendimentos: {
          _count: "desc",
        },
      },
      take: limit,
    });
  }
}
