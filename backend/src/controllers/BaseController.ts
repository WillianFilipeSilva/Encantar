import { Request, Response, NextFunction } from "express";
import { BaseService } from "../services/BaseService";
import { createDateFromString, toStartOfDayBrazil, toEndOfDayBrazil } from "../utils/dateUtils";

/**
 * Classe base para todos os controllers
 * Fornece métodos comuns para tratamento de requisições HTTP
 */
export abstract class BaseController<T, CreateData, UpdateData> {
  protected service: BaseService<T, CreateData, UpdateData>;

  constructor(service: BaseService<T, CreateData, UpdateData>) {
    this.service = service;
  }

  /**
   * GET / - Lista todos os registros com paginação
   */
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.buildFilters(req.query);

      const result = await this.service.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /:id - Busca um registro por ID
   */
  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID é obrigatório",
          code: "MISSING_ID",
        });
        return;
      }

      const result = await this.service.findById(id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST / - Cria um novo registro
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const userId = (req as any).user?.id;

      const result = await this.service.create(data, userId);

      res.status(201).json({
        success: true,
        data: result,
        message: "Registro criado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /:id - Atualiza um registro
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = (req as any).user?.id;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID é obrigatório",
          code: "MISSING_ID",
        });
        return;
      }

      const result = await this.service.update(id, data, userId);

      res.json({
        success: true,
        data: result,
        message: "Registro atualizado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /:id - Remove um registro
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID é obrigatório",
          code: "MISSING_ID",
        });
        return;
      }

      await this.service.delete(id);

      res.json({
        success: true,
        message: "Registro removido com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /:id/hard - Remove um registro permanentemente
   */
  async hardDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID é obrigatório",
          code: "MISSING_ID",
        });
        return;
      }

      await this.service.hardDelete(id);

      res.json({
        success: true,
        message: "Registro removido permanentemente",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /count - Conta registros
   */
  async count(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = this.buildFilters(req.query);
      const total = await this.service.count(filters);

      res.json({
        success: true,
        data: { total },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Constrói filtros a partir dos query parameters
   */
  protected buildFilters(query: any): any {
    const filters: any = {};

    // Parâmetros de ordenação
    if (query.sortBy) {
      filters.sortBy = query.sortBy;
    }
    if (query.sortOrder) {
      filters.sortOrder = query.sortOrder;
    }

    if (query.ativo !== undefined && query.ativo !== 'all' && query.ativo !== '') {
      filters.ativo = query.ativo === "true";
    }

    if (query.search) {
      filters.OR = [
        { nome: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.dataInicio) {
      const startDate = createDateFromString(query.dataInicio);
      filters.criadoEm = {
        ...filters.criadoEm,
        gte: toStartOfDayBrazil(startDate),
      };
    }

    if (query.dataFim) {
      const endDate = createDateFromString(query.dataFim);
      filters.criadoEm = {
        ...filters.criadoEm,
        lte: toEndOfDayBrazil(endDate),
      };
    }

    return filters;
  }

  /**
   * Valida se o usuário tem permissão para a operação
   */
  protected async validatePermission(
    req: Request,
    operation: string
  ): Promise<boolean> {
    return true;
  }

  /**
   * Formata resposta de sucesso
   */
  protected successResponse(
    res: Response,
    data: any,
    message?: string,
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    });
  }

  /**
   * Formata resposta de erro
   */
  protected errorResponse(
    res: Response,
    error: string,
    code?: string,
    statusCode: number = 400
  ) {
    return res.status(statusCode).json({
      success: false,
      error,
      code,
    });
  }
}
