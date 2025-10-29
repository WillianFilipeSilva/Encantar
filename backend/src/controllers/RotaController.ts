import { Request, Response, NextFunction } from "express";
import { Rota } from "@prisma/client";
import { BaseController } from "./BaseController";
import { RotaService } from "../services/RotaService";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { query, validationResult } from "express-validator";
import { createDateFromString, serializeDateForAPI, serializeDateTimeForAPI } from "../utils/dateUtils";
import { PDFService } from "../utils/pdfService";
import { TemplatePDFService } from "../services/TemplatePDFService";
import { TemplatePDFRepository } from "../repositories/TemplatePDFRepository";

export class RotaController extends BaseController<
  Rota,
  CreateRotaDTO,
  UpdateRotaDTO
> {
  private rotaService: RotaService;
  private templateService: TemplatePDFService;

  constructor(rotaService: RotaService) {
    super(rotaService);
    this.rotaService = rotaService;
    this.templateService = new TemplatePDFService(new TemplatePDFRepository());
  }

  /**
   * GET / - Lista todas as rotas com paginação
   */
  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Página deve ser um número positivo")
        .run(req);
      await query("limit")
        .optional()
        .isInt({ min: 1, max: 500 })
        .withMessage("Limit deve ser entre 1 e 500")
        .run(req);
      await query("search")
        .optional()
        .custom((value) => {
          if (value && value.trim().length > 0 && value.trim().length < 1) {
            throw new Error("Busca deve ter pelo menos 1 caracter");
          }
          return true;
        })
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw CommonErrors.VALIDATION_ERROR(`Parâmetros inválidos: ${errors.array()[0].msg}`);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.rotaService.findAllWithRelations(
        page,
        limit,
        filters
      );

      const serializedData = result.data.map(rota => ({
        ...rota,
        dataAtendimento: serializeDateForAPI(rota.dataAtendimento),
        criadoEm: serializeDateTimeForAPI(rota.criadoEm),
        atualizadoEm: serializeDateTimeForAPI(rota.atualizadoEm)
      }));

      res.json({
        success: true,
        data: serializedData,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /:id - Busca uma rota por ID com relacionamentos
   */
  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID é obrigatório");
      }

      const result = await this.rotaService.findByIdWithRelations(id);

      // Serializar data para evitar problemas de timezone no frontend
      const serializedResult = {
        ...result,
        dataAtendimento: serializeDateForAPI(result?.dataAtendimento),
        criadoEm: serializeDateTimeForAPI(result?.criadoEm),
        atualizadoEm: serializeDateTimeForAPI(result?.atualizadoEm)
      };

      res.json({
        success: true,
        data: serializedResult,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Constrói filtros a partir dos query parameters
   */
  protected buildFilters(query: any): any {
    const filters: any = {};

    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
        { descricao: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.dataInicio && query.dataFim) {
      const dataInicio = createDateFromString(query.dataInicio);
      const dataFim = createDateFromString(query.dataFim);
      
      filters.dataAtendimento = {
        gte: dataInicio,
        lte: dataFim
      };
    } else if (query.dataInicio) {
      const dataInicio = createDateFromString(query.dataInicio);
      filters.dataAtendimento = {
        gte: dataInicio
      };
    } else if (query.dataFim) {
      const dataFim = createDateFromString(query.dataFim);
      filters.dataAtendimento = {
        lte: dataFim
      };
    }

    return filters;
  }

  /**
   * GET /:id/pdf/:templateId - Gera PDF da rota usando um template específico
   */
  generatePDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, templateId } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID da rota é obrigatório");
      }

      if (!templateId) {
        throw CommonErrors.BAD_REQUEST("ID do template é obrigatório");
      }

      // Busca a rota com todas as informações necessárias
      const rota = await this.rotaService.findByIdWithRelations(id);
      if (!rota) {
        throw CommonErrors.NOT_FOUND("Rota não encontrada");
      }

      // Busca o template
      const template = await this.templateService.findById(templateId);
      if (!template) {
        throw CommonErrors.NOT_FOUND("Template não encontrado");
      }

      if (!template.ativo) {
        throw CommonErrors.BAD_REQUEST("Template está inativo");
      }

      // Gera o PDF
      const pdfBuffer = await PDFService.generateRotaPDF({
        rota,
        template
      });

      // Define o nome do arquivo
      const fileName = `rota-${rota.nome.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Configura headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Envia o PDF
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /:id/pdf/preview/:templateId - Preview do PDF no navegador
   */
  previewPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, templateId } = req.params;

      if (!id) {
        throw CommonErrors.BAD_REQUEST("ID da rota é obrigatório");
      }

      if (!templateId) {
        throw CommonErrors.BAD_REQUEST("ID do template é obrigatório");
      }

      // Busca a rota com todas as informações necessárias
      const rota = await this.rotaService.findByIdWithRelations(id);
      if (!rota) {
        throw CommonErrors.NOT_FOUND("Rota não encontrada");
      }

      // Busca o template
      const template = await this.templateService.findById(templateId);
      if (!template) {
        throw CommonErrors.NOT_FOUND("Template não encontrado");
      }

      // Gera o PDF
      const pdfBuffer = await PDFService.generateRotaPDF({
        rota,
        template
      });

      // Configura headers para visualização no navegador
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Length', pdfBuffer.length);

      // Envia o PDF
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };
}
