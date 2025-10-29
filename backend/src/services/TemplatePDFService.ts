import { TemplatePDF } from "@prisma/client";
import { BaseService } from "./BaseService";
import { TemplatePDFRepository } from "../repositories/TemplatePDFRepository";
import { CreateTemplatePDFDTO, UpdateTemplatePDFDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { SanitizeService } from "../utils/sanitizeService";
import logger from "../utils/logger";

export class TemplatePDFService extends BaseService<
  TemplatePDF,
  CreateTemplatePDFDTO,
  UpdateTemplatePDFDTO
> {
  private templateRepository: TemplatePDFRepository;

  constructor(templateRepository: TemplatePDFRepository) {
    super(templateRepository);
    this.templateRepository = templateRepository;
  }

  async findActiveTemplates(): Promise<TemplatePDF[]> {
    try {
      return await this.templateRepository.findAllActive();
    } catch (error) {
      throw CommonErrors.INTERNAL_ERROR("Erro ao buscar templates ativos");
    }
  }

  async findByNome(nome: string, limit: number = 10): Promise<TemplatePDF[]> {
    try {
      if (!nome || nome.trim().length < 2) {
        throw CommonErrors.BAD_REQUEST("Nome deve ter pelo menos 2 caracteres");
      }

      return await this.templateRepository.findByNome(nome.trim(), limit);
    } catch (error: any) {
      if (error.code) throw error;
      throw CommonErrors.INTERNAL_ERROR("Erro ao buscar templates por nome");
    }
  }

  async toggleAtivo(id: string): Promise<TemplatePDF> {
    try {
      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      const exists = await this.templateRepository.exists({ id });
      if (!exists) {
        throw CommonErrors.NOT_FOUND("Template não encontrado");
      }

      return await this.templateRepository.toggleAtivo(id);
    } catch (error: any) {
      if (error.code) throw error;
      throw CommonErrors.INTERNAL_ERROR("Erro ao alterar status do template");
    }
  }

  async validateTemplateData(data: CreateTemplatePDFDTO | UpdateTemplatePDFDTO): Promise<void> {
    if ('nome' in data && data.nome) {
      if (data.nome.trim().length < 2) {
        throw CommonErrors.BAD_REQUEST("Nome deve ter pelo menos 2 caracteres");
      }
      if (data.nome.trim().length > 100) {
        throw CommonErrors.BAD_REQUEST("Nome deve ter no máximo 100 caracteres");
      }
    }

    if ('descricao' in data && data.descricao && data.descricao.trim().length > 500) {
      throw CommonErrors.BAD_REQUEST("Descrição deve ter no máximo 500 caracteres");
    }

    if ('conteudo' in data && data.conteudo) {
      if (data.conteudo.trim().length < 10) {
        throw CommonErrors.BAD_REQUEST("Conteúdo deve ter pelo menos 10 caracteres");
      }

      // Validar segurança do HTML
      if (!SanitizeService.isHTMLSafe(data.conteudo)) {
        throw CommonErrors.BAD_REQUEST("Conteúdo contém código potencialmente malicioso");
      }
    }
  }

  async create(data: CreateTemplatePDFDTO): Promise<TemplatePDF> {
    try {
      await this.validateTemplateData(data);

      const nomeExists = await this.templateRepository.exists({
        nome: { equals: data.nome.trim(), mode: "insensitive" }
      });

      if (nomeExists) {
        throw CommonErrors.CONFLICT("Já existe um template com este nome");
      }

      // Sanitizar conteúdo
      const sanitizedContent = SanitizeService.sanitizeTemplate(data.conteudo.trim());

      const templateData: CreateTemplatePDFDTO = {
        ...data,
        nome: data.nome.trim(),
        descricao: data.descricao?.trim(),
        conteudo: sanitizedContent
      };

      logger.info(`Template PDF criado: ${data.nome}`);
      return await this.templateRepository.create(templateData);
    } catch (error: any) {
      if (error.code) throw error;
      throw CommonErrors.INTERNAL_ERROR("Erro ao criar template");
    }
  }

  async update(id: string, data: UpdateTemplatePDFDTO): Promise<TemplatePDF> {
    try {
      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      await this.validateTemplateData(data);

      const exists = await this.templateRepository.exists({ id });
      if (!exists) {
        throw CommonErrors.NOT_FOUND("Template não encontrado");
      }

      if (data.nome) {
        const nomeExists = await this.templateRepository.exists({
          nome: { equals: data.nome.trim(), mode: "insensitive" },
          id: { not: id }
        });

        if (nomeExists) {
          throw CommonErrors.CONFLICT("Já existe outro template com este nome");
        }
      }

      const updateData: any = {
        ...data,
        nome: data.nome?.trim(),
        descricao: data.descricao?.trim(),
        conteudo: data.conteudo ? SanitizeService.sanitizeTemplate(data.conteudo.trim()) : undefined
      };

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      logger.info(`Template PDF atualizado: ${id}`);
      return await this.templateRepository.update(id, updateData);
    } catch (error: any) {
      if (error.code) throw error;
      throw CommonErrors.INTERNAL_ERROR("Erro ao atualizar template");
    }
  }
}