import { TemplatePDF } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateTemplatePDFDTO, UpdateTemplatePDFDTO } from "../models/DTOs";
import { prisma } from "../utils/database";

export class TemplatePDFRepository extends BaseRepository<
  TemplatePDF,
  CreateTemplatePDFDTO,
  UpdateTemplatePDFDTO
> {
  constructor() {
    super(prisma, "templatePDF");
  }

  async findAllActive(): Promise<TemplatePDF[]> {
    return await this.findMany(
      { ativo: true },
      { nome: 'asc' }
    );
  }

  async findByNome(nome: string, limit: number = 10): Promise<TemplatePDF[]> {
    return await (this.prisma as any).templatePDF.findMany({
      where: {
        nome: {
          contains: nome,
          mode: "insensitive",
        },
      },
      take: limit,
      orderBy: { nome: 'asc' }
    });
  }

  async toggleAtivo(id: string): Promise<TemplatePDF> {
    const template = await this.findById(id);
    if (!template) {
      throw new Error("Template não encontrado");
    }

    return await this.update(id, { ativo: !template.ativo } as UpdateTemplatePDFDTO);
  }
}