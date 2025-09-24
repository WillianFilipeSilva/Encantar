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

  /**
   * Busca todas as rotas com relacionamentos (entregas)
   */
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

  /**
   * Busca uma rota por ID com relacionamentos
   */
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

  /**
   * Conta o total de rotas com filtros
   */
  async count(options: { where?: any } = {}): Promise<number> {
    return this.prisma.rota.count(options);
  }
}
